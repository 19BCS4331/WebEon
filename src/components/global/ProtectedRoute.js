import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  const isAuth = localStorage.getItem("isAuth");
  return isAuth ? <Outlet /> : <Navigate to="/" replace={true} />;
};

export { ProtectedRoute };
