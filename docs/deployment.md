# Deployment Guide

## Cloudflare Workers (with Hyperdrive)

### 1. Create Hyperdrive Config
```bash
cd apps/api
npx wrangler hyperdrive create smartiz-pg \
  --connection-string="postgresql://user:password@your-pg-host:5432/smartiz"
```

### 2. Update wrangler.toml
```toml
[[hyperdrive]]
binding = "HYPERDRIVE"
id = "<id-from-previous-command>"
```

### 3. Set Secrets
```bash
npx wrangler secret put JWT_SECRET
npx wrangler secret put R2_ACCESS_KEY_ID
npx wrangler secret put R2_SECRET_ACCESS_KEY
```

### 4. Deploy
```bash
npx wrangler deploy
```

## Node.js PaaS (Liara, Railway, etc.)

### 1. Build
```bash
pnpm build
```

### 2. Set Environment Variables
On your PaaS dashboard, set all variables from `.env.example`:
- `DATABASE_URL`
- `JWT_SECRET`
- `STORAGE_PROVIDER` and related config
- `OTP_PROVIDER` and related config

### 3. Start Command
```
node apps/api/dist/entry-node.js
```

## Static Apps (Web & Admin)

Both `apps/web` and `apps/admin` produce static builds:

```bash
pnpm --filter @smartiz/web build   # → apps/web/dist/
pnpm --filter @smartiz/admin build # → apps/admin/dist/
```

Deploy the `dist/` folder to:
- **Cloudflare Pages**
- **Vercel**
- **Netlify**
- **Liara Static**
- Any static hosting provider

Set the API URL as an environment variable so the frontend knows where to send requests.
