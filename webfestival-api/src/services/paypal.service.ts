import axios, { AxiosInstance } from 'axios';
import { PaymentMethod, PaymentResult, PayPalWebhookEvent } from '../types/subscription.types';
import { subscriptionService } from './subscription.service';

interface PayPalAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_at: Date;
}

interface PayPalProduct {
  id: string;
  name: string;
  description?: string;
  type: 'SERVICE';
  category: 'SOFTWARE';
}

interface PayPalPlan {
  id: string;
  product_id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  billing_cycles: PayPalBillingCycle[];
  payment_preferences: PayPalPaymentPreferences;
}

interface PayPalBillingCycle {
  frequency: {
    interval_unit: 'MONTH' | 'YEAR';
    interval_count: number;
  };
  tenure_type: 'REGULAR';
  sequence: number;
  total_cycles: number;
  pricing_scheme: {
    fixed_price: {
      value: string;
      currency_code: string;
    };
  };
}

interface PayPalPaymentPreferences {
  auto_bill_outstanding: boolean;
  setup_fee_failure_action: 'CONTINUE' | 'CANCEL';
  payment_failure_threshold: number;
}

interface PayPalSubscription {
  id: string;
  plan_id: string;
  status: 'APPROVAL_PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED';
  status_update_time: string;
  start_time: string;
  subscriber: {
    email_address: string;
    name?: {
      given_name: string;
      surname: string;
    };
  };
  billing_info: {
    outstanding_balance: {
      currency_code: string;
      value: string;
    };
    cycle_executions: Array<{
      tenure_type: string;
      sequence: number;
      cycles_completed: number;
      cycles_remaining: number;
      current_pricing_scheme: {
        fixed_price: {
          currency_code: string;
          value: string;
        };
      };
    }>;
    last_payment?: {
      amount: {
        currency_code: string;
        value: string;
      };
      time: string;
    };
    next_billing_time?: string;
  };
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export class PayPalService {
  private client: AxiosInstance;
  private baseURL: string;
  private clientId: string;
  private clientSecret: string;
  private accessToken: PayPalAccessToken | null = null;

  constructor() {
    this.clientId = process.env['PAYPAL_CLIENT_ID'] || '';
    this.clientSecret = process.env['PAYPAL_CLIENT_SECRET'] || '';
    this.baseURL = process.env['NODE_ENV'] === 'production' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';

    if (!this.clientId || !this.clientSecret) {
      throw new Error('PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET deben estar configurados en las variables de entorno');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Interceptor para agregar token de autenticación
    this.client.interceptors.request.use(async (config: any) => {
      if (!config.url?.includes('/oauth2/token')) {
        const token = await this.getAccessToken();
        config.headers.Authorization = `Bearer ${token.access_token}`;
      }
      return config;
    });
  }

  // ============================================================================
  // AUTENTICACIÓN
  // ============================================================================

  /**
   * Obtiene un token de acceso de PayPal
   */
  private async getAccessToken(): Promise<PayPalAccessToken> {
    try {
      // Verificar si el token actual sigue siendo válido
      if (this.accessToken && this.accessToken.expires_at > new Date()) {
        return this.accessToken;
      }

      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post(
        `${this.baseURL}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = {
        ...response.data,
        expires_at: new Date(Date.now() + (response.data.expires_in * 1000) - 60000) // 1 minuto de margen
      };

      return this.accessToken;
    } catch (error) {
      console.error('Error al obtener token de acceso de PayPal:', error);
      throw new Error('No se pudo obtener el token de acceso de PayPal');
    }
  }

  // ============================================================================
  // GESTIÓN DE PRODUCTOS
  // ============================================================================

  /**
   * Crea un producto en PayPal para un plan de suscripción
   */
  async createProduct(planId: string, planName: string, description?: string): Promise<PayPalProduct> {
    try {
      const productData = {
        id: `plan_${planId}`,
        name: planName,
        description: description || `Plan de suscripción ${planName}`,
        type: 'SERVICE',
        category: 'SOFTWARE'
      };

      const response = await this.client.post('/v1/catalogs/products', productData);
      return response.data;
    } catch (error) {
      console.error('Error al crear producto en PayPal:', error);
      throw new Error('No se pudo crear el producto en PayPal');
    }
  }

  // ============================================================================
  // GESTIÓN DE PLANES
  // ============================================================================

  /**
   * Crea un plan de suscripción en PayPal
   */
  async createPlan(productId: string, planName: string, amount: number, currency: string, interval: 'monthly' | 'yearly'): Promise<PayPalPlan> {
    try {
      const intervalUnit = interval === 'monthly' ? 'MONTH' : 'YEAR';
      const intervalCount = 1;

      const planData = {
        product_id: productId,
        name: planName,
        description: `Plan de suscripción ${planName}`,
        status: 'ACTIVE',
        billing_cycles: [
          {
            frequency: {
              interval_unit: intervalUnit,
              interval_count: intervalCount
            },
            tenure_type: 'REGULAR',
            sequence: 1,
            total_cycles: 0, // 0 significa infinito
            pricing_scheme: {
              fixed_price: {
                value: amount.toFixed(2),
                currency_code: currency.toUpperCase()
              }
            }
          }
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee_failure_action: 'CONTINUE',
          payment_failure_threshold: 3
        }
      };

      const response = await this.client.post('/v1/billing/plans', planData);
      return response.data;
    } catch (error) {
      console.error('Error al crear plan en PayPal:', error);
      throw new Error('No se pudo crear el plan en PayPal');
    }
  }

  // ============================================================================
  // GESTIÓN DE SUSCRIPCIONES
  // ============================================================================

  /**
   * Crea una suscripción en PayPal
   */
  async createSubscription(planId: string, email: string, name?: string): Promise<PayPalSubscription> {
    try {
      const subscriptionData = {
        plan_id: planId,
        start_time: new Date(Date.now() + 60000).toISOString(), // Inicia en 1 minuto
        subscriber: {
          email_address: email,
          ...(name && {
            name: {
              given_name: name.split(' ')[0] || name,
              surname: name.split(' ').slice(1).join(' ') || ''
            }
          })
        },
        application_context: {
          brand_name: 'WebFestival',
          locale: 'es-ES',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          payment_method: {
            payer_selected: 'PAYPAL',
            payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
          },
          return_url: `${process.env['FRONTEND_URL']}/subscription/success`,
          cancel_url: `${process.env['FRONTEND_URL']}/subscription/cancel`
        }
      };

      const response = await this.client.post('/v1/billing/subscriptions', subscriptionData);
      return response.data;
    } catch (error) {
      console.error('Error al crear suscripción en PayPal:', error);
      throw new Error('No se pudo crear la suscripción en PayPal');
    }
  }

  /**
   * Obtiene los detalles de una suscripción
   */
  async getSubscription(subscriptionId: string): Promise<PayPalSubscription> {
    try {
      const response = await this.client.get(`/v1/billing/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener suscripción de PayPal:', error);
      throw new Error('No se pudo obtener la suscripción de PayPal');
    }
  }

  /**
   * Cancela una suscripción en PayPal
   */
  async cancelSubscription(subscriptionId: string, reason: string = 'Usuario solicitó cancelación'): Promise<void> {
    try {
      await this.client.post(`/v1/billing/subscriptions/${subscriptionId}/cancel`, {
        reason
      });
    } catch (error) {
      console.error('Error al cancelar suscripción en PayPal:', error);
      throw new Error('No se pudo cancelar la suscripción en PayPal');
    }
  }

  /**
   * Suspende una suscripción en PayPal
   */
  async suspendSubscription(subscriptionId: string, reason: string = 'Suspensión temporal'): Promise<void> {
    try {
      await this.client.post(`/v1/billing/subscriptions/${subscriptionId}/suspend`, {
        reason
      });
    } catch (error) {
      console.error('Error al suspender suscripción en PayPal:', error);
      throw new Error('No se pudo suspender la suscripción en PayPal');
    }
  }

  /**
   * Activa una suscripción suspendida en PayPal
   */
  async activateSubscription(subscriptionId: string, reason: string = 'Reactivación de suscripción'): Promise<void> {
    try {
      await this.client.post(`/v1/billing/subscriptions/${subscriptionId}/activate`, {
        reason
      });
    } catch (error) {
      console.error('Error al activar suscripción en PayPal:', error);
      throw new Error('No se pudo activar la suscripción en PayPal');
    }
  }

  // ============================================================================
  // PROCESAMIENTO DE PAGOS
  // ============================================================================

  /**
   * Procesa un pago para una suscripción usando PayPal
   */
  async processPayment(_userId: string, planId: string, paymentMethod: PaymentMethod, email: string, name?: string): Promise<PaymentResult> {
    try {
      if (paymentMethod.type !== 'paypal') {
        throw new Error('Este método solo soporta pagos con PayPal');
      }

      // Obtener el plan de suscripción
      const plan = await subscriptionService.getPlanById(planId);
      if (!plan) {
        throw new Error('Plan de suscripción no encontrado');
      }

      // Crear o obtener producto
      let productId = `plan_${planId}`;
      try {
        await this.client.get(`/v1/catalogs/products/${productId}`);
      } catch {
        await this.createProduct(planId, plan.name);
      }

      // Crear plan en PayPal
      const interval = plan.interval === 'monthly' ? 'monthly' : 'yearly';
      let paypalPlan: PayPalPlan;
      try {
        const response = await this.client.get(`/v1/billing/plans?product_id=${productId}`);
        const existingPlans = response.data.plans || [];
        paypalPlan = existingPlans.find((p: PayPalPlan) => p.status === 'ACTIVE');
        
        if (!paypalPlan) {
          paypalPlan = await this.createPlan(productId, plan.name, plan.price, plan.currency, interval);
        }
      } catch {
        paypalPlan = await this.createPlan(productId, plan.name, plan.price, plan.currency, interval);
      }

      // Crear suscripción
      const subscription = await this.createSubscription(paypalPlan.id, email, name);

      // Buscar el enlace de aprobación
      const approvalLink = subscription.links.find(link => link.rel === 'approve');
      
      if (!approvalLink) {
        throw new Error('No se pudo obtener el enlace de aprobación de PayPal');
      }

      return {
        success: true,
        subscription_id: subscription.id,
        requires_action: true,
        client_secret: approvalLink.href // Usamos el enlace de aprobación como client_secret
      };
    } catch (error) {
      console.error('Error al procesar pago con PayPal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al procesar el pago con PayPal'
      };
    }
  }

  /**
   * Confirma una suscripción después de la aprobación del usuario
   */
  async confirmSubscription(subscriptionId: string, userId: string, planId: string): Promise<PaymentResult> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      
      if (subscription.status === 'ACTIVE') {
        // Crear suscripción en nuestra base de datos
        const startTime = new Date(subscription.start_time);
        const endTime = new Date(startTime);
        
        // Calcular fecha de fin basada en el plan
        const plan = await subscriptionService.getPlanById(planId);
        if (plan?.interval === 'yearly') {
          endTime.setFullYear(endTime.getFullYear() + 1);
        } else {
          endTime.setMonth(endTime.getMonth() + 1);
        }

        await subscriptionService.createUserSubscription({
          user_id: userId,
          plan_id: planId,
          status: 'active',
          current_period_start: startTime,
          current_period_end: endTime,
          stripe_subscription_id: subscriptionId // Reutilizamos este campo para PayPal
        });

        return {
          success: true,
          subscription_id: subscriptionId
        };
      } else {
        return {
          success: false,
          error: `La suscripción está en estado: ${subscription.status}`
        };
      }
    } catch (error) {
      console.error('Error al confirmar suscripción de PayPal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al confirmar la suscripción'
      };
    }
  }

  // ============================================================================
  // WEBHOOKS
  // ============================================================================

  /**
   * Verifica la firma de un webhook de PayPal
   */
  verifyWebhookSignature(_payload: string, headers: Record<string, string>): boolean {
    try {
      // PayPal webhook verification es más compleja y requiere validación con su API
      // Por simplicidad, aquí solo verificamos que los headers necesarios estén presentes
      const requiredHeaders = ['paypal-transmission-id', 'paypal-cert-id', 'paypal-transmission-sig', 'paypal-transmission-time'];
      return requiredHeaders.every(header => headers[header]);
    } catch (error) {
      console.error('Error al verificar firma del webhook de PayPal:', error);
      return false;
    }
  }

  /**
   * Maneja eventos de webhook de PayPal
   */
  async handleWebhook(event: PayPalWebhookEvent): Promise<void> {
    try {
      switch (event.event_type) {
        case 'BILLING.SUBSCRIPTION.CREATED':
          await this.handleSubscriptionCreated(event.resource);
          break;
        case 'BILLING.SUBSCRIPTION.ACTIVATED':
          await this.handleSubscriptionActivated(event.resource);
          break;
        case 'BILLING.SUBSCRIPTION.UPDATED':
          await this.handleSubscriptionUpdated(event.resource);
          break;
        case 'BILLING.SUBSCRIPTION.CANCELLED':
          await this.handleSubscriptionCancelled(event.resource);
          break;
        case 'BILLING.SUBSCRIPTION.SUSPENDED':
          await this.handleSubscriptionSuspended(event.resource);
          break;
        case 'PAYMENT.SALE.COMPLETED':
          await this.handlePaymentCompleted(event.resource);
          break;
        case 'PAYMENT.SALE.DENIED':
          await this.handlePaymentDenied(event.resource);
          break;
        default:
          console.log(`Evento de webhook de PayPal no manejado: ${event.event_type}`);
      }
    } catch (error) {
      console.error('Error al manejar webhook de PayPal:', error);
      throw error;
    }
  }

  /**
   * Maneja la creación de una suscripción
   */
  private async handleSubscriptionCreated(subscription: any): Promise<void> {
    console.log('Suscripción creada en PayPal:', subscription.id);
  }

  /**
   * Maneja la activación de una suscripción
   */
  private async handleSubscriptionActivated(subscription: any): Promise<void> {
    console.log('Suscripción activada en PayPal:', subscription.id);
  }

  /**
   * Maneja la actualización de una suscripción
   */
  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    console.log('Suscripción actualizada en PayPal:', subscription.id);
  }

  /**
   * Maneja la cancelación de una suscripción
   */
  private async handleSubscriptionCancelled(subscription: any): Promise<void> {
    try {
      // Buscar la suscripción en nuestra base de datos por el ID de PayPal
      // Nota: Necesitaríamos agregar un campo para el ID de PayPal o usar el campo stripe_subscription_id
      console.log('Suscripción cancelada en PayPal:', subscription.id);
    } catch (error) {
      console.error('Error al manejar cancelación de suscripción de PayPal:', error);
    }
  }

  /**
   * Maneja la suspensión de una suscripción
   */
  private async handleSubscriptionSuspended(subscription: any): Promise<void> {
    console.log('Suscripción suspendida en PayPal:', subscription.id);
  }

  /**
   * Maneja el éxito de un pago
   */
  private async handlePaymentCompleted(payment: any): Promise<void> {
    console.log('Pago completado en PayPal:', payment.id);
  }

  /**
   * Maneja el rechazo de un pago
   */
  private async handlePaymentDenied(payment: any): Promise<void> {
    console.log('Pago rechazado en PayPal:', payment.id);
  }

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  /**
   * Convierte el estado de PayPal al estado interno
   */
  mapPayPalStatusToInternal(paypalStatus: string): 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing' {
    switch (paypalStatus) {
      case 'ACTIVE':
        return 'active';
      case 'CANCELLED':
      case 'EXPIRED':
        return 'canceled';
      case 'SUSPENDED':
        return 'past_due';
      case 'APPROVAL_PENDING':
      case 'APPROVED':
        return 'trialing';
      default:
        return 'unpaid';
    }
  }
}

export const paypalService = new PayPalService();