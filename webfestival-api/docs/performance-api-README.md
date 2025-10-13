# 📊 API de Análisis de Rendimiento - WebFestival API

## 🎯 Descripción General

La API de Análisis de Rendimiento proporciona endpoints especializados para monitorear, analizar y optimizar el rendimiento de la estrategia híbrida implementada en WebFestival API. Permite ejecutar comparaciones en tiempo real entre funciones tradicionales y de flecha, generar reportes detallados y obtener recomendaciones de optimización.

## 🚀 Endpoints Disponibles

### 1. **Análisis Completo de Rendimiento**

#### **POST** `/api/v1/performance/analyze`

Ejecuta un análisis completo de rendimiento comparando diferentes implementaciones.

**Headers Requeridos:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Query Parameters:**
| Parámetro | Tipo | Requerido | Default | Descripción |
|-----------|------|-----------|---------|-------------|
| `iterations` | number | No | 1000 | Número de iteraciones (10-10000) |
| `dataSize` | number | No | 1000 | Tamaño de datos de prueba (100-50000) |
| `testType` | string | No | 'full' | Tipo de test: `validation`, `transformation`, `full`, `memory` |
| `includeMemory` | boolean | No | false | Incluir análisis detallado de memoria |
| `verbose` | boolean | No | false | Salida detallada en logs |

**Ejemplo de Request:**
```bash
curl -X POST "http://localhost:3000/api/v1/performance/analyze?testType=full&iterations=2000&dataSize=5000&includeMemory=true" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "data": {
    "fullSuite": [
      {
        "testName": "Validación de Email",
        "iterations": 2000,
        "results": {
          "traditional": {
            "averageTime": 0.156,
            "totalTime": 312.45,
            "memoryUsage": 2.34
          },
          "arrow": {
            "averageTime": 0.123,
            "totalTime": 246.78,
            "memoryUsage": 2.12
          },
          "winner": "arrow",
          "improvement": 21.15
        },
        "recommendations": [
          "Función de flecha significativamente más rápida - usar para este caso",
          "Para validaciones: priorizar funciones de flecha por simplicidad"
        ]
      },
      {
        "testName": "Transformación de Usuario",
        "iterations": 2000,
        "results": {
          "traditional": {
            "averageTime": 0.089,
            "totalTime": 178.23,
            "memoryUsage": 1.87
          },
          "arrow": {
            "averageTime": 0.076,
            "totalTime": 152.34,
            "memoryUsage": 1.65
          },
          "winner": "arrow",
          "improvement": 14.61
        },
        "recommendations": [
          "Función de flecha ligeramente más rápida - considerar para operaciones frecuentes",
          "Para transformaciones: funciones de flecha son más expresivas"
        ]
      }
    ],
    "quickStats": {
      "totalTests": 5,
      "arrowWins": 3,
      "traditionalWins": 2,
      "ties": 0,
      "averageImprovement": 15.67,
      "timestamp": "2024-12-19T10:30:45.123Z"
    },
    "systemMetrics": {
      "currentMemory": {
        "rss": 45.67,
        "heapTotal": 23.45,
        "heapUsed": 18.92,
        "external": 2.34
      },
      "uptime": 3600.45,
      "nodeVersion": "v18.17.0",
      "platform": "win32"
    }
  },
  "message": "Análisis de rendimiento full completado exitosamente",
  "timestamp": "2024-12-19T10:30:45.123Z"
}
```

### 2. **Métricas del Sistema**

#### **GET** `/api/v1/performance/metrics`

Obtiene métricas detalladas del sistema en tiempo real.

**Headers Requeridos:**
```http
Authorization: Bearer <token>
```

**Ejemplo de Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/performance/metrics" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "data": {
    "performanceReport": {
      "timestamp": "2024-12-19T10:30:45.123Z",
      "totalMetrics": 15,
      "summary": {
        "UserController.getUserProfile": {
          "count": 245,
          "averageDuration": 45.67,
          "minDuration": 12.34,
          "maxDuration": 156.78,
          "averageMemory": 2.45,
          "totalCalls": 245
        },
        "auth_middleware": {
          "count": 1250,
          "averageDuration": 8.92,
          "minDuration": 3.45,
          "maxDuration": 23.67,
          "averageMemory": 0.87,
          "totalCalls": 1250
        }
      },
      "controllerPerformance": {
        "UserController": {
          "instanceCount": 1,
          "methodCalls": 245,
          "averageResponseTime": 45.67,
          "memoryFootprint": 2450000,
          "errorRate": 0.008,
          "efficiency": 87
        },
        "NotificationController": {
          "instanceCount": 1,
          "methodCalls": 89,
          "averageResponseTime": 67.23,
          "memoryFootprint": 1890000,
          "errorRate": 0.011,
          "efficiency": 82
        }
      },
      "memoryAnalysis": {
        "heapUsed": 18.92,
        "heapTotal": 23.45,
        "external": 2.34,
        "rss": 45.67
      },
      "recommendations": [
        "Considerar optimización de memoria en controladores",
        "Revisar manejo de errores en NotificationController"
      ]
    },
    "systemInfo": {
      "memory": {
        "rss": 47890432,
        "heapTotal": 24576000,
        "heapUsed": 19845632,
        "external": 2456789
      },
      "uptime": 3600.45,
      "cpuUsage": {
        "user": 1234567,
        "system": 567890
      },
      "nodeVersion": "v18.17.0",
      "platform": "win32",
      "arch": "x64"
    }
  },
  "message": "Métricas del sistema obtenidas exitosamente",
  "timestamp": "2024-12-19T10:30:45.123Z"
}
```

### 3. **Comparación de Implementaciones**

#### **POST** `/api/v1/performance/compare`

Compara implementaciones específicas entre funciones tradicionales y de flecha.

**Headers Requeridos:**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Body Parameters:**
```json
{
  "functionType": "validation", // "validation" | "transformation"
  "iterations": 1000,
  "dataSize": 1000
}
```

**Ejemplo de Request:**
```bash
curl -X POST "http://localhost:3000/api/v1/performance/compare" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "functionType": "validation",
    "iterations": 5000,
    "dataSize": 2000
  }'
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "data": {
    "comparison": {
      "testName": "Validación de Email en Lote",
      "iterations": 5000,
      "results": {
        "traditional": {
          "averageTime": 0.234,
          "totalTime": 1170.45,
          "memoryUsage": 3.45
        },
        "arrow": {
          "averageTime": 0.189,
          "totalTime": 945.67,
          "memoryUsage": 2.98
        },
        "winner": "arrow",
        "improvement": 19.23
      },
      "recommendations": [
        "Función de flecha significativamente más rápida - usar para este caso",
        "Para validaciones: priorizar funciones de flecha por simplicidad"
      ]
    },
    "testParameters": {
      "functionType": "validation",
      "iterations": 5000,
      "dataSize": 2000
    }
  },
  "message": "Comparación de validation completada exitosamente",
  "timestamp": "2024-12-19T10:30:45.123Z"
}
```

### 4. **Recomendaciones de Optimización**

#### **GET** `/api/v1/performance/recommendations`

Genera recomendaciones personalizadas de optimización basadas en las métricas actuales.

**Headers Requeridos:**
```http
Authorization: Bearer <token>
```

**Ejemplo de Request:**
```bash
curl -X GET "http://localhost:3000/api/v1/performance/recommendations" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      "Optimizar NotificationController - tiempo de respuesta alto (67.23ms)",
      "Revisar manejo de errores en NotificationController - tasa de error alta (1%)",
      "Aplicar funciones de flecha para helpers y validaciones simples",
      "Usar funciones tradicionales para métodos principales de controladores",
      "Implementar decoradores de rendimiento en métodos críticos",
      "Considerar middleware optimizado para operaciones frecuentes"
    ],
    "basedOnMetrics": {
      "UserController.getUserProfile": {
        "count": 245,
        "averageDuration": 45.67,
        "averageMemory": 2.45
      },
      "auth_middleware": {
        "count": 1250,
        "averageDuration": 8.92,
        "averageMemory": 0.87
      }
    }
  },
  "message": "Recomendaciones de optimización generadas exitosamente",
  "timestamp": "2024-12-19T10:30:45.123Z"
}
```

### 5. **Limpieza de Métricas**

#### **DELETE** `/api/v1/performance/metrics`

Limpia las métricas almacenadas (solo administradores).

**Headers Requeridos:**
```http
Authorization: Bearer <admin_token>
```

**Ejemplo de Request:**
```bash
curl -X DELETE "http://localhost:3000/api/v1/performance/metrics" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "data": {
    "cleaned": true
  },
  "message": "Métricas limpiadas exitosamente",
  "timestamp": "2024-12-19T10:30:45.123Z"
}
```

## 🔐 Autenticación y Autorización

### **Roles Requeridos:**

- **Análisis básico**: Cualquier usuario autenticado
- **Métricas del sistema**: Cualquier usuario autenticado
- **Comparaciones**: Cualquier usuario autenticado
- **Recomendaciones**: Cualquier usuario autenticado
- **Limpieza de métricas**: Solo `ADMIN`

### **Formato de Token:**
```http
Authorization: Bearer <JWT_TOKEN>
```

## 📊 Códigos de Estado HTTP

| Código | Descripción | Casos de Uso |
|--------|-------------|--------------|
| `200` | OK | Operación exitosa |
| `400` | Bad Request | Parámetros inválidos |
| `401` | Unauthorized | Token faltante o inválido |
| `403` | Forbidden | Permisos insuficientes |
| `429` | Too Many Requests | Rate limit excedido |
| `500` | Internal Server Error | Error del servidor |

## ⚠️ Manejo de Errores

### **Estructura de Error:**
```json
{
  "success": false,
  "message": "Descripción del error",
  "status": 400,
  "details": {
    "errors": ["Error específico 1", "Error específico 2"]
  },
  "timestamp": "2024-12-19T10:30:45.123Z"
}
```

### **Errores Comunes:**

#### **400 - Parámetros Inválidos**
```json
{
  "success": false,
  "message": "Parámetros inválidos",
  "status": 400,
  "details": {
    "errors": [
      "Iteraciones debe estar entre 10 y 10000",
      "Tamaño de datos debe estar entre 100 y 50000"
    ]
  }
}
```

#### **401 - No Autenticado**
```json
{
  "success": false,
  "message": "Token de acceso requerido",
  "status": 401,
  "timestamp": "2024-12-19T10:30:45.123Z"
}
```

#### **403 - Sin Permisos**
```json
{
  "success": false,
  "message": "Solo administradores pueden limpiar métricas",
  "userRole": "PARTICIPANTE",
  "status": 403,
  "timestamp": "2024-12-19T10:30:45.123Z"
}
```

## 🚀 Rate Limiting

- **Análisis completo**: 5 requests por minuto por usuario
- **Métricas**: 60 requests por minuto por usuario
- **Comparaciones**: 10 requests por minuto por usuario
- **Recomendaciones**: 20 requests por minuto por usuario

## 📈 Ejemplos de Uso Avanzado

### **1. Análisis Completo con Configuración Personalizada**

```bash
# Análisis intensivo para producción
curl -X POST "http://localhost:3000/api/v1/performance/analyze?testType=full&iterations=5000&dataSize=10000&includeMemory=true&verbose=true" \
  -H "Authorization: Bearer $TOKEN"
```

### **2. Monitoreo Continuo de Métricas**

```bash
#!/bin/bash
# Script para monitoreo cada 5 minutos
while true; do
  echo "$(date): Obteniendo métricas..."
  curl -s -X GET "http://localhost:3000/api/v1/performance/metrics" \
    -H "Authorization: Bearer $TOKEN" | jq '.data.performanceReport.memoryAnalysis'
  sleep 300
done
```

### **3. Comparación Específica de Validaciones**

```javascript
// Ejemplo en JavaScript/Node.js
const analyzeValidations = async () => {
  const response = await fetch('http://localhost:3000/api/v1/performance/compare', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      functionType: 'validation',
      iterations: 3000,
      dataSize: 5000
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log(`Winner: ${result.data.comparison.results.winner}`);
    console.log(`Improvement: ${result.data.comparison.results.improvement}%`);
    console.log('Recommendations:', result.data.comparison.recommendations);
  }
};
```

### **4. Dashboard de Métricas en Tiempo Real**

```javascript
// Ejemplo de dashboard simple
const createDashboard = async () => {
  const metrics = await fetch('http://localhost:3000/api/v1/performance/metrics', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  
  const recommendations = await fetch('http://localhost:3000/api/v1/performance/recommendations', {
    headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json());
  
  console.log('=== DASHBOARD DE RENDIMIENTO ===');
  console.log(`Memoria usada: ${metrics.data.systemInfo.memory.heapUsed / 1024 / 1024} MB`);
  console.log(`Uptime: ${metrics.data.systemInfo.uptime} segundos`);
  console.log('\nRecomendaciones:');
  recommendations.data.recommendations.forEach(rec => console.log(`- ${rec}`));
};

// Ejecutar cada 30 segundos
setInterval(createDashboard, 30000);
```

## 🔧 Configuración de Variables de Entorno

```env
# Análisis de rendimiento
PERFORMANCE_ANALYSIS_ENABLED=true
PERFORMANCE_LOG_LEVEL=info
PERFORMANCE_CACHE_TTL=300000
PERFORMANCE_MAX_CACHE_SIZE=1000

# Rate limiting
PERFORMANCE_RATE_LIMIT_ANALYSIS=5
PERFORMANCE_RATE_LIMIT_METRICS=60
PERFORMANCE_RATE_LIMIT_COMPARE=10
PERFORMANCE_RATE_LIMIT_RECOMMENDATIONS=20

# Configuración de análisis
PERFORMANCE_DEFAULT_ITERATIONS=1000
PERFORMANCE_DEFAULT_DATA_SIZE=1000
PERFORMANCE_MAX_ITERATIONS=10000
PERFORMANCE_MAX_DATA_SIZE=50000
```

## 📚 Recursos Adicionales

- **Documentación Principal**: `/docs/hybrid-strategy-implementation-README.md`
- **Ejemplos de Código**: `/examples/performance-analysis/`
- **Guía de Troubleshooting**: `/docs/troubleshooting.md`
- **Postman Collection**: `/postman/performance-api.json`

---

## 🎯 Casos de Uso Recomendados

### **Para Desarrollo:**
- Ejecutar análisis completo antes de cada release
- Monitorear métricas durante desarrollo de nuevas features
- Comparar implementaciones al refactorizar código

### **Para Producción:**
- Monitoreo continuo de métricas del sistema
- Alertas automáticas basadas en recomendaciones
- Análisis periódico de rendimiento (semanal)

### **Para Optimización:**
- Identificar cuellos de botella específicos
- Validar mejoras de rendimiento
- Generar reportes de optimización para el equipo