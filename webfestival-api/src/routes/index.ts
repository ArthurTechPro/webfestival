import { Router } from 'express';
import criteriosRoutes from './criterios.routes';
import authRoutes from './auth.routes';
import mediaRoutes from './media.routes';
import userRoutes from './user.routes';
import concursoRoutes from './concurso.routes';

const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de usuarios
router.use('/users', userRoutes);

// Rutas de concursos
router.use('/concursos', concursoRoutes);

// Rutas de criterios de evaluación
router.use('/criterios', criteriosRoutes);

// Rutas de medios multimedia
router.use('/media', mediaRoutes);

// Health check route
router.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'webfestival-api'
  });
});

// API info route
router.get('/', (_req, res) => {
  res.json({
    name: 'WebFestival API',
    version: '1.0.0',
    description: 'Backend API for WebFestival multimedia contest platform',
    endpoints: {
      health: '/api/v1/health',
      criterios: '/api/v1/criterios',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      concursos: '/api/v1/concursos',
      media: '/api/v1/media'
    }
  });
});

export default router;