export interface S3Object {
  Key: string;
  LastModified: Date;
  ETag: string;
  Size: number;
  StorageClass: string;
}

export interface Bucket {
  Name: string;
  CreationDate: Date;
}

export interface ListObjectsResponse {
  IsTruncated: boolean;
  Contents: S3Object[];
  Name: string;
  Prefix: string;
  MaxKeys: number;
  CommonPrefixes?: { Prefix: string }[];
}
