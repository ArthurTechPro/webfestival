import { PrismaClient } from '@prisma/client';
import {
    SubscriptionPlanData,
    UserSubscriptionData,
    SubscriptionUsageData,
    CreateSubscriptionPlanDto,
    UpdateSubscriptionPlanDto,
    CreateUserSubscriptionDto,
    UpdateUserSubscriptionDto,
    UsageLimitsCheck,
    SubscriptionMetrics,
    DEFAULT_PLANS
} from '../types/subscription.types';

const prisma = new PrismaClient();

export class SubscriptionService {
    /**
     * Helper para construir UserSubscriptionData con tipos correctos
     */
    private buildUserSubscriptionData(subscription: any): UserSubscriptionData {
        const result: UserSubscriptionData = {
            id: subscription.id,
            user_id: subscription.user_id,
            plan_id: subscription.plan_id,
            status: subscription.status as 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing',
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
            cancel_at_period_end: subscription.cancel_at_period_end,
            created_at: subscription.created_at,
            updated_at: subscription.updated_at
        };

        if (subscription.stripe_subscription_id) {
            result.stripe_subscription_id = subscription.stripe_subscription_id;
        }

        if (subscription.plan) {
            result.plan = {
                ...subscription.plan,
                features: subscription.plan.features as any,
                limits: subscription.plan.limits as any,
                price: Number(subscription.plan.price),
                interval: subscription.plan.interval as 'monthly' | 'yearly'
            };
        }

        if (subscription.usage) {
            result.usage = subscription.usage;
        }

        return result;
    }
    // ============================================================================
    // GESTIÓN DE PLANES DE SUSCRIPCIÓN
    // ============================================================================

    /**
     * Obtiene todos los planes de suscripción disponibles
     */
    async getAvailablePlans(activeOnly: boolean = true): Promise<SubscriptionPlanData[]> {
        try {
            const whereClause = activeOnly ? { active: true } : {};
            const plans = await prisma.subscriptionPlan.findMany({
                where: whereClause,
                orderBy: { price: 'asc' }
            });

            return plans.map(plan => ({
                ...plan,
                features: plan.features as any,
                limits: plan.limits as any,
                price: Number(plan.price),
                interval: plan.interval as 'monthly' | 'yearly'
            }));
        } catch (error) {
            console.error('Error al obtener planes de suscripción:', error);
            throw new Error('No se pudieron obtener los planes de suscripción');
        }
    }

    /**
     * Obtiene un plan de suscripción por ID
     */
    async getPlanById(planId: string): Promise<SubscriptionPlanData | null> {
        try {
            const plan = await prisma.subscriptionPlan.findUnique({
                where: { id: planId }
            });

            if (!plan) return null;

            return {
                ...plan,
                features: plan.features as any,
                limits: plan.limits as any,
                price: Number(plan.price),
                interval: plan.interval as 'monthly' | 'yearly'
            };
        } catch (error) {
            console.error('Error al obtener plan de suscripción:', error);
            throw new Error('No se pudo obtener el plan de suscripción');
        }
    }

    /**
     * Crea un nuevo plan de suscripción
     */
    async createPlan(planData: CreateSubscriptionPlanDto): Promise<SubscriptionPlanData> {
        try {
            const plan = await prisma.subscriptionPlan.create({
                data: {
                    id: planData.id,
                    name: planData.name,
                    price: planData.price,
                    currency: planData.currency || 'USD',
                    interval: planData.interval,
                    features: planData.features as any,
                    limits: planData.limits as any
                }
            });

            return {
                ...plan,
                features: plan.features as any,
                limits: plan.limits as any,
                price: Number(plan.price),
                interval: plan.interval as 'monthly' | 'yearly'
            };
        } catch (error) {
            console.error('Error al crear plan de suscripción:', error);
            throw new Error('No se pudo crear el plan de suscripción');
        }
    }

    /**
     * Actualiza un plan de suscripción existente
     */
    async updatePlan(planId: string, updateData: UpdateSubscriptionPlanDto): Promise<SubscriptionPlanData> {
        try {
            const plan = await prisma.subscriptionPlan.update({
                where: { id: planId },
                data: {
                    ...(updateData.name && { name: updateData.name }),
                    ...(updateData.price !== undefined && { price: updateData.price }),
                    ...(updateData.currency && { currency: updateData.currency }),
                    ...(updateData.interval && { interval: updateData.interval }),
                    ...(updateData.features && { features: updateData.features as any }),
                    ...(updateData.limits && { limits: updateData.limits as any }),
                    ...(updateData.active !== undefined && { active: updateData.active })
                }
            });

            return {
                ...plan,
                features: plan.features as any,
                limits: plan.limits as any,
                price: Number(plan.price),
                interval: plan.interval as 'monthly' | 'yearly'
            };
        } catch (error) {
            console.error('Error al actualizar plan de suscripción:', error);
            throw new Error('No se pudo actualizar el plan de suscripción');
        }
    }

    /**
     * Elimina un plan de suscripción (lo marca como inactivo)
     */
    async deletePlan(planId: string): Promise<void> {
        try {
            await prisma.subscriptionPlan.update({
                where: { id: planId },
                data: { active: false }
            });
        } catch (error) {
            console.error('Error al eliminar plan de suscripción:', error);
            throw new Error('No se pudo eliminar el plan de suscripción');
        }
    }

    // ============================================================================
    // GESTIÓN DE SUSCRIPCIONES DE USUARIO
    // ============================================================================

    /**
     * Obtiene la suscripción activa de un usuario
     */
    async getUserSubscription(userId: string): Promise<UserSubscriptionData | null> {
        try {
            const subscription = await prisma.userSubscription.findFirst({
                where: {
                    user_id: userId,
                    status: 'active'
                },
                include: {
                    plan: true,
                    usage: {
                        where: {
                            period_start: { lte: new Date() },
                            period_end: { gte: new Date() }
                        }
                    }
                },
                orderBy: { created_at: 'desc' }
            });

            if (!subscription) return null;

            return this.buildUserSubscriptionData(subscription);
        } catch (error) {
            console.error('Error al obtener suscripción del usuario:', error);
            throw new Error('No se pudo obtener la suscripción del usuario');
        }
    }

    /**
     * Crea una nueva suscripción para un usuario
     */
    async createUserSubscription(subscriptionData: CreateUserSubscriptionDto): Promise<UserSubscriptionData> {
        try {
            // Verificar que el plan existe
            const plan = await this.getPlanById(subscriptionData.plan_id);
            if (!plan) {
                throw new Error('El plan de suscripción no existe');
            }

            // Cancelar suscripción activa existente si la hay
            await this.cancelActiveSubscription(subscriptionData.user_id);

            // Crear nueva suscripción
            const subscription = await prisma.userSubscription.create({
                data: subscriptionData,
                include: {
                    plan: true
                }
            });

            // Crear registro de uso inicial
            await this.createUsageRecord(subscription.id, subscription.current_period_start, subscription.current_period_end);

            return this.buildUserSubscriptionData(subscription);
        } catch (error) {
            console.error('Error al crear suscripción de usuario:', error);
            throw new Error('No se pudo crear la suscripción del usuario');
        }
    }

    /**
     * Actualiza una suscripción de usuario
     */
    async updateUserSubscription(subscriptionId: string, updateData: UpdateUserSubscriptionDto): Promise<UserSubscriptionData> {
        try {
            const subscription = await prisma.userSubscription.update({
                where: { id: subscriptionId },
                data: updateData,
                include: {
                    plan: true,
                    usage: {
                        where: {
                            period_start: { lte: new Date() },
                            period_end: { gte: new Date() }
                        }
                    }
                }
            });

            return this.buildUserSubscriptionData(subscription);
        } catch (error) {
            console.error('Error al actualizar suscripción de usuario:', error);
            throw new Error('No se pudo actualizar la suscripción del usuario');
        }
    }

    /**
     * Cancela la suscripción activa de un usuario
     */
    async cancelActiveSubscription(userId: string): Promise<void> {
        try {
            await prisma.userSubscription.updateMany({
                where: {
                    user_id: userId,
                    status: 'active'
                },
                data: {
                    status: 'canceled',
                    cancel_at_period_end: true
                }
            });
        } catch (error) {
            console.error('Error al cancelar suscripción activa:', error);
            throw new Error('No se pudo cancelar la suscripción activa');
        }
    }

    /**
     * Mejora la suscripción de un usuario a un plan superior
     */
    async upgradeSubscription(userId: string, newPlanId: string): Promise<UserSubscriptionData> {
        try {
            const currentSubscription = await this.getUserSubscription(userId);
            if (!currentSubscription) {
                throw new Error('El usuario no tiene una suscripción activa');
            }

            const newPlan = await this.getPlanById(newPlanId);
            if (!newPlan) {
                throw new Error('El nuevo plan no existe');
            }

            // Actualizar la suscripción actual
            const updatedSubscription = await this.updateUserSubscription(currentSubscription.id, {
                plan_id: newPlanId
            });

            return updatedSubscription;
        } catch (error) {
            console.error('Error al mejorar suscripción:', error);
            throw new Error('No se pudo mejorar la suscripción');
        }
    }

    // ============================================================================
    // GESTIÓN DE USO Y LÍMITES
    // ============================================================================

    /**
     * Crea un registro de uso para un período específico
     */
    async createUsageRecord(subscriptionId: string, periodStart: Date, periodEnd: Date): Promise<SubscriptionUsageData> {
        try {
            const usage = await prisma.subscriptionUsage.create({
                data: {
                    subscription_id: subscriptionId,
                    period_start: periodStart,
                    period_end: periodEnd
                }
            });

            return usage;
        } catch (error) {
            console.error('Error al crear registro de uso:', error);
            throw new Error('No se pudo crear el registro de uso');
        }
    }

    /**
     * Obtiene el uso actual de una suscripción
     */
    async getCurrentUsage(subscriptionId: string): Promise<SubscriptionUsageData | null> {
        try {
            const now = new Date();
            const usage = await prisma.subscriptionUsage.findFirst({
                where: {
                    subscription_id: subscriptionId,
                    period_start: { lte: now },
                    period_end: { gte: now }
                }
            });

            return usage;
        } catch (error) {
            console.error('Error al obtener uso actual:', error);
            throw new Error('No se pudo obtener el uso actual');
        }
    }

    /**
     * Actualiza el uso de una suscripción
     */
    async updateUsage(subscriptionId: string, usageUpdate: Partial<SubscriptionUsageData>): Promise<SubscriptionUsageData> {
        try {
            const currentUsage = await this.getCurrentUsage(subscriptionId);
            if (!currentUsage) {
                throw new Error('No se encontró registro de uso actual');
            }

            const updatedUsage = await prisma.subscriptionUsage.update({
                where: { id: currentUsage.id },
                data: {
                    ...(usageUpdate.concursos_used !== undefined && { concursos_used: usageUpdate.concursos_used }),
                    ...(usageUpdate.uploads_used !== undefined && { uploads_used: usageUpdate.uploads_used }),
                    ...(usageUpdate.private_contests_used !== undefined && { private_contests_used: usageUpdate.private_contests_used }),
                    ...(usageUpdate.team_members_used !== undefined && { team_members_used: usageUpdate.team_members_used })
                }
            });

            return updatedUsage;
        } catch (error) {
            console.error('Error al actualizar uso:', error);
            throw new Error('No se pudo actualizar el uso');
        }
    }

    /**
     * Incrementa el uso de una métrica específica
     */
    async incrementUsage(subscriptionId: string, metric: keyof Pick<SubscriptionUsageData, 'concursos_used' | 'uploads_used' | 'private_contests_used' | 'team_members_used'>, amount: number = 1): Promise<void> {
        try {
            const currentUsage = await this.getCurrentUsage(subscriptionId);
            if (!currentUsage) {
                throw new Error('No se encontró registro de uso actual');
            }

            await prisma.subscriptionUsage.update({
                where: { id: currentUsage.id },
                data: {
                    [metric]: { increment: amount }
                }
            });
        } catch (error) {
            console.error('Error al incrementar uso:', error);
            throw new Error('No se pudo incrementar el uso');
        }
    }

    /**
     * Verifica los límites de uso para un usuario
     */
    async checkUsageLimits(userId: string): Promise<UsageLimitsCheck> {
        try {
            const subscription = await this.getUserSubscription(userId);

            // Si no tiene suscripción, usar límites del plan básico
            if (!subscription) {
                const basicPlan = DEFAULT_PLANS.find(p => p.id === 'basico');
                if (!basicPlan) {
                    throw new Error('Plan básico no encontrado');
                }

                return {
                    canParticipateInContest: true,
                    canUploadMedia: true,
                    canCreatePrivateContest: false,
                    canAddTeamMember: false,
                    hasAnalyticsAccess: false,
                    hasPrioritySupport: false,
                    hasApiAccess: false,
                    remainingConcursos: basicPlan.limits.maxConcursosPerMonth,
                    remainingUploads: basicPlan.limits.maxUploadsPerMonth,
                    remainingPrivateContests: 0,
                    remainingTeamMembers: 0
                };
            }

            const currentUsage = await this.getCurrentUsage(subscription.id);
            const limits = subscription.plan?.limits;

            if (!limits || !currentUsage) {
                throw new Error('No se pudieron obtener los límites o el uso actual');
            }

            const remainingConcursos = limits.maxConcursosPerMonth === -1 ? -1 : Math.max(0, limits.maxConcursosPerMonth - currentUsage.concursos_used);
            const remainingUploads = limits.maxUploadsPerMonth === -1 ? -1 : Math.max(0, limits.maxUploadsPerMonth - currentUsage.uploads_used);
            const remainingPrivateContests = limits.maxPrivateContests === -1 ? -1 : Math.max(0, limits.maxPrivateContests - currentUsage.private_contests_used);
            const remainingTeamMembers = limits.maxTeamMembers === -1 ? -1 : Math.max(0, limits.maxTeamMembers - currentUsage.team_members_used);

            return {
                canParticipateInContest: remainingConcursos !== 0,
                canUploadMedia: remainingUploads !== 0,
                canCreatePrivateContest: remainingPrivateContests !== 0,
                canAddTeamMember: remainingTeamMembers !== 0,
                hasAnalyticsAccess: limits.analyticsAccess,
                hasPrioritySupport: limits.prioritySupport,
                hasApiAccess: limits.apiAccess,
                remainingConcursos,
                remainingUploads,
                remainingPrivateContests,
                remainingTeamMembers
            };
        } catch (error) {
            console.error('Error al verificar límites de uso:', error);
            throw new Error('No se pudieron verificar los límites de uso');
        }
    }

    // ============================================================================
    // MÉTRICAS Y ANALYTICS
    // ============================================================================

    /**
     * Obtiene métricas generales de suscripciones
     */
    async getSubscriptionMetrics(): Promise<SubscriptionMetrics> {
        try {
            const totalSubscriptions = await prisma.userSubscription.count();
            const activeSubscriptions = await prisma.userSubscription.count({
                where: { status: 'active' }
            });

            // Calcular ingresos mensuales y anuales
            const activeSubscriptionsWithPlans = await prisma.userSubscription.findMany({
                where: { status: 'active' },
                include: { plan: true }
            });

            let monthlyRevenue = 0;
            let yearlyRevenue = 0;
            const subscriptionsByPlan: Record<string, number> = {};
            const revenueByPlan: Record<string, number> = {};

            activeSubscriptionsWithPlans.forEach(sub => {
                if (sub.plan) {
                    const planId = sub.plan.id;
                    const price = Number(sub.plan.price);

                    subscriptionsByPlan[planId] = (subscriptionsByPlan[planId] || 0) + 1;
                    revenueByPlan[planId] = (revenueByPlan[planId] || 0) + price;

                    if (sub.plan.interval === 'monthly') {
                        monthlyRevenue += price;
                        yearlyRevenue += price * 12;
                    } else if (sub.plan.interval === 'yearly') {
                        yearlyRevenue += price;
                        monthlyRevenue += price / 12;
                    }
                }
            });

            // Calcular tasa de cancelación (simplificada)
            const canceledThisMonth = await prisma.userSubscription.count({
                where: {
                    status: 'canceled',
                    updated_at: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }
            });

            const churnRate = totalSubscriptions > 0 ? (canceledThisMonth / totalSubscriptions) * 100 : 0;

            // Calcular tasa de crecimiento (simplificada)
            const newSubscriptionsThisMonth = await prisma.userSubscription.count({
                where: {
                    created_at: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }
            });

            const growthRate = totalSubscriptions > 0 ? (newSubscriptionsThisMonth / totalSubscriptions) * 100 : 0;

            return {
                totalSubscriptions,
                activeSubscriptions,
                monthlyRevenue,
                yearlyRevenue,
                churnRate,
                subscriptionsByPlan,
                revenueByPlan,
                growthRate
            };
        } catch (error) {
            console.error('Error al obtener métricas de suscripciones:', error);
            throw new Error('No se pudieron obtener las métricas de suscripciones');
        }
    }

    // ============================================================================
    // UTILIDADES
    // ============================================================================

    /**
     * Inicializa los planes predeterminados en la base de datos
     */
    async initializeDefaultPlans(): Promise<void> {
        try {
            for (const planData of DEFAULT_PLANS) {
                const existingPlan = await this.getPlanById(planData.id);
                if (!existingPlan) {
                    await this.createPlan(planData);
                    console.log(`Plan ${planData.name} creado exitosamente`);
                }
            }
        } catch (error) {
            console.error('Error al inicializar planes predeterminados:', error);
            throw new Error('No se pudieron inicializar los planes predeterminados');
        }
    }

    /**
     * Verifica si un usuario puede realizar una acción específica
     */
    async canUserPerformAction(userId: string, action: 'participate' | 'upload' | 'create_private' | 'add_member'): Promise<boolean> {
        try {
            const limits = await this.checkUsageLimits(userId);

            switch (action) {
                case 'participate':
                    return limits.canParticipateInContest;
                case 'upload':
                    return limits.canUploadMedia;
                case 'create_private':
                    return limits.canCreatePrivateContest;
                case 'add_member':
                    return limits.canAddTeamMember;
                default:
                    return false;
            }
        } catch (error) {
            console.error('Error al verificar permisos de usuario:', error);
            return false;
        }
    }
}

export const subscriptionService = new SubscriptionService();