import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, unlinkSync } from "node:fs";
import { join, sep } from "node:path";
import type { FileInfo, StorageProvider, UploadOptions, LocalStorageConfig } from "../types.js";

export class LocalStorageAdapter implements StorageProvider {
  private basePath: string;
  private publicUrl: string;

  constructor(config: LocalStorageConfig) {
    this.basePath = config.path;
    this.publicUrl = config.publicUrl || "/uploads";
    if (!existsSync(this.basePath)) {
      mkdirSync(this.basePath, { recursive: true });
    }
  }

  async upload(key: string, data: Buffer | ArrayBuffer, options?: UploadOptions): Promise<FileInfo> {
    const fullPath = join(this.basePath, key);
    const dir = fullPath.substring(0, fullPath.lastIndexOf(sep));
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const buffer = data instanceof ArrayBuffer ? Buffer.from(data) : data;
    writeFileSync(fullPath, buffer);
    return {
      key,
      size: buffer.length,
      contentType: options?.contentType || "application/octet-stream",
      filename: key.split("/").pop() || key,
      url: `${this.publicUrl}/${key}`,
      createdAt: new Date(),
    };
  }

  async get(key: string): Promise<ArrayBuffer | null> {
    const fullPath = join(this.basePath, key);
    if (!existsSync(fullPath)) return null;
    const buffer = readFileSync(fullPath);
    return buffer.buffer;
  }

  async delete(key: string): Promise<boolean> {
    const fullPath = join(this.basePath, key);
    if (!existsSync(fullPath)) return false;
    unlinkSync(fullPath);
    return true;
  }

  async exists(key: string): Promise<boolean> {
    return existsSync(join(this.basePath, key));
  }

  async list(prefix: string, limit = 100): Promise<FileInfo[]> {
    const dir = join(this.basePath, prefix);
    if (!existsSync(dir)) return [];
    const files: FileInfo[] = [];
    this.walkDir(dir, prefix, files, limit);
    return files;
  }

  async getSignedUrl(_key: string, _expiresIn?: number): Promise<string> {
    throw new Error("Signed URLs not supported for local storage");
  }

  private walkDir(dir: string, prefix: string, files: FileInfo[], limit: number) {
    if (files.length >= limit) return;
    for (const entry of readdirSync(dir)) {
      if (files.length >= limit) break;
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        this.walkDir(fullPath, `${prefix}/${entry}`, files, limit);
      } else {
        files.push({
          key: `${prefix}/${entry}`,
          size: stat.size,
          contentType: "application/octet-stream",
          filename: entry,
          url: `${this.publicUrl}/${prefix}/${entry}`,
          createdAt: stat.mtime,
        });
      }
    }
  }
}
