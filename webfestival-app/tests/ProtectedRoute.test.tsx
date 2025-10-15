/// <reference types="vitest" />

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import ProtectedRoute from '../src/components/auth/ProtectedRoute';
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

// Componente de prueba
const TestComponent: React.FC = () => (
  <div>Contenido protegido</div>
);

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Limpiar localStorage
    localStorage.clear();
  });

  it('muestra spinner mientras verifica autenticación', () => {
    // Simular estado de carga
    mockAuthService.getToken.mockReturnValue(null);
    mockAuthService.getStoredUser.mockReturnValue(null);

    render(
      <TestWrapper>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    expect(screen.getByText('Verificando autenticación...')).toBeInTheDocument();
  });

  it('permite acceso a usuario autenticado sin restricciones de rol', async () => {
    const mockUser: User = {
      id: '1',
      email: 'test@example.com',
      nombre: 'Test User',
      role: 'PARTICIPANTE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockAuthService.getToken.mockReturnValue('valid-token');
    mockAuthService.getStoredUser.mockReturnValue(mockUser);
    mockAuthService.verifyToken.mockResolvedValue(mockUser);

    render(
      <TestWrapper>
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    // Esperar a que se resuelva la verificación
    await screen.findByText('Contenido protegido');
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });

  it('permite acceso a usuario con rol requerido', async () => {
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

    render(
      <TestWrapper>
        <ProtectedRoute requiredRoles={['ADMIN']}>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    // Esperar a que se resuelva la verificación
    await screen.findByText('Contenido protegido');
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });

  it('permite acceso a usuario con uno de los roles requeridos', async () => {
    const mockUser: User = {
      id: '1',
      email: 'jurado@example.com',
      nombre: 'Jurado User',
      role: 'JURADO',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockAuthService.getToken.mockReturnValue('valid-token');
    mockAuthService.getStoredUser.mockReturnValue(mockUser);
    mockAuthService.verifyToken.mockResolvedValue(mockUser);

    render(
      <TestWrapper>
        <ProtectedRoute requiredRoles={['ADMIN', 'JURADO']}>
          <TestComponent />
        </ProtectedRoute>
      </TestWrapper>
    );

    // Esperar a que se resuelva la verificación
    await screen.findByText('Contenido protegido');
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
  });
});