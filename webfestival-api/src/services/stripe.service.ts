import Stripe from 'stripe';
import { PaymentMethod, PaymentResult, Invoice, StripeWebhookEvent } from '../types/subscription.types';
import { subscriptionService } from './subscription.service';

// Inicializar Stripe con la clave secreta
const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] || '', {
  apiVersion: '2025-08-27.basil'
});

export class StripeService {
  private stripe: Stripe;

  constructor() {
    if (!process.env['STRIPE_SECRET_KEY']) {
      throw new Error('STRIPE_SECRET_KEY no está configurada en las variables de entorno');
    }
    this.stripe = stripe;
  }

  // ============================================================================
  // GESTIÓN DE CLIENTES
  // ============================================================================

  /**
   * Crea o obtiene un cliente de Stripe para un usuario
   */
  async getOrCreateCustomer(userId: string, email: string, name?: string): Promise<Stripe.Customer> {
    try {
      // Buscar cliente existente por metadata
      const existingCustomers = await this.stripe.customers.list({
        metadata: { user_id: userId },
        limit: 1
      });

      if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0];
      }

      // Crear nuevo cliente
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: { user_id: userId }
      });

      return customer;
    } catch (error) {
      console.error('Error al crear/obtener cliente de Stripe:', error);
      throw new Error('No se pudo crear el cliente en Stripe');
    }
  }

  // ============================================================================
  // GESTIÓN DE MÉTODOS DE PAGO
  // ============================================================================

  /**
   * Crea un método de pago para un cliente
   */
  async createPaymentMethod(customerId: string, paymentMethod: PaymentMethod): Promise<Stripe.PaymentMethod> {
    try {
      if (paymentMethod.type !== 'card') {
        throw new Error('Solo se soportan métodos de pago con tarjeta en Stripe');
      }

      const stripePaymentMethod = await this.stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: paymentMethod.card!.number,
          exp_month: paymentMethod.card!.exp_month,
          exp_year: paymentMethod.card!.exp_year,
          cvc: paymentMethod.card!.cvc
        }
      });

      // Adjuntar el método de pago al cliente
      await this.stripe.paymentMethods.attach(stripePaymentMethod.id, {
        customer: customerId
      });

      return stripePaymentMethod;
    } catch (error) {
      console.error('Error al crear método de pago en Stripe:', error);
      throw new Error('No se pudo crear el método de pago');
    }
  }

  // ============================================================================
  // GESTIÓN DE PRODUCTOS Y PRECIOS
  // ============================================================================

  /**
   * Crea un producto en Stripe para un plan de suscripción
   */
  async createProduct(planId: string, planName: string): Promise<Stripe.Product> {
    try {
      const product = await this.stripe.products.create({
        id: `plan_${planId}`,
        name: planName,
        metadata: { plan_id: planId }
      });

      return product;
    } catch (error) {
      console.error('Error al crear producto en Stripe:', error);
      throw new Error('No se pudo crear el producto en Stripe');
    }
  }

  /**
   * Crea un precio en Stripe para un plan de suscripción
   */
  async createPrice(productId: string, amount: number, currency: string, interval: 'month' | 'year'): Promise<Stripe.Price> {
    try {
      const price = await this.stripe.prices.create({
        product: productId,
        unit_amount: Math.round(amount * 100), // Stripe usa centavos
        currency: currency.toLowerCase(),
        recurring: { interval }
      });

      return price;
    } catch (error) {
      console.error('Error al crear precio en Stripe:', error);
      throw new Error('No se pudo crear el precio en Stripe');
    }
  }

  // ============================================================================
  // GESTIÓN DE SUSCRIPCIONES
  // ============================================================================

  /**
   * Crea una suscripción en Stripe
   */
  async createSubscription(customerId: string, priceId: string, paymentMethodId?: string): Promise<Stripe.Subscription> {
    try {
      const subscriptionData: Stripe.SubscriptionCreateParams = {
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent']
      };

      if (paymentMethodId) {
        subscriptionData.default_payment_method = paymentMethodId;
      }

      const subscription = await this.stripe.subscriptions.create(subscriptionData);

      return subscription;
    } catch (error) {
      console.error('Error al crear suscripción en Stripe:', error);
      throw new Error('No se pudo crear la suscripción en Stripe');
    }
  }

  /**
   * Actualiza una suscripción en Stripe
   */
  async updateSubscription(subscriptionId: string, newPriceId: string): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      
      const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: newPriceId
        }],
        proration_behavior: 'create_prorations'
      });

      return updatedSubscription;
    } catch (error) {
      console.error('Error al actualizar suscripción en Stripe:', error);
      throw new Error('No se pudo actualizar la suscripción en Stripe');
    }
  }

  /**
   * Cancela una suscripción en Stripe
   */
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: cancelAtPeriodEnd
      });

      return subscription;
    } catch (error) {
      console.error('Error al cancelar suscripción en Stripe:', error);
      throw new Error('No se pudo cancelar la suscripción en Stripe');
    }
  }

  // ============================================================================
  // PROCESAMIENTO DE PAGOS
  // ============================================================================

  /**
   * Procesa un pago para una suscripción
   */
  async processPayment(userId: string, planId: string, paymentMethod: PaymentMethod, email: string, name?: string): Promise<PaymentResult> {
    try {
      if (paymentMethod.type !== 'card') {
        throw new Error('Solo se soportan pagos con tarjeta en Stripe');
      }

      // Obtener el plan de suscripción
      const plan = await subscriptionService.getPlanById(planId);
      if (!plan) {
        throw new Error('Plan de suscripción no encontrado');
      }

      // Crear o obtener cliente
      const customer = await this.getOrCreateCustomer(userId, email, name);

      // Crear método de pago
      const stripePaymentMethod = await this.createPaymentMethod(customer.id, paymentMethod);

      // Crear o obtener producto
      let product: Stripe.Product;
      try {
        product = await this.stripe.products.retrieve(`plan_${planId}`);
      } catch {
        product = await this.createProduct(planId, plan.name);
      }

      // Crear precio
      const interval = plan.interval === 'monthly' ? 'month' : 'year';
      const price = await this.createPrice(product.id, plan.price, plan.currency, interval);

      // Crear suscripción
      const subscription = await this.createSubscription(customer.id, price.id, stripePaymentMethod.id);

      // Verificar el estado del pago
      const invoice = subscription.latest_invoice as Stripe.Invoice;
      const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

      if (paymentIntent.status === 'succeeded') {
        // Crear suscripción en nuestra base de datos
        await subscriptionService.createUserSubscription({
          user_id: userId,
          plan_id: planId,
          status: 'active',
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
          stripe_subscription_id: subscription.id
        });

        return {
          success: true,
          payment_intent_id: paymentIntent.id,
          subscription_id: subscription.id
        };
      } else if (paymentIntent.status === 'requires_action') {
        return {
          success: false,
          requires_action: true,
          client_secret: paymentIntent.client_secret || undefined,
          payment_intent_id: paymentIntent.id
        };
      } else {
        return {
          success: false,
          error: 'El pago no pudo ser procesado'
        };
      }
    } catch (error) {
      console.error('Error al procesar pago con Stripe:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al procesar el pago'
      };
    }
  }

  // ============================================================================
  // GESTIÓN DE FACTURAS
  // ============================================================================

  /**
   * Genera una factura para una suscripción
   */
  async generateInvoice(subscriptionId: string): Promise<Invoice> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      const invoice = await this.stripe.invoices.retrieve(subscription.latest_invoice as string);

      return {
        id: invoice.id,
        subscription_id: subscriptionId,
        amount: invoice.amount_paid / 100, // Convertir de centavos
        currency: invoice.currency.toUpperCase(),
        status: invoice.status as any,
        created: new Date(invoice.created * 1000),
        due_date: invoice.due_date ? new Date(invoice.due_date * 1000) : undefined,
        pdf_url: invoice.invoice_pdf || undefined
      };
    } catch (error) {
      console.error('Error al generar factura:', error);
      throw new Error('No se pudo generar la factura');
    }
  }

  // ============================================================================
  // WEBHOOKS
  // ============================================================================

  /**
   * Verifica la firma de un webhook de Stripe
   */
  verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
    try {
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!endpointSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET no está configurado');
      }

      return this.stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    } catch (error) {
      console.error('Error al verificar firma del webhook:', error);
      throw new Error('Firma del webhook inválida');
    }
  }

  /**
   * Maneja eventos de webhook de Stripe
   */
  async handleWebhook(event: StripeWebhookEvent): Promise<void> {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        default:
          console.log(`Evento de webhook no manejado: ${event.type}`);
      }
    } catch (error) {
      console.error('Error al manejar webhook de Stripe:', error);
      throw error;
    }
  }

  /**
   * Maneja la creación de una suscripción
   */
  private async handleSubscriptionCreated(subscription: any): Promise<void> {
    console.log('Suscripción creada en Stripe:', subscription.id);
    // La lógica de creación ya se maneja en processPayment
  }

  /**
   * Maneja la actualización de una suscripción
   */
  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    try {
      // Buscar la suscripción en nuestra base de datos
      const userSubscription = await subscriptionService.getUserSubscription(subscription.metadata?.user_id);
      if (userSubscription && userSubscription.stripe_subscription_id === subscription.id) {
        await subscriptionService.updateUserSubscription(userSubscription.id, {
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000),
          current_period_end: new Date(subscription.current_period_end * 1000),
          cancel_at_period_end: subscription.cancel_at_period_end
        });
      }
    } catch (error) {
      console.error('Error al manejar actualización de suscripción:', error);
    }
  }

  /**
   * Maneja la eliminación de una suscripción
   */
  private async handleSubscriptionDeleted(subscription: any): Promise<void> {
    try {
      // Buscar la suscripción en nuestra base de datos
      const userSubscription = await subscriptionService.getUserSubscription(subscription.metadata?.user_id);
      if (userSubscription && userSubscription.stripe_subscription_id === subscription.id) {
        await subscriptionService.updateUserSubscription(userSubscription.id, {
          status: 'canceled'
        });
      }
    } catch (error) {
      console.error('Error al manejar eliminación de suscripción:', error);
    }
  }

  /**
   * Maneja el éxito de un pago
   */
  private async handlePaymentSucceeded(invoice: any): Promise<void> {
    console.log('Pago exitoso para la factura:', invoice.id);
    // Aquí se pueden agregar notificaciones o actualizaciones adicionales
  }

  /**
   * Maneja el fallo de un pago
   */
  private async handlePaymentFailed(invoice: any): Promise<void> {
    try {
      console.log('Pago fallido para la factura:', invoice.id);
      
      // Buscar la suscripción relacionada
      if (invoice.subscription) {
        const subscription = await this.stripe.subscriptions.retrieve(invoice.subscription);
        const userSubscription = await subscriptionService.getUserSubscription(subscription.metadata?.user_id);
        
        if (userSubscription) {
          await subscriptionService.updateUserSubscription(userSubscription.id, {
            status: 'past_due'
          });
        }
      }
    } catch (error) {
      console.error('Error al manejar fallo de pago:', error);
    }
  }
}

export const stripeService = new StripeService();