# Smartiz Architecture

## Monorepo Structure

```
smartiz/
  apps/
    api/          # Hono API (dual entry: Workers + Node.js)
    web/          # React web app (port 9090)
    admin/        # React admin panel (port 9595)
  packages/
    db/           # @smartiz/db — Drizzle ORM + PostgreSQL schema
    auth/         # @smartiz/auth — JWT + OTP interface
    storage/      # @smartiz/storage — File storage interface + adapters
    shared/       # @smartiz/shared — Types, constants, env config
    ui/           # @smartiz/ui — Shared React components
    eslint-config/
    typescript-config/
```

## Adapter Pattern

Every external service is accessed through an interface. This means switching providers is a config change, not a code rewrite.

### Database (`@smartiz/db`)
- **Factory:** `createDb(connectionString)` returns a Drizzle ORM instance
- **Workers:** Pass `env.HYPERDRIVE.connectionString`
- **Node.js:** Pass `process.env.DATABASE_URL`
- **Schema:** Provider-agnostic Drizzle schema (`pgTable`)

### Storage (`@smartiz/storage`)
- **Interface:** `StorageProvider` with `upload`, `get`, `delete`, `exists`, `list`, `getSignedUrl`
- **Adapters:** `LocalStorageAdapter` (dev), `R2StorageAdapter` (production), `S3StorageAdapter` (generic)
- **Switch:** Change `STORAGE_PROVIDER` env var

### Auth (`@smartiz/auth`)
- **JWT:** `signToken` / `verifyToken` using `jose` library
- **OTP Interface:** `OTPProvider` with single `send(phone, code)` method
- **Adapters:** `MockOTPProvider` (dev), more can be added
- **Middleware:** `protect`, `protectAdmin`, `protectSuperAdmin` for Hono routes

## API Dual Deployment

The API uses a **factory pattern** to support both Cloudflare Workers and Node.js:

- `src/index.ts` — `createApp(env)` returns a Hono app (no server)
- `src/entry-node.ts` — Node.js entry using `@hono/node-server`
- `src/entry-workers.ts` — Workers entry mapping Hyperdrive bindings

To switch: just change which entry point you run. The app factory is identical.

## Environment Variables

See `.env.example` at the repo root. All config is through environment variables — no hardcoded values.
