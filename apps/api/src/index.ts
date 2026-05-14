import { Hono } from "hono";
import { serve } from "@hono/node-server";

const app = new Hono();

app.get("/", (c) => {
  return c.json({ status: "ok", message: "Smartiz API" });
});

app.get("/api/health", (c) => {
  return c.json({ status: "healthy", timestamp: new Date().toISOString() });
});

serve({ fetch: app.fetch, port: 8585 }, (info) => {
  console.log(`API server running at http://localhost:${info.port}`);
});
