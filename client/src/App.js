import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import ClientList from "./components/ClientList";
// --- НОВЫЕ ИМПОРТЫ ---
import OrderList from "./components/OrderList";
import ShippingList from "./components/ShippingList";
import CancellationList from "./components/CancellationList";
// --------------------

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>CRM Dashboard</h1>
        </header>

        <Routes>
          {/* Маршрут для страницы входа */}
          <Route path="/" element={<Login />} />

          {/* Главный дашборд для админа */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* МАРШРУТЫ ДЛЯ АДМИН-ПАНЕЛИ */}
          <Route path="/admin/clients" element={<ClientList />} />
          <Route path="/admin/orders" element={<OrderList />} />
          <Route path="/admin/shipping" element={<ShippingList />} />
          <Route path="/admin/cancellations" element={<CancellationList />} />

          {/* Временный роут для не-админов */}
          <Route
            path="/profile-placeholder"
            element={<div>Профиль пользователя</div>}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
