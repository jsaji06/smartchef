import React from 'react'
import { useState } from 'react';
import '../App.css'
import { useEffect } from 'react';

export default function EditAssumedIngredient(props) {
    let i = props.index;
    let ingredient = props.ingredients[i];
    let [quantity, setQuantity] = useState((ingredient.quantity !== undefined || ingredient.quantity !== null) ? ingredient.quantity : 1);
    let [unit, setUnit] = useState((ingredient.unit !== undefined || ingredient.unit !== null) ? ingredient.unit : "")
    let [ingredientName, setIngredientName] = useState(ingredient.ingredient)
    useEffect(() => {
        const ing = props.ingredients[props.index];
        if (ing) {
            setQuantity(ing.quantity);
            setUnit(ing.unit);
            setIngredientName(ing.ingredient);
        }
    }, [props.index, props.ingredients]);

    return (
        <div className='container'>
            <div className='modal'>
                <div className="formFlex">
                    <h1>Edit Ingredient</h1>
                    <div className="inputs">
                        <input value={quantity} type='number' onChange={(e) => {
                            setQuantity(e.target.value);
                        }} />
                        <select value={unit} onChange={e => {
                            setUnit(e.target.value)
                        }}>
                            <option value="whole">whole</option>
                            <option value="kg">kg</option>
                            <option value="lb">lb</option>
                            <option value="g">g</option>
                            <option value="mL">milliliters</option>
                            <option value="L">liters</option>
                            <option value="cup">cups</option>
                            <option value="tbsp">tbsp</option>
                            <option value="tsp">tsp</option>
                            <option value="small">small</option>
                            <option value="medium">medium</option>
                            <option value="large">large</option>
                            <option value='clove'>cloves</option>
                            <option value='piece'>pieces</option>
                            <option value='slice'>slices</option>
                            <option value='leaf'>leaves</option>
                            <option value='sprig'>sprigs</option>
                            <option value='stalk'>stalks</option>
                            <option value='inch'>inch</option>
                            <option value='head'>heads</option>
                            <option value='strip'>strips</option>
                            <option value='pinch'>pinch</option>
                            <option value='scoop'>scoop</option>
                        </select>
                        <br />
                        <br />
                        <input value={ingredientName} onChange={e => setIngredientName(e.target.value)} />
                        <br />
                        <br />
                    </div>
                    <button onClick={e => {
                        if(quantity === undefined && unit !== undefined){
                            props.setMessage("Please enter a quantity.")
                        } 
                        if(unit === undefined && quantity !== undefined) {
                            setUnit("whole")
                        }
                        props.setIndex(-1)

                        if (ingredientName !== ingredient.name || unit !== ingredient.unit || quantity !== ingredient.quantity) {
                            let newIngredient = { ...ingredient }
                            newIngredient.ingredient = ingredientName;
                            newIngredient.unit = unit
                            newIngredient.quantity = quantity
                            newIngredient.edited = true;
                            let newIngredients = [...props.ingredients]
                            newIngredients[props.index] = newIngredient
                            props.changeIngredient(newIngredients);

                        }
                    }}>Submit</button>
                    <button onClick={e => {
                        props.setIndex(-1)
                    }}>Cancel</button>
                </div>
            </div>

        </div >
    )
}
