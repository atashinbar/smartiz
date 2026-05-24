import { Hono } from "hono";
import { getFeatureFlags } from "@smartiz/shared";
import type { AppVariables } from "../middleware/env.js";

export const featureRoutes = new Hono<{ Variables: AppVariables }>().get(
  "/",
  async (c) => {
    const env = c.get("env");
    const flags = getFeatureFlags(env);
    return c.json({ status: "success", data: flags });
  },
);
