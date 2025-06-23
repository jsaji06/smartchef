import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faX } from '@fortawesome/free-solid-svg-icons'
export default function Alert(props) {
    return (
        <div className="alert">
            <FontAwesomeIcon icon={faX} className="exitPrompt" />
            <div className="alertBody">
                <h1 className="alertHeader">{props.alertHeader}</h1>
                <p>{props.alertDesc}</p>
                <button>Continue</button>
            </div>
        </div>
    )
}
