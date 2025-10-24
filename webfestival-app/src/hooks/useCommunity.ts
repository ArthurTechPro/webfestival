import { useState, useEffect, useCallback } from 'react';
import { profileService } from '../services/profile.service';
import { communityService } from '../services/community.service';
import type { 
  Following, 
  Follower, 
  FeedItem, 
  Comment, 
  CreateCommentData, 
  UserProfile 
} from '../types/community';
// import type { PaginatedResponse } from '../types';

export const useCommunity = () => {
  const [following, setFollowing] = useState<Following[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFollowing = useCallback(async (userId?: string, page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await profileService.getFollowing(userId, page);
      
      if (page === 1) {
        setFollowing(response.data);
      } else {
        setFollowing(prev => [...prev, ...response.data]);
      }
      
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar seguidos');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFollowers = useCallback(async (userId?: string, page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await profileService.getFollowers(userId, page);
      
      if (page === 1) {
        setFollowers(response.data);
      } else {
        setFollowers(prev => [...prev, ...response.data]);
      }
      
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar seguidores');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFeed = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await profileService.getFeed(page);
      
      if (page === 1) {
        setFeed(response.data);
      } else {
        setFeed(prev => [...prev, ...response.data]);
      }
      
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar feed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSuggestedUsers = useCallback(async (limit: number = 10) => {
    try {
      setError(null);
      const users = await profileService.getSuggestedUsers(limit);
      setSuggestedUsers(users);
      return users;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios sugeridos');
      throw err;
    }
  }, []);

  const searchUsers = useCallback(async (query: string, page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await profileService.searchUsers(query, page);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar usuarios');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    following,
    followers,
    feed,
    suggestedUsers,
    loading,
    error,
    fetchFollowing,
    fetchFollowers,
    fetchFeed,
    fetchSuggestedUsers,
    searchUsers
  };
};

export const useComments = (medioId: number) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await communityService.getComments(medioId, page);
      
      if (page === 1) {
        setComments(response.data);
      } else {
        setComments(prev => [...prev, ...response.data]);
      }
      
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar comentarios');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [medioId]);

  const createComment = useCallback(async (data: CreateCommentData) => {
    try {
      setError(null);
      const newComment = await communityService.createComment(data);
      setComments(prev => [newComment, ...prev]);
      return newComment;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear comentario';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteComment = useCallback(async (commentId: number) => {
    try {
      setError(null);
      await communityService.deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar comentario';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const reportComment = useCallback(async (commentId: number, reason: string) => {
    try {
      setError(null);
      await communityService.reportComment({ comment_id: commentId, reason });
      
      // Marcar el comentario como reportado localmente
      setComments(prev => 
        prev.map(comment => 
          comment.id === commentId 
            ? { ...comment, reportado: true }
            : comment
        )
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al reportar comentario';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  useEffect(() => {
    if (medioId) {
      fetchComments();
    }
  }, [medioId, fetchComments]);

  return {
    comments,
    loading,
    error,
    fetchComments,
    createComment,
    deleteComment,
    reportComment
  };
};