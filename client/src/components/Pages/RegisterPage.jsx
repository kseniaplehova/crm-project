import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const API_URL_REGISTER = "http://localhost:5000/api/data/register";
const API_URL_LOGIN = "http://localhost:5000/api/auth/login";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleAutoLogin = async (email, password) => {
    try {
      const loginResponse = await axios.post(API_URL_LOGIN, {
        email,
        password,
      });

      const { token, user } = loginResponse.data;
      login(token, user);

      setSuccessMessage("Регистрация и вход успешны! Перенаправление...");

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/client/dashboard");
      }
    } catch (loginError) {
      setSuccessMessage("Регистрация успешна! Теперь войдите вручную.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!name || !email || !password) {
      setError("Имя, Email и Пароль обязательны.");
      setLoading(false);
      return;
    }

    const clientDataToSend = {
      name,
      email,
      password,
      phone,
      role: "client",
    };

    try {
      await axios.post(API_URL_REGISTER, clientDataToSend);
      await handleAutoLogin(email, password);
    } catch (err) {
      console.error("Ошибка регистрации:", err.response || err);
      const msg =
        err.response?.data?.message || "Ошибка сервера при регистрации.";
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {" "}
      <div className="auth-card">
        <h2>Создать аккаунт</h2>{" "}
        {error && <p className="auth-error">{error}</p>}{" "}
        {successMessage && <p className="auth-success">{successMessage}</p>}{" "}
        <form onSubmit={handleSubmit}>
          {" "}
          <div className="form-group">
            <label>Имя/ФИО</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>{" "}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>{" "}
          <div className="form-group">
            <label>Телефон</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>{" "}
          <div className="form-group">
            <label>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>{" "}
          <button type="submit" className="auth-button" disabled={loading}>
            {" "}
            {loading
              ? "Регистрация и вход..."
              : "Зарегистрироваться и войти"}{" "}
          </button>{" "}
        </form>{" "}
        <p className="auth-link-text">
          Уже есть аккаунт? <Link to="/login">Войти</Link>{" "}
        </p>{" "}
      </div>{" "}
    </div>
  );
};

export default RegisterPage;
