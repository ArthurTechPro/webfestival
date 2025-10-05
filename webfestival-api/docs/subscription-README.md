# Sistema de Suscripciones y Monetización - WebFestival

## 🎯 Descripción

El sistema de suscripciones de WebFestival proporciona una solución completa para la monetización de la plataforma, incluyendo gestión de planes, límites de uso, procesamiento de pagos y tracking detallado de utilización.

## ✨ Características Principales

### 📋 Gestión de Planes
- **Planes flexibles**: Soporte para múltiples planes con diferentes características y límites
- **Intervalos configurables**: Suscripciones mensuales y anuales
- **Características granulares**: Control detallado de funcionalidades por plan
- **Límites personalizables**: Restricciones específicas por tipo de uso

### 🔐 Control de Acceso
- **Verificación en tiempo real**: Validación de permisos antes de cada acción
- **Límites dinámicos**: Tracking automático de uso y límites restantes
- **Escalabilidad**: Sistema preparado para múltiples tipos de restricciones

### 💳 Procesamiento de Pagos
- **Múltiples proveedores**: Integración con Stripe y PayPal
- **Webhooks automáticos**: Manejo de eventos de pago en tiempo real
- **Renovaciones automáticas**: Gestión de ciclos de facturación
- **Manejo de fallos**: Recuperación automática de pagos fallidos

### 📊 Analytics y Métricas
- **Dashboard administrativo**: Métricas completas de suscripciones
- **Tracking de uso**: Monitoreo detallado por usuario y plan
- **Análisis de churn**: Seguimiento de cancelaciones y retención
- **Reportes de ingresos**: Análisis financiero por plan y período

## 🏗️ Arquitectura

### Componentes Principales

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Controllers   │    │    Services     │    │   Data Layer    │
│                 │    │                 │    │                 │
│ • Subscription  │───▶│ • Subscription  │───▶│ • Prisma ORM    │
│ • Payment       │    │ • Stripe        │    │ • PostgreSQL    │
│ • Webhook       │    │ • PayPal        │    │ • Redis Cache   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Flujo de Datos

1. **Registro de Usuario** → Plan Básico (gratuito)
2. **Upgrade de Plan** → Procesamiento de pago → Activación
3. **Uso de Funciones** → Verificación de límites → Tracking
4. **Renovación** → Webhook → Actualización automática

## 🚀 Instalación y Configuración

### Variables de Entorno

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_WEBHOOK_ID=your_webhook_id

# Base de datos
DATABASE_URL=postgresql://user:password@localhost:5432/webfestival
```

### Inicialización

```bash
# Instalar dependencias
npm install

# Ejecutar migraciones
npx prisma migrate deploy

# Inicializar planes predeterminados
curl -X POST "http://localhost:3000/api/v1/subscriptions/initialize-plans" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## 📖 Guía de Uso

### Para Desarrolladores

#### Verificar permisos de usuario
```typescript
import { subscriptionService } from '../services/subscription.service';

// Verificar si puede participar en concursos
const canParticipate = await subscriptionService.canUserPerformAction(
  userId, 
  'participate'
);

if (!canParticipate) {
  throw new Error('Límite de participación alcanzado');
}
```

#### Incrementar uso
```typescript
// Incrementar contador de uploads
await subscriptionService.incrementUsage(
  subscriptionId, 
  'uploads_used', 
  1
);
```

### Para Administradores

#### Crear nuevo plan
```bash
curl -X POST "http://localhost:3000/api/v1/subscriptions/plans" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "enterprise",
    "name": "Plan Empresarial",
    "price": 199.99,
    "interval": "monthly",
    "features": [...],
    "limits": {...}
  }'
```

#### Obtener métricas
```bash
curl -X GET "http://localhost:3000/api/v1/subscriptions/metrics" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## 🧪 Testing

### Ejecutar Tests
```bash
# Tests completos
npm test

# Tests específicos de suscripciones
npm test -- subscription

# Tests con cobertura
npm run test:coverage
```

### Estructura de Tests
```
tests/
├── subscription.test.ts          # Tests de API
├── subscription.service.test.ts  # Tests de servicio
├── __mocks__/
│   ├── stripe.service.ts         # Mock de Stripe
│   └── paypal.service.ts         # Mock de PayPal
```

## 📊 Monitoreo y Métricas

### Métricas Clave
- **MRR (Monthly Recurring Revenue)**: Ingresos recurrentes mensuales
- **Churn Rate**: Tasa de cancelación
- **ARPU (Average Revenue Per User)**: Ingreso promedio por usuario
- **Growth Rate**: Tasa de crecimiento de suscripciones

### Dashboard de Administración
Accede a `/admin/subscriptions` para ver:
- Resumen de suscripciones activas
- Distribución por planes
- Tendencias de crecimiento
- Análisis de churn

## 🔧 Configuración Avanzada

### Planes Personalizados
```typescript
const customPlan = {
  id: 'custom-enterprise',
  name: 'Enterprise Personalizado',
  price: 499.99,
  interval: 'monthly',
  features: [
    {
      key: 'white_label',
      name: 'Marca Blanca',
      description: 'Personalización completa de la interfaz',
      enabled: true
    }
  ],
  limits: {
    maxConcursosPerMonth: -1, // Ilimitado
    maxUploadsPerMonth: -1,
    maxPrivateContests: -1,
    maxTeamMembers: 100,
    analyticsAccess: true,
    prioritySupport: true,
    apiAccess: true
  }
};
```

### Webhooks Personalizados
```typescript
// Manejar eventos personalizados
app.post('/webhooks/custom', (req, res) => {
  const event = req.body;
  
  switch (event.type) {
    case 'subscription.upgraded':
      // Lógica personalizada
      break;
    case 'subscription.downgraded':
      // Lógica personalizada
      break;
  }
});
```

## 🚨 Troubleshooting

### Problemas Comunes

#### Error: "Plan no encontrado"
```bash
# Verificar planes disponibles
curl -X GET "http://localhost:3000/api/v1/subscriptions/plans"

# Inicializar planes si es necesario
curl -X POST "http://localhost:3000/api/v1/subscriptions/initialize-plans"
```

#### Error: "Límite alcanzado"
```bash
# Verificar límites del usuario
curl -X GET "http://localhost:3000/api/v1/subscriptions/limits" \
  -H "Authorization: Bearer USER_TOKEN"
```

#### Webhook no funciona
1. Verificar URL del webhook en Stripe/PayPal
2. Comprobar firma del webhook
3. Revisar logs del servidor

### Logs y Debugging
```bash
# Ver logs de suscripciones
tail -f logs/subscription.log

# Debug de webhooks
DEBUG=webhook* npm start
```

## 🔄 Roadmap

### Próximas Funcionalidades
- [ ] Descuentos y cupones
- [ ] Planes familiares
- [ ] Facturación por uso
- [ ] Integración con más pasarelas de pago
- [ ] Analytics avanzados con ML
- [ ] API de afiliados

### Mejoras Planificadas
- [ ] Cache de límites en Redis
- [ ] Optimización de consultas
- [ ] Notificaciones push para límites
- [ ] Dashboard en tiempo real
- [ ] Exportación de datos

## 📞 Soporte

### Documentación
- [API Reference](./subscription-api.md)
- [Database Schema](./subscription-schema.md)
- [Deployment Guide](./subscription-deployment.md)

### Contacto
- **Email**: dev@webfestival.com
- **Slack**: #subscription-support
- **Issues**: GitHub Issues

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](../LICENSE) para más detalles.

---

**Desarrollado con ❤️ por el equipo de WebFestival**