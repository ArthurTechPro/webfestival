import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import PublicRoute from '../components/auth/PublicRoute';

/**
 * Página de inicio de sesión
 * Diseño profesional de dos paneles a pantalla completa
 */
const LoginPage: React.FC = () => {
  // Agregar clase no-scroll al body cuando se monta el componente
  React.useEffect(() => {
    document.body.classList.add('wf-no-scroll');
    
    // Cleanup: remover la clase cuando se desmonta
    return () => {
      document.body.classList.remove('wf-no-scroll');
    };
  }, []);

  return (
    <PublicRoute>
      <LoginForm />
    </PublicRoute>
  );
};

export default LoginPage;