import { createApp } from "./index.js";

export default {
  fetch(request: Request, env: Record<string, string>) {
    const app = createApp({
      DATABASE_URL: (env as any).HYPERDRIVE?.connectionString || env.DATABASE_URL,
      STORAGE_PROVIDER: (env.STORAGE_PROVIDER as "local" | "r2" | "s3") || "r2",
      R2_ACCOUNT_ID: env.R2_ACCOUNT_ID,
      R2_ACCESS_KEY_ID: env.R2_ACCESS_KEY_ID,
      R2_SECRET_ACCESS_KEY: env.R2_SECRET_ACCESS_KEY,
      R2_BUCKET_NAME: env.R2_BUCKET_NAME,
      R2_PUBLIC_URL: env.R2_PUBLIC_URL,
      JWT_SECRET: env.JWT_SECRET,
      OTP_PROVIDER: (env.OTP_PROVIDER as "mock" | "meli-payamak") || "mock",
      NODE_ENV: (env.NODE_ENV as "development" | "production") || "production",
      CORS_ORIGINS: env.CORS_ORIGINS || "*",
    });
    return app.fetch(request, env);
  },
};
