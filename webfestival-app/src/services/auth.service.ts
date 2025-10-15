import { apiService } from './api';
import type { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  ForgotPasswordData, 
  ResetPasswordData,
  User 
} from '../types/auth';

class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly USER_KEY = 'userData';

  /**
   * Iniciar sesión con credenciales
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials);
    
    if (response.success && response.data) {
      this.setAuthData(response.data);
      return response.data;
    }
    
    throw new Error(response.message || 'Error al iniciar sesión');
  }

  /**
   * Registrar nuevo usuario
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/register', data);
    
    if (response.success && response.data) {
      this.setAuthData(response.data);
      return response.data;
    }
    
    throw new Error(response.message || 'Error al registrar usuario');
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    try {
      // Intentar notificar al servidor sobre el logout
      await apiService.post('/auth/logout');
    } catch (error) {
      // Continuar con el logout local aunque falle el servidor
      console.warn('Error al notificar logout al servidor:', error);
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Solicitar recuperación de contraseña
   */
  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    const response = await apiService.post<void>('/auth/forgot-password', data);
    
    if (!response.success) {
      throw new Error(response.message || 'Error al solicitar recuperación de contraseña');
    }
  }

  /**
   * Restablecer contraseña con token
   */
  async resetPassword(data: ResetPasswordData): Promise<void> {
    const response = await apiService.post<void>('/auth/reset-password', data);
    
    if (!response.success) {
      throw new Error(response.message || 'Error al restablecer contraseña');
    }
  }

  /**
   * Verificar token actual y obtener datos del usuario
   */
  async verifyToken(): Promise<User | null> {
    const token = this.getToken();
    
    if (!token) {
      return null;
    }

    try {
      const response = await apiService.get<User>('/auth/me');
      
      if (response.success && response.data) {
        this.setUserData(response.data);
        return response.data;
      }
      
      // Token inválido, limpiar datos
      this.clearAuthData();
      return null;
    } catch (error) {
      // Token inválido o error de red
      this.clearAuthData();
      return null;
    }
  }

  /**
   * Refrescar token de acceso
   */
  async refreshToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await apiService.post<{ token: string }>('/auth/refresh', {
        refreshToken
      });
      
      if (response.success && response.data) {
        this.setToken(response.data.token);
        return response.data.token;
      }
      
      // Refresh token inválido
      this.clearAuthData();
      return null;
    } catch (error) {
      this.clearAuthData();
      return null;
    }
  }

  /**
   * Obtener token almacenado
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtener refresh token almacenado
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Obtener datos del usuario almacenados
   */
  getStoredUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Error al parsear datos de usuario:', error);
        localStorage.removeItem(this.USER_KEY);
      }
    }
    
    return null;
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.getStoredUser();
    return user?.role === role;
  }

  /**
   * Verificar si el usuario tiene alguno de los roles especificados
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getStoredUser();
    return user ? roles.includes(user.role) : false;
  }

  /**
   * Almacenar datos de autenticación
   */
  private setAuthData(authData: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authData.token);
    
    if (authData.refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, authData.refreshToken);
    }
    
    this.setUserData(authData.user);
  }

  /**
   * Almacenar datos del usuario
   */
  private setUserData(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Almacenar token
   */
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Limpiar todos los datos de autenticación
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}

// Instancia singleton del servicio de autenticación
export const authService = new AuthService();
export default authService;