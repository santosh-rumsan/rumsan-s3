import express, { Application } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { swaggerDocument } from './config/swagger';
import apiRoutes from './routes/api.routes';
import s3Routes from './routes/s3.routes';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.raw({ type: 'application/octet-stream', limit: '100mb' }));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check (must be before S3 routes)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// REST API routes
app.use('/api', apiRoutes);

// S3-compatible routes (for AWS SDK) - must be last
app.use('/', s3Routes);

// Start server
app.listen(config.port, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 S3-Compatible File Server                           ║
║                                                           ║
║   Server:    http://${config.host}:${config.port}                        ║
║   Swagger:   http://${config.host}:${config.port}/api-docs              ║
║   Storage:   ${config.storagePath}                        ║
║                                                           ║
║   REST API:  http://${config.host}:${config.port}/api                   ║
║   S3 API:    http://${config.host}:${config.port}                       ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
