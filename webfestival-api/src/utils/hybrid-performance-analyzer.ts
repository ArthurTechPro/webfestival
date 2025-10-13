// 🎯 ANALIZADOR DE RENDIMIENTO PARA ESTRATEGIA HÍBRIDA
// Compara rendimiento entre funciones tradicionales y de flecha

interface PerformanceReport {
    testName: string;
    iterations: number;
    results: {
        traditional: {
            averageTime: number;
            totalTime: number;
            memoryUsage: number;
        };
        arrow: {
            averageTime: number;
            totalTime: number;
            memoryUsage: number;
        };
        winner: 'traditional' | 'arrow' | 'tie';
        improvement: number;
    };
    recommendations: string[];
}

// ✅ UTILIDADES DE RENDIMIENTO simplificadas
const performanceUtils = {
    measureFunction: async (fn: () => any, iterations: number = 100) => {
        const times: number[] = [];

        for (let i = 0; i < iterations; i++) {
            const start = performance.now();
            await fn();
            const duration = performance.now() - start;
            times.push(duration);
        }

        const totalTime = times.reduce((a, b) => a + b, 0);
        const averageTime = totalTime / iterations;

        return {
            averageTime: Math.round(averageTime * 100) / 100,
            totalTime: Math.round(totalTime * 100) / 100
        };
    }
};

export class HybridPerformanceAnalyzer {
    // ✅ FUNCIÓN DE FLECHA para generar datos de prueba
    private generateTestData = (size: number = 1000) => {
        return Array.from({ length: size }, (_, i) => ({
            id: i,
            name: `User ${i}`,
            email: `user${i}@example.com`,
            active: Math.random() > 0.5,
            score: Math.random() * 100
        }));
    };

    // ✅ FUNCIÓN DE FLECHA para medir uso de memoria
    private measureMemory = () => {
        const usage = process.memoryUsage();
        return Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100; // MB
    };

    // ✅ FUNCIÓN TRADICIONAL para ejecutar comparaciones simplificadas
    async runComparison(traditionalFn: () => any, arrowFn: () => any, testName: string, iterations: number = 1000): Promise<PerformanceReport> {
        console.log(`\n🔍 Ejecutando comparación: ${testName}`);
        console.log(`📊 Iteraciones: ${iterations}`);

        // Calentar las funciones (JIT optimization)
        for (let i = 0; i < 10; i++) {
            traditionalFn();
            arrowFn();
        }

        // Forzar garbage collection si está disponible
        if (global.gc) {
            global.gc();
        }

        // Medir función tradicional
        const traditionalMemoryStart = this.measureMemory();
        const traditionalResult = await performanceUtils.measureFunction(traditionalFn, iterations);
        const traditionalMemoryEnd = this.measureMemory();

        // Pequeña pausa para estabilizar memoria
        await new Promise(resolve => setTimeout(resolve, 100));
        if (global.gc) {
            global.gc();
        }

        // Medir función de flecha
        const arrowMemoryStart = this.measureMemory();
        const arrowResult = await performanceUtils.measureFunction(arrowFn, iterations);
        const arrowMemoryEnd = this.measureMemory();

        // Determinar ganador
        const timeDifference = traditionalResult.averageTime - arrowResult.averageTime;
        const improvement = Math.abs(timeDifference / Math.max(traditionalResult.averageTime, arrowResult.averageTime) * 100);

        let winner: 'traditional' | 'arrow' | 'tie';
        if (Math.abs(timeDifference) < 0.01) { // Diferencia menor a 0.01ms
            winner = 'tie';
        } else {
            winner = timeDifference > 0 ? 'arrow' : 'traditional';
        }

        const report: PerformanceReport = {
            testName,
            iterations,
            results: {
                traditional: {
                    averageTime: traditionalResult.averageTime,
                    totalTime: traditionalResult.totalTime,
                    memoryUsage: traditionalMemoryEnd - traditionalMemoryStart
                },
                arrow: {
                    averageTime: arrowResult.averageTime,
                    totalTime: arrowResult.totalTime,
                    memoryUsage: arrowMemoryEnd - arrowMemoryStart
                },
                winner,
                improvement: Math.round(improvement * 100) / 100
            },
            recommendations: this.generateRecommendations(winner, improvement, testName)
        };

        this.printReport(report);
        return report;
    }

    // ✅ FUNCIÓN DE FLECHA para generar recomendaciones
    private generateRecommendations = (winner: string, improvement: number, testName: string): string[] => {
        const recommendations: string[] = [];

        if (winner === 'tie') {
            recommendations.push('Rendimiento similar - usar según contexto y legibilidad');
        } else if (winner === 'arrow') {
            if (improvement > 10) {
                recommendations.push('Función de flecha significativamente más rápida - usar para este caso');
            } else {
                recommendations.push('Función de flecha ligeramente más rápida - considerar para operaciones frecuentes');
            }
        } else {
            if (improvement > 10) {
                recommendations.push('Función tradicional significativamente más rápida - usar para este caso');
            } else {
                recommendations.push('Función tradicional ligeramente más rápida - considerar para operaciones críticas');
            }
        }

        // Recomendaciones específicas por tipo de test
        if (testName.includes('validation')) {
            recommendations.push('Para validaciones: priorizar funciones de flecha por simplicidad');
        } else if (testName.includes('transformation')) {
            recommendations.push('Para transformaciones: funciones de flecha son más expresivas');
        } else if (testName.includes('method')) {
            recommendations.push('Para métodos de clase: usar funciones tradicionales por herencia');
        }

        return recommendations;
    };

    // ✅ FUNCIÓN TRADICIONAL para imprimir reporte
    printReport(report: PerformanceReport): void {
        console.log(`\n📋 REPORTE: ${report.testName}`);
        console.log('━'.repeat(60));

        console.log(`\n🔧 FUNCIÓN TRADICIONAL:`);
        console.log(`   ⏱️  Tiempo promedio: ${report.results.traditional.averageTime}ms`);
        console.log(`   📊 Tiempo total: ${report.results.traditional.totalTime}ms`);
        console.log(`   💾 Memoria usada: ${report.results.traditional.memoryUsage}MB`);

        console.log(`\n➡️  FUNCIÓN DE FLECHA:`);
        console.log(`   ⏱️  Tiempo promedio: ${report.results.arrow.averageTime}ms`);
        console.log(`   📊 Tiempo total: ${report.results.arrow.totalTime}ms`);
        console.log(`   💾 Memoria usada: ${report.results.arrow.memoryUsage}MB`);

        console.log(`\n🏆 GANADOR: ${report.results.winner.toUpperCase()}`);
        console.log(`📈 Mejora: ${report.results.improvement}%`);

        console.log(`\n💡 RECOMENDACIONES:`);
        report.recommendations.forEach(rec => {
            console.log(`   • ${rec}`);
        });
        console.log('━'.repeat(60));
    }

    // ✅ FUNCIÓN TRADICIONAL para ejecutar suite completa de tests
    async runFullTestSuite(): Promise<PerformanceReport[]> {
        console.log('\n🚀 INICIANDO SUITE COMPLETA DE TESTS DE RENDIMIENTO');
        console.log('🎯 Comparando funciones tradicionales vs funciones de flecha');

        const testData = this.generateTestData(1000);
        const reports: PerformanceReport[] = [];

        // Test 1: Validación de datos
        const traditionalValidation = () => {
            const email = 'test@example.com';
            return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        };
        const arrowValidation = () => {
            const email = 'test@example.com';
            return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        };
        reports.push(await this.runComparison(traditionalValidation, arrowValidation, 'Validación de Email'));

        // Test 2: Transformación de datos
        const traditionalTransform = () => {
            const user = testData[0];
            if (!user) return null;
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                active: user.active
            };
        };
        const arrowTransform = () => {
            const user = testData[0];
            if (!user) return null;
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                active: user.active
            };
        };
        reports.push(await this.runComparison(traditionalTransform, arrowTransform, 'Transformación de Usuario'));

        // Test 3: Filtrado de arrays
        const traditionalFilter = () => {
            return testData.filter(function (user) {
                return user.active === true;
            });
        };
        const arrowFilter = () => {
            return testData.filter(user => user.active === true);
        };
        reports.push(await this.runComparison(traditionalFilter, arrowFilter, 'Filtrado de Usuarios Activos'));

        // Generar resumen final
        this.generateFinalSummary(reports);
        return reports;
    }

    // ✅ FUNCIÓN TRADICIONAL para generar resumen final
    generateFinalSummary(reports: PerformanceReport[]): void {
        console.log('\n🎯 RESUMEN FINAL DE RENDIMIENTO');
        console.log('═'.repeat(80));

        const arrowWins = reports.filter(r => r.results.winner === 'arrow').length;
        const traditionalWins = reports.filter(r => r.results.winner === 'traditional').length;
        const ties = reports.filter(r => r.results.winner === 'tie').length;

        console.log(`\n📊 ESTADÍSTICAS GENERALES:`);
        console.log(`   ➡️  Funciones de flecha ganadoras: ${arrowWins}/${reports.length}`);
        console.log(`   🔧 Funciones tradicionales ganadoras: ${traditionalWins}/${reports.length}`);
        console.log(`   🤝 Empates: ${ties}/${reports.length}`);

        const avgImprovement = reports.reduce((sum, r) => sum + r.results.improvement, 0) / reports.length;
        console.log(`   📈 Mejora promedio: ${Math.round(avgImprovement * 100) / 100}%`);

        console.log(`\n🏆 RECOMENDACIONES FINALES:`);
        if (arrowWins > traditionalWins) {
            console.log(`   • Las funciones de flecha muestran mejor rendimiento general`);
            console.log(`   • Usar funciones de flecha para operaciones de datos y validaciones`);
            console.log(`   • Mantener funciones tradicionales para métodos de clase complejos`);
        } else if (traditionalWins > arrowWins) {
            console.log(`   • Las funciones tradicionales muestran mejor rendimiento general`);
            console.log(`   • Usar funciones tradicionales para operaciones críticas`);
            console.log(`   • Funciones de flecha para helpers simples y callbacks`);
        } else {
            console.log(`   • Rendimiento equilibrado entre ambos tipos`);
            console.log(`   • Elegir según contexto: legibilidad vs rendimiento`);
            console.log(`   • Aplicar estrategia híbrida según el caso de uso`);
        }

        console.log(`\n💡 ESTRATEGIA HÍBRIDA RECOMENDADA:`);
        console.log(`   • Funciones de flecha: helpers, validaciones, transformaciones simples`);
        console.log(`   • Funciones tradicionales: métodos principales, lógica compleja, herencia`);
        console.log(`   • Decoradores: para métricas y logging en métodos principales`);
        console.log(`   • Middleware: funciones tradicionales para extensibilidad`);

        console.log('═'.repeat(80));
    }

    // ✅ FUNCIÓN DE FLECHA para obtener estadísticas rápidas
    getQuickStats = (reports: PerformanceReport[]) => ({
        totalTests: reports.length,
        arrowWins: reports.filter(r => r.results.winner === 'arrow').length,
        traditionalWins: reports.filter(r => r.results.winner === 'traditional').length,
        ties: reports.filter(r => r.results.winner === 'tie').length,
        averageImprovement: Math.round(
            reports.reduce((sum, r) => sum + r.results.improvement, 0) / reports.length * 100
        ) / 100,
        timestamp: new Date().toISOString()
    });
}

// ✅ FUNCIONES DE FLECHA para análisis específicos
export const hybridAnalysisUtils = {
    // Comparar validaciones
    compareValidations: async (data: any[]) => {
        const analyzer = new HybridPerformanceAnalyzer();
        const emails = data.map(item => item.email);

        const traditionalValidation = () => {
            return emails.filter(function (email) {
                return email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            });
        };

        const arrowValidation = () => {
            return emails.filter(email =>
                email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
            );
        };

        return await analyzer.runComparison(traditionalValidation, arrowValidation, 'Validación de Email en Lote');
    },

    // Comparar transformaciones
    compareTransformations: async (data: any[]) => {
        const analyzer = new HybridPerformanceAnalyzer();

        const traditionalTransform = () => {
            return data.map(function (user) {
                return {
                    id: user.id,
                    displayName: user.name.toUpperCase(),
                    isActive: user.active,
                    scoreLevel: user.score > 50 ? 'HIGH' : 'LOW'
                };
            });
        };

        const arrowTransform = () => {
            return data.map(user => ({
                id: user.id,
                displayName: user.name.toUpperCase(),
                isActive: user.active,
                scoreLevel: user.score > 50 ? 'HIGH' : 'LOW'
            }));
        };

        return await analyzer.runComparison(traditionalTransform, arrowTransform, 'Transformación de Usuarios en Lote');
    },

    // Análisis de memoria en tiempo real
    monitorMemoryUsage: () => {
        const startUsage = process.memoryUsage();

        return {
            start: () => startUsage,
            end: () => {
                const endUsage = process.memoryUsage();
                return {
                    heapUsedDiff: Math.round((endUsage.heapUsed - startUsage.heapUsed) / 1024 / 1024 * 100) / 100,
                    heapTotalDiff: Math.round((endUsage.heapTotal - startUsage.heapTotal) / 1024 / 1024 * 100) / 100,
                    externalDiff: Math.round((endUsage.external - startUsage.external) / 1024 / 1024 * 100) / 100,
                    rssDiff: Math.round((endUsage.rss - startUsage.rss) / 1024 / 1024 * 100) / 100
                };
            }
        };
    }
};

export default HybridPerformanceAnalyzer;