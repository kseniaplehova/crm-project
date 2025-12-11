// src/components/AdminDashboard.jsx (ИСПРАВЛЕННАЯ ВЕРСИЯ С REFUNDS)

import React from "react";
import { useNavigate, NavLink, Outlet } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="admin-layout-wrapper">
      {/* ------------------- БОКОВАЯ ПАНЕЛЬ (SIDEBAR) ------------------- */}
      <nav className="sidebar">
        <div className="sidebar-header">
          <h3>CRM Навигация</h3>
        </div>
        <div className="menu-section">
          <div className="menu-title">Основные разделы</div>

          {/* ... (Клиенты, Заказы, Доставка) ... */}
          <NavLink
            to="/admin/clients"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            👥 Клиенты
          </NavLink>
          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            📈 Заказы
          </NavLink>
          <NavLink
            to="/admin/shipping"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            📦 Доставка
          </NavLink>
          <NavLink
            to="/admin/cancellations"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            ❌ Отмены
          </NavLink>

          {/* >>> НОВЫЙ РАЗДЕЛ: ВОЗВРАТЫ (REFUNDS) <<< */}
          <NavLink
            to="/admin/refunds"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            💰 Возвраты
          </NavLink>
        </div>
      </nav>
      {/* ------------------- КОНЕЦ SIDEBAR ------------------- */}

      <main className="main-content">
        {/* ------------------- КОНТЕНТ СТРАНИЦЫ (OUTLET) ------------------- */}
        <Outlet />
        {/* ------------------- КОНЕЦ OUTLET ------------------- */}
      </main>
    </div>
  );
};

export default AdminDashboard;
