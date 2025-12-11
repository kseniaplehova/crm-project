// src/components/Login/Login.js

import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.css";

const API_URL = "http://localhost:5000/api/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth(); // <<< Используем login из контекста

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      const { token, user } = response.data;
      const role = user.role;

      // Сохраняем токен и данные пользователя через AuthContext
      login(token, user);

      setMessage("Вход успешен! Перенаправление...");

      if (role === "admin") {
        navigate("/admin"); // Перенаправляем администратора в его панель
      } else if (role === "client") {
        // Проверяем явно роль клиента
        navigate("/client/dashboard"); // Перенаправляем клиента в его личный кабинет
      } else {
        // На случай, если роль не определена или неизвестна
        navigate("/");
      } // -------------------------------------
    } catch (error) {
      // ... (код обработки ошибки)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Вход в CRM</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Загрузка..." : "Войти"}
          </button>
        </form>

        {message && <p className="message">{message}</p>}

        {/* ССЫЛКА НА РЕГИСТРАЦИЮ */}
        <p className="register-link-text">
          Нет аккаунта?
          <Link to="/register" className="register-link">
            Зарегистрируйтесь
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
