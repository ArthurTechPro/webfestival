import { apiService } from './api';
import type { 
  UserProfile, 
  UpdateProfileData, 
  Following, 
  Follower, 
  FeedItem,
  UserStats
} from '../types/community';
import type { PaginatedResponse } from '../types';

class ProfileService {
  /**
   * Obtener perfil del usuario actual
   */
  async getCurrentProfile(): Promise<UserProfile> {
    const response = await apiService.get<UserProfile>('/profile/me');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error al obtener perfil');
  }

  /**
   * Obtener perfil de usuario por ID
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    const response = await apiService.get<UserProfile>(`/profile/user/${userId}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error al obtener perfil del usuario');
  }

  /**
   * Actualizar perfil del usuario actual
   */
  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const response = await apiService.put<UserProfile>('/profile/me', data);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error al actualizar perfil');
  }

  /**
   * Subir foto de perfil
   */
  async uploadProfilePicture(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('picture', file);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/profile/upload-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data.picture_url;
      }
      
      throw new Error(result.message || 'Error al subir imagen');
    } catch (error) {
      throw new Error('Error al subir imagen de perfil');
    }
  }

  /**
   * Obtener estadísticas del usuario
   */
  async getUserStats(userId?: string): Promise<UserStats> {
    const endpoint = userId ? `/profile/stats/${userId}` : '/profile/stats/me';
    const response = await apiService.get<UserStats>(endpoint);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error al obtener estadísticas');
  }

  /**
   * Seguir a un usuario
   */
  async followUser(userId: string): Promise<void> {
    const response = await apiService.post<void>(`/profile/follow/${userId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Error al seguir usuario');
    }
  }

  /**
   * Dejar de seguir a un usuario
   */
  async unfollowUser(userId: string): Promise<void> {
    const response = await apiService.delete<void>(`/profile/follow/${userId}`);
    
    if (!response.success) {
      throw new Error(response.message || 'Error al dejar de seguir usuario');
    }
  }

  /**
   * Obtener lista de usuarios seguidos
   */
  async getFollowing(userId?: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Following>> {
    const endpoint = userId ? `/profile/following/${userId}` : '/profile/following/me';
    const response = await apiService.get<PaginatedResponse<Following>>(`${endpoint}?page=${page}&limit=${limit}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error al obtener seguidos');
  }

  /**
   * Obtener lista de seguidores
   */
  async getFollowers(userId?: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Follower>> {
    const endpoint = userId ? `/profile/followers/${userId}` : '/profile/followers/me';
    const response = await apiService.get<PaginatedResponse<Follower>>(`${endpoint}?page=${page}&limit=${limit}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error al obtener seguidores');
  }

  /**
   * Obtener feed personalizado de actividades
   */
  async getFeed(page: number = 1, limit: number = 20): Promise<PaginatedResponse<FeedItem>> {
    const response = await apiService.get<PaginatedResponse<FeedItem>>(`/profile/feed?page=${page}&limit=${limit}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error al obtener feed');
  }

  /**
   * Buscar usuarios
   */
  async searchUsers(query: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<UserProfile>> {
    const response = await apiService.get<PaginatedResponse<UserProfile>>(`/profile/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error al buscar usuarios');
  }

  /**
   * Obtener usuarios sugeridos para seguir
   */
  async getSuggestedUsers(limit: number = 10): Promise<UserProfile[]> {
    const response = await apiService.get<UserProfile[]>(`/profile/suggested?limit=${limit}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error al obtener usuarios sugeridos');
  }
}

// Instancia singleton del servicio de perfil
export const profileService = new ProfileService();
export default profileService;