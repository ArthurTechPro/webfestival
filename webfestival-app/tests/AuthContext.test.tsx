/// <reference types="vitest" />

import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import type { User } from '../src/types/auth';

// Componente de prueba simple para usar el hook useAuth
const TestComponent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería renderizar el AuthProvider correctamente', () => {
    // Act
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Assert
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByTestId('authenticated')).toBeInTheDocument();
  });

  it('debería lanzar error si useAuth se usa fuera del AuthProvider', () => {
    // Arrange & Act & Assert
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth debe ser usado dentro de un AuthProvider');
  });
});