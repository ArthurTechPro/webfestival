import { Router } from 'express';
import criteriosRoutes from './criterios.routes';
import authRoutes from './auth.routes';
import mediaRoutes from './media.routes';
import userRoutes from './user.routes';
import concursoRoutes from './concurso.routes';
import calificacionRoutes from './calificacion.routes';
import juradoAsignacionRoutes from './jurado-asignacion.routes';
import cmsRoutes from './cms.routes';
import interactionsRoutes from './interactions.routes';
import newsletterRoutes from './newsletter.routes';

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

// Rutas de calificaciones
router.use('/calificaciones', calificacionRoutes);

// Rutas de asignaciones de jurados
router.use('/jurado-asignaciones', juradoAsignacionRoutes);

// Rutas del CMS
router.use('/cms', cmsRoutes);

// Rutas de interacciones unificadas
router.use('/interactions', interactionsRoutes);

// Rutas de newsletter y contenido educativo
router.use('/', newsletterRoutes);

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
      media: '/api/v1/media',
      calificaciones: '/api/v1/calificaciones',
      jurado_asignaciones: '/api/v1/jurado-asignaciones',
      cms: '/api/v1/cms',
      interactions: '/api/v1/interactions',
      newsletter: '/api/v1/newsletter',
      educational_content: '/api/v1/educational-content'
    }
  });
});

export default router;