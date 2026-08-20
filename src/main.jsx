import React from "react";
import ReactDOM from "react-dom/client";
import App from "./mobile_prototype.jsx"; // <--- Importa o seu protótipo
import "./index.css"; // Mantenha o CSS (para o Tailwind)

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
