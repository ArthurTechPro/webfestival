import React, { useState } from 'react';
import { useTheme, type ThemeName } from '../../hooks/useTheme';
import MenuItem from './MenuItem';
import type { MenuItem as MenuItemType } from '../../services/navigation.service';

// Temas disponibles organizados por categoría
const AVAILABLE_THEMES = {
  professional: [
    { id: 'looper', name: 'Looper Professional', description: 'Tema profesional basado en Looper' },
    { id: 'corporate', name: 'Corporate Modern', description: 'Diseño corporativo limpio' },
    { id: 'minimal', name: 'Minimal Clean', description: 'Minimalismo elegante' },
    { id: 'elegant', name: 'Elegant Business', description: 'Elegancia profesional' },
    { id: 'dark-professional', name: 'Dark Professional', description: 'Profesional oscuro' }
  ],
  cinematic: [
    { id: 'cinematic', name: 'Cinematic Dark', description: 'Tema cinematográfico original' },
    { id: 'neon', name: 'Neon Cyber', description: 'Efectos neon futuristas' },
    { id: 'retro', name: 'Retro Wave', description: 'Estética retro-futurista' },
    { id: 'cyberpunk', name: 'Cyberpunk 2077', description: 'Inspirado en cyberpunk' },
    { id: 'ocean', name: 'Ocean Deep', description: 'Profundidades oceánicas' }
  ]
};

// Elementos de menú de demostración
const DEMO_MENU_ITEMS: MenuItemType[] = [
  {
    id: 'dashboard',
    icon: 'home',
    label: 'Dashboard',
    route: '/app/dashboard',
    active: true
  },
  {
    id: 'contests',
    icon: 'trophy',
    label: 'Concursos',
    route: '/app/contests',
    badge: true,
    submenu: [
      { id: 'active-contests', label: 'Activos', route: '/app/contests/active' },
      { id: 'my-submissions', label: 'Mis Envíos', route: '/app/contests/submissions' }
    ]
  },
  {
    id: 'gallery',
    icon: 'image',
    label: 'Galería',
    route: '/app/gallery'
  },
  {
    id: 'community',
    icon: 'users',
    label: 'Comunidad',
    route: '/app/community',
    badge: true
  },
  {
    id: 'profile',
    icon: 'user',
    label: 'Mi Perfil',
    route: '/app/profile'
  }
];

interface NavigationThemeDemoProps {
  className?: string;
}

/**
 * Componente de demostración para mostrar la navegación con diferentes temas
 * Permite cambiar entre temas profesionales y cinematográficos en tiempo real
 */
const NavigationThemeDemo: React.FC<NavigationThemeDemoProps> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<'professional' | 'cinematic'>('professional');
  const [activeMenuItem, setActiveMenuItem] = useState('dashboard');
  const [activeSubMenuItem, setActiveSubMenuItem] = useState<string | undefined>();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleThemeChange = (themeId: string) => {
    setTheme(themeId as ThemeName);
  };

  const handleMenuItemClick = (item: MenuItemType) => {
    setActiveMenuItem(item.id);
    setActiveSubMenuItem(undefined);
  };

  const handleSubMenuItemClick = (subItem: any, parentItem: MenuItemType) => {
    setActiveMenuItem(parentItem.id);
    setActiveSubMenuItem(subItem.id);
  };

  const currentThemeInfo = [...AVAILABLE_THEMES.professional, ...AVAILABLE_THEMES.cinematic]
    .find(themeInfo => themeInfo.id === theme);

  return (
    <div className={`wf-p-6 wf-space-y-6 ${className}`}>
      {/* Header */}
      <div className="wf-text-center wf-space-y-2">
        <h2 className="wf-text-2xl wf-font-bold wf-text-gray-900">
          Demostración de Navegación con Temas
        </h2>
        <p className="wf-text-gray-600">
          Explora cómo se adapta la navegación a diferentes temas profesionales y cinematográficos
        </p>
        {currentThemeInfo && (
          <div className="wf-inline-flex wf-items-center wf-px-3 wf-py-1 wf-bg-blue-100 wf-text-blue-800 wf-rounded-full wf-text-sm">
            <span className="wf-w-2 wf-h-2 wf-bg-blue-500 wf-rounded-full wf-mr-2"></span>
            {currentThemeInfo.name}
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="wf-bg-white wf-rounded-lg wf-shadow-sm wf-border wf-p-4 wf-space-y-4">
        <h3 className="wf-text-lg wf-font-semibold wf-text-gray-900">Controles de Demostración</h3>
        
        {/* Selector de categoría */}
        <div className="wf-flex wf-space-x-4">
          <button
            onClick={() => setSelectedCategory('professional')}
            className={`wf-px-4 wf-py-2 wf-rounded-md wf-font-medium wf-transition-colors ${
              selectedCategory === 'professional'
                ? 'wf-bg-blue-600 wf-text-white'
                : 'wf-bg-gray-100 wf-text-gray-700 wf-hover:bg-gray-200'
            }`}
          >
            Temas Profesionales
          </button>
          <button
            onClick={() => setSelectedCategory('cinematic')}
            className={`wf-px-4 wf-py-2 wf-rounded-md wf-font-medium wf-transition-colors ${
              selectedCategory === 'cinematic'
                ? 'wf-bg-purple-600 wf-text-white'
                : 'wf-bg-gray-100 wf-text-gray-700 wf-hover:bg-gray-200'
            }`}
          >
            Temas Cinematográficos
          </button>
        </div>

        {/* Selector de temas */}
        <div className="wf-grid wf-grid-cols-1 wf-md:grid-cols-2 wf-lg:grid-cols-3 wf-gap-3">
          {AVAILABLE_THEMES[selectedCategory].map((themeOption) => (
            <button
              key={themeOption.id}
              onClick={() => handleThemeChange(themeOption.id)}
              className={`wf-p-3 wf-text-left wf-rounded-lg wf-border wf-transition-all wf-hover:shadow-md ${
                theme === themeOption.id
                  ? 'wf-border-blue-500 wf-bg-blue-50'
                  : 'wf-border-gray-200 wf-hover:border-gray-300'
              }`}
            >
              <div className="wf-font-medium wf-text-gray-900">{themeOption.name}</div>
              <div className="wf-text-sm wf-text-gray-600">{themeOption.description}</div>
            </button>
          ))}
        </div>

        {/* Control de colapso */}
        <div className="wf-flex wf-items-center wf-space-x-3">
          <label className="wf-flex wf-items-center wf-cursor-pointer">
            <input
              type="checkbox"
              checked={isCollapsed}
              onChange={(e) => setIsCollapsed(e.target.checked)}
              className="wf-mr-2"
            />
            <span className="wf-text-sm wf-text-gray-700">Menú colapsado</span>
          </label>
        </div>
      </div>

      {/* Demostración de navegación */}
      <div className="wf-bg-white wf-rounded-lg wf-shadow-sm wf-border wf-overflow-hidden">
        <div className="wf-p-4 wf-border-b wf-bg-gray-50">
          <h3 className="wf-text-lg wf-font-semibold wf-text-gray-900">
            Vista Previa de Navegación
          </h3>
          <p className="wf-text-sm wf-text-gray-600">
            Interactúa con los elementos del menú para ver los efectos en tiempo real
          </p>
        </div>

        <div className="wf-flex">
          {/* Menú lateral de demostración */}
          <div className={`
            wf-side-menu wf-h-96 wf-transition-all wf-duration-300
            ${isCollapsed ? 'wf-w-16' : 'wf-w-64'}
            ${isCollapsed ? 'wf-collapsed' : ''}
          `}>
            <div className="wf-p-2 wf-space-y-1">
              {DEMO_MENU_ITEMS.map((item) => (
                <MenuItem
                  key={item.id}
                  item={item}
                  isActive={activeMenuItem === item.id}
                  isCollapsed={isCollapsed}
                  isMobile={false}
                  showLabels={!isCollapsed}
                  sideMenuBehavior="static"
                  animationsEnabled={true}
                  onItemClick={handleMenuItemClick}
                  onSubItemClick={handleSubMenuItemClick}
                  activeSubItemId={activeSubMenuItem}
                />
              ))}
            </div>
          </div>

          {/* Área de contenido */}
          <div className="wf-flex-1 wf-p-6 wf-bg-gray-50">
            <div className="wf-text-center wf-space-y-4">
              <div className="wf-w-16 wf-h-16 wf-bg-gray-200 wf-rounded-full wf-mx-auto wf-flex wf-items-center wf-justify-center">
                <span className="wf-text-2xl">🎨</span>
              </div>
              <div>
                <h4 className="wf-text-lg wf-font-semibold wf-text-gray-900">
                  Área de Contenido
                </h4>
                <p className="wf-text-gray-600">
                  Los efectos de navegación se adaptan automáticamente al tema seleccionado
                </p>
              </div>
              
              {/* Información del tema actual */}
              {currentThemeInfo && (
                <div className="wf-bg-white wf-rounded-lg wf-p-4 wf-border wf-text-left wf-max-w-md wf-mx-auto">
                  <h5 className="wf-font-semibold wf-text-gray-900 wf-mb-2">
                    Tema Actual: {currentThemeInfo.name}
                  </h5>
                  <p className="wf-text-sm wf-text-gray-600 wf-mb-3">
                    {currentThemeInfo.description}
                  </p>
                  <div className="wf-text-xs wf-text-gray-500">
                    <div>Categoría: {selectedCategory === 'professional' ? 'Profesional' : 'Cinematográfico'}</div>
                    <div>Efectos: {selectedCategory === 'professional' ? 'Neumorphism, Sombras suaves' : 'Glassmorphism, Efectos de luz'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Información técnica */}
      <div className="wf-bg-gray-50 wf-rounded-lg wf-p-4">
        <h4 className="wf-font-semibold wf-text-gray-900 wf-mb-2">
          Características Implementadas
        </h4>
        <div className="wf-grid wf-grid-cols-1 wf-md:grid-cols-2 wf-gap-4 wf-text-sm wf-text-gray-600">
          <div>
            <h5 className="wf-font-medium wf-text-gray-800">Temas Profesionales:</h5>
            <ul className="wf-list-disc wf-list-inside wf-space-y-1 wf-mt-1">
              <li>Efectos neumorphism</li>
              <li>Sombras profesionales</li>
              <li>Transiciones suaves</li>
              <li>Colores corporativos</li>
            </ul>
          </div>
          <div>
            <h5 className="wf-font-medium wf-text-gray-800">Temas Cinematográficos:</h5>
            <ul className="wf-list-disc wf-list-inside wf-space-y-1 wf-mt-1">
              <li>Efectos glassmorphism</li>
              <li>Sombras cinematográficas</li>
              <li>Animaciones dinámicas</li>
              <li>Efectos de luz y brillo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationThemeDemo;