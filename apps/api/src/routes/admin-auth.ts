import { Hono } from "hono";
import { eq, schema } from "@smartiz/db";
import { signToken, verifyPassword } from "@smartiz/auth";
import { protectAdmin } from "@smartiz/auth";
import type { AppVariables } from "../middleware/env.js";

const { admins } = schema;

export const adminAuthRoutes = new Hono<{ Variables: AppVariables }>()
  .post("/login", async (c) => {
    const { email, password } = await c.req.json<{ email: string; password: string }>();
    if (!email || !password) {
      return c.json({ status: "error", message: "ایمیل و رمز عبور الزامی است" }, 400);
    }

    const db = c.get("db");
    const [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);

    if (!admin) {
      return c.json({ status: "error", message: "ایمیل یا رمز عبور اشتباه است" }, 401);
    }

    if (!admin.isActive) {
      return c.json({ status: "error", message: "حساب کاربری غیرفعال است" }, 403);
    }

    if (admin.lockoutUntil && new Date(admin.lockoutUntil) > new Date()) {
      return c.json({ status: "error", message: "حساب قفل شده است. لطفاً بعداً تلاش کنید" }, 423);
    }

    const valid = await verifyPassword(password, admin.password);
    if (!valid) {
      const attempts = admin.loginAttempts + 1;
      const lockoutUntil = attempts >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : null;
      await db
        .update(admins)
        .set({ loginAttempts: attempts, lockoutUntil, updatedAt: new Date() })
        .where(eq(admins.id, admin.id));

      return c.json({ status: "error", message: "ایمیل یا رمز عبور اشتباه است" }, 401);
    }

    await db
      .update(admins)
      .set({ loginAttempts: 0, lockoutUntil: null, lastLogin: new Date(), updatedAt: new Date() })
      .where(eq(admins.id, admin.id));

    const secret = c.get("env").JWT_SECRET;
    const token = await signToken({ id: admin.id, userType: admin.role as "admin" | "super_admin" }, secret, "24h");

    return c.json({
      status: "success",
      data: {
        token,
        admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
      },
    });
  })

  .get("/me", protectAdmin, async (c) => {
    const { id } = c.get("user");
    const db = c.get("db");
    const [admin] = await db.select({
      id: admins.id, email: admins.email, name: admins.name,
      role: admins.role, isActive: admins.isActive, lastLogin: admins.lastLogin,
    }).from(admins).where(eq(admins.id, id)).limit(1);

    if (!admin) return c.json({ status: "error", message: "Admin not found" }, 404);
    return c.json({ status: "success", data: admin });
  });
