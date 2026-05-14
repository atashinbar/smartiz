# Local Development Setup

## Prerequisites

- Node.js 20+
- pnpm 11+
- PostgreSQL (local install or Docker)

## 1. Install PostgreSQL

Using Docker:
```bash
docker run -d --name smartiz-postgres \
  -e POSTGRES_USER=smartiz \
  -e POSTGRES_PASSWORD=smartiz \
  -e POSTGRES_DB=smartiz \
  -p 5432:5432 \
  postgres:16
```

Or install locally on your system.

## 2. Clone and Install

```bash
git clone <repo-url> smartiz
cd smartiz
pnpm install
```

## 3. Configure Environment

```bash
cp .env.example apps/api/.env
```

Edit `apps/api/.env`:
```bash
DATABASE_URL=postgresql://smartiz:smartiz@localhost:5432/smartiz
JWT_SECRET=dev-secret-change-me
STORAGE_PROVIDER=local
OTP_PROVIDER=mock
```

## 4. Run Database Migrations

```bash
# Generate migrations from schema
pnpm db:generate

# Apply migrations
pnpm db:migrate
```

## 5. Start Development

```bash
pnpm dev
```

This starts all apps via Turborepo:
- **API** at http://localhost:8585
- **Web** at http://localhost:9090
- **Admin** at http://localhost:9595

## 6. Verify

```bash
curl http://localhost:8585/api/health
# {"status":"healthy","timestamp":"..."}
```

## Database Management

```bash
# Open Drizzle Studio (GUI for your database)
pnpm db:studio

# Generate new migration after schema changes
pnpm db:generate

# Apply migrations
pnpm db:migrate
```
