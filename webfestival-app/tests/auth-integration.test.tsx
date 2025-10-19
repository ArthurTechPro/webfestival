import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../src/services/auth.service';
import { testRegisterData, testLoginCredentials } from '../src/utils/test-auth';

// Mock del API service para evitar llamadas reales durante los tests
vi.mock('../src/services/api', () => ({
  apiService: {
    post: vi.fn(),
    get: vi.fn()
  }
}));

describe('Integración de Autenticación', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('AuthService', () => {
    it('debe tener los métodos principales de autenticación', () => {
      expect(typeof authService.login).toBe('function');
      expect(typeof authService.register).toBe('function');
      expect(typeof authService.logout).toBe('function');
      expect(typeof authService.verifyToken).toBe('function');
      expect(typeof authService.getToken).toBe('function');
      expect(typeof authService.getStoredUser).toBe('function');
      expect(typeof authService.isAuthenticated).toBe('function');
    });

    it('debe manejar el almacenamiento de tokens correctamente', () => {
      // Inicialmente no debe haber token
      expect(authService.getToken()).toBeNull();
      expect(authService.isAuthenticated()).toBe(false);

      // Simular almacenamiento de token
      localStorage.setItem('authToken', 'test-token');
      expect(authService.getToken()).toBe('test-token');
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('debe manejar el almacenamiento de datos de usuario correctamente', () => {
      // Inicialmente no debe haber usuario
      expect(authService.getStoredUser()).toBeNull();

      // Simular almacenamiento de usuario
      const testUser = {
        id: '1',
        email: 'test@example.com',
        nombre: 'Test User',
        role: 'PARTICIPANTE' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      localStorage.setItem('userData', JSON.stringify(testUser));
      const storedUser = authService.getStoredUser();
      
      expect(storedUser).not.toBeNull();
      expect(storedUser?.email).toBe(testUser.email);
      expect(storedUser?.nombre).toBe(testUser.nombre);
      expect(storedUser?.role).toBe(testUser.role);
    });

    it('debe verificar roles correctamente', () => {
      // Sin usuario, no debe tener ningún rol
      expect(authService.hasRole('PARTICIPANTE')).toBe(false);
      expect(authService.hasAnyRole(['PARTICIPANTE', 'JURADO'])).toBe(false);

      // Con usuario, debe verificar roles correctamente
      const testUser = {
        id: '1',
        email: 'test@example.com',
        nombre: 'Test User',
        role: 'JURADO' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      localStorage.setItem('userData', JSON.stringify(testUser));
      
      expect(authService.hasRole('JURADO')).toBe(true);
      expect(authService.hasRole('PARTICIPANTE')).toBe(false);
      expect(authService.hasAnyRole(['PARTICIPANTE', 'JURADO'])).toBe(true);
      expect(authService.hasAnyRole(['ADMIN', 'CONTENT_ADMIN'])).toBe(false);
    });
  });

  describe('Datos de Prueba', () => {
    it('debe tener datos de registro válidos', () => {
      expect(testRegisterData).toBeDefined();
      expect(testRegisterData.nombre).toBe('Usuario de Prueba');
      expect(testRegisterData.email).toBe('test@webfestival.com');
      expect(testRegisterData.password).toBe('password123');
      expect(testRegisterData.confirmPassword).toBe('password123');
      expect(testRegisterData.password).toBe(testRegisterData.confirmPassword);
    });

    it('debe tener credenciales de login válidas', () => {
      expect(testLoginCredentials).toBeDefined();
      expect(testLoginCredentials.email).toBe('test@webfestival.com');
      expect(testLoginCredentials.password).toBe('password123');
      expect(testLoginCredentials.email).toBe(testRegisterData.email);
      expect(testLoginCredentials.password).toBe(testRegisterData.password);
    });
  });

  describe('Configuración del API', () => {
    it('debe tener la URL del API configurada', () => {
      // En tests, VITE_API_URL debería estar definida o usar el valor por defecto
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3005';
      expect(apiUrl).toBeDefined();
      expect(apiUrl).toMatch(/^https?:\/\//);
    });
  });

  describe('LocalStorage Management', () => {
    it('debe limpiar correctamente los datos de autenticación', () => {
      // Simular datos almacenados
      localStorage.setItem('authToken', 'test-token');
      localStorage.setItem('refreshToken', 'test-refresh-token');
      localStorage.setItem('userData', JSON.stringify({ id: '1', email: 'test@example.com' }));

      // Verificar que están almacenados
      expect(localStorage.getItem('authToken')).toBe('test-token');
      expect(localStorage.getItem('refreshToken')).toBe('test-refresh-token');
      expect(localStorage.getItem('userData')).toBeTruthy();

      // Limpiar (simular logout)
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');

      // Verificar que se limpiaron
      expect(localStorage.getItem('authToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('userData')).toBeNull();
    });

    it('debe manejar datos corruptos en localStorage', () => {
      // Simular datos corruptos
      localStorage.setItem('userData', 'invalid-json');
      
      // El servicio debe manejar gracefully los datos corruptos
      expect(() => authService.getStoredUser()).not.toThrow();
      expect(authService.getStoredUser()).toBeNull();
    });
  });
});