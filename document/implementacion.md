# Guía de Despliegue: Servidor Ubuntu Multi-Servicio (Immich, API Node, React)

Este documento detalla el proceso paso a paso para configurar un servidor Ubuntu con los siguientes servicios:
- **Immich:** (Docker) Para gestión de fotos y videos en `fotos.webfestival.art`.
- **API Node.js:** (PM2) Servicio personalizado en `api.webfestival.art`, desplegado desde GitHub.
- **App React:** (Nginx) Landing page en `app.webfestival.art`, desplegada desde GitHub.
- **PostgreSQL:** Base de datos nativa para la API Node.js.
- **Nginx:** Reverse proxy para gestionar todos los dominios y aplicar SSL.

## Paso 1: Configuración DNS

En el panel de control de tu proveedor de dominio (`webfestival.art`):

1.  Apunta tu IP pública del servidor a los siguientes **Récords A**:
    * **Tipo:** `A` | **Nombre:** `@` | **Valor:** `[TU_IP_PUBLICA]`
    * **Tipo:** `A` | **Nombre:** `app` | **Valor:** `[TU_IP_PUBLICA]`
    * **Tipo:** `A` | **Nombre:** `api` | **Valor:** `[TU_IP_PUBLICA]`
    * **Tipo:** `A` | **Nombre:** `fotos` | **Valor:** `[TU_IP_PUBLICA]`

(La propagación de DNS puede tardar de unos minutos a unas horas).

---

## Paso 2: Preparación del Servidor Ubuntu

1.  **Actualizar el sistema:**
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```
2.  **Instalar herramientas esenciales:**
    ```bash
    # git: Para clonar tus repos
    # nginx: Nuestro reverse proxy
    # curl: Para descargar instaladores
    sudo apt install -y git nginx curl
    ```
3.  **Instalar Node.js (v20 sugerida):**
    ```bash
    curl -fsSL [https://deb.nodesource.com/setup_20.x](https://deb.nodesource.com/setup_20.x) | sudo -E bash -
    sudo apt install -y nodejs
    ```
4.  **Instalar PM2 (Gestor de procesos de Node):**
    ```bash
    sudo npm install -g pm2
    ```
5.  **Configurar el Firewall (UFW):**
    Solo permitiremos SSH (para ti) y Nginx (que gestionará el tráfico web).
    ```bash
    sudo ufw allow OpenSSH         # Puerto 22 (Acceso SSH)
    sudo ufw allow 'Nginx Full'   # Puertos 80 (HTTP) y 443 (HTTPS)
    sudo ufw enable               # Activa el firewall
    ```
    *Nota: Los puertos 3001 (API), 2283 (Immich) y 5432 (Postgres) **NO** se abren aquí.*

---

## Paso 3: Instalar PostgreSQL (Base de Datos para la API)

1.  **Instalar PostgreSQL:**
    ```bash
    sudo apt install -y postgresql postgresql-contrib
    ```
2.  **Crear la base de datos y el usuario para tu API:**
    ```bash
    sudo -u postgres psql
    ```
3.  Dentro de la consola de `psql`, ejecuta:
    ```sql
    CREATE DATABASE mi_api;
    CREATE USER mi_api_user WITH PASSWORD 'TuContraseñaSeguraAqui';
    GRANT ALL PRIVILEGES ON DATABASE mi_api TO mi_api_user;
    \q
    ```
4.  Tu API usará esta URL de conexión: `postgresql://mi_api_user:TuContraseñaSeguraAqui@localhost:5432/mi_api`

---

## Paso 4: Instalar Immich con Docker

1.  **Instalar Docker y Docker Compose:**
    ```bash
    sudo apt install -y docker.io docker-compose
    ```
2.  **Clonar el repositorio de Immich:**
    ```bash
    git clone [https://github.com/immich/immich.git](https://github.com/immich/immich.git)
    cd immich/docker
    ```
3.  **Configurar Immich:**
    Copia el archivo de ejemplo `.env`:
    ```bash
    cp .env.example .env
    ```
    Edita el archivo `.env` (`nano .env`) y define tus contraseñas (ej: `DB_PASSWORD`) y la ruta donde se guardarán las fotos (ej: `UPLOAD_LOCATION=/home/ubuntu/immich-data`).
    *Importante: Asegúrate de que esa carpeta exista (`mkdir -p /home/ubuntu/immich-data`).*

4.  **Iniciar Immich:**
    ```bash
    sudo docker-compose up -d
    ```
    Immich se ejecutará y expondrá su servicio web, por defecto, en el puerto local `2283`.

---

## Paso 5: Configurar Acceso a GitHub (Deploy Keys)

Haremos que tu servidor pueda clonar tus repositorios privados de forma segura.

1.  **En el Servidor:** Genera una nueva clave SSH.
    ```bash
    # Presiona Enter en todas las preguntas (para no poner contraseña)
    ssh-keygen -t rsa -b 4096 -C "deploy@webfestival.art"
    ```
2.  **En el Servidor:** Muestra la clave pública.
    ```bash
    cat ~/.ssh/id_rsa.pub
    ```
    Copia todo el contenido (empieza con `ssh-rsa...` y termina con `...deploy@webfestival.art`).

3.  **En GitHub (Repite para la API y la App):**
    * Ve a tu repositorio (ej: el de la API).
    * Ve a `Settings` > `Security` > `Deploy Keys`.
    * Haz clic en `Add deploy key`.
    * **Title:** `servidor-ubuntu-prod`
    * **Key:** Pega la clave pública que copiaste.
    * **Importante:** *No* marques "Allow write access". Solo necesitamos leer.
    * Haz clic en `Add key`.

4.  **En el Servidor:** Clona tus proyectos (primera vez).
    *Asegúrate de usar la URL SSH, no la HTTPS.*

    ```bash
    # Clonar la API
    git clone git@github.com:tu-usuario/tu-repo-api.git /home/ubuntu/mi-api
    
    # Clonar la Landing Page
    git clone git@github.com:tu-usuario/tu-repo-landing.git /home/ubuntu/mi-landing
    ```

---

## Paso 6: Desplegar la API (Node.js)

1.  **Instalar dependencias:**
    ```bash
    cd /home/ubuntu/mi-api
    npm install
    ```
2.  **Configurar variables de entorno:**
    Crea un archivo `.env` en `/home/ubuntu/mi-api`:
    ```
    PORT=3001
    DATABASE_URL="postgresql://mi_api_user:TuContraseñaSeguraAqui@localhost:5432/mi_api"
    # ...otras variables que necesites (JWT_SECRET, etc.)
    ```
3.  **Iniciar con PM2:** (Asumiendo que tu archivo principal es `index.js` o `server.js`)
    ```bash
    pm2 start index.js --name "api-festival"
    ```
4.  **Guardar la configuración de PM2:** (Para que reinicie con el servidor)
    ```bash
    pm2 save
    ```

### Proceso de Actualización (Despliegue) de la API

Cuando subas cambios a GitHub, solo necesitas hacer esto en el servidor:
```bash
cd /home/ubuntu/mi-api
git pull
npm install # (Por si actualizaste paquetes)
pm2 restart api-festival
```
## Paso 7: Desplegar la App (React)
1. Instalar dependencias y compilar:

```bash
cd /home/ubuntu/mi-landing
npm install
npm run build
```

Esto crea la carpeta /home/ubuntu/mi-landing/build que Nginx servirá.

Proceso de Actualización (Despliegue) de la App
Cuando subas cambios a GitHub:
```bash
cd /home/ubuntu/mi-landing
git pull
npm install
npm run build
```

(Nginx servirá automáticamente los nuevos archivos de la carpeta build, no necesita reiniciarse).

## Paso 8: Configurar Nginx (Reverse Proxy)

1. Crea el archivo de configuración para tu sitio:
```bash
sudo nano /etc/nginx/sites-available/webfestival.art
```

2. Pega la siguiente configuración (ajusta puertos y rutas si es necesario):

```bash
# 1. API (Node.js) en api.webfestival.art
server {
    listen 80;
    server_name api.webfestival.art;

    location / {
        proxy_pass http://localhost:3001; # Puerto de tu API (PM2)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 2. LANDING PAGE (React) en app.webfestival.art
server {
    listen 80;
    server_name app.webfestival.art;

    root /home/ubuntu/mi-landing/build; # Ruta a tu 'build' de React
    index index.html index.htm;

    location / {
        # Esencial para que React Router funcione
        try_files $uri $uri/ /index.html;
    }
}

# 3. IMMICH en fotos.webfestival.art
server {
    listen 80;
    server_name fotos.webfestival.art;

    # OJO: Necesario para subir archivos grandes (videos)
    client_max_body_size 50000M; # 50 Gigas (ajusta según necesites)

    location / {
        proxy_pass http://localhost:2283; # Puerto de Immich (Docker)

        # Headers necesarios para Immich
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        send_timeout 300s;
    }
}

# 4. REDIRECCIÓN del dominio raíz (webfestival.art)
server {
    listen 80;
    server_name webfestival.art;
    return 301 [http://app.webfestival.art](http://app.webfestival.art)$request_uri;
}
```

3.Activar la configuración:
```bash
# Habilitamos el sitio
sudo ln -s /etc/nginx/sites-available/webfestival.art /etc/nginx/sites-enabled/

# (Opcional) Borramos la configuración por defecto
sudo rm /etc/nginx/sites-enabled/default

# Probamos la sintaxis
sudo nginx -t

# Reiniciamos Nginx
sudo systemctl restart nginx
```

## Paso 9: Configurar HTTPS (SSL) con Certbot

1. Instalar Certbot:
```bash
sudo apt install -y certbot python3-certbot-nginx
```
2. Obtener y configurar los certificados: Certbot leerá tu archivo de Nginx y configurará todo automáticamente.
```bash
sudo certbot --nginx
```

3. Sigue las instrucciones:

- Ingresa tu email.
- Acepta los Términos de Servicio.
- Te mostrará una lista de tus dominios (api., app., fotos., webfestival.art). Selecciona todos.
- Te preguntará si quieres redirigir todo el tráfico HTTP a HTTPS. Elige la opción 2 (Redirigir).

¡Listo! Certbot obtiene los certificados y configura la renovación automática.

### Sugerencias Adicionales

Backups: Tu servidor es ahora crítico.

- Immich: Sigue la guía oficial para respaldar la BBDD de Docker y, lo más importante, tu carpeta UPLOAD_LOCATION (ej: /home/ubuntu/immich-data).

- API DB: Automatiza un pg_dump de tu base mi_api diariamente.

- Automatización (Próximo Nivel): Cuando te canses de hacer git pull manualmente, el siguiente paso es implementar GitHub Actions. Puedes configurar un workflow que, al hacer push a la rama main, se conecte a tu servidor vía SSH y ejecute los comandos de actualización automáticamente.