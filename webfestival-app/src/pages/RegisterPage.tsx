import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';
import PublicRoute from '../components/auth/PublicRoute';

/**
 * Página de registro con diseño minimalista mejorado
 */
const RegisterPage: React.FC = () => {
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
      <RegisterForm />
    </PublicRoute>
  );
};

export default RegisterPage;