import "dotenv/config";
import { createDb, eq, schema } from "../src/index.js";
import { hashPassword } from "@smartiz/auth";

const { admins } = schema;

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const email = process.env.ADMIN_EMAIL || "admin@smartiz.app";
  const password = process.env.ADMIN_PASSWORD || "admin1234";
  const name = process.env.ADMIN_NAME || "Super Admin";

  const db = createDb(dbUrl);

  const [existing] = await db.select({ id: admins.id }).from(admins).where(eq(admins.email, email)).limit(1);
  if (existing) {
    console.log(`Admin "${email}" already exists (id: ${existing.id})`);
    process.exit(0);
  }

  const hashed = await hashPassword(password);
  const [admin] = await db.insert(admins).values({
    email,
    password: hashed,
    name,
    role: "super_admin",
  }).returning({ id: admins.id, email: admins.email });

  console.log(`Created super admin: ${admin.email} (id: ${admin.id})`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
