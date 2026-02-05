import { Router, Request, Response } from 'express';
import { StorageService } from '../services/storage.service';

const router = Router();
const storageService = new StorageService();

/**
 * @swagger
 * /buckets:
 *   get:
 *     summary: List all buckets
 *     tags: [Buckets]
 *     responses:
 *       200:
 *         description: List of buckets
 */
router.get('/buckets', (req: Request, res: Response) => {
  try {
    const buckets = storageService.listBuckets();
    res.json({
      Buckets: buckets,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /buckets/{bucket}:
 *   put:
 *     summary: Create a new bucket
 *     tags: [Buckets]
 *     parameters:
 *       - in: path
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bucket created successfully
 *       409:
 *         description: Bucket already exists
 */
router.put('/buckets/:bucket', (req: Request, res: Response) => {
  try {
    const { bucket } = req.params;
    storageService.createBucket(bucket);
    res.status(200).send();
  } catch (error: any) {
    if (error.message === 'BucketAlreadyExists') {
      res.status(409).json({ error: 'BucketAlreadyExists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

/**
 * @swagger
 * /buckets/{bucket}:
 *   delete:
 *     summary: Delete a bucket
 *     tags: [Buckets]
 *     parameters:
 *       - in: path
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Bucket deleted successfully
 *       404:
 *         description: Bucket not found
 *       409:
 *         description: Bucket not empty
 */
router.delete('/buckets/:bucket', (req: Request, res: Response) => {
  try {
    const { bucket } = req.params;
    storageService.deleteBucket(bucket);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'NoSuchBucket') {
      res.status(404).json({ error: 'NoSuchBucket' });
    } else if (error.message === 'BucketNotEmpty') {
      res.status(409).json({ error: 'BucketNotEmpty' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

/**
 * @swagger
 * /buckets/{bucket}/objects:
 *   get:
 *     summary: List objects in a bucket
 *     tags: [Objects]
 *     parameters:
 *       - in: path
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: prefix
 *         schema:
 *           type: string
 *       - in: query
 *         name: max-keys
 *         schema:
 *           type: integer
 *           default: 1000
 *     responses:
 *       200:
 *         description: List of objects
 */
router.get('/buckets/:bucket/objects', (req: Request, res: Response) => {
  try {
    const { bucket } = req.params;
    const prefix = req.query.prefix as string | undefined;
    const maxKeys = parseInt(req.query['max-keys'] as string) || 1000;

    const result = storageService.listObjects(bucket, prefix, maxKeys);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'NoSuchBucket') {
      res.status(404).json({ error: 'NoSuchBucket' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

/**
 * @swagger
 * /buckets/{bucket}/objects/{key}:
 *   put:
 *     summary: Upload an object to a bucket
 *     tags: [Objects]
 *     parameters:
 *       - in: path
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/octet-stream:
 *           schema:
 *             type: string
 *             format: binary
 *     responses:
 *       200:
 *         description: Object uploaded successfully
 */
router.put('/buckets/:bucket/objects/*', (req: Request, res: Response) => {
  try {
    const { bucket } = req.params;
    const key = req.params[0];
    const contentType = req.headers['content-type'] || 'application/octet-stream';

    const chunks: Buffer[] = [];
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const result = storageService.putObject(bucket, key, buffer, contentType);
      res.set('ETag', result.ETag);
      res.status(200).json({ ETag: result.ETag });
    });
  } catch (error: any) {
    if (error.message === 'NoSuchBucket') {
      res.status(404).json({ error: 'NoSuchBucket' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

/**
 * @swagger
 * /buckets/{bucket}/objects/{key}:
 *   get:
 *     summary: Get an object from a bucket
 *     tags: [Objects]
 *     parameters:
 *       - in: path
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Object retrieved successfully
 *       404:
 *         description: Object not found
 */
router.get('/buckets/:bucket/objects/*', (req: Request, res: Response) => {
  try {
    const { bucket } = req.params;
    const key = req.params[0];

    const result = storageService.getObject(bucket, key);
    res.set('Content-Type', result.contentType);
    res.set('ETag', result.etag);
    res.send(result.data);
  } catch (error: any) {
    if (error.message === 'NoSuchKey') {
      res.status(404).json({ error: 'NoSuchKey' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

/**
 * @swagger
 * /buckets/{bucket}/objects/{key}:
 *   delete:
 *     summary: Delete an object from a bucket
 *     tags: [Objects]
 *     parameters:
 *       - in: path
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Object deleted successfully
 *       404:
 *         description: Object not found
 */
router.delete('/buckets/:bucket/objects/*', (req: Request, res: Response) => {
  try {
    const { bucket } = req.params;
    const key = req.params[0];

    storageService.deleteObject(bucket, key);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'NoSuchKey') {
      res.status(404).json({ error: 'NoSuchKey' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

/**
 * @swagger
 * /buckets/{bucket}/objects/{key}/head:
 *   get:
 *     summary: Get object metadata
 *     tags: [Objects]
 *     parameters:
 *       - in: path
 *         name: bucket
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Object metadata
 *       404:
 *         description: Object not found
 */
router.get('/buckets/:bucket/objects/*/head', (req: Request, res: Response) => {
  try {
    const { bucket } = req.params;
    const pathParts = req.params[0].split('/');
    pathParts.pop(); // Remove 'head' from the path
    const key = pathParts.join('/');

    const result = storageService.headObject(bucket, key);
    res.set('Content-Length', result.size.toString());
    res.set('Last-Modified', result.lastModified.toUTCString());
    res.set('ETag', result.etag);
    res.set('Content-Type', result.contentType);
    res.status(200).json(result);
  } catch (error: any) {
    if (error.message === 'NoSuchKey') {
      res.status(404).json({ error: 'NoSuchKey' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

export default router;
