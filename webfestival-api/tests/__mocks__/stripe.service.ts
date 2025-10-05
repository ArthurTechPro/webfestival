import { PaymentMethod, PaymentResult } from '../../src/types/subscription.types';

export class StripeService {
  async processPayment(
    userId: string,
    planId: string,
    paymentMethod: PaymentMethod,
    email: string,
    name?: string
  ): Promise<PaymentResult> {
    return {
      success: true,
      payment_intent_id: 'pi_mock_123',
      subscription_id: 'sub_mock_123'
    };
  }

  verifyWebhookSignature(payload: any, signature: string): any {
    return {
      id: 'evt_mock_123',
      type: 'invoice.payment_succeeded',
      data: { object: {} },
      created: Math.floor(Date.now() / 1000)
    };
  }

  async handleWebhook(event: any): Promise<void> {
    // Mock implementation
  }
}

export const stripeService = new StripeService();