import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const otp = pgTable(
  "otp",
  {
    id: serial().primaryKey(),
    phone: text().notNull(),
    type: text().notNull(),
    userType: text("user_type").notNull(),
    codeHash: text("code_hash").notNull(),
    authenticationId: text("authentication_id").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    attempts: integer().default(0).notNull(),
    maxAttempts: integer("max_attempts").default(3).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_otp_phone").on(table.phone),
    index("idx_otp_authentication_id").on(table.authenticationId),
    index("idx_otp_expires_at").on(table.expiresAt),
    index("idx_otp_type_user_type").on(table.type, table.userType),
  ],
);
