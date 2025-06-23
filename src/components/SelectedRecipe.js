import React from 'react'
import RecipeHeader from './RecipeHeader';
import AssumedIngredient from './AssumedIngredient';
import { useState } from 'react';
import EditAssumedIngredient from './EditAssumedIngredient';

export default function SelectedRecipe(props) {
  let [recipe, setRecipe] = useState(props.recipe);
  let [loading, setLoading] = useState(false);
  let [ingredientEditIndex, setIngredientEditIndex] = useState(-1)
  let assumedIngredientsName = recipe.assumed_ingredients
  let assumedIngredientsQuantity = recipe.assumed_quantities
  let assumedIngredientsQuantityUnit = recipe.assumed_quantities_unit

  let assumedIngredientsMap = assumedIngredientsName.map((ingredient_name, i) => { return { "ingredient": ingredient_name, "quantity": recipe.assumed_quantities[i], "unit": recipe.assumed_quantities_unit[i], "edited": false, "removed": false } })
  let [assumedIngredientsState, setAssumedIngredients] = useState(assumedIngredientsMap)
  let [message, setMessage] = useState(null)


  return (
    <div className="container">
      {(ingredientEditIndex !== -1 || message !== null || loading == true) && <div className='darkOverlay'></div>}

      {ingredientEditIndex !== -1 && <EditAssumedIngredient setIndex={setIngredientEditIndex} ingredients={assumedIngredientsState} index={ingredientEditIndex} changeIngredient={setAssumedIngredients} />}

      {message !== null &&

        <div className='modal'>
          <h1>Error</h1>
          <p>{message}</p>
          <button onClick={() => setMessage(null)}>Exit</button>
        </div>
      }
      {loading &&
        <div className="modal" style={{ 'display': loading ? 'flex' : 'none' }}>
          <h1>Hang tight!</h1>
          <p>A new, delicious recipe is coming in just a few moments.</p>
        </div>
      }
      <div className="selectedRecipeContainer" style={{ 'display': loading ? 'none' : 'block' }}>

        <button id="backBtn" onClick={() => props.setState(null)}>←</button>
        <RecipeHeader recipe={recipe} />
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
              {recipe.users_ingredients.length > 0 ? recipe.users_ingredients.map(step => {
                return <p>{step}</p>
              }) : (<p>Nothing to see here!</p>)}
            </div>
            <div className="assumed">
              <h3>Assumed Ingredients</h3>

              {assumedIngredientsState.length > 0 ? assumedIngredientsState.map((step, i) => {

                return (
                  <AssumedIngredient setMessage={setMessage} key={i} recipeIndex={props.index} recipeList={props.recipeList} ingredientList={assumedIngredientsState} ingredientInfo={step} changeAssumedIngredients={setAssumedIngredients} ingredientIndex={i} setIngredientIndex={setIngredientEditIndex} changeIngredient={setAssumedIngredients} />
                )
              }) : (<p>Nothing to see here!</p>)}
              <button style={{ 'display': assumedIngredientsState.filter(ingredient => ingredient.edited || ingredient.removed).length > 0 ? 'block' : 'none' }} onClick={(e) => {
                e.preventDefault();
                
                setLoading(true)
                let editedItems = [];
                let changedItems = [];
                let deletedItems = [];

                for (let i = 0; i < assumedIngredientsState.length; i++) {
                  // if(assumedIngredients[i].quantity === undefined && assumedIngredients[i].unit !== undefined) setMessage("")
                  if (assumedIngredientsState[i].edited) {
                    let str = assumedIngredientsState[i].quantity + ' ' + assumedIngredientsState[i].unit + ' ' + assumedIngredientsState[i].ingredient
                    editedItems.push(str)
                    let origIng = assumedIngredientsQuantity[i] + ' ' + assumedIngredientsQuantityUnit[i] + ' ' + assumedIngredientsName[i]
                    changedItems.push(origIng)
                  }
                  else if (assumedIngredientsState[i].removed) {
                    let str = assumedIngredientsState[i].quantity + ' ' + assumedIngredientsState[i].unit + ' ' + assumedIngredientsState[i].ingredient
                    deletedItems.push(str)
                  }

                }

                fetch('http://localhost:8000/edit-recipe', {
                  method: "POST", headers: {
                    'Content-Type': "application/json"
                  }, body: JSON.stringify({ 'recipe': recipe, 'excluded_ingredients': deletedItems, "edited_items": editedItems, "changed_items": changedItems })
                })
                  .then(response => {

                    if (response.status === 200) return response.json()
                    else {
                      setMessage("The ingredient you added is not valid. Please try again.")
                    }

                  })
                  .then(data => {
                    setLoading(false)
                    if (data.recipes) {
                      setRecipe(data.recipes[0])
                      let newRecipeList = [...props.recipeList]
                      newRecipeList[Math.floor(props.index / 3)][props.index % 3] = data.recipes[0]
                      props.modifyRecipes(newRecipeList)
                      let assumedIngredientsName = data.recipes[0].assumed_ingredients
                      let assumedIngredientsMap = assumedIngredientsName.map((ingredient_name, i) => { return { "ingredient": ingredient_name, "quantity": data.recipes[0].assumed_quantities[i], "unit": data.recipes[0].assumed_quantities_unit[i], "edited": false, "removed": false } })
                      setAssumedIngredients(assumedIngredientsMap)
                    } else {
                      setMessage(data.message)
                      let assumedIngredientsName = recipe.assumed_ingredients
                      let assumedIngredientsMap = assumedIngredientsName.map((ingredient_name, i) => { return { "ingredient": ingredient_name, "quantity": recipe.assumed_quantities[i], "unit": recipe.assumed_quantities_unit[i], "edited": false, "removed": false } })
                      setAssumedIngredients(assumedIngredientsMap)
                    }
                  })
                  .catch(err => {
                    setLoading(false);
                    setMessage("An internal server error occured. Please try again.")
                  })
              }}>Edit/Remove Item(s)</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
