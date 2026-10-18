# OPERACIÓN DE CONTENEDORES Y BASE DE DATOS

Guía práctica para administrar los contenedores de las aplicaciones y la base
de datos en el VPS, revisar errores y resolver incidencias comunes.

- **Servidor:** `evolucion-col`
- **Directorio del stack principal:** `/opt/webfestival/`
- **Infraestructura compartida (Traefik / Portainer):** `/opt/traefik/`
- **Servicio de correo (Mailcow):** `/opt/servicio-mail/`

> Casi todos los comandos se ejecutan desde `/opt/webfestival`. Cuando un
> comando no dependa del directorio (p. ej. `docker logs`, `docker exec`),
> puede correrse desde cualquier ruta.

---

## Mapa de contenedores

| Servicio (compose) | Contenedor | Imagen base | Rol |
|---|---|---|---|
| `postgres` | `wf-postgres` | `postgres:16-alpine` | Base de datos principal |
| `redis` | `wf-redis` | `redis:7-alpine` | Cache y sesiones |
| `api` | `wf-api` | `webfestival-api:latest` | API Node.js / Express (puerto 3000) |
| `app` | `wf-app` | `webfestival-app:latest` | Frontend React servido por Nginx (puerto 80) |
| `immich-server` | `wf-immich-server` | `immich-server:release` | Gestión de fotos y videos (puerto 2283) |
| `immich-machine-learning` | `wf-immich-ml` | `immich-machine-learning:release` | Modelos ML de Immich |
| `immich-postgres` | `wf-immich-postgres` | `pgvecto-rs:pg16` | Base de datos de Immich |
| `immich-redis` | `wf-immich-redis` | `redis:7-alpine` | Redis de Immich |

**Redes:**
- `wf-internal` — red interna privada (DB, Redis, API, Immich). No expuesta.
- `traefik-proxy` — red externa compartida; expone API, APP e Immich por HTTPS.
- `mailcow-network` — red externa del stack de correo para que la API envíe mail.

**Dominios públicos:**
- `https://api.webfestival.art` → `wf-api`
- `https://app.webfestival.art` → `wf-app`
- `https://medios.webfestival.art` → `wf-immich-server`
- `https://mail.webfestival.art` → Mailcow

---

## Estado de los contenedores

```bash
cd /opt/webfestival

# Estado de los servicios de este stack (incluye salud y puertos)
docker compose ps

# Todos los contenedores del servidor (corriendo y detenidos)
docker ps -a

# Solo estado de salud de un contenedor concreto
docker inspect --format '{{.State.Health.Status}}' wf-api

# Uso de CPU / memoria en vivo (Ctrl+C para salir)
docker stats

# Uso de disco de Docker (imágenes, volúmenes, build cache)
docker system df
```

---

## Arrancar, detener y reiniciar

```bash
cd /opt/webfestival

# Levantar todo el stack en segundo plano
docker compose up -d

# Levantar / actualizar solo las apps
docker compose up -d api app

# Reiniciar un servicio (sin reconstruir)
docker compose restart api
# o por nombre de contenedor
docker restart wf-api

# Detener un servicio (mantiene el contenedor)
docker compose stop app

# Detener y eliminar contenedores del stack (NO borra los datos en bind mounts)
docker compose down

# Detener TODO el stack rápidamente
docker compose stop
```

> Los datos de PostgreSQL, Redis e Immich viven en bind mounts bajo
> `/opt/data/...`, por lo que `docker compose down` **no** borra la base de
> datos ni las imágenes. Solo se recrean los contenedores.

---

## Ver logs y errores

```bash
# Últimas 50 líneas de la API
docker logs wf-api --tail 50

# Seguir logs en vivo (Ctrl+C para salir)
docker logs wf-api -f

# Logs desde una marca de tiempo o por ventana de tiempo
docker logs wf-api --since 30m
docker logs wf-api --since 2025-01-01T08:00:00

# Combinar: seguir en vivo mostrando solo lo reciente
docker logs wf-api -f --tail 100

# Logs de varios servicios a la vez con compose
cd /opt/webfestival
docker compose logs -f api app

# Buscar errores concretos en los logs de la API
docker logs wf-api --tail 500 2>&1 | grep -iE "error|exception|fail|unhandled"

# Logs del frontend (Nginx). Suele ser poco verboso.
docker logs wf-app --tail 50

# Logs de la base de datos (útil ante caídas o conexiones rechazadas)
docker logs wf-postgres --tail 50
```

**Interpretar rápido:**
- `ECONNREFUSED` / `connect ECONNREFUSED postgres:5432` en `wf-api` → la DB no
  está lista o está caída. Revisar `docker compose ps` y los logs de
  `wf-postgres`.
- `JWT secrets are required` en `wf-api` → faltan variables `JWT_SECRET` /
  `JWT_REFRESH_SECRET` en el `.env`. Ver sección de variables de entorno.
- La API reinicia en bucle (`Restarting` en `docker compose ps`) → leer las
  primeras líneas del log con `docker logs wf-api --tail 100` para ver el error
  de arranque real.

---

## Entrar a un contenedor (shell)

```bash
# Shell interactiva en la API (Node, Alpine → usa sh)
docker exec -it wf-api sh

# Ejecutar un comando puntual sin abrir shell
docker exec wf-api node -v
docker exec wf-api printenv NODE_ENV

# Shell en el contenedor de base de datos
docker exec -it wf-postgres sh
```

---

## Base de datos (PostgreSQL)

El usuario, contraseña y nombre de base vienen del `.env`
(`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`). En los ejemplos se usa
`postgres` / `webfestival`; ajústalos a tus valores reales.

```bash
# Abrir consola psql dentro del contenedor
docker exec -it wf-postgres psql -U postgres -d webfestival

# Ejecutar una consulta suelta
docker exec wf-postgres psql -U postgres -d webfestival -c "SELECT count(*) FROM usuario;"

# Listar tablas / describir una tabla
docker exec wf-postgres psql -U postgres -d webfestival -c "\dt"
docker exec wf-postgres psql -U postgres -d webfestival -c "\d usuario"

# Ver valores de un enum
docker exec wf-postgres psql -U postgres -d webfestival -c "SELECT unnest(enum_range(NULL::\"Role\"));"

# Ver conexiones activas
docker exec wf-postgres psql -U postgres -d webfestival -c \
  "SELECT pid, state, query FROM pg_stat_activity WHERE datname = 'webfestival';"
```

Comandos útiles dentro de `psql`: `\dt` (tablas), `\d tabla` (estructura),
`\du` (usuarios/roles), `\l` (bases de datos), `\q` (salir).

### Verificar que la DB responde

```bash
# Chequeo de disponibilidad (lo mismo que usa el healthcheck)
docker exec wf-postgres pg_isready -U postgres -d webfestival
```

### Respaldo (backup) y restauración

```bash
# Backup completo a un archivo .sql con fecha
docker exec wf-postgres pg_dump -U postgres webfestival \
  > /opt/data/webfestival/backups/webfestival_$(date +%F_%H%M).sql

# Backup comprimido
docker exec wf-postgres pg_dump -U postgres webfestival | gzip \
  > /opt/data/webfestival/backups/webfestival_$(date +%F_%H%M).sql.gz

# Restaurar desde un archivo .sql  (⚠️ sobrescribe datos existentes)
cat backup.sql | docker exec -i wf-postgres psql -U postgres -d webfestival

# Restaurar desde un .sql.gz
gunzip -c backup.sql.gz | docker exec -i wf-postgres psql -U postgres -d webfestival
```

> Crea la carpeta de backups una vez: `mkdir -p /opt/data/webfestival/backups`.
> **Antes de cualquier restauración o migración destructiva, haz un backup.**

### Acceso remoto a la DB

PostgreSQL está publicado solo en `127.0.0.1:5432` del host (no expuesto a
internet). Para conectarte desde tu máquina usa un túnel SSH:

```bash
# En tu equipo local
ssh -L 5432:127.0.0.1:5432 usuario@evolucion-col
# Luego conecta tu cliente (DBeaver, psql, etc.) a localhost:5432
```

---

## Redis

```bash
# Ping (requiere la contraseña de REDIS_PASSWORD)
docker exec wf-redis redis-cli -a "$REDIS_PASSWORD" ping

# Consola interactiva
docker exec -it wf-redis redis-cli -a "$REDIS_PASSWORD"

# Ver cuántas claves hay / uso de memoria
docker exec wf-redis redis-cli -a "$REDIS_PASSWORD" dbsize
docker exec wf-redis redis-cli -a "$REDIS_PASSWORD" info memory

# Vaciar la cache (⚠️ borra sesiones y datos cacheados)
docker exec wf-redis redis-cli -a "$REDIS_PASSWORD" flushall
```

---

## Actualizar las aplicaciones (rebuild)

```bash
cd /opt/webfestival

# Traer el último código
cd webfestival-api && git pull origin master && cd ..
cd webfestival-app && git pull origin master && cd ..

# Reconstruir y reiniciar solo las apps
docker compose up -d --build api app

# Reconstruir sin usar cache (si algo quedó inconsistente)
docker compose build --no-cache api app
docker compose up -d api app
```

> Para cambios en el schema de la base de datos (Prisma), sigue el documento
> `DeployGeneral.md`, que explica el flujo con `prisma db push`.

---

## Variables de entorno

```bash
cd /opt/webfestival

# Ver qué variables tiene cargadas un contenedor en ejecución
docker exec wf-api printenv | sort

# Comprobar una variable puntual
docker exec wf-api printenv DATABASE_URL

# Tras editar el archivo .env, recrea el contenedor para que tome los cambios
docker compose up -d api
```

> Las variables sensibles (JWT, contraseñas de DB/Redis, claves de Stripe,
> PayPal, SendGrid, SMTP) viven en el `.env` del stack. No las imprimas en
> canales compartidos ni las subas al repositorio.

---

## Diagnóstico rápido ("algo no funciona")

Sigue este orden para aislar el problema:

```bash
cd /opt/webfestival

# 1. ¿Están arriba y sanos los contenedores?
docker compose ps

# 2. ¿Qué dice el log del servicio afectado?
docker logs wf-api --tail 100
docker logs wf-app --tail 50

# 3. ¿La base de datos responde?
docker exec wf-postgres pg_isready -U postgres -d webfestival

# 4. ¿La API se conecta a la DB? (busca ECONNREFUSED o errores de Prisma)
docker logs wf-api --tail 200 2>&1 | grep -iE "prisma|postgres|econnrefused|error"

# 5. ¿Hay espacio en disco? (una DB o logs llenos tumban el servicio)
df -h
docker system df

# 6. ¿Problema de red entre contenedores?
docker exec wf-api ping -c 2 postgres || true
docker network inspect wf-internal
```

**Síntomas frecuentes y dónde mirar:**

| Síntoma | Posible causa | Acción |
|---|---|---|
| El sitio `app` carga pero las peticiones fallan | `wf-api` caída o sin DB | `docker logs wf-api`, revisar `wf-postgres` |
| 502 Bad Gateway en los dominios | Contenedor caído o Traefik sin ruta | `docker compose ps`, revisar red `traefik-proxy` |
| La API reinicia en bucle | Error de arranque (env faltante, DB no lista) | Primeras líneas de `docker logs wf-api` |
| Login responde "error de conexión" | `wf-api` no responde o CORS/Traefik | Logs de `wf-api` y de Traefik |
| DB lenta o rechaza conexiones | Disco lleno o demasiadas conexiones | `df -h`, `pg_stat_activity` |
| Immich no muestra medios | `wf-immich-server` o su DB caída | `docker logs wf-immich-server`, `wf-immich-postgres` |

---

## Limpieza y mantenimiento

```bash
# Eliminar imágenes y build cache sin usar (seguro; no toca volúmenes de datos)
docker image prune -f
docker builder prune -f

# Limpieza general de recursos sin usar (⚠️ revisa qué vas a borrar)
docker system prune -f

# ⚠️ NUNCA uses 'docker system prune --volumes' ni 'docker volume prune' sin
# tener claro qué borras: los bind mounts de /opt/data no se ven afectados,
# pero volúmenes anónimos de otros stacks sí podrían perderse.

# Rotación de logs: si un log crece mucho, considera configurar el driver
# json-file con max-size/max-file en el daemon de Docker, o en el compose.
```

---

## Portainer (opcional, interfaz visual)

Portainer corre junto a Traefik en `/opt/traefik/` y permite hacer casi todo lo
anterior desde el navegador: ver estado, logs en vivo, reiniciar contenedores,
abrir una consola y revisar uso de recursos. Útil cuando no tienes acceso a la
terminal del servidor. Las acciones destructivas (eliminar contenedores,
volúmenes) deben hacerse con el mismo cuidado que por línea de comandos.

---

## Revisar logs de un incidente pasado (por fecha/hora)

Cuando el error ya ocurrió (no está en vivo), se busca en los logs por rango de
tiempo con `--since` y `--until`.

```bash
# Todo lo registrado por la API desde una fecha/hora en adelante
docker logs wf-api --since 2026-10-12T08:00:00

# Acotar a una ventana (entre dos horas)
docker logs wf-api --since 2026-10-12T07:45:00 --until 2026-10-12T08:30:00

# Solo errores / subidas en esa ventana
docker logs wf-api --since 2026-10-12T08:00:00 2>&1 \
  | grep -iE "upload|immich|media|asset|error|exception|fail"

# Mostrar la marca de tiempo de cada línea (útil para ubicar el momento exacto)
docker logs wf-api -t --since 2026-10-12T08:00:00

# Volcar a un archivo para revisarlo con calma
docker logs wf-api -t --since 2026-10-12T08:00:00 > ~/log_api_ayer.txt

# Atajos relativos (no requieren fecha exacta)
docker logs wf-api --since 2h      # últimas 2 horas
docker logs wf-api --since 30m     # últimos 30 minutos
```

> ⚠️ **Zona horaria:** Docker interpreta las fechas de `--since`/`--until` en
> **UTC**. El servidor corre en `America/Bogota` (UTC−5), así que para las 8:00
> hora local hay que pedir las 13:00 UTC:
>
> ```bash
> docker logs wf-api --since 2026-10-12T13:00:00
> ```
>
> Consejo: prueba primero con la hora local; si no aparece nada, suma 5 horas.
> Los atajos relativos (`--since 2h`) no se ven afectados por la zona horaria.

> Si en ese rango no aparece nada, puede que el contenedor se haya reiniciado o
> que la rotación de logs ya los haya descartado. En ese caso revisa también los
> logs de Immich: `docker logs wf-immich-server -t --since 2026-10-12T08:00:00`.
