// src/App.js (ФИНАЛЬНАЯ ИСПРАВЛЕННАЯ ВЕРСИЯ С МАРШРУТОМ КЛИЕНТА)

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./components/Login/Login";
import RegisterPage from "./components/Pages/RegisterPage";
import AdminDashboard from "./components/Admin/AdminDashboard";
import ClientList from "./components/Clients/ClientList";
import OrderList from "./components/Orders/OrderList";
import ClientOrderDashboard from "./components/Clients/ClientOrderDashboard"; // Клиентская панель
import ShippingList from "./components/Shipping/ShippingList";
import CancellationList from "./components/Cancel/CancellationList";
// import RefundList from "./components/Refunds/RefundList"; // УДАЛЕНО: Этот компонент не используется и вызывает ошибку/предупреждение

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>CRM Dashboard</h1>
        </header>
        <Routes>
          {/* 1. ПУБЛИЧНЫЕ МАРШРУТЫ (Login, Register) */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* 2. МАРШРУТ КЛИЕНТА (Личный кабинет) */}
          {/* !!! В реальном приложении должен быть защищен аутентификацией !!! */}
          <Route path="/client/dashboard" element={<ClientOrderDashboard />} />

          {/* 3. ЗАЩИЩЕННЫЙ РОДИТЕЛЬСКИЙ МАРШРУТ (ADMIN LAYOUT) */}
          <Route path="/admin" element={<AdminDashboard />}>
            {/* Роут по умолчанию при переходе на /admin */}
            <Route index element={<Navigate to="clients" replace />} />

            {/* МАРШРУТЫ ДЛЯ АДМИН-ПАНЕЛИ */}
            <Route path="clients" element={<ClientList />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="shipping" element={<ShippingList />} />
            <Route path="cancellations" element={<CancellationList />} />

            <Route
              path="profile-placeholder"
              element={<div>Профиль пользователя</div>}
            />
          </Route>

          {/* Обработка 404 */}
          <Route path="*" element={<div>404 Страница не найдена</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
