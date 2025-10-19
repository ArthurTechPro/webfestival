/**
 * Utilidades para probar la autenticación
 */

import { authService } from '../services/auth.service';
import type { LoginCredentials, RegisterData } from '../types/auth';

// Datos de prueba para registro
export const testRegisterData: RegisterData = {
  nombre: 'Arthur WebFestival',
  email: 'arthur@webfestival.com',
  password: 'NuevoArthur123',
  confirmPassword: 'NuevoArthur123'
};

// Datos de prueba para login (usuario real en la base de datos)
export const testLoginCredentials: LoginCredentials = {
  email: 'arthur@webfestival.com',
  password: 'NuevoArthur123'
};

/**
 * Probar registro de usuario
 */
export const testRegister = async (): Promise<void> => {
  try {
    console.log('🧪 Probando registro de usuario...');
    const result = await authService.register(testRegisterData);
    console.log('✅ Registro exitoso:', result);
  } catch (error) {
    console.error('❌ Error en registro:', error);
    throw error;
  }
};

/**
 * Probar login de usuario
 */
export const testLogin = async (): Promise<void> => {
  try {
    console.log('🧪 Probando login de usuario...');
    const result = await authService.login(testLoginCredentials);
    console.log('✅ Login exitoso:', result);
  } catch (error) {
    console.error('❌ Error en login:', error);
    throw error;
  }
};

/**
 * Probar verificación de token
 */
export const testVerifyToken = async (): Promise<void> => {
  try {
    console.log('🧪 Probando verificación de token...');
    const user = await authService.verifyToken();
    if (user) {
      console.log('✅ Token válido, usuario:', user);
    } else {
      console.log('⚠️ Token inválido o no existe');
    }
  } catch (error) {
    console.error('❌ Error en verificación de token:', error);
    throw error;
  }
};

/**
 * Probar logout
 */
export const testLogout = async (): Promise<void> => {
  try {
    console.log('🧪 Probando logout...');
    await authService.logout();
    console.log('✅ Logout exitoso');
  } catch (error) {
    console.error('❌ Error en logout:', error);
    throw error;
  }
};

/**
 * Ejecutar todas las pruebas de autenticación
 */
export const runAuthTests = async (): Promise<void> => {
  console.log('🚀 Iniciando pruebas de autenticación...\n');
  
  try {
    // 1. Probar registro
    await testRegister();
    console.log('');
    
    // 2. Probar logout para limpiar estado
    await testLogout();
    console.log('');
    
    // 3. Probar login
    await testLogin();
    console.log('');
    
    // 4. Probar verificación de token
    await testVerifyToken();
    console.log('');
    
    // 5. Probar logout final
    await testLogout();
    console.log('');
    
    console.log('🎉 Todas las pruebas de autenticación completadas exitosamente!');
  } catch (error) {
    console.error('💥 Error en las pruebas de autenticación:', error);
  }
};

/**
 * Verificar estado de autenticación actual
 */
export const checkAuthStatus = (): void => {
  console.log('📊 Estado actual de autenticación:');
  console.log('- Token:', authService.getToken() ? '✅ Presente' : '❌ No presente');
  console.log('- Usuario:', authService.getStoredUser() ? '✅ Presente' : '❌ No presente');
  console.log('- Autenticado:', authService.isAuthenticated() ? '✅ Sí' : '❌ No');
};

// Exportar para uso en consola del navegador
if (typeof window !== 'undefined') {
  (window as any).testAuth = {
    runAuthTests,
    testRegister,
    testLogin,
    testVerifyToken,
    testLogout,
    checkAuthStatus
  };
  
  console.log('🔧 Utilidades de prueba de autenticación disponibles en window.testAuth');
}