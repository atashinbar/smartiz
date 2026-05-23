# Project Scaffold Template

> **How to use**: Fill in the `{{PLACEHOLDER}}` values in the section below, then send this entire file to an LLM. The LLM will generate every file needed for a complete, runnable monorepo.

---

## LLM Instructions

You are a project scaffolding agent. Your task is to generate a **complete, runnable TypeScript monorepo** based on the specification below.

**Output format**: Produce every file in order, using this marker between files:

```
--- FILE: path/to/file ---
```

**Rules**:
1. Generate **every file** listed below. Do not skip or stub any file.
2. Replace all `{{PLACEHOLDER}}` values with the user-provided values from the section below.
3. Follow the coding conventions exactly (Section: Coding Conventions).
4. For feature flags (`{{INCLUDE_*}}`): if the flag is `"false"`, skip that file/section/dependency entirely.
5. Ensure all imports use `.js` extensions for ESM compatibility.
6. Ensure all workspace imports use the `@{{SCOPE}}/` prefix.
7. Do NOT add comments unless the WHY is non-obvious.

---

## Placeholder Values

Fill in these values before sending this prompt to an LLM:

| Placeholder | Default | Description |
|---|---|---|
| `{{PROJECT_NAME}}` | `myapp` | kebab-case project name |
| `{{SCOPE}}` | `myapp` | npm scope without @ (e.g., "myapp" → @myapp/db) |
| `{{PROJECT_TITLE}}` | `My App` | Human-readable title |
| `{{PROJECT_DESCRIPTION}}` | `My Application` | One-line description |
| `{{PORT_API}}` | `8585` | API server port |
| `{{PORT_WEB}}` | `9090` | Web app dev port |
| `{{PORT_ADMIN}}` | `9595` | Admin panel dev port |
| `{{PORT_PG}}` | `5433` | PostgreSQL exposed port |
| `{{DB_USER}}` | `myapp` | PostgreSQL user |
| `{{DB_PASSWORD}}` | `myapp` | PostgreSQL password |
| `{{DB_NAME}}` | `myapp` | PostgreSQL database name |
| `{{PRIMARY_COLOR}}` | `#1d4ed8` | Primary theme color (hex) |
| `{{THEME_COLOR}}` | `#6366f1` | PWA theme color (hex) |
| `{{FONT_FAMILY}}` | `Vazirmatn` | Web font family name |
| `{{FONT_URL}}` | `https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap` | Google Fonts URL |
| `{{LANGUAGE}}` | `fa` | HTML lang attribute |
| `{{DIRECTION}}` | `rtl` | Text direction: "rtl" or "ltr" |
| `{{INCLUDE_PWA}}` | `true` | Include PWA support in web app |
| `{{INCLUDE_TANSTACK}}` | `true` | Include TanStack Query |
| `{{INCLUDE_ZUSTAND}}` | `true` | Include Zustand state management |
| `{{INCLUDE_STORAGE_R2}}` | `true` | Include Cloudflare R2 adapter |
| `{{INCLUDE_STORAGE_S3}}` | `true` | Include AWS S3 adapter |
| `{{DEPLOY_TARGET}}` | `both` | "both" (Workers+Node), "node-only", or "workers-only" |

---

## Architecture Overview

```
{{PROJECT_NAME}}/
  apps/
    api/              # Hono API — dual entry: Workers (entry-workers.ts) + Node.js (entry-node.ts)
    web/              # React 19 web app (port {{PORT_WEB}})
    admin/            # React admin panel (port {{PORT_ADMIN}})
  packages/
    db/               # @{{SCOPE}}/db — Drizzle ORM + PostgreSQL schema
    auth/             # @{{SCOPE}}/auth — JWT + OTP provider interface + Hono middleware
    storage/          # @{{SCOPE}}/storage — File storage interface + adapters
    shared/           # @{{SCOPE}}/shared — Types, constants, env config
    ui/               # @{{SCOPE}}/ui — Shared React components
    eslint-config/    # @{{SCOPE}}/eslint-config
    typescript-config/ # @{{SCOPE}}/typescript-config
```

### Key Patterns

**Adapter/Interface Pattern**: Every external service goes through an interface. Switching providers = changing config, not code.

- **Database** (`@{{SCOPE}}/db`): `createDb(connectionString)` factory. Works with any PostgreSQL.
- **Storage** (`@{{SCOPE}}/storage`): `StorageProvider` interface with adapters (local, R2, S3). Switch via `STORAGE_PROVIDER` env var.
- **Auth** (`@{{SCOPE}}/auth`): `OTPProvider` interface with `send(phone, code)` method. JWT via `jose` library. Middleware: `protect`, `protectAdmin`, `protectSuperAdmin`.

**API Dual Deployment**: `createApp(env)` returns a Hono app (no server). Separate entry points for Node.js and Workers.

**Dependency Graph**:
```
shared ← auth, db, storage, api, web
db ← api
auth ← api
storage ← api
ui ← web, admin
api ← web (via proxy)
```

---

## Coding Conventions

- TypeScript strict mode enabled everywhere
- Use `export` not `export default` (except React components)
- File naming: kebab-case (`file-uploads.ts`, `education-levels.ts`)
- Import workspace packages with `@{{SCOPE}}/` prefix
- Add `.js` extension in imports for ESM compatibility (`"./schema/index.js"`)
- No comments unless the WHY is non-obvious
- No unnecessary abstractions — three similar lines is better than a premature one
- Always use `pnpm` for installing packages
- All config through environment variables, no hardcoded values
- Factory functions for all services: `createDb()`, `createStorage()`, `createApp()`

---

## Feature Flag Matrix

| Flag | Files Included | Dependencies Included |
|---|---|---|
| `INCLUDE_PWA` = true | web: vite.config (PWA plugin), pwa-provider, pwa-install-prompt, pwa-update-notification, offline-banner, vite-env.d.ts, pwa.d.ts | vite-plugin-pwa, workbox-window |
| `INCLUDE_TANSTACK` = true | web: lib/query-client, lib/api, main.tsx QueryClientProvider | @tanstack/react-query, @tanstack/react-query-devtools |
| `INCLUDE_ZUSTAND` = true | web: stores/auth, stores/network, lib/api | zustand |
| `INCLUDE_STORAGE_R2` = true | storage: adapters/r2.ts, index factory switch case | (already included via aws-sdk) |
| `INCLUDE_STORAGE_S3` = true | storage: adapters/s3.ts, index factory switch case | (already included via aws-sdk) |
| `DEPLOY_TARGET` != "node-only" | api: entry-workers.ts, wrangler.toml | wrangler |
| `DEPLOY_TARGET` != "workers-only" | api: entry-node.ts | @hono/node-server, tsx |

---

## File Templates

Generate all files below in order. Replace every `{{PLACEHOLDER}}` with the user-provided value.

---

### Root Configuration

--- FILE: package.json ---
```json
{
  "name": "{{PROJECT_NAME}}",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "preview": "turbo preview",
    "check-types": "turbo check-types",
    "db:generate": "pnpm --filter @{{SCOPE}}/db db:generate",
    "db:migrate": "pnpm --filter @{{SCOPE}}/db db:migrate",
    "db:studio": "pnpm --filter @{{SCOPE}}/db db:studio",
    "db:seed-admin": "pnpm --filter @{{SCOPE}}/db db:seed-admin",
    "docker:up": "docker compose up -d",
    "docker:down": "docker compose down",
    "docker:reset": "docker compose down -v && docker compose up -d",
    "prepare": "husky"
  },
  "devDependencies": {
    "husky": "^9.1.7",
    "lint-staged": "^17.0.4",
    "turbo": "^2",
    "typescript": "^5"
  },
  "packageManager": "pnpm@11.1.2"
}
```

--- FILE: pnpm-workspace.yaml ---
```yaml
packages:
  - "apps/*"
  - "packages/*"
allowBuilds:
  esbuild: true
  sharp: true
  workerd: true
onlyBuiltDependencies:
  - esbuild
```

--- FILE: turbo.json ---
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "check-types": {
      "dependsOn": ["^check-types"]
    },
    "preview": {
      "dependsOn": ["build"],
      "cache": false,
      "persistent": true
    }
  }
}
```

--- FILE: docker-compose.yml ---
```yaml
services:
  postgres:
    image: postgres:16
    container_name: {{PROJECT_NAME}}-postgres
    restart: unless-stopped
    ports:
      - "{{PORT_PG}}:5432"
    environment:
      POSTGRES_USER: {{DB_USER}}
      POSTGRES_PASSWORD: {{DB_PASSWORD}}
      POSTGRES_DB: {{DB_NAME}}
    volumes:
      - {{PROJECT_NAME}}-pgdata:/var/lib/postgresql/data

volumes:
  {{PROJECT_NAME}}-pgdata:
```

--- FILE: .env.example ---
```bash
# Application
NODE_ENV=development
API_PORT={{PORT_API}}
CORS_ORIGINS=http://localhost:{{PORT_WEB}},http://localhost:{{PORT_ADMIN}}
JWT_SECRET=change-this-to-a-secure-random-string

# Database
DATABASE_URL=postgresql://{{DB_USER}}:{{DB_PASSWORD}}@localhost:{{PORT_PG}}/{{DB_NAME}}

# Storage
STORAGE_PROVIDER=local
LOCAL_STORAGE_PATH=./uploads

# Auth / OTP
OTP_PROVIDER=mock
```

--- FILE: .gitignore ---
```
node_modules/
dist/
*.tsbuildinfo
.turbo/
.env
.env.local
.env.*.local
.vscode/
.idea/
.DS_Store
Thumbs.db
*.log
npm-debug.log*
pnpm-debug.log*
coverage/
```

---

### packages/typescript-config

--- FILE: packages/typescript-config/package.json ---
```json
{
  "name": "@{{SCOPE}}/typescript-config",
  "version": "0.0.0",
  "private": true,
  "license": "UNLICENSED",
  "files": ["base.json"]
}
```

--- FILE: packages/typescript-config/base.json ---
```json
{
  "$schema": "https://www.typescriptlang.org/dts/schema",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "exclude": ["node_modules", "dist"]
}
```

---

### packages/eslint-config

--- FILE: packages/eslint-config/package.json ---
```json
{
  "name": "@{{SCOPE}}/eslint-config",
  "version": "0.0.0",
  "private": true,
  "license": "UNLICENSED",
  "main": "index.js",
  "devDependencies": {
    "eslint": "^9"
  }
}
```

--- FILE: packages/eslint-config/index.js ---
```javascript
import js from "@eslint/js";

export default [
  {
    ignores: ["**/dist/**", "**/node_modules/**"],
  },
  js.configs.recommended,
];
```

---

### packages/shared

--- FILE: packages/shared/package.json ---
```json
{
  "name": "@{{SCOPE}}/shared",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "scripts": {
    "build": "tsc",
    "check-types": "tsc --noEmit",
    "dev": "tsc --watch"
  },
  "dependencies": { "zod": "^3" },
  "devDependencies": {
    "@{{SCOPE}}/typescript-config": "workspace:*",
    "typescript": "^5"
  }
}
```

--- FILE: packages/shared/tsconfig.json ---
```json
{
  "extends": "@{{SCOPE}}/typescript-config/base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src" },
  "include": ["src"]
}
```

--- FILE: packages/shared/src/types/env.ts ---
```typescript
export interface EnvConfig {
  // Database
  DATABASE_URL: string;

  // Storage
  STORAGE_PROVIDER: "local" | "r2" | "s3";
  LOCAL_STORAGE_PATH?: string;
  R2_ACCOUNT_ID?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_BUCKET_NAME?: string;
  R2_PUBLIC_URL?: string;
  S3_ENDPOINT?: string;
  S3_ACCESS_KEY_ID?: string;
  S3_SECRET_ACCESS_KEY?: string;
  S3_BUCKET_NAME?: string;
  S3_REGION?: string;

  // Auth
  JWT_SECRET: string;
  JWT_EXPIRES_IN?: string;
  OTP_PROVIDER: "mock";
  // Add more OTP providers here as needed

  // App
  NODE_ENV: "development" | "production";
  CORS_ORIGINS: string;
  API_PORT?: string;
}
```

--- FILE: packages/shared/src/types/api.ts ---
```typescript
export interface ApiResponse<T = unknown> {
  status: "success" | "error";
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

--- FILE: packages/shared/src/types/user.ts ---
```typescript
export type UserType = "student" | "teacher" | "school_manager";
export type AdminRole = "admin" | "super_admin";
```

--- FILE: packages/shared/src/index.ts ---
```typescript
export type { EnvConfig } from "./types/env.js";
export type { ApiResponse, PaginatedResponse } from "./types/api.js";
export type { UserType, AdminRole } from "./types/user.js";
```

---

### packages/db

--- FILE: packages/db/package.json ---
```json
{
  "name": "@{{SCOPE}}/db",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "scripts": {
    "build": "tsc",
    "check-types": "tsc --noEmit",
    "dev": "tsc --watch",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:seed-admin": "tsx scripts/seed-admin.ts"
  },
  "dependencies": {
    "@{{SCOPE}}/auth": "workspace:*",
    "dotenv": "^16",
    "drizzle-orm": "^0.41.0",
    "postgres": "^3"
  },
  "devDependencies": {
    "@{{SCOPE}}/typescript-config": "workspace:*",
    "drizzle-kit": "^0.30.0",
    "tsx": "^4.21.0",
    "typescript": "^5"
  }
}
```

--- FILE: packages/db/tsconfig.json ---
```json
{
  "extends": "@{{SCOPE}}/typescript-config/base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src" },
  "include": ["src"]
}
```

--- FILE: packages/db/drizzle.config.ts ---
```typescript
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: "../../apps/api/.env" });

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

--- FILE: packages/db/src/connection.ts ---
```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

export function createDb(connectionString: string) {
  const client = postgres(connectionString);
  return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDb>;
```

--- FILE: packages/db/src/schema/users.ts ---
```typescript
import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  date,
  timestamp,
  index,
  foreignKey,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: serial().primaryKey(),
    phone: text().notNull().unique(),
    name: text(),
    surname: text(),
    email: text(),
    userType: text("user_type").default("student").notNull(),
    isActive: integer("is_active").default(1).notNull(),
    imageUrl: text("image_url"),
    isVerified: integer("is_verified").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_users_is_active").on(table.isActive),
    index("idx_users_user_type").on(table.userType),
    index("idx_users_email").on(table.email),
    index("idx_users_phone").on(table.phone),
  ],
);
```

--- FILE: packages/db/src/schema/admins.ts ---
```typescript
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
```

--- FILE: packages/db/src/schema/index.ts ---
```typescript
export { users } from "./users.js";
export { admins } from "./admins.js";
```

--- FILE: packages/db/src/index.ts ---
```typescript
export { createDb, type Database } from "./connection.js";
export { sql, eq } from "drizzle-orm";
export * as schema from "./schema/index.js";
```

--- FILE: packages/db/scripts/seed-admin.ts ---
```typescript
import "dotenv/config";
import { createDb, eq, schema } from "../src/index.js";
import { hashPassword } from "@{{SCOPE}}/auth";

const { admins } = schema;

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const email = process.env.ADMIN_EMAIL || "admin@{{PROJECT_NAME}}.app";
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
```

---

### packages/auth

--- FILE: packages/auth/package.json ---
```json
{
  "name": "@{{SCOPE}}/auth",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "scripts": {
    "build": "tsc",
    "check-types": "tsc --noEmit",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@{{SCOPE}}/shared": "workspace:*",
    "jose": "^6"
  },
  "peerDependencies": { "hono": "^4" },
  "devDependencies": {
    "@{{SCOPE}}/typescript-config": "workspace:*",
    "hono": "^4",
    "typescript": "^5"
  }
}
```

--- FILE: packages/auth/tsconfig.json ---
```json
{
  "extends": "@{{SCOPE}}/typescript-config/base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src" },
  "include": ["src"]
}
```

--- FILE: packages/auth/src/types.ts ---
```typescript
export interface OTPProvider {
  send(phone: string, code: string): Promise<boolean>;
}
```

--- FILE: packages/auth/src/jwt.ts ---
```typescript
import { SignJWT, jwtVerify } from "jose";
import type { UserType, AdminRole } from "@{{SCOPE}}/shared";

export interface TokenPayload {
  id: number;
  userType: UserType | AdminRole;
}

export async function signToken(payload: TokenPayload, secret: string, expiresIn = "30d"): Promise<string> {
  const key = new TextEncoder().encode(secret);
  return new SignJWT({ id: payload.id, userType: payload.userType })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(key);
}

export async function verifyToken(token: string, secret: string): Promise<TokenPayload> {
  const key = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, key);
  return {
    id: payload.id as number,
    userType: payload.userType as UserType | AdminRole,
  };
}
```

--- FILE: packages/auth/src/middleware.ts ---
```typescript
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
```

--- FILE: packages/auth/src/otp/mock.ts ---
```typescript
import type { OTPProvider } from "../types.js";

export class MockOTPProvider implements OTPProvider {
  async send(phone: string, code: string): Promise<boolean> {
    console.log(`[MockOTP] Sending code ${code} to ${phone}`);
    return true;
  }
}
```

--- FILE: packages/auth/src/index.ts ---
```typescript
export { signToken, verifyToken, type TokenPayload } from "./jwt.js";
export { protect, protectAdmin, protectSuperAdmin } from "./middleware.js";
export { hashPassword, verifyPassword } from "./password.js";
export type { OTPProvider } from "./types.js";
export { MockOTPProvider } from "./otp/mock.js";
```

--- FILE: packages/auth/src/password.ts ---
```typescript
const ITERATIONS = 100_000;
const HASH_LENGTH = 64;
const SALT_LENGTH = 32;

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function deriveKey(password: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    HASH_LENGTH * 8
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const hash = await deriveKey(password, salt);
  return `${toHex(salt.buffer as ArrayBuffer)}:${toHex(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, expectedHashHex] = stored.split(":");
  if (!saltHex || !expectedHashHex) return false;

  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)));
  const hash = await deriveKey(password, salt);
  const hashHex = toHex(hash);

  if (hashHex.length !== expectedHashHex.length) return false;
  let result = 0;
  for (let i = 0; i < hashHex.length; i++) {
    result |= hashHex.charCodeAt(i) ^ expectedHashHex.charCodeAt(i);
  }
  return result === 0;
}
```

---

### packages/storage

--- FILE: packages/storage/package.json ---
```json
{
  "name": "@{{SCOPE}}/storage",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": { ".": "./src/index.ts" },
  "scripts": {
    "build": "tsc",
    "check-types": "tsc --noEmit",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3",
    "@aws-sdk/s3-request-presigner": "^3"
  },
  "devDependencies": {
    "@{{SCOPE}}/typescript-config": "workspace:*",
    "@types/node": "^22",
    "typescript": "^5"
  }
}
```

--- FILE: packages/storage/tsconfig.json ---
```json
{
  "extends": "@{{SCOPE}}/typescript-config/base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src" },
  "include": ["src"]
}
```

--- FILE: packages/storage/src/types.ts ---
```typescript
export interface FileInfo {
  key: string;
  size: number;
  contentType: string;
  filename: string;
  url: string;
  createdAt: Date;
}

export interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  path?: string;
}

export interface StorageProvider {
  upload(key: string, data: Buffer | ArrayBuffer, options?: UploadOptions): Promise<FileInfo>;
  get(key: string): Promise<ArrayBuffer | null>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  list(prefix: string, limit?: number): Promise<FileInfo[]>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
}

export interface LocalStorageConfig {
  path: string;
  publicUrl?: string;
}

export interface R2StorageConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string;
}

export interface S3StorageConfig {
  endpoint?: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region?: string;
  publicUrl?: string;
}

export type StorageConfig =
  | { provider: "local"; local: LocalStorageConfig }
  | { provider: "r2"; r2: R2StorageConfig }
  | { provider: "s3"; s3: S3StorageConfig };
```

--- FILE: packages/storage/src/adapters/local.ts ---
```typescript
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, unlinkSync } from "node:fs";
import { join, sep } from "node:path";
import type { FileInfo, StorageProvider, UploadOptions, LocalStorageConfig } from "../types.js";

export class LocalStorageAdapter implements StorageProvider {
  private basePath: string;
  private publicUrl: string;

  constructor(config: LocalStorageConfig) {
    this.basePath = config.path;
    this.publicUrl = config.publicUrl || "/uploads";
    if (!existsSync(this.basePath)) {
      mkdirSync(this.basePath, { recursive: true });
    }
  }

  async upload(key: string, data: Buffer | ArrayBuffer, options?: UploadOptions): Promise<FileInfo> {
    const fullPath = join(this.basePath, key);
    const dir = fullPath.substring(0, fullPath.lastIndexOf(sep));
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const buffer = data instanceof ArrayBuffer ? Buffer.from(data) : data;
    writeFileSync(fullPath, buffer);
    return {
      key,
      size: buffer.length,
      contentType: options?.contentType || "application/octet-stream",
      filename: key.split("/").pop() || key,
      url: `${this.publicUrl}/${key}`,
      createdAt: new Date(),
    };
  }

  async get(key: string): Promise<ArrayBuffer | null> {
    const fullPath = join(this.basePath, key);
    if (!existsSync(fullPath)) return null;
    const buffer = readFileSync(fullPath);
    return buffer.buffer;
  }

  async delete(key: string): Promise<boolean> {
    const fullPath = join(this.basePath, key);
    if (!existsSync(fullPath)) return false;
    unlinkSync(fullPath);
    return true;
  }

  async exists(key: string): Promise<boolean> {
    return existsSync(join(this.basePath, key));
  }

  async list(prefix: string, limit = 100): Promise<FileInfo[]> {
    const dir = join(this.basePath, prefix);
    if (!existsSync(dir)) return [];
    const files: FileInfo[] = [];
    this.walkDir(dir, prefix, files, limit);
    return files;
  }

  async getSignedUrl(_key: string, _expiresIn?: number): Promise<string> {
    throw new Error("Signed URLs not supported for local storage");
  }

  private walkDir(dir: string, prefix: string, files: FileInfo[], limit: number) {
    if (files.length >= limit) return;
    for (const entry of readdirSync(dir)) {
      if (files.length >= limit) break;
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        this.walkDir(fullPath, `${prefix}/${entry}`, files, limit);
      } else {
        files.push({
          key: `${prefix}/${entry}`,
          size: stat.size,
          contentType: "application/octet-stream",
          filename: entry,
          url: `${this.publicUrl}/${prefix}/${entry}`,
          createdAt: stat.mtime,
        });
      }
    }
  }
}
```

--- FILE: packages/storage/src/adapters/r2.ts ---
*(Only include this file if INCLUDE_STORAGE_R2 = "true")*

```typescript
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { FileInfo, StorageProvider, UploadOptions, R2StorageConfig } from "../types.js";

export class R2StorageAdapter implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(config: R2StorageConfig) {
    this.bucket = config.bucketName;
    this.publicUrl = config.publicUrl || "";
    this.client = new S3Client({
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      region: "auto",
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async upload(key: string, data: Buffer | ArrayBuffer, options?: UploadOptions): Promise<FileInfo> {
    const buffer = data instanceof ArrayBuffer ? Buffer.from(data) : data;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: options?.contentType,
        Metadata: options?.metadata,
      }),
    );
    return {
      key,
      size: buffer.length,
      contentType: options?.contentType || "application/octet-stream",
      filename: key.split("/").pop() || key,
      url: this.publicUrl ? `${this.publicUrl}/${key}` : key,
      createdAt: new Date(),
    };
  }

  async get(key: string): Promise<ArrayBuffer | null> {
    try {
      const result = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      if (!result.Body) return null;
      return await result.Body.transformToByteArray().then((arr) => arr.buffer as ArrayBuffer);
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }

  async list(prefix: string, limit = 100): Promise<FileInfo[]> {
    const result = await this.client.send(
      new ListObjectsV2Command({ Bucket: this.bucket, Prefix: prefix, MaxKeys: limit }),
    );
    return (result.Contents || []).map((obj) => ({
      key: obj.Key!,
      size: obj.Size || 0,
      contentType: "application/octet-stream",
      filename: obj.Key!.split("/").pop() || obj.Key!,
      url: this.publicUrl ? `${this.publicUrl}/${obj.Key}` : obj.Key!,
      createdAt: obj.LastModified || new Date(),
    }));
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn },
    );
  }
}
```

--- FILE: packages/storage/src/adapters/s3.ts ---
*(Only include this file if INCLUDE_STORAGE_S3 = "true")*

```typescript
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { FileInfo, StorageProvider, UploadOptions, S3StorageConfig } from "../types.js";

export class S3StorageAdapter implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(config: S3StorageConfig) {
    this.bucket = config.bucketName;
    this.publicUrl = config.publicUrl || "";
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: config.region || "us-east-1",
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async upload(key: string, data: Buffer | ArrayBuffer, options?: UploadOptions): Promise<FileInfo> {
    const buffer = data instanceof ArrayBuffer ? Buffer.from(data) : data;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: options?.contentType,
        Metadata: options?.metadata,
      }),
    );
    return {
      key,
      size: buffer.length,
      contentType: options?.contentType || "application/octet-stream",
      filename: key.split("/").pop() || key,
      url: this.publicUrl ? `${this.publicUrl}/${key}` : key,
      createdAt: new Date(),
    };
  }

  async get(key: string): Promise<ArrayBuffer | null> {
    try {
      const result = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      if (!result.Body) return null;
      return await result.Body.transformToByteArray().then((arr) => arr.buffer as ArrayBuffer);
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }

  async list(prefix: string, limit = 100): Promise<FileInfo[]> {
    const result = await this.client.send(
      new ListObjectsV2Command({ Bucket: this.bucket, Prefix: prefix, MaxKeys: limit }),
    );
    return (result.Contents || []).map((obj) => ({
      key: obj.Key!,
      size: obj.Size || 0,
      contentType: "application/octet-stream",
      filename: obj.Key!.split("/").pop() || obj.Key!,
      url: this.publicUrl ? `${this.publicUrl}/${obj.Key}` : obj.Key!,
      createdAt: obj.LastModified || new Date(),
    }));
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn },
    );
  }
}
```

--- FILE: packages/storage/src/index.ts ---
```typescript
import type { StorageConfig, StorageProvider } from "./types.js";
import { LocalStorageAdapter } from "./adapters/local.js";
// Only include the following imports if the corresponding flag is "true":
// import { R2StorageAdapter } from "./adapters/r2.js";
// import { S3StorageAdapter } from "./adapters/s3.js";

export type { StorageProvider, FileInfo, UploadOptions, StorageConfig, LocalStorageConfig, R2StorageConfig, S3StorageConfig } from "./types.js";
export { LocalStorageAdapter } from "./adapters/local.js";
// export { R2StorageAdapter } from "./adapters/r2.js";   // if INCLUDE_STORAGE_R2 = true
// export { S3StorageAdapter } from "./adapters/s3.js";   // if INCLUDE_STORAGE_S3 = true

export function createStorage(config: StorageConfig): StorageProvider {
  switch (config.provider) {
    case "local":
      return new LocalStorageAdapter(config.local);
    // case "r2":                                         // if INCLUDE_STORAGE_R2 = true
    //   return new R2StorageAdapter(config.r2);
    // case "s3":                                         // if INCLUDE_STORAGE_S3 = true
    //   return new S3StorageAdapter(config.s3);
    default:
      throw new Error(`Unknown storage provider: ${(config as StorageConfig).provider}`);
  }
}
```

*(Note to LLM: Uncomment the R2/S3 cases and imports if the corresponding INCLUDE flag is "true")*

---

### packages/ui

--- FILE: packages/ui/package.json ---
```json
{
  "name": "@{{SCOPE}}/ui",
  "version": "0.0.0",
  "private": true,
  "license": "UNLICENSED",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./styles.css": "./src/styles.css"
  },
  "scripts": {
    "build": "tsc",
    "check-types": "tsc --noEmit",
    "dev": "tsc --watch"
  },
  "dependencies": {
    "@radix-ui/react-slot": "^1",
    "class-variance-authority": "^0.7",
    "clsx": "^2",
    "tailwind-merge": "^3"
  },
  "devDependencies": {
    "@{{SCOPE}}/typescript-config": "workspace:*",
    "@types/react": "^19",
    "react": "^19",
    "tailwindcss": "^4",
    "typescript": "^5"
  },
  "peerDependencies": { "react": "^19" }
}
```

--- FILE: packages/ui/tsconfig.json ---
```json
{
  "extends": "@{{SCOPE}}/typescript-config/base.json",
  "compilerOptions": { "jsx": "react-jsx", "outDir": "dist", "rootDir": "src" },
  "include": ["src"]
}
```

--- FILE: packages/ui/src/lib/utils.ts ---
```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

--- FILE: packages/ui/src/styles.css ---
```css
@import "tailwindcss";

@theme {
  --color-background: #ffffff;
  --color-foreground: #0a0a0a;
  --color-primary: {{PRIMARY_COLOR}};
  --color-primary-foreground: #ffffff;
  --color-secondary: #f1f5f9;
  --color-secondary-foreground: #0f172a;
  --color-muted: #f1f5f9;
  --color-muted-foreground: #64748b;
  --color-accent: #f1f5f9;
  --color-accent-foreground: #0f172a;
  --color-destructive: #ef4444;
  --color-destructive-foreground: #ffffff;
  --color-border: #e2e8f0;
  --color-input: #e2e8f0;
  --color-ring: {{PRIMARY_COLOR}};
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
}
```

--- FILE: packages/ui/src/button.tsx ---
```typescript
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

--- FILE: packages/ui/src/index.ts ---
```typescript
export { Button, buttonVariants } from "./button";
export type { ButtonProps } from "./button";
```

---

### apps/api

--- FILE: apps/api/package.json ---
```json
{
  "name": "@{{SCOPE}}/api",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "check-types": "tsc --noEmit",
    "dev": "tsx watch src/entry-node.ts",
    "dev:workers": "wrangler dev",
    "build": "tsc",
    "preview": "node dist/entry-node.js",
    "deploy": "wrangler deploy"
  },
  "dependencies": {
    "@hono/node-server": "^1",
    "@{{SCOPE}}/auth": "workspace:*",
    "@{{SCOPE}}/db": "workspace:*",
    "@{{SCOPE}}/shared": "workspace:*",
    "@{{SCOPE}}/storage": "workspace:*",
    "dotenv": "^16",
    "hono": "^4"
  },
  "devDependencies": {
    "@{{SCOPE}}/typescript-config": "workspace:*",
    "@types/node": "^22",
    "tsx": "^4",
    "typescript": "^5",
    "wrangler": "^4"
  }
}
```

*(Note to LLM: Remove `wrangler` from devDependencies and the `"dev:workers"` and `"deploy"` scripts if DEPLOY_TARGET = "node-only". Remove `@hono/node-server` from dependencies and `"dev"` script if DEPLOY_TARGET = "workers-only".)*

--- FILE: apps/api/tsconfig.json ---
```json
{
  "extends": "@{{SCOPE}}/typescript-config/base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src" },
  "include": ["src"]
}
```

--- FILE: apps/api/wrangler.toml ---
*(Only include this file if DEPLOY_TARGET is "both" or "workers-only")*

```toml
name = "{{PROJECT_NAME}}-api"
main = "src/entry-workers.ts"
compatibility_date = "2026-05-01"
compatibility_flags = ["nodejs_compat"]

[vars]
STORAGE_PROVIDER = "r2"
OTP_PROVIDER = "mock"
NODE_ENV = "production"
CORS_ORIGINS = "*"

# Uncomment and configure after creating a Hyperdrive config:
# [[hyperdrive]]
# binding = "HYPERDRIVE"
# id = "<your-hyperdrive-id>"
```

--- FILE: apps/api/src/lib/env.ts ---
```typescript
import { config } from "dotenv";
import type { EnvConfig } from "@{{SCOPE}}/shared";

config();

export function loadEnv(): EnvConfig {
  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    STORAGE_PROVIDER: (process.env.STORAGE_PROVIDER as EnvConfig["STORAGE_PROVIDER"]) || "local",
    LOCAL_STORAGE_PATH: process.env.LOCAL_STORAGE_PATH || "./uploads",
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    S3_REGION: process.env.S3_REGION,
    JWT_SECRET: process.env.JWT_SECRET || "dev-secret-change-me",
    OTP_PROVIDER: (process.env.OTP_PROVIDER as EnvConfig["OTP_PROVIDER"]) || "mock",
    NODE_ENV: (process.env.NODE_ENV as EnvConfig["NODE_ENV"]) || "development",
    CORS_ORIGINS: process.env.CORS_ORIGINS || "http://localhost:{{PORT_WEB}},http://localhost:{{PORT_ADMIN}}",
    API_PORT: process.env.API_PORT || "{{PORT_API}}",
  };
}
```

--- FILE: apps/api/src/middleware/env.ts ---
```typescript
import type { MiddlewareHandler } from "hono";
import type { EnvConfig } from "@{{SCOPE}}/shared";
import type { Database } from "@{{SCOPE}}/db";
import type { StorageProvider } from "@{{SCOPE}}/storage";
import type { TokenPayload } from "@{{SCOPE}}/auth";
import { createDb } from "@{{SCOPE}}/db";
import { createStorage } from "@{{SCOPE}}/storage";

export interface AppVariables {
  env: EnvConfig;
  db: Database;
  storage: StorageProvider;
  user: TokenPayload;
}

export function createEnvMiddleware(env: EnvConfig): MiddlewareHandler {
  const db = createDb(env.DATABASE_URL);
  const storage = createStorage(mapStorageConfig(env));

  return async (c, next) => {
    c.set("env", env);
    c.set("db", db);
    c.set("storage", storage);
    await next();
  };
}

function mapStorageConfig(env: EnvConfig) {
  switch (env.STORAGE_PROVIDER) {
    case "local":
      return {
        provider: "local" as const,
        local: { path: env.LOCAL_STORAGE_PATH || "./uploads" },
      };
    case "r2":
      return {
        provider: "r2" as const,
        r2: {
          accountId: env.R2_ACCOUNT_ID!,
          accessKeyId: env.R2_ACCESS_KEY_ID!,
          secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
          bucketName: env.R2_BUCKET_NAME!,
          publicUrl: env.R2_PUBLIC_URL,
        },
      };
    case "s3":
      return {
        provider: "s3" as const,
        s3: {
          endpoint: env.S3_ENDPOINT,
          accessKeyId: env.S3_ACCESS_KEY_ID!,
          secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
          bucketName: env.S3_BUCKET_NAME!,
          region: env.S3_REGION,
          publicUrl: env.S3_PUBLIC_URL,
        },
      };
  }
}
```

--- FILE: apps/api/src/middleware/error.ts ---
```typescript
import type { ErrorHandler } from "hono";

export const errorHandler: ErrorHandler = (err, c) => {
  console.error("Unhandled error:", err);
  return c.json(
    { status: "error", message: "Internal server error" },
    500,
  );
};
```

--- FILE: apps/api/src/routes/health.ts ---
```typescript
import { Hono } from "hono";
import type { AppVariables } from "../middleware/env.js";
import { sql } from "@{{SCOPE}}/db";

const healthRoutes = new Hono<{ Variables: AppVariables }>();

interface ServiceStatus {
  status: "healthy" | "unhealthy";
  latencyMs?: number;
  message?: string;
}

interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  services: {
    api: ServiceStatus;
    database: ServiceStatus;
    storage: ServiceStatus;
  };
}

healthRoutes.get("/health", async (c) => {
  const start = performance.now();
  const db = c.get("db");
  const storage = c.get("storage");
  const env = c.get("env");

  const services: HealthResponse["services"] = {
    api: { status: "healthy" },
    database: { status: "unhealthy", message: "Not checked" },
    storage: { status: "unhealthy", message: "Not checked" },
  };

  try {
    const dbStart = performance.now();
    await db.execute(sql`SELECT 1`);
    services.database = {
      status: "healthy",
      latencyMs: Math.round(performance.now() - dbStart),
      message: "PostgreSQL connected",
    };
  } catch (err) {
    services.database = {
      status: "unhealthy",
      message: err instanceof Error ? err.message : "Database connection failed",
    };
  }

  try {
    const storageStart = performance.now();
    await storage.list("__health_check__", 1);
    services.storage = {
      status: "healthy",
      latencyMs: Math.round(performance.now() - storageStart),
      message: `${env.STORAGE_PROVIDER} adapter ready`,
    };
  } catch (err) {
    services.storage = {
      status: "unhealthy",
      message: err instanceof Error ? err.message : "Storage check failed",
    };
  }

  const allHealthy = Object.values(services).every((s) => s.status === "healthy");
  const anyHealthy = Object.values(services).some((s) => s.status === "healthy");

  const response: HealthResponse = {
    status: allHealthy ? "healthy" : anyHealthy ? "degraded" : "unhealthy",
    timestamp: new Date().toISOString(),
    uptime: Math.round(performance.now() - start),
    services,
  };

  const httpStatus = allHealthy ? 200 : anyHealthy ? 207 : 503;
  return c.json(response, httpStatus);
});

export { healthRoutes };
```

--- FILE: apps/api/src/index.ts ---
```typescript
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { EnvConfig } from "@{{SCOPE}}/shared";
import type { AppVariables } from "./middleware/env.js";
import { createEnvMiddleware } from "./middleware/env.js";
import { errorHandler } from "./middleware/error.js";
import { healthRoutes } from "./routes/health.js";
import { adminAuthRoutes } from "./routes/admin-auth.js";
import { adminManageRoutes } from "./routes/admin-manage.js";

export function createApp(env: EnvConfig) {
  const app = new Hono<{ Variables: AppVariables }>();

  app.use("*", logger());
  app.use("*", cors({ origin: env.CORS_ORIGINS.split(","), allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"] }));
  app.use("*", createEnvMiddleware(env));

  app.route("/api", healthRoutes);
  app.route("/api/admin", adminAuthRoutes);
  app.route("/api/admin/admins", adminManageRoutes);

  app.onError(errorHandler);

  return app;
}
```

--- FILE: apps/api/src/routes/admin-auth.ts ---
```typescript
import { Hono } from "hono";
import { eq, schema } from "@{{SCOPE}}/db";
import { signToken, verifyPassword, protectAdmin } from "@{{SCOPE}}/auth";
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
```

--- FILE: apps/api/src/routes/admin-manage.ts ---
```typescript
import { Hono } from "hono";
import { eq, schema } from "@{{SCOPE}}/db";
import { hashPassword, protectAdmin, protectSuperAdmin } from "@{{SCOPE}}/auth";
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
```

--- FILE: apps/api/src/entry-node.ts ---
*(Only include this file if DEPLOY_TARGET is "both" or "node-only")*

```typescript
import { serve } from "@hono/node-server";
import { createApp } from "./index.js";
import { loadEnv } from "./lib/env.js";

const env = loadEnv();
const app = createApp(env);

serve({ fetch: app.fetch, port: Number(env.API_PORT) || {{PORT_API}} }, (info) => {
  console.log(`API server running at http://localhost:${info.port}`);
});
```

--- FILE: apps/api/src/entry-workers.ts ---
*(Only include this file if DEPLOY_TARGET is "both" or "workers-only")*

```typescript
import { createApp } from "./index.js";

let app: ReturnType<typeof createApp>;

export default {
  fetch(request: Request, env: Record<string, string>) {
    if (!app) {
      app = createApp({
        DATABASE_URL: (env as any).HYPERDRIVE?.connectionString || env.DATABASE_URL,
        STORAGE_PROVIDER: (env.STORAGE_PROVIDER as "local" | "r2" | "s3") || "r2",
        R2_ACCOUNT_ID: env.R2_ACCOUNT_ID,
        R2_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID,
        R2_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY,
        R2_BUCKET_NAME: env.R2_BUCKET_NAME,
        R2_PUBLIC_URL: env.R2_PUBLIC_URL,
        JWT_SECRET: env.JWT_SECRET,
        OTP_PROVIDER: (env.OTP_PROVIDER as "mock") || "mock",
        NODE_ENV: (env.NODE_ENV as "development" | "production") || "production",
        CORS_ORIGINS: env.CORS_ORIGINS || "*",
      });
    }
    return app.fetch(request, env);
  },
};
```

---

### apps/web

--- FILE: apps/web/package.json ---
```json
{
  "name": "@{{SCOPE}}/web",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "check-types": "tsc --noEmit",
    "dev": "vite --port {{PORT_WEB}}",
    "build": "tsc -b && vite build",
    "preview": "vite preview --port {{PORT_WEB}}"
  },
  "dependencies": {
    "@{{SCOPE}}/shared": "workspace:*",
    "@{{SCOPE}}/ui": "workspace:*",
    "react": "^19",
    "react-dom": "^19",
    "react-router-dom": "^7.15.1"
  },
  "devDependencies": {
    "@{{SCOPE}}/typescript-config": "workspace:*",
    "@tailwindcss/postcss": "^4.3.0",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^4",
    "autoprefixer": "^10",
    "postcss": "^8",
    "tailwindcss": "^4",
    "typescript": "^5",
    "vite": "^6"
  }
}
```

*(Note to LLM: If INCLUDE_TANSTACK = "true", add to dependencies: `"@tanstack/react-query": "^5.100.10"` and to devDependencies: `"@tanstack/react-query-devtools": "^5.100.10"`. If INCLUDE_ZUSTAND = "true", add to dependencies: `"zustand": "^5.0.13"`. If INCLUDE_PWA = "true", add to devDependencies: `"vite-plugin-pwa": "^1.3.0", "workbox-window": "^7.4.1"`.)*

--- FILE: apps/web/tsconfig.json ---
```json
{
  "extends": "@{{SCOPE}}/typescript-config/base.json",
  "compilerOptions": { "jsx": "react-jsx", "outDir": "dist", "rootDir": "src", "noEmit": true },
  "include": ["src"]
}
```

--- FILE: apps/web/vite.config.ts ---
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// If INCLUDE_PWA = "true":
// import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    // If INCLUDE_PWA = "true", add VitePWA plugin here with manifest and workbox config
  ],
  server: {
    port: {{PORT_WEB}},
    proxy: {
      "/api": { target: "http://localhost:{{PORT_API}}", changeOrigin: true },
    },
  },
  preview: { port: {{PORT_WEB}} },
});
```

*(Note to LLM: If INCLUDE_PWA = "true", include the full VitePWA plugin config with manifest, workbox globPatterns, and runtimeCaching for API and fonts. The manifest should use {{PROJECT_TITLE}}, {{THEME_COLOR}}, {{LANGUAGE}}, {{DIRECTION}}, {{SCOPE}} values.)*

--- FILE: apps/web/postcss.config.js ---
```javascript
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

--- FILE: apps/web/index.html ---
```html
<!DOCTYPE html>
<html lang="{{LANGUAGE}}" dir="{{DIRECTION}}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>{{PROJECT_TITLE}}</title>
    <meta name="description" content="{{PROJECT_DESCRIPTION}}" />
    <meta name="theme-color" content="{{THEME_COLOR}}" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="{{PROJECT_TITLE}}" />
    <link rel="icon" type="image/png" href="/icons/icon-192.png" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="{{FONT_URL}}" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

--- FILE: apps/web/src/vite-env.d.ts ---
```typescript
/// <reference types="vite/client" />
// If INCLUDE_PWA = "true", also add:
// /// <reference types="vite-plugin-pwa/react" />
```

--- FILE: apps/web/src/types/pwa.d.ts ---
*(Only include if INCLUDE_PWA = "true")*

```typescript
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
```

--- FILE: apps/web/src/index.css ---
```css
@import "tailwindcss";
@import "@{{SCOPE}}/ui/styles.css";

@theme {
  --font-sans: "{{FONT_FAMILY}}", system-ui, sans-serif;
}
```

--- FILE: apps/web/src/lib/query-client.ts ---
*(Only include if INCLUDE_TANSTACK = "true")*

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

--- FILE: apps/web/src/lib/api.ts ---
*(Only include if INCLUDE_TANSTACK = "true" AND INCLUDE_ZUSTAND = "true")*

```typescript
import { useAuthStore } from "../stores/auth.js";
import type { ApiResponse, PaginatedResponse } from "@{{SCOPE}}/shared";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;

  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    useAuthStore.getState().logout();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  get<T>(path: string) {
    return request<ApiResponse<T>>(path);
  },
  getPaginated<T>(path: string) {
    return request<PaginatedResponse<T>>(path);
  },
  post<T>(path: string, body?: unknown) {
    return request<ApiResponse<T>>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  put<T>(path: string, body?: unknown) {
    return request<ApiResponse<T>>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  },
  delete<T>(path: string) {
    return request<ApiResponse<T>>(path, { method: "DELETE" });
  },
};
```

--- FILE: apps/web/src/stores/auth.ts ---
*(Only include if INCLUDE_ZUSTAND = "true")*

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserType, AdminRole } from "@{{SCOPE}}/shared";

interface User {
  id: number;
  phone: string;
  userType: UserType | AdminRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: "{{PROJECT_NAME}}-auth" }
  )
);
```

--- FILE: apps/web/src/stores/network.ts ---
*(Only include if INCLUDE_ZUSTAND = "true")*

```typescript
import { create } from "zustand";

interface NetworkState {
  isOnline: boolean;
}

export const useNetworkStore = create<NetworkState>(() => {
  if (typeof window === "undefined") return { isOnline: true };

  window.addEventListener("online", () => useNetworkStore.setState({ isOnline: true }));
  window.addEventListener("offline", () => useNetworkStore.setState({ isOnline: false }));

  return { isOnline: navigator.onLine };
});
```

--- FILE: apps/web/src/providers/pwa-provider.tsx ---
*(Only include if INCLUDE_PWA = "true")*

```typescript
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

interface PWAContextValue {
  needRefresh: boolean;
  setNeedRefresh: (v: boolean) => void;
  offlineReady: boolean;
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
}

const PWAContext = createContext<PWAContextValue | null>(null);

export function usePWA() {
  const ctx = useContext(PWAContext);
  if (!ctx) throw new Error("usePWA must be used within PWAProvider");
  return ctx;
}

export function PWAProvider({ children }: { children: ReactNode }) {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: "CHECK_UPDATE" });
      }
    }, 60 * 60 * 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <PWAContext.Provider value={{ needRefresh, setNeedRefresh, offlineReady, updateServiceWorker }}>
      {children}
    </PWAContext.Provider>
  );
}
```

--- FILE: apps/web/src/main.tsx ---
*(Generate this file based on which features are enabled. Below is the full version with all features.)*

```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// If INCLUDE_TANSTACK = "true":
// import { QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// import { queryClient } from "./lib/query-client.js";
// If INCLUDE_PWA = "true":
// import { PWAProvider } from "./providers/pwa-provider.js";
import "./index.css";
import App from "./App.js";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Wrap with PWAProvider if INCLUDE_PWA = true */}
    {/* Wrap with QueryClientProvider if INCLUDE_TANSTACK = true */}
    <App />
    {/* Include ReactQueryDevtools if INCLUDE_TANSTACK = true */}
  </StrictMode>
);
```

*(Note to LLM: Produce the final version with the correct wrapping order. PWAProvider outermost, then QueryClientProvider inside, then App. Only include providers whose flag is "true".)*

--- FILE: apps/web/src/App.tsx ---
```typescript
import { RouterProvider } from "react-router-dom";
import { router } from "./router.js";

function App() {
  return <RouterProvider router={router} />;
}

export default App;
```

--- FILE: apps/web/src/router.tsx ---
```typescript
import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "./layouts/app-layout.js";
import { DashboardPage } from "./pages/dashboard.js";
import { NotFoundPage } from "./pages/not-found.js";
// If INCLUDE_PWA = "true":
// import { OfflinePage } from "./pages/offline.js";

export const router = createBrowserRouter([
  // If INCLUDE_PWA = "true":
  // { path: "/offline", element: <OfflinePage /> },
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);
```

--- FILE: apps/web/src/layouts/app-layout.tsx ---
```typescript
import { Outlet } from "react-router-dom";
import { AppHeader } from "../components/app-header.js";
// If INCLUDE_PWA = "true" AND INCLUDE_ZUSTAND = "true":
// import { OfflineBanner } from "../components/offline-banner.js";
// import { PWAInstallPrompt } from "../components/pwa-install-prompt.js";
// import { PWAUpdateNotification } from "../components/pwa-update-notification.js";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background font-sans">
      {/* If INCLUDE_PWA + INCLUDE_ZUSTAND: <OfflineBanner /> */}
      <AppHeader />
      <main className="mx-auto max-w-[1280px] px-4 py-6">
        <Outlet />
      </main>
      {/* If INCLUDE_PWA: <PWAInstallPrompt /> */}
      {/* If INCLUDE_PWA: <PWAUpdateNotification /> */}
    </div>
  );
}
```

--- FILE: apps/web/src/components/app-header.tsx ---
```typescript
// If INCLUDE_PWA = "true":
// import { StatusDropdown } from './status-dropdown.js'

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background px-4">
      <span className="text-lg font-bold text-primary">{{PROJECT_TITLE}}</span>
      <div className="flex items-center gap-1">
        {/* If INCLUDE_PWA = "true": <StatusDropdown /> */}
      </div>
    </header>
  );
}
```

--- FILE: apps/web/src/pages/dashboard.tsx ---
```typescript
export function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="text-muted-foreground">Welcome to {{PROJECT_TITLE}}</p>
    </div>
  );
}
```

--- FILE: apps/web/src/pages/not-found.tsx ---
```typescript
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <p className="text-muted-foreground">Page not found</p>
      <Link to="/" className="text-primary hover:underline">
        Go home
      </Link>
    </div>
  );
}
```

--- FILE: apps/web/src/pages/offline.tsx ---
*(Only include if INCLUDE_PWA = "true")*

```typescript
export function OfflinePage() {
  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-2xl font-bold text-foreground">You are offline</h1>
      <p className="max-w-sm text-muted-foreground">
        Please check your internet connection and try again.
      </p>
      <button
        onClick={handleRetry}
        className="rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:opacity-90"
      >
        Retry
      </button>
    </div>
  );
}
```

--- FILE: apps/web/src/components/offline-banner.tsx ---
*(Only include if INCLUDE_PWA = "true" AND INCLUDE_ZUSTAND = "true")*

```typescript
import { useNetworkStore } from "../stores/network.js";

export function OfflineBanner() {
  const isOnline = useNetworkStore((s) => s.isOnline);

  if (isOnline) return null;

  return (
    <div className="sticky top-0 z-40 flex items-center justify-center gap-2 bg-destructive px-4 py-2 text-sm text-destructive-foreground">
      <span>You are offline — only cached content is available</span>
    </div>
  );
}
```

--- FILE: apps/web/src/components/pwa-install-prompt.tsx ---
*(Only include if INCLUDE_PWA = "true")*

```typescript
import { useEffect, useState } from "react";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    setDeferredPrompt(null);
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 rounded-lg border border-border bg-background p-4 shadow-lg md:bottom-4 md:left-auto md:right-4 md:w-80">
      <p className="mb-3 text-sm text-foreground">
        Install {{PROJECT_TITLE}} on your device
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleInstall}
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
        >
          Install
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground"
        >
          Later
        </button>
      </div>
    </div>
  );
}
```

--- FILE: apps/web/src/components/pwa-update-notification.tsx ---
*(Only include if INCLUDE_PWA = "true")*

```typescript
import { usePWA } from "../providers/pwa-provider.js";

export function PWAUpdateNotification() {
  const { needRefresh, setNeedRefresh, updateServiceWorker } = usePWA();

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 rounded-lg border border-border bg-background p-4 shadow-lg md:bottom-4 md:left-auto md:right-4 md:w-80">
      <p className="mb-3 text-sm text-foreground">
        A new version of {{PROJECT_TITLE}} is available
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => updateServiceWorker(true)}
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
        >
          Update
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground"
        >
          Later
        </button>
      </div>
    </div>
  );
}
```

--- FILE: apps/web/src/components/status-dropdown.tsx ---
*(Only include if INCLUDE_PWA = "true")*

```typescript
import { useEffect, useState, useCallback, useRef } from "react";
import { usePWA } from "../providers/pwa-provider.js";

interface ServiceStatus {
  status: "healthy" | "unhealthy";
  latencyMs?: number;
  message?: string;
}

interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  services: {
    api: ServiceStatus;
    database: ServiceStatus;
    storage: ServiceStatus;
  };
}

function StatusDot({ status }: { status: ServiceStatus["status"] }) {
  const color = status === "healthy" ? "bg-emerald-500" : "bg-red-500";
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-75`} />
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${color}`} />
    </span>
  );
}

export function StatusDropdown() {
  const [open, setOpen] = useState(false);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const { needRefresh, offlineReady } = usePWA();

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch("/api/health");
      const data: HealthResponse = await res.json();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10_000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allHealthy = health?.status === "healthy";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {!loading && (
          <span className={`absolute top-1 left-1 h-2 w-2 rounded-full ${allHealthy ? "bg-emerald-500" : "bg-red-500"}`} />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-lg border border-border bg-background p-4 shadow-lg">
          <h3 className="mb-3 text-sm font-semibold text-foreground">System Status</h3>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : health ? (
            <div className="space-y-2">
              {(["api", "database", "storage"] as const).map((key) => (
                <div key={key} className="flex items-center justify-between rounded-md bg-secondary/50 px-3 py-2">
                  <span className="text-sm text-foreground">{key}</span>
                  <div className="flex items-center gap-2">
                    {health.services[key].latencyMs != null && (
                      <span className="text-xs text-muted-foreground">{health.services[key].latencyMs}ms</span>
                    )}
                    <StatusDot status={health.services[key].status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md bg-red-50 p-3 text-center text-sm text-red-700">
              API unreachable
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

### apps/admin

Uses **Ant Design v5** with built-in RTL support and Persian locale. No Tailwind or PostCSS needed — Ant Design uses CSS-in-JS.

--- FILE: apps/admin/package.json ---
```json
{
  "name": "@{{SCOPE}}/admin",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "check-types": "tsc --noEmit",
    "dev": "vite --port {{PORT_ADMIN}}",
    "build": "tsc -b && vite build",
    "preview": "vite preview --port {{PORT_ADMIN}}"
  },
  "dependencies": {
    "@ant-design/icons": "^5.6.1",
    "@{{SCOPE}}/shared": "workspace:*",
    "@tanstack/react-query": "^5.100.10",
    "antd": "^5.24.6",
    "react": "^19",
    "react-dom": "^19",
    "react-router-dom": "^7.15.1"
  },
  "devDependencies": {
    "@{{SCOPE}}/typescript-config": "workspace:*",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@vitejs/plugin-react": "^4",
    "typescript": "^5",
    "vite": "^6"
  }
}
```

--- FILE: apps/admin/tsconfig.json ---
```json
{
  "extends": "@{{SCOPE}}/typescript-config/base.json",
  "compilerOptions": { "jsx": "react-jsx", "outDir": "dist", "rootDir": "src", "noEmit": true },
  "include": ["src"]
}
```

--- FILE: apps/admin/vite.config.ts ---
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: {{PORT_ADMIN}},
    proxy: {
      "/api": { target: "http://localhost:{{PORT_API}}", changeOrigin: true },
    },
  },
  preview: { port: {{PORT_ADMIN}} },
});
```

--- FILE: apps/admin/index.html ---
```html
<!DOCTYPE html>
<html lang="fa" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{PROJECT_TITLE}} Admin</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>
      #splash{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:#fff;font-family:system-ui,sans-serif;transition:opacity .3s}
      #splash .spinner{width:32px;height:32px;border:3px solid #1d4ed8;border-right-color:transparent;border-radius:50%;animation:spin .8s linear infinite}
      @keyframes spin{to{transform:rotate(360deg)}}
    </style>
  </head>
  <body>
    <div id="root">
      <div id="splash">
        <div style="text-align:center">
          <h2 style="color:#1d4ed8;margin-bottom:16px;font-size:20px">{{PROJECT_TITLE}} Admin</h2>
          <div class="spinner"></div>
        </div>
      </div>
    </div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

--- FILE: apps/admin/src/vite-env.d.ts ---
```typescript
/// <reference types="vite/client" />
```

--- FILE: apps/admin/src/theme.ts ---
```typescript
import type { ThemeConfig } from "antd";
import faIR from "antd/locale/fa_IR";

export const antLocale = faIR;
export const themeConfig: ThemeConfig = {
  token: {
    fontFamily: '"Vazirmatn", system-ui, sans-serif',
    colorPrimary: "#1d4ed8",
    borderRadius: 6,
  },
};
```

--- FILE: apps/admin/src/main.tsx ---
```typescript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider, App as AntApp } from "antd";
import { queryClient } from "./lib/query-client.js";
import { antLocale, themeConfig } from "./theme.js";
import App from "./App.js";

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider direction="rtl" locale={antLocale} theme={themeConfig}>
        <AntApp>
          <App />
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  </StrictMode>,
);

requestAnimationFrame(() => {
  const splash = document.getElementById("splash");
  if (splash) {
    splash.style.opacity = "0";
    setTimeout(() => splash.remove(), 300);
  }
});
```

--- FILE: apps/admin/src/App.tsx ---
```typescript
import { useMemo } from "react";
import { RouterProvider } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/use-auth.js";
import { createAppRouter } from "./router.js";

function AppWithAuth() {
  const { token } = useAuth();
  const router = useMemo(() => createAppRouter(!!token), [token]);
  return <RouterProvider router={router} />;
}

function App() {
  return (
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  );
}

export default App;
```

--- FILE: apps/admin/src/router.tsx ---
```typescript
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthLayout } from "./layouts/auth-layout.js";
import { AdminLayout } from "./layouts/admin-layout.js";
import { LoginPage } from "./pages/login.js";
import { DashboardPage } from "./pages/dashboard.js";
import { AdminsPage } from "./pages/admins.js";

export function createAppRouter(isAuthenticated: boolean) {
  return createBrowserRouter([
    {
      path: "/login",
      element: isAuthenticated ? <Navigate to="/" replace /> : <AuthLayout />,
      children: [{ index: true, element: <LoginPage /> }],
    },
    {
      element: isAuthenticated ? <AdminLayout /> : <Navigate to="/login" replace />,
      children: [
        { index: true, element: <DashboardPage /> },
        { path: "admins", element: <AdminsPage /> },
      ],
    },
  ]);
}
```

--- FILE: apps/admin/src/lib/query-client.ts ---
```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});
```

--- FILE: apps/admin/src/hooks/use-auth.tsx ---
```typescript
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface AdminData {
  id: number;
  email: string;
  name: string | null;
  role: string;
  lastLogin: string | null;
}

interface AuthContextValue {
  admin: AdminData | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "{{SCOPE}}_admin_token";
const ADMIN_KEY = "{{SCOPE}}_admin_data";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [admin, setAdmin] = useState<AdminData | null>(() => {
    const stored = localStorage.getItem(ADMIN_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    const { token: jwt, admin: adminData } = data.data;
    localStorage.setItem(TOKEN_KEY, jwt);
    localStorage.setItem(ADMIN_KEY, JSON.stringify(adminData));
    setToken(jwt);
    setAdmin(adminData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
    setToken(null);
    setAdmin(null);
  }, []);

  const authFetch = useCallback(
    (url: string, options: RequestInit = {}) => {
      const headers = new Headers(options.headers);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return fetch(url, { ...options, headers });
    },
    [token]
  );

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
```

--- FILE: apps/admin/src/layouts/auth-layout.tsx ---
```typescript
import { Outlet } from "react-router-dom";
import { Flex } from "antd";

export function AuthLayout() {
  return (
    <Flex justify="center" align="center" style={{ minHeight: "100vh", padding: "0 16px", background: "#f5f5f5" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <Outlet />
      </div>
    </Flex>
  );
}
```

--- FILE: apps/admin/src/layouts/admin-layout.tsx ---
```typescript
import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Dropdown, Avatar, Button, Space, Typography } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  LogoutOutlined,
  DownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useAuth } from "../hooks/use-auth.js";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems: MenuProps["items"] = [
  { key: "/", icon: <DashboardOutlined />, label: "داشبورد" },
  { key: "/admins", icon: <TeamOutlined />, label: "مدیران" },
];

export function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const initials = admin?.name
    ? admin.name.split(" ").map((w) => w[0]).join("").slice(0, 2)
    : admin?.email?.[0]?.toUpperCase() || "A";

  const dropdownItems: MenuProps["items"] = [
    { key: "email", label: admin?.email, disabled: true },
    { type: "divider" },
    { key: "dashboard", icon: <DashboardOutlined />, label: "داشبورد" },
    { type: "divider" },
    { key: "logout", icon: <LogoutOutlined />, label: "خروج", danger: true },
  ];

  const handleDropdownClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "dashboard") navigate("/");
    if (key === "logout") {
      logout();
      navigate("/login");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
        <Space>
          <div
            style={{
              width: 32, height: 32, borderRadius: 6, background: "#1d4ed8", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14,
            }}
          >
            S
          </div>
          <Text strong style={{ color: "rgba(255,255,255,0.95)", fontSize: 15 }}>
            {{PROJECT_TITLE}} Admin
          </Text>
        </Space>
        <Dropdown menu={{ items: dropdownItems, onClick: handleDropdownClick }} trigger={["click"]}>
          <Button type="text" style={{ display: "flex", alignItems: "center", gap: 8, color: "rgba(255,255,255,0.85)" }}>
            <Avatar size="small" style={{ backgroundColor: "#e6f0ff", color: "#1d4ed8" }}>
              {initials}
            </Avatar>
            <span className="hidden md:inline">{admin?.name || admin?.email}</span>
            <DownOutlined style={{ fontSize: 10 }} />
          </Button>
        </Dropdown>
      </Header>
      <Layout>
        <Sider
          collapsible collapsed={collapsed} onCollapse={setCollapsed} breakpoint="md"
          width={220} theme="light" trigger={null}
          style={{ borderInlineStart: "1px solid #f0f0f0" }}
        >
          <div style={{ padding: "16px 8px" }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              block
            />
          </div>
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ borderInlineEnd: "none" }}
          />
        </Sider>
        <Content style={{ padding: 24 }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
```

--- FILE: apps/admin/src/pages/login.tsx ---
```typescript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, Alert, Divider, Typography } from "antd";
import { useAuth } from "../hooks/use-auth.js";

const { Title, Text } = Typography;

export function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: { email: string; password: string }) => {
    setError("");
    setLoading(true);
    try {
      await login(values.email, values.password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ورود");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div style={{ textAlign: "center", paddingBottom: 16 }}>
        <div
          style={{
            width: 56, height: 56, borderRadius: 12, background: "#1d4ed8", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 24, margin: "0 auto",
          }}
        >
          S
        </div>
        <Title level={4} style={{ marginTop: 12 }}>ورود به پنل مدیریت</Title>
        <Text type="secondary">{{PROJECT_TITLE}} Admin</Text>
      </div>
      <Divider style={{ margin: "16px 0" }} />
      {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
      <Form onFinish={handleSubmit} layout="vertical">
        <Form.Item label="ایمیل" name="email" rules={[{ required: true, message: "ایمیل الزامی است" }]}>
          <Input dir="ltr" placeholder="admin@{{SCOPE}}.app" />
        </Form.Item>
        <Form.Item label="رمز عبور" name="password" rules={[{ required: true, message: "رمز عبور الزامی است" }]}>
          <Input.Password dir="ltr" placeholder="********" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>ورود</Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
```

--- FILE: apps/admin/src/pages/dashboard.tsx ---
```typescript
import { useNavigate } from "react-router-dom";
import { Card, Avatar, Tag, Button, Space, Typography, Row, Col } from "antd";
import { TeamOutlined, SafetyCertificateOutlined, CalendarOutlined, LeftOutlined } from "@ant-design/icons";
import { useAuth } from "../hooks/use-auth.js";

const { Title, Text } = Typography;

export function DashboardPage() {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const initials = admin?.name
    ? admin.name.split(" ").map((w) => w[0]).join("").slice(0, 2)
    : admin?.email?.[0]?.toUpperCase() || "A";

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div>
        <Title level={3} style={{ margin: 0 }}>داشبورد</Title>
        <Text type="secondary">به پنل مدیریت {{PROJECT_TITLE}} خوش آمدید</Text>
      </div>
      <Card>
        <Space size="middle">
          <Avatar size={56} style={{ backgroundColor: "#e6f0ff", color: "#1d4ed8", fontSize: 20 }}>{initials}</Avatar>
          <div>
            <Title level={5} style={{ margin: 0 }}>{admin?.name || admin?.email}</Title>
            <Space>
              <Text type="secondary" dir="ltr">{admin?.email}</Text>
              <Tag color={admin?.role === "super_admin" ? "blue" : "default"}>
                <SafetyCertificateOutlined /> {admin?.role === "super_admin" ? "سوپر ادمین" : "ادمین"}
              </Tag>
            </Space>
          </div>
        </Space>
      </Card>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Space><TeamOutlined style={{ color: "#999" }} /><Text type="secondary">مدیران سیستم</Text></Space>
              <Button type="default" block onClick={() => navigate("/admins")}><LeftOutlined /> مدیریت مدیران</Button>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Space direction="vertical">
              <Space><CalendarOutlined style={{ color: "#999" }} /><Text type="secondary">آخرین ورود</Text></Space>
              <Text strong>{admin?.lastLogin ? new Date(admin.lastLogin).toLocaleDateString("fa-IR") : "—"}</Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Space direction="vertical">
              <Space><SafetyCertificateOutlined style={{ color: "#999" }} /><Text type="secondary">سطح دسترسی</Text></Space>
              <Text strong>{admin?.role === "super_admin" ? "دسترسی کامل" : "دسترسی محدود"}</Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
```

--- FILE: apps/admin/src/pages/admins.tsx ---
```typescript
import { useState, useEffect } from "react";
import { useAuth } from "../hooks/use-auth.js";
import { Button, Input, Tag, Card, Modal, Form, Select, Table, Dropdown, Alert, Space, Typography } from "antd";
import type { MenuProps, TableColumnsType } from "antd";
import { PlusOutlined, EditOutlined, EllipsisOutlined, PoweroffOutlined, ExclamationCircleFilled, TeamOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface Admin {
  id: number; email: string; name: string | null; role: string;
  isActive: number; lastLogin: string | null; createdAt: string;
}

export function AdminsPage() {
  const { admin: currentUser, authFetch } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionAdmin, setActionAdmin] = useState<Admin | null>(null);
  const [form] = Form.useForm();

  const isSuperAdmin = currentUser?.role === "super_admin";

  const fetchAdmins = async () => {
    setError("");
    try {
      const res = await authFetch("/api/admin/admins");
      const data = await res.json();
      if (res.ok) { setAdmins(data.data); }
      else { setError(data.message || "خطا در دریافت لیست مدیران"); }
    } catch { setError("خطا در اتصال به سرور"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ name: "", email: "", password: "", role: "admin" });
    setModalOpen(true);
  };

  const openEdit = (admin: Admin) => {
    setEditing(admin);
    form.resetFields();
    form.setFieldsValue({ name: admin.name || "", email: admin.email, password: "", role: admin.role });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      let res: Response;
      if (editing) {
        const body: Record<string, string> = { name: values.name, role: values.role };
        if (values.password) body.password = values.password;
        res = await authFetch(`/api/admin/admins/${editing.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
        });
      } else {
        res = await authFetch("/api/admin/admins", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values),
        });
      }
      const data = await res.json();
      if (!res.ok) { form.setFields([{ name: "email", errors: [data.message || "خطا در ذخیره"] }]); return; }
      setModalOpen(false);
      fetchAdmins();
    } catch { /* validation errors handled by form */ }
    finally { setSaving(false); }
  };

  const toggleActive = async (admin: Admin) => {
    try {
      const res = await authFetch(`/api/admin/admins/${admin.id}/toggle`, { method: "PATCH" });
      if (!res.ok) { const data = await res.json(); setError(data.message || "خطا در تغییر وضعیت"); return; }
      fetchAdmins();
    } catch { setError("خطا در اتصال به سرور"); }
  };

  const getRowMenuItems = (admin: Admin): MenuProps["items"] => [
    { key: "edit", icon: <EditOutlined />, label: "ویرایش" },
    { key: "toggle", icon: <PoweroffOutlined />, label: admin.isActive ? "غیرفعال کردن" : "فعال کردن" },
  ];

  const handleRowMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (!actionAdmin) return;
    if (key === "edit") openEdit(actionAdmin);
    if (key === "toggle") toggleActive(actionAdmin);
  };

  const columns: TableColumnsType<Admin> = [
    { title: "نام", dataIndex: "name", render: (v: string | null) => v || "—" },
    { title: "ایمیل", dataIndex: "email", render: (v: string) => <span dir="ltr">{v}</span> },
    {
      title: "نقش", dataIndex: "role",
      render: (role: string) => <Tag color={role === "super_admin" ? "blue" : "default"}>{role === "super_admin" ? "سوپر ادمین" : "ادمین"}</Tag>,
    },
    {
      title: "وضعیت", dataIndex: "isActive",
      render: (v: number) => <Tag color={v ? "green" : "red"}>{v ? "فعال" : "غیرفعال"}</Tag>,
    },
    {
      title: "آخرین ورود", dataIndex: "lastLogin",
      render: (v: string | null) => v ? new Date(v).toLocaleDateString("fa-IR") : "—",
    },
    ...(isSuperAdmin ? [{
      title: "", key: "actions", width: 48,
      render: (_: unknown, record: Admin) => (
        <Dropdown menu={{ items: getRowMenuItems(record), onClick: handleRowMenuClick }} trigger={["click"]}>
          <Button type="text" icon={<EllipsisOutlined />} size="small" onClick={() => setActionAdmin(record)} />
        </Dropdown>
      ),
    }] : []),
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>مدیریت مدیران</Title>
          <Text type="secondary">مدیریت دسترسی‌ها و حساب‌های مدیران سیستم</Text>
        </div>
        {isSuperAdmin && <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>افزودن مدیر</Button>}
      </div>
      {error && <Alert type="error" message={error} showIcon icon={<ExclamationCircleFilled />} />}
      <Card title={<Space><TeamOutlined /><span>لیست مدیران</span><Tag>{admins.length} نفر</Tag></Space>}>
        <Table columns={columns} dataSource={admins} rowKey="id" loading={loading} pagination={false}
          locale={{ emptyText: "هیچ مدیری یافت نشد" }} />
      </Card>
      <Modal open={modalOpen} title={editing ? "ویرایش مدیر" : "افزودن مدیر جدید"}
        onCancel={() => setModalOpen(false)} onOk={handleSave} confirmLoading={saving}
        okText={editing ? "ذخیره تغییرات" : "ایجاد مدیر"} cancelText="انصراف"
      >
        <Form form={form} layout="vertical" style={{ paddingTop: 8 }}>
          <Form.Item label="نام" name="name"><Input placeholder="نام مدیر" /></Form.Item>
          <Form.Item label="ایمیل" name="email"
            rules={editing ? [] : [{ required: true, message: "ایمیل الزامی است" }]}
          >
            <Input dir="ltr" placeholder={`admin@{{SCOPE}}.app`} disabled={!!editing} />
          </Form.Item>
          <Form.Item label={editing ? "رمز عبور جدید (خالی = بدون تغییر)" : "رمز عبور"} name="password"
            rules={editing ? [] : [{ required: true, message: "رمز عبور الزامی است" }]}
          >
            <Input.Password dir="ltr" placeholder="••••••••" />
          </Form.Item>
          <Form.Item label="نقش" name="role">
            <Select options={[{ value: "admin", label: "ادمین" }, { value: "super_admin", label: "سوپر ادمین" }]} />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
```

---

### Git Hooks

--- FILE: .husky/pre-commit ---
```bash
#!/usr/bin/env sh

branch="$(git rev-parse --abbrev-ref HEAD)"

if [ "$branch" = "main" ]; then
  echo "Direct push to main branch is not allowed." >&2
  echo "Please create a new branch for your work using:" >&2
  echo "  git checkout -b feature/your-feature-name" >&2
  exit 1
fi
```

--- FILE: .husky/pre-push ---
```bash
turbo check-types
```

---

## Post-Generation Setup Steps

After all files are generated, run these commands in order:

```bash
# 1. Install dependencies
pnpm install

# 2. Start PostgreSQL
pnpm docker:up

# 3. Configure environment
cp .env.example apps/api/.env
# Edit apps/api/.env with your values

# 4. Generate and apply database migrations
pnpm db:generate
pnpm db:migrate

# 5. Initialize git hooks
pnpm prepare

# 6. Start development servers
pnpm dev

# 7. Verify API health
curl http://localhost:{{PORT_API}}/api/health

# 8. Initialize git repository
git init
git add .
git commit -m "initial commit: scaffold project"
```
