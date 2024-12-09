import * as React from "react";
import "./App.css";

function NavigationItem({ icon, label }) {
  return (
    <div className="navigation-item">
      <img loading="lazy" src={icon} alt={`${label} icon`} />
      <div className="label">{label}</div>
    </div>
  );
}

export default NavigationItem;
