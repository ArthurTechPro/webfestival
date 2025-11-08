# Guía de Despliegue: Servidor Ubuntu 22.04 Multi-Servicio

## Sistema Operativo: Ubuntu 22.04 LTS Server
## IP Pública: 200.14.41.62

Este documento detalla el proceso **paso a paso desde cero** para configurar un servidor Ubuntu 22.04 LTS con los siguientes servicios:

| Servicio | Dominio | Puerto Interno | Descripción |
|----------|---------|---------------|-------------|
| **API Node.js** | api.webfestival.art | 3001 | Backend API con PM2 |
| **App React** | app.webfestival.art | - | Frontend (archivos estáticos) |
| **Immich** | medios.webfestival.art | 2283 | Gestión de fotos/videos (Docker) |
| **Webmin** | webmin.webfestival.art | 10000 | Panel de administración web |
| **PostgreSQL** | localhost | 5432 | Base de datos para API |
| **Nginx** | - | 80/443 | Reverse proxy y SSL |

---

## Tabla de Contenidos

0. [Preparación Inicial del Servidor](#paso-0-preparación-inicial-del-servidor-ubuntu-2204)
1. [Configuración DNS](#paso-1-configuración-dns)
2. [Actualización y Seguridad Básica](#paso-2-actualización-y-seguridad-básica)
3. [Instalar PostgreSQL](#paso-3-instalar-postgresql-paso-a-paso)
4. [Instalar Node.js y PM2](#paso-4-instalar-nodejs-y-pm2-paso-a-paso)
5. [Instalar Docker](#paso-5-instalar-docker-paso-a-paso)
6. [Configurar Immich](#paso-6-configurar-immich-paso-a-paso)
7. [Configurar Acceso a GitHub](#paso-7-configurar-acceso-a-github-deploy-keys)
8. [Desplegar la API Node.js](#paso-8-desplegar-la-api-nodejs-con-pm2)
9. [Desplegar la App React](#paso-9-desplegar-la-app-react)
10. [Instalar y Configurar Nginx](#paso-10-instalar-y-configurar-nginx-paso-a-paso)
11. [Instalar Webmin](#paso-11-instalar-webmin-paso-a-paso)
12. [Configurar SSL con Let's Encrypt](#paso-12-configurar-ssl-con-lets-encrypt-paso-a-paso)
13. [Verificación Final](#paso-13-verificación-final-y-reinicio-automático)
14. [ANEXO: GitHub Actions](#anexo-automatización-con-github-actions-opcional)

---

## Paso 0: Preparación Inicial del Servidor Ubuntu 22.04

### 0.1 Acceso Inicial al Servidor

```bash
# Conectarse por SSH (desde tu computadora)
ssh root@200.14.41.62
# O si ya tienes usuario:
ssh serverdata@200.14.41.62
```

### 0.2 Crear Usuario de Trabajo (Si usas root)

Es recomendable NO trabajar como root:

```bash
# Crear nuevo usuario
adduser serverdata

# Agregar al grupo sudo
usermod -aG sudo serverdata

# Cambiar a ese usuario
su - serverdata
```

Para las siguientes instrucciones, trabajaremos con el usuario `serverdata`.

### 0.3 Configurar Zona Horaria

```bash
# Ver zona horaria actual
timedatectl

# Configurar zona horaria (ejemplo: Bogotá)
sudo timedatectl set-timezone America/Bogota

# Verificar
date
```

### 0.4 Verificar Información del Sistema

```bash
# Versión de Ubuntu
lsb_release -a
# Debe mostrar: Ubuntu 22.04.x LTS

# Información del sistema
uname -a

# Espacio en disco
df -h

# Memoria RAM
free -h

# Dirección IP
ip addr show
# Verificar que muestre: 200.14.41.62
```

---

## Paso 1: Configuración DNS

En el panel de control de tu proveedor de dominio (`webfestival.art`):

### 1.1 Crear Récords DNS

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| `A` | `@` | `200.14.41.62` | 3600 |
| `A` | `www` | `200.14.41.62` | 3600 |
| `A` | `api` | `200.14.41.62` | 3600 |
| `A` | `app` | `200.14.41.62` | 3600 |
| `A` | `medios` | `200.14.41.62` | 3600 |
| `A` | `webmin` | `200.14.41.62` | 3600 |

### 1.2 Verificar Propagación DNS

Desde tu computadora local o desde el servidor:

```bash
# Verificar cada dominio
nslookup api.webfestival.art
nslookup app.webfestival.art
nslookup medios.webfestival.art
nslookup webmin.webfestival.art

# Con dig (más detallado)
dig api.webfestival.art +short
dig app.webfestival.art +short
dig medios.webfestival.art +short
dig webmin.webfestival.art +short

# Todos deben resolver a: 200.14.41.62
```

**Nota:** La propagación puede tardar de 5 minutos a 24 horas. Espera al menos 10 minutos antes de continuar.

---

## Paso 2: Actualización y Seguridad Básica

### 2.1 Actualizar el Sistema Completamente

```bash
# Actualizar lista de paquetes
sudo apt update

# Ver actualizaciones disponibles
apt list --upgradable

# Actualizar todos los paquetes instalados
sudo apt upgrade -y

# Actualizar el sistema completo
sudo apt full-upgrade -y

# Limpiar paquetes no necesarios
sudo apt autoremove -y
sudo apt autoclean
```

### 2.2 Instalar Herramientas Esenciales

```bash
sudo apt install -y \
    git \
    curl \
    wget \
    nano \
    vim \
    htop \
    net-tools \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    fail2ban \
    unzip
```

**Verificar instalaciones:**
```bash
git --version
curl --version
htop --version
```

### 2.3 Configurar el Firewall (UFW)

```bash
# Ver estado actual
sudo ufw status

# Permitir SSH (IMPORTANTE: hacer esto PRIMERO para no perder acceso)
sudo ufw allow 22/tcp
sudo ufw allow OpenSSH

# Permitir HTTP y HTTPS (para Nginx)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Permitir puerto de Webmin
sudo ufw allow 10000/tcp

# Habilitar el firewall
sudo ufw enable
# Confirmar con 'y'

# Verificar reglas activas
sudo ufw status numbered
```

**Resultado esperado:**
```
Status: active

To                         Action      From
--                         ------      ----
22/tcp                     ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
10000/tcp                  ALLOW       Anywhere
```

### 2.4 Configurar Fail2Ban (Protección contra ataques SSH)

```bash
# Crear archivo de configuración local
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Editar configuración
sudo nano /etc/fail2ban/jail.local
```

Buscar la sección `[sshd]` y asegurarse que esté:
```ini
[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
maxretry = 5
bantime = 3600
```

Guardar: `Ctrl + X`, `Y`, `Enter`

```bash
# Iniciar y habilitar Fail2Ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Verificar estado
sudo systemctl status fail2ban

# Ver cárceles activas
sudo fail2ban-client status

# Ver estado específico de SSH
sudo fail2ban-client status sshd
```

---

## Paso 3: Instalar PostgreSQL Paso a Paso

### 3.1 Instalación de PostgreSQL

```bash
# Actualizar repositorios
sudo apt update

# Instalar PostgreSQL y utilidades
sudo apt install -y postgresql postgresql-contrib

# Verificar versión instalada
psql --version
# Debe mostrar: psql (PostgreSQL) 14.x (Ubuntu 14.x-x.pgdg22.04+1)
```

### 3.2 Verificar Servicio de PostgreSQL

```bash
# Ver estado del servicio
sudo systemctl status postgresql

# Si no está activo, iniciarlo
sudo systemctl start postgresql

# Habilitar inicio automático
sudo systemctl enable postgresql

# Verificar que está escuchando en el puerto 5432
sudo ss -tlnp | grep 5432
```

### 3.3 Configuración Inicial de PostgreSQL

```bash
# Conectarse como usuario postgres
sudo -u postgres psql

# Verificar que entraste correctamente
# Deberías ver el prompt: postgres=#
```

### 3.4 Crear Base de Datos y Usuario

Dentro del prompt de PostgreSQL (`postgres=#`):

```sql
-- Ver bases de datos existentes
\l

-- Crear la base de datos para la API
CREATE DATABASE webfestival;

-- Cambiar la contraseña del usuario postgres
ALTER USER postgres WITH PASSWORD 'wasi3355';

-- Dar todos los privilegios sobre la base de datos
GRANT ALL PRIVILEGES ON DATABASE webfestival TO postgres;

-- Verificar que se creó
\l

-- Conectarse a la nueva base de datos
\c webfestival

-- Ver la base de datos actual
SELECT current_database();

-- Salir de PostgreSQL
\q
```

### 3.5 Configurar Acceso Local

```bash
# Editar archivo de autenticación
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

Buscar estas líneas y asegurarse que estén así:
```
# "local" is for Unix domain socket connections only
local   all             all                                     peer

# IPv4 local connections:
host    all             all             127.0.0.1/32            md5

# IPv6 local connections:
host    all             all             ::1/128                 md5
```

Guardar: `Ctrl + X`, `Y`, `Enter`

```bash
# Reiniciar PostgreSQL para aplicar cambios
sudo systemctl restart postgresql

# Verificar que reinició correctamente
sudo systemctl status postgresql
```

### 3.6 Probar Conexión a la Base de Datos

```bash
# Probar conexión con contraseña
psql -U postgres -d webfestival -h localhost -W

# Cuando pida password, ingresar: wasi3355

# Dentro del prompt:
\dt  # Ver tablas (estará vacío por ahora)
\l   # Ver bases de datos
\q   # Salir
```

### 3.7 URL de Conexión para la API

Tu aplicación Node.js usará esta cadena de conexión:
```
postgresql://postgres:wasi3355@localhost:5432/webfestival
```

---

## Paso 4: Instalar Node.js y PM2 Paso a Paso

### 4.1 Instalar Node.js v22 LTS

```bash
# Descargar e instalar el repositorio de NodeSource para Node.js 22
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalación
node --version
# Debe mostrar: v22.x.x

npm --version
# Debe mostrar: 10.x.x o superior
```

### 4.2 Configurar npm Global

```bash
# Crear directorio para paquetes globales de npm (para evitar usar sudo)
mkdir -p ~/.npm-global

# Configurar npm para usar el nuevo directorio
npm config set prefix '~/.npm-global'

# Añadir al PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc

# Recargar configuración
source ~/.bashrc
```

### 4.3 Instalar PM2 Globalmente

```bash
# Instalar PM2 (ahora sin sudo)
npm install -g pm2

# Verificar instalación
pm2 --version

# Ver comandos disponibles
pm2 help

# Ver lista de procesos (vacía por ahora)
pm2 list
```

### 4.4 Configurar PM2 para Inicio Automático

```bash
# Generar script de inicio para systemd
pm2 startup

# IMPORTANTE: PM2 te mostrará un comando para ejecutar, algo como:
# sudo env PATH=$PATH:/home/serverdata/.npm-global/bin /home/serverdata/.npm-global/lib/node_modules/pm2/bin/pm2 startup systemd -u serverdata --hp /home/serverdata

# COPIA Y EJECUTA ese comando EXACTO que te muestra PM2

# Después de ejecutarlo, verificar que el servicio se creó:
sudo systemctl status pm2-serverdata
```

### 4.5 Verificar Configuración de PM2

```bash
# Ver información del sistema PM2
pm2 info

# Ver monitoreo (presiona Ctrl+C para salir)
pm2 monit
```

---

## Paso 5: Instalar Docker Paso a Paso

### 5.1 Preparar el Sistema para Docker

```bash
# Actualizar índice de paquetes
sudo apt update

# Instalar dependencias necesarias
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
```

### 5.2 Añadir Repositorio Oficial de Docker

```bash
# Crear directorio para claves GPG si no existe
sudo mkdir -p /etc/apt/keyrings

# Descargar clave GPG oficial de Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Verificar que se descargó
ls -la /etc/apt/keyrings/docker.gpg

# Dar permisos de lectura a todos
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Añadir repositorio de Docker a sources.list
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Verificar que se añadió
cat /etc/apt/sources.list.d/docker.list
```

### 5.3 Instalar Docker Engine

```bash
# Actualizar índice con el nuevo repositorio
sudo apt update

# Instalar Docker y todos sus componentes
sudo apt install -y \
    docker-ce \
    docker-ce-cli \
    containerd.io \
    docker-buildx-plugin \
    docker-compose-plugin

# Verificar instalación
docker --version
# Debe mostrar: Docker version 24.x.x o superior

docker compose version
# Debe mostrar: Docker Compose version v2.x.x
```

### 5.4 Configurar Permisos de Docker

```bash
# Ver grupos del usuario actual
groups

# Añadir el usuario actual al grupo docker
sudo usermod -aG docker $USER

# Ver que se añadió
groups

# Aplicar cambios de grupo sin cerrar sesión
newgrp docker

# Verificar que puedes ejecutar docker sin sudo
docker ps
# Debe mostrar una lista vacía (sin errores de permisos)

# Ver información del sistema Docker
docker info
```

### 5.5 Habilitar Inicio Automático de Docker

```bash
# Habilitar Docker para inicio automático
sudo systemctl enable docker
sudo systemctl enable containerd

# Verificar estado
sudo systemctl status docker
sudo systemctl status containerd

# Ver versión completa
docker version
```

### 5.6 Probar Instalación de Docker

```bash
# Ejecutar contenedor de prueba
docker run hello-world

# Si ves "Hello from Docker!", la instalación fue exitosa

# Ver imágenes descargadas
docker images

# Ver contenedores (incluyendo detenidos)
docker ps -a

# Limpiar contenedor e imagen de prueba
docker rm $(docker ps -a -q -f ancestor=hello-world)
docker rmi hello-world

# Verificar limpieza
docker ps -a
docker images
```

---

## Paso 6: Configurar Immich Paso a Paso

### 6.1 Crear Estructura de Directorios

```bash
# Crear directorio para configuración de Immich
mkdir -p ~/immich
cd ~/immich

# Crear directorio para almacenar fotos/videos
mkdir -p ~/immich-data

# Verificar que se crearon
ls -la ~/ | grep immich
```

### 6.2 Descargar Archivos de Configuración de Immich

```bash
# Asegurarse de estar en el directorio correcto
cd ~/immich

# Descargar docker-compose.yml
wget -O docker-compose.yml https://github.com/immich-app/immich/releases/latest/download/docker-compose.yml

# Descargar archivo de ejemplo de variables
wget -O example.env https://github.com/immich-app/immich/releases/latest/download/example.env

# Verificar que se descargaron
ls -la

# Copiar archivo de ejemplo a .env
cp example.env .env

# Verificar
ls -la .env
```

### 6.3 Configurar Variables de Entorno de Immich

```bash
# Editar archivo .env
nano .env
```

**Modificar las siguientes variables (buscar y cambiar):**

```env
# ===== Ubicación de almacenamiento =====
UPLOAD_LOCATION=/home/serverdata/immich-data

# ===== Configuración de Base de Datos =====
DB_HOSTNAME=immich_postgres
DB_USERNAME=postgres
DB_PASSWORD=ImmichSeguro2024!
DB_DATABASE_NAME=immich

# ===== Puerto (dejar por defecto) =====
# No descomentar, usar el puerto interno 2283

# ===== Zona horaria =====
TZ=America/Bogota

# ===== Redis =====
REDIS_HOSTNAME=immich_redis
```

**Guardar:** `Ctrl + X`, luego `Y`, luego `Enter`

### 6.4 Verificar y Ajustar docker-compose.yml

```bash
# Ver el contenido del archivo
nano docker-compose.yml
```

**Asegurarse que cada servicio tenga:**
```yaml
restart: always
```

Si no lo tiene, añadirlo debajo de cada `image:` o al final de cada servicio.

**Guardar:** `Ctrl + X`, `Y`, `Enter`

### 6.5 Configurar Permisos del Directorio de Datos

```bash
# Dar permisos correctos al directorio de almacenamiento
sudo chown -R $USER:$USER ~/immich-data
chmod -R 755 ~/immich-data

# Verificar permisos
ls -la ~/immich-data
```

### 6.6 Iniciar Immich con Docker Compose

```bash
# Asegurarse de estar en el directorio correcto
cd ~/immich

# Descargar todas las imágenes de Docker (puede tardar 5-10 minutos)
docker compose pull

# Ver progreso de descarga

# Iniciar todos los servicios en segundo plano
docker compose up -d

# Tiempo de espera: 2-3 minutos para que inicien todos los servicios
```

### 6.7 Verificar que Immich Está Corriendo

```bash
# Ver estado de todos los contenedores
docker compose ps

# Deberías ver algo como:
# NAME                      STATUS
# immich-server             Up (healthy)
# immich-machine-learning   Up (healthy)
# immich-microservices      Up (healthy)
# immich-redis              Up (healthy)
# immich-postgres           Up (healthy)

# Ver logs de todos los servicios
docker compose logs

# Ver logs en tiempo real (Ctrl+C para salir)
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs immich-server

# Ver últimas 50 líneas de logs
docker compose logs --tail=50
```

### 6.8 Verificar Puerto de Immich

```bash
# Verificar que el puerto 2283 está escuchando
sudo ss -tlnp | grep 2283

# O con netstat
sudo netstat -tlnp | grep 2283

# Deberías ver algo como:
# tcp   0   0 0.0.0.0:2283   0.0.0.0:*   LISTEN   12345/docker-proxy
```

### 6.9 Comandos Útiles para Immich

```bash
# Detener todos los servicios
docker compose down

# Iniciar servicios
docker compose up -d

# Reiniciar servicios
docker compose restart

# Ver uso de recursos
docker stats

# Ver contenedores en ejecución
docker ps

# Entrar al contenedor del servidor (para debugging)
docker compose exec immich-server sh

# Limpiar logs (si crecen mucho)
docker compose logs --tail=0 -f > /dev/null
```

---

## Paso 7: Configurar Acceso a GitHub (Deploy Keys)

### 7.1 Generar Clave SSH para Despliegues

```bash
# Generar clave SSH dedicada para despliegues
ssh-keygen -t ed25519 -C "deploy@webfestival.art" -f ~/.ssh/id_ed25519_deploy

# Cuando pregunte por passphrase, presiona Enter (sin contraseña)
# Presiona Enter nuevamente para confirmar
```

### 7.2 Visualizar y Copiar la Clave Pública

```bash
# Mostrar la clave pública
cat ~/.ssh/id_ed25519_deploy.pub

# Deberías ver algo como:
# ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIxxxxxxxxxxxxxxxxxxxxx deploy@webfestival.art

# Copiar TODO el texto (desde ssh-ed25519 hasta deploy@webfestival.art)
```

### 7.3 Añadir Deploy Key en GitHub - Repositorio API

**Para el repositorio de la API:**
 
 EN Ve a: https://github.com/ArthurTechPro/webfestival-api/settings/keys

1. Ve a tu repositorio en GitHub: `https://github.com/TU_USUARIO/api`
2. Clic en `Settings` (Configuración)
3. En el menú izquierdo, clic en `Deploy keys`
4. Clic en botón verde `Add deploy key`
5. **Title:** `servidor-produccion-webfestival`
6. **Key:** Pega la clave pública completa que copiaste
7. **NO marques** "Allow write access" (solo necesitamos leer)
8. Clic en `Add key`

### 7.4 Añadir Deploy Key en GitHub - Repositorio App

**Para el repositorio de la aplicación React:**

1. Ve a tu repositorio: `https://github.com/TU_USUARIO/app`
2. Repite los pasos 2-8 del punto anterior
3. Usa el mismo título: `servidor-produccion-webfestival`
4. Usa la **misma** clave pública

### 7.5 Configurar SSH en el Servidor

```bash
# Crear/editar archivo de configuración SSH
nano ~/.ssh/config
```

**Añadir el siguiente contenido:**
```
# Configuración para GitHub
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_deploy
    IdentitiesOnly yes
    StrictHostKeyChecking accept-new
```

**Guardar:** `Ctrl + X`, `Y`, `Enter`

```bash
# Dar permisos correctos al archivo de configuración
chmod 600 ~/.ssh/config

# Dar permisos correctos a la clave privada
chmod 600 ~/.ssh/id_ed25519_deploy

# Añadir GitHub a known_hosts (aceptar automáticamente)
ssh-keyscan -H github.com >> ~/.ssh/known_hosts

# Verificar que se añadió
cat ~/.ssh/known_hosts | grep github
```

### 7.6 Probar Conexión con GitHub

```bash
# Probar autenticación con GitHub
ssh -T git@github.com

# Deberías ver un mensaje como:
# Hi USERNAME! You've successfully authenticated, but GitHub does not provide shell access.

# Si ves ese mensaje, ¡la configuración es correcta!
```

### 7.7 Clonar Repositorios

**IMPORTANTE:** Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub y los nombres reales de tus repositorios.

```bash
# Clonar repositorio de la API
git clone git@github.com:TU_USUARIO/api.git ~/api

# Ejemplo real (reemplazar con tus datos):
# git clone git@github.com:juanperez/webfestival-api.git ~/api

# Clonar repositorio de la App React
git clone git@github.com:TU_USUARIO/app.git ~/app

# Ejemplo real (reemplazar con tus datos):
# git clone git@github.com:juanperez/webfestival-app.git ~/app

# Verificar que se clonaron correctamente
ls -la ~/api
ls -la ~/app

# Ver contenido de los repositorios
cd ~/api && ls -la
cd ~/app && ls -la
```

### 7.8 Verificar Ramas y Configuración Git

```bash
# En el repositorio de la API
cd ~/api
git status
git branch
git remote -v

# En el repositorio de la App
cd ~/app
git status
git branch
git remote -v
```

---

## Paso 8: Desplegar la API (Node.js con PM2)

### 8.1 Preparar el Proyecto API

```bash
# Ir al directorio de la API
cd ~/api

# Ver archivos del proyecto
ls -la

# Instalar dependencias de npm
npm install

# Esto puede tardar 1-5 minutos dependiendo del tamaño del proyecto
# Verás la barra de progreso de npm
```

### 8.2 Crear Archivo de Variables de Entorno

```bash
# Crear archivo .env en el directorio de la API
nano ~/api/.env
```

**Contenido del archivo .env:**

```env
# ====================
# CONFIGURACIÓN DE API
# ====================

# Puerto donde correrá la API
PORT=3001

# URL de conexión a PostgreSQL
DATABASE_URL=postgresql://postgres:wasi3355@localhost:5432/webfestival

# Entorno de ejecución
NODE_ENV=production

# Secreto para JWT (cambiar por uno aleatorio seguro)
JWT_SECRET=tu_jwt_secreto_super_seguro_12345

# Configuración de CORS (ajustar según tus dominios)
CORS_ORIGIN=https://app.webfestival.art,https://webfestival.art

# Otras variables que tu API necesite...
# Por ejemplo:
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=tu_email@gmail.com
# SMTP_PASS=tu_password
```

**Guardar:** `Ctrl + X`, `Y`, `Enter`

### 8.3 Verificar Configuración de la API

```bash
# Ver el contenido del .env (sin mostrar contraseñas)
cat ~/api/.env | grep -v PASSWORD | grep -v SECRET

# Verificar que el archivo package.json existe
cat ~/api/package.json

# Verificar el script de inicio
cat ~/api/package.json | grep "start"
```

### 8.4 Probar la API Manualmente (Opcional pero Recomendado)

```bash
# Ejecutar la API manualmente para verificar que funciona
cd ~/api
npm start

# O si tu API usa otro comando:
# node index.js
# node server.js
# node src/index.js

# Deberías ver algo como:
# "Servidor corriendo en puerto 3001"
# "Base de datos conectada"

# Abrir otra terminal y probar la API
curl http://localhost:3001
# O el endpoint de health check de tu API:
curl http://localhost:3001/health
curl http://localhost:3001/api/health

# Si funciona correctamente, presiona Ctrl+C para detener el servidor
```

### 8.5 Iniciar la API con PM2

```bash
# Ir al directorio de la API
cd ~/api

# Iniciar con PM2 (ajusta el archivo según tu proyecto)
# Si tu archivo principal es index.js:
pm2 start index.js --name "api"

# Si tu archivo principal es server.js:
pm2 start server.js --name "api"

# Si usas npm start:
pm2 start npm --name "api" -- start

# Si tu archivo está en src/index.js:
pm2 start dist/index.js --name "api"
```

### 8.6 Verificar que la API Está Corriendo

```bash
# Ver lista de procesos PM2
pm2 list

# Deberías ver algo como:
# ┌─────┬─────────┬─────────┬───────┬────────┐
# │ id  │ name    │ status  │ cpu   │ memory │
# ├─────┼─────────┼─────────┼───────┼────────┤
# │ 0   │ api     │ online  │ 0%    │ 45 MB  │
# └─────┴─────────┴─────────┴───────┴────────┘

# Ver logs en tiempo real
pm2 logs api

# Presiona Ctrl+C para salir de los logs

# Ver las últimas 100 líneas de logs
pm2 logs api --lines 100 --nostream

# Ver información detallada del proceso
pm2 info api

# Ver monitoreo en tiempo real (presiona 'q' para salir)
pm2 monit
```

### 8.7 Guardar Configuración de PM2 para Reinicio Automático

```bash
# Guardar la lista actual de procesos
pm2 save

# Verificar que se guardó
cat ~/.pm2/dump.pm2

# El startup ya fue configurado en el Paso 4.4
# Verificar que está activo:
sudo systemctl status pm2-ubuntu
```

### 8.8 Probar la API desde el Navegador

```bash
# Verificar que el puerto 3001 está escuchando
sudo ss -tlnp | grep 3001

# Desde el servidor, probar con curl
curl http://localhost:3001

# Si tienes un endpoint específico de health:
curl http://localhost:3001/health
curl http://localhost:3001/api/health
```

### 8.9 Crear Script de Despliegue para la API

```bash
# Crear script de actualización/despliegue
nano ~/api/deploy.sh
```

**Contenido del script:**

```bash
#!/bin/bash
set -e

echo "======================================"
echo "🚀 Desplegando API WebFestival"
echo "======================================"
echo ""

cd ~/api

echo "📥 [1/4] Descargando últimos cambios de GitHub..."
git pull origin main
echo "✓ Código actualizado"
echo ""

echo "📦 [2/4] Instalando dependencias..."
npm install --production
echo "✓ Dependencias instaladas"
echo ""

echo "🔄 [3/4] Reiniciando servicio PM2..."
pm2 restart api
echo "✓ Servicio reiniciado"
echo ""

echo "📊 [4/4] Verificando estado..."
sleep 3
pm2 status api
echo ""

echo "✅ ¡Despliegue completado exitosamente!"
echo ""
echo "📋 Ver logs con: pm2 logs api"
echo "📊 Ver monitoreo con: pm2 monit"
```

**Guardar:** `Ctrl + X`, `Y`, `Enter`

```bash
# Dar permisos de ejecución al script
chmod +x ~/api/deploy.sh

# Probar el script de despliegue
~/api/deploy.sh

# Ver logs después del despliegue
pm2 logs api --lines 50
```

### 8.10 Comandos Útiles para la API

```bash
# Ver logs en tiempo real
pm2 logs api

# Reiniciar la API
pm2 restart api

# Detener la API
pm2 stop api

# Iniciar la API (si está detenida)
pm2 start api

# Eliminar del listado de PM2
pm2 delete api

# Ver uso de CPU y memoria
pm2 monit

# Ver información detallada
pm2 info api

# Ver logs de errores únicamente
pm2 logs api --err

# Limpiar logs antiguos
pm2 flush
```

---

## Paso 9: Desplegar la App React

### 9.1 Preparar el Proyecto React

```bash
# Ir al directorio de la aplicación
cd ~/app

# Ver archivos del proyecto
ls -la

# Instalar dependencias
npm install

# Esto puede tardar 2-5 minutos
```

### 9.2 Configurar Variables de Entorno para React (Si Aplica)

```bash
# Crear archivo .env si tu aplicación React lo necesita
nano ~/app/.env
```

**Ejemplo de contenido (ajustar según tu aplicación):**

```env
# URL de la API
REACT_APP_API_URL=https://api.webfestival.art

# URL de medios
REACT_APP_MEDIA_URL=https://medios.webfestival.art

# Entorno
REACT_APP_ENVIRONMENT=production

# Otras variables que necesites...
```

**Guardar:** `Ctrl + X`, `Y`, `Enter`

### 9.3 Compilar la Aplicación React

```bash
# Compilar para producción
cd ~/app
npm run build

# Esto creará la carpeta 'build' con los archivos estáticos
# Puede tardar 1-3 minutos

# Ver progreso de la compilación
```

### 9.4 Verificar la Compilación

```bash
# Verificar que se creó la carpeta build
ls -la ~/app/build

# Ver tamaño de la carpeta build
du -sh ~/app/build

# Ver archivos generados
ls -la ~/app/build/
ls -la ~/app/build/static/

# Debería haber carpetas: css, js, media
```

### 9.5 Configurar Permisos de la Carpeta Build

```bash
# Dar permisos correctos
chmod -R 755 ~/app/build

# Verificar permisos
ls -la ~/app/build
```

### 9.6 Crear Script de Despliegue para la App

```bash
# Crear script de actualización
nano ~/app/deploy.sh
```

**Contenido del script:**

```bash
#!/bin/bash
set -e

echo "======================================"
echo "🚀 Desplegando App WebFestival"
echo "======================================"
echo ""

cd ~/app

echo "📥 [1/4] Descargando últimos cambios de GitHub..."
git pull origin main
echo "✓ Código actualizado"
echo ""

echo "📦 [2/4] Instalando dependencias..."
npm install
echo "✓ Dependencias instaladas"
echo ""

echo "🏗️  [3/4] Compilando aplicación React..."
npm run build
echo "✓ Aplicación compilada"
echo ""

echo "📊 [4/4] Verificando build..."
echo "Tamaño de la carpeta build:"
du -sh build/
echo ""
echo "Archivos generados:"
ls -lh build/
echo ""

echo "✅ ¡Despliegue completado exitosamente!"
echo ""
echo "🌐 La aplicación estará disponible en: https://app.webfestival.art"
echo "📁 Ruta del build: ~/app/build"
```

**Guardar:** `Ctrl + X`, `Y`, `Enter`

```bash
# Dar permisos de ejecución
chmod +x ~/app/deploy.sh

# Probar el script
~/app/deploy.sh
```

### 9.7 Verificar Archivos Estáticos

```bash
# Ver el archivo index.html
cat ~/app/build/index.html

# Ver estructura de directorios
tree ~/app/build -L 2
# O sin tree:
find ~/app/build -maxdepth 2 -type d
```

---

## Paso 10: Instalar y Configurar Nginx Paso a Paso

### 10.1 Instalar Nginx

```bash
# Actualizar repositorios
sudo apt update

# Instalar Nginx
sudo apt install -y nginx

# Verificar versión instalada
nginx -v
# Debe mostrar: nginx version: nginx/1.18.0 (Ubuntu)
```

### 10.2 Verificar y Configurar el Servicio Nginx

```bash
# Ver estado del servicio
sudo systemctl status nginx

# Iniciar Nginx si no está corriendo
sudo systemctl start nginx

# Habilitar inicio automático
sudo systemctl enable nginx

# Verificar que está escuchando en el puerto 80
sudo ss -tlnp | grep :80

# Ver configuración actual
nginx -t
```

### 10.3 Probar Instalación Básica

```bash
# Desde tu navegador, visita:
# http://200.14.41.62

# Deberías ver la página de bienvenida de Nginx
# Si ves "Welcome to nginx!", la instalación fue exitosa

# Desde el servidor, probar con curl
curl http://localhost
```

### 10.4 Eliminar Configuración por Defecto

```bash
# Remover el sitio por defecto
sudo rm /etc/nginx/sites-enabled/default

# Verificar que se eliminó
ls /etc/nginx/sites-enabled/
```

### 10.5 Crear Configuración para WebFestival

```bash
# Crear archivo de configuración
sudo nano /etc/nginx/sites-available/webfestival.art
```

**Contenido completo del archivo:**

```nginx
# ============================================
# Configuración Multi-Sitio WebFestival
# Servidor: 200.14.41.62
# ============================================

# 1. API Node.js en api.webfestival.art
server {
    listen 80;
    listen [::]:80;
    server_name api.webfestival.art;

    # Logs específicos para la API
    access_log /var/log/nginx/api.webfestival.access.log;
    error_log /var/log/nginx/api.webfestival.error.log;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        
        # Headers necesarios para proxy
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# 2. Aplicación React en app.webfestival.art
server {
    listen 80;
    listen [::]:80;
    server_name app.webfestival.art;

    # Ruta a los archivos compilados de React
    root /home/serverdata/app/build;
    index index.html;

    # Logs específicos para la app
    access_log /var/log/nginx/app.webfestival.access.log;
    error_log /var/log/nginx/app.webfestival.error.log;

    # Manejar rutas de React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache agresivo para assets estáticos (JS, CSS, imágenes)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Seguridad: evitar acceso a archivos ocultos
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}

# 3. Immich (Docker) en medios.webfestival.art
server {
    listen 80;
    listen [::]:80;
    server_name medios.webfestival.art;

    # Aumentar límite para subir videos/fotos grandes (50GB)
    client_max_body_size 50000M;
    client_body_timeout 300s;
    client_body_buffer_size 512k;

    # Logs específicos para medios
    access_log /var/log/nginx/medios.webfestival.access.log;
    error_log /var/log/nginx/medios.webfestival.error.log;

    location / {
        proxy_pass http://localhost:2283;
        
        # Headers necesarios para Immich
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # WebSocket support para Immich
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Timeouts largos para subidas de archivos grandes
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        send_timeout 300s;
        
        # Desactivar buffering para streaming eficiente
        proxy_buffering off;
        proxy_request_buffering off;
        proxy_max_temp_file_size 0;
    }
}

# 4. Redirección del dominio raíz a la app
server {
    listen 80;
    listen [::]:80;
    server_name webfestival.art www.webfestival.art;
    
    # Redirigir todo el tráfico a app.webfestival.art
    return 301 http://app.webfestival.art$request_uri;
}
```

**Guardar:** `Ctrl + X`, `Y`, `Enter`

### 10.6 Activar la Configuración

```bash
# Crear enlace simbólico para habilitar el sitio
sudo ln -s /etc/nginx/sites-available/webfestival.art /etc/nginx/sites-enabled/

# Verificar que se creó el enlace
ls -la /etc/nginx/sites-enabled/

# Probar la sintaxis de la configuración
sudo nginx -t

# Deberías ver:
# nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
# nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 10.7 Recargar Nginx

```bash
# Recargar configuración de Nginx
sudo systemctl reload nginx

# O reiniciar completamente
sudo systemctl restart nginx

# Verificar estado
sudo systemctl status nginx

# Ver errores si los hay
sudo tail -f /var/log/nginx/error.log
```

### 10.8 Verificar Funcionamiento

```bash
# Probar cada dominio desde el servidor
curl -I http://api.webfestival.art
curl -I http://app.webfestival.art
curl -I http://medios.webfestival.art

# Desde tu navegador, visitar:
# http://api.webfestival.art
# http://app.webfestival.art
# http://medios.webfestival.art
```

### 10.9 Ver Logs de Nginx

```bash
# Ver logs de acceso en tiempo real
sudo tail -f /var/log/nginx/access.log

# Ver logs de errores
sudo tail -f /var/log/nginx/error.log

# Ver logs específicos de cada sitio
sudo tail -f /var/log/nginx/api.webfestival.access.log
sudo tail -f /var/log/nginx/app.webfestival.access.log
sudo tail -f /var/log/nginx/medios.webfestival.access.log
```

---

## Paso 11: Instalar Webmin Paso a Paso

### 11.1 Añadir Repositorio de Webmin

```bash
# Añadir la clave GPG de Webmin
curl -fsSL https://download.webmin.com/jcameron-key.asc | sudo gpg --dearmor -o /usr/share/keyrings/webmin.gpg

# Añadir el repositorio
echo "deb [signed-by=/usr/share/keyrings/webmin.gpg] https://download.webmin.com/download/repository sarge contrib" | sudo tee /etc/apt/sources.list.d/webmin.list

# Actualizar lista de paquetes
sudo apt update
```

### 11.2 Instalar Webmin

```bash
# Instalar Webmin
sudo apt install -y webmin

# Verificar que se instaló
webmin --version

# Ver estado del servicio
sudo systemctl status webmin
```

### 11.3 Configurar Puerto y Seguridad de Webmin

```bash
# Editar configuración de Webmin
sudo nano /etc/webmin/miniserv.conf
```

Buscar y modificar estas líneas:
```
port=10000
listen=127.0.0.1
ssl=1
```

**Guardar:** `Ctrl + X`, `Y`, `Enter`

```bash
# Reiniciar Webmin
sudo systemctl restart webmin

# Verificar que está corriendo
sudo systemctl status webmin

# Verificar puerto (debe estar solo en localhost por ahora)
sudo ss -tlnp | grep 10000
```

### 11.4 Configurar Nginx para Webmin

```bash
# Editar la configuración de Nginx para añadir Webmin
sudo nano /etc/nginx/sites-available/webfestival.art
```

**Añadir al final del archivo (antes del último `}`), este nuevo bloque:**

```nginx

# 5. Webmin en webmin.webfestival.art
server {
    listen 80;
    listen [::]:80;
    server_name webmin.webfestival.art;

    # Logs específicos para webmin
    access_log /var/log/nginx/webmin.webfestival.access.log;
    error_log /var/log/nginx/webmin.webfestival.error.log;

    location / {
        proxy_pass https://localhost:10000;
        proxy_http_version 1.1;
        
        # Headers necesarios
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Ignorar certificado autofirmado de Webmin
        proxy_ssl_verify off;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Guardar:** `Ctrl + X`, `Y`, `Enter`

```bash
# Probar la configuración
sudo nginx -t

# Si todo está bien, recargar Nginx
sudo systemctl reload nginx
```

### 11.5 Verificar Acceso a Webmin

```bash
# Desde el navegador, visitar:
# http://webmin.webfestival.art

# Deberías ver la página de login de Webmin

# Credenciales de acceso:
# Usuario: serverdata (o root)
# Contraseña: la contraseña de tu usuario serverdata
```

### 11.6 Configurar Webmin Tras el Primer Acceso

Una vez que accedas a Webmin:

1. **Cambiar idioma** (si quieres):
   - `Webmin` → `Webmin Configuration` → `Language`
   - Seleccionar "Spanish (ES)" o mantener "English"

2. **Actualizar Webmin**:
   - `Webmin` → `Webmin Configuration` → `Upgrade Webmin`

3. **Configurar módulos útiles**:
   - `Servers` → Ver servicios instalados (Nginx, PostgreSQL, Docker)
   - `System` → `Users and Groups`
   - `System` → `Disk and Network Filesystems`

### 11.7 Comandos Útiles de Webmin

```bash
# Ver estado de Webmin
sudo systemctl status webmin

# Reiniciar Webmin
sudo systemctl restart webmin

# Detener Webmin
sudo systemctl stop webmin

# Iniciar Webmin
sudo systemctl start webmin

# Ver logs de Webmin
sudo tail -f /var/webmin/miniserv.log

# Ver logs de errores
sudo tail -f /var/webmin/miniserv.error

# Cambiar puerto de Webmin
sudo /usr/share/webmin/changeport.pl 10000 NUEVO_PUERTO
```

---

## Paso 12: Configurar SSL con Let's Encrypt Paso a Paso

### 12.1 Instalar Certbot

```bash
# Actualizar repositorios
sudo apt update

# Instalar Certbot y el plugin de Nginx
sudo apt install -y certbot python3-certbot-nginx

# Verificar instalación
certbot --version
# Debe mostrar: certbot 1.21.0 o superior
```

### 12.2 Verificar Configuración de Nginx

Antes de obtener certificados, asegurarse que:
1. Los dominios DNS apunten correctamente a 200.14.41.62
2. Nginx esté corriendo correctamente
3. Los puertos 80 y 443 estén abiertos en el firewall

```bash
# Verificar DNS de cada dominio
nslookup api.webfestival.art
nslookup app.webfestival.art
nslookup medios.webfestival.art
nslookup webmin.webfestival.art

# Todos deben resolver a: 200.14.41.62

# Verificar que Nginx está corriendo
sudo systemctl status nginx

# Verificar firewall
sudo ufw status | grep -E '80|443'

# Probar sintaxis de Nginx
sudo nginx -t
```

### 12.3 Obtener Certificados SSL para Todos los Dominios

```bash
# Obtener certificados para todos los subdominios de una vez
sudo certbot --nginx -d webfestival.art -d www.webfestival.art -d api.webfestival.art -d app.webfestival.art -d medios.webfestival.art -d webmin.webfestival.art

# Certbot te hará algunas preguntas:
```

**Responde a las preguntas de Certbot:**

1. **Email address:** Ingresa tu email (para notificaciones de renovación)
2. **Terms of Service:** Escribe `Y` para aceptar
3. **Share email:** Escribe `N` (opcional)
4. **Redirect HTTP to HTTPS:** Escribe `2` (Sí, redirigir todo el tráfico HTTP a HTTPS)

### 12.4 Verificar que los Certificados se Instalaron

```bash
# Ver certificados instalados
sudo certbot certificates

# Deberías ver algo como:
# Certificate Name: webfestival.art
#   Domains: webfestival.art www.webfestival.art api.webfestival.art app.webfestival.art medios.webfestival.art webmin.webfestival.art
#   Expiry Date: [fecha en 90 días]
#   Certificate Path: /etc/letsencrypt/live/webfestival.art/fullchain.pem
#   Private Key Path: /etc/letsencrypt/live/webfestival.art/privkey.pem
```

### 12.5 Verificar Configuración de Nginx Actualizada

```bash
# Certbot modificó automáticamente la configuración de Nginx
# Ver los cambios
sudo nano /etc/nginx/sites-available/webfestival.art

# Deberías ver que cada bloque server ahora tiene:
# - Configuración para puerto 443 (HTTPS)
# - Referencias a los certificados SSL
# - Redirección automática de HTTP (puerto 80) a HTTPS (puerto 443)

# Probar la configuración
sudo nginx -t

# Recargar Nginx
sudo systemctl reload nginx
```

### 12.6 Probar HTTPS en Todos los Dominios

```bash
# Probar desde el servidor
curl -I https://api.webfestival.art
curl -I https://app.webfestival.art
curl -I https://medios.webfestival.art
curl -I https://webmin.webfestival.art

# Desde tu navegador, visitar:
# https://api.webfestival.art
# https://app.webfestival.art
# https://medios.webfestival.art
# https://webmin.webfestival.art

# Verificar que el candado verde aparece (conexión segura)
```

### 12.7 Configurar Renovación Automática

```bash
# Certbot ya configuró un timer de systemd para renovación automática
# Verificar que está activo
sudo systemctl status certbot.timer

# Ver cuándo se ejecutará la próxima renovación
sudo systemctl list-timers | grep certbot

# Probar renovación manual (dry-run, sin hacer cambios reales)
sudo certbot renew --dry-run

# Deberías ver: "Congratulations, all simulated renewals succeeded"
```

### 12.8 Ver Logs de Certbot

```bash
# Ver logs de Certbot
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Ver intentos de renovación
sudo cat /var/log/letsencrypt/letsencrypt.log | grep renew
```

### 12.9 Forzar Renovación Manual (Si es Necesario)

```bash
# Renovar todos los certificados manualmente
sudo certbot renew

# Renovar un certificado específico
sudo certbot renew --cert-name webfestival.art

# Después de renovar, recargar Nginx
sudo systemctl reload nginx
```

### 12.10 Verificar Calidad del SSL

Desde tu navegador, visita:
```
https://www.ssllabs.com/ssltest/analyze.html?d=api.webfestival.art
```

Deberías obtener una calificación A o A+.

### 12.11 Comandos Útiles de Certbot

```bash
# Ver todos los certificados
sudo certbot certificates

# Eliminar un certificado
sudo certbot delete --cert-name webfestival.art

# Renovar certificados próximos a vencer
sudo certbot renew

# Revocar un certificado
sudo certbot revoke --cert-name webfestival.art

# Expandir certificado (añadir más dominios)
sudo certbot --nginx -d webfestival.art -d nuevo.webfestival.art
```

---

## Paso 13: Verificación Final y Reinicio Automático

### 13.1 Resumen de Servicios y Sus Puertos

```bash
# Ver todos los puertos escuchando
sudo ss -tlnp

# Lista de servicios y puertos:
# PostgreSQL: 5432 (localhost)
# API Node.js: 3001 (localhost) - via PM2
# Immich: 2283 (localhost) - via Docker
# Webmin: 10000 (localhost)
# Nginx: 80, 443 (público)
```

### 13.2 Verificar Todos los Servicios

```bash
echo "======================================"
echo "Verificación de Servicios"
echo "======================================"

# PostgreSQL
echo ""
echo "1. PostgreSQL:"
sudo systemctl status postgresql | grep Active

# Docker
echo ""
echo "2. Docker:"
sudo systemctl status docker | grep Active

# Immich
echo ""
echo "3. Immich (Docker Compose):"
cd ~/immich && docker compose ps

# PM2 / API
echo ""
echo "4. PM2 / API Node.js:"
pm2 status

# Nginx
echo ""
echo "5. Nginx:"
sudo systemctl status nginx | grep Active

# Webmin
echo ""
echo "6. Webmin:"
sudo systemctl status webmin | grep Active

# Certbot Timer
echo ""
echo "7. Certbot (Renovación SSL):"
sudo systemctl status certbot.timer | grep Active
```

### 13.3 Verificar Reinicio Automático

Todos los servicios deben tener `enabled` para iniciar automáticamente:

```bash
# Verificar servicios habilitados
systemctl list-unit-files | grep enabled | grep -E 'postgresql|docker|nginx|webmin|pm2|certbot'
```

### 13.4 Probar Reinicio del Servidor

```bash
# Guardar estado actual de PM2
pm2 save

# Verificar configuración de inicio
sudo systemctl status pm2-serverdata

# Reiniciar el servidor para probar
sudo reboot
```

**Esperar 2-3 minutos y reconectar:**

```bash
# Reconectar por SSH
ssh serverdata@200.14.41.62

# Verificar todos los servicios
sudo systemctl status postgresql
sudo systemctl status docker
sudo systemctl status nginx
sudo systemctl status webmin
pm2 list
cd ~/immich && docker compose ps
```

### 13.5 Crear Script de Verificación Completa

```bash
# Crear script de verificación
nano ~/check-services.sh
```

**Contenido:**

```bash
#!/bin/bash

echo "========================================="
echo "  Verificación de Servicios WebFestival"
echo "  IP: 200.14.41.62"
echo "========================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

check_service() {
    if systemctl is-active --quiet $1; then
        echo -e "${GREEN}✓${NC} $2: Activo"
    else
        echo -e "${RED}✗${NC} $2: Inactivo"
    fi
}

# Servicios del sistema
echo "Servicios del Sistema:"
check_service postgresql "PostgreSQL"
check_service docker "Docker"
check_service nginx "Nginx"
check_service webmin "Webmin"
check_service pm2-serverdata "PM2"
check_service certbot.timer "Certbot Timer"

# PM2
echo ""
echo "Procesos PM2:"
pm2 list

# Docker
echo ""
echo "Contenedores Docker:"
cd ~/immich && docker compose ps

# Puertos
echo ""
echo "Puertos Escuchando:"
sudo ss -tlnp | grep -E ':80|:443|:3001|:2283|:5432|:10000' | awk '{print $4}' | sort | uniq

# URLs
echo ""
echo "URLs del Proyecto:"
echo "  • API:    https://api.webfestival.art"
echo "  • App:    https://app.webfestival.art"
echo "  • Medios: https://medios.webfestival.art"
echo "  • Webmin: https://webmin.webfestival.art"

# SSL
echo ""
echo "Certificados SSL:"
sudo certbot certificates 2>/dev/null | grep "Expiry Date" | head -1

echo ""
echo "========================================="
```

**Guardar:** `Ctrl + X`, `Y`, `Enter`

```bash
# Dar permisos de ejecución
chmod +x ~/check-services.sh

# Ejecutar el script
~/check-services.sh
```

### 13.6 Comandos de Mantenimiento Rápido

```bash
# Reiniciar todos los servicios
sudo systemctl restart postgresql
sudo systemctl restart docker
sudo systemctl restart nginx
sudo systemctl restart webmin
pm2 restart all
cd ~/immich && docker compose restart

# Ver logs de todos los servicios
sudo journalctl -u postgresql -f
sudo journalctl -u nginx -f
pm2 logs
cd ~/immich && docker compose logs -f

# Ver uso de recursos
htop
docker stats
pm2 monit
```

### 13.7 Configuración de Backups Automáticos

```bash
# Crear directorio para backups
mkdir -p ~/backups

# Crear script de backup
nano ~/backups/backup.sh
```

**Contenido del script de backup:**

```bash
#!/bin/bash

# Configuración
BACKUP_DIR=~/backups
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

echo "========================================="
echo "Iniciando Backup - $DATE"
echo "========================================="

# Crear directorio para el backup de hoy
mkdir -p $BACKUP_DIR/$DATE

# 1. Backup de Base de Datos PostgreSQL
echo "1. Backup de PostgreSQL..."
PGPASSWORD=wasi3355 pg_dump -U postgres -h localhost webfestival > $BACKUP_DIR/$DATE/webfestival_db.sql
echo "✓ Base de datos respaldada"

# 2. Backup de configuraciones de Nginx
echo "2. Backup de Nginx..."
sudo cp -r /etc/nginx/sites-available $BACKUP_DIR/$DATE/nginx-sites
echo "✓ Configuración de Nginx respaldada"

# 3. Backup de Base de Datos de Immich
echo "3. Backup de Immich DB..."
cd ~/immich
docker compose exec -T database pg_dumpall -U postgres > $BACKUP_DIR/$DATE/immich_db.sql
echo "✓ Base de datos de Immich respaldada"

# 4. Backup de archivos de Immich (fotos/videos)
echo "4. Backup de archivos de Immich..."
echo "⚠ NOTA: Este proceso puede tardar mucho tiempo dependiendo del tamaño"
# Descomenta la siguiente línea si quieres hacer backup de fotos/videos
# tar -czf $BACKUP_DIR/$DATE/immich-data.tar.gz ~/immich-data
echo "⊘ Backup de archivos multimedia deshabilitado (muy grande)"

# 5. Backup de código de la API
echo "5. Backup de código API..."
tar -czf $BACKUP_DIR/$DATE/api-code.tar.gz ~/api
echo "✓ Código de API respaldado"

# 6. Backup de código de la App
echo "6. Backup de código App..."
tar -czf $BACKUP_DIR/$DATE/app-code.tar.gz ~/app
echo "✓ Código de App respaldado"

# 7. Backup de configuración de PM2
echo "7. Backup de PM2..."
cp ~/.pm2/dump.pm2 $BACKUP_DIR/$DATE/pm2-dump.pm2
echo "✓ Configuración de PM2 respaldada"

# 8. Comprimir todo el backup
echo "8. Comprimiendo backup completo..."
cd $BACKUP_DIR
tar -czf backup-$DATE.tar.gz $DATE
rm -rf $DATE
echo "✓ Backup comprimido"

# 9. Limpiar backups antiguos
echo "9. Limpiando backups antiguos (más de $RETENTION_DAYS días)..."
find $BACKUP_DIR -name "backup-*.tar.gz" -mtime +$RETENTION_DAYS -delete
echo "✓ Backups antiguos eliminados"

# Tamaño del backup
BACKUP_SIZE=$(du -sh $BACKUP_DIR/backup-$DATE.tar.gz | cut -f1)

echo ""
echo "========================================="
echo "✅ Backup completado exitosamente"
echo "Archivo: backup-$DATE.tar.gz"
echo "Tamaño: $BACKUP_SIZE"
echo "Ubicación: $BACKUP_DIR"
echo "========================================="
```

**Guardar:** `Ctrl + X`, `Y`, `Enter`

```bash
# Dar permisos de ejecución
chmod +x ~/backups/backup.sh

# Probar el script de backup
~/backups/backup.sh

# Ver backups creados
ls -lh ~/backups/
```

### 13.8 Automatizar Backups con Cron

```bash
# Editar crontab
crontab -e

# Si es la primera vez, seleccionar nano (opción 1)
```

**Añadir al final del archivo:**

```cron
# Backup diario a las 2:00 AM
0 2 * * * /home/serverdata/backups/backup.sh >> /home/serverdata/backups/backup.log 2>&1

# Verificar servicios cada hora
0 * * * * /home/serverdata/check-services.sh >> /home/serverdata/check-services.log 2>&1
```

**Guardar:** `Ctrl + X`, `Y`, `Enter`

```bash
# Verificar que se configuró el cron
crontab -l

# Ver logs de cron
tail -f ~/backups/backup.log
```

### 13.9 Script de Restauración de Backup

```bash
# Crear script de restauración
nano ~/backups/restore.sh
```

**Contenido:**

```bash
#!/bin/bash

if [ -z "$1" ]; then
    echo "Uso: ./restore.sh backup-YYYYMMDD_HHMMSS.tar.gz"
    echo ""
    echo "Backups disponibles:"
    ls -lh ~/backups/backup-*.tar.gz
    exit 1
fi

BACKUP_FILE=$1
BACKUP_DIR=~/backups
RESTORE_DIR=$BACKUP_DIR/restore_temp

echo "========================================="
echo "Restaurando desde: $BACKUP_FILE"
echo "========================================="

# Crear directorio temporal
mkdir -p $RESTORE_DIR

# Descomprimir backup
echo "Descomprimiendo backup..."
tar -xzf $BACKUP_DIR/$BACKUP_FILE -C $RESTORE_DIR

# Obtener el nombre del directorio extraído
BACKUP_DATE=$(ls $RESTORE_DIR)

echo ""
echo "Opciones de restauración:"
echo "1. Restaurar base de datos PostgreSQL"
echo "2. Restaurar configuración de Nginx"
echo "3. Restaurar base de datos de Immich"
echo "4. Restaurar código de API"
echo "5. Restaurar código de App"
echo "6. Restaurar configuración de PM2"
echo "7. Restaurar todo"
echo ""
read -p "Selecciona una opción (1-7): " option

case $option in
    1)
        echo "Restaurando base de datos..."
        PGPASSWORD=wasi3355 psql -U postgres -h localhost webfestival < $RESTORE_DIR/$BACKUP_DATE/webfestival_db.sql
        ;;
    2)
        echo "Restaurando configuración de Nginx..."
        sudo cp -r $RESTORE_DIR/$BACKUP_DATE/nginx-sites/* /etc/nginx/sites-available/
        sudo nginx -t && sudo systemctl reload nginx
        ;;
    3)
        echo "Restaurando base de datos de Immich..."
        cd ~/immich
        docker compose exec -T database psql -U postgres < $RESTORE_DIR/$BACKUP_DATE/immich_db.sql
        ;;
    4)
        echo "Restaurando código de API..."
        tar -xzf $RESTORE_DIR/$BACKUP_DATE/api-code.tar.gz -C ~/
        ;;
    5)
        echo "Restaurando código de App..."
        tar -xzf $RESTORE_DIR/$BACKUP_DATE/app-code.tar.gz -C ~/
        ;;
    6)
        echo "Restaurando configuración de PM2..."
        cp $RESTORE_DIR/$BACKUP_DATE/pm2-dump.pm2 ~/.pm2/dump.pm2
        pm2 resurrect
        ;;
    7)
        echo "Restaurando todo..."
        # Ejecutar todas las restauraciones
        ;;
    *)
        echo "Opción inválida"
        ;;
esac

# Limpiar
rm -rf $RESTORE_DIR

echo "✅ Restauración completada"
```

**Guardar:** `Ctrl + X`, `Y`, `Enter`

```bash
# Dar permisos
chmod +x ~/backups/restore.sh
```

### 13.10 Monitoreo del Sistema

```bash
# Crear script de monitoreo
nano ~/monitor.sh
```

**Contenido:**

```bash
#!/bin/bash

echo "========================================="
echo "  Monitor del Sistema WebFestival"
echo "  $(date)"
echo "========================================="

# Uso de CPU
echo ""
echo "CPU:"
top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print "Uso: " 100 - $1"%"}'

# Uso de Memoria
echo ""
echo "Memoria:"
free -h | awk 'NR==2{printf "Uso: %s / %s (%.2f%%)\n", $3,$2,$3*100/$2 }'

# Uso de Disco
echo ""
echo "Disco:"
df -h / | awk 'NR==2{printf "Uso: %s / %s (%s)\n", $3,$2,$5}'

# Uptime
echo ""
echo "Uptime:"
uptime -p

# Servicios
echo ""
echo "Estado de Servicios:"
services=("postgresql" "docker" "nginx" "webmin" "pm2-serverdata")
for service in "${services[@]}"; do
    if systemctl is-active --quiet $service; then
        echo "  ✓ $service"
    else
        echo "  ✗ $service"
    fi
done

# Procesos PM2
echo ""
echo "Procesos PM2:"
pm2 jlist | python3 -m json.tool | grep -E '"name"|"status"|"cpu"|"memory"' | head -12

# Docker
echo ""
echo "Contenedores Docker:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Últimas conexiones SSH
echo ""
echo "Últimas Conexiones SSH:"
last -n 5

# Uso de red
echo ""
echo "Conexiones Activas:"
sudo ss -s

echo ""
echo "========================================="
```

**Guardar:** `Ctrl + X`, `Y`, `Enter`

```bash
# Dar permisos
chmod +x ~/monitor.sh

# Ejecutar
~/monitor.sh
```

### 13.11 Resumen de Configuraciones de Reinicio Automático

✅ **PostgreSQL:** `systemctl enable postgresql`  
✅ **Docker:** `systemctl enable docker`  
✅ **Immich:** `restart: always` en docker-compose.yml  
✅ **PM2/API:** `pm2 startup` + `pm2 save`  
✅ **Nginx:** `systemctl enable nginx`  
✅ **Webmin:** `systemctl enable webmin`  
✅ **Certbot:** `certbot.timer` habilitado automáticamente  

### 13.12 Información de Acceso a los Servicios

```
╔════════════════════════════════════════════════════════════╗
║           INFORMACIÓN DE ACCESO - WEBFESTIVAL              ║
╠════════════════════════════════════════════════════════════╣
║ IP Pública: 200.14.41.62                                   ║
║                                                            ║
║ SERVICIOS WEB:                                             ║
║ • API:           https://api.webfestival.art               ║
║ • Aplicación:    https://app.webfestival.art               ║
║ • Medios:        https://medios.webfestival.art            ║
║ • Webmin:        https://webmin.webfestival.art            ║
║ • Dominio raíz:  https://webfestival.art → redirige a app  ║
║                                                            ║
║ ACCESO SSH:                                                ║
║ • ssh serverdata@200.14.41.62                                  ║
║                                                            ║
║ BASES DE DATOS:                                            ║
║ • PostgreSQL:    localhost:5432                            ║
║   - Base datos:  webfestival                               ║
║   - Usuario:     postgres                                  ║
║   - Password:    wasi3355                                  ║
║                                                            ║
║ SERVICIOS INTERNOS:                                        ║
║ • API Node:      localhost:3001 (PM2)                      ║
║ • Immich:        localhost:2283 (Docker)                   ║
║ • Webmin:        localhost:10000                           ║
║                                                            ║
║ COMANDOS ÚTILES:                                           ║
║ • Verificar:     ~/check-services.sh                       ║
║ • Backup:        ~/backups/backup.sh                       ║
║ • Monitor:       ~/monitor.sh                              ║
║ • Deploy API:    ~/api/deploy.sh                           ║
║ • Deploy App:    ~/app/deploy.sh                           ║
╚════════════════════════════════════════════════════════════╝
```

---

## ANEXO: Automatización con GitHub Actions (Opcional)

Esta sección te permite automatizar los despliegues para que, al hacer `push` a la rama `main`, GitHub se conecte automáticamente a tu servidor y ejecute los scripts de actualización.

### Requisitos Previos:
- Servidor ya configurado y funcionando
- Scripts de deploy creados (`~/api/deploy.sh` y `~/app/deploy.sh`)
- Los servicios deben estar operativos con los pasos anteriores

---

### A.1 Configurar SSH para GitHub Actions

#### A.1.1 Generar Clave SSH Dedicada para GitHub Actions

```bash
# En el servidor, genera una nueva clave SSH específica para GitHub Actions
ssh-keygen -t ed25519 -C "github-actions@webfestival.art" -f ~/.ssh/github_actions_deploy

# Presiona Enter en todas las preguntas (sin contraseña)
```

#### A.1.2 Añadir la Clave a authorized_keys

```bash
# Añadir la clave pública al archivo authorized_keys
cat ~/.ssh/github_actions_deploy.pub >> ~/.ssh/authorized_keys

# Verificar permisos correctos
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/github_actions_deploy
chmod 644 ~/.ssh/github_actions_deploy.pub

# Verificar que se añadió
cat ~/.ssh/authorized_keys | grep github-actions
```

#### A.1.3 Copiar la Clave Privada para GitHub

```bash
# Mostrar la clave privada completa
cat ~/.ssh/github_actions_deploy

# Deberías ver algo como:
# -----BEGIN OPENSSH PRIVATE KEY-----
# b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtz
# ...muchas líneas...
# -----END OPENSSH PRIVATE KEY-----

# COPIA TODO EL CONTENIDO (incluyendo las líneas BEGIN y END)
```

#### A.1.4 Probar la Clave SSH

```bash
# Probar conexión SSH con la nueva clave
ssh -i ~/.ssh/github_actions_deploy serverdata@200.14.41.62 "echo 'Conexión exitosa'"

# Deberías ver: "Conexión exitosa"
```

---

### A.2 Configurar Secrets en GitHub

#### A.2.1 Para el Repositorio de la API

1. Ve a tu repositorio de la API en GitHub: `https://github.com/TU_USUARIO/api`
2. Clic en `Settings` (Configuración)
3. En el menú izquierdo: `Secrets and variables` → `Actions`
4. Clic en `New repository secret`

**Crear los siguientes secrets:**

| Nombre del Secret | Valor |
|-------------------|-------|
| `SSH_PRIVATE_KEY` | Todo el contenido de `~/.ssh/github_actions_deploy` (la clave privada completa) |
| `SERVER_HOST` | `200.14.41.62` |
| `SERVER_USER` | `serverdata` |
| `DEPLOY_PATH` | `/home/serverdata/webfestival-api` |

#### A.2.2 Para el Repositorio de la App

Repetir el proceso en el repositorio de la App: `https://github.com/TU_USUARIO/app`

| Nombre del Secret | Valor |
|-------------------|-------|
| `SSH_PRIVATE_KEY` | La misma clave privada |
| `SERVER_HOST` | `200.14.41.62` |
| `SERVER_USER` | `serverdata` |
| `DEPLOY_PATH` | `/home/serverdata/webfestival-app` |

---

### A.3 Workflow para la API Node.js

#### A.3.1 Crear Directorio de Workflows

En tu **repositorio local de la API**:

```bash
# En tu computadora (no en el servidor)
cd /ruta/a/tu/proyecto/api

# Crear directorio .github/workflows
mkdir -p .github/workflows
```

#### A.3.2 Crear Archivo de Workflow

```bash
# Crear archivo deploy.yml
nano .github/workflows/deploy.yml
```

**Contenido del archivo:**

```yaml
name: Deploy API to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: serverdata-latest
    
    steps:
    - name: 📋 Checkout code
      uses: actions/checkout@v3
      
    - name: 🚀 Deploy to Server
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          echo "======================================"
          echo "🚀 Iniciando despliegue de API"
          echo "======================================"
          cd ${{ secrets.DEPLOY_PATH }}
          
          echo "📥 Descargando cambios..."
          git pull origin main
          
          echo "📦 Instalando dependencias..."
          npm install --production
          
          echo "🔄 Reiniciando servicio..."
          pm2 restart api
          
          echo "✅ Despliegue completado"
          pm2 status api
```

**Guardar:** `Ctrl + X`, `Y`, `Enter`

#### A.3.3 Subir el Workflow a GitHub

```bash
# Añadir el archivo al repositorio
git add .github/workflows/deploy.yml

# Hacer commit
git commit -m "Add: GitHub Actions workflow para deploy automático"

# Subir a GitHub
git push origin main

# Esto disparará el primer despliegue automático
```

---

### A.4 Workflow para la App React

#### A.4.1 Crear Workflow en el Repositorio de la App

En tu **repositorio local de la App**:

```bash
# En tu computadora
cd /ruta/a/tu/proyecto/app

# Crear directorio
mkdir -p .github/workflows

# Crear archivo
nano .github/workflows/deploy.yml
```

**Contenido del archivo:**

```yaml
name: Deploy App to Production

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: serverdata-latest
    
    steps:
    - name: 📋 Checkout code
      uses: actions/checkout@v3
      
    - name: 🚀 Deploy to Server
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          echo "======================================"
          echo "🚀 Iniciando despliegue de App"
          echo "======================================"
          cd ${{ secrets.DEPLOY_PATH }}
          
          echo "📥 Descargando cambios..."
          git pull origin main
          
          echo "📦 Instalando dependencias..."
          npm install
          
          echo "🏗️  Compilando aplicación..."
          npm run build
          
          echo "✅ Despliegue completado"
          echo "Tamaño del build:"
          du -sh build/
```

**Guardar:** `Ctrl + X`, `Y`, `Enter`

#### A.4.2 Subir el Workflow a GitHub

```bash
# Añadir, commit y push
git add .github/workflows/deploy.yml
git commit -m "Add: GitHub Actions workflow para deploy automático"
git push origin main
```

---

### A.5 Verificar que GitHub Actions Funciona

#### A.5.1 Ver la Ejecución en GitHub

1. Ve a tu repositorio en GitHub
2. Clic en la pestaña `Actions`
3. Verás el workflow ejecutándose
4. Clic en el workflow para ver los logs en tiempo real

#### A.5.2 Verificar en el Servidor

```bash
# Conectarse al servidor
ssh serverdata@200.14.41.62

# Ver logs de PM2 (para la API)
pm2 logs api --lines 50

# Ver el build de la App
ls -lt ~/app/build

# Verificar último commit
cd ~/api && git log -1
cd ~/app && git log -1
```

---

### A.6 Workflow Avanzado con Pruebas

#### A.6.1 Workflow con Tests para la API

```yaml
name: Test and Deploy API

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: serverdata-latest
    
    steps:
    - name: 📋 Checkout code
      uses: actions/checkout@v3
      
    - name: 🔧 Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '22'
        
    - name: 📦 Install dependencies
      run: npm ci
      
    - name: 🧪 Run tests
      run: npm test
      
    - name: 🔍 Run linter
      run: npm run lint

  deploy:
    needs: test
    runs-on: serverdata-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: 🚀 Deploy to Server
      uses: appleboy/ssh-action@v1.0.0
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd ${{ secrets.DEPLOY_PATH }}
          git pull origin main
          npm install --production
          pm2 restart api
          
    - name: ✅ Deployment notification
      run: echo "Deployment completed successfully"
```

---

### A.7 Troubleshooting de GitHub Actions

#### Problema 1: "Permission denied (publickey)"

**Solución:**

```bash
# En el servidor, verificar que la clave está en authorized_keys
cat ~/.ssh/authorized_keys | grep github-actions

# Verificar permisos
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# Probar conexión manual
ssh -i ~/.ssh/github_actions_deploy serverdata@200.14.41.62
```

#### Problema 2: "pm2 command not found"

**Solución:** Añadir el PATH correcto en el workflow:

```yaml
script: |
  export PATH=$PATH:/home/serverdata/.npm-global/bin
  export PM2_HOME=/home/serverdata/.pm2
  cd ${{ secrets.DEPLOY_PATH }}
  git pull origin main
  npm install --production
  pm2 restart api
```

#### Problema 3: "npm command not found"

**Solución:**

```yaml
script: |
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  cd ${{ secrets.DEPLOY_PATH }}
  npm install
```

#### Problema 4: El workflow no se dispara

**Verificar:**
1. Que el archivo esté en `.github/workflows/deploy.yml`
2. Que hayas hecho push del archivo a la rama `main`
3. Que los secrets estén configurados correctamente
4. Revisar la pestaña Actions en GitHub

---

### A.8 Comandos Útiles para GitHub Actions

#### A.8.1 Con GitHub CLI

```bash
# Instalar GitHub CLI en el servidor (opcional)
sudo apt install gh

# Autenticarse
gh auth login

# Ver workflows
gh workflow list

# Ejecutar workflow manualmente
gh workflow run deploy.yml

# Ver ejecuciones recientes
gh run list

# Ver logs de la última ejecución
gh run view --log

# Ver estado de un workflow específico
gh run watch
```

#### A.8.2 Ejecutar Workflow Manualmente desde GitHub

1. Ve a tu repositorio en GitHub
2. Clic en `Actions`
3. Selecciona el workflow
4. Clic en `Run workflow`
5. Selecciona la rama y clic en `Run workflow`

---

### A.9 Notificaciones de Deploy (Opcional)

#### A.9.1 Notificaciones por Email

Añadir al final del workflow:

```yaml
    - name: 📧 Send email notification
      if: always()
      uses: dawidd6/action-send-mail@v3
      with:
        server_address: smtp.gmail.com
        server_port: 587
        username: ${{ secrets.EMAIL_USERNAME }}
        password: ${{ secrets.EMAIL_PASSWORD }}
        subject: Deploy ${{ job.status }} - WebFestival API
        body: |
          Deploy Status: ${{ job.status }}
          Repository: ${{ github.repository }}
          Branch: ${{ github.ref }}
          Commit: ${{ github.sha }}
        to: tu@email.com
        from: github-actions@webfestival.art
```

#### A.9.2 Notificaciones a Slack

```yaml
    - name: 📢 Slack Notification
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        text: 'Deploy ${{ job.status }} - API WebFestival'
        webhook_url: ${{ secrets.SLACK_WEBHOOK }}
      if: always()
```

---

## Fin del Documento

**Versión:** 2.0  
**Fecha:** Noviembre 2025  
**Servidor:** serverdata 22.04 LTS  
**IP:** 200.14.41.62  
**Dominios:**
- api.webfestival.art
- app.webfestival.art
- medios.webfestival.art
- webmin.webfestival.art

### Referencias y Documentación

- **Immich:** https://immich.app/docs
- **PM2:** https://pm2.keymetrics.io/docs
- **Nginx:** https://nginx.org/en/docs
- **Let's Encrypt:** https://letsencrypt.org/docs
- **Certbot:** https://certbot.eff.org/instructions
- **PostgreSQL:** https://www.postgresql.org/docs
- **Docker:** https://docs.docker.com
- **Webmin:** https://www.webmin.com/docs.html
- **GitHub Actions:** https://docs.github.com/en/actions

### Soporte y Mantenimiento

Para soporte adicional o actualizaciones de esta guía, consultar la documentación oficial de cada servicio.

**Comandos de Referencia Rápida:**

```bash
# Verificar todos los servicios
~/check-services.sh

# Hacer backup
~/backups/backup.sh

# Monitorear sistema
~/monitor.sh

# Desplegar API
~/api/deploy.sh

# Desplegar App
~/app/deploy.sh

# Ver logs
pm2 logs api
sudo tail -f /var/log/nginx/error.log
cd ~/immich && docker compose logs -f
```

**¡Configuración completada exitosamente!** 🎉


Servicios Configurados:  
✅ API:    https://api.webfestival.art  
✅ App:    https://app.webfestival.art  
✅ Medios: https://medios.webfestival.art  
✅ Webmin: https://webmin.webfestival.art  
✅ SSL:    Let's Encrypt (renovación automática)  
✅ IP:     200.14.41.62

Deploying certificate

Successfully deployed certificate for webfestival.art to /etc/nginx/sites-enabled/webfestival.art
Successfully deployed certificate for www.webfestival.art to /etc/nginx/sites-enabled/webfestival.art
Successfully deployed certificate for api.webfestival.art to /etc/nginx/sites-enabled/webfestival.art
Successfully deployed certificate for app.webfestival.art to /etc/nginx/sites-enabled/webfestival.art
Successfully deployed certificate for medios.webfestival.art to /etc/nginx/sites-enabled/webfestival.art
Successfully deployed certificate for webmin.webfestival.art to /etc/nginx/sites-enabled/webfestival.art
Congratulations! You have successfully enabled HTTPS on https://webfestival.art, https://www.webfestival.art, https://api.webfestival.art, https://app.webfestival.art, https://medios.webfestival.art, and https://webmin.webfestival.art
