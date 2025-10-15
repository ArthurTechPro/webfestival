import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';
import PublicRoute from '../components/auth/PublicRoute';
import { Card } from '../components/ui';

/**
 * Página simple y elegante de registro
 */
const RegisterPage: React.FC = () => {
  return (
    <PublicRoute>
      <div className="wf-w-full wf-min-h-screen wf-bg-gradient-to-br wf-from-blue-900 wf-to-black wf-flex wf-items-center wf-justify-center wf-pt-16 wf-px-6">
        <div className="wf-w-full wf-max-w-lg">
          <Card variant="glass" className="wf-p-8">
            {/* Logo */}
            <div className="wf-text-center wf-mb-8">
              <div className="wf-flex wf-items-center wf-justify-center wf-mb-4">
                <div className="wf-text-4xl wf-mr-3">🎭</div>
                <div>
                  <h1 className="wf-text-2xl wf-font-bold wf-text-primary wf-mb-0">
                    WebFestival
                  </h1>
                  <p className="wf-text-sm wf-text-gray-400 wf-mb-0">
                    Únete a la Comunidad Creativa
                  </p>
                </div>
              </div>
              
              <h2 className="wf-text-xl wf-font-semibold wf-text-white wf-mb-2">
                Crear Cuenta de Artista
              </h2>
              <p className="wf-text-sm wf-text-gray-400">
                Regístrate y participa en concursos multimedia
              </p>
            </div>
            
            {/* Características destacadas */}
            <div className="wf-grid wf-grid-cols-2 wf-gap-3 wf-mb-6">
              <div className="wf-text-center wf-p-3 wf-bg-gray-800 wf-rounded-lg wf-border wf-border-gray-700">
                <div className="wf-text-xl wf-mb-1">📸</div>
                <p className="wf-text-xs wf-text-gray-400">Fotografía</p>
              </div>
              <div className="wf-text-center wf-p-3 wf-bg-gray-800 wf-rounded-lg wf-border wf-border-gray-700">
                <div className="wf-text-xl wf-mb-1">🎬</div>
                <p className="wf-text-xs wf-text-gray-400">Video</p>
              </div>
              <div className="wf-text-center wf-p-3 wf-bg-gray-800 wf-rounded-lg wf-border wf-border-gray-700">
                <div className="wf-text-xl wf-mb-1">🎵</div>
                <p className="wf-text-xs wf-text-gray-400">Audio</p>
              </div>
              <div className="wf-text-center wf-p-3 wf-bg-gray-800 wf-rounded-lg wf-border wf-border-gray-700">
                <div className="wf-text-xl wf-mb-1">🎭</div>
                <p className="wf-text-xs wf-text-gray-400">Cine</p>
              </div>
            </div>
            
            {/* Formulario de registro */}
            <RegisterForm />
            
            {/* Enlaces adicionales */}
            <div className="wf-text-center wf-mt-6 wf-pt-6 wf-border-t wf-border-gray-700">
              <p className="wf-text-sm wf-text-gray-400 wf-mb-3">
                ¿Ya tienes cuenta?
              </p>
              <a 
                href="/login" 
                className="wf-text-primary wf-hover:text-primary-light wf-font-medium wf-transition-colors"
              >
                Iniciar sesión
              </a>
            </div>
          </Card>
          
          {/* Footer */}
          <div className="wf-text-center wf-mt-6">
            <p className="wf-text-xs wf-text-gray-500">
              © 2024 WebFestival. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
};

export default RegisterPage;