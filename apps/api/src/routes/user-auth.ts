import { Hono } from "hono";
import { eq, and, gt, sql, schema } from "@smartiz/db";
import { signToken, hashOTP } from "@smartiz/auth";
import { formatPhone, isValidPhone, OTP_EXPIRES_IN_SECONDS } from "@smartiz/shared";
import type { AppVariables } from "../middleware/env.js";

const { users, otp: otpTable } = schema;

export const userAuthRoutes = new Hono<{ Variables: AppVariables }>()
  .post("/check-phone", async (c) => {
    const { phone } = await c.req.json<{ phone: string }>();
    if (!phone) return c.json({ status: "error", message: "Phone number is required" }, 400);
    if (!isValidPhone(phone)) return c.json({ status: "error", message: "Invalid phone number" }, 400);

    const normalized = formatPhone(phone);
    const db = c.get("db");
    const [user] = await db.select({ id: users.id }).from(users).where(eq(users.phone, normalized)).limit(1);

    return c.json({ status: "success", data: { exists: !!user } });
  })

  .post("/request-otp", async (c) => {
    const { phone, nationalId, userType = "student" } = await c.req.json<{
      phone: string;
      nationalId?: string;
      userType?: string;
    }>();

    if (!phone) return c.json({ status: "error", message: "Phone number is required" }, 400);
    if (!isValidPhone(phone)) return c.json({ status: "error", message: "Invalid phone number" }, 400);

    const normalized = formatPhone(phone);
    const db = c.get("db");

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.phone, normalized))
      .limit(1);

    if (!existingUser) {
      if (!nationalId || !nationalId.trim()) {
        return c.json({ status: "error", message: "National ID is required for registration" }, 400);
      }

      const [existingNationalId] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.nationalId, nationalId.trim()))
        .limit(1);

      if (existingNationalId) {
        return c.json({ status: "error", message: "This national ID is already registered" }, 409);
      }
    }

    const now = new Date();
    const [activeOTP] = await db
      .select()
      .from(otpTable)
      .where(and(eq(otpTable.phone, normalized), eq(otpTable.type, "login"), gt(otpTable.expiresAt, now)))
      .limit(1);

    if (activeOTP) {
      const remainingSeconds = Math.max(
        0,
        Math.floor((new Date(activeOTP.expiresAt).getTime() - now.getTime()) / 1000),
      );
      return c.json(
        {
          status: "error",
          message: "An OTP is already active. Please wait before requesting a new one.",
          data: { remainingSeconds },
        },
        429,
      );
    }

    const otpProvider = c.get("otpProvider");
    let code: string;
    try {
      code = await otpProvider.send(normalized);
    } catch (err) {
      console.error("Failed to send OTP:", err);
      return c.json({ status: "error", message: "Failed to send verification code" }, 502);
    }
    const codeHash = await hashOTP(code);
    const authenticationId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + OTP_EXPIRES_IN_SECONDS * 1000);

    await db.insert(otpTable).values({
      phone: normalized,
      type: "login",
      nationalId: nationalId?.trim() ?? null,
      userType,
      codeHash,
      authenticationId,
      expiresAt,
      attempts: 0,
      maxAttempts: 3,
    });

    return c.json({ status: "success", data: { authenticationId, expiresInSeconds: OTP_EXPIRES_IN_SECONDS } });
  })

  .post("/verify-otp", async (c) => {
    const { phone, code, authenticationId } = await c.req.json<{
      phone: string;
      code: string;
      authenticationId: string;
    }>();

    if (!phone || !code || !authenticationId) {
      return c.json({ status: "error", message: "Phone, code, and authentication ID are required" }, 400);
    }

    const normalized = formatPhone(phone);
    const db = c.get("db");
    const now = new Date();

    const [otpRecord] = await db
      .select()
      .from(otpTable)
      .where(
        and(
          eq(otpTable.phone, normalized),
          eq(otpTable.authenticationId, authenticationId),
          eq(otpTable.type, "login"),
          gt(otpTable.expiresAt, now),
        ),
      )
      .limit(1);

    if (!otpRecord) {
      return c.json({ status: "error", message: "OTP not found or expired" }, 404);
    }

    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      return c.json(
        { status: "error", message: "Maximum attempts exceeded. Please request a new OTP." },
        429,
      );
    }

    await db
      .update(otpTable)
      .set({ attempts: sql`${otpTable.attempts} + 1`, updatedAt: now })
      .where(eq(otpTable.id, otpRecord.id));

    const inputHash = await hashOTP(code);
    if (inputHash !== otpRecord.codeHash) {
      const remaining = otpRecord.maxAttempts - otpRecord.attempts - 1;
      return c.json(
        { status: "error", message: "Invalid OTP code", data: { remainingAttempts: remaining } },
        401,
      );
    }

    await db.delete(otpTable).where(eq(otpTable.id, otpRecord.id));

    const [existingUser] = await db.select().from(users).where(eq(users.phone, normalized)).limit(1);

    let user;
    if (existingUser) {
      await db.update(users).set({ isVerified: 1, updatedAt: now }).where(eq(users.phone, normalized));
      user = existingUser;
    } else {
      if (!otpRecord.nationalId) {
        return c.json({ status: "error", message: "National ID is required for registration" }, 400);
      }
      const [newUser] = await db.insert(users).values({
        phone: normalized,
        nationalId: otpRecord.nationalId,
        userType: otpRecord.userType,
        isVerified: 1,
        profileComplete: 0,
        isActive: 1,
      }).returning();
      user = newUser;
    }

    const env = c.get("env");
    const token = await signToken(
      { id: user.id, userType: user.userType as "student" | "teacher" | "school_manager" },
      env.JWT_SECRET,
      env.JWT_EXPIRES_IN ?? "30d",
    );

    return c.json({
      status: "success",
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          surname: user.surname,
          nationalId: user.nationalId,
          userType: user.userType,
          profileComplete: user.profileComplete,
          isVerified: user.isVerified,
        },
      },
    });
  })

  .post("/otp-status", async (c) => {
    const { phone } = await c.req.json<{ phone: string }>();
    if (!phone) return c.json({ status: "error", message: "Phone number is required" }, 400);

    const normalized = formatPhone(phone);
    const db = c.get("db");
    const now = new Date();

    const [activeOTP] = await db
      .select()
      .from(otpTable)
      .where(and(eq(otpTable.phone, normalized), eq(otpTable.type, "login"), gt(otpTable.expiresAt, now)))
      .orderBy(sql`${otpTable.createdAt} DESC`)
      .limit(1);

    if (!activeOTP) {
      return c.json({ status: "success", data: { hasActiveOTP: false, remainingSeconds: 0 } });
    }

    const remainingSeconds = Math.max(
      0,
      Math.floor((new Date(activeOTP.expiresAt).getTime() - now.getTime()) / 1000),
    );

    return c.json({
      status: "success",
      data: {
        hasActiveOTP: true,
        remainingSeconds,
        attempts: activeOTP.attempts,
        maxAttempts: activeOTP.maxAttempts,
      },
    });
  });
