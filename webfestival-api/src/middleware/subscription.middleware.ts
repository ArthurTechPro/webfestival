import { Request, Response, NextFunction } from 'express';
import { subscriptionService } from '../services/subscription.service';

/**
 * Middleware para verificar si el usuario puede participar en concursos
 */
export const checkParticipationLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const canParticipate = await subscriptionService.canUserPerformAction(userId, 'participate');
    
    if (!canParticipate) {
      res.status(403).json({
        success: false,
        error: 'Has alcanzado el límite de participación en concursos para tu plan actual',
        code: 'PARTICIPATION_LIMIT_EXCEEDED'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error al verificar límite de participación:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al verificar límites'
    });
  }
};

/**
 * Middleware para verificar si el usuario puede subir medios
 */
export const checkUploadLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const canUpload = await subscriptionService.canUserPerformAction(userId, 'upload');
    
    if (!canUpload) {
      res.status(403).json({
        success: false,
        error: 'Has alcanzado el límite de subidas de medios para tu plan actual',
        code: 'UPLOAD_LIMIT_EXCEEDED'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error al verificar límite de subida:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al verificar límites'
    });
  }
};

/**
 * Middleware para verificar si el usuario puede crear concursos privados
 */
export const checkPrivateContestLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const canCreatePrivate = await subscriptionService.canUserPerformAction(userId, 'create_private');
    
    if (!canCreatePrivate) {
      res.status(403).json({
        success: false,
        error: 'Tu plan actual no permite crear concursos privados o has alcanzado el límite',
        code: 'PRIVATE_CONTEST_LIMIT_EXCEEDED'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error al verificar límite de concursos privados:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al verificar límites'
    });
  }
};

/**
 * Middleware para verificar si el usuario puede agregar miembros al equipo
 */
export const checkTeamMemberLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const canAddMember = await subscriptionService.canUserPerformAction(userId, 'add_member');
    
    if (!canAddMember) {
      res.status(403).json({
        success: false,
        error: 'Has alcanzado el límite de miembros de equipo para tu plan actual',
        code: 'TEAM_MEMBER_LIMIT_EXCEEDED'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error al verificar límite de miembros de equipo:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al verificar límites'
    });
  }
};

/**
 * Middleware para verificar si el usuario tiene acceso a analytics
 */
export const checkAnalyticsAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const limits = await subscriptionService.checkUsageLimits(userId);
    
    if (!limits.hasAnalyticsAccess) {
      res.status(403).json({
        success: false,
        error: 'Tu plan actual no incluye acceso a analytics',
        code: 'ANALYTICS_ACCESS_DENIED'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error al verificar acceso a analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al verificar acceso'
    });
  }
};

/**
 * Middleware para verificar si el usuario tiene acceso a la API
 */
export const checkAPIAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
      return;
    }

    const limits = await subscriptionService.checkUsageLimits(userId);
    
    if (!limits.hasApiAccess) {
      res.status(403).json({
        success: false,
        error: 'Tu plan actual no incluye acceso a la API',
        code: 'API_ACCESS_DENIED'
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error al verificar acceso a API:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor al verificar acceso'
    });
  }
};

/**
 * Middleware genérico para verificar límites de suscripción
 */
export const checkSubscriptionLimit = (action: 'participate' | 'upload' | 'create_private' | 'add_member') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          error: 'Usuario no autenticado'
        });
        return;
      }

      const canPerform = await subscriptionService.canUserPerformAction(userId, action);
      
      if (!canPerform) {
        const errorMessages = {
          participate: 'Has alcanzado el límite de participación en concursos para tu plan actual',
          upload: 'Has alcanzado el límite de subidas de medios para tu plan actual',
          create_private: 'Tu plan actual no permite crear concursos privados o has alcanzado el límite',
          add_member: 'Has alcanzado el límite de miembros de equipo para tu plan actual'
        };

        const errorCodes = {
          participate: 'PARTICIPATION_LIMIT_EXCEEDED',
          upload: 'UPLOAD_LIMIT_EXCEEDED',
          create_private: 'PRIVATE_CONTEST_LIMIT_EXCEEDED',
          add_member: 'TEAM_MEMBER_LIMIT_EXCEEDED'
        };

        res.status(403).json({
          success: false,
          error: errorMessages[action],
          code: errorCodes[action]
        });
        return;
      }

      next();
    } catch (error) {
      console.error(`Error al verificar límite de ${action}:`, error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor al verificar límites'
      });
    }
  };
};

/**
 * Middleware para incrementar el uso después de una acción exitosa
 */
export const incrementUsage = (metric: 'concursos_used' | 'uploads_used' | 'private_contests_used' | 'team_members_used') => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        next();
        return;
      }

      const subscription = await subscriptionService.getUserSubscription(userId);
      
      if (subscription) {
        await subscriptionService.incrementUsage(subscription.id, metric);
      }

      next();
    } catch (error) {
      console.error(`Error al incrementar uso de ${metric}:`, error);
      // No bloqueamos la respuesta por errores de tracking
      next();
    }
  };
};

/**
 * Middleware para obtener información de suscripción y agregarla al request
 */
export const attachSubscriptionInfo = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (userId) {
      const subscription = await subscriptionService.getUserSubscription(userId);
      const limits = await subscriptionService.checkUsageLimits(userId);
      
      (req as any).subscription = subscription;
      (req as any).limits = limits;
    }

    next();
  } catch (error) {
    console.error('Error al obtener información de suscripción:', error);
    // No bloqueamos la respuesta por errores de información adicional
    next();
  }
};