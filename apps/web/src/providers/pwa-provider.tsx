import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { SplashScreen } from "../components/splash-screen.js";

interface PWAContextValue {
  needRefresh: boolean;
  setNeedRefresh: (v: boolean) => void;
  offlineReady: boolean;
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
}

const PWAContext = createContext<PWAContextValue | null>(null);

export function usePWA() {
  const ctx = useContext(PWAContext);
  if (!ctx) throw new Error("usePWA must be used within PWAProvider");
  return ctx;
}

export function PWAProvider({ children }: { children: ReactNode }) {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: "CHECK_UPDATE" });
      }
    }, 60 * 60 * 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (offlineReady) {
      const timer = setTimeout(() => setSplashVisible(false), 300);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setSplashVisible(false), 2000);
    return () => clearTimeout(timer);
  }, [offlineReady]);

  return (
    <PWAContext.Provider value={{ needRefresh, setNeedRefresh, offlineReady, updateServiceWorker }}>
      <SplashScreen isVisible={splashVisible} />
      {children}
    </PWAContext.Provider>
  );
}
