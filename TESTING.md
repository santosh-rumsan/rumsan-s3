# Testing the S3-Compatible Server

This guide shows how to test the server with different methods.

## Prerequisites

Make sure the server is running:
```bash
npm run dev
```

## 1. Testing with cURL (REST API)

### Create a bucket
```bash
curl -X PUT http://localhost:4568/api/buckets/my-test-bucket
```

### List buckets
```bash
curl http://localhost:4568/api/buckets
```

### Upload a file
```bash
curl -X PUT http://localhost:4568/api/buckets/my-test-bucket/objects/test.txt \
  -H "Content-Type: text/plain" \
  -d "Hello World!"
```

### Upload a file in a folder
```bash
curl -X PUT http://localhost:4568/api/buckets/my-test-bucket/objects/docs/readme.txt \
  -H "Content-Type: text/plain" \
  -d "Documentation file"
```

### List objects
```bash
curl http://localhost:4568/api/buckets/my-test-bucket/objects
```

### List objects with prefix
```bash
curl "http://localhost:4568/api/buckets/my-test-bucket/objects?prefix=docs/"
```

### Download a file
```bash
curl http://localhost:4568/api/buckets/my-test-bucket/objects/test.txt
```

### Delete a file
```bash
curl -X DELETE http://localhost:4568/api/buckets/my-test-bucket/objects/test.txt
```

### Delete a bucket
```bash
curl -X DELETE http://localhost:4568/api/buckets/my-test-bucket
```

## 2. Testing with Swagger UI

1. Open your browser and go to: http://localhost:4568/api-docs
2. You'll see an interactive API documentation
3. Click "Try it out" on any endpoint
4. Fill in the parameters
5. Click "Execute" to test the API

## 3. Testing with AWS SDK

### Install AWS SDK in your project
```bash
npm install @aws-sdk/client-s3
```

### Example TypeScript/JavaScript code

```typescript
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

// Configure the client
const s3 = new S3Client({
  endpoint: 'http://localhost:4568',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'test',      // Any value works
    secretAccessKey: 'test',  // Any value works
  },
  forcePathStyle: true,       // IMPORTANT: Required for local S3
});

// Upload a file
async function uploadFile() {
  await s3.send(new PutObjectCommand({
    Bucket: 'my-bucket',
    Key: 'folder/file.txt',
    Body: Buffer.from('Hello World'),
    ContentType: 'text/plain',
  }));
  console.log('File uploaded!');
}

// Download a file
async function downloadFile() {
  const response = await s3.send(new GetObjectCommand({
    Bucket: 'my-bucket',
    Key: 'folder/file.txt',
  }));
  
  const content = await response.Body.transformToString();
  console.log('File content:', content);
}

// List files
async function listFiles() {
  const response = await s3.send(new ListObjectsV2Command({
    Bucket: 'my-bucket',
  }));
  
  console.log('Files:');
  response.Contents?.forEach(file => {
    console.log(`- ${file.Key} (${file.Size} bytes)`);
  });
}
```

### Run the included example
```bash
npm run example
```

## 4. Testing with Python boto3

```python
import boto3
from botocore.config import Config

# Configure client
s3 = boto3.client(
    's3',
    endpoint_url='http://localhost:4568',
    aws_access_key_id='test',
    aws_secret_access_key='test',
    config=Config(signature_version='s3v4'),
    region_name='us-east-1'
)

# Upload a file
s3.put_object(
    Bucket='my-bucket',
    Key='test.txt',
    Body=b'Hello World'
)

# Download a file
response = s3.get_object(Bucket='my-bucket', Key='test.txt')
content = response['Body'].read()
print(content.decode('utf-8'))

# List files
response = s3.list_objects_v2(Bucket='my-bucket')
for obj in response.get('Contents', []):
    print(f"- {obj['Key']} ({obj['Size']} bytes)")
```

## 5. File Upload with Form Data (Multipart)

```bash
curl -X PUT http://localhost:4568/api/buckets/my-bucket/objects/upload.jpg \
  -H "Content-Type: image/jpeg" \
  --data-binary @/path/to/image.jpg
```

## Verification

Check the storage folder to see your files:
```bash
ls -R storage/
```

You should see:
```
storage/
├── my-bucket/
│   ├── test.txt
│   ├── test.txt.metadata.json
│   └── folder/
│       ├── file.txt
│       └── file.txt.metadata.json
```

## Health Check

Check if the server is running:
```bash
curl http://localhost:4568/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-05T14:30:00.000Z"
}
```

## Troubleshooting

### Server not responding
- Make sure the server is running: `npm run dev`
- Check if port 4568 is available
- Check console for errors

### Bucket not found
- Make sure you created the bucket first
- Check the storage folder: `ls storage/`

### File upload fails
- Check Content-Type header
- Verify the bucket exists
- Check disk space

### AWS SDK connection fails
- Make sure `forcePathStyle: true` is set
- Verify endpoint URL is correct
- Check credentials (any value works for local testing)
