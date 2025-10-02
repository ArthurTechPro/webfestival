import { Request, Response, NextFunction } from 'express';
import { hasPermission, UserRole, requirePermission } from './auth';

/**
 * Guards específicos para rutas de concursos
 */
export class ContestRouteGuards {
    /**
     * Guard para crear concursos - solo ADMIN
     */
    static createContest = requirePermission('contest:create');

    /**
     * Guard para editar concursos - solo ADMIN
     */
    static editContest = requirePermission('contest:edit');

    /**
     * Guard para eliminar concursos - solo ADMIN
     */
    static deleteContest = requirePermission('contest:delete');

    /**
     * Guard para gestionar todos los concursos - solo ADMIN
     */
    static manageAllContests = requirePermission('contest:manage_all');

    /**
     * Guard para participar en concursos - PARTICIPANTE, JURADO, ADMIN
     */
    static participateInContest = requirePermission('contest:participate');

    /**
     * Guard para evaluar concursos - JURADO, ADMIN
     */
    static evaluateContest = requirePermission('contest:evaluate');

    /**
     * Guard para ver concursos - todos los roles autenticados
     */
    static viewContest = requirePermission('contest:view');
}

/**
 * Guards específicos para rutas de usuarios
 */
export class UserRouteGuards {
    /**
     * Guard para gestionar usuarios - solo ADMIN
     */
    static manageUsers = requirePermission('user:manage');

    /**
     * Guard para asignar roles - solo ADMIN
     */
    static assignRoles = requirePermission('role:assign');

    /**
     * Guard para editar perfil propio - todos los roles autenticados
     */
    static editOwnProfile = requirePermission('profile:edit_own');

    /**
     * Guard que permite acceso al propietario del recurso o a ADMIN
     */
    static ownerOrAdmin = (userIdParam: string = 'userId') => {
        return (req: Request, res: Response, next: NextFunction): void => {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Autenticación requerida',
                    code: 'AUTH_REQUIRED'
                });
                return;
            }

            const targetUserId = req.params[userIdParam] || req.body[userIdParam];
            const userRole = req.user.role as UserRole;

            // Si es ADMIN, permitir acceso
            if (userRole === 'ADMIN') {
                next();
                return;
            }

            // Si es el propietario del recurso, permitir acceso
            if (req.user['userId'] === targetUserId) {
                next();
                return;
            }

            res.status(403).json({
                success: false,
                error: 'Solo puedes acceder a tus propios recursos',
                code: 'OWNERSHIP_REQUIRED',
                details: {
                    target_user_id: targetUserId,
                    current_user_id: req.user['userId']
                }
            });
        };
    };
}

/**
 * Guards específicos para rutas de medios multimedia
 */
export class MediaRouteGuards {
    /**
     * Guard para subir medios - PARTICIPANTE, JURADO, ADMIN
     */
    static uploadMedia = requirePermission('media:upload');

    /**
     * Guard para subir medios al CMS - CONTENT_ADMIN, ADMIN
     */
    static uploadCMSMedia = requirePermission('media:upload_cms');

    /**
     * Guard para ver medios propios - todos los roles autenticados
     */
    static viewOwnMedia = requirePermission('media:view_own');

    /**
     * Guard para ver medios asignados (jurados) - JURADO, ADMIN
     */
    static viewAssignedMedia = requirePermission('media:view_assigned');

    /**
     * Guard que permite ver medios propios o ser JURADO/ADMIN
     */
    static viewMediaOwnerOrEvaluator = (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Autenticación requerida',
                code: 'AUTH_REQUIRED'
            });
            return;
        }

        const userRole = req.user.role as UserRole;
        const mediaUserId = req.params['userId'] || req.body.usuario_id;

        // Si es ADMIN, permitir acceso completo
        if (userRole === 'ADMIN') {
            next();
            return;
        }

        // Si es JURADO, verificar si tiene permisos de evaluación
        if (userRole === 'JURADO' && hasPermission(userRole, 'media:view_assigned')) {
            next();
            return;
        }

        // Si es el propietario del medio
        if (req.user['userId'] === mediaUserId) {
            next();
            return;
        }

        res.status(403).json({
            success: false,
            error: 'No tienes permisos para ver este medio',
            code: 'MEDIA_ACCESS_DENIED',
            details: {
                media_user_id: mediaUserId,
                current_user_id: req.user['userId'],
                role: userRole
            }
        });
    };
}

/**
 * Guards específicos para rutas de evaluación
 */
export class EvaluationRouteGuards {
    /**
     * Guard para crear evaluaciones - JURADO, ADMIN
     */
    static createEvaluation = requirePermission('evaluation:create');

    /**
     * Guard para editar evaluaciones propias - JURADO, ADMIN
     */
    static editOwnEvaluation = requirePermission('evaluation:edit_own');

    /**
     * Guard para gestionar criterios - ADMIN
     */
    static manageCriteria = requirePermission('criteria:manage');

    /**
     * Guard para asignar jurados - ADMIN
     */
    static assignJury = requirePermission('jury:assign');

    /**
     * Guard que permite editar evaluación propia o ser ADMIN
     */
    static editEvaluationOwnerOrAdmin = (juradoIdParam: string = 'juradoId') => {
        return (req: Request, res: Response, next: NextFunction): void => {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Autenticación requerida',
                    code: 'AUTH_REQUIRED'
                });
                return;
            }

            const targetJuradoId = req.params[juradoIdParam] || req.body[juradoIdParam];
            const userRole = req.user.role as UserRole;

            // Si es ADMIN, permitir acceso
            if (userRole === 'ADMIN') {
                next();
                return;
            }

            // Si es el jurado que hizo la evaluación
            if (req.user['userId'] === targetJuradoId) {
                next();
                return;
            }

            res.status(403).json({
                success: false,
                error: 'Solo puedes editar tus propias evaluaciones',
                code: 'EVALUATION_OWNERSHIP_REQUIRED',
                details: {
                    target_jurado_id: targetJuradoId,
                    current_user_id: req.user['userId']
                }
            });
        };
    };
}

/**
 * Guards específicos para rutas de contenido y CMS
 */
export class ContentRouteGuards {
    /**
     * Guard para crear contenido - CONTENT_ADMIN, ADMIN
     */
    static createContent = requirePermission('content:create');

    /**
     * Guard para editar contenido - CONTENT_ADMIN, ADMIN
     */
    static editContent = requirePermission('content:edit');

    /**
     * Guard para publicar contenido - CONTENT_ADMIN, ADMIN
     */
    static publishContent = requirePermission('content:publish');

    /**
     * Guard para eliminar contenido - CONTENT_ADMIN, ADMIN
     */
    static deleteContent = requirePermission('content:delete');

    /**
     * Guard para gestionar CMS - CONTENT_ADMIN, ADMIN
     */
    static manageCMS = requirePermission('cms:manage');

    /**
     * Guard para gestionar blog - CONTENT_ADMIN, ADMIN
     */
    static manageBlog = requirePermission('blog:manage');

    /**
     * Guard para gestionar SEO - CONTENT_ADMIN, ADMIN
     */
    static manageSEO = requirePermission('seo:manage');

    /**
     * Guard para gestionar newsletter - CONTENT_ADMIN, ADMIN
     */
    static manageNewsletter = requirePermission('newsletter:manage');

    /**
     * Guard para gestionar taxonomía - CONTENT_ADMIN, ADMIN
     */
    static manageTaxonomy = requirePermission('taxonomy:manage');
}

/**
 * Guards específicos para rutas de comunidad
 */
export class CommunityRouteGuards {
    /**
     * Guard para crear comentarios - todos los roles autenticados
     */
    static createComment = requirePermission('comment:create');

    /**
     * Guard para gestionar seguimientos - todos los roles autenticados
     */
    static manageFollows = requirePermission('follow:manage');

    /**
     * Guard para gestionar especializaciones propias - JURADO, ADMIN
     */
    static manageOwnSpecialization = requirePermission('specialization:manage_own');
}

/**
 * Guards específicos para rutas de sistema y analytics
 */
export class SystemRouteGuards {
    /**
     * Guard para ver analytics - ADMIN
     */
    static viewAnalytics = requirePermission('analytics:view');

    /**
     * Guard para configurar sistema - ADMIN
     */
    static configureSystem = requirePermission('system:configure');

    /**
     * Guard para gestionar suscripciones - ADMIN
     */
    static manageSubscriptions = requirePermission('subscription:manage');
}

/**
 * Guard compuesto que verifica múltiples condiciones
 */
export const createCompositeGuard = (...guards: Array<(req: Request, res: Response, next: NextFunction) => void>) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        let guardIndex = 0;

        const runNextGuard = (): void => {
            if (guardIndex >= guards.length) {
                next();
                return;
            }

            const currentGuard = guards[guardIndex];
            if (!currentGuard) {
                runNextGuard();
                return;
            }

            guardIndex++;

            // Crear un next personalizado que continúe con el siguiente guard
            const guardNext = (error?: any): void => {
                if (error) {
                    next(error);
                    return;
                }
                runNextGuard();
            };

            currentGuard(req, res, guardNext);
        };

        runNextGuard();
    };
};

/**
 * Guard que permite acceso si se cumple al menos una de las condiciones
 */
export const createOrGuard = (...guards: Array<(req: Request, res: Response, next: NextFunction) => void>) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        let guardIndex = 0;
        let lastError: any = null;

        const tryNextGuard = (): void => {
            if (guardIndex >= guards.length) {
                // Si ningún guard pasó, enviar el último error
                if (lastError) {
                    res.status(403).json({
                        success: false,
                        error: 'No tienes permisos para realizar esta acción',
                        code: 'ACCESS_DENIED'
                    });
                } else {
                    next();
                }
                return;
            }

            const currentGuard = guards[guardIndex];
            if (!currentGuard) {
                tryNextGuard();
                return;
            }

            guardIndex++;

            // Crear un next personalizado que capture errores
            const guardNext = (error?: any): void => {
                if (error) {
                    lastError = error;
                    tryNextGuard(); // Intentar con el siguiente guard
                    return;
                }
                // Si este guard pasó, continuar
                next();
            };

            // Crear un res personalizado que capture respuestas de error
            const mockRes = {
                ...res,
                status: (code: number) => ({
                    json: (data: any) => {
                        lastError = { status: code, ...data };
                        tryNextGuard(); // Intentar con el siguiente guard
                    }
                })
            } as Response;

            currentGuard(req, mockRes, guardNext);
        };

        tryNextGuard();
    };
};

export default {
    ContestRouteGuards,
    UserRouteGuards,
    MediaRouteGuards,
    EvaluationRouteGuards,
    ContentRouteGuards,
    CommunityRouteGuards,
    SystemRouteGuards,
    createCompositeGuard,
    createOrGuard
};