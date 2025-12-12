import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * @param {string[]} allowedRoles
 * @param {React.ReactNode} children
 */
const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, token, isCheckingAuth } = useAuth();
  const location = useLocation();

  if (isCheckingAuth) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>Загрузка...</div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/profile-placeholder" replace />;
  }

  return children;
};

export default ProtectedRoute;
