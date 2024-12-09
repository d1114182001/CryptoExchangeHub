import * as React from "react";
import NavigationItem from "./NavigationItem";
//import ActionButton from "./ActionButton";
import "./App.css";

const navigationItems = [
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/c15a055947b6fb348ecfd135880f37f86c364c81e83fd5d2206464d3c7e888e7?placeholderIfAbsent=true&apiKey=43f3788ff1d2423583a5a57f025a40b2",
    label: "Wallets",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/d9f11a4364068e3a02dda07d862325c67a1594119662117f6e724ccb76ce7d7c?placeholderIfAbsent=true&apiKey=43f3788ff1d2423583a5a57f025a40b2",
    label: "Transactions",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/e4891f63eb7cb876091021ddafd7794affd267c07cc8de3ecd8f9d57ddacf39a?placeholderIfAbsent=true&apiKey=43f3788ff1d2423583a5a57f025a40b2",
    label: "Dashboard",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/2f6cd1fce331f32716ac3258235763256f4d1a49b06db48b1ddb048d8e9bbc00?placeholderIfAbsent=true&apiKey=43f3788ff1d2423583a5a57f025a40b2",
    label: "Settings",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/b2e7bf0681d5ab433c6a20ba4ea4ac42b7ab5552b6a2871bdf17026b034d813d?placeholderIfAbsent=true&apiKey=43f3788ff1d2423583a5a57f025a40b2",
    label: "Log out",
  },
];



function DashboardLayout() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>CRYPTOTEST</div>
        <img
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/08a5adf80801b6fc18f3b0fb320831d5bc541753b4573c2f2e23068520e2c945?placeholderIfAbsent=true&apiKey=43f3788ff1d2423583a5a57f025a40b2"
          alt="Crypto logo"
          className="logo"
        />
      </div>

      <div className="navigation">
        {navigationItems.map((item, index) => (
          <div key={index} className={index !== 0 ? "navigation-item" : ""}>
            <NavigationItem {...item} />
          </div>
        ))}
      </div>

      
    </div>
  );
}

export default DashboardLayout;
