import { Hono } from "hono";
import type { AppVariables } from "../middleware/env.js";
import { sql } from "@smartiz/db";

const healthRoutes = new Hono<{ Variables: AppVariables }>();

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

healthRoutes.get("/health", async (c) => {
  const start = performance.now();
  const db = c.get("db");
  const storage = c.get("storage");
  const env = c.get("env");

  const services: HealthResponse["services"] = {
    api: { status: "healthy" },
    database: { status: "unhealthy", message: "Not checked" },
    storage: { status: "unhealthy", message: "Not checked" },
  };

  // Check database
  try {
    const dbStart = performance.now();
    await db.execute(sql`SELECT 1`);
    services.database = {
      status: "healthy",
      latencyMs: Math.round(performance.now() - dbStart),
      message: "PostgreSQL connected",
    };
  } catch (err) {
    services.database = {
      status: "unhealthy",
      message: err instanceof Error ? err.message : "Database connection failed",
    };
  }

  // Check storage
  try {
    const storageStart = performance.now();
    await storage.list("__health_check__", 1);
    services.storage = {
      status: "healthy",
      latencyMs: Math.round(performance.now() - storageStart),
      message: `${env.STORAGE_PROVIDER} adapter ready`,
    };
  } catch (err) {
    services.storage = {
      status: "unhealthy",
      message: err instanceof Error ? err.message : "Storage check failed",
    };
  }

  const allHealthy = Object.values(services).every((s) => s.status === "healthy");
  const anyHealthy = Object.values(services).some((s) => s.status === "healthy");

  const response: HealthResponse = {
    status: allHealthy ? "healthy" : anyHealthy ? "degraded" : "unhealthy",
    timestamp: new Date().toISOString(),
    uptime: Math.round(performance.now() - start),
    services,
  };

  const httpStatus = allHealthy ? 200 : anyHealthy ? 207 : 503;
  return c.json(response, httpStatus);
});

export { healthRoutes };
