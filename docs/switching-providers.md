# Switching Providers

## Database

Change `DATABASE_URL` in your `.env` file:

```bash
# Self-hosted PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/smartiz

# Supabase
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Any other provider
DATABASE_URL=postgresql://user:password@host:5432/smartiz
```

No code changes needed. Drizzle ORM works with any PostgreSQL-compatible database.

For Cloudflare Workers, create a Hyperdrive config and update `wrangler.toml`:
```bash
npx wrangler hyperdrive create smartiz-pg --connection-string="postgresql://..."
```

## Storage

Change `STORAGE_PROVIDER` in your `.env` file:

### Local (development)
```bash
STORAGE_PROVIDER=local
LOCAL_STORAGE_PATH=./uploads
```

### Cloudflare R2
```bash
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=smartiz-uploads
R2_PUBLIC_URL=https://uploads.yourdomain.com
```

### Any S3-compatible service
```bash
STORAGE_PROVIDER=s3
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=smartiz-uploads
S3_REGION=us-east-1
```

To add a new storage provider, implement the `StorageProvider` interface in `packages/storage/src/adapters/` and add it to the factory in `packages/storage/src/index.ts`.

## OTP / SMS Provider

Change `OTP_PROVIDER` in your `.env` file:

### Mock (development)
```bash
OTP_PROVIDER=mock
```

### MeliPayamak
```bash
OTP_PROVIDER=meli-payamak
MELI_PAYAMAK_API_KEY=your-api-key
MELI_PAYAMAK_USERNAME=your-username
MELI_PAYAMAK_PASSWORD=your-password
MELI_PAYAMAK_FROM=your-sender-number
```

To add a new SMS provider:
1. Implement the `OTPProvider` interface (one method: `send(phone, code)`)
2. Add it to `packages/auth/src/otp/`
3. Export it from `packages/auth/src/index.ts`
4. Add the new provider name to the env config in `packages/shared/src/types/env.ts`

## API Hosting

### Cloudflare Workers
```bash
cd apps/api
npx wrangler deploy
```

Requires Hyperdrive for PostgreSQL connection. See `wrangler.toml`.

### Node.js PaaS (Liara, Railway, etc.)
```bash
cd apps/api
pnpm start  # runs entry-node.ts
```

Set `DATABASE_URL` to your provider's connection string. No other changes needed.
