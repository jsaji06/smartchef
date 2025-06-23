import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'

export default function AssumedIngredient(props) {
    let ingInd = props.ingredientIndex;
    let ingredient = props.ingredientInfo
    let ingredientList = props.ingredientList;
    let name = ingredient.ingredient
    let quantity = ingredient.quantity;
    let unit = ingredient.unit;
    let deleted = ingredient.removed

    return (
        <div>
            <span className="assumedIngredient">
                <p style={{'textDecoration':deleted ? 'line-through' : 'none'}}>{ingredient.edited ? '(edited) ' : '' }{quantity} {unit} {name}</p>
                <FontAwesomeIcon className="icon" icon={faEdit} onClick={() => {
                    props.setIngredientIndex(ingInd)
                    
                }} />
                <FontAwesomeIcon className="icon" icon={faTrash} onClick={() => {
                    let newIng = [...ingredientList]
                    let updated = {
                        ...newIng[ingInd],
                        removed: !deleted
                    }
                    newIng[ingInd] = updated;
                    props.changeIngredient(newIng)
                    
                    }} />
            </span>
        </div>
    )
}
