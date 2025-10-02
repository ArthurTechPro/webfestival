// ============================================================================
// TIPOS DE SUSCRIPCIONES Y MONETIZACIÓN
// ============================================================================

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

export interface SubscriptionPlanData {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: PlanFeature[];
  limits: PlanLimits;
  active: boolean;
  created_at: Date;
}

export interface UserSubscriptionData {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  current_period_start: Date;
  current_period_end: Date;
  cancel_at_period_end: boolean;
  stripe_subscription_id?: string;
  created_at: Date;
  updated_at: Date;
  plan?: SubscriptionPlanData;
  usage?: SubscriptionUsageData[];
}

export interface SubscriptionUsageData {
  id: number;
  subscription_id: string;
  period_start: Date;
  period_end: Date;
  concursos_used: number;
  uploads_used: number;
  private_contests_used: number;
  team_members_used: number;
}

export interface CreateSubscriptionPlanDto {
  id: string;
  name: string;
  price: number;
  currency?: string;
  interval: 'monthly' | 'yearly';
  features: PlanFeature[];
  limits: PlanLimits;
}

export interface UpdateSubscriptionPlanDto {
  name?: string;
  price?: number;
  currency?: string;
  interval?: 'monthly' | 'yearly';
  features?: PlanFeature[];
  limits?: PlanLimits;
  active?: boolean;
}

export interface CreateUserSubscriptionDto {
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  current_period_start: Date;
  current_period_end: Date;
  stripe_subscription_id?: string;
}

export interface UpdateUserSubscriptionDto {
  plan_id?: string;
  status?: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  current_period_start?: Date;
  current_period_end?: Date;
  cancel_at_period_end?: boolean;
  stripe_subscription_id?: string;
}

export interface PaymentMethod {
  type: 'card' | 'paypal';
  card?: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
  };
  paypal?: {
    email: string;
  };
}

export interface PaymentResult {
  success: boolean;
  payment_intent_id?: string;
  subscription_id?: string;
  error?: string;
  requires_action?: boolean;
  client_secret?: string;
}

export interface Invoice {
  id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  created: Date;
  due_date?: Date;
  pdf_url?: string;
}

export interface UsageLimitsCheck {
  canParticipateInContest: boolean;
  canUploadMedia: boolean;
  canCreatePrivateContest: boolean;
  canAddTeamMember: boolean;
  hasAnalyticsAccess: boolean;
  hasPrioritySupport: boolean;
  hasApiAccess: boolean;
  remainingConcursos: number;
  remainingUploads: number;
  remainingPrivateContests: number;
  remainingTeamMembers: number;
}

export interface SubscriptionMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  churnRate: number;
  subscriptionsByPlan: Record<string, number>;
  revenueByPlan: Record<string, number>;
  growthRate: number;
}

// Tipos para webhooks de Stripe
export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
  created: number;
}

// Tipos para webhooks de PayPal
export interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource: any;
  create_time: string;
}

// Configuración de planes predefinidos
export const DEFAULT_PLANS: CreateSubscriptionPlanDto[] = [
  {
    id: 'basico',
    name: 'Plan Básico',
    price: 0,
    currency: 'USD',
    interval: 'monthly',
    features: [
      { key: 'contests', name: 'Participación en concursos', description: 'Participa en concursos públicos', enabled: true },
      { key: 'uploads', name: 'Subida de medios', description: 'Sube hasta 10 medios por mes', enabled: true },
      { key: 'community', name: 'Funciones sociales', description: 'Sigue usuarios y comenta', enabled: true }
    ],
    limits: {
      maxConcursosPerMonth: 5,
      maxUploadsPerMonth: 10,
      maxPrivateContests: 0,
      maxTeamMembers: 0,
      analyticsAccess: false,
      prioritySupport: false,
      apiAccess: false
    }
  },
  {
    id: 'profesional',
    name: 'Plan Profesional',
    price: 19.99,
    currency: 'USD',
    interval: 'monthly',
    features: [
      { key: 'contests', name: 'Participación ilimitada', description: 'Participa en todos los concursos', enabled: true },
      { key: 'uploads', name: 'Subidas ilimitadas', description: 'Sube medios sin límite', enabled: true },
      { key: 'analytics', name: 'Analytics básicos', description: 'Estadísticas de tus participaciones', enabled: true },
      { key: 'priority', name: 'Soporte prioritario', description: 'Respuesta rápida a consultas', enabled: true }
    ],
    limits: {
      maxConcursosPerMonth: -1, // -1 significa ilimitado
      maxUploadsPerMonth: -1,
      maxPrivateContests: 2,
      maxTeamMembers: 3,
      analyticsAccess: true,
      prioritySupport: true,
      apiAccess: false
    }
  },
  {
    id: 'premium',
    name: 'Plan Premium',
    price: 49.99,
    currency: 'USD',
    interval: 'monthly',
    features: [
      { key: 'everything', name: 'Todo incluido', description: 'Todas las funciones disponibles', enabled: true },
      { key: 'private_contests', name: 'Concursos privados', description: 'Crea concursos privados para tu equipo', enabled: true },
      { key: 'api', name: 'Acceso API', description: 'Integra con tus propias aplicaciones', enabled: true },
      { key: 'advanced_analytics', name: 'Analytics avanzados', description: 'Métricas detalladas y reportes', enabled: true }
    ],
    limits: {
      maxConcursosPerMonth: -1,
      maxUploadsPerMonth: -1,
      maxPrivateContests: 10,
      maxTeamMembers: 10,
      analyticsAccess: true,
      prioritySupport: true,
      apiAccess: true
    }
  },
  {
    id: 'organizador',
    name: 'Plan Organizador',
    price: 99.99,
    currency: 'USD',
    interval: 'monthly',
    features: [
      { key: 'enterprise', name: 'Funciones empresariales', description: 'Herramientas para organizaciones', enabled: true },
      { key: 'unlimited_private', name: 'Concursos privados ilimitados', description: 'Sin límite de concursos privados', enabled: true },
      { key: 'team_management', name: 'Gestión de equipos', description: 'Administra equipos grandes', enabled: true },
      { key: 'white_label', name: 'Marca personalizada', description: 'Personaliza la interfaz con tu marca', enabled: true }
    ],
    limits: {
      maxConcursosPerMonth: -1,
      maxUploadsPerMonth: -1,
      maxPrivateContests: -1,
      maxTeamMembers: 50,
      analyticsAccess: true,
      prioritySupport: true,
      apiAccess: true
    }
  }
];