// 🎯 SISTEMA DE MÉTRICAS DE RENDIMIENTO
// Monitorea el impacto de la estrategia híbrida en el rendimiento
interface PerformanceMetric {
    name: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    memoryUsage?: NodeJS.MemoryUsage;
    metadata?: Record<string, any>;
}

interface ControllerMetrics {
    instanceCount: number;
    methodCalls: number;
    averageResponseTime: number;
    memoryFootprint: number;
    errorRate: number;
}

class PerformanceMonitor {
    private metrics: Map<string, PerformanceMetric[]> = new Map();
    private controllerMetrics: Map<string, ControllerMetrics> = new Map();
    private startTimes: Map<string, number> = new Map();

    // ✅ FUNCIÓN DE FLECHA para iniciar medición
    startMeasurement = (name: string, metadata?: Record<string, any>): string => {
        const id = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startTime = performance.now();
        this.startTimes.set(id, startTime);

        const metric: PerformanceMetric = {
            name,
            startTime,
            memoryUsage: process.memoryUsage(),
            ...(metadata && { metadata })
        };

        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        this.metrics.get(name)!.push(metric);
        return id;
    };

    // ✅ FUNCIÓN DE FLECHA para finalizar medición
    endMeasurement = (id: string): number => {
        const startTime = this.startTimes.get(id);
        if (!startTime) return 0;

        const endTime = performance.now();
        const duration = endTime - startTime;
        this.startTimes.delete(id);
        return duration;
    };

    // ✅ FUNCIÓN DE FLECHA para obtener estadísticas
    getStats = (name: string) => {
        const metrics = this.metrics.get(name) || [];
        if (metrics.length === 0) return null;

        const durations = metrics
            .filter(m => m.duration !== undefined)
            .map(m => m.duration!);

        const memoryUsages = metrics
            .filter(m => m.memoryUsage !== undefined)
            .map(m => m.memoryUsage!.heapUsed);

        return {
            count: metrics.length,
            averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
            minDuration: Math.min(...durations),
            maxDuration: Math.max(...durations),
            averageMemory: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
            totalCalls: metrics.length
        };
    };

    // ✅ FUNCIÓN TRADICIONAL para generar reporte completo
    async generateReport(): Promise<any> {
        const report = {
            timestamp: new Date().toISOString(),
            totalMetrics: this.metrics.size,
            summary: {} as Record<string, any>,
            controllerPerformance: {} as Record<string, any>,
            memoryAnalysis: this.analyzeMemoryUsage(),
            recommendations: this.generateRecommendations()
        };

        // Generar estadísticas por métrica
        for (const [name, _] of this.metrics) {
            report.summary[name] = this.getStats(name);
        }

        // Analizar rendimiento de controladores
        for (const [controller, metrics] of this.controllerMetrics) {
            report.controllerPerformance[controller] = {
                ...metrics,
                efficiency: this.calculateEfficiency(metrics)
            };
        }

        return report;
    }

    // ✅ FUNCIÓN DE FLECHA para análisis de memoria
    private analyzeMemoryUsage = () => {
        const currentMemory = process.memoryUsage();
        return {
            heapUsed: Math.round(currentMemory.heapUsed / 1024 / 1024 * 100) / 100,
            heapTotal: Math.round(currentMemory.heapTotal / 1024 / 1024 * 100) / 100,
            external: Math.round(currentMemory.external / 1024 / 1024 * 100) / 100,
            rss: Math.round(currentMemory.rss / 1024 / 1024 * 100) / 100
        };
    };

    // ✅ FUNCIÓN DE FLECHA para calcular eficiencia
    private calculateEfficiency = (metrics: ControllerMetrics): number => {
        const responseTimeScore = Math.max(0, 100 - metrics.averageResponseTime);
        const memoryScore = Math.max(0, 100 - (metrics.memoryFootprint / 1024 / 1024));
        const errorScore = Math.max(0, 100 - (metrics.errorRate * 100));
        return Math.round((responseTimeScore + memoryScore + errorScore) / 3);
    };

    // ✅ FUNCIÓN TRADICIONAL para generar recomendaciones
    generateRecommendations(): string[] {
        const recommendations: string[] = [];
        const memoryUsage = process.memoryUsage();

        if (memoryUsage.heapUsed > 100 * 1024 * 1024) { // > 100MB
            recommendations.push('Considerar optimización de memoria en controladores');
        }

        for (const [name, metrics] of this.controllerMetrics) {
            if (metrics.averageResponseTime > 1000) { // > 1 segundo
                recommendations.push(`Optimizar tiempo de respuesta en ${name}`);
            }
            if (metrics.errorRate > 0.05) { // > 5% error rate
                recommendations.push(`Revisar manejo de errores en ${name}`);
            }
        }

        return recommendations;
    }

    // ✅ FUNCIÓN DE FLECHA para registrar métricas de controlador
    recordControllerMetrics = (controllerName: string, responseTime: number, error?: boolean) => {
        if (!this.controllerMetrics.has(controllerName)) {
            this.controllerMetrics.set(controllerName, {
                instanceCount: 1,
                methodCalls: 0,
                averageResponseTime: 0,
                memoryFootprint: 0,
                errorRate: 0
            });
        }

        const metrics = this.controllerMetrics.get(controllerName)!;
        metrics.methodCalls++;

        // Calcular promedio móvil del tiempo de respuesta
        metrics.averageResponseTime = (
            (metrics.averageResponseTime * (metrics.methodCalls - 1)) + responseTime
        ) / metrics.methodCalls;

        // Actualizar tasa de error
        if (error) {
            metrics.errorRate = (metrics.errorRate * (metrics.methodCalls - 1) + 1) / metrics.methodCalls;
        } else {
            metrics.errorRate = (metrics.errorRate * (metrics.methodCalls - 1)) / metrics.methodCalls;
        }

        // Actualizar huella de memoria
        metrics.memoryFootprint = process.memoryUsage().heapUsed;
    };

    // ✅ FUNCIÓN TRADICIONAL para limpiar métricas antiguas
    cleanup(): void {
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        for (const [name, metrics] of this.metrics) {
            const filteredMetrics = metrics.filter(m => m.startTime > oneHourAgo);
            this.metrics.set(name, filteredMetrics);
        }
    }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// ✅ DECORADOR HÍBRIDO para medir rendimiento de métodos
export function measurePerformance(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
        const className = target.constructor.name;
        const methodName = `${className}.${propertyName}`;
        const measurementId = performanceMonitor.startMeasurement(methodName, {
            className,
            methodName,
            argsCount: args.length
        });

        const startTime = performance.now();
        let error = false;

        try {
            const result = await method.apply(this, args);
            return result;
        } catch (err) {
            error = true;
            throw err;
        } finally {
            performanceMonitor.endMeasurement(measurementId);
            const responseTime = performance.now() - startTime;
            performanceMonitor.recordControllerMetrics(className, responseTime, error);
        }
    };

    return descriptor;
}

export class PerformanceMetrics {
    private static instance: PerformanceMetrics;
    private metrics: Map<string, any> = new Map();
    private startTimes: Map<string, number> = new Map();

    // ✅ FUNCIÓN DE FLECHA para singleton
    static getInstance = (): PerformanceMetrics => {
        if (!PerformanceMetrics.instance) {
            PerformanceMetrics.instance = new PerformanceMetrics();
        }
        return PerformanceMetrics.instance;
    };

    // ✅ FUNCIONES DE FLECHA para helpers de métricas
    private generateId = () => Math.random().toString(36).substring(2, 15);

    private formatDuration = (ms: number) => {
        if (ms < 1000) return `${ms.toFixed(2)}ms`;
        return `${(ms / 1000).toFixed(2)}s`;
    };

    private calculateMemoryUsage = () => {
        const usage = process.memoryUsage();
        return {
            rss: Math.round(usage.rss / 1024 / 1024 * 100) / 100, // MB
            heapTotal: Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100, // MB
            heapUsed: Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100, // MB
            external: Math.round(usage.external / 1024 / 1024 * 100) / 100 // MB
        };
    };

    private logMetric = (type: string, data: any) => {
        if (process.env['NODE_ENV'] === 'development') {
            console.log(`[METRICS] ${type}:`, data);
        }
    };

    // ✅ FUNCIÓN TRADICIONAL para método principal de inicio
    startTimer(operation: string, context?: any): string {
        const id = this.generateId();
        const startTime = performance.now();

        this.startTimes.set(id, startTime);

        const metric = {
            id,
            operation,
            context,
            startTime,
            memoryStart: this.calculateMemoryUsage()
        };

        this.metrics.set(id, metric);
        return id;
    }

    // ✅ FUNCIÓN TRADICIONAL para método principal de finalización
    endTimer(id: string, additionalData?: any): any {
        const startTime = this.startTimes.get(id);
        const metric = this.metrics.get(id);

        if (!startTime || !metric) {
            console.warn(`[METRICS] Timer ${id} not found`);
            return null;
        }

        const endTime = performance.now();
        const duration = endTime - startTime;
        const memoryEnd = this.calculateMemoryUsage();

        const result = {
            ...metric,
            endTime,
            duration,
            durationFormatted: this.formatDuration(duration),
            memoryEnd,
            memoryDelta: {
                rss: memoryEnd.rss - metric.memoryStart.rss,
                heapUsed: memoryEnd.heapUsed - metric.memoryStart.heapUsed
            },
            ...additionalData
        };

        this.metrics.set(id, result);
        this.startTimes.delete(id);

        this.logMetric(metric.operation, {
            duration: result.durationFormatted,
            memoryDelta: result.memoryDelta
        });

        return result;
    }

    // ✅ FUNCIÓN TRADICIONAL para análisis de métricas
    getMetricsSummary(): any {
        const allMetrics = Array.from(this.metrics.values()).filter(m => m.duration);

        if (allMetrics.length === 0) {
            return { message: 'No metrics available' };
        }

        // ✅ FUNCIONES DE FLECHA para cálculos estadísticos
        const calculateStats = (values: number[]) => ({
            min: Math.min(...values),
            max: Math.max(...values),
            avg: values.reduce((a, b) => a + b, 0) / values.length,
            count: values.length
        });

        const groupByOperation = (metrics: any[]) => {
            return metrics.reduce((acc, metric) => {
                if (!acc[metric.operation]) {
                    acc[metric.operation] = [];
                }
                acc[metric.operation].push(metric);
                return acc;
            }, {} as Record<string, any[]>);
        };

        const formatStats = (stats: any) => ({
            ...stats,
            minFormatted: this.formatDuration(stats.min),
            maxFormatted: this.formatDuration(stats.max),
            avgFormatted: this.formatDuration(stats.avg)
        });

        const grouped = groupByOperation(allMetrics);
        const summary: any = {
            totalOperations: allMetrics.length,
            operationTypes: Object.keys(grouped).length,
            overallStats: formatStats(calculateStats(allMetrics.map(m => m.duration))),
            byOperation: {}
        };

        // Estadísticas por operación
        Object.entries(grouped).forEach(([operation, metrics]) => {
            const durations = (metrics as any[]).map((m: any) => m.duration);
            const memoryDeltas = (metrics as any[]).map((m: any) => m.memoryDelta?.heapUsed || 0);

            summary.byOperation[operation] = {
                count: (metrics as any[]).length,
                duration: formatStats(calculateStats(durations)),
                memoryDelta: calculateStats(memoryDeltas)
            };
        });

        return summary;
    }

    // ✅ FUNCIÓN TRADICIONAL para limpiar métricas
    clearMetrics(): void {
        this.metrics.clear();
        this.startTimes.clear();
        console.log('[METRICS] Metrics cleared');
    }
}

// ✅ FUNCIONES DE FLECHA para utilidades de medición
export const measureFunction = <T extends (...args: any[]) => any>(
    fn: T,
    operationName: string
): T => {
    return ((...args: any[]) => {
        const metrics = PerformanceMetrics.getInstance();
        const timerId = metrics.startTimer(operationName, { args: args.length });

        try {
            const result = fn(...args);

            // Si es una promesa, medir cuando se resuelva
            if (result && typeof result.then === 'function') {
                return result.finally(() => {
                    metrics.endTimer(timerId, { type: 'async' });
                });
            }

            // Si es síncrono, medir inmediatamente
            metrics.endTimer(timerId, { type: 'sync' });
            return result;
        } catch (error) {
            metrics.endTimer(timerId, { type: 'error', error: (error as Error).message });
            throw error;
        }
    }) as T;
};

export const measureAsync = async <T>(
    operation: () => Promise<T>,
    operationName: string,
    context?: any
): Promise<T> => {
    const metrics = PerformanceMetrics.getInstance();
    const timerId = metrics.startTimer(operationName, context);

    try {
        const result = await operation();
        metrics.endTimer(timerId, { type: 'async', success: true });
        return result;
    } catch (error) {
        metrics.endTimer(timerId, { type: 'async', success: false, error: (error as Error).message });
        throw error;
    }
};

// ✅ DECORADOR para medir métodos de clase
export const Measure = (operationName?: string) => {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;
        const opName = operationName || `${target.constructor.name}.${propertyName}`;

        descriptor.value = function (...args: any[]) {
            const metrics = PerformanceMetrics.getInstance();
            const timerId = metrics.startTimer(opName, {
                class: target.constructor.name,
                method: propertyName,
                args: args.length
            });

            try {
                const result = method.apply(this, args);

                if (result && typeof result.then === 'function') {
                    return result.finally(() => {
                        metrics.endTimer(timerId, { type: 'async' });
                    });
                }

                metrics.endTimer(timerId, { type: 'sync' });
                return result;
            } catch (error) {
                metrics.endTimer(timerId, { type: 'error', error: (error as Error).message });
                throw error;
            }
        };

        return descriptor;
    };
};

// Instancia singleton para uso global
export const performanceMetrics = PerformanceMetrics.getInstance();