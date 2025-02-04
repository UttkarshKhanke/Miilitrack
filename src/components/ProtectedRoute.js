import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // Prevents flickering while Firebase checks auth state

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
