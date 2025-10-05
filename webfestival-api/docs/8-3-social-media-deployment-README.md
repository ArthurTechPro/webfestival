# Despliegue del Sistema de Redes Sociales - WebFestival API

## Configuración de Variables de Entorno

### Variables Requeridas

```bash
# Configuración del servidor
SERVER_URL="https://api.webfestival.com"  # URL pública de la API
NODE_ENV="production"

# APIs de Facebook
FACEBOOK_APP_ID="123456789012345"
FACEBOOK_APP_SECRET="abcdef1234567890abcdef1234567890"

# API de Instagram
INSTAGRAM_ACCESS_TOKEN="IGQVJXYWxhc2RmNzVGZAGc1..."

# APIs de Twitter/X
TWITTER_API_KEY="abcdefghijklmnopqrstuvw"
TWITTER_API_SECRET="1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefgh"

# APIs de LinkedIn
LINKEDIN_CLIENT_ID="abcdefghij"
LINKEDIN_CLIENT_SECRET="ABCDEFGHIJ1234567890"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100
```

### Configuración por Entorno

#### Desarrollo
```bash
# .env.development
SERVER_URL="http://localhost:3001"
FACEBOOK_APP_ID="test-facebook-id"
FACEBOOK_APP_SECRET="test-facebook-secret"
# ... otras variables de prueba
```

#### Staging
```bash
# .env.staging
SERVER_URL="https://staging-api.webfestival.com"
FACEBOOK_APP_ID="staging-facebook-id"
FACEBOOK_APP_SECRET="staging-facebook-secret"
# ... variables de staging
```

#### Producción
```bash
# .env.production
SERVER_URL="https://api.webfestival.com"
FACEBOOK_APP_ID="prod-facebook-id"
FACEBOOK_APP_SECRET="prod-facebook-secret"
# ... variables de producción
```

## Configuración de APIs de Redes Sociales

### 1. Facebook App Configuration

#### Crear App de Facebook
1. Ir a [Facebook Developers](https://developers.facebook.com/)
2. Crear nueva app → "Consumer" → "Next"
3. Configurar información básica:
   - **App Name**: WebFestival
   - **App Contact Email**: admin@webfestival.com
   - **Category**: Photo & Video

#### Configurar Productos
```bash
# Productos necesarios:
- Facebook Login (opcional para futuras funcionalidades)
- Share Dialog (para compartir)
```

#### Configurar Dominios
```bash
# App Domains (en configuración básica):
webfestival.com
api.webfestival.com

# Valid OAuth Redirect URIs:
https://api.webfestival.com/auth/facebook/callback
```

#### Obtener Credenciales
```bash
# En App Settings → Basic:
App ID → FACEBOOK_APP_ID
App Secret → FACEBOOK_APP_SECRET
```

### 2. Instagram Configuration

#### Crear Instagram App
1. Usar la misma app de Facebook
2. Agregar producto "Instagram Basic Display"
3. Crear Instagram App en el producto

#### Configurar OAuth
```bash
# Valid OAuth Redirect URIs:
https://api.webfestival.com/auth/instagram/callback

# Deauthorize Callback URL:
https://api.webfestival.com/auth/instagram/deauthorize

# Data Deletion Request URL:
https://api.webfestival.com/auth/instagram/delete
```

#### Generar Access Token
```bash
# Para desarrollo, usar Instagram Basic Display API
# Para producción, considerar Instagram Graph API

# Scopes necesarios:
user_profile,user_media
```

### 3. Twitter/X API Configuration

#### Crear App en Twitter
1. Ir a [Twitter Developer Portal](https://developer.twitter.com/)
2. Crear nuevo proyecto y app
3. Configurar información:
   - **App Name**: WebFestival
   - **Description**: Plataforma de concursos multimedia
   - **Website**: https://webfestival.com

#### Configurar Permisos
```bash
# App permissions:
Read and Write (para futuras funcionalidades)

# Callback URLs:
https://api.webfestival.com/auth/twitter/callback

# Website URL:
https://webfestival.com
```

#### Obtener Credenciales
```bash
# En Keys and Tokens:
API Key → TWITTER_API_KEY
API Secret Key → TWITTER_API_SECRET
```

### 4. LinkedIn API Configuration

#### Crear App en LinkedIn
1. Ir a [LinkedIn Developers](https://www.linkedin.com/developers/)
2. Crear nueva app
3. Configurar información:
   - **App Name**: WebFestival
   - **LinkedIn Page**: Página de empresa de WebFestival
   - **App Logo**: Logo de WebFestival

#### Configurar Productos
```bash
# Productos necesarios:
- Share on LinkedIn (para compartir)
- Sign In with LinkedIn (opcional)
```

#### Configurar OAuth
```bash
# Authorized Redirect URLs:
https://api.webfestival.com/auth/linkedin/callback

# Scopes necesarios:
r_liteprofile,w_member_social
```

#### Obtener Credenciales
```bash
# En Auth tab:
Client ID → LINKEDIN_CLIENT_ID
Client Secret → LINKEDIN_CLIENT_SECRET
```

## Configuración de Infraestructura

### Docker Configuration

#### Dockerfile
```dockerfile
# Usar imagen base de Node.js
FROM node:22-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Compilar TypeScript
RUN npm run build

# Exponer puerto
EXPOSE 3001

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3001

# Comando de inicio
CMD ["npm", "start"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  webfestival-api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - SERVER_URL=${SERVER_URL}
      - FACEBOOK_APP_ID=${FACEBOOK_APP_ID}
      - FACEBOOK_APP_SECRET=${FACEBOOK_APP_SECRET}
      - INSTAGRAM_ACCESS_TOKEN=${INSTAGRAM_ACCESS_TOKEN}
      - TWITTER_API_KEY=${TWITTER_API_KEY}
      - TWITTER_API_SECRET=${TWITTER_API_SECRET}
      - LINKEDIN_CLIENT_ID=${LINKEDIN_CLIENT_ID}
      - LINKEDIN_CLIENT_SECRET=${LINKEDIN_CLIENT_SECRET}
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: webfestival_db
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Kubernetes Configuration

#### deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webfestival-api
  labels:
    app: webfestival-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: webfestival-api
  template:
    metadata:
      labels:
        app: webfestival-api
    spec:
      containers:
      - name: webfestival-api
        image: webfestival/api:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: webfestival-secrets
              key: database-url
        - name: SERVER_URL
          valueFrom:
            configMapKeyRef:
              name: webfestival-config
              key: server-url
        - name: FACEBOOK_APP_ID
          valueFrom:
            secretKeyRef:
              name: social-media-secrets
              key: facebook-app-id
        - name: FACEBOOK_APP_SECRET
          valueFrom:
            secretKeyRef:
              name: social-media-secrets
              key: facebook-app-secret
        # ... otras variables de entorno
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: webfestival-api-service
spec:
  selector:
    app: webfestival-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3001
  type: ClusterIP
```

#### secrets.yaml
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: social-media-secrets
type: Opaque
data:
  facebook-app-id: <base64-encoded-value>
  facebook-app-secret: <base64-encoded-value>
  instagram-access-token: <base64-encoded-value>
  twitter-api-key: <base64-encoded-value>
  twitter-api-secret: <base64-encoded-value>
  linkedin-client-id: <base64-encoded-value>
  linkedin-client-secret: <base64-encoded-value>
```

#### configmap.yaml
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: webfestival-config
data:
  server-url: "https://api.webfestival.com"
  rate-limit-window-ms: "900000"
  rate-limit-max-requests: "100"
```

## Configuración de Nginx

### nginx.conf
```nginx
upstream webfestival_api {
    server webfestival-api-1:3001;
    server webfestival-api-2:3001;
    server webfestival-api-3:3001;
}

server {
    listen 80;
    server_name api.webfestival.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.webfestival.com;

    ssl_certificate /etc/ssl/certs/webfestival.crt;
    ssl_certificate_key /etc/ssl/private/webfestival.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    # Rate limiting para endpoints públicos
    limit_req_zone $binary_remote_addr zone=public_api:10m rate=100r/m;
    limit_req_zone $http_authorization zone=auth_api:10m rate=50r/m;

    location /api/v1/social-media/public/ {
        limit_req zone=public_api burst=20 nodelay;
        proxy_pass http://webfestival_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Headers para Open Graph
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        
        # Cache para metadatos públicos
        location ~* \.(json)$ {
            expires 1h;
            add_header Cache-Control "public, immutable";
        }
    }

    location /api/v1/social-media/ {
        limit_req zone=auth_api burst=10 nodelay;
        proxy_pass http://webfestival_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://webfestival_api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Configuración de Monitoreo

### Prometheus Metrics

#### metrics.js
```javascript
const promClient = require('prom-client');

// Métricas específicas para redes sociales
const socialMediaMetrics = {
  shareLinksGenerated: new promClient.Counter({
    name: 'social_media_share_links_generated_total',
    help: 'Total number of share links generated',
    labelNames: ['platform', 'media_type']
  }),
  
  publicMediaAccess: new promClient.Counter({
    name: 'social_media_public_access_total',
    help: 'Total number of public media accesses',
    labelNames: ['media_type', 'position']
  }),
  
  apiErrors: new promClient.Counter({
    name: 'social_media_api_errors_total',
    help: 'Total number of API errors',
    labelNames: ['endpoint', 'error_type']
  }),
  
  responseTime: new promClient.Histogram({
    name: 'social_media_response_time_seconds',
    help: 'Response time for social media endpoints',
    labelNames: ['endpoint', 'method'],
    buckets: [0.1, 0.5, 1, 2, 5]
  })
};

module.exports = socialMediaMetrics;
```

### Grafana Dashboard

#### dashboard.json
```json
{
  "dashboard": {
    "title": "WebFestival - Social Media API",
    "panels": [
      {
        "title": "Share Links Generated",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(social_media_share_links_generated_total[5m])",
            "legendFormat": "{{platform}}"
          }
        ]
      },
      {
        "title": "Public Media Access",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(social_media_public_access_total[5m])",
            "legendFormat": "{{media_type}}"
          }
        ]
      },
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(social_media_response_time_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(social_media_api_errors_total[5m])",
            "legendFormat": "{{error_type}}"
          }
        ]
      }
    ]
  }
}
```

## Scripts de Despliegue

### deploy.sh
```bash
#!/bin/bash

set -e

echo "🚀 Iniciando despliegue del sistema de redes sociales..."

# Variables
ENVIRONMENT=${1:-production}
VERSION=${2:-latest}

echo "📋 Configuración:"
echo "  Entorno: $ENVIRONMENT"
echo "  Versión: $VERSION"

# Validar variables de entorno
echo "🔍 Validando configuración..."
if [ -z "$FACEBOOK_APP_ID" ]; then
    echo "❌ Error: FACEBOOK_APP_ID no configurado"
    exit 1
fi

if [ -z "$SERVER_URL" ]; then
    echo "❌ Error: SERVER_URL no configurado"
    exit 1
fi

# Construir imagen Docker
echo "🏗️ Construyendo imagen Docker..."
docker build -t webfestival/api:$VERSION .

# Ejecutar tests
echo "🧪 Ejecutando tests..."
docker run --rm \
  -e NODE_ENV=test \
  -e FACEBOOK_APP_ID=test \
  -e SERVER_URL=http://localhost:3001 \
  webfestival/api:$VERSION npm test -- --testPathPattern=social-media

# Desplegar según el entorno
case $ENVIRONMENT in
  "development")
    echo "🔧 Desplegando en desarrollo..."
    docker-compose -f docker-compose.dev.yml up -d
    ;;
  "staging")
    echo "🎭 Desplegando en staging..."
    kubectl apply -f k8s/staging/
    kubectl set image deployment/webfestival-api webfestival-api=webfestival/api:$VERSION
    ;;
  "production")
    echo "🌟 Desplegando en producción..."
    kubectl apply -f k8s/production/
    kubectl set image deployment/webfestival-api webfestival-api=webfestival/api:$VERSION
    kubectl rollout status deployment/webfestival-api
    ;;
  *)
    echo "❌ Entorno no válido: $ENVIRONMENT"
    exit 1
    ;;
esac

# Verificar despliegue
echo "✅ Verificando despliegue..."
sleep 30

if [ "$ENVIRONMENT" = "production" ]; then
    HEALTH_URL="https://api.webfestival.com/api/v1/health"
else
    HEALTH_URL="http://localhost:3001/api/v1/health"
fi

if curl -f $HEALTH_URL; then
    echo "✅ Despliegue exitoso!"
else
    echo "❌ Error en el despliegue"
    exit 1
fi

echo "🎉 Despliegue completado!"
```

### rollback.sh
```bash
#!/bin/bash

set -e

echo "🔄 Iniciando rollback..."

ENVIRONMENT=${1:-production}
PREVIOUS_VERSION=${2}

if [ -z "$PREVIOUS_VERSION" ]; then
    echo "❌ Error: Versión anterior requerida"
    echo "Uso: ./rollback.sh <environment> <previous_version>"
    exit 1
fi

echo "📋 Rollback a versión: $PREVIOUS_VERSION"

case $ENVIRONMENT in
  "staging"|"production")
    kubectl set image deployment/webfestival-api webfestival-api=webfestival/api:$PREVIOUS_VERSION
    kubectl rollout status deployment/webfestival-api
    ;;
  *)
    echo "❌ Entorno no válido para rollback: $ENVIRONMENT"
    exit 1
    ;;
esac

echo "✅ Rollback completado!"
```

## Configuración de SSL/TLS

### Let's Encrypt con Certbot
```bash
# Instalar certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d api.webfestival.com

# Renovación automática
sudo crontab -e
# Agregar línea:
0 12 * * * /usr/bin/certbot renew --quiet
```

### Configuración de HTTPS
```nginx
# Redirigir HTTP a HTTPS
server {
    listen 80;
    server_name api.webfestival.com;
    return 301 https://$server_name$request_uri;
}

# Configuración HTTPS
server {
    listen 443 ssl http2;
    server_name api.webfestival.com;
    
    ssl_certificate /etc/letsencrypt/live/api.webfestival.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.webfestival.com/privkey.pem;
    
    # Configuración SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;
    
    # ... resto de la configuración
}
```

## Verificación Post-Despliegue

### Health Checks
```bash
# Verificar salud de la API
curl -f https://api.webfestival.com/api/v1/health

# Verificar configuración de redes sociales (requiere token admin)
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
     https://api.webfestival.com/api/v1/social-media/configuration

# Probar endpoint público
curl https://api.webfestival.com/api/v1/social-media/public/media/1/test
```

### Tests de Integración
```bash
# Ejecutar tests completos
npm run test-social-media

# Verificar métricas
curl https://api.webfestival.com/metrics | grep social_media
```

## Troubleshooting

### Problemas Comunes

1. **APIs no configuradas**
   ```bash
   # Verificar variables de entorno
   kubectl get secret social-media-secrets -o yaml
   
   # Verificar configuración
   kubectl logs deployment/webfestival-api | grep "social-media"
   ```

2. **Rate limiting excesivo**
   ```bash
   # Ajustar límites en nginx
   sudo nano /etc/nginx/sites-available/webfestival
   sudo nginx -t && sudo systemctl reload nginx
   ```

3. **Errores de SSL**
   ```bash
   # Verificar certificados
   sudo certbot certificates
   
   # Renovar si es necesario
   sudo certbot renew --force-renewal
   ```

### Logs y Monitoreo

```bash
# Ver logs de la aplicación
kubectl logs -f deployment/webfestival-api

# Ver métricas de Prometheus
curl https://api.webfestival.com/metrics

# Verificar estado de pods
kubectl get pods -l app=webfestival-api
```

## Conclusión

El despliegue del sistema de redes sociales requiere configuración cuidadosa de múltiples APIs externas y consideraciones de seguridad. Con la configuración adecuada de variables de entorno, monitoreo y scripts de despliegue automatizados, el sistema puede operar de manera confiable en producción.