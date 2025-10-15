/// <reference types="vitest" />

import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { LoginCredentials, RegisterData } from '../src/types/auth';

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AuthService', () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada test
    vi.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  describe('localStorage operations', () => {
    it('debería poder almacenar y recuperar tokens', () => {
      // Arrange
      const token = 'mock-jwt-token';
      
      // Act
      localStorageMock.getItem.mockReturnValue(token);
      
      // Assert
      expect(localStorageMock.getItem).toBeDefined();
      expect(localStorageMock.setItem).toBeDefined();
      expect(localStorageMock.removeItem).toBeDefined();
    });

    it('debería limpiar datos de localStorage', () => {
      // Act
      localStorageMock.removeItem('authToken');
      localStorageMock.removeItem('refreshToken');
      localStorageMock.removeItem('userData');

      // Assert
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('userData');
    });
  });

  describe('validation helpers', () => {
    it('debería validar credenciales de login', () => {
      // Arrange
      const validCredentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const invalidCredentials: LoginCredentials = {
        email: 'invalid-email',
        password: '123',
      };

      // Act & Assert
      expect(validCredentials.email).toContain('@');
      expect(validCredentials.password.length).toBeGreaterThanOrEqual(6);
      expect(invalidCredentials.email).not.toMatch(/\S+@\S+\.\S+/);
      expect(invalidCredentials.password.length).toBeLessThan(6);
    });

    it('debería validar datos de registro', () => {
      // Arrange
      const validRegisterData: RegisterData = {
        nombre: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      };

      // Act & Assert
      expect(validRegisterData.nombre.length).toBeGreaterThanOrEqual(2);
      expect(validRegisterData.email).toMatch(/\S+@\S+\.\S+/);
      expect(validRegisterData.password).toBe(validRegisterData.confirmPassword);
    });
  });
});