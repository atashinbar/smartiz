import type { Context, Next } from "hono";
import { getFeatureFlags } from "@smartiz/shared";
import type { AppVariables } from "./env.js";
import type { FeatureFlags } from "@smartiz/shared";

export function requireFeature(feature: keyof FeatureFlags) {
  return async (c: Context<{ Variables: AppVariables }>, next: Next) => {
    const env = c.get("env");
    const flags = getFeatureFlags(env);
    if (!flags[feature]) {
      return c.json({ status: "error", message: "This feature is not available" }, 404);
    }
    await next();
  };
}
