import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { EnvConfig } from "@smartiz/shared";
import type { AppVariables } from "./middleware/env.js";
import { createEnvMiddleware } from "./middleware/env.js";
import { errorHandler } from "./middleware/error.js";
import { healthRoutes } from "./routes/health.js";

export function createApp(env: EnvConfig) {
  const app = new Hono<{ Variables: AppVariables }>();

  app.use("*", logger());
  app.use("*", cors({ origin: env.CORS_ORIGINS.split(","), allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"] }));
  app.use("*", createEnvMiddleware(env));

  app.route("/api", healthRoutes);

  app.onError(errorHandler);

  return app;
}
