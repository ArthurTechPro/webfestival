import { z } from 'zod';

// ============================================================================
// ESQUEMAS DE VALIDACIÓN PARA SUSCRIPCIONES
// ============================================================================

// Esquema para características de plan
export const planFeatureSchema = z.object({
  key: z.string().min(1, 'La clave de la característica es requerida'),
  name: z.string().min(1, 'El nombre de la característica es requerido'),
  description: z.string().min(1, 'La descripción de la característica es requerida'),
  enabled: z.boolean()
});

// Esquema para límites de plan
export const planLimitsSchema = z.object({
  maxConcursosPerMonth: z.number().int().min(-1, 'Los límites deben ser -1 (ilimitado) o mayor a 0'),
  maxUploadsPerMonth: z.number().int().min(-1, 'Los límites deben ser -1 (ilimitado) o mayor a 0'),
  maxPrivateContests: z.number().int().min(-1, 'Los límites deben ser -1 (ilimitado) o mayor a 0'),
  maxTeamMembers: z.number().int().min(-1, 'Los límites deben ser -1 (ilimitado) o mayor a 0'),
  analyticsAccess: z.boolean(),
  prioritySupport: z.boolean(),
  apiAccess: z.boolean()
});

// Esquema para crear plan de suscripción
export const createSubscriptionPlanSchema = z.object({
  id: z.string().min(1, 'El ID del plan es requerido').regex(/^[a-z0-9_-]+$/, 'El ID solo puede contener letras minúsculas, números, guiones y guiones bajos'),
  name: z.string().min(1, 'El nombre del plan es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  currency: z.string().length(3, 'La moneda debe ser un código de 3 letras').default('USD'),
  interval: z.enum(['monthly', 'yearly'], {
    errorMap: () => ({ message: 'El intervalo debe ser "monthly" o "yearly"' })
  }),
  features: z.array(planFeatureSchema).min(1, 'Debe incluir al menos una característica'),
  limits: planLimitsSchema
});

// Esquema para actualizar plan de suscripción
export const updateSubscriptionPlanSchema = z.object({
  name: z.string().min(1, 'El nombre del plan es requerido').max(100, 'El nombre no puede exceder 100 caracteres').optional(),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0').optional(),
  currency: z.string().length(3, 'La moneda debe ser un código de 3 letras').optional(),
  interval: z.enum(['monthly', 'yearly'], {
    errorMap: () => ({ message: 'El intervalo debe ser "monthly" o "yearly"' })
  }).optional(),
  features: z.array(planFeatureSchema).min(1, 'Debe incluir al menos una característica').optional(),
  limits: planLimitsSchema.optional(),
  active: z.boolean().optional()
});

// Esquema para crear suscripción de usuario
export const createUserSubscriptionSchema = z.object({
  user_id: z.string().min(1, 'El ID del usuario es requerido'),
  plan_id: z.string().min(1, 'El ID del plan es requerido'),
  status: z.enum(['active', 'canceled', 'past_due', 'unpaid', 'trialing'], {
    errorMap: () => ({ message: 'Estado de suscripción inválido' })
  }),
  current_period_start: z.coerce.date({
    errorMap: () => ({ message: 'Fecha de inicio del período inválida' })
  }),
  current_period_end: z.coerce.date({
    errorMap: () => ({ message: 'Fecha de fin del período inválida' })
  }),
  stripe_subscription_id: z.string().optional()
}).refine(data => data.current_period_end > data.current_period_start, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['current_period_end']
});

// Esquema para actualizar suscripción de usuario
export const updateUserSubscriptionSchema = z.object({
  plan_id: z.string().min(1, 'El ID del plan es requerido').optional(),
  status: z.enum(['active', 'canceled', 'past_due', 'unpaid', 'trialing'], {
    errorMap: () => ({ message: 'Estado de suscripción inválido' })
  }).optional(),
  current_period_start: z.coerce.date({
    errorMap: () => ({ message: 'Fecha de inicio del período inválida' })
  }).optional(),
  current_period_end: z.coerce.date({
    errorMap: () => ({ message: 'Fecha de fin del período inválida' })
  }).optional(),
  cancel_at_period_end: z.boolean().optional(),
  stripe_subscription_id: z.string().optional()
});

// Esquema para método de pago con tarjeta
export const cardPaymentMethodSchema = z.object({
  type: z.literal('card'),
  card: z.object({
    number: z.string().regex(/^\d{13,19}$/, 'Número de tarjeta inválido'),
    exp_month: z.number().int().min(1).max(12),
    exp_year: z.number().int().min(new Date().getFullYear()),
    cvc: z.string().regex(/^\d{3,4}$/, 'CVC inválido')
  })
});

// Esquema para método de pago con PayPal
export const paypalPaymentMethodSchema = z.object({
  type: z.literal('paypal'),
  paypal: z.object({
    email: z.string().email('Email de PayPal inválido')
  })
});

// Esquema unificado para métodos de pago
export const paymentMethodSchema = z.discriminatedUnion('type', [
  cardPaymentMethodSchema,
  paypalPaymentMethodSchema
]);

// Esquema para procesar pago
export const processPaymentSchema = z.object({
  user_id: z.string().min(1, 'El ID del usuario es requerido'),
  plan_id: z.string().min(1, 'El ID del plan es requerido'),
  payment_method: paymentMethodSchema
});

// Esquema para actualizar uso de suscripción
export const updateSubscriptionUsageSchema = z.object({
  subscription_id: z.string().min(1, 'El ID de la suscripción es requerido'),
  concursos_used: z.number().int().min(0).optional(),
  uploads_used: z.number().int().min(0).optional(),
  private_contests_used: z.number().int().min(0).optional(),
  team_members_used: z.number().int().min(0).optional()
});

// Esquema para webhook de Stripe
export const stripeWebhookSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.any()
  }),
  created: z.number()
});

// Esquema para webhook de PayPal
export const paypalWebhookSchema = z.object({
  id: z.string(),
  event_type: z.string(),
  resource: z.any(),
  create_time: z.string()
});

// Esquema para parámetros de consulta de suscripciones
export const subscriptionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['active', 'canceled', 'past_due', 'unpaid', 'trialing']).optional(),
  plan_id: z.string().optional(),
  user_id: z.string().optional()
});

// Esquema para parámetros de consulta de planes
export const planQuerySchema = z.object({
  active: z.coerce.boolean().optional(),
  interval: z.enum(['monthly', 'yearly']).optional()
});

// Tipos inferidos de los esquemas
export type CreateSubscriptionPlanInput = z.infer<typeof createSubscriptionPlanSchema>;
export type UpdateSubscriptionPlanInput = z.infer<typeof updateSubscriptionPlanSchema>;
export type CreateUserSubscriptionInput = z.infer<typeof createUserSubscriptionSchema>;
export type UpdateUserSubscriptionInput = z.infer<typeof updateUserSubscriptionSchema>;
export type PaymentMethodInput = z.infer<typeof paymentMethodSchema>;
export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>;
export type UpdateSubscriptionUsageInput = z.infer<typeof updateSubscriptionUsageSchema>;
export type SubscriptionQueryInput = z.infer<typeof subscriptionQuerySchema>;
export type PlanQueryInput = z.infer<typeof planQuerySchema>;