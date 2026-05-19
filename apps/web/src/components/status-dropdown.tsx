import { useEffect, useState, useCallback, useRef } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

interface ServiceStatus {
  status: "healthy" | "unhealthy";
  latencyMs?: number;
  message?: string;
}

interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  services: {
    api: ServiceStatus;
    database: ServiceStatus;
    storage: ServiceStatus;
  };
}

function StatusDot({ status }: { status: ServiceStatus["status"] }) {
  const color = status === "healthy" ? "bg-emerald-500" : "bg-red-500";
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-75`}
      />
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${color}`} />
    </span>
  );
}

const serviceItems = [
  { key: "api" as const, label: "API", icon: "⚡" },
  { key: "database" as const, label: "دیتابیس", icon: "🗄️" },
  { key: "storage" as const, label: "فضای ذخیره‌سازی", icon: "📁" },
];

export function StatusDropdown() {
  const [open, setOpen] = useState(false);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady],
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        setInterval(() => registration.update(), 60 * 60 * 1000);
      }
    },
  });

  const swState = needRefresh
    ? "update_available" as const
    : offlineReady
    ? "active" as const
    : "pending" as const;

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/health");
      const data: HealthResponse = await res.json();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10_000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allHealthy = health?.status === "healthy";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
        title="وضعیت سیستم"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {!loading && (
          <span className={`absolute top-1 left-1 h-2 w-2 rounded-full ${allHealthy ? "bg-emerald-500" : "bg-red-500"}`} />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-lg border border-border bg-background p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">وضعیت سیستم</h3>
            {health && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                health.status === "healthy"
                  ? "bg-emerald-50 text-emerald-700"
                  : health.status === "degraded"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-red-50 text-red-700"
              }`}>
                {health.status === "healthy" ? "سالم" : health.status === "degraded" ? "نیمه‌آماده" : "خارج از سرویس"}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              {health ? (
                <div className="space-y-2">
                  {serviceItems.map(({ key, label, icon }) => (
                    <div key={key} className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{icon}</span>
                        <span className="text-sm text-foreground">{label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {health.services[key].latencyMs != null && (
                          <span className="text-xs text-muted-foreground">{health.services[key].latencyMs}ms</span>
                        )}
                        <StatusDot status={health.services[key].status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md bg-red-50 p-3 text-center text-sm text-red-700">
                  API در دسترس نیست
                </div>
              )}

              <div className="mt-3 border-t border-border pt-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">PWA</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">📋</span>
                      <span className="text-sm text-foreground">Manifest</span>
                    </div>
                    <StatusDot status="healthy" />
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🔄</span>
                      <span className="text-sm text-foreground">Service Worker</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {swState === "active" ? "فعال" : swState === "update_available" ? "بروزرسانی" : "در انتظار"}
                      </span>
                      <StatusDot status={swState === "active" || swState === "update_available" ? "healthy" : "unhealthy"} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
