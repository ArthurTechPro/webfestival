# ✅ Corrección: Endpoint "Subir a Immich" en Flujo Completo

## 🐛 Problema Identificado

El endpoint "Subir a Immich" en la colección `WebFestival-API-Flujo-Completo-Subida.postman_collection.json` tenía una configuración incorrecta de la URL.

### ❌ Antes (Incorrecto)

```json
{
  "url": {
    "raw": "{{uploadUrl}}",
    "host": ["{{uploadUrl}}"]
  }
}
```

**Problema:** La estructura `host: ["{{uploadUrl}}"]` es incorrecta cuando se usa una variable que ya contiene la URL completa.

### ✅ Después (Correcto)

```json
{
  "url": "{{uploadUrl}}"
}
```

**Solución:** Usar directamente la variable `{{uploadUrl}}` que contiene la URL completa generada en el paso anterior.

---

## 📋 Flujo Correcto

### Paso 4: Generar URL de Subida

**Request:**
```
POST {{baseUrl}}/media/contests/{{concursoId}}/upload-url
```

**Response:**
```json
{
  "data": {
    "upload_token": "abc123...",
    "upload_url": "https://medios.webfestival.art/api/asset/upload",
    "immich_api_key": "xyz789...",
    "expires_at": "2024-11-09T12:30:00Z"
  }
}
```

**Variables guardadas:**
- `uploadId` = `abc123...`
- `uploadUrl` = `https://medios.webfestival.art/api/asset/upload`
- `immichApiKey` = `xyz789...`

### Paso 5: Subir a Immich

**Request:**
```
POST {{uploadUrl}}
```

**Se expande a:**
```
POST https://medios.webfestival.art/api/asset/upload
```

**Headers:**
```
x-api-key: {{immichApiKey}}
```

**Body (form-data):**
- `assetData`: [archivo seleccionado]
- `deviceAssetId`: `{{uploadId}}`
- `deviceId`: `webfestival-api`
- `fileCreatedAt`: `{{$isoTimestamp}}`
- `fileModifiedAt`: `{{$isoTimestamp}}`

---

## 🎯 Cómo Usar el Flujo Completo

### 1. Configurar Environment

Asegúrate de tener estas variables:

```json
{
  "baseUrl": "http://localhost:3001/api/v1",
  "accessToken": "",
  "userId": "",
  "concursoId": "",
  "categoriaId": "",
  "uploadId": "",
  "uploadUrl": "",
  "immichApiKey": "",
  "immichAssetId": "",
  "medioId": ""
}
```

### 2. Ejecutar Pasos en Orden

#### 1️⃣ Autenticación
- **Login** → Guarda `accessToken` y `userId`

#### 2️⃣ Explorar Concursos
- **Ver Concursos Activos** → Guarda `concursoId`
- **Detalles del Concurso** → Guarda `categoriaId`

#### 3️⃣ Inscripción
- **Inscribirse al Concurso** → Requisito obligatorio

#### 4️⃣ Preparar Subida
- **Obtener Configuración** → Ver límites
- **Generar URL de Subida** → Guarda `uploadId`, `uploadUrl`, `immichApiKey`

#### 5️⃣ Subir Archivo
- **Subir a Immich** → Seleccionar archivo, guarda `immichAssetId`

#### 6️⃣ Procesar Subida
- **Confirmar Subida** → Guarda `medioId`, crea álbum en Immich

#### 7️⃣ Verificación
- **Ver Medio Subido** → Confirmar
- **Mis Medios en el Concurso** → Listar todos
- **Verificar Límites** → Cuántos más puedes subir

---

## 🔍 Verificación de Variables

Después de cada paso, verifica en la consola de Postman:

```javascript
// Paso 1: Login
✅ Paso 1 completado: Autenticado

// Paso 2: Concursos
✅ Paso 2 completado: Concurso seleccionado
✅ Categoría seleccionada

// Paso 3: Inscripción
✅ Paso 3 completado: Inscrito al concurso

// Paso 4: Generar URL
✅ Paso 4 completado: URL generada
📝 Upload Token: abc123...
📤 Upload URL: https://medios.webfestival.art/api/asset/upload
⏰ Expira: 2024-11-09T12:30:00Z

// Paso 5: Subir
✅ Paso 5 completado: Archivo subido
📝 Asset ID: xyz789...

// Paso 6: Procesar
✅ Paso 6 completado: Medio procesado
📁 Álbum en Immich: album-id-123
🎉 FLUJO COMPLETADO - Medio ID: 456
```

---

## ⚠️ Puntos Importantes

### 1. URL de Subida Expira

La `uploadUrl` y el `immichApiKey` expiran en **15 minutos**. Si tardas más:
- Volver a ejecutar "Generar URL de Subida"
- Continuar con "Subir a Immich"

### 2. Seleccionar Archivo

En el paso "Subir a Immich":
1. Ir a Body > form-data
2. En el campo `assetData`, click en "Select Files"
3. Elegir tu archivo (.jpg, .png, .mp4, etc.)

### 3. Headers Automáticos

Los headers se configuran automáticamente:
- `x-api-key` usa `{{immichApiKey}}`
- `Authorization` usa `Bearer {{accessToken}}`
- `x-upload-token` usa `{{uploadId}}`

### 4. Organización en Immich

Los medios se organizan automáticamente en álbumes:

**Formato:**
```
Concurso: [Título del Concurso] / Usuario: [Nombre del Usuario]
```

**Ejemplos:**
- `Concurso: Fotografía de Naturaleza 2024 / Usuario: Juan Pérez`
- `Concurso: Video Documental 2024 / Usuario: María García`

Todos los medios de un usuario para un concurso van al mismo álbum.

---

## 🐛 Troubleshooting

### Error: "Cannot POST {{uploadUrl}}"

**Causa:** La variable `uploadUrl` no está definida.

**Solución:** Ejecutar primero "Generar URL de Subida" (Paso 4).

### Error: "Invalid API key"

**Causa:** El `immichApiKey` expiró o no se guardó.

**Solución:** Volver a ejecutar "Generar URL de Subida".

### Error: "No file provided"

**Causa:** No se seleccionó un archivo en `assetData`.

**Solución:** 
1. Ir a Body > form-data
2. Campo `assetData` > Select Files
3. Elegir archivo

### Error: "Upload token expired"

**Causa:** Pasaron más de 15 minutos desde generar la URL.

**Solución:** Volver a ejecutar "Generar URL de Subida".

### Error: "Not inscribed in contest"

**Causa:** No estás inscrito en el concurso.

**Solución:** Ejecutar "Inscribirse al Concurso" (Paso 3).

---

## 📊 Comparación: Antes vs Después

### ❌ Antes (No Funcionaba)

```json
{
  "url": {
    "raw": "{{uploadUrl}}",
    "host": ["{{uploadUrl}}"]
  }
}
```

**Resultado:** Postman no podía construir la URL correctamente.

### ✅ Después (Funciona)

```json
{
  "url": "{{uploadUrl}}"
}
```

**Resultado:** Postman usa directamente el valor de la variable.

---

## ✅ Checklist de Verificación

Antes de ejecutar el flujo:

- [ ] Environment seleccionado (Local o Production)
- [ ] Variable `baseUrl` definida
- [ ] Credenciales válidas para login
- [ ] Hay concursos activos disponibles
- [ ] Archivo listo para subir
- [ ] Archivo cumple requisitos (tipo, tamaño)

Durante el flujo:

- [ ] Paso 1: Token guardado
- [ ] Paso 2: Concurso y categoría seleccionados
- [ ] Paso 3: Inscripción exitosa
- [ ] Paso 4: URL y API key generados
- [ ] Paso 5: Archivo seleccionado y subido
- [ ] Paso 6: Medio procesado y álbum creado
- [ ] Paso 7: Medio visible en listado

---

## 📝 Resumen de Cambios

| Aspecto | Antes | Después |
|---------|-------|---------|
| Estructura URL | `{"raw": "...", "host": [...]}` | `"{{uploadUrl}}"` |
| Funcionalidad | ❌ No funcionaba | ✅ Funciona correctamente |
| Descripción | Básica | Mejorada con ejemplos |

---

**Fecha:** Noviembre 9, 2024  
**Tipo:** Bug Fix  
**Impacto:** Alto - Endpoint crítico del flujo  
**Estado:** ✅ Corregido
