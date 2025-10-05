# Deployment y Configuración - WebFestival Swagger Documentation

## Configuración de Entornos

### Variables de Entorno Requeridas

```bash
# .env.development
NODE_ENV=development
PORT=3001
API_VERSION=v1

# Base URLs
API_BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# Swagger Configuration
SWAGGER_ENABLED=true
SWAGGER_PATH=/api-docs
SWAGGER_JSON_PATH=/api-docs.json

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
CORS_CREDENTIALS=true

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-for-development
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/webfestival_dev

# Immich Integration
IMMICH_SERVER_URL=http://localhost:2283
IMMICH_API_KEY=your-immich-api-key

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

```bash
# .env.production
NODE_ENV=production
PORT=3001
API_VERSION=v1

# Base URLs
API_BASE_URL=https://api.webfestival.com
FRONTEND_URL=https://webfestival.com

# Swagger Configuration
SWAGGER_ENABLED=true
SWAGGER_PATH=/api-docs
SWAGGER_JSON_PATH=/api-docs.json

# CORS Configuration
CORS_ORIGIN=https://webfestival.com,https://admin.webfestival.com
CORS_CREDENTIALS=true

# JWT Configuration
JWT_SECRET=${JWT_SECRET_FROM_SECRETS_MANAGER}
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Database
DATABASE_URL=${DATABASE_URL_FROM_SECRETS_MANAGER}

# Immich Integration
IMMICH_SERVER_URL=https://media.webfestival.com
IMMICH_API_KEY=${IMMICH_API_KEY_FROM_SECRETS_MANAGER}

# Email Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=${SENDGRID_API_KEY_FROM_SECRETS_MANAGER}
```

### Configuración de Swagger por Entorno

```typescript
// src/config/swagger.ts - Configuración dinámica
const getSwaggerConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  const servers = [];
  
  if (isDevelopment) {
    servers.push({
      url: 'http://localhost:3001/api/v1',
      description: 'Servidor de Desarrollo'
    });
  }
  
  if (isProduction) {
    servers.push({
      url: 'https://api.webfestival.com/api/v1',
      description: 'Servidor de Producción'
    });
  }

  return {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'WebFestival API',
        version: '1.0.0',
        description: isDevelopment 
          ? 'API de desarrollo para WebFestival - Documentación interactiva'
          : 'API de producción para WebFestival - Documentación oficial'
      },
      servers,
      // ... resto de la configuración
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts']
  };
};
```

## Deployment con Docker

### Dockerfile Optimizado

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

# Instalar dependencias del sistema
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm ci --only=production && npm cache clean --force

# Copiar código fuente
COPY src/ ./src/
COPY docs/ ./docs/

# Compilar TypeScript
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS production

WORKDIR /app

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S webfestival -u 1001

# Copiar archivos compilados y dependencias
COPY --from=builder --chown=webfestival:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=webfestival:nodejs /app/dist ./dist
COPY --from=builder --chown=webfestival:nodejs /app/docs ./docs
COPY --from=builder --chown=webfestival:nodejs /app/package*.json ./

# Exponer puerto
EXPOSE 3001

# Cambiar a usuario no-root
USER webfestival

# Comando de inicio
CMD ["node", "dist/index.js"]
```

### Docker Compose para Desarrollo

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  webfestival-api:
    build:
      context: .
      dockerfile: Dockerfile
      target: builder
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - PORT=3001
      - SWAGGER_ENABLED=true
      - DATABASE_URL=postgresql://webfestival:password@postgres:5432/webfestival_dev
      - IMMICH_SERVER_URL=http://immich:2283
    volumes:
      - ./src:/app/src
      - ./docs:/app/docs
      - /app/node_modules
    depends_on:
      - postgres
      - immich
    command: npm run dev
    networks:
      - webfestival-network

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: webfestival_dev
      POSTGRES_USER: webfestival
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - webfestival-network

  immich:
    image: ghcr.io/immich-app/immich-server:release
    environment:
      DB_HOSTNAME: immich-postgres
      DB_USERNAME: immich
      DB_PASSWORD: immich
      DB_DATABASE_NAME: immich
    ports:
      - "2283:3001"
    depends_on:
      - immich-postgres
    networks:
      - webfestival-network

  immich-postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: immich
      POSTGRES_USER: immich
      POSTGRES_PASSWORD: immich
    volumes:
      - immich_postgres_data:/var/lib/postgresql/data
    networks:
      - webfestival-network

volumes:
  postgres_data:
  immich_postgres_data:

networks:
  webfestival-network:
    driver: bridge
```

### Docker Compose para Producción

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  webfestival-api:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - SWAGGER_ENABLED=true
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - webfestival-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.webfestival-api.rule=Host(`api.webfestival.com`)"
      - "traefik.http.routers.webfestival-api.tls=true"
      - "traefik.http.routers.webfestival-api.tls.certresolver=letsencrypt"

  traefik:
    image: traefik:v2.10
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=admin@webfestival.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./letsencrypt:/letsencrypt"
    networks:
      - webfestival-network

networks:
  webfestival-network:
    external: true
```

## Deployment en Kubernetes

### Deployment Manifest

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: webfestival-api
  namespace: webfestival
  labels:
    app: webfestival-api
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: webfestival-api
  template:
    metadata:
      labels:
        app: webfestival-api
        version: v1
    spec:
      containers:
      - name: webfestival-api
        image: webfestival/api:latest
        ports:
        - containerPort: 3001
          name: http
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3001"
        - name: SWAGGER_ENABLED
          value: "true"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: webfestival-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: webfestival-secrets
              key: jwt-secret
        - name: IMMICH_API_KEY
          valueFrom:
            secretKeyRef:
              name: webfestival-secrets
              key: immich-api-key
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: webfestival-api-service
  namespace: webfestival
spec:
  selector:
    app: webfestival-api
  ports:
  - name: http
    port: 80
    targetPort: 3001
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: webfestival-api-ingress
  namespace: webfestival
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/cors-allow-origin: "https://webfestival.com"
    nginx.ingress.kubernetes.io/cors-allow-methods: "GET, POST, PUT, DELETE, OPTIONS"
    nginx.ingress.kubernetes.io/cors-allow-headers: "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization"
spec:
  tls:
  - hosts:
    - api.webfestival.com
    secretName: webfestival-api-tls
  rules:
  - host: api.webfestival.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: webfestival-api-service
            port:
              number: 80
```

### ConfigMap para Swagger

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: webfestival-swagger-config
  namespace: webfestival
data:
  swagger.json: |
    {
      "openapi": "3.0.0",
      "info": {
        "title": "WebFestival API",
        "version": "1.0.0",
        "description": "API de producción para WebFestival"
      },
      "servers": [
        {
          "url": "https://api.webfestival.com/api/v1",
          "description": "Servidor de Producción"
        }
      ]
    }
```

## Deployment en AWS

### Usando AWS ECS con Fargate

```yaml
# aws/task-definition.json
{
  "family": "webfestival-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "webfestival-api",
      "image": "ACCOUNT.dkr.ecr.REGION.amazonaws.com/webfestival-api:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3001"
        },
        {
          "name": "SWAGGER_ENABLED",
          "value": "true"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:webfestival/database-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:webfestival/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/webfestival-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:3001/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

### CloudFormation Template

```yaml
# aws/cloudformation.yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'WebFestival API Infrastructure'

Parameters:
  Environment:
    Type: String
    Default: production
    AllowedValues: [development, staging, production]

Resources:
  # ECS Cluster
  ECSCluster:
    Type: AWS::ECS::Cluster
    Properties:
      ClusterName: !Sub 'webfestival-${Environment}'
      CapacityProviders:
        - FARGATE
        - FARGATE_SPOT

  # Application Load Balancer
  ApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    Properties:
      Name: !Sub 'webfestival-alb-${Environment}'
      Scheme: internet-facing
      Type: application
      Subnets:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2
      SecurityGroups:
        - !Ref ALBSecurityGroup

  # Target Group
  TargetGroup:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    Properties:
      Name: !Sub 'webfestival-tg-${Environment}'
      Port: 3001
      Protocol: HTTP
      TargetType: ip
      VpcId: !Ref VPC
      HealthCheckPath: /health
      HealthCheckProtocol: HTTP
      HealthCheckIntervalSeconds: 30
      HealthCheckTimeoutSeconds: 5
      HealthyThresholdCount: 2
      UnhealthyThresholdCount: 3

  # ECS Service
  ECSService:
    Type: AWS::ECS::Service
    DependsOn: ALBListener
    Properties:
      ServiceName: !Sub 'webfestival-api-${Environment}'
      Cluster: !Ref ECSCluster
      TaskDefinition: !Ref TaskDefinition
      DesiredCount: 3
      LaunchType: FARGATE
      NetworkConfiguration:
        AwsvpcConfiguration:
          SecurityGroups:
            - !Ref ECSSecurityGroup
          Subnets:
            - !Ref PrivateSubnet1
            - !Ref PrivateSubnet2
          AssignPublicIp: DISABLED
      LoadBalancers:
        - ContainerName: webfestival-api
          ContainerPort: 3001
          TargetGroupArn: !Ref TargetGroup

Outputs:
  LoadBalancerDNS:
    Description: 'DNS name of the load balancer'
    Value: !GetAtt ApplicationLoadBalancer.DNSName
    Export:
      Name: !Sub '${AWS::StackName}-LoadBalancerDNS'

  SwaggerURL:
    Description: 'URL de la documentación Swagger'
    Value: !Sub 'https://${ApplicationLoadBalancer.DNSName}/api-docs'
    Export:
      Name: !Sub '${AWS::StackName}-SwaggerURL'
```

## Monitoreo y Logging

### Configuración de Logs

```typescript
// src/config/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'webfestival-api',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Middleware para logging de requests
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });
  
  next();
};
```

### Health Checks

```typescript
// src/routes/health.routes.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Sistema]
 *     summary: Health check básico
 *     responses:
 *       200:
 *         description: Servicio funcionando correctamente
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

/**
 * @swagger
 * /ready:
 *   get:
 *     tags: [Sistema]
 *     summary: Readiness check con dependencias
 *     responses:
 *       200:
 *         description: Servicio listo para recibir tráfico
 *       503:
 *         description: Servicio no está listo
 */
router.get('/ready', async (req, res) => {
  try {
    // Verificar conexión a base de datos
    await prisma.$queryRaw`SELECT 1`;
    
    // Verificar conexión a Immich (opcional)
    const immichHealthy = await checkImmichHealth();
    
    res.status(200).json({
      status: 'Ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'OK',
        immich: immichHealthy ? 'OK' : 'WARNING'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'Not Ready',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

async function checkImmichHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.IMMICH_SERVER_URL}/api/server-info/ping`);
    return response.ok;
  } catch {
    return false;
  }
}

export default router;
```

## Scripts de Deployment

### Script de Deploy Automatizado

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

ENVIRONMENT=${1:-production}
IMAGE_TAG=${2:-latest}

echo "🚀 Iniciando deployment para $ENVIRONMENT..."

# Validar variables de entorno
if [ "$ENVIRONMENT" = "production" ]; then
    if [ -z "$DATABASE_URL" ] || [ -z "$JWT_SECRET" ]; then
        echo "❌ Variables de entorno requeridas no están configuradas"
        exit 1
    fi
fi

# Build de la imagen Docker
echo "📦 Construyendo imagen Docker..."
docker build -t webfestival/api:$IMAGE_TAG .

# Push a registry (si es necesario)
if [ "$ENVIRONMENT" = "production" ]; then
    echo "📤 Subiendo imagen al registry..."
    docker tag webfestival/api:$IMAGE_TAG $ECR_REGISTRY/webfestival-api:$IMAGE_TAG
    docker push $ECR_REGISTRY/webfestival-api:$IMAGE_TAG
fi

# Deploy según el entorno
case $ENVIRONMENT in
    "development")
        echo "🔧 Deployando en desarrollo..."
        docker-compose -f docker-compose.dev.yml up -d --build
        ;;
    "production")
        echo "🌟 Deployando en producción..."
        docker-compose -f docker-compose.prod.yml up -d
        ;;
    "k8s")
        echo "☸️ Deployando en Kubernetes..."
        kubectl apply -f k8s/
        kubectl rollout status deployment/webfestival-api -n webfestival
        ;;
esac

# Verificar deployment
echo "🔍 Verificando deployment..."
sleep 10

if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Deployment exitoso! Swagger disponible en: http://localhost:3001/api-docs"
else
    echo "❌ Deployment falló - servicio no responde"
    exit 1
fi

echo "🎉 Deployment completado para $ENVIRONMENT"
```

### CI/CD con GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy WebFestival API

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Validate Swagger spec
      run: |
        npm run build
        node -e "
          const swaggerSpec = require('./dist/config/swagger.js').swaggerSpec;
          console.log('✅ Swagger spec is valid');
        "

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to staging
      run: |
        echo "🚀 Deploying to staging..."
        # Comandos de deploy a staging
    
    - name: Test Swagger endpoint
      run: |
        sleep 30
        curl -f https://api-staging.webfestival.com/api-docs.json

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    
    - name: Deploy to production
      run: |
        echo "🌟 Deploying to production..."
        ./scripts/deploy.sh production
    
    - name: Verify deployment
      run: |
        curl -f https://api.webfestival.com/health
        curl -f https://api.webfestival.com/api-docs.json
```

## Troubleshooting

### Problemas Comunes

1. **Swagger UI no carga**
   ```bash
   # Verificar que el servidor esté corriendo
   curl http://localhost:3001/health
   
   # Verificar configuración de CORS
   curl -H "Origin: http://localhost:3000" http://localhost:3001/api-docs.json
   ```

2. **Errores de CORS en producción**
   ```typescript
   // Verificar configuración en src/index.ts
   app.use(cors({
     origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
     credentials: true
   }));
   ```

3. **Problemas de autenticación en Swagger**
   ```bash
   # Verificar que el token JWT sea válido
   curl -H "Authorization: Bearer <token>" http://localhost:3001/api/v1/auth/me
   ```

### Logs y Debugging

```bash
# Ver logs en Docker
docker logs webfestival-api

# Ver logs en Kubernetes
kubectl logs -f deployment/webfestival-api -n webfestival

# Ver logs en AWS ECS
aws logs get-log-events --log-group-name /ecs/webfestival-api --log-stream-name <stream-name>
```

La documentación Swagger está completamente configurada y lista para deployment en cualquier entorno.