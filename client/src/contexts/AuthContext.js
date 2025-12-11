// src/contexts/AuthContext.js

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

// 1. Создание контекста
const AuthContext = createContext();

// 2. Хук для удобного использования контекста
export const useAuth = () => {
  return useContext(AuthContext);
};

// 3. Компонент-провайдер
export const AuthProvider = ({ children }) => {
  // Получаем начальные данные из localStorage
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // ФУНКЦИЯ ВХОДА: сохраняет токен и данные пользователя
  const login = useCallback((tokenData, userData) => {
    setToken(tokenData);
    setUser(userData);
    localStorage.setItem("token", tokenData);
    localStorage.setItem("user", JSON.stringify(userData));
  }, []);

  // ФУНКЦИЯ ВЫХОДА: очищает хранилище и состояние
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  // Эффект для завершения начальной проверки
  useEffect(() => {
    setIsCheckingAuth(false);
  }, []);

  // Значения, предоставляемые контекстом
  const value = {
    token,
    user,
    login,
    logout,
    isCheckingAuth,
    isAuthenticated: !!token,
    isAdmin: user && user.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
