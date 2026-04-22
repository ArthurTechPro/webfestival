# DEPLOY GENERAL VPS

## Flujo estándar de deploy

```bash
cd /opt/webfestival

# 1. Pull del código
cd webfestival-api && git pull origin master && cd ..
cd webfestival-app && git pull origin master && cd ..

# 2. Sincronizar schema de base de datos (ver sección abajo)

# 3. Reconstruir y reiniciar contenedores
docker compose up -d --build api app
```

---

## Manejo de cambios en el schema de Prisma

### ⚠️ Problema conocido con `prisma migrate deploy`

`prisma migrate deploy` falla frecuentemente en producción cuando las migraciones SQL contienen:
- `ALTER TYPE ... ADD VALUE` (agregar valores a enums de PostgreSQL)
- Múltiples statements que dependen entre sí en la misma transacción
- Creación de tipos seguida de uso inmediato del mismo tipo

PostgreSQL **no permite usar un valor de enum recién agregado en la misma transacción** donde se creó. Prisma ejecuta cada migración en una sola transacción, lo que causa el error `unsafe use of new value`.

### ✅ Flujo correcto para aplicar cambios de schema

**Opción A — `db push` (recomendado para producción):**

```bash
# Sincroniza el schema.prisma directamente con la BD sin usar migraciones
docker exec wf-api npx prisma db push --accept-data-loss

# Marcar las migraciones pendientes como aplicadas (para que Prisma no las reintente)
docker exec wf-api npx prisma migrate resolve --applied <nombre_migracion>

# Verificar que todo quedó limpio
docker exec wf-api npx prisma migrate status

# Reiniciar para regenerar el cliente Prisma
docker restart wf-api
```

**Opción B — Aplicar SQL manualmente y marcar como aplicado:**

```bash
# Ejecutar el SQL directamente en PostgreSQL
docker exec wf-postgres psql -U postgres -d webfestival <<'EOF'
-- pegar aquí el contenido del archivo migration.sql
EOF

# Marcar la migración como aplicada en Prisma
docker exec wf-api npx prisma migrate resolve --applied <nombre_migracion>

# Verificar estado
docker exec wf-api npx prisma migrate status
```

**Opción C — Si la migración quedó en estado fallido:**

```bash
# Ver qué migraciones están pendientes o fallidas
docker exec wf-api npx prisma migrate status

# Resolver la migración fallida (marcarla como aplicada)
docker exec wf-api npx prisma migrate resolve --applied <nombre_migracion>

# Luego aplicar el schema con db push
docker exec wf-api npx prisma db push --accept-data-loss

# Reiniciar
docker restart wf-api
```

### Notas sobre las migraciones SQL en el repo

Los archivos en `prisma/migrations/` se mantienen como **documentación** del historial de cambios, pero el deploy real en producción usa `db push`. Esto es intencional dado el comportamiento de PostgreSQL con enums en transacciones.

---

## Comandos útiles de diagnóstico

```bash
# Ver estado de migraciones
docker exec wf-api npx prisma migrate status

# Ver logs de la API
docker logs wf-api --tail 50

# Ver estructura de una tabla
docker exec wf-postgres psql -U postgres -d webfestival -c "\d nombre_tabla"

# Ver valores actuales de un enum
docker exec wf-postgres psql -U postgres -d webfestival -c "SELECT unnest(enum_range(NULL::\"NombreEnum\"));"

# Regenerar cliente Prisma sin reiniciar
docker exec wf-api npx prisma generate
```

---

## Deploy rápido (ambos proyectos)

```bash
cd /opt/webfestival

# Pull + schema + rebuild todo
cd webfestival-api && git pull origin master && cd ..
cd webfestival-app && git pull origin master && cd ..
docker exec wf-api npx prisma db push --accept-data-loss
docker compose up -d --build api app
```
