import type { MiddlewareHandler } from "hono";
import type { EnvConfig } from "@smartiz/shared";
import type { Database } from "@smartiz/db";
import type { StorageProvider } from "@smartiz/storage";
import type { TokenPayload } from "@smartiz/auth";
import { createDb } from "@smartiz/db";
import { createStorage } from "@smartiz/storage";

export interface AppVariables {
  env: EnvConfig;
  db: Database;
  storage: StorageProvider;
  user: TokenPayload;
}

export function createEnvMiddleware(env: EnvConfig): MiddlewareHandler {
  // Create single instances at startup
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
          publicUrl: env.R2_PUBLIC_URL,
        },
      };
  }
}
