# @rumsan/s3server

[![Docker Build](https://img.shields.io/badge/docker-rumsan%2Fs3server-blue)](https://hub.docker.com/r/rumsan/s3server)
[![npm version](https://img.shields.io/npm/v/@rumsan/s3server.svg)](https://www.npmjs.com/package/@rumsan/s3server)

A simple, lightweight S3-compatible file server with REST API and Swagger documentation. Compatible with AWS SDK S3 Client. Fully containerized and ready for production deployment.

## Features

- ✅ S3-compatible API (works with `@aws-sdk/client-s3`)
- ✅ REST API with full CRUD operations
- ✅ Swagger/OpenAPI documentation
- ✅ File storage with proper folder structure
- ✅ Bucket management (create, list, delete)
- ✅ Object operations (upload, download, delete, list)
- ✅ Metadata support
- ✅ ETag generation
- ✅ Docker & Docker Compose support
- ✅ Health checks & monitoring
- ✅ Non-root user for security
- ✅ Multi-stage Docker build for minimal image size

## Quick Start

### Without Docker

```bash
npm install
npm run dev
```

### With Docker Compose

```bash
docker-compose up -d
```

Access at:
- API: http://localhost:4568
- Swagger UI: http://localhost:4568/api-docs
- Health: http://localhost:4568/health

## Installation

### NPM Package

```bash
npm install @rumsan/s3server
```

### Docker Image

```bash
docker pull rumsan/s3server:latest
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Environment variables:
- `PORT` - Server port (default: 4568)
- `HOST` - Server host (default: localhost)
- `STORAGE_PATH` - Root storage directory (default: ./storage)

## Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

### Docker

#### Single Container

```bash
docker run -p 4568:4568 -v s3_storage:/app/storage rumsan/s3server:latest
```

#### Docker Compose

```bash
docker-compose up -d
```

## API Documentation

Once the server is running, access Swagger UI at:
```
http://localhost:4568/api-docs
```

## REST API Endpoints

### Buckets
- `GET /api/buckets` - List all buckets
- `PUT /api/buckets/:bucket` - Create a bucket
- `DELETE /api/buckets/:bucket` - Delete a bucket

### Objects
- `GET /api/buckets/:bucket/objects` - List objects in a bucket
- `PUT /api/buckets/:bucket/objects/*` - Upload an object
- `GET /api/buckets/:bucket/objects/*` - Download an object
- `DELETE /api/buckets/:bucket/objects/*` - Delete an object
- `GET /api/buckets/:bucket/objects/*/head` - Get object metadata

## S3-Compatible API

The server also exposes S3-compatible endpoints that work with AWS SDK:

- `GET /` - ListBuckets
- `PUT /:bucket` - CreateBucket
- `DELETE /:bucket` - DeleteBucket
- `GET /:bucket` - ListObjectsV2
- `PUT /:bucket/*` - PutObject
- `GET /:bucket/*` - GetObject
- `DELETE /:bucket/*` - DeleteObject
- `HEAD /:bucket/*` - HeadObject

## Using with AWS SDK

```typescript
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  endpoint: 'http://localhost:4568',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
  forcePathStyle: true, // Required for local S3
});

// Upload a file
await s3Client.send(
  new PutObjectCommand({
    Bucket: 'my-bucket',
    Key: 'path/to/file.txt',
    Body: Buffer.from('Hello World'),
  })
);

// Download a file
const response = await s3Client.send(
  new GetObjectCommand({
    Bucket: 'my-bucket',
    Key: 'path/to/file.txt',
  })
);
```

## Storage Structure

Files are stored in the following structure:
```
storage/
├── bucket-name/
│   ├── file1.txt
│   ├── file1.txt.metadata.json
│   └── folder/
│       ├── file2.txt
│       └── file2.txt.metadata.json
```

Each file has an associated `.metadata.json` file storing:
- Content type
- Upload date

## Examples

See `examples/client.ts` for a complete working example.

## Testing with cURL

```bash
# Create a bucket
curl -X PUT http://localhost:4568/api/buckets/my-bucket

# Upload a file
curl -X PUT http://localhost:4568/api/buckets/my-bucket/objects/test.txt \
  -H "Content-Type: text/plain" \
  -d "Hello World"

# List objects
curl http://localhost:4568/api/buckets/my-bucket/objects

# Download a file
curl http://localhost:4568/api/buckets/my-bucket/objects/test.txt

# Delete a file
curl -X DELETE http://localhost:4568/api/buckets/my-bucket/objects/test.txt
```

## Documentation

- **[Quick Start Guide](QUICKSTART.md)** - Get up and running in minutes
- **[Docker Guide](DOCKER.md)** - Docker and Docker Compose setup, deployment, and best practices
- **[Testing Guide](TESTING.md)** - Comprehensive testing guide with examples
- **[Publishing Guide](PUBLISHING.md)** - How to publish to Docker Hub and NPM
- **[Project Structure](PROJECT_STRUCTURE.md)** - Architecture and code organization
- **[Contributing Guide](.github/CONTRIBUTING.md)** - How to contribute to the project
- **[Security Policy](.github/SECURITY.md)** - Security guidelines and vulnerability reporting

## Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build TypeScript
npm start                # Start production server
npm run example           # Run AWS SDK example
npm run docker:build     # Build production Docker image
npm run docker:build:dev # Build development Docker image
npm run docker:run       # Run Docker container
npm run docker:compose:up   # Start with docker-compose
npm run docker:compose:down # Stop docker-compose
npm run docker:compose:dev  # Start development environment
npm run docker:compose:prod # Start production environment
```

## Docker Images

The project is published as Docker images on Docker Hub:

- `rumsan/s3server:latest` - Latest stable version
- `rumsan/s3server:main` - Latest from main branch
- `rumsan/s3server:develop` - Latest from develop branch
- `rumsan/s3server:v1.0.0` - Specific version tags

## NPM Package

The project is published to NPM as:

```bash
npm install @rumsan/s3server
```

## Storage

Files are stored in the configured directory (default: `./storage`):

```
storage/
├── bucket-1/
│   ├── file.txt
│   ├── file.txt.metadata.json
│   └── folder/
│       └── nested-file.txt
└── bucket-2/
    └── ...
```

Each file has an associated `.metadata.json` containing content type and upload timestamp.

## Performance

- **Image Size**: ~185MB (production, optimized multi-stage build)
- **Memory**: ~50-100MB baseline
- **Startup Time**: < 1 second
- **Throughput**: Depends on disk I/O

## Security

- ✅ Non-root user (nodejs)
- ✅ Read-only filesystem compatible
- ✅ Health checks
- ✅ Proper signal handling
- ✅ Minimal attack surface

See [Security Policy](.github/SECURITY.md) for more details.

## Support

- 📚 [Documentation](.)
- 🐛 [Report Issues](https://github.com/rumsan/s3server/issues)
- 💬 [Discussions](https://github.com/rumsan/s3server/discussions)
- 🔒 [Security](https://github.com/rumsan/s3server/security)

## License

MIT
