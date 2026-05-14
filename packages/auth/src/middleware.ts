import type { Context, Next } from "hono";
import { verifyToken } from "./jwt.js";

export async function protect(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ status: "error", message: "Unauthorized" }, 401);
  }
  const token = authHeader.substring(7);
  try {
    const secret = c.env.JWT_SECRET || c.get("env").JWT_SECRET;
    const payload = await verifyToken(token, secret);
    c.set("user", payload);
    await next();
  } catch {
    return c.json({ status: "error", message: "Invalid or expired token" }, 401);
  }
}

export async function protectAdmin(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ status: "error", message: "Unauthorized" }, 401);
  }
  const token = authHeader.substring(7);
  try {
    const secret = c.env.JWT_SECRET || c.get("env").JWT_SECRET;
    const payload = await verifyToken(token, secret);
    if (payload.userType !== "admin" && payload.userType !== "super_admin") {
      return c.json({ status: "error", message: "Forbidden" }, 403);
    }
    c.set("user", payload);
    await next();
  } catch {
    return c.json({ status: "error", message: "Invalid or expired token" }, 401);
  }
}

export async function protectSuperAdmin(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ status: "error", message: "Unauthorized" }, 401);
  }
  const token = authHeader.substring(7);
  try {
    const secret = c.env.JWT_SECRET || c.get("env").JWT_SECRET;
    const payload = await verifyToken(token, secret);
    if (payload.userType !== "super_admin") {
      return c.json({ status: "error", message: "Forbidden" }, 403);
    }
    c.set("user", payload);
    await next();
  } catch {
    return c.json({ status: "error", message: "Invalid or expired token" }, 401);
  }
}
