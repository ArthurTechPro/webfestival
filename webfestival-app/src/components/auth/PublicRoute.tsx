import React from 'react';
import { Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import RoleBasedRedirect from './RoleBasedRedirect';

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * Componente para rutas públicas que redirigen si el usuario ya está autenticado
 * (como login, register, etc.)
 */
const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

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

  // Redirigir al dashboard apropiado según el rol si ya está autenticado
  if (isAuthenticated) {
    return <RoleBasedRedirect />;
  }

  // Usuario no autenticado, mostrar contenido público
  return <>{children}</>;
};

export default PublicRoute;