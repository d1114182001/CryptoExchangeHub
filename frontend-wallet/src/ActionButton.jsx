import * as React from "react";
import "./App.css";

function ActionButton({ label }) {
  return (
    <button 
      className="action-button" 
      aria-label={label}
    >
      {label}
    </button>
  );
}

export default ActionButton;
