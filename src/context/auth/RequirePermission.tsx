import React from "react";
import { Navigate } from "react-router-dom";

export default function RequirePermission({ allow, children }) {
  if (!allow) return <Navigate to="/dashboard" replace />;
  return children;
}
