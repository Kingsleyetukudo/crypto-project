import React from "react";
import { Navigate } from "react-router-dom";

const getTokenPayload = (token) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const payload = getTokenPayload(token);
  if (!payload) {
    return <Navigate to="/login" replace />;
  }

  if (payload.exp && Date.now() >= payload.exp * 1000) {
    return <Navigate to="/login" replace />;
  }

  if (role && payload.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
