import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { S3Object, Bucket, ListObjectsResponse } from '../types/s3.types';
import { config } from '../config';

export class StorageService {
  private storagePath: string;

  constructor() {
    this.storagePath = config.storagePath;
    this.ensureStorageExists();
  }

  private ensureStorageExists(): void {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  private getBucketPath(bucket: string): string {
    return path.join(this.storagePath, bucket);
  }

  private getObjectPath(bucket: string, key: string): string {
    return path.join(this.storagePath, bucket, key);
  }

  private calculateETag(filePath: string): string {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('md5');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  }

  // Bucket operations
  createBucket(bucket: string): void {
    const bucketPath = this.getBucketPath(bucket);
    if (fs.existsSync(bucketPath)) {
      throw new Error('BucketAlreadyExists');
    }
    fs.mkdirSync(bucketPath, { recursive: true });
  }

  listBuckets(): Bucket[] {
    const buckets: Bucket[] = [];
    const items = fs.readdirSync(this.storagePath);

    for (const item of items) {
      const itemPath = path.join(this.storagePath, item);
      const stats = fs.statSync(itemPath);
      if (stats.isDirectory()) {
        buckets.push({
          Name: item,
          CreationDate: stats.birthtime,
        });
      }
    }

    return buckets;
  }

  deleteBucket(bucket: string): void {
    const bucketPath = this.getBucketPath(bucket);
    if (!fs.existsSync(bucketPath)) {
      throw new Error('NoSuchBucket');
    }

    const files = fs.readdirSync(bucketPath);
    if (files.length > 0) {
      throw new Error('BucketNotEmpty');
    }

    fs.rmdirSync(bucketPath);
  }

  bucketExists(bucket: string): boolean {
    return fs.existsSync(this.getBucketPath(bucket));
  }

  // Object operations
  putObject(bucket: string, key: string, data: Buffer, contentType?: string): { ETag: string } {
    const bucketPath = this.getBucketPath(bucket);
    if (!fs.existsSync(bucketPath)) {
      throw new Error('NoSuchBucket');
    }

    const objectPath = this.getObjectPath(bucket, key);
    const objectDir = path.dirname(objectPath);

    // Create directory structure if needed
    if (!fs.existsSync(objectDir)) {
      fs.mkdirSync(objectDir, { recursive: true });
    }

    fs.writeFileSync(objectPath, data);

    // Store metadata
    const metadataPath = `${objectPath}.metadata.json`;
    fs.writeFileSync(
      metadataPath,
      JSON.stringify({
        contentType: contentType || 'application/octet-stream',
        uploadDate: new Date().toISOString(),
      })
    );

    const etag = this.calculateETag(objectPath);
    return { ETag: etag };
  }

  getObject(bucket: string, key: string): { data: Buffer; contentType: string; etag: string } {
    const objectPath = this.getObjectPath(bucket, key);

    if (!fs.existsSync(objectPath)) {
      throw new Error('NoSuchKey');
    }

    const data = fs.readFileSync(objectPath);
    const metadataPath = `${objectPath}.metadata.json`;

    let contentType = 'application/octet-stream';
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      contentType = metadata.contentType || contentType;
    }

    const etag = this.calculateETag(objectPath);

    return { data, contentType, etag };
  }

  deleteObject(bucket: string, key: string): void {
    const objectPath = this.getObjectPath(bucket, key);

    if (!fs.existsSync(objectPath)) {
      throw new Error('NoSuchKey');
    }

    fs.unlinkSync(objectPath);

    // Delete metadata if exists
    const metadataPath = `${objectPath}.metadata.json`;
    if (fs.existsSync(metadataPath)) {
      fs.unlinkSync(metadataPath);
    }

    // Clean up empty directories
    this.cleanupEmptyDirectories(path.dirname(objectPath), this.getBucketPath(bucket));
  }

  private cleanupEmptyDirectories(dir: string, stopAt: string): void {
    if (dir === stopAt || !dir.startsWith(stopAt)) {
      return;
    }

    try {
      const files = fs.readdirSync(dir);
      if (files.length === 0) {
        fs.rmdirSync(dir);
        this.cleanupEmptyDirectories(path.dirname(dir), stopAt);
      }
    } catch (error) {
      // Directory doesn't exist or can't be read, ignore
    }
  }

  headObject(bucket: string, key: string): { size: number; lastModified: Date; etag: string; contentType: string } {
    const objectPath = this.getObjectPath(bucket, key);

    if (!fs.existsSync(objectPath)) {
      throw new Error('NoSuchKey');
    }

    const stats = fs.statSync(objectPath);
    const etag = this.calculateETag(objectPath);

    const metadataPath = `${objectPath}.metadata.json`;
    let contentType = 'application/octet-stream';
    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      contentType = metadata.contentType || contentType;
    }

    return {
      size: stats.size,
      lastModified: stats.mtime,
      etag,
      contentType,
    };
  }

  listObjects(bucket: string, prefix?: string, maxKeys: number = 1000): ListObjectsResponse {
    const bucketPath = this.getBucketPath(bucket);

    if (!fs.existsSync(bucketPath)) {
      throw new Error('NoSuchBucket');
    }

    const objects: S3Object[] = [];
    const prefixPath = prefix ? path.join(bucketPath, prefix) : bucketPath;

    const scanDirectory = (dir: string) => {
      if (!fs.existsSync(dir)) {
        return;
      }

      const items = fs.readdirSync(dir);

      for (const item of items) {
        if (item.endsWith('.metadata.json')) {
          continue;
        }

        const itemPath = path.join(dir, item);
        const stats = fs.statSync(itemPath);

        if (stats.isFile()) {
          const relativePath = path.relative(bucketPath, itemPath);
          const key = relativePath.split(path.sep).join('/');

          if (!prefix || key.startsWith(prefix)) {
            const etag = this.calculateETag(itemPath);
            objects.push({
              Key: key,
              LastModified: stats.mtime,
              ETag: `"${etag}"`,
              Size: stats.size,
              StorageClass: 'STANDARD',
            });
          }
        } else if (stats.isDirectory()) {
          scanDirectory(itemPath);
        }

        if (objects.length >= maxKeys) {
          break;
        }
      }
    };

    if (prefix) {
      const prefixDir = path.dirname(prefixPath);
      if (fs.existsSync(prefixDir)) {
        scanDirectory(prefixDir);
      }
    } else {
      scanDirectory(bucketPath);
    }

    return {
      IsTruncated: false,
      Contents: objects.slice(0, maxKeys),
      Name: bucket,
      Prefix: prefix || '',
      MaxKeys: maxKeys,
    };
  }
}
