import { useAuth } from "@/context/useAuth";
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  requiresAdmin: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiresAdmin,
}) => {
  const location = useLocation();

  // Destructure the `isAuthenticated` and `isAdmin` properties from the state
  const { isAuthenticated: authState } = useAuth();
  const { isAuthenticated, isAdmin } = authState;

  // Check if the user is authorized based on the `requiresAdmin` prop
  const isAuthorized = requiresAdmin ? isAdmin : true;

  const login = localStorage.getItem("isAuthenticated");

  return login ? (
    <Outlet />
  ) : (
    <Navigate to="/sign-in" state={{ from: location }} replace />
  );
};
