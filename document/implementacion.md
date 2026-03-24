# Guía de Despliegue: WebFestival Platform — Docker + VPS evolucion-col

## Infraestructura del Servidor

- **Servidor:** `evolucion-col` — Hostinger KVM, Ubuntu 22.04 LTS
- **IP Pública:** 187.124.232.152
- **Proxy inverso:** Traefik v3 (instancia única compartida por todas las apps)
- **Orquestación:** Docker Compose por aplicación

## Aplicaciones en el Servidor

| App | Carpeta | Prefijo contenedores | Dominio(s) |
|-----|---------|---------------------|------------|
| **Infraestructura** | `/opt/traefik` | `traefik`, `portainer` | `traefik.evolucion-col.com`, `portainer.evolucion-col.com` |
| **WebFestival** | `/opt/webfestival` | `wf-` | `webfestival.art` |
| **Winner ERP** | `/opt/winner-erp` | `erp-` | *(pendiente dominio)* |
| **Manik App** | `/opt/manik-app` | `mak-` | *(pendiente dominio)* |

> Traefik y Portainer son infraestructura del **servidor**, no de ninguna app en particular.
> Cada app tiene su propio `docker-compose.yml` y `.env` independientes.

## Estructura de Directorios en el VPS

```
/opt/
├── traefik/                  ← infraestructura compartida del servidor
│   ├── docker-compose.yml    ← Traefik + Portainer
│   ├── .env
│   └── .env.example
│
├── webfestival/              ← este proyecto
│   ├── docker-compose.yml
│   ├── .env
│   ├── webfestival-api/
│   └── webfestival-app/
│
├── winner-erp/               ← ERP
│   ├── docker-compose.yml
│   └── .env
│
├── manik-app/                ← app legada
│   ├── docker-compose.yml
│   └── .env
│
└── data/                     ← datos persistentes (bind mounts)
    ├── webfestival/
    │   ├── postgres/         ← PostgreSQL principal (wf-postgres)
    │   └── redis/            ← Redis principal (wf-redis)
    ├── immich/
    │   ├── postgres/         ← PostgreSQL de Immich (wf-immich-postgres)
    │   ├── upload/           ← Fotos y videos (wf-immich-server)
    │   └── model-cache/      ← Modelos ML (wf-immich-ml)
    └── mailserver/
        ├── mail/             ← Correos almacenados
        ├── mail-state/       ← Estado del servidor de correo
        ├── logs/             ← Logs de correo
        └── config/           ← Configuración del mailserver
```

## Servicios de WebFestival

| Servicio | Dominio | Descripción |
|----------|---------|-------------|
| App React | `webfestival.art` / `app.webfestival.art` | Frontend SPA |
| API Node.js | `api.webfestival.art` | Backend REST API |
| Immich | `medios.webfestival.art` | Gestión de fotos/videos |
| Correo | `mail.webfestival.art` | Servidor SMTP/IMAP propio |
| PostgreSQL | interno | Base de datos (sin exposición externa) |
| Redis | interno | Cache y sesiones (sin exposición externa) |

## Servicios de Infraestructura del Servidor

| Servicio | Dominio | Descripción |
|----------|---------|-------------|
| Traefik Dashboard | `traefik.evolucion-col.com` | Panel del proxy inverso |
| Portainer | `portainer.evolucion-col.com` | Gestión visual de todos los contenedores |

---

## Tabla de Contenidos

1. [Configuración DNS](#1-configuración-dns)
2. [Preparación del Servidor](#2-preparación-del-servidor)
3. [Instalar Docker](#3-instalar-docker)
4. [Configurar Traefik Compartido](#4-configurar-traefik-compartido)
5. [Clonar WebFestival](#5-clonar-webfestival)
6. [Configurar Variables de Entorno](#6-configurar-variables-de-entorno)
7. [Primer Despliegue](#7-primer-despliegue)
8. [Migraciones de Base de Datos](#8-migraciones-de-base-de-datos)
9. [Configurar Immich](#9-configurar-immich)
10. [Configurar Servidor de Correo](#10-configurar-servidor-de-correo)
11. [Verificación Final](#11-verificación-final)
12. [Operaciones del Día a Día](#12-operaciones-del-día-a-día)
13. [Backups](#13-backups)
14. [CI/CD con GitHub Actions](#14-cicd-con-github-actions)
15. [Agregar Nuevas Aplicaciones al Servidor](#15-agregar-nuevas-aplicaciones-al-servidor)

---

## Desarrollo Local (Mac / Linux)

Para desarrollar sin instalar PostgreSQL ni Redis localmente, usar el compose de `webfestival-db/`:

```bash
cd webfestival-db
cp .env.example .env
docker compose up -d
```

Esto levanta PostgreSQL en `localhost:5432` y Redis en `localhost:6379`. En `webfestival-api/.env` apuntar a:

```env
DATABASE_URL=postgresql://wf_user:wf_password_dev@localhost:5432/webfestival
REDIS_URL=redis://:wf_redis_dev@localhost:6379
```

Luego correr en terminales separadas:

```bash
# Terminal 1 — API (http://localhost:3000)
cd webfestival-api && npm run dev

# Terminal 2 — App (http://localhost:5173)
cd webfestival-app && npm run dev
```

---

## 1. Configuración DNS

En el panel de Hostinger, crear los siguientes registros para `webfestival.art`:

### Registros A

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| `A` | `@` | `187.124.232.152` | 3600 |
| `A` | `www` | `187.124.232.152` | 3600 |
| `A` | `api` | `187.124.232.152` | 3600 |
| `A` | `app` | `187.124.232.152` | 3600 |
| `A` | `medios` | `187.124.232.152` | 3600 |
| `A` | `mail` | `187.124.232.152` | 3600 |
| `A` | `portainer` | `187.124.232.152` | 3600 |
| `A` | `traefik` | `187.124.232.152` | 3600 |

### Registros de Correo

| Tipo | Nombre | Valor | Prioridad | TTL |
|------|--------|-------|-----------|-----|
| `MX` | `@` | `mail.webfestival.art` | 10 | 3600 |
| `TXT` | `@` | `v=spf1 mx a ip4:187.124.232.152 ~all` | — | 3600 |
| `TXT` | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:admin@webfestival.art` | — | 3600 |

> El registro DKIM se genera después de iniciar el mailserver (ver sección 10).

### Verificar propagación

```bash
dig api.webfestival.art +short
dig medios.webfestival.art +short
# Todos deben resolver a: 187.124.232.152
```

---

## 2. Preparación del Servidor

### 2.1 Acceso inicial

```bash
ssh root@187.124.232.152
```

### 2.2 Crear usuario de trabajo

```bash
adduser webdeploy
usermod -aG sudo webdeploy
su - webdeploy
```

### 2.3 Actualizar sistema e instalar herramientas

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl wget nano htop ufw fail2ban unzip ca-certificates gnupg lsb-release apache2-utils
```

> `apache2-utils` incluye `htpasswd`, necesario para generar el password del dashboard de Traefik.

### 2.4 Configurar zona horaria

```bash
sudo timedatectl set-timezone America/Bogota
```

### 2.5 Configurar firewall

```bash
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 25/tcp      # SMTP
sudo ufw allow 465/tcp     # SMTPS
sudo ufw allow 587/tcp     # SMTP Submission
sudo ufw allow 993/tcp     # IMAPS
sudo ufw enable
sudo ufw status
```

### 2.6 Configurar Fail2Ban  
Fail2Ban es una herramienta de seguridad para servidores Linux que protege contra ataques de fuerza bruta. Monitoriza los archivos de registro (logs) en busca de intentos de inicio de sesión fallidos y bloquea automáticamente las direcciones IP sospechosas mediante reglas de firewall (como iptables de Wikipedia o UFW de Ubuntu) por un tiempo determinado

```bash
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable --now fail2ban
```

### 2.7 Crear estructura de directorios

```bash
sudo mkdir -p /opt/traefik
sudo mkdir -p /opt/webfestival
sudo mkdir -p /opt/winner-erp
sudo mkdir -p /opt/manik-app

# Directorios de datos persistentes (bind mounts)
sudo mkdir -p /opt/data/webfestival/{postgres,redis}
sudo mkdir -p /opt/data/immich/{postgres,upload,model-cache}
sudo mkdir -p /opt/data/mailserver/{mail,mail-state,logs,config}

# Dar permisos al usuario de trabajo
sudo chown -R webdeploy:webdeploy /opt/traefik
sudo chown -R webdeploy:webdeploy /opt/webfestival
sudo chown -R webdeploy:webdeploy /opt/winner-erp
sudo chown -R webdeploy:webdeploy /opt/manik-app
sudo chown -R webdeploy:webdeploy /opt/data
```

---

## 3. Instalar Docker

```bash
# Añadir repositorio oficial de Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Añadir usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Verificar
docker --version
docker compose version
```

---

## 4. Configurar Traefik Compartido

Traefik se instala **una sola vez** en `/opt/traefik` y todas las demás apps se conectan a su red.

### 4.1 Crear la red compartida de Traefik

```bash
# Esta red es usada por TODAS las aplicaciones del servidor
docker network create traefik-proxy
```

### 4.2 Crear docker-compose.yml de Traefik

El archivo ya está en el repositorio en `traefik/docker-compose.yml`. Copiarlo al servidor:

```bash
cp -r /opt/webfestival/traefik/* /opt/traefik/
```

O si prefieres verlo, el contenido configura Traefik en `traefik.evolucion-col.com` y Portainer en `portainer.evolucion-col.com`.

### 4.3 Crear .env de Traefik

```bash
cp /opt/traefik/.env.example /opt/traefik/.env
nano /opt/traefik/.env
```

```env
ACME_EMAIL=admin@evolucion-col.com
# Generar con: htpasswd -nb admin %WaSi3355/Su%
TRAEFIK_DASHBOARD_AUTH=admin:$apr1$T2RJMJ4J$zrW9TbM5R7.d4/wW/PgnM/
```

### 4.4 Levantar Traefik

```bash
docker compose -f /opt/traefik/docker-compose.yml up -d
docker ps | grep traefik
```



> Traefik debe estar corriendo antes de levantar cualquier otra app.

---

## 5. Clonar WebFestival

```bash
# Generar clave SSH para deploy
ssh-keygen -t ed25519 -C "deploy@evolucion-col" -f ~/.ssh/id_ed25519_deploy

# Mostrar clave pública (añadir en GitHub → Settings → Deploy keys)
cat ~/.ssh/id_ed25519_deploy.pub

# Configurar SSH
cat >> ~/.ssh/config << 'EOF'
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_deploy
    IdentitiesOnly yes
    StrictHostKeyChecking accept-new
EOF
chmod 600 ~/.ssh/config

# Probar conexión
ssh -T git@github.com

# Unir repositorio [Nuevo]
git remote add origin git@github.com:ArthurTechPro/webfestival.git

# Clonar en /opt/webfestival
git clone git@github.com:ArthurTechPro/Festival-WEB.git /opt/webfestival
```
---

## 6. Configurar Variables de Entorno

```bash
cp /opt/webfestival/.env.example /opt/webfestival/.env
nano /opt/webfestival/.env
```

### Variables críticas

```env
TZ=America/Bogota
ACME_EMAIL=admin@webfestival.art

# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=%WaSi3355/Su%
POSTGRES_DB=webfestival

# ── Traefik Dashboard ─────────────────────────────────────
# Generar con: htpasswd -nb admin TU_PASSWORD
TRAEFIK_DASHBOARD_AUTH=admin:$apr1$T2RJMJ4J$zrW9TbM5R7.d4/wW/PgnM/

# Redis
REDIS_PASSWORD=WaSi3355Su
%WaSi3355/Su%


# JWT (generar con: openssl rand -hex 32)
JWT_SECRET=049402cabdf3689aa4a0cd73ab38e78eaa84c6dc9fc08cc20d22733469db7e4b
JWT_REFRESH_SECRET=5b658fa494cc80b910def4b65d4dbf0cecf6e05affbe4d47dcf88ebdd66a05cf

# Immich
IMMICH_DB_USER=immich
IMMICH_DB_PASSWORD=%WaSi3355/Su%
IMMICH_DB_NAME=immich_db
IMMICH_API_KEY=EK5fl7Zx3Z7EK6LMX39akDMsLqwgfGCV7NvjIrMsfQ

# Email
SENDGRID_API_KEY=SG.XXXXXXXX
SENDGRID_FROM_EMAIL=noreply@webfestival.art

# Stripe
STRIPE_SECRET_KEY=sk_live_XXXXXXXX
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXX
```

### Generar secretos

```bash
openssl rand -hex 32   # JWT_SECRET
openssl rand -hex 32   # JWT_REFRESH_SECRET
htpasswd -nb admin %WaSi3355/Su%   # para Traefik si se gestiona desde aquí
```

---

## 7. Primer Despliegue

> Asegurarse de que Traefik ya está corriendo (paso 4) antes de continuar.

```bash
# Crear directorio de init de PostgreSQL
mkdir -p /opt/webfestival/docker/postgres/init

# Los directorios de datos ya fueron creados en el paso 2.7
# Verificar que existen antes de continuar:
ls /opt/data/webfestival/
ls /opt/data/immich/
ls /opt/data/mailserver/

# Construir imágenes y levantar
docker compose -f /opt/webfestival/docker-compose.yml up -d --build

# Ver estado
docker compose -f /opt/webfestival/docker-compose.yml ps

# Ver logs
docker compose -f /opt/webfestival/docker-compose.yml logs -f
```

### Verificar que todos los servicios están healthy

```bash
docker ps --filter "name=wf-" --format "table {{.Names}}\t{{.Status}}"
```

---

## 8. Migraciones de Base de Datos

```bash
# Ejecutar migraciones
docker compose -f /opt/webfestival/docker-compose.yml exec api npx prisma migrate deploy

# Verificar estado
docker compose -f /opt/webfestival/docker-compose.yml exec api npx prisma migrate status
```

---

## 9. Configurar Immich

### 9.1 Primer acceso

Acceder a `https://medios.webfestival.art`, crear cuenta de administrador, luego ir a **Administration → API Keys**, crear key `webfestival-api` y copiar el valor.

### 9.2 Actualizar API Key

```bash
nano /opt/webfestival/.env
# Actualizar: IMMICH_API_KEY=el_valor_copiado

docker compose -f /opt/webfestival/docker-compose.yml restart api
```

---

## 10. Configurar Servidor de Correo

### 10.1 Crear cuentas

```bash
docker compose -f /opt/webfestival/docker-compose.yml exec mailserver setup email add admin@webfestival.art TU_PASSWORD
docker compose -f /opt/webfestival/docker-compose.yml exec mailserver setup email add noreply@webfestival.art TU_PASSWORD
```

### 10.2 Generar clave DKIM

```bash
docker compose -f /opt/webfestival/docker-compose.yml exec mailserver setup config dkim domain webfestival.art

# Ver clave pública generada
docker compose -f /opt/webfestival/docker-compose.yml exec mailserver \
  cat /tmp/docker-mailserver/opendkim/keys/webfestival.art/mail.txt
```

Añadir en DNS:

| Tipo | Nombre | Valor |
|------|--------|-------|
| `TXT` | `mail._domainkey` | `v=DKIM1; k=rsa; p=CLAVE_PUBLICA_AQUI` |

---

## 11. Verificación Final

```bash
# API
curl https://api.webfestival.art/api/v1/health

# App
curl -I https://webfestival.art

# Immich
curl -I https://medios.webfestival.art

# Portainer
curl -I https://portainer.webfestival.art

# Estado general
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"
docker stats --no-stream
```

---

## 12. Operaciones del Día a Día

### Actualizar WebFestival

```bash
cd /opt/webfestival
git pull origin main
docker compose up -d --build api app
docker compose exec api npx prisma migrate deploy
docker compose logs -f api --tail=50
```

### Comandos útiles

```bash
# Trabajar desde la carpeta del proyecto
cd /opt/webfestival

# Ver logs
docker compose logs -f [servicio]

# Reiniciar un servicio
docker compose restart [servicio]

# Detener todo WebFestival (Traefik sigue corriendo)
docker compose down

# Levantar todo
docker compose up -d

# Entrar a un contenedor
docker compose exec api sh
docker compose exec postgres psql -U wf_user -d webfestival

# Ver todos los contenedores del servidor
docker ps --format "table {{.Names}}\t{{.Status}}"
```

### Gestión desde Portainer

Acceder a `https://portainer.webfestival.art` para gestionar visualmente todos los contenedores del servidor, incluyendo las otras apps.

---

## 13. Backups

### Script de backup automático

```bash
cat > /opt/webfestival/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR=/opt/backups/webfestival
mkdir -p $BACKUP_DIR

docker compose -f /opt/webfestival/docker-compose.yml exec -T postgres \
  pg_dump -U wf_user webfestival | \
  gzip > $BACKUP_DIR/webfestival_$(date +%Y%m%d_%H%M%S).sql.gz

# Mantener solo los últimos 7 backups
ls -t $BACKUP_DIR/*.sql.gz | tail -n +8 | xargs -r rm

echo "Backup completado: $(date)"
EOF

chmod +x /opt/webfestival/backup.sh

# Programar backup diario a las 3am
(crontab -l 2>/dev/null; echo "0 3 * * * /opt/webfestival/backup.sh >> /opt/backups/webfestival/backup.log 2>&1") | crontab -
```

### Restaurar backup

```bash
gunzip -c /opt/backups/webfestival/webfestival_FECHA.sql.gz | \
  docker compose -f /opt/webfestival/docker-compose.yml exec -T postgres psql -U wf_user webfestival
```

---

## 14. CI/CD con GitHub Actions

Crear `.github/workflows/deploy.yml` en el repositorio:

```yaml
name: Deploy to evolucion-col

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: 187.124.232.152
          username: webdeploy
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/webfestival
            git pull origin main
            docker compose up -d --build api app
            docker compose exec -T api npx prisma migrate deploy
            docker compose logs --tail=20 api
```

### Configurar secret en GitHub

```bash
# En el servidor, generar clave para GitHub Actions
ssh-keygen -t ed25519 -C "github-actions@evolucion-col" -f ~/.ssh/id_ed25519_actions
cat ~/.ssh/id_ed25519_actions.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/id_ed25519_actions   # copiar este valor al secret de GitHub
```

En GitHub → repositorio → **Settings → Secrets → Actions** → crear `SSH_PRIVATE_KEY`.

---

## 15. Agregar Nuevas Aplicaciones al Servidor

Cuando se agregue `winner-erp`, `manik-app` u otra app, seguir esta convención:

### Convención de nombres

| App | Carpeta | Prefijo contenedores | Red interna |
|-----|---------|---------------------|-------------|
| WebFestival | `/opt/webfestival` | `wf-` | `wf-internal` |
| Winner ERP | `/opt/winner-erp` | `erp-` | `erp-internal` |
| Manik App | `/opt/manik-app` | `mak-` | `mak-internal` |

### Estructura mínima del docker-compose.yml de cada app

```yaml
services:
  mi-servicio:
    container_name: erp-api   # prefijo propio
    # ...
    networks:
      - traefik-proxy          # red compartida con Traefik
      - erp-internal           # red interna propia
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.erp-api.rule=Host(`api.winner-erp.com`)"
      - "traefik.http.routers.erp-api.entrypoints=websecure"
      - "traefik.http.routers.erp-api.tls.certresolver=letsencrypt"

networks:
  traefik-proxy:
    external: true    # conectar a Traefik existente
  erp-internal:
    name: erp-internal
    driver: bridge
    internal: true
```

### Levantar la nueva app

```bash
cd /opt/winner-erp
docker compose up -d --build
# Traefik detecta automáticamente los nuevos contenedores y emite SSL
```

---

## Referencia Rápida — Contenedores WebFestival

| Contenedor | Imagen | Red |
|------------|--------|-----|
| `wf-api` | build local | traefik-proxy + wf-internal |
| `wf-app` | build local | traefik-proxy |
| `wf-postgres` | `postgres:16-alpine` | wf-internal |
| `wf-redis` | `redis:7-alpine` | wf-internal |
| `wf-immich-server` | `immich-server:release` | traefik-proxy + wf-internal |
| `wf-immich-ml` | `immich-machine-learning:release` | wf-internal |
| `wf-immich-postgres` | `tensorchord/pgvecto-rs:pg16` | wf-internal |
| `wf-immich-redis` | `redis:7-alpine` | wf-internal |
| `wf-mailserver` | `docker-mailserver:latest` | traefik-proxy |

## Referencia Rápida — Infraestructura del Servidor

| Contenedor | Imagen | Dominio |
|------------|--------|---------|
| `traefik` | `traefik:v3.2` | `traefik.evolucion-col.com` |
| `portainer` | `portainer-ce:latest` | `portainer.evolucion-col.com` |
