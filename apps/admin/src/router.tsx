import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout } from "./layouts/auth-layout.js";
import { AdminLayout } from "./layouts/admin-layout.js";
import { LoginPage } from "./pages/login.js";
import { DashboardPage } from "./pages/dashboard.js";
import { AdminsPage } from "./pages/admins.js";

export function createAppRouter(isAuthenticated: boolean) {
  return createBrowserRouter([
    {
      path: "/login",
      element: isAuthenticated ? <Navigate to="/" replace /> : <AuthLayout />,
      children: [{ index: true, element: <LoginPage /> }],
    },
    {
      element: isAuthenticated ? <AdminLayout /> : <Navigate to="/login" replace />,
      children: [
        { index: true, element: <DashboardPage /> },
        { path: "admins", element: <AdminsPage /> },
      ],
    },
  ]);
}
