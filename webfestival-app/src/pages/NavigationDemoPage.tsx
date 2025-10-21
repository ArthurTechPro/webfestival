import React from 'react';
import { MainLayout } from '../components/layout';
import { useNavigation, useNavigationState, useNavigationControls } from '../hooks/useNavigation';
import { Icon } from '../components/ui';

/**
 * Página de demostración del sistema de navegación
 * Muestra cómo usar los componentes y hooks de navegación
 */
const NavigationDemoPage: React.FC = () => {
  const { sideMenuItems, userMenuOptions } = useNavigation();
  const { isSideMenuCollapsed, isMobile, activeMenuItem } = useNavigationState();
  const { toggleSideMenu } = useNavigationControls();

  return (
    <MainLayout>
      <div className="wf-max-w-4xl wf-mx-auto">
        <h1 className="wf-text-3xl wf-font-bold wf-text-gray-900 wf-mb-8">
          Sistema de Navegación - Demo
        </h1>

        {/* Estado actual */}
        <div className="wf-bg-white wf-rounded-lg wf-shadow wf-p-6 wf-mb-8">
          <h2 className="wf-text-xl wf-font-semibold wf-mb-4">Estado Actual</h2>
          <div className="wf-grid wf-grid-cols-1 wf-md:grid-cols-3 wf-gap-4">
            <div className="wf-bg-gray-50 wf-p-4 wf-rounded">
              <div className="wf-text-sm wf-text-gray-600">Menú Colapsado</div>
              <div className="wf-text-lg wf-font-medium">
                {isSideMenuCollapsed ? 'Sí' : 'No'}
              </div>
            </div>
            <div className="wf-bg-gray-50 wf-p-4 wf-rounded">
              <div className="wf-text-sm wf-text-gray-600">Es Móvil</div>
              <div className="wf-text-lg wf-font-medium">
                {isMobile ? 'Sí' : 'No'}
              </div>
            </div>
            <div className="wf-bg-gray-50 wf-p-4 wf-rounded">
              <div className="wf-text-sm wf-text-gray-600">Elemento Activo</div>
              <div className="wf-text-lg wf-font-medium">
                {activeMenuItem}
              </div>
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="wf-bg-white wf-rounded-lg wf-shadow wf-p-6 wf-mb-8">
          <h2 className="wf-text-xl wf-font-semibold wf-mb-4">Controles</h2>
          <div className="wf-flex wf-space-x-4">
            <button
              onClick={toggleSideMenu}
              className="wf-px-4 wf-py-2 wf-bg-blue-600 wf-text-white wf-rounded wf-hover:bg-blue-700 wf-transition-colors"
            >
              Toggle Menú Lateral
            </button>
          </div>
        </div>

        {/* Elementos del menú */}
        <div className="wf-bg-white wf-rounded-lg wf-shadow wf-p-6 wf-mb-8">
          <h2 className="wf-text-xl wf-font-semibold wf-mb-4">Elementos del Menú Lateral</h2>
          <div className="wf-space-y-2">
            {sideMenuItems.map((item) => (
              <div key={item.id} className="wf-flex wf-items-center wf-space-x-3 wf-p-2 wf-border wf-rounded">
                <Icon name={item.icon} size="md" />
                <span className="wf-font-medium">{item.label}</span>
                {item.submenu && (
                  <span className="wf-text-xs wf-bg-gray-200 wf-px-2 wf-py-1 wf-rounded">
                    {item.submenu.length} submenús
                  </span>
                )}
                {item.badge && (
                  <span className="wf-w-2 wf-h-2 wf-bg-red-500 wf-rounded-full" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Opciones del menú de usuario */}
        <div className="wf-bg-white wf-rounded-lg wf-shadow wf-p-6">
          <h2 className="wf-text-xl wf-font-semibold wf-mb-4">Opciones del Menú de Usuario</h2>
          <div className="wf-space-y-2">
            {userMenuOptions.map((option, index) => (
              <div key={index} className="wf-flex wf-items-center wf-space-x-3 wf-p-2 wf-border wf-rounded">
                <Icon name={option.icon} size="md" />
                <span className="wf-font-medium">{option.label}</span>
                {option.badge && (
                  <span className="wf-w-2 wf-h-2 wf-bg-red-500 wf-rounded-full" />
                )}
                {option.action && (
                  <span className="wf-text-xs wf-bg-yellow-200 wf-px-2 wf-py-1 wf-rounded">
                    Acción: {option.action}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Información adicional */}
        <div className="wf-mt-8 wf-text-sm wf-text-gray-600">
          <p>
            Esta página demuestra el uso del sistema de navegación implementado.
            Los componentes se adaptan automáticamente según el rol del usuario autenticado
            y el tamaño de la pantalla.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default NavigationDemoPage;