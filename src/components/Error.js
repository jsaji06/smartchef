import React from 'react'

export default function Error(props) {
  return (
    <div className="modal">
        <h1>Error</h1>
        <p>{props.message}</p>
        <button onClick={() => {
            props.setMessage(null);
        }}>Exit</button>
    </div>
  )
}
