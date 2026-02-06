import { S3Client, CreateBucketCommand, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand, ListBucketsCommand } from '@aws-sdk/client-s3';

// Configure S3 client to use local server
const s3Client = new S3Client({
  endpoint: 'http://localhost:4568',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
  forcePathStyle: true, // Required for local S3-compatible servers
});

async function main() {
  try {
    console.log('🚀 Testing S3-Compatible File Server\n');

    const bucketName = 'test-bucket-' + Date.now();

    // 1. Create a bucket
    console.log(`1. Creating bucket "${bucketName}"...`);
    try {
      await s3Client.send(
        new CreateBucketCommand({
          Bucket: bucketName,
        })
      );
      console.log('✅ Bucket created\n');
    } catch (error: any) {
      if (error.message?.includes('BucketAlreadyExists')) {
        console.log('⚠️  Bucket already exists, continuing...\n');
      } else {
        throw error;
      }
    }

    // 2. List buckets
    console.log('2. Listing buckets...');
    const listBucketsResponse = await s3Client.send(new ListBucketsCommand({}));
    console.log('Buckets:', listBucketsResponse.Buckets?.map((b) => b.Name));
    console.log('✅ Buckets listed\n');

    // 3. Upload files
    console.log('3. Uploading files...');
    
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: 'hello.txt',
        Body: Buffer.from('Hello World!'),
        ContentType: 'text/plain',
      })
    );
    console.log('✅ Uploaded: hello.txt');

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: 'documents/report.txt',
        Body: Buffer.from('This is a report'),
        ContentType: 'text/plain',
      })
    );
    console.log('✅ Uploaded: documents/report.txt');

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: 'images/photo.jpg',
        Body: Buffer.from('fake image data'),
        ContentType: 'image/jpeg',
      })
    );
    console.log('✅ Uploaded: images/photo.jpg\n');

    // 4. List objects
    console.log('4. Listing objects in bucket...');
    const listResponse = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
      })
    );
    console.log('Objects:');
    listResponse.Contents?.forEach((obj) => {
      console.log(`  - ${obj.Key} (${obj.Size} bytes)`);
    });
    console.log('✅ Objects listed\n');

    // 5. Download a file
    console.log('5. Downloading hello.txt...');
    const getResponse = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: 'hello.txt',
      })
    );
    
    const content = await getResponse.Body?.transformToString();
    console.log('Content:', content);
    console.log('✅ File downloaded\n');

    // 6. List objects with prefix
    console.log('6. Listing objects with prefix "documents/"...');
    const listPrefixResponse = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: 'documents/',
      })
    );
    console.log('Objects with prefix:');
    listPrefixResponse.Contents?.forEach((obj) => {
      console.log(`  - ${obj.Key}`);
    });
    console.log('✅ Objects with prefix listed\n');

    // 7. Delete an object
    console.log('7. Deleting hello.txt...');
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: 'hello.txt',
      })
    );
    console.log('✅ File deleted\n');

    // 8. Verify deletion
    console.log('8. Verifying deletion...');
    const finalListResponse = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
      })
    );
    console.log('Remaining objects:');
    finalListResponse.Contents?.forEach((obj) => {
      console.log(`  - ${obj.Key}`);
    });
    console.log('✅ Deletion verified\n');

    console.log('🎉 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();
