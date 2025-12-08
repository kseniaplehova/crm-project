import React from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Функции для навигации
  const handleNavigateToClients = () => navigate("/admin/clients");
  const handleNavigateToOrders = () => navigate("/admin/orders"); // <-- Новая
  const handleNavigateToShipping = () => navigate("/admin/shipping"); // <-- Новая
  const handleNavigateToCancellations = () => navigate("/admin/cancellations"); // <-- Новая

  return (
    <div className="dashboard-container">
      <h2>Общая Панель Администратора (Сводка)</h2>
      <p className="summary-text">
        Добро пожаловать, Администратор! Здесь будет отображаться ключевая
        статистика CRM.
      </p>

      <div className="stats-grid">
        {/* 1. Блок Клиентов (зеленый) */}
        <div
          className="stat-box clickable-box client-box" // добавим client-box для возможной индивидуальной стилизации
          onClick={handleNavigateToClients}
          title="Нажмите для просмотра списка клиентов"
        >
          <h3>👥 Активных Клиентов</h3>
          <p className="stat-value">870</p>
        </div>

        {/* 2. Блок Заказов (синий) */}
        <div
          className="stat-box clickable-box order-box" // добавим order-box
          onClick={handleNavigateToOrders}
          title="Нажмите для просмотра списка заказов"
        >
          <h3>📈 Всего Заказов</h3>
          <p className="stat-value">1245</p>
        </div>

        {/* 3. Блок Доставки (желтый) */}
        <div
          className="stat-box clickable-box shipping-box" // добавим shipping-box
          onClick={handleNavigateToShipping}
          title="Нажмите для просмотра списка доставок"
        >
          <h3>🚚 В Доставке</h3>
          <p className="stat-value">45</p>
        </div>

        {/* 4. Блок Отмены (красный) */}
        <div
          className="stat-box clickable-box cancellation-box" // добавим cancellation-box
          onClick={handleNavigateToCancellations}
          title="Нажмите для просмотра списка отмен"
        >
          <h3>❌ Отказов</h3>
          <p className="stat-value">12</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
