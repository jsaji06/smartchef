from typing import Union, Literal, Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import HumanMessage
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, field_validator
from langchain_openai import ChatOpenAI
from uuid import uuid4
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, MessagesState, START
import os
import getpass

class Ingredient(BaseModel):
    ingredient_name: str
    quantity:int
    unit:list[Literal['whole', 'kg', 'g', 'mg', 'lb', 'oz', 'L', 'mL', 'cup', 'tbsp', 'tsp', 'qt', 'pt', 'fl oz', 'small', 'medium', 'large', 'extra large', 'jumbo', 'clove', 'piece', 'slice', 'leaf', 'sprig', 'stalk', 'head', 'strip', 'inch', 'scoop', 'pinch', 'dash', 'drop', 'handful', 'bunch', 'knob', 'chunk', 'clump', 'sheet', 'square', 'round', 'ball', 'can', 'jar', 'bottle', 'pack', 'packet', 'box', 'bag', 'bar', 'stick', 'log', 'rib', 'ear', 'fillet', 'rack', 'block']]
    edited:bool

class Recipe(BaseModel):
    title: str
    description: str
    users_ingredients: Optional[list[str]]
    assumed_ingredients: Optional[list[str]]
    assumed_quantities: Optional[list[float]]
    assumed_quantities_unit: Optional[list[Literal['whole', 'kg', 'g', 'mg', 'lb', 'oz', 'L', 'mL', 'cup', 'tbsp', 'tsp', 'qt', 'pt', 'fl oz', 'small', 'medium', 'large', 'extra large', 'jumbo', 'clove', 'piece', 'slice', 'leaf', 'sprig', 'stalk', 'head', 'strip', 'inch', 'scoop', 'pinch', 'dash', 'drop', 'handful', 'bunch', 'knob', 'chunk', 'clump', 'sheet', 'square', 'round', 'ball', 'can', 'jar', 'bottle', 'pack', 'packet', 'box', 'bag', 'bar', 'stick', 'log', 'rib', 'ear', 'fillet', 'rack', 'block']]]
    steps: list[str]
    calories: int
    protein: int
    carbs: int
    fat: int
    eta: str
    
    @field_validator('assumed_quantities', mode='before')
    def fix_plurality(cls, units: list):
        ambiguities = {
            "":0,
        }
        return [ambiguities.get(unit, unit) for unit in units]
    
    @field_validator('assumed_quantities_unit', mode='before')
    def fix_plurality(cls, units: list):
        ambiguities = {
            "cups":"cup",
            "cloves":"clove",
            "pieces":"piece",
            "slices":"slice", 
            "leaves":"leaf",
            "sprigs":"sprig",
            "stalks":'stalk',
            "inches":"inch",
            "heads":'head',
            'strips':'strip',
            'kilograms':'kg',
            'kgs':'kg',
            'grams':'g',
            'gs':'g',
            'pounds':'lb',
            'lbs':'lb',
            'pound':'lb',
            'tablespoon':'tbsp',
            'tablespoons':'tbsp',
            'tbsps':'tbsp',
            'teaspoons':'tsp',
            'tsps':'tsp',
            'teaspoon':'tsp',
            'milliliters':'mL',
            'ml':'mL',
            'millileter':'mL',
            'liters':'L',
            'liter':'L',
            'litre':'L',
            'litres':'L',
            'l':'L'
        }
        return [ambiguities.get(unit, unit) for unit in units]


class RecipeRequest(BaseModel):
    ingredients: str
    numRecipes: int
    experienceLevel: Literal["beginner", "intermediate", "advanced", None]


class Recipes(BaseModel):
    recipes: list[Recipe]
    err_message: Optional[list[Literal['At least one provided ingredient was invalid.', 'An internal error occured, please try again in a few moments.']]] = None
    


class ModifyRecipe(BaseModel):
    recipe: Recipe
    excluded_ingredients: list[str]
    edited_items:list[str]
    changed_items:list[str]


class RecipesState(MessagesState):
    recipes: list[Recipe]

ai = ChatOpenAI(api_key=os.environ['OPENAI_API_KEY'])
VALIDATE_INGREDIENTS_PROMPT = PromptTemplate.from_template("""
You are an expert-level chef. You are tasked to identify the users' ingredients and identify any invalid ingredients.

The rules which constitute whether an ingredient is valid or not are as follows?:
- Only use ingredients that are actual food items, spices, herbs, or cooking ingredients. Do NOT include:
  - Colors (e.g., "blue", "red", "green")
  - Non-food objects (e.g., "map", "book", "chair")
  - Abstract concepts (e.g., "happiness", "love")
  - Non-edible items (e.g., "soap", "paper", "plastic")
  - Inappropriate/18+/NSFW terms/words (e.g. "penis")
  - If provided, the units of the ingredient are illogical or nonsensical. Reasonable, non-standard, general/colloquial measurements such as (but not limited to) 'whoole', 'small', 'medium', 'large', "inch", "clove", etc. are allowed.
  - **CRITICAL**: When validating 'whole' ingredients, do not consider 'whole' as an ingredient. It generally refers to an uncut, unmodified ingredient (think of a whole onion or whole lemon in this sense). In other words, PLEASE conside 'whole' as a unit rather than an ingredient, and do not invalidate the ingredient because of the misconception that "whole" is not an ingredient. For example, do not invalidate terms like '3 whole chicken' or '2 whole tomato", unless the unit/quantity is considered very unreasonable for the recipe.

Special notes:
    -  Should the user choose to edit an assumed ingredient, the choices for the units are restricted to the following: 'whole', 'kg', 'g', 'mg', 'lb', 'oz', 'L', 'mL', 'cup', 'tbsp', 'tsp', 'qt', 'pt', 'fl oz', 'small', 'medium', 'large', 'extra large', 'jumbo', 'clove', 'piece', 'slice', 'leaf', 'sprig', 'stalk', 'head', 'strip', 'inch', 'scoop', 'pinch', 'dash', 'drop', 'handful', 'bunch', 'knob', 'chunk', 'clump', 'sheet', 'square', 'round', 'ball', 'can', 'jar', 'bottle', 'pack', 'packet', 'box', 'bag', 'bar', 'stick', 'log', 'rib', 'ear', 'fillet', 'rack', 'block'. Please take this to consideration when validating edited assumed ingredients.

Please do not flag an ingredient as invalid if it contains units/quantities along with it. For example, '3 tbsp chicken' or "1 inch ginger" should not be flagged. However, '3 tbsp' or simply 'liters' may be flagged since there is no ingredient to be found.

The user ingredients' are listed here: {user_ingredients}

Return the following words for the corresponding status:
VALID: all ingredients provided follow the rules above.
INVALID: at least one ingredient is invalid, with an explanation. 

Should the ingredient provided be invalid, return the explanation in this specific format:
'INVALID - [reason for why it's invalid]'                                                  
""")
CREATE_RECIPES_PROMPT = PromptTemplate.from_template("""
# Chef Recipe Generation Prompt

You are a world-renowned, multi-Michelin star chef with decades of experience. A home cook has given you their request.

## CRITICAL: Input Classification Rules

**BEFORE generating recipes, you MUST classify the user input into ONE category:**

### Category 1: Ingredient-Based Input
- User provides a **specific list of actual ingredients** they have available
- Examples: "chicken, garlic, rice", "tomatoes, basil, mozzarella", "salmon, asparagus, lemon"
- **Action**: Use ONLY these ingredients in `users_ingredients`
- All other required items go in `assumed_ingredients`

### Category 2: Idea-Based Input  
- User provides a **general concept, theme, or request** without specific ingredients
- Examples: "high-protein desserts", "summer vegan meals", "quick breakfast ideas", "Italian dinner"
- **Action**: `users_ingredients` MUST be empty array `[]`
- ALL ingredients go in `assumed_ingredients`

## Your Task:
- Create {num_recipes} gourmet recipes based on the classified input type, given the following user input: {ingredients}
- Tailor steps for a {experience_level} home cook
- Follow the strict JSON schema below

## JSON Schema (DO NOT CHANGE):
```json
{{
  "recipes": [
    {{
      "title": "string",
      "description": "string", 
      "users_ingredients": ["string"],
      "assumed_ingredients": ["string"],
      "assumed_quantities": [float],
      "assumed_quantities_unit": ["string"],
      "steps": ["string"],
      "calories": integer,
      "protein": integer,
      "carbs": integer,
      "fat": integer,
      "eta": "string"
    }}
  ]
}}
```

## Strict Rules:
- **NEVER mix categories**: Either use provided ingredients OR leave `users_ingredients` empty
- Use ONLY these units: ['whole', 'kg', 'g', 'mg', 'lb', 'oz', 'L', 'mL', 'cup', 'tbsp', 'tsp', 'qt', 'pt', 'fl oz', 'small', 'medium', 'large', 'extra large', 'jumbo', 'clove', 'piece', 'slice', 'leaf', 'sprig', 'stalk', 'head', 'strip', 'inch', 'scoop', 'pinch', 'dash', 'drop', 'handful', 'bunch', 'knob', 'chunk', 'clump', 'sheet', 'square', 'round', 'ball', 'can', 'jar', 'bottle', 'pack', 'packet', 'box', 'bag', 'bar', 'stick', 'log', 'rib', 'ear', 'fillet', 'rack', 'block']
- All units MUST be **singular** (e.g., "3.0 clove", not "cloves")
- `assumed_quantities` and `assumed_quantities_unit` MUST match in length
- Fill all fields: no empty arrays, strings, or placeholders
- Nutritional fields must be integers
- Each step must be specific with measurements, cooking methods, and plating instructions
- Assume minimal cooking knowledge - be extremely detailed

## Example - Category 1 (Ingredient-Based):
**Input**: "salmon, garlic, herbs"
```json
{{
  "recipes": [
    {{
      "title": "Tuscan Herb-Crusted Salmon with Garlic Butter",
      "description": "Pan-seared salmon with aromatic herb crust and garlic butter",
      "users_ingredients": ["salmon", "garlic", "herbs"],
      "assumed_ingredients": ["olive oil", "butter", "lemon juice", "salt", "black pepper", "breadcrumbs", "salmon fillet", "garlic clove", "fresh mixed herbs"],
      "assumed_quantities": [2.0, 3.0, 1.0, 1.0, 0.5, 0.25, 200.0, 1.0, 2.0],
      "assumed_quantities_unit": ["tbsp", "tbsp", "tbsp", "tsp", "tsp", "cup", "g", "clove", "tbsp"],
      "steps": [
        "Pat the 200g salmon fillet dry with paper towels. Season both sides with 1 tsp salt and 0.5 tsp black pepper.",
        "In a bowl, mix 0.25 cup breadcrumbs with 2 tbsp chopped fresh herbs until well combined.",
        "Heat 2 tbsp olive oil in a nonstick skillet over medium-high heat. Sear the salmon skin-side down for 2–3 minutes until golden.",
        "Transfer the salmon to a baking sheet. Press the herb breadcrumb mixture onto the top. Bake at 400°F for 6–8 minutes until the salmon flakes easily with a fork.",
        "While baking, melt 3 tbsp butter in a small pan over low heat. Mince 1 clove garlic and sauté in butter for 1 minute until fragrant. Add 1 tbsp lemon juice.",
        "Plate the salmon on a warm plate. Spoon garlic butter over the top and serve immediately."
      ],
      "calories": 485,
      "protein": 42,
      "carbs": 8,
      "fat": 32,
      "eta": "25 minutes"
    }}
  ]
}}
```

## Example - Category 2 (Idea-Based):
**Input**: "quick Italian pasta dish"
```json
{{
  "recipes": [
    {{
      "title": "Aglio e Olio with Cherry Tomatoes",
      "description": "Classic Italian pasta with garlic, olive oil, and burst cherry tomatoes",
      "users_ingredients": [],
      "assumed_ingredients": ["spaghetti", "olive oil", "garlic clove", "cherry tomatoes", "red pepper flakes", "fresh parsley", "parmesan cheese", "salt", "black pepper"],
      "assumed_quantities": [100.0, 3.0, 3.0, 150.0, 0.25, 2.0, 30.0, 1.0, 0.5],
      "assumed_quantities_unit": ["g", "tbsp", "clove", "g", "tsp", "tbsp", "g", "tsp", "tsp"],
      "steps": [
        "Bring a large pot of salted water to boil. Add 100g spaghetti and cook according to package directions until al dente.",
        "While pasta cooks, heat 3 tbsp olive oil in a large skillet over medium heat. Thinly slice 3 garlic cloves and sauté for 1-2 minutes until fragrant but not brown.",
        "Add 150g halved cherry tomatoes to the skillet. Cook for 3-4 minutes until they start to burst. Season with 0.25 tsp red pepper flakes, 1 tsp salt, and 0.5 tsp black pepper.",
        "Reserve 0.5 cup pasta water before draining. Add drained pasta to the skillet with tomatoes.",
        "Toss pasta with the sauce, adding pasta water as needed to create a silky coating. Remove from heat.",
        "Plate the pasta in warmed bowls. Top with 2 tbsp chopped fresh parsley and 30g grated parmesan cheese. Serve immediately."
      ],
      "calories": 420,
      "protein": 15,
      "carbs": 65,
      "fat": 12,
      "eta": "15 minutes"
    }}
  ]
}}
```

**Output ONLY the final JSON. Do not include any extra explanation or classification notes.**
""")

EDIT_RECIPES_PROMPT = PromptTemplate.from_template("""
You are a multi-Michelin star, award-winning, internationally renowned chef.

The user has a recipe titled **"{recipe_title}"** that they want to keep, but with modifications.

The user does **NOT** have the following ingredients: {removed_ingredients}

The user also has made adjustments to the assumed ingredients list that you have generated. The format outlined below is as follows: (old_ingredient -> new_ingredient)

With that being said, here is the list of old to new ingredients:

{edited_ingredients}


Please modify the original recipe to accommodate these changes, ensuring the output:
- Excludes any removed ingredients
- Incorporates the updated (edited) ingredients where appropriate
- Maintains the same structure, formatting, and level of detail as the original recipe format
- Adjusts steps, quantities, and ingredient relationships accordingly

Special note: Please always include the ingredients that the user has into your schema under the 'user ingredients'. Do not fully or partially omit this section. Only omit this from the assumed ingredients section, UNLESS you want to assume the specific maximum quantity the user has of said ingredient.

Another note: If the original prompt was a general idea rather than specific ingredients, if the user edited an ingredient, ONLY INCLUDE THAT INGREDIENT in the users_ingredients category; KEEP EVERY OTHER ASSUMED INGREDIENT UNDER THE ASSUMED INGREDIENTS CATEGORIES.

Return the full updated recipe in the same format as before (title, description, calories, ETA, ingredients, steps, etc.).
""")

def retrieve_recipes(state: MessagesState):
    request = state['messages']
    
    recipes_output = ai.with_structured_output(Recipes).invoke(request)

    return {"recipes": recipes_output.recipes, "message": recipes_output.err_message}


workflow = StateGraph(state_schema=RecipesState)
workflow.add_edge(START, "request")
workflow.add_node("request", retrieve_recipes)

memory = MemorySaver()
config = {"configurable": {"thread_id": "recipe_memory"}}
workflow = workflow.compile(checkpointer=memory)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],
    allow_headers=['*'],
    allow_methods=['*']
)


def reconfigure_recipes(recipes: list[Recipes]):
    size_of_new_arr = (len(recipes) // 3 ) + 1 if len(recipes) % 3 != 0 else len(recipes) // 3
    arr = []
    for i in range(size_of_new_arr):
        sub_arr = [] 
        for j in range(3):
            index = (i * 3) + j
            if index < len(recipes):
                sub_arr.append(recipes[index])
        arr.append(sub_arr)
    return arr


@app.post("/get-recipes")
def return_recipes(request: RecipeRequest):
    validation_prompt = VALIDATE_INGREDIENTS_PROMPT.invoke({"user_ingredients":request.ingredients})
    
    output = ai.invoke(validation_prompt).content

    if "INVALID" in output.strip():
        return {
            "recipes":None,
            "message":"At least one ingredient that you have inputted is not valid, or you inputted less than three ingredients. Please input foods, valid cuisines, etc."
        }
    prompt = CREATE_RECIPES_PROMPT.invoke({"ingredients": request.ingredients, "num_recipes": request.numRecipes,
                                           "experience_level": request.experienceLevel}).text
    recipes = workflow.invoke({"messages": [HumanMessage(prompt)]}, config=config)
    return reconfigure_recipes(recipes['recipes']) 


@app.post("/edit-recipe")
def edit_recipe(recipe: ModifyRecipe):
    edit_ingredient_block = ""
    for i, j in zip(recipe.edited_items, recipe.changed_items):
        new_line = j + '-> ' + i + "\n"
        edit_ingredient_block += new_line
    print(recipe.edited_items)
    if len(recipe.edited_items) > 0:
        validation_prompt = VALIDATE_INGREDIENTS_PROMPT.invoke({"user_ingredients":",".join([f'"{item}"' for item in recipe.edited_items])})
        print(validation_prompt)
        output = ai.invoke(validation_prompt).content
        if "INVALID" in output.strip():
            print(output.strip())
            reason = output.split(' - ')[1]
            return {
                "recipes":None,
                "message":reason
            }
    prompt = EDIT_RECIPES_PROMPT.invoke(
        {"recipe_title": recipe.recipe.title, "removed_ingredients": recipe.excluded_ingredients, "edited_ingredients": edit_ingredient_block}).text
    recipes = workflow.invoke({"messages": [HumanMessage(prompt)]}, config=config)
    return recipes
