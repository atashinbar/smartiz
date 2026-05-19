import { useEffect, useState, useCallback } from "react";

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

const REFRESH_INTERVAL = 10_000;

function StatusDot({ status }: { status: ServiceStatus["status"] }) {
  const color =
    status === "healthy"
      ? "bg-emerald-500"
      : "bg-red-500";

  return (
    <span className="relative flex h-3 w-3">
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-75`}
      />
      <span className={`relative inline-flex h-3 w-3 rounded-full ${color}`} />
    </span>
  );
}

function ServiceCard({
  name,
  icon,
  service,
}: {
  name: string;
  icon: string;
  service: ServiceStatus;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">
              {service.message ?? "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {service.latencyMs != null && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {service.latencyMs}ms
            </span>
          )}
          <StatusDot status={service.status} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: HealthResponse["status"] }) {
  const config = {
    healthy: { label: "All Systems Operational", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    degraded: { label: "Partial Outage", bg: "bg-amber-50 text-amber-700 border-amber-200" },
    unhealthy: { label: "Major Outage", bg: "bg-red-50 text-red-700 border-red-200" },
  }[status];

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium ${config.bg}`}>
      <StatusDot status={status === "unhealthy" ? "unhealthy" : "healthy"} />
      {config.label}
    </span>
  );
}

export function StatusDashboard() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/health");
      if (!res.ok && res.status !== 207 && res.status !== 503) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data: HealthResponse = await res.json();
      setHealth(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
      setHealth(null);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground text-sm">Checking services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 text-center space-y-3">
          <h1 className="text-2xl font-bold text-foreground">System Status</h1>
          {health ? (
            <StatusBadge status={health.status} />
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-sm font-medium text-red-700">
              <StatusDot status="unhealthy" />
              API Unreachable
            </span>
          )}
        </div>

        <div className="space-y-3">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Connection error: {error}
            </div>
          )}

          {health && (
            <>
              <ServiceCard
                name="API Server"
                icon="⚡"
                service={health.services.api}
              />
              <ServiceCard
                name="Database"
                icon="🗄️"
                service={health.services.database}
              />
              <ServiceCard
                name="Storage"
                icon="📁"
                service={health.services.storage}
              />
            </>
          )}
        </div>

        {lastRefresh && (
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Last checked: {lastRefresh.toLocaleTimeString()} · Auto-refreshes every {REFRESH_INTERVAL / 1000}s
          </p>
        )}
      </div>
    </div>
  );
}
