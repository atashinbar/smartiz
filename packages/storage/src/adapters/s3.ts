import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { FileInfo, StorageProvider, UploadOptions, S3StorageConfig } from "../types.js";

export class S3StorageAdapter implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(config: S3StorageConfig) {
    this.bucket = config.bucketName;
    this.publicUrl = config.publicUrl || "";
    this.client = new S3Client({
      endpoint: config.endpoint,
      region: config.region || "us-east-1",
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async upload(key: string, data: Buffer | ArrayBuffer, options?: UploadOptions): Promise<FileInfo> {
    const buffer = data instanceof ArrayBuffer ? Buffer.from(data) : data;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: options?.contentType,
        Metadata: options?.metadata,
      }),
    );
    return {
      key,
      size: buffer.length,
      contentType: options?.contentType || "application/octet-stream",
      filename: key.split("/").pop() || key,
      url: this.publicUrl ? `${this.publicUrl}/${key}` : key,
      createdAt: new Date(),
    };
  }

  async get(key: string): Promise<ArrayBuffer | null> {
    try {
      const result = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      if (!result.Body) return null;
      return await result.Body.transformToByteArray().then((arr) => arr.buffer as ArrayBuffer);
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return true;
    } catch {
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return true;
    } catch {
      return false;
    }
  }

  async list(prefix: string, limit = 100): Promise<FileInfo[]> {
    const result = await this.client.send(
      new ListObjectsV2Command({ Bucket: this.bucket, Prefix: prefix, MaxKeys: limit }),
    );
    return (result.Contents || []).map((obj) => ({
      key: obj.Key!,
      size: obj.Size || 0,
      contentType: "application/octet-stream",
      filename: obj.Key!.split("/").pop() || obj.Key!,
      url: this.publicUrl ? `${this.publicUrl}/${obj.Key}` : obj.Key!,
      createdAt: obj.LastModified || new Date(),
    }));
  }

  async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn },
    );
  }
}
