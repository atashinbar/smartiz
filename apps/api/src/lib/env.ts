import { config } from "dotenv";
import type { EnvConfig } from "@smartiz/shared";

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
    MELI_PAYAMAK_API_KEY: process.env.MELI_PAYAMAK_API_KEY,
    MELI_PAYAMAK_USERNAME: process.env.MELI_PAYAMAK_USERNAME,
    MELI_PAYAMAK_PASSWORD: process.env.MELI_PAYAMAK_PASSWORD,
    MELI_PAYAMAK_FROM: process.env.MELI_PAYAMAK_FROM,
    NODE_ENV: (process.env.NODE_ENV as EnvConfig["NODE_ENV"]) || "development",
    CORS_ORIGINS: process.env.CORS_ORIGINS || "http://localhost:9090,http://localhost:9595",
    API_PORT: process.env.API_PORT || "8585",
  };
}
