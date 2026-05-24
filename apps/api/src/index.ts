import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { EnvConfig } from "@smartiz/shared";
import type { AppVariables } from "./middleware/env.js";
import { createEnvMiddleware } from "./middleware/env.js";
import { errorHandler } from "./middleware/error.js";
import { healthRoutes } from "./routes/health.js";
import { adminAuthRoutes } from "./routes/admin-auth.js";
import { adminManageRoutes } from "./routes/admin-manage.js";
import { userAuthRoutes } from "./routes/user-auth.js";
import { featureRoutes } from "./routes/features.js";

export function createApp(env: EnvConfig) {
  const app = new Hono<{ Variables: AppVariables }>();

  app.use("*", logger());
  app.use("*", cors({ origin: env.CORS_ORIGINS.split(","), allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"] }));
  app.use("*", createEnvMiddleware(env));

  app.route("/api", healthRoutes);
  app.route("/api/admin", adminAuthRoutes);
  app.route("/api/admin/admins", adminManageRoutes);
  app.route("/api/auth", userAuthRoutes);
  app.route("/api/features", featureRoutes);

  app.onError(errorHandler);

  return app;
}
