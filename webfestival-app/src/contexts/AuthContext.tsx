import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/auth.service';
import type { 
  AuthContextType, 
  LoginCredentials, 
  RegisterData, 
  User 
} from '../types/auth';

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props del proveedor
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Proveedor del contexto de autenticación
 * Maneja el estado global de autenticación de la aplicación
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        // Obtener token almacenado
        const storedToken = authService.getToken();
        const storedUser = authService.getStoredUser();
        
        if (storedToken && storedUser) {
          // Verificar que el token siga siendo válido
          const verifiedUser = await authService.verifyToken();
          
          if (verifiedUser) {
            setToken(storedToken);
            setUser(verifiedUser);
          } else {
            // Token inválido, limpiar estado
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
        // En caso de error, limpiar estado
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Iniciar sesión
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    
    try {
      const authData = await authService.login(credentials);
      setUser(authData.user);
      setToken(authData.token);
    } catch (error) {
      throw error; // Re-lanzar el error para que el componente lo maneje
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registrar nuevo usuario
   */
  const register = async (data: RegisterData): Promise<void> => {
    setIsLoading(true);
    
    try {
      const authData = await authService.register(data);
      setUser(authData.user);
      setToken(authData.token);
    } catch (error) {
      throw error; // Re-lanzar el error para que el componente lo maneje
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = (): void => {
    setIsLoading(true);
    
    // Ejecutar logout de forma asíncrona sin bloquear la UI
    authService.logout().finally(() => {
      setUser(null);
      setToken(null);
      setIsLoading(false);
    });
  };

  /**
   * Verificar si el usuario tiene un rol específico
   */
  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  /**
   * Verificar si el usuario tiene alguno de los roles especificados
   */
  const hasAnyRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  /**
   * Actualizar datos del usuario
   */
  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      // Actualizar también en localStorage
      localStorage.setItem('userData', JSON.stringify(updatedUser));
    }
  };

  // Valor del contexto
  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    hasRole,
    hasAnyRole,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para usar el contexto de autenticación
 * Debe ser usado dentro de un AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return context;
};

export default AuthContext;