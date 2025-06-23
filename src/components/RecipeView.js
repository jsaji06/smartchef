import React from 'react'

const styles = {
    
}

export default function RecipeView(props) {
  let recipe = props.recipe
  return (
    <div className="recipe" style={styles}>
        <h2>{recipe.title}</h2>
        {/* <h3>CALORIES: {recipe.calories} cal | CARBS: {recipe.carbs}g | FAT: {recipe.fat}g | PROTEIN: {recipe.protein}g</h3> */}
        <p>{recipe.description}</p>
        <button onClick={e => {
          props.setIndex(props.recipeIndex)
          props.setState(recipe); 
        }}>Go to Recipe</button>
    </div>
  )
}
