import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

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

  return (
    <PWAContext.Provider value={{ needRefresh, setNeedRefresh, offlineReady, updateServiceWorker }}>
      {children}
    </PWAContext.Provider>
  );
}
