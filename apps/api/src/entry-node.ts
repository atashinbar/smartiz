import { serve } from "@hono/node-server";
import { createApp } from "./index.js";
import { loadEnv } from "./lib/env.js";

const env = loadEnv();
const app = createApp(env);

serve({ fetch: app.fetch, port: Number(env.API_PORT) || 8585 }, (info) => {
  console.log(`API server running at http://localhost:${info.port}`);
});
