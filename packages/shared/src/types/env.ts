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
  OTP_PROVIDER: "mock" | "meli-payamak";
  MELI_PAYAMAK_API_KEY?: string;
  MELI_PAYAMAK_USERNAME?: string;
  MELI_PAYAMAK_PASSWORD?: string;
  MELI_PAYAMAK_FROM?: string;

  // App
  NODE_ENV: "development" | "production";
  CORS_ORIGINS: string;
  API_PORT?: string;
}
