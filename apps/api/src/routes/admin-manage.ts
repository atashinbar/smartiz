import { Hono } from "hono";
import { eq, schema } from "@smartiz/db";
import { hashPassword, protectAdmin, protectSuperAdmin } from "@smartiz/auth";
import type { AppVariables } from "../middleware/env.js";

const { admins } = schema;

export const adminManageRoutes = new Hono<{ Variables: AppVariables }>()
  .use("*", protectAdmin)

  .get("/", async (c) => {
    const db = c.get("db");
    const list = await db.select({
      id: admins.id, email: admins.email, name: admins.name,
      role: admins.role, isActive: admins.isActive, lastLogin: admins.lastLogin,
      createdAt: admins.createdAt,
    }).from(admins).orderBy(admins.id);

    return c.json({ status: "success", data: list });
  })

  .post("/", protectSuperAdmin, async (c) => {
    const { email, password, name, role } = await c.req.json<{
      email: string; password: string; name?: string; role?: string;
    }>();
    if (!email || !password) {
      return c.json({ status: "error", message: "ایمیل و رمز عبور الزامی است" }, 400);
    }

    if (role && role !== "admin" && role !== "super_admin") {
      return c.json({ status: "error", message: "نقش نامعتبر است" }, 400);
    }

    const db = c.get("db");
    const [existing] = await db.select({ id: admins.id }).from(admins).where(eq(admins.email, email)).limit(1);
    if (existing) {
      return c.json({ status: "error", message: "این ایمیل قبلاً ثبت شده است" }, 409);
    }

    const hashed = await hashPassword(password);
    const [admin] = await db.insert(admins).values({
      email, password: hashed, name: name || null, role: role || "admin",
    }).returning({
      id: admins.id, email: admins.email, name: admins.name, role: admins.role, isActive: admins.isActive,
    });

    return c.json({ status: "success", data: admin }, 201);
  })

  .patch("/:id", protectSuperAdmin, async (c) => {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) return c.json({ status: "error", message: "شناسه نامعتبر است" }, 400);
    const body = await c.req.json<{ name?: string; email?: string; role?: string; password?: string }>();

    const db = c.get("db");
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.name !== undefined) updates.name = body.name;
    if (body.email !== undefined) updates.email = body.email;
    if (body.role !== undefined) updates.role = body.role;
    if (body.password) updates.password = await hashPassword(body.password);

    const [admin] = await db.update(admins).set(updates).where(eq(admins.id, id)).returning({
      id: admins.id, email: admins.email, name: admins.name, role: admins.role, isActive: admins.isActive,
    });

    if (!admin) return c.json({ status: "error", message: "ادمین یافت نشد" }, 404);
    return c.json({ status: "success", data: admin });
  })

  .patch("/:id/toggle", protectSuperAdmin, async (c) => {
    const id = Number(c.req.param("id"));
    if (isNaN(id)) return c.json({ status: "error", message: "شناسه نامعتبر است" }, 400);
    const db = c.get("db");

    const [current] = await db.select({ isActive: admins.isActive }).from(admins).where(eq(admins.id, id)).limit(1);
    if (!current) return c.json({ status: "error", message: "ادمین یافت نشد" }, 404);

    const [admin] = await db.update(admins).set({
      isActive: current.isActive ? 0 : 1, updatedAt: new Date(),
    }).where(eq(admins.id, id)).returning({
      id: admins.id, email: admins.email, name: admins.name, role: admins.role, isActive: admins.isActive,
    });

    return c.json({ status: "success", data: admin });
  });
