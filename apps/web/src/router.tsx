import { Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./layouts/app-layout.js";
import { AuthLayout } from "./layouts/auth-layout.js";
import { DashboardPage } from "./pages/dashboard.js";
import { StatusDashboard } from "./status.js";
import { ProfilePage } from "./pages/profile.js";
import { ChatPage } from "./pages/chat.js";
import { ContentPage } from "./pages/content.js";
import { NotFoundPage } from "./pages/not-found.js";
import { OfflinePage } from "./pages/offline.js";
import { LoginPage } from "./pages/login.js";
import { SkeletonPageLoader } from "./components/skeleton-page-loader.js";
import { RequireAuth, RedirectIfAuth } from "./components/auth-guard.js";

function SuspensePage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<SkeletonPageLoader />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: "/offline",
    element: <OfflinePage />,
  },
  {
    path: "/login",
    element: (
      <RedirectIfAuth>
        <AuthLayout />
      </RedirectIfAuth>
    ),
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <SuspensePage><DashboardPage /></SuspensePage> },
      { path: "status", element: <SuspensePage><StatusDashboard /></SuspensePage> },
      { path: "profile", element: <SuspensePage><ProfilePage /></SuspensePage> },
      { path: "chat", element: <SuspensePage><ChatPage /></SuspensePage> },
      { path: "content", element: <SuspensePage><ContentPage /></SuspensePage> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
