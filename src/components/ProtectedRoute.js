import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>; // Wait until user data is loaded

  if (!user) {
    console.warn("Access denied: User not logged in.");
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    console.warn(`Access denied: Required role '${requiredRole}', but user is '${user.role}'.`);
    return <h2>Access Denied. Only {requiredRole}s can access this page.</h2>;
  }

  return <Outlet />;
};

export default ProtectedRoute;
