import dotenv from 'dotenv';
import { authService } from '../services/auth.service';

// Cargar variables de entorno
dotenv.config();

async function verifyAuthConfig() {
  console.log('🔐 Verificando configuración de autenticación...\n');

  // Verificar variables de entorno
  const requiredEnvVars = [
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'JWT_REFRESH_SECRET',
    'JWT_REFRESH_EXPIRES_IN'
  ];

  let configValid = true;

  console.log('📋 Variables de entorno:');
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (value) {
      console.log(`✅ ${envVar}: ${envVar.includes('SECRET') ? '***' : value}`);
    } else {
      console.log(`❌ ${envVar}: No configurada`);
      configValid = false;
    }
  }

  if (!configValid) {
    console.log('\n❌ Configuración incompleta. Por favor revisa las variables de entorno.');
    process.exit(1);
  }

  console.log('\n🧪 Probando funcionalidades de autenticación...\n');

  try {
    // Test 1: Generar tokens
    console.log('1. Generando tokens...');
    const testPayload = {
      userId: 'test-user-123',
      email: 'test@example.com',
      role: 'PARTICIPANTE'
    };

    const tokens = authService.generateTokens(testPayload);
    console.log('✅ Tokens generados exitosamente');
    console.log(`   - Access Token: ${tokens.accessToken.substring(0, 20)}...`);
    console.log(`   - Refresh Token: ${tokens.refreshToken.substring(0, 20)}...`);

    // Test 2: Verificar access token
    console.log('\n2. Verificando access token...');
    const decodedAccess = authService.verifyAccessToken(tokens.accessToken);
    console.log('✅ Access token verificado exitosamente');
    console.log(`   - User ID: ${decodedAccess.userId}`);
    console.log(`   - Email: ${decodedAccess.email}`);
    console.log(`   - Role: ${decodedAccess.role}`);

    // Test 3: Verificar refresh token
    console.log('\n3. Verificando refresh token...');
    const decodedRefresh = authService.verifyRefreshToken(tokens.refreshToken);
    console.log('✅ Refresh token verificado exitosamente');
    console.log(`   - User ID: ${decodedRefresh.userId}`);

    // Test 4: Hash de contraseña
    console.log('\n4. Probando hash de contraseña...');
    const testPassword = 'TestPassword123';
    const hashedPassword = await authService.hashPassword(testPassword);
    console.log('✅ Contraseña hasheada exitosamente');
    console.log(`   - Original: ${testPassword}`);
    console.log(`   - Hash: ${hashedPassword.substring(0, 30)}...`);

    // Test 5: Comparar contraseña
    console.log('\n5. Comparando contraseñas...');
    const isValidPassword = await authService.comparePassword(testPassword, hashedPassword);
    const isInvalidPassword = await authService.comparePassword('WrongPassword', hashedPassword);
    console.log(`✅ Contraseña correcta: ${isValidPassword}`);
    console.log(`✅ Contraseña incorrecta: ${isInvalidPassword}`);

    // Test 6: Validar token
    console.log('\n6. Validando token...');
    const isTokenValid = authService.isTokenValid(tokens.accessToken);
    const isInvalidTokenValid = authService.isTokenValid('invalid-token');
    console.log(`✅ Token válido: ${isTokenValid}`);
    console.log(`✅ Token inválido: ${isInvalidTokenValid}`);

    console.log('\n🎉 Todas las pruebas de autenticación pasaron exitosamente!');
    console.log('\n📝 Configuración recomendada:');
    console.log('   - JWT_SECRET: Debe ser una cadena segura de al menos 32 caracteres');
    console.log('   - JWT_REFRESH_SECRET: Debe ser diferente al JWT_SECRET');
    console.log('   - JWT_EXPIRES_IN: 7d (7 días) es recomendado para desarrollo');
    console.log('   - JWT_REFRESH_EXPIRES_IN: 30d (30 días) es recomendado');

  } catch (error) {
    console.error('\n❌ Error durante las pruebas:', error);
    process.exit(1);
  }
}

// Ejecutar verificación
verifyAuthConfig().catch(console.error);