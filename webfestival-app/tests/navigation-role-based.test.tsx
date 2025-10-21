import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { NavigationProvider, useNavigation } from '../src/contexts/NavigationContext';
import navigationService from '../src/services/navigation.service';
import type { User } from '../src/types/auth';

// Mock del hook useAuth
const mockUseAuth = vi.fn();
vi.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth()
}));

// Mock del servicio de navegación
vi.mock('../src/services/navigation.service');

// Componente de prueba para acceder al contexto
const TestComponent = () => {
  const { sideMenuItems, userMenuOptions, hasPermissionForRoute } = useNavigation();
  
  return (
    <div>
      <div data-testid="side-menu-count">{sideMenuItems.length}</div>
      <div data-testid="user-menu-count">{userMenuOptions.length}</div>
      <div data-testid="has-dashboard-permission">
        {hasPermissionForRoute('/app/dashboard').toString()}
      </div>
      {sideMenuItems.map(item => (
        <div key={item.id} data-testid={`menu-item-${item.id}`}>
          {item.label}
        </div>
      ))}
    </div>
  );
};

// Función helper para configurar el mock de useAuth
const setupAuthMock = (user: User | null) => {
  mockUseAuth.mockReturnValue({
    user,
    token: user ? 'mock-token' : null,
    isAuthenticated: !!user,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    hasRole: (role: string) => user?.role === role,
    hasAnyRole: (roles: string[]) => roles.includes(user?.role || ''),
    updateUser: vi.fn()
  });
};

describe('Navigation Role-Based System', () => {
  const mockParticipante: User = {
    id: '1',
    email: 'participante@test.com',
    nombre: 'Test Participante',
    role: 'PARTICIPANTE',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockJurado: User = {
    id: '2',
    email: 'jurado@test.com',
    nombre: 'Test Jurado',
    role: 'JURADO',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockAdmin: User = {
    id: '3',
    email: 'admin@test.com',
    nombre: 'Test Admin',
    role: 'ADMIN',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock del servicio de navegación
    vi.mocked(navigationService.getNavigationForRole).mockImplementation((role: string) => {
      const mockNavigations = {
        'PARTICIPANTE': {
          topMenu: {
            logo: 'WebFestival',
            userOptions: [
              { icon: 'user', label: 'Mi Perfil', route: '/app/profile' },
              { icon: 'logout', label: 'Cerrar Sesión', action: 'logout' }
            ]
          },
          sideMenu: [
            { id: 'dashboard', icon: 'home', label: 'Dashboard', route: '/app/dashboard', active: true },
            { id: 'contests', icon: 'trophy', label: 'Concursos', route: '/app/contests' }
          ]
        },
        'JURADO': {
          topMenu: {
            logo: 'WebFestival',
            userOptions: [
              { icon: 'user', label: 'Mi Perfil', route: '/app/profile' },
              { icon: 'logout', label: 'Cerrar Sesión', action: 'logout' }
            ]
          },
          sideMenu: [
            { id: 'dashboard', icon: 'home', label: 'Dashboard', route: '/app/dashboard', active: true },
            { id: 'evaluations', icon: 'clipboard-check', label: 'Evaluaciones', route: '/app/evaluations' }
          ]
        },
        'ADMIN': {
          topMenu: {
            logo: 'WebFestival Admin',
            userOptions: [
              { icon: 'user', label: 'Mi Perfil', route: '/app/profile' },
              { icon: 'logout', label: 'Cerrar Sesión', action: 'logout' }
            ]
          },
          sideMenu: [
            { id: 'dashboard', icon: 'home', label: 'Dashboard', route: '/app/dashboard', active: true },
            { 
              id: 'contests-admin', 
              icon: 'trophy', 
              label: 'Concursos', 
              route: '/app/admin/contests',
              submenu: [
                { id: 'manage-contests', label: 'Gestionar Concursos', route: '/app/admin/contests' },
                { id: 'categories', label: 'Categorías', route: '/app/admin/categories' }
              ]
            }
          ]
        }
      };
      
      return mockNavigations[role] || mockNavigations['PARTICIPANTE'];
    });

    vi.mocked(navigationService.filterMenuByPermissions).mockImplementation((menuItems, user) => {
      return user ? menuItems : [];
    });

    vi.mocked(navigationService.hasPermissionForRoute).mockImplementation((route, user) => {
      return user !== null;
    });

    vi.mocked(navigationService.generateBreadcrumbs).mockReturnValue([
      { label: 'Inicio', route: '/app/dashboard' },
      { label: 'Dashboard', route: '/app/dashboard', active: true }
    ]);
  });

  describe('Participante Role Navigation', () => {
    it('should load correct menu items for PARTICIPANTE role', () => {
      setupAuthMock(mockParticipante);
      
      render(
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      );

      expect(screen.getByTestId('side-menu-count')).toHaveTextContent('2');
      expect(screen.getByTestId('menu-item-dashboard')).toHaveTextContent('Dashboard');
      expect(screen.getByTestId('menu-item-contests')).toHaveTextContent('Concursos');
    });

    it('should have permission for dashboard route', () => {
      setupAuthMock(mockParticipante);
      
      render(
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      );

      expect(screen.getByTestId('has-dashboard-permission')).toHaveTextContent('true');
    });
  });

  describe('Jurado Role Navigation', () => {
    it('should load correct menu items for JURADO role', () => {
      setupAuthMock(mockJurado);
      
      render(
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      );

      expect(screen.getByTestId('side-menu-count')).toHaveTextContent('2');
      expect(screen.getByTestId('menu-item-dashboard')).toHaveTextContent('Dashboard');
      expect(screen.getByTestId('menu-item-evaluations')).toHaveTextContent('Evaluaciones');
    });
  });

  describe('Admin Role Navigation', () => {
    it('should load correct menu items for ADMIN role including submenus', () => {
      setupAuthMock(mockAdmin);
      
      render(
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      );

      expect(screen.getByTestId('side-menu-count')).toHaveTextContent('2');
      expect(screen.getByTestId('menu-item-dashboard')).toHaveTextContent('Dashboard');
      expect(screen.getByTestId('menu-item-contests-admin')).toHaveTextContent('Concursos');
    });
  });

  describe('Unauthenticated User', () => {
    it('should show no menu items for unauthenticated user', () => {
      setupAuthMock(null);
      
      render(
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      );

      expect(screen.getByTestId('side-menu-count')).toHaveTextContent('0');
      expect(screen.getByTestId('has-dashboard-permission')).toHaveTextContent('false');
    });
  });

  describe('Navigation Service Integration', () => {
    it('should call navigationService methods correctly', () => {
      setupAuthMock(mockParticipante);
      
      render(
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      );

      expect(navigationService.getNavigationForRole).toHaveBeenCalledWith('PARTICIPANTE');
      expect(navigationService.filterMenuByPermissions).toHaveBeenCalled();
    });

    it('should generate breadcrumbs on path change', () => {
      const TestBreadcrumbComponent = () => {
        const { updateBreadcrumbs, breadcrumbs } = useNavigation();
        
        return (
          <div>
            <button 
              onClick={() => updateBreadcrumbs('/app/contests')}
              data-testid="update-breadcrumbs"
            >
              Update Breadcrumbs
            </button>
            <div data-testid="breadcrumb-count">{breadcrumbs.length}</div>
          </div>
        );
      };

      setupAuthMock(mockParticipante);
      
      render(
        <NavigationProvider>
          <TestBreadcrumbComponent />
        </NavigationProvider>
      );

      fireEvent.click(screen.getByTestId('update-breadcrumbs'));
      expect(navigationService.generateBreadcrumbs).toHaveBeenCalledWith('/app/contests', 'PARTICIPANTE');
    });
  });
});