> **Referencia alternativa** — Este documento describe la instalación **nativa** de Immich (sin Docker, usando systemd directamente en el SO).
> El proyecto WebFestival usa Immich **en Docker** (ver `docker-compose.yml` y `document/implementacion.md` sección 9).
> Este documento se conserva como referencia en caso de necesitar migrar a una instalación nativa en el futuro.

---

# Instalación nativa de Immich en Ubuntu 22.04

Estas instrucciones usan el repositorio arter97/immich‑native que prepara scripts y servicios systemd para correr Immich sin contenedores. 

1. Preparativos previos

Actualizar sistema:
```sh
sudo apt update
sudo apt upgrade -y
```

Instalar herramientas básicas:
```sh
sudo apt install -y curl wget git build-essential \
    python3 python3‑venv python3‑dev \
    unzip uuid-runtime jq
```
2. Crear usuario dedicado y directorio de instalación

Para mayor seguridad, crea un usuario immich sin permisos de login interactivo:
```sh
sudo adduser --home /var/lib/immich/home --shell /sbin/nologin \
    --no-create-home --disabled-password --disabled-login immich
```

Crear directorio base:
```sh
sudo mkdir -p /var/lib/immich
sudo chown immich:immich /var/lib/immich
sudo chmod 700 /var/lib/immich
```
3. Instalar dependencias necesarias del sistema

Estas son algunas de las dependencias que el proyecto “native” sugiere. 

# PostgreSQL + pgvector
```sh
sudo apt install -y postgresql postgresql‑pgvector

# Redis
sudo apt install -y redis-server

# FFmpeg (versión reciente)
# Dependiendo de lo que haya en los repositorios, puede que la versión de Ubuntu no sea suficiente.
# A veces se añade el repositorio de Jellyfin para obtener ffmpeg actualizado
sudo apt install -y ffmpeg

# Node.js (LTS). Usar NodeSource u otra fuente para obtener algo reciente:
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

# Otras dependencias (Build tools, utilidades, etc.)
sudo apt install -y python3‑venv uuid-runtime unzip jq
```
4. Configurar la base de datos PostgreSQL

Crear base de datos y usuario para Immich:
```sh
sudo -u postgres psql
```

Dentro del prompt de PostgreSQL:
```sh
CREATE DATABASE immich;
CREATE USER immich WITH ENCRYPTED PASSWORD 'TU_CONTRASEÑA_SEGURA';
GRANT ALL PRIVILEGES ON DATABASE immich TO immich;
-- habilitar la extensión vector
\c immich
CREATE EXTENSION IF NOT EXISTS vector;
\q
```
5. Clonar el repositorio “immich‑native”
```sh
cd /tmp
git clone https://github.com/arter97/immich-native.git
cd immich-native
```
6. Preparar el archivo de entorno (env)

Dentro del repositorio clonado, hay un archivo llamado env que deberías copiar al directorio de instalación y editarlo con tus configuraciones.
```sh
sudo cp env /var/lib/immich/env
sudo chown immich:immich /var/lib/immich/env
```

Editar /var/lib/immich/env para ajustar valores como:
```sh
DB_USERNAME=immich
DB_PASSWORD=TU_CONTRASEÑA
UPLOAD_LOCATION=/var/lib/immich/library (o donde guardes las fotos)
IMMICH_HOST=0.0.0.0 o 127.0.0.1 dependiendo de si quieres acceso externo
```
Otros que veas en ese archivo según lo que el repositorio pide. 

7. Crear los directorios para almacenamiento de medios

Por ejemplo:
```sh
sudo mkdir -p /var/lib/immich/library
sudo chown -R immich:immich /var/lib/immich/library
```

Y cualquier otro directorio que el repositorio native indique (thumbnails, cache, modelos ML, etc.). 

8. Ejecutar el script de instalación

Dentro del directorio clonado:
```sh 
cd immich-native
sudo ./install.sh
```

Este script hará cosas como:

Clonar el código de Immich

Construir los componentes (backend, microservicios, ML si lo usas)

Crear un entorno virtual de Python para el componente ML

Copiar archivos al directorio de instalación (/var/lib/immich)

Instalar servicios systemd para arrancar automáticamente los distintos componentes. 

9. Configurar systemd para los servicios

Después de correr install.sh, debes instalar los servicios de systemd que vienen en el repo:

```sh
sudo cp immich*.service /etc/systemd/system/
sudo systemctl daemon-reload

# Habilitar y arrancar los servicios
sudo systemctl enable immich.service
sudo systemctl enable immich-microservices.service
sudo systemctl enable immich-machine-learning.service

sudo systemctl start immich.service
sudo systemctl start immich-microservices.service
sudo systemctl start immich-machine-learning.service

10. Verificar que todo esté corriendo
```
Verificar estado de los servicios:
```sh
systemctl status immich.service
systemctl status immich-microservices.service
systemctl status immich-machine-learning.service
```

Verificar que PostgreSQL y Redis estén activos

Probar accesar el servidor desde navegador:
```sh
http://<IP_DE_TU_SERVIDOR>:2283
```

(El puerto puede variar; es el que se pone en el archivo env o lo que el install script configure). 

11. Configurar seguridad / acceso externo

Si el servidor va a estar accesible desde internet, configura un proxy inverso (por ejemplo Nginx) con HTTPS.

Asegurar firewall: permitir solo los puertos necesarios.

Asegurar permisos de los archivos / directorios para evitar accesos no deseados.

12. Actualizaciones y mantenimiento

Para actualizar Immich nativo, usualmente clonando de nuevo o usando install.sh con una versión nueva (modificar variable de versión si así lo permite). 

Respaldar la base de datos (pg_dump) y los archivos de la biblioteca de medios regularmente.

Monitorear logs: journalctl -u immich.service, etc.

## Script: install_immich_native.sh

✅ IMPORTANTE: antes de ejecutar este script:

Revísalo completamente.
Asegúrate de cambiar las contraseñas por las tuyas.
Ejecuta con privilegios de root o con sudo.

```bash 
#!/bin/bash

# Immich native installer for Ubuntu 22.04
# by ChatGPT, based on https://github.com/arter97/immich-native

set -e

# 1. Variables
IMMICH_USER="immich"
IMMICH_HOME="/var/lib/immich"
IMMICH_DB_PASS="cambia_esta_password"
NODE_VERSION="lts"

# 2. Crear usuario inmich
echo ">>> Creando usuario y directorio..."
sudo adduser --home "$IMMICH_HOME/home" --shell /sbin/nologin --disabled-password --disabled-login "$IMMICH_USER" || true
sudo mkdir -p "$IMMICH_HOME"
sudo chown "$IMMICH_USER:$IMMICH_USER" "$IMMICH_HOME"
sudo chmod 700 "$IMMICH_HOME"

# 3. Instalar dependencias
echo ">>> Instalando dependencias del sistema..."
sudo apt update
sudo apt install -y \
  curl wget git build-essential \
  python3 python3-venv python3-dev \
  unzip uuid-runtime jq \
  ffmpeg redis-server postgresql postgresql-15-pgvector

# Instalar Node.js LTS
echo ">>> Instalando Node.js LTS..."
curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Configurar PostgreSQL
echo ">>> Configurando PostgreSQL..."
sudo -u postgres psql <<EOF
CREATE DATABASE immich;
CREATE USER immich WITH ENCRYPTED PASSWORD '$IMMICH_DB_PASS';
GRANT ALL PRIVILEGES ON DATABASE immich TO immich;
\c immich
CREATE EXTENSION IF NOT EXISTS vector;
EOF

# 5. Clonar immich-native
cd /tmp
git clone https://github.com/arter97/immich-native.git
cd immich-native

# 6. Configurar archivo env
echo ">>> Configurando archivo .env..."
sudo cp env "$IMMICH_HOME/env"
sudo chown $IMMICH_USER:$IMMICH_USER "$IMMICH_HOME/env"
sudo sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$IMMICH_DB_PASS/" "$IMMICH_HOME/env"
sudo sed -i "s/UPLOAD_LOCATION=.*/UPLOAD_LOCATION=$IMMICH_HOME\/library/" "$IMMICH_HOME/env"

# 7. Crear carpetas necesarias
echo ">>> Creando carpetas para biblioteca de fotos..."
sudo mkdir -p "$IMMICH_HOME/library"
sudo chown -R $IMMICH_USER:$IMMICH_USER "$IMMICH_HOME/library"

# 8. Ejecutar script de instalación
echo ">>> Ejecutando script de instalación de Immich..."
sudo ./install.sh

# 9. Instalar servicios systemd
echo ">>> Instalando servicios systemd..."
sudo cp immich*.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable immich.service
sudo systemctl enable immich-microservices.service
sudo systemctl enable immich-machine-learning.service
sudo systemctl start immich.service
sudo systemctl start immich-microservices.service
sudo systemctl start immich-machine-learning.service

echo ">>> Immich instalado exitosamente."
echo "Accede desde: http://<IP_DEL_SERVIDOR>:2283"
```