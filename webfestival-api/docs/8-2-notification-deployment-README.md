# Guía de Configuración y Despliegue - Sistema de Notificaciones

## Descripción

Esta guía proporciona instrucciones detalladas para configurar, desplegar y mantener el sistema de notificaciones de WebFestival en diferentes entornos.

## Requisitos del Sistema

### Dependencias Principales

```json
{
  "node-cron": "^4.2.1",
  "@types/node-cron": "^3.0.11",
  "@sendgrid/mail": "^8.1.6",
  "resend": "^6.1.2"
}
```

### Versiones Requeridas

- **Node.js**: >= 18.0.0
- **PostgreSQL**: >= 13.0
- **Redis** (opcional): >= 6.0 para cache de notificaciones

## Configuración de Variables de Entorno

### Variables Obligatorias

```bash
# Base de datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/webfestival

# Servicio de Email (elegir uno)
EMAIL_SERVICE=sendgrid  # o 'resend'

# SendGrid (si EMAIL_SERVICE=sendgrid)
SENDGRID_API_KEY=SG.tu_api_key_aqui
SENDGRID_FROM_EMAIL=noreply@webfestival.com

# Resend (si EMAIL_SERVICE=resend)
RESEND_API_KEY=re_tu_api_key_aqui
RESEND_FROM_EMAIL=noreply@webfestival.com
```

### Variables Opcionales

```bash
# Configuración de notificaciones
NOTIFICATION_BATCH_SIZE=50          # Tamaño de lote para envío masivo
NOTIFICATION_RETRY_ATTEMPTS=3       # Intentos de reenvío
NOTIFICATION_RETRY_DELAY=1000       # Delay entre reintentos (ms)
NOTIFICATION_CLEANUP_DAYS=30        # Días para limpiar notificaciones antiguas

# Configuración de cron jobs
DEADLINE_REMINDER_CRON=0 9 * * *    # Recordatorios diarios a las 9:00 AM
EVALUATION_CHECK_CRON=0 * * * *     # Verificación de evaluaciones cada hora
```

## Configuración de Servicios de Email

### SendGrid

1. **Crear cuenta en SendGrid**
   ```bash
   # Visitar: https://sendgrid.com/
   # Crear cuenta y verificar email
   ```

2. **Generar API Key**
   ```bash
   # En SendGrid Dashboard:
   # Settings > API Keys > Create API Key
   # Seleccionar "Full Access" o permisos específicos de Mail Send
   ```

3. **Variables de entorno**
   ```bash
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=SG.tu_api_key_completa_aqui
   SENDGRID_FROM_EMAIL=noreply@tudominio.com
   ```

### Resend

1. **Crear cuenta en Resend**
   ```bash
   # Visitar: https://resend.com/
   # Crear cuenta y verificar email
   ```

2. **Generar API Key**
   ```bash
   # En Resend Dashboard:
   # API Keys > Create API Key
   # Copiar la clave generada
   ```

3. **Variables de entorno**
   ```bash
   EMAIL_SERVICE=resend
   RESEND_API_KEY=re_tu_api_key_aqui
   RESEND_FROM_EMAIL=noreply@tudominio.com
   ```

## Instalación y Configuración

### 1. Instalación de Dependencias

```bash
# Instalar dependencias del sistema de notificaciones
npm install node-cron @types/node-cron

# Si usas SendGrid
npm install @sendgrid/mail

# Si usas Resend
npm install resend
```

### 2. Configuración de Base de Datos

```bash
# Ejecutar migraciones de Prisma
npx prisma migrate dev

# Generar cliente de Prisma
npx prisma generate
```

### 3. Verificación de Configuración

```bash
# Probar configuración de email
npm run test-email

# Probar sistema completo de notificaciones
npm run test-notifications
```

### 4. Inicialización del Sistema

```bash
# Inicializar sistema de notificaciones
npm run init-notifications
```

## Despliegue en Diferentes Entornos

### Desarrollo Local

```bash
# 1. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 2. Iniciar base de datos
docker-compose up -d postgres

# 3. Ejecutar migraciones
npm run db:migrate

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. En otra terminal, iniciar notificaciones
npm run init-notifications
```

### Staging/Testing

```bash
# 1. Configurar variables de entorno específicas
export NODE_ENV=staging
export DATABASE_URL=postgresql://user:pass@staging-db:5432/webfestival
export EMAIL_SERVICE=sendgrid
export SENDGRID_API_KEY=SG.staging_key_here

# 2. Construir aplicación
npm run build

# 3. Ejecutar migraciones
npm run db:migrate

# 4. Iniciar aplicación
npm start

# 5. Iniciar sistema de notificaciones
npm run init-notifications
```

### Producción

#### Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  webfestival-api:
    build: .
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - EMAIL_SERVICE=${EMAIL_SERVICE}
      - SENDGRID_API_KEY=${SENDGRID_API_KEY}
      - SENDGRID_FROM_EMAIL=${SENDGRID_FROM_EMAIL}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    restart: unless-stopped

  webfestival-notifications:
    build: .
    command: npm run init-notifications
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - EMAIL_SERVICE=${EMAIL_SERVICE}
      - SENDGRID_API_KEY=${SENDGRID_API_KEY}
      - SENDGRID_FROM_EMAIL=${SENDGRID_FROM_EMAIL}
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=webfestival
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

#### PM2 (Proceso Manager)

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'webfestival-api',
      script: 'dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'webfestival-notifications',
      script: 'dist/scripts/init-notification-system.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      restart_delay: 5000,
      max_restarts: 10
    }
  ]
};
```

```bash
# Desplegar con PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Monitoreo y Logs

### Health Checks

```javascript
// health-check.js
const express = require('express');
const { getNotificationService } = require('./services/notification.service');
const { getEmailService } = require('./services/email.service');

const router = express.Router();

router.get('/health/notifications', async (req, res) => {
  try {
    const emailService = getEmailService();
    const emailHealthy = await emailService.testConnection();
    
    const notificationService = getNotificationService(prisma);
    const cronJobsActive = notificationService.cronJobs.size > 0;
    
    const health = {
      status: emailHealthy && cronJobsActive ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        email: emailHealthy ? 'up' : 'down',
        cronJobs: cronJobsActive ? 'active' : 'inactive'
      }
    };
    
    res.status(health.status === 'healthy' ? 200 : 503).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
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

### Análisis de Logs

```bash
# Buscar errores específicos
grep -E "(Error|Failed)" logs/notifications-*.log | tail -20

# Analizar patrones de envío
awk '/Notificación creada/ {print $1, $2}' logs/notifications-combined.log | sort | uniq -c

# Verificar rendimiento de emails
grep "Email enviado exitosamente" logs/notifications-combined.log | wc -l
```

## Backup y Recuperación

### Backup de Notificaciones

```sql
-- Script de backup para notificaciones
-- backup-notifications.sql

-- Crear backup de notificaciones de los últimos 90 días
CREATE TABLE notifications_backup AS 
SELECT * FROM notificaciones 
WHERE fecha_creacion >= NOW() - INTERVAL '90 days';

-- Exportar a archivo
\copy notifications_backup TO '/backup/notifications_backup.csv' WITH CSV HEADER;
```

### Restauración de Servicio

```bash
#!/bin/bash
# restore-notifications.sh

echo "Iniciando restauración del sistema de notificaciones..."

# 1. Verificar base de datos
echo "Verificando conexión a base de datos..."
npm run db:ping || exit 1

# 2. Restaurar configuración
echo "Restaurando configuración..."
cp /backup/.env.production .env

# 3. Ejecutar migraciones si es necesario
echo "Ejecutando migraciones..."
npm run db:migrate

# 4. Reiniciar servicios
echo "Reiniciando servicios..."
pm2 restart webfestival-notifications

# 5. Verificar salud del sistema
echo "Verificando salud del sistema..."
sleep 10
curl -f http://localhost:3000/health/notifications || exit 1

echo "Restauración completada exitosamente"
```

---

**Documentación actualizada**: Diciembre 2024  
**Versión del sistema**: 1.0.0  
**Entornos soportados**: Development, Staging, Production