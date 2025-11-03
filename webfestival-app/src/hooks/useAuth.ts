import { useState, useEffect } from 'react';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Verificar si hay un token almacenado al cargar la aplicación
    const token = localStorage.getItem('authToken');
    if (token) {
      // Aquí se podría validar el token con el servidor
      // Por ahora, simplemente marcamos como autenticado
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        isLoading: false,
      }));
    } else {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      // Aquí se implementará la lógica de login con el API
      // const response = await apiService.post('/auth/login', { email, password });
      console.log('Login attempt for:', email, password); // Temporal para evitar warning

      // Por ahora, simulamos un login exitoso
      const mockUser: User = {
        id: '1',
        email,
        nombre: 'Usuario Demo',
        role: 'PARTICIPANTE',
        activo: true,
        created_at: new Date(),
        updated_at: new Date(),
      };

      localStorage.setItem('authToken', 'mock-token');
      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error); // Temporal para evitar warning
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Error de autenticación' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const hasRole = (role: string): boolean => {
    return authState.user?.role === role;
  };

  return {
    ...authState,
    login,
    logout,
    hasRole,
  };
};
