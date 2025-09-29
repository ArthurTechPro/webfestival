# Documento de Diseño - Plataforma WebFestival

## Visión General

WebFestival es un ecosistema completo de aplicaciones para concursos multimedia que conecta artistas creativos (fotógrafos, videomakers, músicos, cineastas), jurados profesionales y organizadores en un ambiente colaborativo y competitivo. La arquitectura está distribuida en tres proyectos independientes con enfoque principal en concursos multimedia y construcción de comunidad creativa:

1. **webfestival-api**: Backend API construida con Node.js 22+, Express.js 4.17+, TypeScript 5+ y Prisma 5+ + PostgreSQL 14+
2. **webfestival-app**: Frontend aplicación construida con React 19+, TypeScript 5+, Vite 5+ y React Router 6+
3. **webfestival-cms**: Landing page y CMS construida con Next.js 15+, TypeScript 5+ y Bootstrap 5.3+

**Visión del Producto**: Crear la plataforma líder en concursos multimedia online que facilite el descubrimiento de talento creativo emergente en múltiples disciplinas (fotografía, video, audio, cine) y genere una comunidad activa de creadores y profesionales del sector con contenido educativo continuo.

El sistema gestiona cuatro tipos de usuarios: participantes (artistas creativos), jurados especializados por tipo de medio, administradores y administradores de contenido (CONTENT_ADMIN). Implementa una separación clara entre el almacenamiento de metadatos (PostgreSQL) y el almacenamiento de archivos multimedia (servidor Immich independiente), garantizando escalabilidad, rendimiento óptimo, funcionalidades sociales avanzadas y un modelo de negocio sostenible basado en suscripciones.

## Arquitectura

### Arquitectura General del Sistema

```mermaid
graph TB
    subgraph "Frontend Applications"
        APP[webfestival-app<br/>React + Vite<br/>Puerto 3000]
        LANDING[webfestival-cms<br/>Next.js<br/>Puerto 3002]
        MOBILE[webfestival-mobile<br/>React Native<br/>Futuro]
    end
    
    subgraph "Backend API"
        API[webfestival-api<br/>Node.js 22 + Express 4.17<br/>Puerto 3001]
        AUTH[JWT Authentication]
        ROUTES[API Routes]
        MIDDLEWARE[Middleware Stack]
        VALIDATION[Zod Validation]
    end
    
    subgraph "Data Layer"
        PRISMA[Prisma ORM]
        DB[(PostgreSQL 14+<br/>Metadatos y Usuarios)]
        IMMICH[Servidor Immich<br/>Almacenamiento de Imágenes<br/>Gestión de Metadatos EXIF<br/>Optimización Automática]
    end
    
    subgraph "External Services"
        EMAIL[SendGrid/Resend<br/>Email Service]
        SOCIAL_APIS[Social Media APIs<br/>Facebook, Instagram<br/>Twitter, LinkedIn]
    end
    
    APP --> API
    LANDING --> API
    MOBILE -.-> API
    
    API --> AUTH
    API --> ROUTES
    API --> MIDDLEWARE
    API --> VALIDATION
    API --> PRISMA
    API --> IMMICH
    API --> EMAIL
    API --> SOCIAL_APIS
    
    PRISMA --> DB
    
    APP -.-> IMMICH
    LANDING -.-> IMMICH
    MOBILE -.-> IMMICH
```

### Patrón de Arquitectura

- **API-First**: La API REST independiente sirve a múltiples clientes (React App, Next.js Landing, futura app móvil)
- **Separación de Responsabilidades**: Tres proyectos independientes con responsabilidades específicas
- **Backend Centralizado**: Toda la lógica de negocio centralizada en webfestival-api
- **Frontend Especializado**: webfestival-app para funcionalidades de concursos multimedia, webfestival-cms para contenido educativo, blog y marketing
- **Almacenamiento Híbrido**: PostgreSQL para metadatos, Immich para archivos multimedia con gestión inteligente de metadatos
- **Escalabilidad Independiente**: Cada proyecto puede escalar según sus necesidades específicas
- **Modelo de Negocio Integrado**: Soporte nativo para planes de suscripción y funcionalidades premium
- **Comunidad y Contenido**: Sistema unificado para blog educativo, newsletter y construcción de comunidad creativa

## Componentes y Interfaces

### 1. Sistema de Autenticación y Autorización

**Tecnología**: NextAuth.js o Clerk
**Responsabilidades**:
- Gestión de sesiones JWT
- Roles de usuario (PARTICIPANTE, JURADO, ADMIN, CONTENT_ADMIN)
- Middleware de autorización para rutas protegidas

```typescript
interface User {
  id: string;
  email: string;
  nombre: string;
  role: 'PARTICIPANTE' | 'JURADO' | 'ADMIN' | 'CONTENT_ADMIN';
  picture_url?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthContext {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
}
```

### 2. Gestión de Concursos

**Responsabilidades**:
- CRUD de concursos y categorías
- Gestión de estados del concurso
- Inscripciones de participantes

```typescript
interface Concurso {
  id: number;
  titulo: string;
  descripcion: string;
  reglas: string;
  fecha_inicio: Date;
  fecha_final: Date;
  status: 'Próximamente' | 'Activo' | 'Calificación' | 'Finalizado';
  imagen_url?: string;
  categorias: Categoria[];
  configuracion: ConfiguracionConcurso;
}

interface ConfiguracionConcurso {
  max_envios_por_participante: number; // máximo 3 por defecto
  tamaño_max_archivo: number; // en MB, 10MB por defecto
  dimensiones_max: { width: number; height: number }; // 4000x4000px por defecto
  formatos_permitidos: string[]; // ['image/jpeg', 'image/png', 'image/webp']
}
```

### 3. Sistema de Almacenamiento de Imágenes

**Tecnología**: Immich Server ([https://immich.app/](https://immich.app/))
**Responsabilidades**:
- Subida directa de archivos con extracción automática de metadatos EXIF
- Generación de URLs públicas seguras
- Optimización automática de imágenes con múltiples resoluciones
- Gestión inteligente de versiones (thumbnail, preview, original)
- Análisis automático de contenido y metadatos multimedia

```typescript
interface ImageService {
  generateUploadUrl(userId: string, concursoId: number): Promise<UploadUrl>;
  processImage(imageUrl: string): Promise<ProcessedImage>;
  deleteImage(imageUrl: string): Promise<void>;
}

interface ProcessedImage {
  original: string;
  preview: string; // 1280x720px (16:9 widescreen)
  thumbnail: string; // 400x225px (16:9 widescreen)
  metadata: ImageMetadata;
}

interface ImageMetadata {
  exif: Record<string, any>;
  dimensions: { width: number; height: number };
  fileSize: number;
  format: string;
}
```

### 4. Sistema de Calificaciones Especializadas

**Responsabilidades**:
- Asignación inteligente de jurados por especialización
- Gestión de criterios dinámicos por tipo de medio
- Gestión de calificaciones y comentarios especializados
- Cálculo de puntajes finales con ponderación configurable

```typescript
interface Medio {
  id: number;
  titulo: string;
  tipo_medio: 'fotografia' | 'video' | 'audio' | 'corto_cine';
  usuario_id: string;
  concurso_id: number;
  categoria_id: number;
  medio_url: string;
  thumbnail_url?: string;
  preview_url?: string;
  duracion?: number; // para videos y audios
  formato: string;
  tamaño_archivo: number;
  metadatos: Record<string, any>;
  fecha_subida: Date;
}

interface Criterio {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo_medio?: 'fotografia' | 'video' | 'audio' | 'corto_cine';
  peso: number;
  activo: boolean;
  orden: number;
}

interface JuradoEspecializacion {
  id: number;
  usuario_id: string;
  especializaciones: ('fotografia' | 'video' | 'audio' | 'corto_cine')[];
  experiencia_años: number;
  certificaciones?: string[];
  portfolio_url?: string;
}

interface Calificacion {
  id: number;
  medio_id: number;
  jurado_id: string;
  comentarios?: string;
  fecha_calificacion: Date;
  detalles?: CalificacionDetalle[];
}

interface CalificacionDetalle {
  id: number;
  calificacion_id: number;
  criterio_id: number;
  criterio: Criterio;
  puntuacion: number; // 1-10
}

interface ResultadoFinal {
  medio_id: number;
  puntaje_promedio: number;
  puntaje_ponderado: number;
  posicion: number;
  categoria_id: number;
  detalles_criterios: ResultadoCriterio[];
}

interface ResultadoCriterio {
  criterio_id: number;
  criterio_nombre: string;
  puntuacion_promedio: number;
  peso_aplicado: number;
  contribucion_final: number;
}

interface CriteriosPreconfigurados {
  fotografia: Criterio[];
  video: Criterio[];
  audio: Criterio[];
  corto_cine: Criterio[];
  universales: Criterio[];
}
```

### 5. Sistema de Notificaciones

**Tecnología**: Servicio de Email (SendGrid/Resend)
**Responsabilidades**:
- Notificaciones por email
- Templates de notificación
- Cola de envío de emails

```typescript
interface NotificationService {
  sendDeadlineReminder(userId: string, concurso: Concurso): Promise<void>;
  sendEvaluationComplete(userId: string, medio: Medio): Promise<void>;
  sendResultsAnnouncement(concursoId: number): Promise<void>;
  sendNewContestNotification(concurso: Concurso): Promise<void>;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}
```

### 6. Integración con Redes Sociales

**Responsabilidades**:
- Generación de enlaces compartibles
- Integración con APIs de redes sociales
- Gestión de contenido compartido

```typescript
interface SocialShareService {
  generateShareableLink(medio: Medio, resultado: ResultadoFinal): string;
  shareToFacebook(content: ShareContent): Promise<void>;
  shareToInstagram(content: ShareContent): Promise<void>;
  shareToTwitter(content: ShareContent): Promise<void>;
  shareToLinkedIn(content: ShareContent): Promise<void>;
}

interface ShareContent {
  imageUrl: string;
  title: string;
  description: string;
  hashtags: string[];
  link: string;
}
```

### 7. Sistema de Comunidad

**Responsabilidades**:
- Seguimiento entre usuarios
- Feed de actividades
- Comentarios públicos
- Sistema de reportes

```typescript
interface CommunityService {
  followUser(followerId: string, followedId: string): Promise<void>;
  unfollowUser(followerId: string, followedId: string): Promise<void>;
  getFeed(userId: string, page: number): Promise<FeedItem[]>;
  addComment(medioId: number, userId: string, content: string): Promise<Comment>;
  reportComment(commentId: number, reason: string): Promise<void>;
}

interface FeedItem {
  type: 'new_photo' | 'contest_win' | 'new_follow';
  user: User;
  content: any;
  timestamp: Date;
}
```

### 8. Sistema de Métricas y Analytics

**Responsabilidades**:
- Recopilación de métricas de uso
- Generación de reportes
- Dashboard de administración

```typescript
interface AnalyticsService {
  getUserMetrics(): Promise<UserMetrics>;
  getContestMetrics(concursoId?: number): Promise<ContestMetrics>;
  getJuryPerformance(): Promise<JuryMetrics>;
  getGrowthTrends(period: 'monthly' | 'yearly'): Promise<GrowthData>;
}

interface UserMetrics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByRole: Record<string, number>;
}
```

### 9. Sistema de Suscripciones y Monetización

**Responsabilidades**:
- Gestión de planes de suscripción (Básico, Profesional, Premium, Organizador)
- Control de límites y funcionalidades por plan
- Integración con pasarelas de pago
- Gestión de renovaciones automáticas y facturación

```typescript
interface SubscriptionService {
  // Gestión de planes
  getAvailablePlans(): Promise<SubscriptionPlan[]>;
  getUserSubscription(userId: string): Promise<UserSubscription>;
  upgradeSubscription(userId: string, planId: string): Promise<void>;
  cancelSubscription(userId: string): Promise<void>;
  
  // Control de límites
  checkParticipationLimit(userId: string, concursoId: number): Promise<boolean>;
  checkUploadLimit(userId: string): Promise<boolean>;
  checkPremiumFeatureAccess(userId: string, feature: string): Promise<boolean>;
  
  // Facturación
  processPayment(userId: string, planId: string, paymentMethod: PaymentMethod): Promise<PaymentResult>;
  generateInvoice(subscriptionId: string): Promise<Invoice>;
  handleWebhook(provider: string, payload: any): Promise<void>;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: PlanFeature[];
  limits: PlanLimits;
}

interface PlanFeature {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface PlanLimits {
  maxConcursosPerMonth: number;
  maxUploadsPerMonth: number;
  maxPrivateContests: number;
  maxTeamMembers: number;
  analyticsAccess: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
}

interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  plan: SubscriptionPlan;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  usage: SubscriptionUsage;
}

interface SubscriptionUsage {
  concursosThisMonth: number;
  uploadsThisMonth: number;
  privateContestsUsed: number;
  teamMembersUsed: number;
}
```

### 10. Sistema de Contenido Educativo y Blog

**Responsabilidades**:
- Gestión de contenido educativo sobre técnicas multimedia
- Blog de la comunidad creativa con interacciones
- Sistema de recomendaciones personalizadas
- Newsletter automático con digest semanal

```typescript
interface EducationalContentService {
  // Gestión de contenido educativo
  getEducationalContent(tipo: 'fotografia' | 'video' | 'audio' | 'cine'): Promise<ContenidoEducativo[]>;
  getFeaturedTutorials(): Promise<Tutorial[]>;
  getPersonalizedRecommendations(userId: string): Promise<ContenidoEducativo[]>;
  
  // Analytics de contenido
  trackContentView(contentId: number, userId?: string): Promise<void>;
  getPopularContent(timeframe: 'week' | 'month' | 'year'): Promise<ContenidoEducativo[]>;
  getTrendingTopics(): Promise<string[]>;
  
  // Newsletter
  generateWeeklyDigest(): Promise<NewsletterDigest>;
  sendNewsletterToSubscribers(digest: NewsletterDigest): Promise<void>;
  getNewsletterMetrics(): Promise<NewsletterMetrics>;
}

interface ContenidoEducativo {
  id: number;
  tipo: 'tutorial' | 'articulo' | 'guia' | 'inspiracion';
  categoria_multimedia: 'fotografia' | 'video' | 'audio' | 'cine' | 'general';
  titulo: string;
  contenido: string;
  nivel: 'principiante' | 'intermedio' | 'avanzado';
  tiempo_lectura: number;
  tags: string[];
  autor: User;
  fecha_publicacion: Date;
  metricas: ContenidoMetricas;
  recursos_adicionales?: RecursoAdicional[];
}

interface Tutorial {
  id: number;
  titulo: string;
  descripcion: string;
  pasos: PasoTutorial[];
  dificultad: 'facil' | 'medio' | 'dificil';
  duracion_estimada: number;
  herramientas_necesarias: string[];
  categoria_multimedia: string;
}

interface PasoTutorial {
  numero: number;
  titulo: string;
  descripcion: string;
  imagen_url?: string;
  video_url?: string;
  consejos?: string[];
}

interface NewsletterDigest {
  fecha: Date;
  contenido_destacado: ContenidoEducativo[];
  concursos_activos: Concurso[];
  ganadores_recientes: ResultadoFinal[];
  tips_semanales: string[];
  eventos_proximos: Evento[];
}

interface NewsletterMetrics {
  suscriptores_activos: number;
  tasa_apertura: number;
  tasa_clics: number;
  contenido_mas_popular: ContenidoEducativo[];
  crecimiento_semanal: number;
}
```

### 11. Sistema CMS Dinámico y Unificado

**Responsabilidades**:
- Sistema CMS dinámico que maneja múltiples tipos de contenido de forma unificada
- Gestión de contenido estático, blog posts y futuras extensiones
- Editor WYSIWYG integrado con campos personalizables según tipo de contenido
- Gestión de imágenes con integración directa a Immich
- Preview en tiempo real y optimización SEO automática
- Sistema unificado de comentarios y moderación
- Categorización y etiquetado flexible
- Newsletter automático para suscriptores
- Escalabilidad para nuevos tipos de contenido sin cambios de esquema

```typescript
interface CMSService {
  // Gestión de contenido principal
  getContent(filters: ContentFilters): Promise<PaginatedContent>;
  getContentBySlug(slug: string): Promise<Contenido>;
  createContent(content: CreateContentDto, userId: string): Promise<Contenido>;
  updateContent(id: number, content: UpdateContentDto, userId: string): Promise<Contenido>;
  deleteContent(id: number, userId: string): Promise<void>;
  publishContent(id: number, userId: string): Promise<void>;
  
  // Gestión de configuración
  updateContentConfig(contentId: number, config: ContenidoConfiguracion): Promise<void>;
  
  // Gestión de SEO
  updateContentSEO(contentId: number, seo: ContenidoSEO): Promise<void>;
  
  // Gestión de taxonomía
  updateContentTaxonomy(contentId: number, taxonomia: ContenidoTaxonomia[]): Promise<void>;
  getCategories(tipo?: string): Promise<string[]>;
  getTags(query?: string): Promise<string[]>;
  
  // Métricas
  updateContentMetrics(contentId: number, metricas: Partial<ContenidoMetricas>): Promise<void>;
  getContentMetrics(contentId: number): Promise<ContenidoMetricas>;
  
  // Gestión de plantillas y tipos
  getContentTypes(): Promise<ContentType[]>;
  getContentTemplate(tipo: string): Promise<ContentTemplate>;
  
  // Gestión de imágenes
  uploadImage(file: File): Promise<string>;
  previewContent(id: number): Promise<string>;
  
  // Validaciones
  validateContentAdmin(userId: string): Promise<boolean>;
}

interface Contenido {
  id: number;
  tipo: 'pagina_estatica' | 'blog_post' | 'seccion_cms';
  slug: string;
  titulo: string;
  contenido?: string;
  resumen?: string;
  imagen_destacada?: string;
  autor_id: string;
  autor: User;
  estado: 'borrador' | 'publicado' | 'archivado' | 'programado';
  fecha_publicacion?: Date;
  created_at: Date;
  updated_at: Date;
  updated_by?: string;
  
  // Relaciones (cargadas según necesidad)
  configuracion?: ContenidoConfiguracion;
  seo?: ContenidoSEO;
  metricas?: ContenidoMetricas;
  taxonomia?: ContenidoTaxonomia[];
}

interface ContenidoConfiguracion {
  contenido_id: number;
  activo: boolean;
  orden: number;
  permite_comentarios: boolean;
  destacado: boolean;
  configuracion_adicional?: Record<string, any>;
}

interface ContenidoSEO {
  contenido_id: number;
  seo_titulo?: string;
  seo_descripcion?: string;
  seo_keywords: string[];
  meta_tags?: Record<string, any>;
  structured_data?: Record<string, any>;
}

interface ContenidoMetricas {
  contenido_id: number;
  vistas: number;
  likes: number;
  comentarios_count: number;
  shares: number;
  ultima_vista?: Date;
  primera_publicacion?: Date;
}

interface ContenidoTaxonomia {
  id: number;
  contenido_id: number;
  categoria?: string;
  etiqueta?: string;
  tipo_taxonomia: 'categoria' | 'etiqueta';
}

interface ContentFilters {
  tipo?: string;
  categoria?: string;
  etiqueta?: string;
  autor?: string;
  estado?: 'borrador' | 'publicado' | 'archivado' | 'programado';
  busqueda?: string;
  activo?: boolean;
  page: number;
  limit: number;
}

interface PaginatedContent {
  contenido: Contenido[];
  total: number;
  page: number;
  totalPages: number;
}

interface ContentType {
  tipo: string;
  nombre: string;
  descripcion: string;
  campos_requeridos: string[];
  campos_opcionales: string[];
  permite_comentarios: boolean;
  tiene_orden: boolean;
  plantilla_defecto: string;
}

interface ContentTemplate {
  tipo: string;
  campos: ContentField[];
  configuracion: Record<string, any>;
}

interface ContentField {
  nombre: string;
  tipo: 'text' | 'textarea' | 'wysiwyg' | 'image' | 'select' | 'multiselect' | 'date' | 'boolean';
  requerido: boolean;
  opciones?: string[];
  validacion?: Record<string, any>;
}

interface ContentInteractionService {
  // Interacciones unificadas
  likeContent(contentId: number, tipoContenido: string, userId: string): Promise<void>;
  unlikeContent(contentId: number, tipoContenido: string, userId: string): Promise<void>;
  addComment(contentId: number, tipoContenido: string, userId: string, contenido: string, parentId?: number): Promise<ContenidoComentario>;
  moderateComment(commentId: number, approved: boolean, userId: string): Promise<void>;
  reportContent(elementId: number, tipoElemento: string, userId: string, razon: string, descripcion?: string): Promise<void>;
  
  // Estadísticas
  getContentStats(tipo?: string): Promise<ContentStats>;
  getPopularContent(tipo: string, limit: number): Promise<Contenido[]>;
  getTrendingTopics(tipo: string): Promise<string[]>;
  
  // Newsletter
  subscribeToNewsletter(email: string): Promise<void>;
  sendNewsletterDigest(): Promise<void>;
}

interface ContenidoComentario {
  id: number;
  contenido_id: number;
  tipo_contenido: string;
  usuario_id: string;
  usuario: User;
  contenido: string;
  aprobado: boolean;
  reportado: boolean;
  parent_id?: number;
  fecha_comentario: Date;
}

interface ContentStats {
  total_contenido: number;
  contenido_publicado: number;
  total_comentarios: number;
  total_vistas: number;
  total_likes: number;
  contenido_mas_popular: Contenido[];
  categorias_activas: { categoria: string; count: number }[];
  etiquetas_populares: { etiqueta: string; count: number }[];
}

interface CMSEditor {
  type: 'wysiwyg' | 'markdown' | 'html';
  content: string;
  toolbar: string[];
  plugins: string[];
  dragAndDrop: boolean;
  autoSave: boolean;
  spellCheck: boolean;
}

interface StaticPageService {
  generateSEOMetadata(content: ContenidoEstatico[]): Promise<SEOMetadata>;
  getFeaturedContests(): Promise<Concurso[]>;
  getPublicGallery(): Promise<Medio[]>;
  getFeaturedBlogPosts(limit: number): Promise<BlogPost[]>;
}

interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  structuredData: Record<string, any>;
}
```

## Modelos de Datos

### Esquema de Base de Datos Actualizado

```sql
-- Usuarios
CREATE TABLE "usuarios" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "nombre" TEXT,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT,
  "role" TEXT NOT NULL DEFAULT 'PARTICIPANTE',
  "picture_url" TEXT,
  "bio" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Especializaciones de jurados
CREATE TABLE "jurado_especializaciones" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "usuario_id" TEXT NOT NULL,
  "especializacion" TEXT NOT NULL,
  "experiencia_años" INTEGER DEFAULT 0,
  "certificaciones" TEXT[],
  "portfolio_url" TEXT,
  FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE
);

-- Planes de suscripción
CREATE TABLE "subscription_plans" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "price" DECIMAL(10,2) NOT NULL,
  "currency" TEXT DEFAULT 'USD',
  "interval" TEXT NOT NULL,
  "features" JSONB NOT NULL,
  "limits" JSONB NOT NULL,
  "active" BOOLEAN DEFAULT TRUE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Suscripciones de usuarios
CREATE TABLE "user_subscriptions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "plan_id" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "current_period_start" TIMESTAMP(3) NOT NULL,
  "current_period_end" TIMESTAMP(3) NOT NULL,
  "cancel_at_period_end" BOOLEAN DEFAULT FALSE,
  "stripe_subscription_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("user_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id")
);

-- Uso de suscripciones
CREATE TABLE "subscription_usage" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "subscription_id" TEXT NOT NULL,
  "period_start" TIMESTAMP(3) NOT NULL,
  "period_end" TIMESTAMP(3) NOT NULL,
  "concursos_used" INTEGER DEFAULT 0,
  "uploads_used" INTEGER DEFAULT 0,
  "private_contests_used" INTEGER DEFAULT 0,
  "team_members_used" INTEGER DEFAULT 0,
  FOREIGN KEY ("subscription_id") REFERENCES "user_subscriptions"("id") ON DELETE CASCADE
);

-- Concursos
CREATE TABLE "concursos" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "titulo" TEXT NOT NULL,
  "descripcion" TEXT NOT NULL,
  "reglas" TEXT,
  "fecha_inicio" TIMESTAMP(3) NOT NULL,
  "fecha_final" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'Próximamente',
  "imagen_url" TEXT,
  "max_envios" INTEGER DEFAULT 3,
  "tamaño_max_mb" INTEGER DEFAULT 10,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Categorías
CREATE TABLE "categorias" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "nombre" TEXT NOT NULL,
  "concurso_id" INTEGER NOT NULL,
  FOREIGN KEY ("concurso_id") REFERENCES "concursos"("id") ON DELETE CASCADE
);

-- Inscripciones
CREATE TABLE "inscripciones" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "usuario_id" TEXT NOT NULL,
  "concurso_id" INTEGER NOT NULL,
  "fecha_inscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  FOREIGN KEY ("concurso_id") REFERENCES "concursos"("id") ON DELETE CASCADE,
  UNIQUE("usuario_id", "concurso_id")
);

-- Medios Multimedia
CREATE TABLE "medios" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "titulo" TEXT NOT NULL,
  "tipo_medio" TEXT NOT NULL CHECK ("tipo_medio" IN ('fotografia', 'video', 'audio', 'corto_cine')),
  "usuario_id" TEXT NOT NULL,
  "concurso_id" INTEGER NOT NULL,
  "categoria_id" INTEGER NOT NULL,
  "medio_url" TEXT NOT NULL,
  "thumbnail_url" TEXT,
  "preview_url" TEXT,
  "duracion" INTEGER,
  "formato" TEXT NOT NULL,
  "tamaño_archivo" BIGINT NOT NULL,
  "metadatos" JSONB,
  "fecha_subida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  FOREIGN KEY ("concurso_id") REFERENCES "concursos"("id") ON DELETE CASCADE,
  FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE CASCADE
);

-- Asignaciones de Jurados
CREATE TABLE "jurado_asignaciones" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "usuario_id" TEXT NOT NULL,
  "categoria_id" INTEGER NOT NULL,
  FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE CASCADE,
  UNIQUE("usuario_id", "categoria_id")
);

-- Criterios de evaluación
CREATE TABLE "criterios" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "nombre" TEXT NOT NULL UNIQUE,
  "descripcion" TEXT,
  "tipo_medio" TEXT,
  "peso" NUMERIC(5,2) DEFAULT 1.0,
  "activo" BOOLEAN NOT NULL DEFAULT TRUE,
  "orden" INTEGER DEFAULT 0
);

-- Calificaciones
CREATE TABLE "calificaciones" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "medio_id" INTEGER NOT NULL,
  "jurado_id" TEXT NOT NULL,
  "comentarios" TEXT,
  "fecha_calificacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("medio_id") REFERENCES "medios"("id") ON DELETE CASCADE,
  FOREIGN KEY ("jurado_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  UNIQUE("medio_id", "jurado_id")
);

-- Detalle de calificaciones
CREATE TABLE "calificaciones_detalle" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "calificacion_id" INTEGER NOT NULL,
  "criterio_id" INTEGER NOT NULL,
  "puntuacion" INTEGER NOT NULL CHECK ("puntuacion" >= 1 AND "puntuacion" <= 10),
  FOREIGN KEY ("calificacion_id") REFERENCES "calificaciones"("id") ON DELETE CASCADE,
  FOREIGN KEY ("criterio_id") REFERENCES "criterios"("id") ON DELETE CASCADE,
  UNIQUE("calificacion_id", "criterio_id")
);

-- Seguimientos entre usuarios
CREATE TABLE "seguimientos" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "seguidor_id" TEXT NOT NULL,
  "seguido_id" TEXT NOT NULL,
  "fecha_seguimiento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("seguidor_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  FOREIGN KEY ("seguido_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  UNIQUE("seguidor_id", "seguido_id")
);

-- Comentarios públicos
CREATE TABLE "comentarios" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "medio_id" INTEGER NOT NULL,
  "usuario_id" TEXT NOT NULL,
  "contenido" TEXT NOT NULL,
  "fecha_comentario" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reportado" BOOLEAN DEFAULT FALSE,
  FOREIGN KEY ("medio_id") REFERENCES "medios"("id") ON DELETE CASCADE,
  FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE
);

-- Notificaciones
CREATE TABLE "notificaciones" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "usuario_id" TEXT NOT NULL,
  "tipo" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "mensaje" TEXT NOT NULL,
  "leida" BOOLEAN DEFAULT FALSE,
  "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE
);

-- Sistema CMS normalizado y optimizado
CREATE TABLE "contenido" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "tipo" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "titulo" TEXT NOT NULL,
  "contenido" TEXT,
  "resumen" TEXT,
  "imagen_destacada" TEXT,
  "autor_id" TEXT NOT NULL,
  "estado" TEXT NOT NULL DEFAULT 'borrador',
  "fecha_publicacion" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_by" TEXT,
  FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  FOREIGN KEY ("updated_by") REFERENCES "usuarios"("id")
);

-- Configuración específica por contenido
CREATE TABLE "contenido_configuracion" (
  "contenido_id" INTEGER NOT NULL PRIMARY KEY,
  "activo" BOOLEAN DEFAULT TRUE,
  "orden" INTEGER DEFAULT 0,
  "permite_comentarios" BOOLEAN DEFAULT FALSE,
  "destacado" BOOLEAN DEFAULT FALSE,
  "configuracion_adicional" JSONB,
  FOREIGN KEY ("contenido_id") REFERENCES "contenido"("id") ON DELETE CASCADE
);

-- Información SEO separada
CREATE TABLE "contenido_seo" (
  "contenido_id" INTEGER NOT NULL PRIMARY KEY,
  "seo_titulo" TEXT,
  "seo_descripcion" TEXT,
  "seo_keywords" TEXT[],
  "meta_tags" JSONB,
  "structured_data" JSONB,
  FOREIGN KEY ("contenido_id") REFERENCES "contenido"("id") ON DELETE CASCADE
);

-- Métricas y estadísticas
CREATE TABLE "contenido_metricas" (
  "contenido_id" INTEGER NOT NULL PRIMARY KEY,
  "vistas" INTEGER DEFAULT 0,
  "likes" INTEGER DEFAULT 0,
  "comentarios_count" INTEGER DEFAULT 0,
  "shares" INTEGER DEFAULT 0,
  "ultima_vista" TIMESTAMP(3),
  "primera_publicacion" TIMESTAMP(3),
  FOREIGN KEY ("contenido_id") REFERENCES "contenido"("id") ON DELETE CASCADE
);

-- Taxonomía (categorías y etiquetas)
CREATE TABLE "contenido_taxonomia" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "contenido_id" INTEGER NOT NULL,
  "categoria" TEXT,
  "etiqueta" TEXT,
  "tipo_taxonomia" TEXT NOT NULL,
  FOREIGN KEY ("contenido_id") REFERENCES "contenido"("id") ON DELETE CASCADE
);

-- Sistema unificado de comentarios
CREATE TABLE "contenido_comentarios" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "contenido_id" INTEGER NOT NULL,
  "tipo_contenido" TEXT NOT NULL,
  "usuario_id" TEXT NOT NULL,
  "contenido" TEXT NOT NULL,
  "aprobado" BOOLEAN DEFAULT FALSE,
  "reportado" BOOLEAN DEFAULT FALSE,
  "parent_id" INTEGER,
  "fecha_comentario" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  FOREIGN KEY ("parent_id") REFERENCES "contenido_comentarios"("id") ON DELETE CASCADE
);

-- Sistema unificado de likes
CREATE TABLE "contenido_likes" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "contenido_id" INTEGER NOT NULL,
  "tipo_contenido" TEXT NOT NULL,
  "usuario_id" TEXT NOT NULL,
  "fecha_like" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  UNIQUE("contenido_id", "tipo_contenido", "usuario_id")
);

-- Suscriptores del newsletter
CREATE TABLE "newsletter_suscriptores" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "activo" BOOLEAN DEFAULT TRUE,
  "fecha_suscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "fecha_confirmacion" TIMESTAMP(3),
  "token_confirmacion" TEXT
);

-- Sistema unificado de reportes
CREATE TABLE "contenido_reportes" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "elemento_id" INTEGER NOT NULL,
  "tipo_elemento" TEXT NOT NULL,
  "usuario_id" TEXT NOT NULL,
  "razon" TEXT NOT NULL,
  "descripcion" TEXT,
  "fecha_reporte" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resuelto" BOOLEAN DEFAULT FALSE,
  "resuelto_por" TEXT,
  "fecha_resolucion" TIMESTAMP(3),
  "accion_tomada" TEXT,
  FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE,
  FOREIGN KEY ("resuelto_por") REFERENCES "usuarios"("id")
);
```

## Manejo de Errores

### Estrategia de Manejo de Errores

```typescript
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Errores específicos
class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

class AuthenticationError extends AppError {
  constructor(message: string = 'No autorizado') {
    super(message, 401);
  }
}

class AuthorizationError extends AppError {
  constructor(message: string = 'Acceso denegado') {
    super(message, 403);
  }
}
```

### Middleware de Manejo de Errores

```typescript
export function errorHandler(error: Error, req: NextRequest, res: NextResponse) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  // Log error para errores no operacionales
  console.error('Error no manejado:', error);
  
  return NextResponse.json(
    { error: 'Error interno del servidor' },
    { status: 500 }
  );
}
```

## Estrategia de Testing

### Tipos de Testing

1. **Unit Tests**: Jest + Testing Library para componentes y funciones
2. **Integration Tests**: Pruebas de API endpoints
3. **E2E Tests**: Playwright para flujos completos de usuario

```typescript
// Ejemplo de test de integración
describe('API /api/concursos', () => {
  it('should create a new contest', async () => {
    const contestData = {
      titulo: 'Concurso Test',
      descripcion: 'Descripción test',
      fecha_inicio: new Date(),
      fecha_final: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

    const response = await request(app)
      .post('/api/concursos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(contestData)
      .expect(201);

    expect(response.body.titulo).toBe(contestData.titulo);
  });
});
```

## Consideraciones de Seguridad

### Medidas de Seguridad Implementadas

1. **Autenticación JWT**: Tokens seguros con expiración
2. **Validación de Entrada**: Sanitización de todos los inputs
3. **Rate Limiting**: Límites de requests por IP/usuario
4. **CORS**: Configuración restrictiva de orígenes permitidos
5. **Validación de Archivos**: Verificación de tipos y tamaños de imagen
6. **SQL Injection Prevention**: Uso de ORM/Query builders
7. **XSS Protection**: Sanitización de contenido HTML

```typescript
// Middleware de rate limiting
import rateLimit from 'express-rate-limit';

export const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 uploads por ventana
  message: 'Demasiadas subidas, intenta más tarde'
});

// Validación de archivos
export function validateImageFile(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  return allowedTypes.includes(file.type) && file.size <= maxSize;
}
```

## Optimización de Rendimiento

### Estrategias de Optimización

1. **Lazy Loading**: Carga diferida de imágenes y componentes
2. **Image Optimization**: Generación automática de thumbnails y previews
3. **Caching**: Redis para datos frecuentemente accedidos
4. **Database Indexing**: Índices optimizados para consultas frecuentes
5. **CDN**: Distribución de contenido estático

```sql
-- Índices para optimización
CREATE INDEX idx_medios_concurso_categoria ON medios(concurso_id, categoria_id);
CREATE INDEX idx_medios_tipo ON medios(tipo_medio);
CREATE INDEX idx_calificaciones_medio ON calificaciones(medio_id);
CREATE INDEX idx_calificaciones_jurado ON calificaciones(jurado_id);
CREATE INDEX idx_calificaciones_detalle_calificacion ON calificaciones_detalle(calificacion_id);
CREATE INDEX idx_calificaciones_detalle_criterio ON calificaciones_detalle(criterio_id);
CREATE INDEX idx_criterios_tipo_medio ON criterios(tipo_medio);
CREATE INDEX idx_criterios_activo ON criterios(activo) WHERE activo = true;
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_inscripciones_usuario_concurso ON inscripciones(usuario_id, concurso_id);

-- Índices para el sistema CMS normalizado
CREATE INDEX idx_contenido_tipo_estado ON contenido(tipo, estado);
CREATE INDEX idx_contenido_slug ON contenido(slug);
CREATE INDEX idx_contenido_autor ON contenido(autor_id);
CREATE INDEX idx_contenido_fecha_pub ON contenido(fecha_publicacion DESC);
CREATE INDEX idx_contenido_updated_at ON contenido(updated_at DESC);

-- Índices para taxonomía
CREATE INDEX idx_contenido_taxonomia_contenido ON contenido_taxonomia(contenido_id);
CREATE INDEX idx_contenido_taxonomia_categoria ON contenido_taxonomia(categoria);
CREATE INDEX idx_contenido_taxonomia_etiqueta ON contenido_taxonomia(etiqueta);
CREATE INDEX idx_contenido_taxonomia_tipo ON contenido_taxonomia(tipo_taxonomia);

-- Índices para configuración y métricas
CREATE INDEX idx_contenido_config_activo ON contenido_configuracion(activo);
CREATE INDEX idx_contenido_config_orden ON contenido_configuracion(orden);
CREATE INDEX idx_contenido_metricas_vistas ON contenido_metricas(vistas DESC);
CREATE INDEX idx_contenido_metricas_likes ON contenido_metricas(likes DESC);

-- Índices para interacciones (sin cambios)
CREATE INDEX idx_contenido_comentarios_contenido ON contenido_comentarios(contenido_id, tipo_contenido);
CREATE INDEX idx_contenido_comentarios_usuario ON contenido_comentarios(usuario_id);
CREATE INDEX idx_contenido_likes_contenido ON contenido_likes(contenido_id, tipo_contenido);
CREATE INDEX idx_contenido_likes_usuario ON contenido_likes(usuario_id);
CREATE INDEX idx_contenido_reportes_elemento ON contenido_reportes(elemento_id, tipo_elemento);
```

## Deployment y DevOps

### Estrategia de Deployment

1. **Containerización**: Docker para consistencia entre entornos
2. **CI/CD**: GitHub Actions para deployment automático
3. **Monitoring**: Logs y métricas de aplicación
4. **Backup**: Backup automático de base de datos y archivos

```dockerfile
# Dockerfile ejemplo
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```