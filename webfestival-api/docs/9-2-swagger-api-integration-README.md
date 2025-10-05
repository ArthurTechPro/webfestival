# Guía de Integración API - WebFestival Swagger Documentation

## Integración con Frontend (React/Next.js)

### Configuración del Cliente HTTP

```typescript
// src/lib/api-client.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT automáticamente
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado, intentar renovar
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });
          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          
          // Reintentar request original
          error.config.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient.request(error.config);
        } catch (refreshError) {
          // Refresh falló, redirigir a login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
```

### Servicios de API Tipados

```typescript
// src/services/auth.service.ts
import { apiClient } from '../lib/api-client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nombre: string;
  bio?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', userData);
    return response.data.data;
  }

  async getMe(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data.data.user;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

export const authService = new AuthService();
```

```typescript
// src/services/concurso.service.ts
import { apiClient } from '../lib/api-client';

export interface Concurso {
  id: number;
  titulo: string;
  descripcion: string;
  reglas?: string;
  fecha_inicio: string;
  fecha_final: string;
  status: 'Próximamente' | 'Activo' | 'Calificación' | 'Finalizado';
  imagen_url?: string;
  max_envios: number;
  tamaño_max_mb: number;
  created_at: string;
  categorias?: Categoria[];
}

export interface Categoria {
  id: number;
  nombre: string;
  concurso_id: number;
}

export class ConcursoService {
  async getConcursosActivos(): Promise<Concurso[]> {
    const response = await apiClient.get('/concursos/activos');
    return response.data.data;
  }

  async getConcursosFinalizados(): Promise<Concurso[]> {
    const response = await apiClient.get('/concursos/finalizados');
    return response.data.data;
  }

  async getConcursoById(id: number): Promise<Concurso> {
    const response = await apiClient.get(`/concursos/${id}`);
    return response.data.data;
  }

  async inscribirseAConcurso(concursoId: number): Promise<void> {
    await apiClient.post('/concursos/inscripcion', { concursoId });
  }

  async cancelarInscripcion(concursoId: number): Promise<void> {
    await apiClient.delete(`/concursos/inscripcion/${concursoId}`);
  }

  async getMisInscripciones(): Promise<{ concurso: Concurso; fecha_inscripcion: string }[]> {
    const response = await apiClient.get('/concursos/mis-inscripciones');
    return response.data.data;
  }

  async verificarInscripcion(concursoId: number): Promise<{ inscrito: boolean; fecha_inscripcion?: string }> {
    const response = await apiClient.get(`/concursos/${concursoId}/verificar-inscripcion`);
    return response.data.data;
  }
}

export const concursoService = new ConcursoService();
```

```typescript
// src/services/media.service.ts
import { apiClient } from '../lib/api-client';

export interface MediaUploadRequest {
  titulo: string;
  tipo_medio: 'fotografia' | 'video' | 'audio' | 'corto_cine';
  categoria_id: number;
  formato: string;
  tamaño_archivo: number;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  uploadId: string;
  expiresIn: number;
}

export interface ProcessUploadRequest {
  uploadId: string;
  immichAssetId: string;
}

export interface Medio {
  id: number;
  titulo: string;
  tipo_medio: string;
  usuario_id: string;
  concurso_id: number;
  categoria_id: number;
  medio_url: string;
  thumbnail_url?: string;
  preview_url?: string;
  duracion?: number;
  formato: string;
  tamaño_archivo: number;
  metadatos: Record<string, any>;
  fecha_subida: string;
}

export class MediaService {
  async getValidationConfig(): Promise<any> {
    const response = await apiClient.get('/media/validation-config');
    return response.data.data;
  }

  async generateUploadUrl(concursoId: number, mediaData: MediaUploadRequest): Promise<UploadUrlResponse> {
    const response = await apiClient.post(`/media/contests/${concursoId}/upload-url`, mediaData);
    return response.data.data;
  }

  async processUpload(concursoId: number, uploadData: ProcessUploadRequest): Promise<Medio> {
    const response = await apiClient.post(`/media/contests/${concursoId}/process-upload`, uploadData);
    return response.data.data;
  }

  async getWinnerGallery(filters?: {
    tipo_medio?: string;
    concurso_id?: number;
    año?: number;
    page?: number;
    limit?: number;
  }): Promise<{ data: Medio[]; pagination: any }> {
    const response = await apiClient.get('/media/gallery/winners', { params: filters });
    return response.data;
  }

  async getFeaturedGallery(filters?: {
    limit?: number;
    tipo_medio?: string;
  }): Promise<Medio[]> {
    const response = await apiClient.get('/media/gallery/featured', { params: filters });
    return response.data.data;
  }
}

export const mediaService = new MediaService();
```

### Hooks de React para API

```typescript
// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { authService, AuthResponse } from '../services/auth.service';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      authService.getMe()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      const authData = await authService.login({ email, password });
      localStorage.setItem('accessToken', authData.accessToken);
      localStorage.setItem('refreshToken', authData.refreshToken);
      setUser(authData.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
      throw err;
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      setError(null);
      const authData = await authService.register(userData);
      localStorage.setItem('accessToken', authData.accessToken);
      localStorage.setItem('refreshToken', authData.refreshToken);
      setUser(authData.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse');
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      setUser(null);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };
};
```

```typescript
// src/hooks/useConcursos.ts
import { useState, useEffect } from 'react';
import { concursoService, Concurso } from '../services/concurso.service';

export const useConcursos = () => {
  const [concursosActivos, setConcursosActivos] = useState<Concurso[]>([]);
  const [concursosFinalizados, setConcursosFinalizados] = useState<Concurso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConcursos = async () => {
      try {
        setError(null);
        const [activos, finalizados] = await Promise.all([
          concursoService.getConcursosActivos(),
          concursoService.getConcursosFinalizados()
        ]);
        setConcursosActivos(activos);
        setConcursosFinalizados(finalizados);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al cargar concursos');
      } finally {
        setLoading(false);
      }
    };

    fetchConcursos();
  }, []);

  const inscribirseAConcurso = async (concursoId: number): Promise<void> => {
    try {
      await concursoService.inscribirseAConcurso(concursoId);
      // Actualizar estado local si es necesario
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Error al inscribirse');
    }
  };

  return {
    concursosActivos,
    concursosFinalizados,
    loading,
    error,
    inscribirseAConcurso
  };
};
```

### Componentes de React con API

```tsx
// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      // Redirigir o mostrar éxito
    } catch (err) {
      // Error manejado por useAuth
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
};
```

```tsx
// src/components/ConcursosList.tsx
import React from 'react';
import { useConcursos } from '../hooks/useConcursos';

export const ConcursosList: React.FC = () => {
  const { concursosActivos, loading, error, inscribirseAConcurso } = useConcursos();

  if (loading) return <div>Cargando concursos...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {concursosActivos.map((concurso) => (
        <div key={concurso.id} className="bg-white rounded-lg shadow-md p-6">
          {concurso.imagen_url && (
            <img
              src={concurso.imagen_url}
              alt={concurso.titulo}
              className="w-full h-48 object-cover rounded-md mb-4"
            />
          )}
          
          <h3 className="text-xl font-semibold mb-2">{concurso.titulo}</h3>
          <p className="text-gray-600 mb-4">{concurso.descripcion}</p>
          
          <div className="text-sm text-gray-500 mb-4">
            <p>Inicio: {new Date(concurso.fecha_inicio).toLocaleDateString()}</p>
            <p>Fin: {new Date(concurso.fecha_final).toLocaleDateString()}</p>
            <p>Máx. envíos: {concurso.max_envios}</p>
          </div>

          <button
            onClick={() => inscribirseAConcurso(concurso.id)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Inscribirse
          </button>
        </div>
      ))}
    </div>
  );
};
```

## Integración con Testing

### Tests de API con Jest

```typescript
// src/__tests__/auth.service.test.ts
import { authService } from '../services/auth.service';
import { apiClient } from '../lib/api-client';

jest.mock('../lib/api-client');
const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            user: { id: '1', email: 'test@example.com', nombre: 'Test User' },
            accessToken: 'mock-token',
            refreshToken: 'mock-refresh-token',
            expiresIn: '1h'
          }
        }
      };

      mockedApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result).toEqual(mockResponse.data.data);
    });

    it('should handle login error', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Credenciales incorrectas'
          }
        }
      };

      mockedApiClient.post.mockRejectedValue(mockError);

      await expect(authService.login({
        email: 'test@example.com',
        password: 'wrong-password'
      })).rejects.toEqual(mockError);
    });
  });
});
```

### Tests de Integración E2E

```typescript
// cypress/integration/auth.spec.ts
describe('Authentication Flow', () => {
  it('should login and access protected content', () => {
    cy.visit('/login');
    
    // Interceptar llamada a la API
    cy.intercept('POST', '/api/v1/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          user: { id: '1', email: 'test@example.com', nombre: 'Test User' },
          accessToken: 'mock-token',
          refreshToken: 'mock-refresh-token'
        }
      }
    }).as('login');

    // Llenar formulario
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();

    // Verificar llamada a API
    cy.wait('@login');

    // Verificar redirección
    cy.url().should('include', '/dashboard');
    
    // Verificar contenido protegido
    cy.get('[data-testid="user-name"]').should('contain', 'Test User');
  });
});
```

## Generación de Clientes SDK

### Usando OpenAPI Generator

```bash
# Instalar OpenAPI Generator
npm install -g @openapitools/openapi-generator-cli

# Generar cliente TypeScript
openapi-generator-cli generate \
  -i http://localhost:3001/api-docs.json \
  -g typescript-axios \
  -o ./src/generated/api \
  --additional-properties=npmName=webfestival-api-client,supportsES6=true
```

### Cliente Generado Automáticamente

```typescript
// Uso del cliente generado
import { Configuration, AuthApi, ConcursosApi } from './generated/api';

const config = new Configuration({
  basePath: 'http://localhost:3001/api/v1',
  accessToken: () => localStorage.getItem('accessToken') || ''
});

const authApi = new AuthApi(config);
const concursosApi = new ConcursosApi(config);

// Uso directo
const loginResponse = await authApi.authLoginPost({
  email: 'user@example.com',
  password: 'password123'
});

const concursos = await concursosApi.concursosActivosGet();
```

## Mejores Prácticas

### Manejo de Errores
```typescript
// src/utils/api-error-handler.ts
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.status === 401) {
    return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
  }
  
  if (error.response?.status === 403) {
    return 'No tienes permisos para realizar esta acción.';
  }
  
  if (error.response?.status >= 500) {
    return 'Error interno del servidor. Intenta nuevamente más tarde.';
  }
  
  return 'Ha ocurrido un error inesperado.';
};
```

### Caché y Optimización
```typescript
// src/hooks/useApiCache.ts
import { useQuery, useMutation, useQueryClient } from 'react-query';

export const useApiCache = () => {
  const queryClient = useQueryClient();

  const invalidateCache = (keys: string[]) => {
    keys.forEach(key => {
      queryClient.invalidateQueries(key);
    });
  };

  return { invalidateCache };
};

// Uso con React Query
export const useConcursosQuery = () => {
  return useQuery(
    'concursos-activos',
    () => concursoService.getConcursosActivos(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
    }
  );
};
```

Esta guía proporciona una base sólida para integrar la API WebFestival documentada con Swagger en aplicaciones frontend modernas.