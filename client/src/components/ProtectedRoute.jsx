// src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; 

/**
 * Компонент-обертка для защиты роутов.
 * @param {string[]} allowedRoles - Массив ролей, которым разрешен доступ.
 * @param {React.ReactNode} children - Дочерние элементы (компонент, который мы защищаем).
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
    const { user, token, isCheckingAuth } = useAuth();
    const location = useLocation();
    
    // Если мы еще проверяем аутентификацию
    if (isCheckingAuth) {
        return <div style={{padding: '20px', textAlign: 'center'}}>Загрузка...</div>;
    }

    // 1. Проверка авторизации (нет токена)
    if (!token || !user) {
        // Перенаправляем на страницу входа, чтобы пользователь мог вернуться после логина
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. Проверка роли
    if (!allowedRoles.includes(user.role)) {
        // Перенаправляем администраторов на их дашборд (если они пытаются зайти в чужой роут)
        // Для клиентов оставляем их на заглушке или перенаправляем на 403
        
        // Перенаправляем на страницу ошибки или профиль
        return <Navigate to="/profile-placeholder" replace />; 
    }

    // 3. Доступ разрешен
    return children;
};

export default ProtectedRoute;