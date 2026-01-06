// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import React from "react";

const ProtectedRoute: React.FC = () => {
  const token = localStorage.getItem("token");

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
