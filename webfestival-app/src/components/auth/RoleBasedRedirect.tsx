import React from 'react';
import { Navigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Componente que redirige automáticamente según el rol del usuario autenticado
 */
const RoleBasedRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Mostrar spinner mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="text-muted">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirigir según el rol del usuario
  switch (user.role) {
    case 'PARTICIPANTE':
      return <Navigate to="/participante/dashboard" replace />;
    case 'JURADO':
      return <Navigate to="/jurado/dashboard" replace />;
    case 'ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    case 'CONTENT_ADMIN':
      return <Navigate to="/content-admin/dashboard" replace />;
    default:
      // Rol no reconocido, redirigir a página de error
      return <Navigate to="/unauthorized" replace />;
  }
};

export default RoleBasedRedirect;