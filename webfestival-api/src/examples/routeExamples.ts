/**
 * Ejemplos de uso de los middlewares de roles y permisos
 * Este archivo muestra cómo implementar los middlewares en rutas reales
 */

import { Router } from 'express';
import {
    authenticateToken,
    authenticateAndVerifyUser,
    requireRole,
    requirePermission,
    requireAllPermissions,
    requireAnyPermission,
    requireOwnershipOrRole,
    requireAdmin,
    requireContentAdmin,
    requireJurado,
    ContestRouteGuards,
    UserRouteGuards,
    MediaRouteGuards,
    EvaluationRouteGuards,
    ContentRouteGuards,
    CommunityRouteGuards,
    SystemRouteGuards,
    requireContentAdminPermission,
    requireContentOwnershipOrAdmin,
    requireCommentModerationPermission,
    requireSEOManagementPermission,
    requireNewsletterPermission,
    requireCMSMediaUploadPermission,
    createCompositeGuard,
    createOrGuard
} from '../middleware';

const router = Router();

// ============================================================================
// EJEMPLOS DE RUTAS DE AUTENTICACIÓN
// ============================================================================

/**
 * Ruta que requiere solo autenticación básica
 */
router.get('/profile',
    authenticateToken,
    (req, res) => {
        res.json({ user: req.user });
    }
);

/**
 * Ruta que requiere autenticación y verificación de usuario en BD
 */
router.get('/profile/detailed',
    authenticateAndVerifyUser,
    (req, res) => {
        res.json({ user: req.user });
    }
);

// ============================================================================
// EJEMPLOS DE RUTAS CON ROLES ESPECÍFICOS
// ============================================================================

/**
 * Solo administradores pueden crear concursos
 */
router.post('/contests',
    authenticateToken,
    requireAdmin,
    (_req, res) => {
        res.json({ message: 'Concurso creado' });
    }
);

/**
 * Solo jurados pueden evaluar
 */
router.post('/evaluations',
    authenticateToken,
    requireJurado,
    (_req, res) => {
        res.json({ message: 'Evaluación creada' });
    }
);

/**
 * Solo CONTENT_ADMIN y ADMIN pueden gestionar contenido
 */
router.post('/content',
    authenticateToken,
    requireContentAdmin,
    (_req, res) => {
        res.json({ message: 'Contenido creado' });
    }
);

// ============================================================================
// EJEMPLOS DE RUTAS CON PERMISOS ESPECÍFICOS
// ============================================================================

/**
 * Requiere permiso específico para gestionar usuarios
 */
router.get('/admin/users',
    authenticateToken,
    requirePermission('user:manage'),
    (_req, res) => {
        res.json({ users: [] });
    }
);

/**
 * Requiere múltiples permisos (todos)
 */
router.post('/admin/system/config',
    authenticateToken,
    requireAllPermissions(['system:configure', 'analytics:view']),
    (_req, res) => {
        res.json({ message: 'Configuración actualizada' });
    }
);

/**
 * Requiere al menos uno de varios permisos
 */
router.get('/content/manage',
    authenticateToken,
    requireAnyPermission(['content:create', 'content:edit', 'cms:manage']),
    (_req, res) => {
        res.json({ content: [] });
    }
);

// ============================================================================
// EJEMPLOS DE RUTAS CON OWNERSHIP
// ============================================================================

/**
 * Solo el propietario o ADMIN pueden editar el perfil
 */
router.put('/users/:userId/profile',
    authenticateToken,
    requireOwnershipOrRole(['ADMIN'], 'userId'),
    (_req, res) => {
        res.json({ message: 'Perfil actualizado' });
    }
);

/**
 * Usando el guard específico de usuarios
 */
router.delete('/users/:userId',
    authenticateToken,
    UserRouteGuards.ownerOrAdmin('userId'),
    (_req, res) => {
        res.json({ message: 'Usuario eliminado' });
    }
);

// ============================================================================
// EJEMPLOS DE RUTAS DE CONCURSOS CON GUARDS ESPECÍFICOS
// ============================================================================

/**
 * Crear concurso - solo ADMIN
 */
router.post('/contests',
    authenticateToken,
    ContestRouteGuards.createContest,
    (_req, res) => {
        res.json({ message: 'Concurso creado' });
    }
);

/**
 * Participar en concurso - PARTICIPANTE, JURADO, ADMIN
 */
router.post('/contests/:contestId/participate',
    authenticateToken,
    ContestRouteGuards.participateInContest,
    (_req, res) => {
        res.json({ message: 'Inscripción exitosa' });
    }
);

/**
 * Evaluar concurso - JURADO, ADMIN
 */
router.post('/contests/:contestId/evaluate',
    authenticateToken,
    ContestRouteGuards.evaluateContest,
    (_req, res) => {
        res.json({ message: 'Evaluación registrada' });
    }
);

// ============================================================================
// EJEMPLOS DE RUTAS DE MEDIOS CON GUARDS ESPECÍFICOS
// ============================================================================

/**
 * Subir medios para concursos
 */
router.post('/media/upload',
    authenticateToken,
    MediaRouteGuards.uploadMedia,
    (_req, res) => {
        res.json({ message: 'Medio subido' });
    }
);

/**
 * Subir medios para CMS
 */
router.post('/cms/media/upload',
    authenticateToken,
    MediaRouteGuards.uploadCMSMedia,
    (_req, res) => {
        res.json({ message: 'Medio CMS subido' });
    }
);

/**
 * Subir medios específicamente para CMS (usando middleware específico)
 */
router.post('/cms/media/upload-specific',
    authenticateToken,
    requireCMSMediaUploadPermission,
    (_req, res) => {
        res.json({ message: 'Medio CMS subido con permisos específicos' });
    }
);

/**
 * Ver medios con lógica compleja de permisos
 */
router.get('/media/:mediaId',
    authenticateToken,
    MediaRouteGuards.viewMediaOwnerOrEvaluator,
    (_req, res) => {
        res.json({ media: {} });
    }
);

// ============================================================================
// EJEMPLOS DE RUTAS DE EVALUACIÓN CON GUARDS ESPECÍFICOS
// ============================================================================

/**
 * Crear evaluación
 */
router.post('/evaluations',
    authenticateToken,
    EvaluationRouteGuards.createEvaluation,
    (_req, res) => {
        res.json({ message: 'Evaluación creada' });
    }
);

/**
 * Editar evaluación propia
 */
router.put('/evaluations/:evaluationId',
    authenticateToken,
    EvaluationRouteGuards.editEvaluationOwnerOrAdmin('juradoId'),
    (_req, res) => {
        res.json({ message: 'Evaluación actualizada' });
    }
);

/**
 * Gestionar criterios
 */
router.post('/criteria',
    authenticateToken,
    EvaluationRouteGuards.manageCriteria,
    (_req, res) => {
        res.json({ message: 'Criterio creado' });
    }
);

// ============================================================================
// EJEMPLOS DE RUTAS DE CONTENIDO CON GUARDS ESPECÍFICOS
// ============================================================================

/**
 * Crear contenido general
 */
router.post('/content',
    authenticateToken,
    ContentRouteGuards.createContent,
    (_req, res) => {
        res.json({ message: 'Contenido creado' });
    }
);

/**
 * Crear blog post específico
 */
router.post('/blog/posts',
    authenticateToken,
    requireContentAdminPermission('blog_post', 'create'),
    (_req, res) => {
        res.json({ message: 'Blog post creado' });
    }
);

/**
 * Editar página estática
 */
router.put('/cms/pages/:pageId',
    authenticateToken,
    requireContentAdminPermission('pagina_estatica', 'edit'),
    requireContentOwnershipOrAdmin('authorId'),
    (_req, res) => {
        res.json({ message: 'Página actualizada' });
    }
);

/**
 * Gestionar SEO
 */
router.put('/content/:contentId/seo',
    authenticateToken,
    requireSEOManagementPermission,
    (_req, res) => {
        res.json({ message: 'SEO actualizado' });
    }
);

/**
 * Gestionar newsletter
 */
router.post('/newsletter/send',
    authenticateToken,
    requireNewsletterPermission,
    (_req, res) => {
        res.json({ message: 'Newsletter enviado' });
    }
);

/**
 * Moderar comentarios
 */
router.put('/comments/:commentId/moderate',
    authenticateToken,
    requireCommentModerationPermission,
    (_req, res) => {
        res.json({ message: 'Comentario moderado' });
    }
);

// ============================================================================
// EJEMPLOS DE RUTAS CON GUARDS COMPUESTOS
// ============================================================================

/**
 * Ruta que requiere múltiples validaciones en secuencia
 */
router.post('/admin/contests/special',
    authenticateToken,
    createCompositeGuard(
        requireAdmin,
        ContestRouteGuards.createContest,
        SystemRouteGuards.configureSystem
    ),
    (_req, res) => {
        res.json({ message: 'Concurso especial creado' });
    }
);

/**
 * Ruta que permite acceso si se cumple cualquiera de las condiciones
 */
router.get('/content/preview/:contentId',
    authenticateToken,
    createOrGuard(
        ContentRouteGuards.editContent,
        requireContentOwnershipOrAdmin('authorId'),
        requireAdmin
    ),
    (_req, res) => {
        res.json({ content: {} });
    }
);

// ============================================================================
// EJEMPLOS DE RUTAS DE COMUNIDAD
// ============================================================================

/**
 * Crear comentarios
 */
router.post('/comments',
    authenticateToken,
    CommunityRouteGuards.createComment,
    (_req, res) => {
        res.json({ message: 'Comentario creado' });
    }
);

/**
 * Gestionar seguimientos
 */
router.post('/follow/:userId',
    authenticateToken,
    CommunityRouteGuards.manageFollows,
    (_req, res) => {
        res.json({ message: 'Usuario seguido' });
    }
);

// ============================================================================
// EJEMPLOS DE RUTAS DE SISTEMA Y ANALYTICS
// ============================================================================

/**
 * Ver analytics
 */
router.get('/admin/analytics',
    authenticateToken,
    SystemRouteGuards.viewAnalytics,
    (_req, res) => {
        res.json({ analytics: {} });
    }
);

/**
 * Configurar sistema
 */
router.put('/admin/system/settings',
    authenticateToken,
    SystemRouteGuards.configureSystem,
    (_req, res) => {
        res.json({ message: 'Sistema configurado' });
    }
);

// ============================================================================
// EJEMPLOS DE RUTAS CON VALIDACIONES COMPLEJAS
// ============================================================================

/**
 * Ruta que combina múltiples tipos de validaciones
 */
router.put('/contests/:contestId/media/:mediaId/evaluate',
    authenticateToken,
    // Verificar que es jurado
    requireRole(['JURADO', 'ADMIN']),
    // Verificar permisos de evaluación
    EvaluationRouteGuards.createEvaluation,
    // Verificar acceso al medio
    MediaRouteGuards.viewAssignedMedia,
    (_req, res) => {
        res.json({ message: 'Evaluación de medio registrada' });
    }
);

/**
 * Ruta administrativa compleja
 */
router.post('/admin/contests/:contestId/publish-results',
    authenticateToken,
    // Debe ser admin
    requireAdmin,
    // Debe tener permisos de gestión de concursos
    ContestRouteGuards.manageAllContests,
    // Debe tener acceso a analytics para verificar completitud
    SystemRouteGuards.viewAnalytics,
    (_req, res) => {
        res.json({ message: 'Resultados publicados' });
    }
);

export default router;