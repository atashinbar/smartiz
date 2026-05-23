import { Outlet } from "react-router-dom";
import { AppHeader } from "../components/app-header.js";
import { Sidebar } from "../components/sidebar.js";
import { BottomTabBar } from "../components/bottom-tab-bar.js";
import { OfflineBanner } from "../components/offline-banner.js";
import { PWAInstallPrompt } from "../components/pwa-install-prompt.js";
import { PWAUpdateNotification } from "../components/pwa-update-notification.js";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <OfflineBanner />
      <AppHeader />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 pb-20 md:pb-6">
          <div className="mx-auto max-w-[768px] px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomTabBar />
      <PWAInstallPrompt />
      <PWAUpdateNotification />
    </div>
  );
}
