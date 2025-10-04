import { describe, it, expect } from '@jest/globals';
import './setup';

// Tests básicos para verificar que la configuración de autenticación funciona
describe('AuthService Configuration', () => {
  it('debería tener las variables de entorno configuradas', () => {
    expect(process.env['JWT_SECRET']).toBeDefined();
    expect(process.env['JWT_REFRESH_SECRET']).toBeDefined();
    expect(process.env['JWT_EXPIRES_IN']).toBeDefined();
    expect(process.env['JWT_REFRESH_EXPIRES_IN']).toBeDefined();
  });

  it('debería poder importar el servicio de autenticación', () => {
    // Importación dinámica para evitar problemas de tipos durante la compilación
    expect(() => {
      require('../src/services/auth.service');
    }).not.toThrow();
  });
});