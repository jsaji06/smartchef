import React from 'react'
import { useState } from 'react'
import RecipeView from "./RecipeView";
import SelectedRecipe from "./SelectedRecipe"

export default function Main() {

    let [ingredients, setIngredients] = useState("");
    let [numRecipes, setNumRecipes] = useState("");
    let [recipes, setRecipes] = useState([])
    let [loading, setLoading] = useState(false);
    let [experience, setExperience] = useState("beginner");
    let [selectedRecipe, setSelectedRecipe] = useState(null);
    let [selectedRecipeIndex, setSelectedRecipeIndex] = useState(-1);
    let [message, setMessage] = useState(null)

    let fetchRecipes = () => {

        if (ingredients == "") {
            setMessage("The ingredients cannot be empty. Please try again.");
            setLoading(false)
        } else if (numRecipes == "") {
            setMessage("Please enter a valid number of recipes to generate (1-5).")
            setLoading(false)
        }
        else {
            setLoading(true);
            fetch("http://localhost:8000/get-recipes", {
                method: "POST",
                body: JSON.stringify({
                    ingredients: ingredients,
                    numRecipes: numRecipes,
                    experienceLevel: experience
                }),
                headers: {
                    'Content-Type': "application/json"
                }
            })
                .then(response => {
                    if (response.status === 200)
                        return response.json()
                    else setMessage("An internal server occured, try again.")
                })
                .then(data => {
                    if (!data.message) {
                        setLoading(false);
                        setRecipes(data)
                    } else {
                        setLoading(false);
                        setMessage(data.message)
                    }
                })
                .catch(error => {
                    setMessage("An internal error occured. Please try again later.")
                })
        }
    };

    return selectedRecipe ? <SelectedRecipe modifyRecipes={setRecipes} recipeList={recipes} recipe={selectedRecipe} setState={setSelectedRecipe} index={selectedRecipeIndex} /> : (
        <div className="container">
            {(message !== null) && <div className='darkOverlay'></div>}

            {message !== null &&

                <div className='modal'>
                    <h1>Error</h1>
                    <p>{message}</p>
                    <button onClick={() => setMessage(null)}>Exit</button>
                </div>
            }
            <div className="header">
                <h1>smartChef.</h1>
                <p>Want to chef up a quick recipe, but don't know what to make with what you have? Have an idea for what you want to make? Look no further - simply input your ingredients/ideas, and let us do the magic for you.</p>
            </div>
            <div className="body">
                <div className="form">
                    <input value={ingredients} className="ingredients" name="ingredients" placeholder="Ingredients" onChange={e => setIngredients(e.target.value)} />
                    <input value={numRecipes} min={1} max={5} className="numRecipes" name="numRecipes" placeholder="# of Recipes (1-5)" type='number' onChange={e => {
                        let recipeInt = parseInt(e.target.value, 10)
                        if (isNaN(recipeInt)) {
                            setNumRecipes("");
                        } else {
                            let recipeCount = Math.min(Math.max(1, recipeInt), 5);
                            setNumRecipes(recipeCount)
                        }

                    }} />
                    <select id='experience' name='experience' onChange={e => setExperience(e.target.value.toLowerCase())}>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                    <button className="submit" onClick={e => fetchRecipes()}>Submit</button>
                </div>
                <p style={{ "display": loading ? "block" : "none" }}>Your recipes are generated behind the scenes. Please wait - this may take a minute.</p>

                <div className="gap"></div>
                <div className="recipes-container" style={{ 'display': loading ? 'none' : 'block' }}>
                    {recipes.map((recipe_subarray, i) => {
                        return (<div key={i} className="recipes">
                            {recipe_subarray.map((recipe, j) => {
                                return <RecipeView recipe={recipe} setState={setSelectedRecipe} key={(i * 3) + j} modifyRecipes={setRecipes} setIndex={setSelectedRecipeIndex} recipeIndex={(i * 3) + j} />
                            })}
                        </div>)
                    })}
                </div>
            </div>
        </div>
    )
}
