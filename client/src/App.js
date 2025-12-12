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
import AdminDashboardHome from "./components/Admin/AdminDashboardHome";
import ClientList from "./components/Clients/ClientList";
import OrderList from "./components/Orders/OrderList";
import ClientOrderDashboard from "./components/Clients/ClientOrderDashboard";
import ShippingList from "./components/Shipping/ShippingList";
import CancellationList from "./components/Cancel/CancellationList";

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header"></header>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/client/dashboard" element={<ClientOrderDashboard />} />

          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<AdminDashboardHome />} />

            <Route path="clients" element={<ClientList />} />

            <Route path="orders" element={<OrderList />} />
            <Route path="shipping" element={<ShippingList />} />
            <Route path="cancellations" element={<CancellationList />} />

            <Route
              path="profile-placeholder"
              element={<div>Профиль пользователя</div>}
            />
          </Route>

          <Route path="*" element={<div>404 Страница не найдена</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
