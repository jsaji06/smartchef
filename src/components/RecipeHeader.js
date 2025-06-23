import React from 'react'

export default function RecipeHeader(props) {
  let recipe = props.recipe;
  return (
    <div class='recipeHeader'>
        <h1>{recipe.title}</h1>
        <p>{recipe.description}</p>
        <p>Cooking ETA: <span className="bold">{recipe.eta}</span></p>
        <p>CALORIES: {recipe.calories} cal | CARBS: {recipe.carbs}g | FAT: {recipe.fat}g | PROTEIN: {recipe.protein}g</p>
    </div>
  )
}
