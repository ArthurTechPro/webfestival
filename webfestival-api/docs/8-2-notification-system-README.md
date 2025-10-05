# Sistema de Notificaciones Automáticas - WebFestival API

## Descripción

El sistema de notificaciones automáticas de WebFestival proporciona una solución completa para mantener informados a los usuarios sobre eventos importantes de la plataforma. Implementa notificaciones tanto en base de datos como por email, con trabajos programados (cron jobs) para automatizar el proceso.

## Características Principales

### 🔔 Tipos de Notificaciones

1. **Recordatorios de Fecha Límite** (Requisito 12.1)
   - Se envían automáticamente 48 horas antes del cierre de concursos
   - Solo a participantes inscritos en el concurso
   - Incluye notificación en base de datos + email

2. **Evaluación Completada** (Requisito 12.2)
   - Se envía automáticamente cuando un jurado completa la evaluación de un medio
   - Solo al autor del medio evaluado
   - Incluye notificación en base de datos + email

3. **Resultados Publicados** (Requisito 12.3)
   - Se envía automáticamente cuando un concurso cambia a estado "FINALIZADO"
   - A todos los participantes inscritos en el concurso
   - Incluye notificación en base de datos + email

4. **Nuevo Concurso** (Requisito 12.4)
   - Se envía automáticamente cuando un concurso cambia a estado "ACTIVO"
   - A todos los usuarios registrados (PARTICIPANTE y JURADO)
   - Incluye notificación en base de datos + email

### ⚡ Automatización

- **Trabajos Programados**: Cron jobs para verificaciones automáticas
- **Hooks de Eventos**: Notificaciones automáticas en eventos del sistema
- **Gestión de Errores**: Sistema robusto que no afecta operaciones principales
- **Limpieza Automática**: Eliminación de notificaciones antiguas (>30 días)

## Arquitectura

### Componentes Principales

```
src/services/notification.service.ts    # Servicio principal
src/controllers/notification.controller.ts    # Controlador API
src/routes/notification.routes.ts       # Rutas HTTP
src/scripts/init-notification-system.ts    # Script de inicialización
src/scripts/test-notification-system.ts    # Script de pruebas
```

### Flujo de Notificaciones

```mermaid
graph TD
    A[Evento del Sistema] --> B{Tipo de Evento}
    B -->|Calificación Creada| C[sendEvaluationComplete]
    B -->|Concurso Activado| D[sendNewContestNotification]
    B -->|Concurso Finalizado| E[sendResultsPublished]
    B -->|Cron Job Diario| F[sendDeadlineReminder]
    
    C --> G[Crear Notificación BD]
    D --> G
    E --> G
    F --> G
    
    G --> H[Enviar Email]
    H --> I[Log Resultado]
```

### Trabajos Programados

1. **Recordatorios de Fecha Límite**
   - Frecuencia: Diario a las 9:00 AM
   - Función: Verificar concursos que vencen en 48 horas
   - Cron: `0 9 * * *`

2. **Notificaciones de Evaluación**
   - Frecuencia: Cada hora
   - Función: Detectar nuevas evaluaciones completadas
   - Cron: `0 * * * *`

## Configuración

### Variables de Entorno Requeridas

```bash
# Servicio de Email (sendgrid o resend)
EMAIL_SERVICE=sendgrid

# SendGrid (si EMAIL_SERVICE=sendgrid)
SENDGRID_API_KEY=tu_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@webfestival.com

# Resend (si EMAIL_SERVICE=resend)
RESEND_API_KEY=tu_resend_api_key
RESEND_FROM_EMAIL=noreply@webfestival.com

# Base de datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/webfestival
```

### Instalación de Dependencias

```bash
npm install node-cron @types/node-cron
```

## Uso

### 1. Inicialización del Sistema

```bash
# Inicializar sistema completo con trabajos programados
npm run init-notifications

# Probar todas las funcionalidades
npm run test-notifications
```

### 2. Uso Programático

```typescript
import { getNotificationService } from './services/notification.service';
import { prisma } from './lib/prisma';

const notificationService = getNotificationService(prisma);

// Enviar recordatorio manual
await notificationService.sendDeadlineReminder({
  concursoId: 1,
  horasAntes: 48
});

// Configurar trabajos automáticos
notificationService.setupDeadlineReminders();
notificationService.setupEvaluationNotifications();
notificationService.startScheduledJobs();
```

## Integración con Otros Servicios

### Servicio de Email

```typescript
// Automáticamente detecta y usa el servicio configurado
const emailService = getEmailService();

// Tipos de email soportados
await emailService.sendDeadlineReminder(email, nombre, concurso);
await emailService.sendEvaluationComplete(email, nombre, concurso);
await emailService.sendResultsPublished(email, nombre, concurso);
await emailService.sendNewContestNotification(email, nombre, concurso);
```

### Hooks Automáticos

El sistema se integra automáticamente con:

- **CalificacionService**: Notifica cuando se crea una calificación
- **ConcursoService**: Notifica cuando cambia el estado de un concurso

## Testing

### Ejecutar Pruebas

```bash
# Pruebas unitarias
npm test notification.service.test.ts

# Prueba completa del sistema
npm run test-notifications
```

### Estructura de Pruebas

```typescript
describe('NotificationService', () => {
  describe('createNotification', () => {
    it('debería crear una notificación correctamente');
  });
  
  describe('sendDeadlineReminder', () => {
    it('debería enviar recordatorios de fecha límite');
  });
  
  // ... más pruebas
});
```

## Troubleshooting

### Problemas Comunes

1. **Emails no se envían**
   ```bash
   # Verificar configuración
   npm run test-email
   
   # Verificar variables de entorno
   echo $EMAIL_SERVICE
   echo $SENDGRID_API_KEY
   ```

2. **Trabajos programados no funcionan**
   ```bash
   # Verificar que el proceso esté activo
   npm run init-notifications
   
   # Revisar logs del sistema
   ```

3. **Notificaciones duplicadas**
   - El sistema previene duplicados automáticamente
   - Verificar que no haya múltiples instancias ejecutándose

### Logs y Monitoreo

```typescript
// Los logs incluyen información detallada
console.log('Notificación creada para usuario:', userId);
console.log('Email enviado exitosamente a:', email);
console.error('Error enviando notificación:', error);
```

## Consideraciones de Producción

### Escalabilidad

- **Cola de Emails**: Implementar cola para alto volumen
- **Rate Limiting**: Controlar frecuencia de envío
- **Monitoreo**: Alertas para fallos de notificación

### Seguridad

- **Validación**: Todos los inputs son validados con Zod
- **Autorización**: Endpoints administrativos requieren rol ADMIN
- **Sanitización**: Contenido de emails es sanitizado

### Rendimiento

- **Batch Processing**: Envío en lotes para múltiples usuarios
- **Async Processing**: Operaciones no bloquean el hilo principal
- **Error Handling**: Fallos de notificación no afectan operaciones principales

## Mantenimiento

### Limpieza Automática

```typescript
// Ejecutar limpieza manual
await notificationService.cleanupOldNotifications();

// O usar endpoint administrativo
POST /api/v1/notifications/cleanup
```

### Monitoreo de Salud

```typescript
// Verificar estado del sistema
const stats = await notificationService.getSystemStats();
console.log('Notificaciones pendientes:', stats.pending);
console.log('Emails enviados hoy:', stats.emailsSentToday);
```

---

**Documentación actualizada**: Diciembre 2024  
**Versión del sistema**: 1.0.0  
**Requisitos cubiertos**: 12.1, 12.2, 12.3, 12.4, 15.2