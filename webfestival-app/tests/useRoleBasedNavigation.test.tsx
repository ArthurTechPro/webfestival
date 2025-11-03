/// <reference types="vitest" />

import { renderHook } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { vi, describe, it, beforeEach } from 'vitest';
import type { User } from '../src/types';

// Mock del servicio de autenticación - debe estar antes de las importaciones
vi.mock('../src/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    getToken: vi.fn(),
    getStoredUser: vi.fn(),
    verifyToken: vi.fn(),
  },
}));

import { useRoleBasedNavigation } from '../src/hooks/useRoleBasedNavigation';
import { AuthProvider } from '../src/contexts/AuthContext';
import { NavigationProvider } from '../src/contexts/NavigationContext';

// Mock de react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Crear QueryClient para las pruebas
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

// Wrapper de prueba con proveedores
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationProvider>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </NavigationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('useRoleBasedNavigation Hook', () => {
  let mockAuthService: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    localStorage.clear();

    // Obtener referencia al mock
    const authModule = await import('../src/services/auth.service');
    mockAuthService = vi.mocked(authModule.authService);
  });

  it('obtiene la ruta por defecto para el usuario actual', () => {
    const { result } = renderHook(() => useRoleBasedNavigation(), {
      wrapper: TestWrapper,
    });

    // Sin usuario autenticado, debería devolver '/'
    expect(result.current.getDefaultRouteForUser()).toBe('/');
    expect(result.current.currentUserRole).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('navega al dashboard del usuario actual', () => {
    const { result } = renderHook(() => useRoleBasedNavigation(), {
      wrapper: TestWrapper,
    });

    // Sin usuario autenticado, no debería navegar
    const navigationResult = result.current.navigateToDashboard();
    expect(navigationResult).toBe(false);
  });

  it('verifica correctamente los permisos de acceso', async () => {
    const mockUser: User = {
      id: '1',
      email: 'admin@example.com',
      nombre: 'Admin User',
      role: 'ADMIN',
      activo: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockAuthService.getToken.mockReturnValue('valid-token');
    mockAuthService.getStoredUser.mockReturnValue(mockUser);
    mockAuthService.verifyToken.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useRoleBasedNavigation(), {
      wrapper: TestWrapper,
    });

    // Esperar a que se resuelva la autenticación
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.hasAdminAccess()).toBe(true);
    expect(result.current.hasContentAdminAccess()).toBe(true);
    expect(result.current.hasJuryAccess()).toBe(true);
    expect(result.current.currentUserRole).toBe('ADMIN');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('obtiene las rutas de navegación rápida para cada rol', async () => {
    const mockUser: User = {
      id: '1',
      email: 'participante@example.com',
      nombre: 'Participante User',
      role: 'PARTICIPANTE',
      activo: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockAuthService.getToken.mockReturnValue('valid-token');
    mockAuthService.getStoredUser.mockReturnValue(mockUser);
    mockAuthService.verifyToken.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useRoleBasedNavigation(), {
      wrapper: TestWrapper,
    });

    // Esperar a que se resuelva la autenticación
    await new Promise(resolve => setTimeout(resolve, 100));

    const quickRoutes = result.current.getQuickNavigationRoutes();

    // Verificar que devuelve un array
    expect(Array.isArray(quickRoutes)).toBe(true);

    // Verificar que cada ruta tiene la estructura correcta
    quickRoutes.forEach(route => {
      expect(route).toHaveProperty('label');
      expect(route).toHaveProperty('route');
      expect(route).toHaveProperty('icon');
    });

    // Verificar permisos específicos del rol
    expect(result.current.hasAdminAccess()).toBe(false);
    expect(result.current.hasContentAdminAccess()).toBe(false);
    expect(result.current.hasJuryAccess()).toBe(false);
  });

  it('obtiene estadísticas de navegación correctas', () => {
    const { result } = renderHook(() => useRoleBasedNavigation(), {
      wrapper: TestWrapper,
    });

    const stats = result.current.getNavigationStats();

    expect(stats).toHaveProperty('totalMenuItems');
    expect(stats).toHaveProperty('availableRoutes');
    expect(stats).toHaveProperty('hasSubmenuItems');
    expect(stats).toHaveProperty('userRole');

    // Sin usuario autenticado
    expect(stats.totalMenuItems).toBe(0);
    expect(stats.availableRoutes).toBe(0);
    expect(stats.hasSubmenuItems).toBe(false);
    expect(stats.userRole).toBe(null);
  });

  it('navega con verificación de permisos', () => {
    const { result } = renderHook(() => useRoleBasedNavigation(), {
      wrapper: TestWrapper,
    });

    // Sin usuario autenticado, no debería poder navegar
    const navigationResult = result.current.navigateWithPermissionCheck('/app/dashboard');
    expect(navigationResult).toBe(false);
  });
});