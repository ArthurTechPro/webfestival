# Integración Frontend - Sistema de Notificaciones

## Descripción

Esta guía proporciona ejemplos prácticos y componentes listos para usar para integrar el sistema de notificaciones de WebFestival en aplicaciones frontend (React, Vue, Angular).

## Componentes React

### Hook Personalizado para Notificaciones

```typescript
// hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';

interface Notification {
  id: number;
  usuario_id: string;
  tipo: 'deadline_reminder' | 'evaluation_complete' | 'results_published' | 'new_contest';
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_creacion: string;
}

interface NotificationsResponse {
  notificaciones: Notification[];
  total: number;
  page: number;
  totalPages: number;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export const useNotifications = (token: string): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/v1/notifications?page=${pageNum}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data: { success: boolean; data: NotificationsResponse } = await response.json();
      
      if (data.success) {
        const newNotifications = data.data.notificaciones;
        
        if (append) {
          setNotifications(prev => [...prev, ...newNotifications]);
        } else {
          setNotifications(newNotifications);
        }
        
        setUnreadCount(newNotifications.filter(n => !n.leida).length);
        setHasMore(data.data.page < data.data.totalPages);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const markAsRead = useCallback(async (id: number) => {
    if (!token) return;

    try {
      const response = await fetch(`/api/v1/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, leida: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [token]);

  const markAllAsRead = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/v1/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, leida: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [token]);

  const loadMore = useCallback(async () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      await fetchNotifications(nextPage, true);
    }
  }, [hasMore, loading, page, fetchNotifications]);

  const refetch = useCallback(() => {
    setPage(1);
    return fetchNotifications(1, false);
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refetch,
    loadMore,
    hasMore
  };
};
```

### Componente de Lista de Notificaciones

```tsx
// components/NotificationList.tsx
import React from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';
import { LoadingSpinner } from './LoadingSpinner';

interface NotificationListProps {
  token: string;
  className?: string;
}

export const NotificationList: React.FC<NotificationListProps> = ({ 
  token, 
  className = '' 
}) => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    loadMore,
    hasMore
  } = useNotifications(token);

  if (loading && notifications.length === 0) {
    return (
      <div className={`notification-list ${className}`}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`notification-list error ${className}`}>
        <p>Error al cargar notificaciones: {error}</p>
        <button onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={`notification-list ${className}`}>
      <div className="notification-header">
        <h3>
          Notificaciones 
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </h3>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="mark-all-read-btn"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      <div className="notification-items">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            <p>No tienes notificaciones</p>
          </div>
        ) : (
          <>
            {notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
              />
            ))}
            
            {hasMore && (
              <button 
                onClick={loadMore}
                disabled={loading}
                className="load-more-btn"
              >
                {loading ? 'Cargando...' : 'Cargar más'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
```

### Componente de Badge de Notificaciones

```tsx
// components/NotificationBadge.tsx
import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationList } from './NotificationList';

interface NotificationBadgeProps {
  token: string;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  token, 
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useNotifications(token);

  return (
    <div className={`notification-badge-container ${className}`}>
      <button 
        className="notification-badge"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} no leídas)` : ''}`}
      >
        🔔
        {unreadCount > 0 && (
          <span className="badge-count">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-content">
            <NotificationList token={token} />
          </div>
          <div 
            className="notification-backdrop"
            onClick={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  );
};
```

## Integración con Vue.js

### Composable para Vue 3

```typescript
// composables/useNotifications.ts
import { ref, computed, onMounted } from 'vue';

interface Notification {
  id: number;
  usuario_id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_creacion: string;
}

export function useNotifications(token: string) {
  const notifications = ref<Notification[]>([]);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const unreadCount = computed(() => 
    notifications.value.filter(n => !n.leida).length
  );

  const fetchNotifications = async () => {
    if (!token) return;

    try {
      loading.value = true;
      error.value = null;

      const response = await fetch('/api/v1/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      const data = await response.json();
      notifications.value = data.data.notificaciones;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error desconocido';
    } finally {
      loading.value = false;
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/v1/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const notification = notifications.value.find(n => n.id === id);
        if (notification) {
          notification.leida = true;
        }
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  onMounted(() => {
    fetchNotifications();
  });

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    refetch: fetchNotifications
  };
}
```

## Integración con Angular

### Servicio Angular

```typescript
// services/notification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

interface Notification {
  id: number;
  usuario_id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_creacion: string;
}

interface NotificationsResponse {
  success: boolean;
  data: {
    notificaciones: Notification[];
    total: number;
    page: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = '/api/v1/notifications';
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  public notifications$ = this.notificationsSubject.asObservable();
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  fetchNotifications(token: string): Observable<NotificationsResponse> {
    return this.http.get<NotificationsResponse>(this.apiUrl, {
      headers: this.getHeaders(token)
    });
  }

  markAsRead(id: number, token: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/read`, {}, {
      headers: this.getHeaders(token)
    });
  }

  markAllAsRead(token: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/read-all`, {}, {
      headers: this.getHeaders(token)
    });
  }

  startPolling(token: string, intervalMs: number = 30000): void {
    timer(0, intervalMs).pipe(
      switchMap(() => this.fetchNotifications(token)),
      catchError(error => {
        console.error('Error polling notifications:', error);
        return [];
      })
    ).subscribe(response => {
      if (response.success) {
        const notifications = response.data.notificaciones;
        this.notificationsSubject.next(notifications);
        this.unreadCountSubject.next(
          notifications.filter(n => !n.leida).length
        );
      }
    });
  }

  updateNotificationAsRead(id: number): void {
    const current = this.notificationsSubject.value;
    const updated = current.map(n => 
      n.id === id ? { ...n, leida: true } : n
    );
    this.notificationsSubject.next(updated);
    this.unreadCountSubject.next(
      updated.filter(n => !n.leida).length
    );
  }
}
```

## Notificaciones en Tiempo Real

### WebSocket Integration

```typescript
// services/websocket-notifications.ts
class WebSocketNotificationService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(private token: string) {}

  connect(): void {
    const wsUrl = `ws://localhost:3000/notifications?token=${this.token}`;
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket conectado');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        this.handleNewNotification(notification);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket desconectado');
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`Reintentando conexión WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, delay);
    }
  }

  private handleNewNotification(notification: any): void {
    // Mostrar notificación del navegador
    if (Notification.permission === 'granted') {
      new Notification(notification.titulo, {
        body: notification.mensaje,
        icon: '/favicon.ico',
        tag: `notification-${notification.id}`
      });
    }

    // Emitir evento personalizado
    window.dispatchEvent(new CustomEvent('newNotification', {
      detail: notification
    }));
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Uso
const wsService = new WebSocketNotificationService(token);
wsService.connect();

// Escuchar nuevas notificaciones
window.addEventListener('newNotification', (event: any) => {
  const notification = event.detail;
  console.log('Nueva notificación:', notification);
  // Actualizar UI
});
```

## Estilos CSS

```css
/* styles/notifications.css */

.notification-list {
  max-width: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.notification-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.unread-badge {
  background: #ef4444;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.mark-all-read-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.mark-all-read-btn:hover {
  background: #2563eb;
}

.notification-items {
  max-height: 400px;
  overflow-y: auto;
}

.no-notifications {
  padding: 32px 16px;
  text-align: center;
  color: #6b7280;
}

.notification-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background: #f9fafb;
}

.notification-item.unread {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
}

.notification-item.unread:hover {
  background: #fef3c7;
}

/* Badge Component */
.notification-badge-container {
  position: relative;
}

.notification-badge {
  position: relative;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.notification-badge:hover {
  background: #f3f4f6;
}

.badge-count {
  position: absolute;
  top: 0;
  right: 0;
  background: #ef4444;
  color: white;
  font-size: 10px;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
  line-height: 1.2;
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  margin-top: 4px;
}

.notification-dropdown-content {
  position: relative;
  z-index: 1001;
}

.notification-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

/* Responsive */
@media (max-width: 640px) {
  .notification-list {
    max-width: 100vw;
    margin: 0 -16px;
    border-radius: 0;
  }
  
  .notification-dropdown {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: 0;
  }
  
  .notification-dropdown-content {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .notification-items {
    flex: 1;
    max-height: none;
  }
}
```

---

**Documentación actualizada**: Diciembre 2024  
**Frameworks soportados**: React, Vue.js, Angular  
**Características**: WebSocket, Push Notifications, Polling