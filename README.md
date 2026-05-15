# Smartiz

AI-powered educational platform.

## Prerequisites

- Node.js 20+
- pnpm 11+ (`npm install -g pnpm`)
- Docker (for local PostgreSQL)
- Git

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/atashinbar/smartiz.git
cd smartiz

# 2. Install dependencies
pnpm install

# 3. Start PostgreSQL
pnpm docker:up

# 4. Configure environment
cp .env.example apps/api/.env
# Edit apps/api/.env if needed (defaults work with Docker)

# 5. Apply database migrations
pnpm db:migrate

# 6. Start development
pnpm dev
```

All three apps will start:
- **API**: http://localhost:8585
- **Web**: http://localhost:9090
- **Admin**: http://localhost:9595

## Useful Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all packages and apps |
| `pnpm turbo check-types` | Run TypeScript type checking |
| `pnpm db:generate` | Generate migration from schema changes |
| `pnpm db:migrate` | Apply pending migrations |
| `pnpm db:studio` | Open Drizzle Studio (database GUI) |
| `pnpm docker:up` | Start PostgreSQL container |
| `pnpm docker:down` | Stop PostgreSQL container (data kept) |
| `pnpm docker:reset` | Delete data and start fresh |

## Project Structure

```
smartiz/
  apps/
    api/          # Hono API (Node.js / Cloudflare Workers)
    web/          # React web app
    admin/        # React admin panel
  packages/
    db/           # Drizzle ORM + PostgreSQL schema
    auth/         # JWT + OTP interface
    storage/      # File storage interface (R2, S3, local)
    shared/       # Shared types and config
    ui/           # Shared UI components
```

See [docs/architecture.md](docs/architecture.md) for detailed architecture documentation.

## Using a Remote Database

To connect to Supabase, Liara, or any remote PostgreSQL instead of Docker, edit `apps/api/.env`:

```bash
DATABASE_URL=postgresql://user:password@host:5432/smartiz
```

No code changes needed.

## Git Hooks

- **Pre-commit**: Blocks commits if TypeScript type checking fails
- **Pre-push**: Blocks direct pushes to `main` — always use feature branches
