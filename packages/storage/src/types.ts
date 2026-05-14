export interface FileInfo {
  key: string;
  size: number;
  contentType: string;
  filename: string;
  url: string;
  createdAt: Date;
}

export interface UploadOptions {
  contentType?: string;
  metadata?: Record<string, string>;
  path?: string;
}

export interface StorageProvider {
  upload(key: string, data: Buffer | ArrayBuffer, options?: UploadOptions): Promise<FileInfo>;
  get(key: string): Promise<ArrayBuffer | null>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  list(prefix: string, limit?: number): Promise<FileInfo[]>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
}

export interface LocalStorageConfig {
  path: string;
  publicUrl?: string;
}

export interface R2StorageConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string;
}

export interface S3StorageConfig {
  endpoint?: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  region?: string;
  publicUrl?: string;
}

export type StorageConfig =
  | { provider: "local"; local: LocalStorageConfig }
  | { provider: "r2"; r2: R2StorageConfig }
  | { provider: "s3"; s3: S3StorageConfig };
