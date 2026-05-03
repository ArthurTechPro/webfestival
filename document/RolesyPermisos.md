# Roles y Permisos — WebFestival Platform

> Documento de referencia para la gestión de roles y permisos del sistema.
> Última actualización: Mayo 2026

---

## Jerarquía de Roles

```
SUPERADMIN (Nivel 5) — Administración total de la plataforma
    │
ADMIN (Nivel 4) — Gestión de concursos propios
    │
CONTENT_ADMIN (Nivel 3) — Gestión de contenido y blog
    │
JURADO (Nivel 2) — Evaluación de medios asignados
    │
PARTICIPANTE (Nivel 1) — Participación en concursos
```

---

## 1. SUPERADMIN

El Super Administrador tiene control total sobre toda la plataforma. No tiene restricciones.

### Concursos
- Crear, editar, eliminar **cualquier** concurso sin importar quién lo creó
- Cambiar fechas, tipo de votación y estado en **cualquier** momento
- Ver todos los concursos del sistema

### Usuarios
- Ver, editar, activar, desactivar y eliminar cualquier usuario
- Asignar y remover roles a cualquier usuario (excepto asignar SUPERADMIN, eso se hace directo en BD)
- Exportar listados de usuarios

### Jurados
- Administración completa: ver, editar perfiles, cambiar estado
- Validar certificaciones y asignar especializaciones
- Asignar jurados a categorías de **cualquier** concurso
- Ver estadísticas y exportar datos de jurados

### Criterios de Evaluación
- Crear, editar, eliminar y reordenar criterios de evaluación
- Gestionar criterios universales y por tipo de medio

### Blog / CMS
- Crear, editar, publicar y eliminar contenido
- Gestionar SEO, taxonomía y configuración de contenido
- Subir imágenes al CMS
- Ver analytics y métricas de contenido

### Sistema
- Configurar parámetros del sistema
- Gestionar suscripciones y planes
- Ver analytics generales
- Moderar comentarios y reportes

### Permisos técnicos
```
contest:create, contest:edit, contest:edit_own, contest:delete, contest:delete_own
contest:manage_all, contest:manage_own, contest:view, contest:participate, contest:evaluate
user:manage, user:view, role:assign, superadmin:manage
jury:assign, jury:assign_own, criteria:manage
analytics:view, system:configure, subscription:manage
content:create, content:edit, content:publish, content:delete
cms:manage, blog:manage, newsletter:manage, media:upload_cms
seo:manage, taxonomy:manage
media:upload, media:view_own, media:view_assigned
profile:edit_own, comment:create, follow:manage
evaluation:create, evaluation:edit_own, specialization:manage_own
```

---

## 2. ADMIN

El Administrador gestiona concursos que él mismo creó. No puede administrar usuarios, criterios, blog ni jurados de otros concursos.

### Concursos
- Crear concursos nuevos (queda registrado como creador)
- Editar y eliminar **solo los concursos que él creó**
- En estado **BORRADOR**: control total (fechas, tipo de votación, todo)
- En estados **ACTIVO, EVALUACIÓN, VOTACIÓN, FINALIZADO**: puede editar título, descripción, reglas, max_envios, tamaño máximo, pero **NO puede cambiar fechas ni tipo de votación**
- Ver solo sus propios concursos en el panel de administración

### Usuarios
- **Solo lectura**: puede ver listado de usuarios, detalles y estadísticas
- **NO puede** editar, cambiar estado, asignar roles ni eliminar usuarios

### Jurados
- Ver listado de jurados, perfiles, estadísticas y asignaciones (lectura)
- Asignar jurados a categorías **solo de sus propios concursos**
- **NO puede** editar perfiles de jurados, cambiar su estado, validar certificaciones ni asignar especializaciones

### Criterios de Evaluación
- **Solo lectura**: puede ver criterios existentes
- **NO puede** crear, editar ni eliminar criterios

### Blog / CMS
- **Sin acceso** a la gestión de contenido

### Calificaciones
- Ver progreso de evaluación y resultados de sus concursos
- Ver estadísticas generales de calificaciones

### Permisos técnicos
```
contest:create, contest:edit_own, contest:delete_own, contest:manage_own
contest:view, contest:participate, contest:evaluate
user:view
jury:assign_own
analytics:view
media:upload, media:view_own, media:view_assigned
profile:edit_own, comment:create, follow:manage
evaluation:create, evaluation:edit_own, specialization:manage_own
```

---

## 3. CONTENT_ADMIN

El Administrador de Contenido gestiona exclusivamente el blog, CMS y newsletter. No tiene acceso a la gestión de concursos ni usuarios.

### Blog / CMS
- Crear, editar, publicar y eliminar contenido (blog posts, páginas estáticas, secciones CMS)
- Gestionar SEO: títulos, descripciones, keywords, meta tags
- Gestionar taxonomía: categorías y etiquetas
- Subir imágenes al CMS
- Ver analytics y métricas de rendimiento de contenido
- Gestionar newsletter: suscriptores, envíos

### Concursos
- Sin acceso a la gestión de concursos

### Usuarios
- Sin acceso a la gestión de usuarios

### Permisos técnicos
```
content:create, content:edit, content:publish, content:delete
cms:manage, blog:manage, newsletter:manage
media:upload_cms, seo:manage, taxonomy:manage
```

---

## 4. JURADO

El Jurado evalúa los medios que le son asignados en las categorías de los concursos.

### Evaluación
- Ver los medios asignados para evaluación
- Crear calificaciones con puntuación por criterio (0-10) y comentarios
- Editar y eliminar sus propias calificaciones
- Ver su progreso personal de evaluación (cuántos medios evaluó vs pendientes)
- Ver criterios de evaluación por tipo de medio

### Especialización
- Crear y actualizar su perfil de especialización (áreas, experiencia, certificaciones, portfolio)
- Gestionar sus propias especializaciones

### Concursos
- Ver concursos activos y finalizados (como cualquier usuario)
- Participar en concursos (inscribirse, subir medios)

### Social
- Editar su perfil
- Seguir/dejar de seguir usuarios
- Crear comentarios

### Lo que NO puede hacer
- Gestionar concursos, usuarios ni contenido
- Evaluar medios que no le fueron asignados
- Ver calificaciones de otros jurados (solo las suyas)

### Permisos técnicos
```
contest:view, contest:evaluate
media:view_assigned
evaluation:create, evaluation:edit_own
profile:edit_own, specialization:manage_own
```

---

## 5. PARTICIPANTE

El Participante es el usuario base de la plataforma. Participa en concursos subiendo sus medios.

### Concursos
- Ver concursos activos y finalizados
- Inscribirse y cancelar inscripción a concursos activos
- Verificar su estado de inscripción
- Ver sus medios enviados por concurso (con estadísticas de envíos restantes)

### Medios
- Subir medios (fotografía, video, audio, corto de cine, poster) a concursos donde está inscrito
- Ver sus propios medios subidos
- Respetar los límites de envío por concurso (max_envios) y tamaño de archivo (tamano_max_mb)

### Social
- Editar su perfil (nombre, bio, foto, teléfono, ubicación, website)
- Seguir y dejar de seguir a otros usuarios
- Ver seguidores y seguidos
- Crear comentarios en medios

### Votación
- Votar en concursos que tengan votación pública habilitada (según el tipo de votación del concurso)

### Lo que NO puede hacer
- Gestionar concursos, usuarios, jurados ni contenido
- Evaluar medios (eso es del jurado)
- Acceder al panel de administración

### Permisos técnicos
```
contest:view, contest:participate
media:upload, media:view_own
profile:edit_own, comment:create, follow:manage
```

---

## Tabla Resumen de Acceso

| Funcionalidad | SUPERADMIN | ADMIN | CONTENT_ADMIN | JURADO | PARTICIPANTE |
|---|:---:|:---:|:---:|:---:|:---:|
| **Concursos — crear** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Concursos — editar cualquiera** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Concursos — editar propios** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Concursos — cambiar fechas/votación (no BORRADOR)** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Concursos — eliminar** | ✅ | Solo propios | ❌ | ❌ | ❌ |
| **Concursos — ver todos** | ✅ | Solo propios | ❌ | ❌ | ❌ |
| **Usuarios — ver** | ✅ | ✅ (lectura) | ❌ | ❌ | ❌ |
| **Usuarios — gestionar** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Usuarios — asignar roles** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Jurados — ver** | ✅ | ✅ (lectura) | ❌ | ❌ | ❌ |
| **Jurados — gestionar perfiles** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Jurados — asignar a concursos** | ✅ Todos | Solo propios | ❌ | ❌ | ❌ |
| **Criterios — gestionar** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Criterios — ver** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Blog/CMS — gestionar** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Newsletter — gestionar** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Calificaciones — evaluar** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Calificaciones — ver progreso** | ✅ | ✅ (sus concursos) | ❌ | ✅ (propio) | ❌ |
| **Calificaciones — ver resultados** | ✅ | ✅ (sus concursos) | ❌ | ❌ | ❌ |
| **Medios — subir a concursos** | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Medios — subir al CMS** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Perfil — editar propio** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Social — seguir/comentar** | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Votación pública** | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Sistema — configurar** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Suscripciones — gestionar** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Analytics** | ✅ | ✅ | ✅ (CMS) | ❌ | ❌ |
| **Moderar comentarios** | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## Reglas de Negocio Importantes

### Propiedad de concursos
- Cada concurso tiene un campo `creado_por` que registra quién lo creó.
- ADMIN solo puede gestionar concursos donde `creado_por` sea su propio ID.
- SUPERADMIN ignora esta restricción y accede a todos.

### Restricciones por estado del concurso (ADMIN)
- **BORRADOR**: control total sobre todos los campos.
- **ACTIVO, EVALUACIÓN, VOTACIÓN, FINALIZADO**: puede editar título, descripción, reglas, max_envios, tamaño máximo. **NO puede cambiar** `fecha_inicio`, `fecha_final` ni `tipo_votacion`. Solo SUPERADMIN puede hacerlo.

### Asignación de roles
- Solo SUPERADMIN puede asignar/remover roles.
- SUPERADMIN **no puede** asignar el rol SUPERADMIN a otros usuarios (se hace directo en base de datos por seguridad).
- No se puede cambiar el rol de un SUPERADMIN existente.

### Usuarios con múltiples roles
- Un usuario puede tener múltiples roles (array `roles[]` en la BD).
- El campo `primary_role` indica el rol principal.
- Los permisos se evalúan combinando todos los roles del usuario.

---

## Archivos de Implementación

| Archivo | Descripción |
|---|---|
| `src/middleware/auth.ts` | Definición de `ROLE_PERMISSIONS`, middleware `requireRole`, `requirePermission` |
| `src/middleware/routeGuards.middleware.ts` | Guards específicos por módulo (concursos, usuarios, medios, CMS, etc.) |
| `src/utils/roleUtils.ts` | Utilidades: jerarquía, validación de transiciones, permisos de contenido |
| `src/routes/admin.routes.ts` | Rutas de administración con separación SUPERADMIN/ADMIN |
| `src/routes/concurso.routes.ts` | Rutas de concursos |
| `src/routes/criterios.routes.ts` | Rutas de criterios (escritura solo SUPERADMIN) |
| `src/routes/calificacion.routes.ts` | Rutas de calificaciones |
| `src/routes/cms.routes.ts` | Rutas de CMS |
| `src/services/concurso.service.ts` | Lógica de propiedad y restricciones por estado |
| `src/services/cms.service.ts` | Validación de acceso CMS (SUPERADMIN/CONTENT_ADMIN) |
