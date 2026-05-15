import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const admins = pgTable(
  "admins",
  {
    id: serial().primaryKey(),
    email: text().notNull().unique(),
    password: text().notNull(),
    name: text(),
    isActive: integer("is_active").default(1).notNull(),
    role: text().default("admin").notNull(),
    lastLogin: timestamp("last_login", { withTimezone: true }),
    loginAttempts: integer("login_attempts").default(0).notNull(),
    lockoutUntil: timestamp("lockout_until", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_admins_is_active").on(table.isActive),
    index("idx_admins_role").on(table.role),
    index("idx_admins_email").on(table.email),
  ],
);
