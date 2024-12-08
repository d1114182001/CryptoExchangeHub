import * as React from "react";
import "./App.css";
import ActionButton from "./ActionButton";
const actionButtons = ["Buy", "Send", "Swap"];

function Wallet(){
    return(
        <main className="main-content">
        <div className="totalmoney">
          <p>總和:</p>
          <div>0.0 NTD</div>
          
        </div>
        <div className="action-buttons">
          {actionButtons.map((label, index) => (
            <ActionButton key={index} label={label} />
          ))}
        </div>
        
        <div className="wallet-card">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/e342347843a1ea2b450c26cd4064b3c3086e466d0b50c29fcc0698bbd5bb5fe9?placeholderIfAbsent=true&apiKey=43f3788ff1d2423583a5a57f025a40b2"
            alt="Currency icon"
          />
          <div>0.0</div>
        </div>
      </main>
    );
}

export default Wallet;