// client/src/App.js
import React from "react"; // (Можно убрать React, если вы его не используете явно)
import "./components/Login";
import Login from "./components/Login"; // <--- Импорт Login

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Login /> {/* <--- ОБЯЗАТЕЛЬНО ИСПОЛЬЗУЕМ КОМПОНЕНТ */}
      </header>
    </div>
  );
}

export default App;
