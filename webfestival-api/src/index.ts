require('module-alias/register');
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';

// Database configuration
import { connectDatabase, disconnectDatabase } from './lib/prisma';
import { validateDatabaseConfig } from './config/database';

// Immich configuration
import { initializeImmich } from './middleware/immich.middleware';

// Swagger configuration
import { swaggerSpec } from './config/swagger';

// Routes

// Load environment variables
dotenv.config();

// Validate database configuration
validateDatabaseConfig();

const app = express();
const PORT = process.env['PORT'] || 3001;
const SERVER_NAME = process.env['SERVER_NAME'] || 'WebFestival API';
const SERVER_URL = process.env['SERVER_URL'] || `http://localhost:${PORT}`;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000'), // 15 minutes
  max: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100'), // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(limiter);
app.use(cors({
  origin: [
    process.env['FRONTEND_URL'] || 'http://localhost:3001',
    process.env['CMS_URL'] || 'http://localhost:3002',
    process.env['APP_URL'] || 'http://localhost:3003'
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'WebFestival API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  }
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check routes
import healthRoutes from './routes/health';
app.use('/health', healthRoutes);

// API routes
import apiRoutes from './routes';
app.use('/api/v1', apiRoutes);

// API info endpoint
app.get('/api/v1', (_req, res) => {
  res.json({
    message: `${SERVER_NAME} v1.0.0`,
    server: SERVER_NAME,
    url: SERVER_URL,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL 14+ with Prisma 5+',
    features: [
      'Multimedia contests (photo, video, audio, short films)',
      'Dynamic evaluation criteria by media type',
      'Specialized jury assignments',
      'Subscription system with limits',
      'Unified CMS for content management',
      'Social features (follows, comments, likes)',
      'Educational content system',
      'Automated newsletter',
      'Immich integration for media management'
    ]
  });
});

// Error handling middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// 404 handler for API routes
app.use('/api/*', notFoundHandler);

// 404 handler for all other routes
app.all('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use(errorHandler);

// Start server only if not in test environment
if (process.env['NODE_ENV'] !== 'test') {
  // Connect to database and initialize services
  connectDatabase()
    .then(async () => {
      // Initialize Immich connection
      await initializeImmich();
      
      app.listen(PORT, () => {
        console.log(`🚀 ${SERVER_NAME} running on port ${PORT}`);
        console.log(`🌐 Server URL: ${SERVER_URL}`);
        console.log(`📊 Environment: ${process.env['NODE_ENV'] || 'development'}`);
        console.log(`🔗 Health check: ${SERVER_URL}/health`);
        console.log(`🖼️ Immich health: ${SERVER_URL}/health/immich`);
        console.log(`📊 Database stats: ${SERVER_URL}/health/database/stats`);
        console.log(`📡 API endpoint: ${SERVER_URL}/api/v1`);
        console.log(`📚 API Documentation: ${SERVER_URL}/api-docs`);
        console.log(`📄 Swagger JSON: ${SERVER_URL}/api-docs.json`);
        console.log(`🎯 Features: Multimedia contests, Dynamic criteria, Subscriptions, CMS, Social features`);
      });
    })
    .catch((error) => {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server gracefully...');
    await disconnectDatabase();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down server gracefully...');
    await disconnectDatabase();
    process.exit(0);
  });
}

export { app };
export default app;