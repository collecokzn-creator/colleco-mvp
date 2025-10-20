import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useUser();

  if (!user) return <Navigate to="/login" replace />;

  if (requiredRole && user.role !== requiredRole)
    return <Navigate to="/unauthorized" replace />;

  return children;
};

export default ProtectedRoute;
