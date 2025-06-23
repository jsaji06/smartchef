import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import Alert from "./Alert";
import EditAssumedIngredient from './EditAssumedIngredient';


export default function SelectedRecipe(props) {
    let stringifyAssumedIngredients = (recipe) => {
        let ingredients_list = []
        recipe.assumed_ingredients.map((ingredient, i) => {
            let stringIngredient = `${recipe.assumed_quantities[i]} ${recipe.assumed_quantities_unit[i]} ${ingredient}`
            ingredients_list.push(stringIngredient)
        })
        return ingredients_list
    }

    let recipeProp = props.recipe

    let [recipe, setRecipe] = useState(recipeProp);
    let [removedItems, setRemovedItems] = useState(new Array(recipe.assumed_ingredients.length).fill(false));
    let [itemsRender, setItemsRender] = useState(stringifyAssumedIngredients(recipe));
    let [removedItemsRender, setRemovedItemsRender] = useState(new Array(recipe.assumed_ingredients.length).fill(false));
    let [editItemsRender, setEditedItemsRender] = useState(new Array(recipe.assumed_ingredients.length).fill(false));
    let [editItems, setEditedItems] = useState(new Array(recipe.assumed_ingredients.length).fill(false));
    let [loading, setLoading] = useState(false);
    let [itemToEdit, setItemToEdit] = useState(null);
    let [editIngredientIndex, setEditIngredientIndex] = useState(-1);
    
    let modifyRecipe = () => {
        setLoading(true);
        const cleanRemovedItems = removedItemsRender
        .map((marked, i) => marked ? recipe.assumed_ingredients[i] : false)
        .filter(item => item !== false);
        
        let originalIngredients = stringifyAssumedIngredients(recipe)
        fetch('http://localhost:8000/edit-recipe', {
            method: "POST", headers: {
                'Content-Type': "application/json"
            }, body: JSON.stringify({ 'recipe': recipe, 'excluded_ingredients': cleanRemovedItems, "rendered_items": itemsRender, "original_ingredients":originalIngredients })
        })
            .then(response => {
                return response.json()
            })
            .then(data => {
                setLoading(false);
                setRecipe(data.recipes[0]);
                let newRecipes = [...props.recipeList];
                newRecipes[Math.floor(props.index / 3)][props.index > 3 ? Math.min(0, props.index - 3) : props.index] = data.recipes[0]
                props.modifyRecipes(newRecipes);
                setRemovedItems(new Array(recipe.assumed_ingredients.length).fill(false))
                setRemovedItemsRender(new Array(recipe.assumed_ingredients.length).fill(false))
                setEditedItemsRender(new Array(recipe.assumed_ingredients.length).fill(false))
                setEditedItems(new Array(recipe.assumed_ingredients.length).fill(false))
                setItemToEdit(false);
            })
    }
    return itemToEdit ? <EditAssumedIngredient editIngredients={setEditedItems} ingredient={itemToEdit} updateItems={setItemsRender} itemsRender={itemsRender} recipe={recipe} ingredientIndex={editIngredientIndex} setItemToEdit={setItemToEdit} style={{ 'display': JSON.stringify(itemToEdit) === JSON.stringify({ ingredientName: null, unit: null, assumedQuantity: null }) ? 'none' : 'block' }} /> : (
        <div className="container">

            <div className="loadingPage" style={{ 'display': loading ? 'block' : 'none' }}>
                <h1>Chefing up a new recipe for you. Please wait.</h1>
            </div>
            <div className="selectedRecipeContainer" style={{ 'display': loading ? 'none' : 'block' }}>
                <button id="backBtn" onClick={() => props.setState(null)}>←</button>
                <h1>{recipe.title}</h1>
                <p>{recipe.description}</p>
                <p>Cooking ETA: <span className="bold">{recipe.eta}</span></p>
                <p>CALORIES: {recipe.calories} cal | CARBS: {recipe.carbs}g | FAT: {recipe.fat}g | PROTEIN: {recipe.protein}g</p>
                <div className="ingredientsAndSteps">
                    <div className="steps">
                        <h3>Steps to Cook</h3>
                        {recipe.steps.map(step => {
                            return <p>{step}</p>
                        })}
                    </div>
                    <div className="assumedIngredients">
                        <div className="ingredients">
                            <h3>Your Ingredients</h3>
                            {recipe.users_ingredients.map(step => {
                                return <p>{step}</p>
                            })}
                        </div>
                        <div className="assumed">
                            <h3>Assumed Ingredients</h3>
                            {itemsRender.map((step, i) => {
                                return <span class="assumedIngredient"><p style={{ 'textDecoration': removedItemsRender[i] ? 'line-through' : 'none' }}>{editItemsRender[i] === true ? "(edited) " : ""}{step}</p> <FontAwesomeIcon className="icon" icon={faEdit} onClick={() => {
                                    setItemToEdit({ ingredientName: recipe.assumed_ingredients[i], assumedQuantity: recipe.assumed_quantities[i], unit: recipe.assumed_quantities_unit[i] })
                                    setEditIngredientIndex(i)
                                    let copied = [...editItemsRender]
                                    copied[i] = !copied[i]
                                    setEditedItemsRender(copied)
                                    editItems[i] = step
                                    editItems = editItems.map((item, i) => item ? item : false).filter(item => item != false)
                                    setEditedItems(editItems)
                                }} /> <FontAwesomeIcon className="icon" icon={faTrash} onClick={() => {
                                    let copied = [...removedItemsRender];
                                    copied[i] = !copied[i]
                                    setRemovedItemsRender(copied);
                                    copied = copied.map((item, i) => item ? recipeProp.assumed_ingredients[i] : false).filter((item) => item != false);
                                    setRemovedItems(copied);

                                }} /> </span>
                            })}
                            <button onClick={() => {
                                let e = [...editItems];
                                let r = [...removedItems]

                                e = e.filter((item, i) => item);
                                r = recipeProp.assumed_ingredients.filter((item, i) => removedItems[i])
                                setEditedItems(e)
                                setRemovedItems(r);
                                modifyRecipe()

                            }} style={{ "display": removedItems.filter(recipe => recipe).length > 0 || editItems.filter(recipe => recipe) ? 'block' : 'none' }}>Remove Item(s)</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
