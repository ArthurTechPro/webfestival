# 🔧 Solución de Problemas de Base de Datos - WebFestival API

## 📋 Descripción

Esta guía te ayudará a diagnosticar y solucionar problemas comunes de conexión con PostgreSQL en WebFestival API.

## 🚨 Errores Comunes y Soluciones

### 1. Error: "User 'username' was denied access"

**Causa**: Credenciales incorrectas en `DATABASE_URL`

**Solución**:
```bash
# 1. Verifica las credenciales en .env
DATABASE_URL="postgresql://postgres:tu_contraseña@localhost:5432/webfestival_db?schema=public&connection_limit=10&pool_timeout=20&connect_timeout=60"

# 2. Prueba la conexión directa
psql -h localhost -p 5432 -U postgres -d webfestival_db

# 3. Ejecuta el script de diagnóstico
npm run db:test
```

### 2. Error: "terminando la conexión debido a una orden del administrador"

**Causa**: Pool de conexiones agotado o configuración restrictiva

**Solución**:
```bash
# 1. Ejecuta el script de reparación
npm run db:fix

# 2. Reinicia PostgreSQL
net stop postgresql-x64-14
net start postgresql-x64-14

# 3. Verifica la configuración
npm run db:test
```

### 3. Error: "database does not exist"

**Causa**: La base de datos no ha sido creada

**Solución**:
```bash
# 1. Crear la base de datos
createdb -U postgres webfestival_db

# 2. Aplicar migraciones
npx prisma migrate dev

# 3. Verificar
npm run db:test
```

### 4. Error: "Connection timeout"

**Causa**: PostgreSQL no está corriendo o no es accesible

**Solución**:
```bash
# 1. Verificar estado de PostgreSQL
pg_isready -h localhost -p 5432

# 2. Iniciar PostgreSQL si está detenido
net start postgresql-x64-14

# 3. Verificar puertos
netstat -ano | findstr :5432
```

## 🛠️ Scripts de Diagnóstico

### Script de Prueba Rápida
```bash
npm run db:test
```
- Prueba conexión básica
- Verifica consultas simples
- Cuenta registros en tablas

### Script de Diagnóstico Completo
```bash
npm run db:fix
```
- Diagnóstico completo de conexión
- Aplicación automática de soluciones
- Pruebas de múltiples conexiones simultáneas
- Verificación de configuración de PostgreSQL

## 📊 Configuración Recomendada

### Variables de Entorno (.env)
```env
# Configuración optimizada para desarrollo
DATABASE_URL="postgresql://postgres:tu_contraseña@localhost:5432/webfestival_db?schema=public&connection_limit=10&pool_timeout=20&connect_timeout=60"
```

### Parámetros de Conexión Explicados
- `connection_limit=10`: Máximo 10 conexiones simultáneas
- `pool_timeout=20`: Timeout de 20 segundos para obtener conexión del pool
- `connect_timeout=60`: Timeout de 60 segundos para conectar a PostgreSQL

## 🔍 Verificación Manual

### 1. Estado de PostgreSQL
```bash
# Windows
net start | findstr postgresql

# Verificar proceso
tasklist | findstr postgres
```

### 2. Conexión Directa
```bash
# Conectar con psql
psql -h localhost -p 5432 -U postgres -d webfestival_db

# Dentro de psql, verificar tablas
\dt

# Verificar usuarios
SELECT count(*) FROM usuarios;
```

### 3. Logs de PostgreSQL
```bash
# Ubicación típica en Windows
C:\Program Files\PostgreSQL\14\data\log\

# Ver logs recientes
Get-Content "C:\Program Files\PostgreSQL\14\data\log\postgresql-*.log" -Tail 50
```

## 🚀 Configuración de Producción

### Variables de Entorno Seguras
```env
# Producción - usar variables del sistema
DATABASE_URL="postgresql://usuario_prod:contraseña_segura@db_host:5432/webfestival_prod?schema=public&connection_limit=20&pool_timeout=30&connect_timeout=60&sslmode=require"
```

### Mejores Prácticas
1. **Usar SSL en producción**: `sslmode=require`
2. **Pool de conexiones mayor**: `connection_limit=20`
3. **Timeouts más largos**: `connect_timeout=60`
4. **Usuario específico**: No usar `postgres` en producción
5. **Contraseñas fuertes**: Generar contraseñas seguras

## 🔧 Mantenimiento Regular

### Scripts de Mantenimiento
```bash
# Verificar estado de migraciones
npx prisma migrate status

# Regenerar cliente de Prisma
npx prisma generate

# Verificar esquema
npx prisma db pull

# Resetear base de datos (CUIDADO en producción)
npx prisma migrate reset
```

### Monitoreo de Conexiones
```sql
-- Ver conexiones activas
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    query
FROM pg_stat_activity 
WHERE datname = 'webfestival_db';

-- Terminar conexiones idle
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'webfestival_db' 
AND state = 'idle' 
AND pid <> pg_backend_pid();
```

## 📞 Soporte Adicional

### Información del Sistema
```bash
# Versión de PostgreSQL
psql --version

# Versión de Node.js
node --version

# Versión de Prisma
npx prisma --version
```

### Logs de la Aplicación
```bash
# Ejecutar con logs detallados
DEBUG=prisma:* npm run dev

# Solo errores de Prisma
PRISMA_LOG_LEVEL=error npm run dev
```

### Contacto
Si los problemas persisten:
1. Ejecuta `npm run db:fix` y guarda la salida
2. Revisa los logs de PostgreSQL
3. Verifica la configuración de red y firewall
4. Consulta la documentación de Prisma: https://www.prisma.io/docs

---

**Última actualización**: Octubre 2024  
**Versión**: 1.0.0