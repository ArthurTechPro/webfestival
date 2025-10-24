import { useState, useEffect, useCallback } from 'react';
import { subscriptionService } from '../services/subscription.service';
import type { 
  SubscriptionPlan, 
  UserSubscription, 
  UpgradeSubscriptionData 
} from '../types/community';

export const useSubscription = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [usageLimits, setUsageLimits] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const plansData = await subscriptionService.getAvailablePlans();
      setPlans(plansData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar planes');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCurrentSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const subscription = await subscriptionService.getCurrentSubscription();
      setCurrentSubscription(subscription);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar suscripción');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsageLimits = useCallback(async () => {
    try {
      setError(null);
      const limits = await subscriptionService.checkUsageLimits();
      setUsageLimits(limits);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar límites de uso');
    }
  }, []);

  const upgradeSubscription = useCallback(async (data: UpgradeSubscriptionData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedSubscription = await subscriptionService.upgradeSubscription(data);
      setCurrentSubscription(updatedSubscription);
      return updatedSubscription;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar suscripción';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await subscriptionService.cancelSubscription();
      
      // Actualizar el estado local
      if (currentSubscription) {
        setCurrentSubscription({
          ...currentSubscription,
          cancelAtPeriodEnd: true
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cancelar suscripción';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentSubscription]);

  const reactivateSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const reactivatedSubscription = await subscriptionService.reactivateSubscription();
      setCurrentSubscription(reactivatedSubscription);
      return reactivatedSubscription;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al reactivar suscripción';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCheckoutSession = useCallback(async (planId: string) => {
    try {
      setLoading(true);
      setError(null);
      const session = await subscriptionService.createCheckoutSession(planId);
      
      // Redirigir a Stripe Checkout
      if (session.url) {
        window.location.href = session.url;
      }
      
      return session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear sesión de pago';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createBillingPortalSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const session = await subscriptionService.createBillingPortalSession();
      
      // Redirigir al portal de facturación
      if (session.url) {
        window.location.href = session.url;
      }
      
      return session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear portal de facturación';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para verificar si el usuario puede realizar una acción según su plan
  const canPerformAction = useCallback((action: string): boolean => {
    if (!currentSubscription || !usageLimits) return false;

    const { plan } = currentSubscription;
    const { usage } = currentSubscription;

    switch (action) {
      case 'participate_contest':
        return usage.concursosThisMonth < plan.limits.maxConcursosPerMonth;
      case 'upload_media':
        return usage.uploadsThisMonth < plan.limits.maxUploadsPerMonth;
      case 'create_private_contest':
        return usage.privateContestsUsed < plan.limits.maxPrivateContests;
      case 'add_team_member':
        return usage.teamMembersUsed < plan.limits.maxTeamMembers;
      case 'access_analytics':
        return plan.limits.analyticsAccess;
      case 'priority_support':
        return plan.limits.prioritySupport;
      case 'api_access':
        return plan.limits.apiAccess;
      default:
        return false;
    }
  }, [currentSubscription, usageLimits]);

  // Función para obtener el porcentaje de uso de un límite
  const getUsagePercentage = useCallback((limitType: string): number => {
    if (!currentSubscription) return 0;

    const { plan, usage } = currentSubscription;

    switch (limitType) {
      case 'contests':
        return (usage.concursosThisMonth / plan.limits.maxConcursosPerMonth) * 100;
      case 'uploads':
        return (usage.uploadsThisMonth / plan.limits.maxUploadsPerMonth) * 100;
      case 'private_contests':
        return (usage.privateContestsUsed / plan.limits.maxPrivateContests) * 100;
      case 'team_members':
        return (usage.teamMembersUsed / plan.limits.maxTeamMembers) * 100;
      default:
        return 0;
    }
  }, [currentSubscription]);

  useEffect(() => {
    fetchPlans();
    fetchCurrentSubscription();
    fetchUsageLimits();
  }, [fetchPlans, fetchCurrentSubscription, fetchUsageLimits]);

  return {
    plans,
    currentSubscription,
    usageLimits,
    loading,
    error,
    upgradeSubscription,
    cancelSubscription,
    reactivateSubscription,
    createCheckoutSession,
    createBillingPortalSession,
    canPerformAction,
    getUsagePercentage,
    refetch: () => {
      fetchCurrentSubscription();
      fetchUsageLimits();
    }
  };
};