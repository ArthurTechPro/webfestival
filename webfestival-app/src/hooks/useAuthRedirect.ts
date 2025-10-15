import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook para manejar redirecciones basadas en autenticación
 */
export const useAuthRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Redirigir a login si no está autenticado
   */
  const redirectToLogin = (redirectTo?: string) => {
    if (!isLoading && !isAuthenticated) {
      const from = redirectTo || location.pathname;
      navigate('/login', { 
        state: { from },
        replace: true 
      });
    }
  };

  /**
   * Redirigir a dashboard si ya está autenticado
   */
  const redirectToDashboard = () => {
    if (!isLoading && isAuthenticated) {
      // Obtener la ruta de origen o ir al dashboard por defecto
      const from = (location.state as { from?: string })?.from || '/dashboard';
      navigate(from, { replace: true });
    }
  };

  /**
   * Redirigir basado en rol del usuario
   */
  const redirectByRole = () => {
    const { user } = useAuth();
    
    if (!isLoading && isAuthenticated && user) {
      switch (user.role) {
        case 'ADMIN':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'JURADO':
          navigate('/jurado/dashboard', { replace: true });
          break;
        case 'CONTENT_ADMIN':
          navigate('/content-admin/dashboard', { replace: true });
          break;
        case 'PARTICIPANTE':
        default:
          navigate('/participante/dashboard', { replace: true });
          break;
      }
    }
  };

  return {
    redirectToLogin,
    redirectToDashboard,
    redirectByRole,
    isLoading,
    isAuthenticated,
  };
};

/**
 * Hook para proteger rutas que requieren autenticación
 */
export const useRequireAuth = (redirectTo?: string) => {
  const { redirectToLogin, isLoading, isAuthenticated } = useAuthRedirect();

  useEffect(() => {
    redirectToLogin(redirectTo);
  }, [isLoading, isAuthenticated, redirectToLogin, redirectTo]);

  return { isLoading, isAuthenticated };
};

/**
 * Hook para proteger rutas que requieren roles específicos
 */
export const useRequireRole = (allowedRoles: string[], redirectTo = '/unauthorized') => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        navigate('/login', { replace: true });
      } else if (user && !allowedRoles.includes(user.role)) {
        navigate(redirectTo, { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, user, allowedRoles, navigate, redirectTo]);

  const hasRequiredRole = user ? allowedRoles.includes(user.role) : false;

  return { 
    isLoading, 
    isAuthenticated, 
    hasRequiredRole,
    user 
  };
};