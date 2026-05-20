import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./layouts/app-layout.js";
import { DashboardPage } from "./pages/dashboard.js";
import { StatusDashboard } from "./status.js";
import { ProfilePage } from "./pages/profile.js";
import { ChatPage } from "./pages/chat.js";
import { ContentPage } from "./pages/content.js";
import { NotFoundPage } from "./pages/not-found.js";
import { OfflinePage } from "./pages/offline.js";

export const router = createBrowserRouter([
  {
    path: "/offline",
    element: <OfflinePage />,
  },
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "status", element: <StatusDashboard /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "chat", element: <ChatPage /> },
      { path: "content", element: <ContentPage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
