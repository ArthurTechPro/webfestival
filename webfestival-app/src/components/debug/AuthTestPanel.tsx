import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui';
import { testRegisterData, testLoginCredentials } from '../../utils/test-auth';

/**
 * Panel de pruebas de autenticación para desarrollo
 */
const AuthTestPanel: React.FC = () => {
  const { user, isAuthenticated, isLoading, login, register, logout } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testRegister = async () => {
    setIsRunningTest(true);
    try {
      addResult('🧪 Iniciando prueba de registro...');
      await register(testRegisterData);
      addResult('✅ Registro exitoso');
    } catch (error) {
      addResult(`❌ Error en registro: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsRunningTest(false);
    }
  };

  const testLogin = async () => {
    setIsRunningTest(true);
    try {
      addResult('🧪 Iniciando prueba de login...');
      await login(testLoginCredentials);
      addResult('✅ Login exitoso');
    } catch (error) {
      addResult(`❌ Error en login: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsRunningTest(false);
    }
  };

  const testLogout = async () => {
    setIsRunningTest(true);
    try {
      addResult('🧪 Iniciando prueba de logout...');
      logout();
      addResult('✅ Logout exitoso');
    } catch (error) {
      addResult(`❌ Error en logout: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsRunningTest(false);
    }
  };

  // Solo mostrar en desarrollo
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '400px',
        maxHeight: '500px',
        background: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        fontSize: '14px',
        fontFamily: 'monospace'
      }}
    >
      <h3 style={{ margin: '0 0 15px 0', color: '#4a7bc8' }}>
        🔧 Panel de Pruebas de Auth
      </h3>
      
      {/* Estado actual */}
      <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}>
        <div><strong>Estado:</strong> {isLoading ? '⏳ Cargando...' : (isAuthenticated ? '✅ Autenticado' : '❌ No autenticado')}</div>
        {user && (
          <>
            <div><strong>Usuario:</strong> {user.nombre}</div>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Rol:</strong> {user.role}</div>
          </>
        )}
      </div>

      {/* Botones de prueba */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
        <Button 
          variant="primary" 
          size="sm" 
          onClick={testRegister}
          disabled={isRunningTest || isLoading}
        >
          🧪 Probar Registro
        </Button>
        
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={testLogin}
          disabled={isRunningTest || isLoading}
        >
          🔑 Probar Login
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={testLogout}
          disabled={isRunningTest || isLoading || !isAuthenticated}
        >
          🚪 Probar Logout
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearResults}
        >
          🗑️ Limpiar Log
        </Button>
      </div>

      {/* Datos de prueba */}
      <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>📋 Datos de Prueba:</div>
        <div>Email: {testLoginCredentials.email}</div>
        <div>Password: {testLoginCredentials.password}</div>
        <div>Nombre: {testRegisterData.nombre}</div>
      </div>

      {/* Log de resultados */}
      <div style={{ marginBottom: '10px' }}>
        <strong>📊 Log de Pruebas:</strong>
      </div>
      <div 
        style={{
          maxHeight: '150px',
          overflowY: 'auto',
          background: 'rgba(0, 0, 0, 0.5)',
          padding: '10px',
          borderRadius: '6px',
          fontSize: '12px',
          lineHeight: '1.4'
        }}
      >
        {testResults.length === 0 ? (
          <div style={{ color: '#666' }}>No hay resultados aún...</div>
        ) : (
          testResults.map((result, index) => (
            <div key={index} style={{ marginBottom: '2px' }}>
              {result}
            </div>
          ))
        )}
      </div>

      {/* Información del API */}
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
        API: {import.meta.env.VITE_API_URL || 'http://localhost:3005'}
      </div>
    </div>
  );
};

export default AuthTestPanel;