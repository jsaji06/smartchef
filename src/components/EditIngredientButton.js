import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import EditAssumedIngredient from './EditAssumedIngredient';

export default function EditIngredientButton() {
    return (
        <div>
            <FontAwesomeIcon className="icon" icon={faEdit} onClick={() => {
                setItemToEdit({ ingredientName: recipe.assumed_ingredients[i], assumedQuantity: recipe.assumed_quantities[i], unit: recipe.assumed_quantities_unit[i] })
                setEditIngredientIndex(i)
                let copied = [...editItemsRender]
                copied[i] = !copied[i]
                setEditedItemsRender(copied)
                editItems[i] = step
                editItems = editItems.map((item, i) => item ? item : false).filter(item => item != false)
                setEditedItems(editItems)
            }} />
        </div>
    )
}
