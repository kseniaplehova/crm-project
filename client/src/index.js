// src/index.js (или где вы рендерите корень)

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// ... другие импорты ...
import { AuthProvider } from "./contexts/AuthContext"; // <<< НОВЫЙ ИМПОРТ

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    {/* Оборачиваем App в провайдер контекста */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
