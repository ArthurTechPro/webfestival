# ROTACIÓN DE SECRETOS

Guía para **rotar** (cambiar) los secretos que estuvieron en texto plano en la
documentación. Mientras no se roten, deben considerarse **comprometidos**,
porque pudieron quedar en el historial de git y en copias del repositorio.

> No hay prisa para ejecutar esto hoy, pero hazlo en cuanto puedas. Haz un
> **backup de la base de datos antes de empezar** (ver `DeployGeneral.md` u
> `OperacionContenedores.md`).

- **Servidor:** `evolucion-col`
- **Archivo de secretos del stack:** `/opt/webfestival/.env`
- **Archivo de secretos de Traefik:** `/opt/traefik/.env`

Flujo general para cada secreto: generar el nuevo valor → editar el `.env`
correspondiente → recrear/reiniciar el contenedor que lo usa → verificar.

---

## Secretos a rotar (resumen)

| Secreto | Archivo `.env` | Impacto al rotar |
|---|---|---|
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | `/opt/webfestival/.env` | Cierra todas las sesiones; los usuarios deben volver a iniciar sesión |
| `POSTGRES_PASSWORD` | `/opt/webfestival/.env` | Hay que cambiarla también dentro de PostgreSQL |
| `REDIS_PASSWORD` | `/opt/webfestival/.env` | Se vacía la cache/sesiones en Redis al reiniciar |
| `IMMICH_DB_PASSWORD` | `/opt/webfestival/.env` | Hay que cambiarla también dentro de la DB de Immich |
| `IMMICH_API_KEY` | `/opt/webfestival/.env` | Se revoca la key vieja desde el panel de Immich |
| `TRAEFIK_DASHBOARD_AUTH` | `/opt/traefik/.env` | Cambia la contraseña del panel de Traefik |
| Contraseña del panel de Mailcow | Panel de Mailcow | Cambia el acceso al panel de correo |
| Contraseñas de buzones (`noreply@`, `admin@`) | Panel de Mailcow + `/opt/webfestival/.env` | La API debe usar la nueva en `SMTP_PASSWORD` |

---

## 1. JWT (`JWT_SECRET` y `JWT_REFRESH_SECRET`)

> Rotar esto **invalida todos los tokens existentes**: todos los usuarios
> tendrán que volver a iniciar sesión. Hazlo en un horario de bajo tráfico.

```bash
cd /opt/webfestival

# 1. Generar dos valores nuevos
openssl rand -hex 32   # copiar → JWT_SECRET
openssl rand -hex 32   # copiar → JWT_REFRESH_SECRET

# 2. Editar el .env y pegar los nuevos valores
nano /opt/webfestival/.env
#   JWT_SECRET=<nuevo valor 1>
#   JWT_REFRESH_SECRET=<nuevo valor 2>

# 3. Recrear la API para que tome los cambios
docker compose up -d api

# 4. Verificar que arrancó sin errores
docker logs wf-api --tail 50
```

---

## 2. Contraseña de PostgreSQL (`POSTGRES_PASSWORD`)

La contraseña vive en dos lugares que deben quedar **iguales**: dentro de
PostgreSQL y en el `.env` (que arma la `DATABASE_URL` de la API).

```bash
cd /opt/webfestival

# 1. Generar una contraseña nueva
openssl rand -base64 24   # copiar el valor

# 2. Cambiarla DENTRO de PostgreSQL (usa el usuario actual de POSTGRES_USER)
docker exec -it wf-postgres psql -U postgres -d webfestival \
  -c "ALTER USER postgres WITH PASSWORD 'NUEVA_PASSWORD';"

# 3. Actualizar el .env con el MISMO valor
nano /opt/webfestival/.env
#   POSTGRES_PASSWORD=NUEVA_PASSWORD

# 4. Recrear la API (usa DATABASE_URL construida con esa contraseña)
docker compose up -d api

# 5. Verificar conexión (no debe haber ECONNREFUSED ni auth failed)
docker logs wf-api --tail 50
docker exec wf-postgres pg_isready -U postgres -d webfestival
```

> Sustituye `postgres` por el usuario real de `POSTGRES_USER` si es distinto.

---

## 3. Contraseña de Redis (`REDIS_PASSWORD`)

Redis toma la contraseña por el comando de arranque del contenedor, así que
basta con cambiar el `.env` y recrearlo.

```bash
cd /opt/webfestival

# 1. Generar contraseña nueva
openssl rand -base64 24

# 2. Actualizar el .env
nano /opt/webfestival/.env
#   REDIS_PASSWORD=NUEVA_PASSWORD

# 3. Recrear Redis y la API (la API usa REDIS_URL con esa contraseña)
docker compose up -d redis api

# 4. Verificar que Redis responde con la nueva contraseña
docker exec wf-redis redis-cli -a 'NUEVA_PASSWORD' ping   # debe responder PONG
```

> Al recrear Redis se pierde lo que tenía en memoria (cache y sesiones). Es
> esperado y no afecta los datos de PostgreSQL.

---

## 4. Contraseña de la base de datos de Immich (`IMMICH_DB_PASSWORD`)

Igual que PostgreSQL: cambiar dentro de la DB de Immich y en el `.env`.

```bash
cd /opt/webfestival

# 1. Generar contraseña nueva
openssl rand -base64 24

# 2. Cambiarla dentro de la DB de Immich (usuario de IMMICH_DB_USER)
docker exec -it wf-immich-postgres psql -U immich -d immich_db \
  -c "ALTER USER immich WITH PASSWORD 'NUEVA_PASSWORD';"

# 3. Actualizar el .env
nano /opt/webfestival/.env
#   IMMICH_DB_PASSWORD=NUEVA_PASSWORD

# 4. Recrear los contenedores de Immich
docker compose up -d immich-postgres immich-server immich-machine-learning

# 5. Verificar
docker logs wf-immich-server --tail 50
```

> Ajusta `immich` / `immich_db` a los valores reales de `IMMICH_DB_USER` e
> `IMMICH_DB_NAME`.

---

## 5. API Key de Immich (`IMMICH_API_KEY`)

Esta key la usa `wf-api` para hablar con Immich. Se revoca y se crea una nueva
desde el panel web de Immich.

1. Entrar a `https://medios.webfestival.art` con la cuenta de administrador.
2. Ir a **Administration → API Keys** (o **Account Settings → API Keys**).
3. **Eliminar** la key vieja (la que estaba expuesta).
4. **Crear** una nueva, p. ej. `webfestival-api`, y copiar su valor.

```bash
# 5. Pegar la nueva key en el .env
nano /opt/webfestival/.env
#   IMMICH_API_KEY=<nueva key copiada del panel>

# 6. Recrear la API
cd /opt/webfestival
docker compose up -d api

# 7. Verificar que la API se comunica con Immich
docker logs wf-api --tail 50
```

---

## 6. Panel de Traefik (`TRAEFIK_DASHBOARD_AUTH`)

Es un par usuario:hash generado con `htpasswd`. Vive en `/opt/traefik/.env`.

```bash
# 1. Generar el nuevo hash (requiere apache2-utils)
htpasswd -nb admin TU_NUEVA_PASSWORD
#   → produce algo como: admin:$apr1$....$....

# 2. Pegar la línea completa en el .env de Traefik
nano /opt/traefik/.env
#   TRAEFIK_DASHBOARD_AUTH=admin:$apr1$....$....

# 3. Recrear Traefik
docker compose -f /opt/traefik/docker-compose.yml up -d
```

> En archivos de Docker Compose, los `$` del hash deben ir **duplicados**
> (`$$`) si el valor se escribe directamente en el `docker-compose.yml`. En un
> archivo `.env` normal **no** se duplican.

---

## 7. Mailcow — panel y buzones

### Contraseña del panel de administración

1. Entrar a `https://mail.webfestival.art` con el usuario `admin`.
2. Ir a la edición del administrador y cambiar la contraseña por defecto.

### Contraseñas de los buzones (`noreply@`, `admin@`)

1. En el panel de Mailcow: **Mail Setup → Mailboxes → Editar** el buzón.
2. Asignar una contraseña nueva.
3. Si cambiaste `noreply@webfestival.art` (el que usa la API para enviar
   correos), actualiza también el `.env` del stack:

```bash
nano /opt/webfestival/.env
#   SMTP_PASSWORD=NUEVA_PASSWORD_NOREPLY

cd /opt/webfestival
docker compose up -d api

# Probar que la API puede enviar correo (p. ej. registrar un usuario de prueba)
docker logs wf-api --tail 50
```

---

## 8. Verificación final

```bash
cd /opt/webfestival

# Todos los contenedores arriba y sanos
docker compose ps

# La API arrancó sin errores de auth/DB/JWT
docker logs wf-api --tail 80 2>&1 | grep -iE "error|jwt|postgres|redis|immich" || echo "Sin errores evidentes"

# La base de datos responde
docker exec wf-postgres pg_isready -U postgres -d webfestival
```

Prueba manual recomendada:
- Iniciar sesión en `https://app.webfestival.art` (debería pedir login de nuevo
  si rotaste el JWT).
- Registrar un usuario de prueba para confirmar el envío de correo.
- Abrir `https://medios.webfestival.art` y confirmar que los medios cargan
  (valida la API key de Immich).

---

## 9. Opcional — limpiar el historial de git

Quitar los secretos de los archivos actuales **no** los borra del historial de
commits anteriores. Si el repositorio es privado y los secretos ya se rotaron,
suele ser suficiente. Si necesitas borrarlos del historial por completo, se usa
una herramienta como `git filter-repo` o BFG Repo-Cleaner; es una operación que
**reescribe el historial** y requiere coordinar con todos los que tengan clones.
No la ejecutes sin un backup del repositorio y sin avisar al equipo.
