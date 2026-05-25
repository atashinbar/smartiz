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
import { ComingSoonPage } from "./pages/coming-soon.js";
import { SkeletonPageLoader } from "./components/skeleton-page-loader.js";
import { RequireAuth, RedirectIfAuth } from "./components/auth-guard.js";
import { FeatureGate } from "./components/feature-gate.js";

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
      {
        path: "chat",
        element: (
          <FeatureGate feature="chat" fallback={<ComingSoonPage title="چت هوشمند" />}>
            <SuspensePage><ChatPage /></SuspensePage>
          </FeatureGate>
        ),
      },
      {
        path: "content",
        element: (
          <FeatureGate feature="contentManagement" fallback={<ComingSoonPage title="محتوا" />}>
            <SuspensePage><ContentPage /></SuspensePage>
          </FeatureGate>
        ),
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
