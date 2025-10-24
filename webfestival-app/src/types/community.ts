// Tipos para el sistema de comunidad y perfil

export interface UserProfile {
  id: string;
  email: string;
  nombre: string;
  role: 'PARTICIPANTE' | 'JURADO' | 'ADMIN' | 'CONTENT_ADMIN';
  picture_url?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
  // Estadísticas del perfil
  stats?: UserStats;
  // Información de seguimiento
  followingCount?: number;
  followersCount?: number;
  isFollowing?: boolean;
}

export interface UserStats {
  totalSubmissions: number;
  totalWins: number;
  totalParticipations: number;
  averageRating?: number;
  favoriteCategory?: string;
}

export interface UpdateProfileData {
  nombre?: string;
  bio?: string;
  picture_url?: string;
}

export interface Following {
  id: number;
  seguidor_id: string;
  seguido_id: string;
  fecha_seguimiento: Date;
  seguido: UserProfile;
}

export interface Follower {
  id: number;
  seguidor_id: string;
  seguido_id: string;
  fecha_seguimiento: Date;
  seguidor: UserProfile;
}

export interface FeedItem {
  id: string;
  type: 'new_submission' | 'contest_win' | 'new_follow' | 'contest_participation';
  user: UserProfile;
  content: FeedContent;
  timestamp: Date;
}

export interface FeedContent {
  // Para new_submission
  submission?: {
    id: number;
    titulo: string;
    tipo_medio: string;
    thumbnail_url?: string;
    concurso: {
      id: number;
      titulo: string;
    };
  };
  // Para contest_win
  win?: {
    concurso: {
      id: number;
      titulo: string;
    };
    posicion: number;
    categoria: string;
  };
  // Para new_follow
  followedUser?: UserProfile;
  // Para contest_participation
  participation?: {
    concurso: {
      id: number;
      titulo: string;
    };
  };
}

export interface Comment {
  id: number;
  medio_id: number;
  usuario_id: string;
  contenido: string;
  fecha_comentario: Date;
  reportado: boolean;
  usuario: UserProfile;
}

export interface CreateCommentData {
  medio_id: number;
  contenido: string;
}

export interface ReportCommentData {
  comment_id: number;
  reason: string;
}

// Tipos para suscripciones
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: PlanFeature[];
  limits: PlanLimits;
  active: boolean;
}

export interface PlanFeature {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface PlanLimits {
  maxConcursosPerMonth: number;
  maxUploadsPerMonth: number;
  maxPrivateContests: number;
  maxTeamMembers: number;
  analyticsAccess: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
}

export interface UserSubscription {
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

export interface SubscriptionUsage {
  concursosThisMonth: number;
  uploadsThisMonth: number;
  privateContestsUsed: number;
  teamMembersUsed: number;
}

export interface UpgradeSubscriptionData {
  planId: string;
  paymentMethodId?: string;
}