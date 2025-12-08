// client/src/components/Login.js
import { useState } from "react";
import "./Login.css"; // <--- КЛЮЧЕВОЙ МОМЕНТ: Импорт стилей

const Login = () => {
  // Состояния для данных формы и сообщений
  const [email, setEmail] = useState("admin@crm.com");
  const [password, setPassword] = useState("123456");
  const [message, setMessage] = useState("");

  // Состояния для тестирования ролей
  const [profileData, setProfileData] = useState("Не проверено");
  const [adminData, setAdminData] = useState("Не проверено");
  const [clientData, setClientData] = useState("Не проверено");

  // --- ФУНКЦИЯ ВХОДА И ПОЛУЧЕНИЯ ТОКЕНА (Остается без изменений) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Попытка входа...");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", data.user.role);
        setMessage(`Successful login! You're ${data.user.role}`);
      } else {
        setMessage(`${data.message || "Неизвестная ошибка"}`);
      }
    } catch (error) {
      setMessage("Проблема с подключением к серверу (порт 5000).");
      console.error("Login error:", error);
    }
  };

  // --- ФУНКЦИИ ПРОВЕРКИ ЗАЩИЩЕННЫХ РОУТОВ (Используют общую функцию) ---
  const sendProtectedRequest = async (endpoint, setDataState) => {
    const token = localStorage.getItem("token");
    setDataState("Запрос данных...");

    if (!token) {
      setDataState("Токен отсутствует. Войдите.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/data${endpoint}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      const statusClass = response.ok ? "Успех" : "Ошибка";

      if (response.ok) {
        setDataState(`${statusClass} (${data.userRole}): ${data.message}`);
      } else {
        setDataState(`${statusClass} ${response.status} - ${data.message}`);
      }
    } catch (error) {
      setDataState("Ошибка подключения к серверу.");
      console.error("Protected request error:", error);
    }
  };

  const handleProfileRequest = () =>
    sendProtectedRequest("/profile", setProfileData);
  const handleAdminRequest = () =>
    sendProtectedRequest("/admin-dashboard", setAdminData);
  const handleClientRequest = () =>
    sendProtectedRequest("/my-orders", setClientData);

  // --- ФУНКЦИЯ ВЫХОДА (Очистка токена) ---
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    setMessage("Вы вышли из системы.");
    setProfileData("Не проверено");
    setAdminData("Не проверено");
    setClientData("Не проверено");
  };

  return (
    <div className="login-container">
      {" "}
      <h2>CRM Авторизация</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          {" "}
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          {" "}
          <label>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          {" "}
          Войти
        </button>
      </form>
      <p
        className={`status-message ${
          message.startsWith("") ? "error" : "success"
        }`}
      >
        {message}
      </p>
    </div>
  );
};

export default Login;
