// 🎯 CONTROLADOR DE ANÁLISIS DE RENDIMIENTO
// Endpoint para ejecutar y monitorear el rendimiento de la estrategia híbrida
import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ApiError } from '../types';
import { performanceMonitor } from '../utils/performance-metrics';
import HybridPerformanceAnalyzer, { hybridAnalysisUtils } from '../utils/hybrid-performance-analyzer';

export class PerformanceController {
    // ✅ FUNCIONES DE FLECHA para helpers y utilidades internas
    private validateAnalysisParams = (params: any) => {
        const errors: string[] = [];

        if (params.iterations && (isNaN(params.iterations) || params.iterations < 10 || params.iterations > 10000)) {
            errors.push('Iteraciones debe estar entre 10 y 10000');
        }

        if (params.dataSize && (isNaN(params.dataSize) || params.dataSize < 100 || params.dataSize > 50000)) {
            errors.push('Tamaño de datos debe estar entre 100 y 50000');
        }

        if (params.testType && !['validation', 'transformation', 'full', 'memory'].includes(params.testType)) {
            errors.push('Tipo de test inválido. Opciones: validation, transformation, full, memory');
        }

        return errors;
    };

    private sanitizeAnalysisParams = (query: any) => ({
        iterations: query.iterations ? parseInt(query.iterations) : 1000,
        dataSize: query.dataSize ? parseInt(query.dataSize) : 1000,
        testType: query.testType || 'full',
        includeMemory: query.includeMemory === 'true',
        verbose: query.verbose === 'true'
    });

    private generateTestData = (size: number) => {
      return Array.from({ length: size }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        active: Math.random() > 0.5,
        score: Math.random() * 100,
        role: ['PARTICIPANTE', 'JURADO', 'ADMIN'][Math.floor(Math.random() * 3)],
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
      }));
    };

    private logPerformanceAction = (action: string, userId?: string, metadata?: any) => {
        console.log(`[PERFORMANCE_CONTROLLER] ${action} - ${userId ? `User: ${userId}` : 'System'} - ${new Date().toISOString()}`, metadata || '');
    };

    private createSuccessResponse = (data: any, message: string): ApiResponse => ({
        success: true,
        data,
        message
    });

    private createErrorResponse = (message: string, status: number = 400, details?: any): ApiError => {
        const error = new Error(message) as ApiError;
        error.status = status;
        if (details) {
            (error as any).details = details;
        }
        return error;
    };

    /**
     * ✅ FUNCIÓN TRADICIONAL para ejecutar análisis completo de rendimiento
     * Razón: Método principal complejo que puede ser extendido
     * POST /api/v1/performance/analyze
     */
    async runPerformanceAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            const params = this.sanitizeAnalysisParams(req.query);

            // Validar parámetros
            const validationErrors = this.validateAnalysisParams(params);
            if (validationErrors.length > 0) {
                throw this.createErrorResponse('Parámetros inválidos', 400, { errors: validationErrors });
            }

            this.logPerformanceAction('START_ANALYSIS', userId, params);

            const analyzer = new HybridPerformanceAnalyzer();
            const testData = this.generateTestData(params.dataSize);

            let results: any = {};

            switch (params.testType) {
                case 'validation':
                    results.validation = await hybridAnalysisUtils.compareValidations(testData);
                    break;

                case 'transformation':
                    results.transformation = await hybridAnalysisUtils.compareTransformations(testData);
                    break;

                case 'memory':
                    const memoryMonitor = hybridAnalysisUtils.monitorMemoryUsage();
                    memoryMonitor.start();

                    // Ejecutar operaciones intensivas
                    await hybridAnalysisUtils.compareValidations(testData);
                    await hybridAnalysisUtils.compareTransformations(testData);

                    results.memoryAnalysis = memoryMonitor.end();
                    break;

                case 'full':
                default:
                    results.fullSuite = await analyzer.runFullTestSuite();
                    results.quickStats = analyzer.getQuickStats(results.fullSuite);
                    break;
            }

            // Agregar métricas del sistema
            results.systemMetrics = {
                currentMemory: process.memoryUsage(),
                uptime: process.uptime(),
                nodeVersion: process.version,
                platform: process.platform
            };

            this.logPerformanceAction('COMPLETE_ANALYSIS', userId, {
                testType: params.testType,
                dataSize: params.dataSize,
                iterations: params.iterations
            });

            const response = this.createSuccessResponse(
                results,
                `Análisis de rendimiento ${params.testType} completado exitosamente`
            );

            res.status(200).json(response);
        } catch (error) {
            this.logPerformanceAction('ERROR_ANALYSIS', req.user?.userId, { error: (error as Error).message });
            next(error);
        }
    }

    /**
     * ✅ FUNCIÓN TRADICIONAL para obtener métricas del sistema
     * Razón: Método que puede ser extendido para diferentes tipos de métricas
     * GET /api/v1/performance/metrics
     */
    async getSystemMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            this.logPerformanceAction('GET_METRICS', userId);

            const report = await performanceMonitor.generateReport();

            const systemInfo = {
                memory: process.memoryUsage(),
                uptime: process.uptime(),
                cpuUsage: process.cpuUsage(),
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch
            };

            const response = this.createSuccessResponse(
                {
                    performanceReport: report,
                    systemInfo,
                    timestamp: new Date().toISOString()
                },
                'Métricas del sistema obtenidas exitosamente'
            );

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    /**
     * ✅ FUNCIÓN TRADICIONAL para limpiar métricas
     * Razón: Operación de mantenimiento que puede ser programada
     * DELETE /api/v1/performance/metrics
     */
    async cleanupMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;

            // Solo administradores pueden limpiar métricas
            if (req.user?.role !== 'ADMIN') {
                throw this.createErrorResponse('Solo administradores pueden limpiar métricas', 403);
            }

            this.logPerformanceAction('CLEANUP_METRICS', userId);

            performanceMonitor.cleanup();

            const response = this.createSuccessResponse(
                { cleaned: true },
                'Métricas limpiadas exitosamente'
            );

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    /**
     * ✅ FUNCIÓN TRADICIONAL para comparar implementaciones específicas
     * Razón: Método complejo que puede ser extendido para diferentes comparaciones
     * POST /api/v1/performance/compare
     */
    async compareImplementations(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            const { functionType, iterations = 1000, dataSize = 1000 } = req.body;

            if (!functionType) {
                throw this.createErrorResponse('Tipo de función requerido', 400);
            }

            this.logPerformanceAction('COMPARE_IMPLEMENTATIONS', userId, { functionType, iterations, dataSize });

            const testData = this.generateTestData(dataSize);

            let comparisonResult: any;

            switch (functionType) {
                case 'validation':
                    comparisonResult = await hybridAnalysisUtils.compareValidations(testData);
                    break;

                case 'transformation':
                    comparisonResult = await hybridAnalysisUtils.compareTransformations(testData);
                    break;

                default:
                    throw this.createErrorResponse('Tipo de función no soportado', 400);
            }

            const response = this.createSuccessResponse(
                {
                    comparison: comparisonResult,
                    testParameters: { functionType, iterations, dataSize },
                    timestamp: new Date().toISOString()
                },
                `Comparación de ${functionType} completada exitosamente`
            );

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    /**
     * ✅ FUNCIÓN TRADICIONAL para obtener recomendaciones de optimización
     * Razón: Lógica compleja que puede ser extendida con más algoritmos
     * GET /api/v1/performance/recommendations
     */
    async getOptimizationRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user?.userId;
            this.logPerformanceAction('GET_RECOMMENDATIONS', userId);

            const report = await performanceMonitor.generateReport();
            const recommendations = this.generateOptimizationRecommendations(report);

            const response = this.createSuccessResponse(
                {
                    recommendations,
                    basedOnMetrics: report.summary,
                    timestamp: new Date().toISOString()
                },
                'Recomendaciones de optimización generadas exitosamente'
            );

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    }

    // ✅ FUNCIÓN TRADICIONAL para generar recomendaciones
    // Razón: Lógica compleja que puede ser extendida
    private generateOptimizationRecommendations(report: any): string[] {
        const recommendations: string[] = [];

        // Analizar memoria
        if (report.memoryAnalysis.heapUsed > 100) {
            recommendations.push('Considerar optimización de memoria - uso actual alto');
            recommendations.push('Implementar cache con TTL para reducir uso de memoria');
        }

        // Analizar rendimiento de controladores
        Object.entries(report.controllerPerformance).forEach(([controller, metrics]: [string, any]) => {
            if (metrics.averageResponseTime > 1000) {
                recommendations.push(`Optimizar ${controller} - tiempo de respuesta alto (${metrics.averageResponseTime}ms)`);
            }

            if (metrics.errorRate > 0.05) {
                recommendations.push(`Revisar manejo de errores en ${controller} - tasa de error alta (${Math.round(metrics.errorRate * 100)}%)`);
            }

            if (metrics.efficiency < 70) {
                recommendations.push(`Mejorar eficiencia de ${controller} - puntuación actual: ${metrics.efficiency}%`);
            }
        });

        // Recomendaciones específicas de estrategia híbrida
        recommendations.push('Aplicar funciones de flecha para helpers y validaciones simples');
        recommendations.push('Usar funciones tradicionales para métodos principales de controladores');
        recommendations.push('Implementar decoradores de rendimiento en métodos críticos');
        recommendations.push('Considerar middleware optimizado para operaciones frecuentes');

        return recommendations;
    }
}

export const performanceController = new PerformanceController();