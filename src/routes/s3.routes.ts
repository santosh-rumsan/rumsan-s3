import { Router, Request, Response } from 'express';
import { StorageService } from '../services/storage.service';
import * as convert from 'xml-js';

const router = Router();
const storageService = new StorageService();

// S3-compatible routes (AWS SDK will use these)

// ListBuckets - GET /
router.get('/', (req: Request, res: Response) => {
  try {
    const buckets = storageService.listBuckets();

    const xml = {
      ListAllMyBucketsResult: {
        _attributes: { xmlns: 'http://s3.amazonaws.com/doc/2006-03-01/' },
        Owner: {
          ID: 'local-s3',
          DisplayName: 'local-s3',
        },
        Buckets: {
          Bucket: buckets.map((bucket) => ({
            Name: { _text: bucket.Name },
            CreationDate: { _text: bucket.CreationDate.toISOString() },
          })),
        },
      },
    };

    const xmlString = convert.js2xml(xml, { compact: true, spaces: 2 });
    res.set('Content-Type', 'application/xml');
    res.send(xmlString);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

// CreateBucket - PUT /{bucket}
router.put('/:bucket', (req: Request, res: Response) => {
  try {
    const { bucket } = req.params;
    storageService.createBucket(bucket);
    res.set('Content-Type', 'application/xml');
    res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><CreateBucketConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/"></CreateBucketConfiguration>');
  } catch (error: any) {
    if (error.message === 'BucketAlreadyExists') {
      const xml = {
        Error: {
          _attributes: { xmlns: 'http://s3.amazonaws.com/doc/2006-03-01/' },
          Code: { _text: 'BucketAlreadyExists' },
          Message: { _text: 'The requested bucket name already exists' },
        },
      };
      const xmlString = convert.js2xml(xml, { compact: true, spaces: 2 });
      res.set('Content-Type', 'application/xml');
      res.status(409).send(xmlString);
    } else {
      res.status(500).send(error.message);
    }
  }
});

// DeleteBucket - DELETE /{bucket}
router.delete('/:bucket', (req: Request, res: Response) => {
  try {
    const { bucket } = req.params;
    storageService.deleteBucket(bucket);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'NoSuchBucket') {
      res.status(404).send('NoSuchBucket');
    } else if (error.message === 'BucketNotEmpty') {
      res.status(409).send('BucketNotEmpty');
    } else {
      res.status(500).send(error.message);
    }
  }
});

// ListObjectsV2 - GET /{bucket}
router.get('/:bucket', (req: Request, res: Response) => {
  try {
    const { bucket } = req.params;
    const prefix = req.query.prefix as string | undefined;
    const maxKeys = parseInt(req.query['max-keys'] as string) || 1000;

    const result = storageService.listObjects(bucket, prefix, maxKeys);

    const xml = {
      ListBucketResult: {
        _attributes: { xmlns: 'http://s3.amazonaws.com/doc/2006-03-01/' },
        Name: { _text: result.Name },
        Prefix: { _text: result.Prefix },
        MaxKeys: { _text: result.MaxKeys.toString() },
        IsTruncated: { _text: result.IsTruncated.toString() },
        Contents: result.Contents.map((obj) => ({
          Key: { _text: obj.Key },
          LastModified: { _text: obj.LastModified.toISOString() },
          ETag: { _text: obj.ETag },
          Size: { _text: obj.Size.toString() },
          StorageClass: { _text: obj.StorageClass },
        })),
      },
    };

    const xmlString = convert.js2xml(xml, { compact: true, spaces: 2 });
    res.set('Content-Type', 'application/xml');
    res.send(xmlString);
  } catch (error: any) {
    if (error.message === 'NoSuchBucket') {
      res.status(404).send('NoSuchBucket');
    } else {
      res.status(500).send(error.message);
    }
  }
});

// PutObject - PUT /{bucket}/{key+}
router.put('/:bucket/*', (req: Request, res: Response) => {
  try {
    const { bucket } = req.params;
    const key = req.params[0];
    const contentType = req.headers['content-type'] || 'application/octet-stream';

    const chunks: Buffer[] = [];
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks);
        const result = storageService.putObject(bucket, key, buffer, contentType);
        res.set('ETag', `"${result.ETag}"`);
        res.status(200).send();
      } catch (error: any) {
        if (error.message === 'NoSuchBucket') {
          res.status(404).send('NoSuchBucket');
        } else {
          res.status(500).send(error.message);
        }
      }
    });
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

// GetObject - GET /{bucket}/{key+}
router.get('/:bucket/*', (req: Request, res: Response) => {
  try {
    const { bucket } = req.params;
    const key = req.params[0];

    const result = storageService.getObject(bucket, key);
    res.set('Content-Type', result.contentType);
    res.set('ETag', `"${result.etag}"`);
    res.set('Content-Length', result.data.length.toString());
    res.send(result.data);
  } catch (error: any) {
    if (error.message === 'NoSuchKey') {
      res.status(404).send('NoSuchKey');
    } else {
      res.status(500).send(error.message);
    }
  }
});

// DeleteObject - DELETE /{bucket}/{key+}
router.delete('/:bucket/*', (req: Request, res: Response) => {
  try {
    const { bucket } = req.params;
    const key = req.params[0];

    storageService.deleteObject(bucket, key);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'NoSuchKey') {
      res.status(404).send('NoSuchKey');
    } else {
      res.status(500).send(error.message);
    }
  }
});

// HeadObject - HEAD /{bucket}/{key+}
router.head('/:bucket/*', (req: Request, res: Response) => {
  try {
    const { bucket } = req.params;
    const key = req.params[0];

    const result = storageService.headObject(bucket, key);
    res.set('Content-Length', result.size.toString());
    res.set('Last-Modified', result.lastModified.toUTCString());
    res.set('ETag', `"${result.etag}"`);
    res.set('Content-Type', result.contentType);
    res.status(200).send();
  } catch (error: any) {
    if (error.message === 'NoSuchKey') {
      res.status(404).send();
    } else {
      res.status(500).send();
    }
  }
});

export default router;
