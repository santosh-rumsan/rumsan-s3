export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'S3-Compatible File Server API',
    version: '1.0.0',
    description: 'A simple S3-compatible file server with REST API',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: 'http://localhost:4568',
      description: 'Local server',
    },
  ],
  tags: [
    {
      name: 'Buckets',
      description: 'Bucket management operations',
    },
    {
      name: 'Objects',
      description: 'Object storage operations',
    },
  ],
  paths: {
    '/api/buckets': {
      get: {
        tags: ['Buckets'],
        summary: 'List all buckets',
        description: 'Returns a list of all available buckets',
        responses: {
          '200': {
            description: 'Successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    Buckets: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          Name: { type: 'string' },
                          CreationDate: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/buckets/{bucket}': {
      put: {
        tags: ['Buckets'],
        summary: 'Create a new bucket',
        description: 'Creates a new bucket with the specified name',
        parameters: [
          {
            name: 'bucket',
            in: 'path',
            required: true,
            description: 'Name of the bucket to create',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': { description: 'Bucket created successfully' },
          '409': { description: 'Bucket already exists' },
        },
      },
      delete: {
        tags: ['Buckets'],
        summary: 'Delete a bucket',
        description: 'Deletes an empty bucket',
        parameters: [
          {
            name: 'bucket',
            in: 'path',
            required: true,
            description: 'Name of the bucket to delete',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '204': { description: 'Bucket deleted successfully' },
          '404': { description: 'Bucket not found' },
          '409': { description: 'Bucket is not empty' },
        },
      },
    },
    '/api/buckets/{bucket}/objects': {
      get: {
        tags: ['Objects'],
        summary: 'List objects in a bucket',
        description: 'Returns a list of objects in the specified bucket',
        parameters: [
          {
            name: 'bucket',
            in: 'path',
            required: true,
            description: 'Name of the bucket',
            schema: { type: 'string' },
          },
          {
            name: 'prefix',
            in: 'query',
            description: 'Filter objects by prefix',
            schema: { type: 'string' },
          },
          {
            name: 'max-keys',
            in: 'query',
            description: 'Maximum number of keys to return',
            schema: { type: 'integer', default: 1000 },
          },
        ],
        responses: {
          '200': {
            description: 'Successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    IsTruncated: { type: 'boolean' },
                    Contents: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          Key: { type: 'string' },
                          LastModified: { type: 'string', format: 'date-time' },
                          ETag: { type: 'string' },
                          Size: { type: 'integer' },
                          StorageClass: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '404': { description: 'Bucket not found' },
        },
      },
    },
    '/api/buckets/{bucket}/objects/{key}': {
      put: {
        tags: ['Objects'],
        summary: 'Upload an object',
        description: 'Uploads a file to the specified bucket',
        parameters: [
          {
            name: 'bucket',
            in: 'path',
            required: true,
            description: 'Name of the bucket',
            schema: { type: 'string' },
          },
          {
            name: 'key',
            in: 'path',
            required: true,
            description: 'Object key (path)',
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/octet-stream': {
              schema: {
                type: 'string',
                format: 'binary',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Object uploaded successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ETag: { type: 'string' },
                  },
                },
              },
            },
          },
          '404': { description: 'Bucket not found' },
        },
      },
      get: {
        tags: ['Objects'],
        summary: 'Download an object',
        description: 'Downloads a file from the specified bucket',
        parameters: [
          {
            name: 'bucket',
            in: 'path',
            required: true,
            description: 'Name of the bucket',
            schema: { type: 'string' },
          },
          {
            name: 'key',
            in: 'path',
            required: true,
            description: 'Object key (path)',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Object retrieved successfully',
            content: {
              'application/octet-stream': {
                schema: {
                  type: 'string',
                  format: 'binary',
                },
              },
            },
          },
          '404': { description: 'Object not found' },
        },
      },
      delete: {
        tags: ['Objects'],
        summary: 'Delete an object',
        description: 'Deletes a file from the specified bucket',
        parameters: [
          {
            name: 'bucket',
            in: 'path',
            required: true,
            description: 'Name of the bucket',
            schema: { type: 'string' },
          },
          {
            name: 'key',
            in: 'path',
            required: true,
            description: 'Object key (path)',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '204': { description: 'Object deleted successfully' },
          '404': { description: 'Object not found' },
        },
      },
    },
  },
};
