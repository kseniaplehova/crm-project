import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Импорт хука для навигации
import "./Login.css";

// Базовая URL для запросов
const API_URL = "http://localhost:5000/api/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // Инициализируем функцию для программной навигации
  const navigate = useNavigate();

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      // Успешный вход
      const { token, user } = response.data;
      const role = user.role;

      // Сохраняем токен и роль в локальное хранилище
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", role);

      setMessage("Вход успешен!");

      // Логика перенаправления
      if (role === "admin") {
        // Если админ, переходим на панель клиентов
        navigate("/admin");
      } else {
        navigate("/profile-placeholder");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage(
        error.response?.data?.message ||
          "Ошибка входа. Проверьте учетные данные."
      );
    }
  };

  // JSX компонента Login
  return (
    <div className="login-container">
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

        <button type="submit" className="login-button">
          Войти
        </button>
      </form>

      {/* Сообщение об успехе или ошибке */}
      {message && <p className="message">{message}</p>}

      {/* Здесь могут быть кнопки регистрации или сброса пароля */}
    </div>
  );
};

export default Login;
