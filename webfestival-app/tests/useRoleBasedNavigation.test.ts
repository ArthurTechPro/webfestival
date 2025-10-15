/// <reference types="vitest" />

import { renderHook } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { vi } from 'vitest';
import { useRoleBasedNavigation } from '../src/hooks/useRoleBasedNavigation';
import { AuthProvider } from '../src/contexts/AuthContext';
import type { User } from '../src/types/auth';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

// Mock del servicio de autenticación
const mockAuthService = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  getToken: vi.fn(),
  getStoredUser: vi.fn(),
  verifyToken: vi.fn(),
};

vi.mock('../src/services/auth.service', () => ({
  authService: mockAuthService,
}));

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
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('useRoleBasedNavigation Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('obtiene la ruta correcta del dashboard según el rol', () => {
    const { result } = renderHook(() => useRoleBasedNavigation(), {
      wrapper: TestWrapper,
    });

    expect(result.current.getDashboardRoute('PARTICIPANTE')).toBe('/participante/dashboard');
    expect(result.current.getDashboardRoute('JURADO')).toBe('/jurado/dashboard');
    expect(result.current.getDashboardRoute('ADMIN')).toBe('/admin/dashboard');
    expect(result.current.getDashboardRoute('CONTENT_ADMIN')).toBe('/content-admin/dashboard');
    expect(result.current.getDashboardRoute('INVALID_ROLE')).toBe('/unauthorized');
  });

  it('navega al dashboard correcto según el rol', () => {
    const { result } = renderHook(() => useRoleBasedNavigation(), {
      wrapper: TestWrapper,
    });

    result.current.navigateToDashboard('ADMIN');
    expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard', { replace: true });

    result.current.navigateToDashboard('JURADO');
    expect(mockNavigate).toHaveBeenCalledWith('/jurado/dashboard', { replace: true });
  });

  it('verifica correctamente el acceso a rutas', async () => {
    const mockUser: User = {
      id: '1',
      email: 'admin@example.com',
      nombre: 'Admin User',
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockAuthService.getToken.mockReturnValue('valid-token');
    mockAuthService.getStoredUser.mockReturnValue(mockUser);
    mockAuthService.verifyToken.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useRoleBasedNavigation(), {
      wrapper: TestWrapper,
    });

    // Esperar a que se resuelva la autenticación
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.canAccessRoute(['ADMIN'])).toBe(true);
    expect(result.current.canAccessRoute(['JURADO'])).toBe(false);
    expect(result.current.canAccessRoute([])).toBe(true); // Sin restricciones
  });

  it('obtiene las rutas disponibles para cada rol', async () => {
    const mockUser: User = {
      id: '1',
      email: 'participante@example.com',
      nombre: 'Participante User',
      role: 'PARTICIPANTE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockAuthService.getToken.mockReturnValue('valid-token');
    mockAuthService.getStoredUser.mockReturnValue(mockUser);
    mockAuthService.verifyToken.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useRoleBasedNavigation(), {
      wrapper: TestWrapper,
    });

    // Esperar a que se resuelva la autenticación
    await new Promise(resolve => setTimeout(resolve, 100));

    const routes = result.current.getAvailableRoutes();
    
    // Verificar que incluye rutas específicas de participante
    expect(routes.some(route => route.path === '/participante/dashboard')).toBe(true);
    expect(routes.some(route => route.path === '/participante/concursos')).toBe(true);
    
    // Verificar que incluye rutas generales
    expect(routes.some(route => route.path === '/profile')).toBe(true);
    
    // Verificar que NO incluye rutas de otros roles
    expect(routes.some(route => route.path === '/admin/dashboard')).toBe(false);
  });
});