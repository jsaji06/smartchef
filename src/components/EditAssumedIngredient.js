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
                            <option value="g">g</option>
                            <option value="mg">mg</option>
                            <option value="lb">lb</option>
                            <option value="oz">oz</option>

                            <option value="L">liters</option>
                            <option value="mL">milliliters</option>
                            <option value="cup">cups</option>
                            <option value="tbsp">tablespoons</option>
                            <option value="tsp">teaspoons</option>
                            <option value="qt">quarts</option>
                            <option value="pt">pints</option>
                            <option value="fl oz">fluid ounces</option>

                            <option value="small">small</option>
                            <option value="medium">medium</option>
                            <option value="large">large</option>
                            <option value="extra large">extra large</option>
                            <option value="jumbo">jumbo</option>

                            <option value="clove">cloves</option>
                            <option value="piece">pieces</option>
                            <option value="slice">slices</option>
                            <option value="leaf">leaves</option>
                            <option value="sprig">sprigs</option>
                            <option value="stalk">stalks</option>
                            <option value="head">heads</option>
                            <option value="strip">strips</option>
                            <option value="inch">inches</option>

                            <option value="scoop">scoops</option>
                            <option value="pinch">pinches</option>
                            <option value="dash">dashes</option>
                            <option value="drop">drops</option>
                            <option value="handful">handfuls</option>
                            <option value="bunch">bunches</option>
                            <option value="knob">knobs</option>
                            <option value="chunk">chunks</option>
                            <option value="clump">clumps</option>

                            <option value="sheet">sheets</option>
                            <option value="square">squares</option>
                            <option value="round">rounds</option>
                            <option value="ball">balls</option>
                            <option value="can">cans</option>
                            <option value="jar">jars</option>
                            <option value="bottle">bottles</option>
                            <option value="pack">packs</option>
                            <option value="packet">packets</option>
                            <option value="box">boxes</option>
                            <option value="bag">bags</option>
                            <option value="bar">bars</option>
                            <option value="stick">sticks</option>
                            <option value="log">logs</option>
                            <option value="rib">ribs</option>
                            <option value="ear">ears</option>
                            <option value="fillet">fillets</option>
                            <option value="rack">racks</option>
                            <option value="block">blocks</option>
                        </select>
                        <br />
                        <br />
                        <input value={ingredientName} onChange={e => setIngredientName(e.target.value)} />
                        <br />
                        <br />
                    </div>
                    <button onClick={e => {
                        if (quantity === undefined && unit !== undefined) {
                            props.setMessage("Please enter a quantity.")
                        }
                        if (unit === undefined && quantity !== undefined) {
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
