import { apiService } from './api';
import type { 
  SubscriptionPlan, 
  UserSubscription, 
  UpgradeSubscriptionData 
} from '../types/community';
// import type { ApiResponse } from '../types';

class SubscriptionService {
  /**
   * Obtener planes de suscripción disponibles
   */
  async getAvailablePlans(): Promise<SubscriptionPlan[]> {
    const response = await apiService.get<SubscriptionPlan[]>('/subscriptions/plans');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error al obtener planes');
  }

  /**
   * Obtener suscripción actual del usuario
   */
  async getCurrentSubscription(): Promise<UserSubscription | null> {
    const response = await apiService.get<UserSubscription>('/subscriptions/current');
    
    if (response.success) {
      return response.data || null;
    }
    
    throw new Error(response.message || 'Error al obtener suscripción');
  }

  /**
   * Actualizar suscripción
   */
  async upgradeSubscription(data: UpgradeSubscriptionData): Promise<UserSubscription> {
    const response = await apiService.post<UserSubscription>('/subscriptions/upgrade', data);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error al actualizar suscripción');
  }

  /**
   * Cancelar suscripción
   */
  async cancelSubscription(): Promise<void> {
    const response = await apiService.post<void>('/subscriptions/cancel');
    
    if (!response.success) {
      throw new Error(response.message || 'Error al cancelar suscripción');
    }
  }

  /**
   * Reactivar suscripción cancelada
   */
  async reactivateSubscription(): Promise<UserSubscription> {
    const response = await apiService.post<UserSubscription>('/subscriptions/reactivate');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error al reactivar suscripción');
  }

  /**
   * Obtener historial de facturación
   */
  async getBillingHistory(page: number = 1, limit: number = 20): Promise<any> {
    const response = await apiService.get<any>(`/subscriptions/billing-history?page=${page}&limit=${limit}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error al obtener historial de facturación');
  }

  /**
   * Verificar límites de uso
   */
  async checkUsageLimits(): Promise<any> {
    const response = await apiService.get<any>('/subscriptions/usage-limits');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error al verificar límites');
  }

  /**
   * Crear sesión de checkout para Stripe
   */
  async createCheckoutSession(planId: string): Promise<{ url: string }> {
    const response = await apiService.post<{ url: string }>('/subscriptions/create-checkout-session', { planId });
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error al crear sesión de pago');
  }

  /**
   * Crear portal de facturación para gestión de suscripción
   */
  async createBillingPortalSession(): Promise<{ url: string }> {
    const response = await apiService.post<{ url: string }>('/subscriptions/create-portal-session');
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.message || 'Error al crear portal de facturación');
  }
}

// Instancia singleton del servicio de suscripciones
export const subscriptionService = new SubscriptionService();
export default subscriptionService;