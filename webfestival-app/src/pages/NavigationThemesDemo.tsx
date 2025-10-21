import React from 'react';
import { NavigationThemeDemo } from '../components/navigation';
import { useTheme } from '../hooks/useTheme';

/**
 * Página de demostración para la integración de navegación con sistema de temas SCSS
 * Muestra todos los 9 temas disponibles y sus efectos en la navegación
 */
const NavigationThemesDemo: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="wf-min-h-screen wf-bg-gray-100">
      {/* Header de la página */}
      <div className="wf-bg-white wf-shadow-sm wf-border-b">
        <div className="wf-max-w-7xl wf-mx-auto wf-px-4 wf-sm:px-6 wf-lg:px-8 wf-py-6">
          <div className="wf-text-center">
            <h1 className="wf-text-3xl wf-font-bold wf-text-gray-900">
              Sistema de Navegación con Temas SCSS
            </h1>
            <p className="wf-mt-2 wf-text-lg wf-text-gray-600">
              Demostración completa de la integración entre navegación y sistema de temas
            </p>
            <div className="wf-mt-4 wf-flex wf-justify-center wf-space-x-4 wf-text-sm">
              <div className="wf-flex wf-items-center wf-space-x-2">
                <div className="wf-w-3 wf-h-3 wf-bg-green-500 wf-rounded-full"></div>
                <span className="wf-text-gray-600">9 Temas Implementados</span>
              </div>
              <div className="wf-flex wf-items-center wf-space-x-2">
                <div className="wf-w-3 wf-h-3 wf-bg-blue-500 wf-rounded-full"></div>
                <span className="wf-text-gray-600">Efectos Glassmorphism & Neumorphism</span>
              </div>
              <div className="wf-flex wf-items-center wf-space-x-2">
                <div className="wf-w-3 wf-h-3 wf-bg-purple-500 wf-rounded-full"></div>
                <span className="wf-text-gray-600">Transiciones Adaptativas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="wf-max-w-7xl wf-mx-auto wf-px-4 wf-sm:px-6 wf-lg:px-8 wf-py-8">
        {/* Información técnica */}
        <div className="wf-mb-8 wf-bg-white wf-rounded-lg wf-shadow-sm wf-border wf-p-6">
          <h2 className="wf-text-xl wf-font-semibold wf-text-gray-900 wf-mb-4">
            Tarea 12.4: Integración Navegación con Sistema de Temas SCSS
          </h2>
          
          <div className="wf-grid wf-grid-cols-1 wf-md:grid-cols-2 wf-lg:grid-cols-3 wf-gap-6">
            {/* Variables SCSS */}
            <div className="wf-space-y-3">
              <h3 className="wf-font-medium wf-text-gray-800 wf-flex wf-items-center">
                <span className="wf-w-2 wf-h-2 wf-bg-green-500 wf-rounded-full wf-mr-2"></span>
                Variables SCSS Aplicadas
              </h3>
              <ul className="wf-text-sm wf-text-gray-600 wf-space-y-1">
                <li>• Colores adaptativos por tema</li>
                <li>• Espaciado consistente</li>
                <li>• Tipografía unificada</li>
                <li>• Transiciones configurables</li>
              </ul>
            </div>

            {/* Mixins SCSS */}
            <div className="wf-space-y-3">
              <h3 className="wf-font-medium wf-text-gray-800 wf-flex wf-items-center">
                <span className="wf-w-2 wf-h-2 wf-bg-blue-500 wf-rounded-full wf-mr-2"></span>
                Mixins Específicos
              </h3>
              <ul className="wf-text-sm wf-text-gray-600 wf-space-y-1">
                <li>• nav-hover-effect</li>
                <li>• nav-active-effect</li>
                <li>• nav-glassmorphism-adaptive</li>
                <li>• nav-smooth-transitions</li>
              </ul>
            </div>

            {/* Efectos Implementados */}
            <div className="wf-space-y-3">
              <h3 className="wf-font-medium wf-text-gray-800 wf-flex wf-items-center">
                <span className="wf-w-2 wf-h-2 wf-bg-purple-500 wf-rounded-full wf-mr-2"></span>
                Efectos por Tema
              </h3>
              <ul className="wf-text-sm wf-text-gray-600 wf-space-y-1">
                <li>• Glassmorphism (Cinematográficos)</li>
                <li>• Neumorphism (Profesionales)</li>
                <li>• Animaciones adaptativas</li>
                <li>• Sombras contextuales</li>
              </ul>
            </div>
          </div>

          {/* Estado actual */}
          <div className="wf-mt-6 wf-p-4 wf-bg-gray-50 wf-rounded-lg">
            <div className="wf-flex wf-items-center wf-justify-between">
              <div>
                <h4 className="wf-font-medium wf-text-gray-800">Tema Actual</h4>
                <p className="wf-text-sm wf-text-gray-600">
                  Todos los efectos se adaptan automáticamente al tema seleccionado
                </p>
              </div>
              <div className="wf-px-3 wf-py-1 wf-bg-blue-100 wf-text-blue-800 wf-rounded-full wf-text-sm wf-font-medium">
                {theme || 'looper'}
              </div>
            </div>
          </div>
        </div>

        {/* Componente de demostración */}
        <NavigationThemeDemo />

        {/* Documentación técnica */}
        <div className="wf-mt-8 wf-bg-white wf-rounded-lg wf-shadow-sm wf-border wf-p-6">
          <h2 className="wf-text-xl wf-font-semibold wf-text-gray-900 wf-mb-4">
            Documentación Técnica
          </h2>
          
          <div className="wf-space-y-6">
            {/* Estructura de archivos */}
            <div>
              <h3 className="wf-font-medium wf-text-gray-800 wf-mb-2">Estructura de Archivos SCSS</h3>
              <div className="wf-bg-gray-50 wf-rounded-lg wf-p-4 wf-font-mono wf-text-sm">
                <div className="wf-space-y-1">
                  <div>src/styles/</div>
                  <div className="wf-ml-4">├── globals/</div>
                  <div className="wf-ml-8">├── _variables.scss</div>
                  <div className="wf-ml-8">├── _mixins.scss</div>
                  <div className="wf-ml-8">└── _themes.scss</div>
                  <div className="wf-ml-4">├── components/</div>
                  <div className="wf-ml-8">└── _navigation.scss</div>
                  <div className="wf-ml-4">└── globals.scss</div>
                </div>
              </div>
            </div>

            {/* Temas disponibles */}
            <div>
              <h3 className="wf-font-medium wf-text-gray-800 wf-mb-2">Temas Implementados (9 total)</h3>
              <div className="wf-grid wf-grid-cols-1 wf-md:grid-cols-2 wf-gap-4">
                <div>
                  <h4 className="wf-text-sm wf-font-medium wf-text-gray-700 wf-mb-2">Profesionales (5)</h4>
                  <ul className="wf-text-sm wf-text-gray-600 wf-space-y-1">
                    <li>• looper - Basado en template Looper</li>
                    <li>• corporate - Diseño corporativo moderno</li>
                    <li>• minimal - Minimalismo elegante</li>
                    <li>• elegant - Elegancia profesional</li>
                    <li>• dark-professional - Profesional oscuro</li>
                  </ul>
                </div>
                <div>
                  <h4 className="wf-text-sm wf-font-medium wf-text-gray-700 wf-mb-2">Cinematográficos (4)</h4>
                  <ul className="wf-text-sm wf-text-gray-600 wf-space-y-1">
                    <li>• cinematic - Tema cinematográfico original</li>
                    <li>• neon - Efectos neon futuristas</li>
                    <li>• retro - Estética retro-futurista</li>
                    <li>• cyberpunk - Inspirado en cyberpunk</li>
                    <li>• ocean - Profundidades oceánicas</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Características técnicas */}
            <div>
              <h3 className="wf-font-medium wf-text-gray-800 wf-mb-2">Características Técnicas</h3>
              <div className="wf-grid wf-grid-cols-1 wf-md:grid-cols-3 wf-gap-4 wf-text-sm">
                <div className="wf-bg-green-50 wf-p-3 wf-rounded-lg">
                  <h4 className="wf-font-medium wf-text-green-800">Adaptación Automática</h4>
                  <p className="wf-text-green-700 wf-mt-1">
                    Los colores y efectos se adaptan automáticamente según el tema seleccionado
                  </p>
                </div>
                <div className="wf-bg-blue-50 wf-p-3 wf-rounded-lg">
                  <h4 className="wf-font-medium wf-text-blue-800">Efectos Contextuales</h4>
                  <p className="wf-text-blue-700 wf-mt-1">
                    Glassmorphism para temas cinematográficos, neumorphism para profesionales
                  </p>
                </div>
                <div className="wf-bg-purple-50 wf-p-3 wf-rounded-lg">
                  <h4 className="wf-font-medium wf-text-purple-800">Optimización Responsive</h4>
                  <p className="wf-text-purple-700 wf-mt-1">
                    Navegación optimizada para móvil, tablet y desktop
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationThemesDemo;