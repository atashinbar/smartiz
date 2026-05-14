import type { StorageConfig, StorageProvider } from "./types.js";
import { LocalStorageAdapter } from "./adapters/local.js";
import { R2StorageAdapter } from "./adapters/r2.js";
import { S3StorageAdapter } from "./adapters/s3.js";

export type { StorageProvider, FileInfo, UploadOptions, StorageConfig, LocalStorageConfig, R2StorageConfig, S3StorageConfig } from "./types.js";
export { LocalStorageAdapter } from "./adapters/local.js";
export { R2StorageAdapter } from "./adapters/r2.js";
export { S3StorageAdapter } from "./adapters/s3.js";

export function createStorage(config: StorageConfig): StorageProvider {
  switch (config.provider) {
    case "local":
      return new LocalStorageAdapter(config.local);
    case "r2":
      return new R2StorageAdapter(config.r2);
    case "s3":
      return new S3StorageAdapter(config.s3);
    default:
      throw new Error(`Unknown storage provider: ${(config as StorageConfig).provider}`);
  }
}
