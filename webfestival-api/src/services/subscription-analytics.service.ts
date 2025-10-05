import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class SubscriptionAnalyticsService {
    // ============================================================================
    // MÉTRICAS DE SUSCRIPCIONES
    // ============================================================================

    /**
     * Obtiene métricas completas de suscripciones
     */
    async getComprehensiveMetrics(): Promise<ComprehensiveMetrics> {
        try {
            const [
                subscriptionMetrics,
                revenueMetrics,
                churnMetrics,
                growthMetrics,
                paymentMetrics
            ] = await Promise.all([
                this.getSubscriptionMetrics(),
                this.getRevenueMetrics(),
                this.getChurnMetrics(),
                this.getGrowthMetrics(),
                this.getPaymentMetrics()
            ]);

            return {
                subscriptions: subscriptionMetrics,
                revenue: revenueMetrics,
                churn: churnMetrics,
                growth: growthMetrics,
                payments: paymentMetrics,
                generatedAt: new Date()
            };
        } catch (error) {
            console.error('Error al obtener métricas comprehensivas:', error);
            throw error;
        }
    }

    /**
     * Obtiene métricas básicas de suscripciones
     */
    private async getSubscriptionMetrics(): Promise<SubscriptionMetrics> {
        const [
            totalSubscriptions,
            activeSubscriptions,
            trialingSubscriptions,
            pastDueSubscriptions,
            canceledSubscriptions,
            subscriptionsByPlan
        ] = await Promise.all([
            prisma.userSubscription.count(),
            prisma.userSubscription.count({ where: { status: 'active' } }),
            prisma.userSubscription.count({ where: { status: 'trialing' } }),
            prisma.userSubscription.count({ where: { status: 'past_due' } }),
            prisma.userSubscription.count({ where: { status: 'canceled' } }),
            this.getSubscriptionsByPlan()
        ]);

        return {
            total: totalSubscriptions,
            active: activeSubscriptions,
            trialing: trialingSubscriptions,
            pastDue: pastDueSubscriptions,
            canceled: canceledSubscriptions,
            byPlan: subscriptionsByPlan
        };
    }

    /**
     * Obtiene métricas de ingresos
     */
    private async getRevenueMetrics(): Promise<RevenueMetrics> {
        try {
            // Obtener suscripciones activas con sus planes
            const activeSubscriptions = await prisma.userSubscription.findMany({
                where: { status: { in: ['active', 'trialing'] } },
                include: { plan: true }
            });

            let monthlyRevenue = 0;
            let yearlyRevenue = 0;

            activeSubscriptions.forEach(subscription => {
                if (subscription.plan) {
                    const planPrice = Number(subscription.plan.price);
                    if (subscription.plan.interval === 'monthly') {
                        monthlyRevenue += planPrice;
                        yearlyRevenue += planPrice * 12;
                    } else {
                        yearlyRevenue += planPrice;
                        monthlyRevenue += planPrice / 12;
                    }
                }
            });

            // Calcular MRR (Monthly Recurring Revenue) y ARR (Annual Recurring Revenue)
            const mrr = monthlyRevenue;
            const arr = yearlyRevenue;

            // Obtener ingresos por plan
            const revenueByPlan = await this.getRevenueByPlan();

            return {
                mrr: Math.round(mrr * 100) / 100,
                arr: Math.round(arr * 100) / 100,
                averageRevenuePerUser: activeSubscriptions.length > 0 ? Math.round((mrr / activeSubscriptions.length) * 100) / 100 : 0,
                byPlan: revenueByPlan
            };
        } catch (error) {
            console.error('Error al calcular métricas de ingresos:', error);
            return {
                mrr: 0,
                arr: 0,
                averageRevenuePerUser: 0,
                byPlan: {}
            };
        }
    }

    /**
     * Obtiene métricas de churn (cancelaciones)
     */
    private async getChurnMetrics(): Promise<ChurnMetrics> {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const [
                totalActiveAtStart,
                canceledInPeriod,
                newSubscriptionsInPeriod
            ] = await Promise.all([
                prisma.userSubscription.count({
                    where: {
                        status: 'active',
                        created_at: { lt: thirtyDaysAgo }
                    }
                }),
                prisma.userSubscription.count({
                    where: {
                        status: 'canceled',
                        updated_at: { gte: thirtyDaysAgo }
                    }
                }),
                prisma.userSubscription.count({
                    where: {
                        created_at: { gte: thirtyDaysAgo }
                    }
                })
            ]);

            const churnRate = totalActiveAtStart > 0 ? (canceledInPeriod / totalActiveAtStart) * 100 : 0;
            const growthRate = totalActiveAtStart > 0 ? (newSubscriptionsInPeriod / totalActiveAtStart) * 100 : 0;
            const netGrowthRate = growthRate - churnRate;

            return {
                churnRate: Math.round(churnRate * 100) / 100,
                canceledInPeriod,
                newSubscriptionsInPeriod,
                netGrowthRate: Math.round(netGrowthRate * 100) / 100,
                period: '30 days'
            };
        } catch (error) {
            console.error('Error al calcular métricas de churn:', error);
            return {
                churnRate: 0,
                canceledInPeriod: 0,
                newSubscriptionsInPeriod: 0,
                netGrowthRate: 0,
                period: '30 days'
            };
        }
    }

    /**
     * Obtiene métricas de crecimiento
     */
    private async getGrowthMetrics(): Promise<GrowthMetrics> {
        try {
            const periods = [7, 30, 90]; // días
            const growthData: { [key: string]: number } = {};

            for (const days of periods) {
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - days);

                const newSubscriptions = await prisma.userSubscription.count({
                    where: {
                        created_at: { gte: startDate }
                    }
                });

                growthData[`${days}d`] = newSubscriptions;
            }

            // Calcular tendencia (comparar últimos 30 días con 30 días anteriores)
            const last30Days = new Date();
            last30Days.setDate(last30Days.getDate() - 30);

            const previous30Days = new Date();
            previous30Days.setDate(previous30Days.getDate() - 60);

            const [currentPeriod, previousPeriod] = await Promise.all([
                prisma.userSubscription.count({
                    where: { created_at: { gte: last30Days } }
                }),
                prisma.userSubscription.count({
                    where: {
                        created_at: { gte: previous30Days, lt: last30Days }
                    }
                })
            ]);

            const trend = previousPeriod > 0 ? ((currentPeriod - previousPeriod) / previousPeriod) * 100 : 0;

            return {
                newSubscriptions: growthData,
                trend: Math.round(trend * 100) / 100,
                trendDirection: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable'
            };
        } catch (error) {
            console.error('Error al calcular métricas de crecimiento:', error);
            return {
                newSubscriptions: {},
                trend: 0,
                trendDirection: 'stable'
            };
        }
    }

    /**
     * Obtiene métricas de pagos
     */
    private async getPaymentMetrics(): Promise<PaymentMetrics> {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // Usar notificaciones como proxy para eventos de pago
            const [
                successfulPayments,
                failedPayments,
                retryAttempts,
                recoveredPayments
            ] = await Promise.all([
                prisma.notificacion.count({
                    where: {
                        tipo: 'payment_success',
                        fecha_creacion: { gte: thirtyDaysAgo }
                    }
                }),
                prisma.notificacion.count({
                    where: {
                        tipo: 'payment_failure',
                        fecha_creacion: { gte: thirtyDaysAgo }
                    }
                }),
                prisma.notificacion.count({
                    where: {
                        tipo: 'payment_retry_scheduled',
                        fecha_creacion: { gte: thirtyDaysAgo }
                    }
                }),
                prisma.notificacion.count({
                    where: {
                        tipo: 'payment_retry_success',
                        fecha_creacion: { gte: thirtyDaysAgo }
                    }
                })
            ]);

            const totalPaymentAttempts = successfulPayments + failedPayments;
            const successRate = totalPaymentAttempts > 0 ? (successfulPayments / totalPaymentAttempts) * 100 : 0;
            const recoveryRate = failedPayments > 0 ? (recoveredPayments / failedPayments) * 100 : 0;

            return {
                successfulPayments,
                failedPayments,
                successRate: Math.round(successRate * 100) / 100,
                retryAttempts,
                recoveredPayments,
                recoveryRate: Math.round(recoveryRate * 100) / 100,
                period: '30 days'
            };
        } catch (error) {
            console.error('Error al calcular métricas de pagos:', error);
            return {
                successfulPayments: 0,
                failedPayments: 0,
                successRate: 0,
                retryAttempts: 0,
                recoveredPayments: 0,
                recoveryRate: 0,
                period: '30 days'
            };
        }
    }

    /**
     * Obtiene distribución de suscripciones por plan
     */
    private async getSubscriptionsByPlan(): Promise<{ [planId: string]: number }> {
        const result = await prisma.userSubscription.groupBy({
            by: ['plan_id'],
            _count: { plan_id: true },
            where: { status: { in: ['active', 'trialing'] } }
        });

        const subscriptionsByPlan: { [planId: string]: number } = {};
        result.forEach(item => {
            subscriptionsByPlan[item.plan_id] = item._count.plan_id;
        });

        return subscriptionsByPlan;
    }

    /**
     * Obtiene ingresos por plan
     */
    private async getRevenueByPlan(): Promise<{ [planId: string]: number }> {
        const activeSubscriptions = await prisma.userSubscription.findMany({
            where: { status: { in: ['active', 'trialing'] } },
            include: { plan: true }
        });

        const revenueByPlan: { [planId: string]: number } = {};

        activeSubscriptions.forEach(subscription => {
            if (subscription.plan) {
                const planId = subscription.plan.id;
                const planPrice = Number(subscription.plan.price);
                const monthlyRevenue = subscription.plan.interval === 'monthly'
                    ? planPrice
                    : planPrice / 12;

                revenueByPlan[planId] = (revenueByPlan[planId] || 0) + monthlyRevenue;
            }
        });

        // Redondear valores
        Object.keys(revenueByPlan).forEach(planId => {
            const currentValue = revenueByPlan[planId] || 0;
            revenueByPlan[planId] = Math.round(currentValue * 100) / 100;
        });

        return revenueByPlan;
    }

    // ============================================================================
    // REPORTES AVANZADOS
    // ============================================================================

    /**
     * Genera reporte de cohorts de suscripciones
     */
    async generateCohortReport(): Promise<CohortReport> {
        try {
            // Obtener suscripciones agrupadas por mes de creación
            const subscriptions = await prisma.userSubscription.findMany({
                select: {
                    id: true,
                    created_at: true,
                    status: true,
                    updated_at: true
                },
                orderBy: { created_at: 'asc' }
            });

            const cohorts: { [month: string]: CohortData } = {};

            subscriptions.forEach(subscription => {
                const cohortMonth = subscription.created_at.toISOString().substring(0, 7); // YYYY-MM

                if (!cohorts[cohortMonth]) {
                    cohorts[cohortMonth] = {
                        month: cohortMonth,
                        totalSubscriptions: 0,
                        activeSubscriptions: 0,
                        retentionRate: 0
                    };
                }

                cohorts[cohortMonth].totalSubscriptions++;

                if (subscription.status === 'active' || subscription.status === 'trialing') {
                    cohorts[cohortMonth].activeSubscriptions++;
                }
            });

            // Calcular tasas de retención
            Object.keys(cohorts).forEach(month => {
                const cohort = cohorts[month];
                if (cohort) {
                    cohort.retentionRate = cohort.totalSubscriptions > 0
                        ? Math.round((cohort.activeSubscriptions / cohort.totalSubscriptions) * 10000) / 100
                        : 0;
                }
            });

            return {
                cohorts: Object.values(cohorts),
                generatedAt: new Date()
            };
        } catch (error) {
            console.error('Error al generar reporte de cohorts:', error);
            throw error;
        }
    }

    /**
     * Genera reporte de predicción de churn
     */
    async generateChurnPredictionReport(): Promise<ChurnPredictionReport> {
        try {
            // Identificar suscripciones en riesgo
            const riskFactors = await this.identifyChurnRiskFactors();

            // Calcular score de riesgo para cada suscripción activa
            const activeSubscriptions = await prisma.userSubscription.findMany({
                where: { status: 'active' },
                include: { plan: true }
            });

            const predictions: ChurnPrediction[] = [];

            for (const subscription of activeSubscriptions) {
                const riskScore = await this.calculateChurnRiskScore(subscription);

                predictions.push({
                    subscriptionId: subscription.id,
                    userId: subscription.user_id,
                    planName: subscription.plan?.name || 'Unknown',
                    riskScore,
                    riskLevel: this.getRiskLevel(riskScore),
                    recommendedActions: this.getRecommendedActions(riskScore)
                });
            }

            // Ordenar por score de riesgo descendente
            predictions.sort((a, b) => b.riskScore - a.riskScore);

            return {
                predictions: predictions.slice(0, 50), // Top 50 en riesgo
                riskFactors,
                generatedAt: new Date()
            };
        } catch (error) {
            console.error('Error al generar reporte de predicción de churn:', error);
            throw error;
        }
    }

    /**
     * Identifica factores de riesgo de churn
     */
    private async identifyChurnRiskFactors(): Promise<string[]> {
        return [
            'Múltiples fallos de pago en el último mes',
            'No ha participado en concursos recientemente',
            'Suscripción de más de 6 meses sin upgrade',
            'Método de pago próximo a expirar',
            'Baja actividad en la plataforma',
            'No ha subido medios en 30 días'
        ];
    }

    /**
     * Calcula el score de riesgo de churn para una suscripción
     */
    private async calculateChurnRiskScore(subscription: any): Promise<number> {
        let riskScore = 0;

        // Factor 1: Fallos de pago recientes
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const paymentFailures = await prisma.notificacion.count({
            where: {
                usuario_id: subscription.user_id,
                tipo: 'payment_failure',
                fecha_creacion: { gte: thirtyDaysAgo }
            }
        });

        riskScore += paymentFailures * 25; // 25 puntos por cada fallo

        // Factor 2: Tiempo desde la última actividad (simulado)
        const daysSinceCreation = Math.floor((Date.now() - subscription.created_at.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceCreation > 180) { // Más de 6 meses
            riskScore += 20;
        }

        // Factor 3: Plan básico (más propenso a cancelar)
        if (subscription.plan?.id === 'basico') {
            riskScore += 15;
        }

        // Factor 4: Estado past_due
        if (subscription.status === 'past_due') {
            riskScore += 30;
        }

        // Normalizar score a 0-100
        return Math.min(riskScore, 100);
    }

    /**
     * Determina el nivel de riesgo basado en el score
     */
    private getRiskLevel(riskScore: number): 'low' | 'medium' | 'high' | 'critical' {
        if (riskScore >= 75) return 'critical';
        if (riskScore >= 50) return 'high';
        if (riskScore >= 25) return 'medium';
        return 'low';
    }

    /**
     * Obtiene acciones recomendadas basadas en el score de riesgo
     */
    private getRecommendedActions(riskScore: number): string[] {
        const actions: string[] = [];

        if (riskScore >= 75) {
            actions.push('Contacto inmediato con el usuario');
            actions.push('Ofrecer descuento de retención');
            actions.push('Revisar problemas de pago');
        } else if (riskScore >= 50) {
            actions.push('Enviar email de engagement');
            actions.push('Ofrecer contenido educativo personalizado');
            actions.push('Verificar satisfacción del usuario');
        } else if (riskScore >= 25) {
            actions.push('Monitorear actividad del usuario');
            actions.push('Enviar recordatorios de funcionalidades');
        } else {
            actions.push('Continuar monitoreo regular');
        }

        return actions;
    }
}

// Interfaces para los tipos de datos
interface ComprehensiveMetrics {
    subscriptions: SubscriptionMetrics;
    revenue: RevenueMetrics;
    churn: ChurnMetrics;
    growth: GrowthMetrics;
    payments: PaymentMetrics;
    generatedAt: Date;
}

interface SubscriptionMetrics {
    total: number;
    active: number;
    trialing: number;
    pastDue: number;
    canceled: number;
    byPlan: { [planId: string]: number };
}

interface RevenueMetrics {
    mrr: number; // Monthly Recurring Revenue
    arr: number; // Annual Recurring Revenue
    averageRevenuePerUser: number;
    byPlan: { [planId: string]: number };
}

interface ChurnMetrics {
    churnRate: number;
    canceledInPeriod: number;
    newSubscriptionsInPeriod: number;
    netGrowthRate: number;
    period: string;
}

interface GrowthMetrics {
    newSubscriptions: { [period: string]: number };
    trend: number;
    trendDirection: 'up' | 'down' | 'stable';
}

interface PaymentMetrics {
    successfulPayments: number;
    failedPayments: number;
    successRate: number;
    retryAttempts: number;
    recoveredPayments: number;
    recoveryRate: number;
    period: string;
}

interface CohortReport {
    cohorts: CohortData[];
    generatedAt: Date;
}

interface CohortData {
    month: string;
    totalSubscriptions: number;
    activeSubscriptions: number;
    retentionRate: number;
}

interface ChurnPredictionReport {
    predictions: ChurnPrediction[];
    riskFactors: string[];
    generatedAt: Date;
}

interface ChurnPrediction {
    subscriptionId: string;
    userId: string;
    planName: string;
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    recommendedActions: string[];
}

export const subscriptionAnalyticsService = new SubscriptionAnalyticsService();