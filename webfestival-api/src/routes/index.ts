import { Router } from 'express';

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'webfestival-api'
  });
});

// API info route
router.get('/', (req, res) => {
  res.json({
    name: 'WebFestival API',
    version: '1.0.0',
    description: 'Backend API for WebFestival multimedia contest platform',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      contests: '/api/v1/contests',
      media: '/api/v1/media'
    }
  });
});

export default router;