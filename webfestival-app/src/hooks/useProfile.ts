import { useState, useEffect, useCallback } from 'react';
import { profileService } from '../services/profile.service';
import type { UserProfile, UpdateProfileData, UserStats } from '../types/community';

export const useProfile = (userId?: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profileData = userId 
        ? await profileService.getUserProfile(userId)
        : await profileService.getCurrentProfile();
      
      setProfile(profileData);
      
      // Obtener estadísticas
      const statsData = await profileService.getUserStats(userId);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    try {
      setError(null);
      const updatedProfile = await profileService.updateProfile(data);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar perfil';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const uploadProfilePicture = useCallback(async (file: File) => {
    try {
      setError(null);
      const pictureUrl = await profileService.uploadProfilePicture(file);
      
      // Actualizar el perfil con la nueva imagen
      if (profile) {
        const updatedProfile = { ...profile, picture_url: pictureUrl };
        setProfile(updatedProfile);
      }
      
      return pictureUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al subir imagen';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [profile]);

  const followUser = useCallback(async (targetUserId: string) => {
    try {
      setError(null);
      await profileService.followUser(targetUserId);
      
      // Actualizar el estado de seguimiento si es el perfil que estamos viendo
      if (profile && profile.id === targetUserId) {
        setProfile({
          ...profile,
          isFollowing: true,
          followersCount: (profile.followersCount || 0) + 1
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al seguir usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [profile]);

  const unfollowUser = useCallback(async (targetUserId: string) => {
    try {
      setError(null);
      await profileService.unfollowUser(targetUserId);
      
      // Actualizar el estado de seguimiento si es el perfil que estamos viendo
      if (profile && profile.id === targetUserId) {
        setProfile({
          ...profile,
          isFollowing: false,
          followersCount: Math.max((profile.followersCount || 0) - 1, 0)
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al dejar de seguir usuario';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [profile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    stats,
    loading,
    error,
    updateProfile,
    uploadProfilePicture,
    followUser,
    unfollowUser,
    refetch: fetchProfile
  };
};