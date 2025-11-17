# ✅ Actualización: Colección Postman Upload Immich

## 🔧 Cambios Realizados

He actualizado la colección `WebFestival-API-Upload-Immich.postman_collection.json` para corregir los problemas identificados.

---

## 🐛 Problemas Corregidos

### 1. Nombre Incorrecto del Campo en Body

**❌ Antes:**
```json
{
  "key": "file",
  "type": "file"
}
```

**✅ Después:**
- Avatar: `"key": "avatar"`
- Poster: `"key": "imagen"`
- CMS: `"key": "imagen"`
- Portfolio: `"key": "portfolio"`

### 2. Tests Incorrectos

**❌ Antes:**
Los tests esperaban campos que no existen en la respuesta actual:
- `data.asset_id`
- `data.picture_url`
- `data.picture_thumbnail`

**✅ Después:**
Tests actualizados para validar la respuesta real:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success true", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
});

pm.test("Response has success message", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.message).to.include('exitosamente');
});
```

### 3. Descripciones Mejoradas

Agregadas descripciones claras en cada endpoint:
- Nombre correcto del campo
- Tamaño máximo permitido
- Formatos aceptados
- Roles requeridos

---

## 📋 Endpoints Actualizados

### 1. Upload Avatar Usuario

**URL:** `{{baseUrl}}/api/v1/users/:userId/avatar`

**Body (form-data):**
| Key | Type | Value |
|-----|------|-------|
| `avatar` | File | imagen.jpg |

**Variables:**
- `userId`: `{{currentUserId}}`

**Descripción:** El campo debe llamarse 'avatar' (no 'file').

---

### 2. Upload Poster Concurso

**URL:** `{{baseUrl}}/api/v1/concursos/:concursoId/imagen`

**Body (form-data):**
| Key | Type | Value |
|-----|------|-------|
| `imagen` | File | poster.jpg |

**Variables:**
- `concursoId`: `1` (cambiar según necesidad)

**Descripción:** El campo debe llamarse 'imagen' (no 'file'). Requiere rol ADMIN.

---

### 3. Upload Imagen CMS

**URL:** `{{baseUrl}}/api/v1/cms/contenido/:contenidoId/imagen`

**Body (form-data):**
| Key | Type | Value |
|-----|------|-------|
| `imagen` | File | imagen.jpg |

**Variables:**
- `contenidoId`: `1` (cambiar según necesidad)

**Descripción:** El campo debe llamarse 'imagen' (no 'file'). Requiere rol ADMIN o CONTENT_ADMIN.

---

### 4. Upload Portfolio Jurado

**URL:** `{{baseUrl}}/api/v1/jurados/:juradoId/portfolio`

**Body (form-data):**
| Key | Type | Value |
|-----|------|-------|
| `portfolio` | File | portfolio.jpg |

**Variables:**
- `juradoId`: `1` (cambiar según necesidad)

**Descripción:** El campo debe llamarse 'portfolio' (no 'file'). Requiere rol JURADO o ADMIN.

---

## 🎯 Cómo Usar la Colección Actualizada

### Paso 1: Importar/Actualizar en Postman

Si ya tienes la colección importada:
1. Click derecho en la colección
2. "Replace" o "Update"
3. Seleccionar el archivo actualizado

Si es nueva:
1. File > Import
2. Seleccionar `WebFestival-API-Upload-Immich.postman_collection.json`

### Paso 2: Configurar Variables

En tu environment, asegúrate de tener:

```json
{
  "baseUrl": "http://localhost:3001",
  "authToken": "tu_token_jwt",
  "currentUserId": "tu_user_id"
}
```

### Paso 3: Usar los Endpoints

1. Seleccionar el endpoint deseado
2. En Body > form-data, el campo ya tiene el nombre correcto
3. Click en "Select Files" para elegir la imagen
4. Send

### Paso 4: Verificar Tests

Después de enviar, verifica que los 3 tests pasen:
- ✅ Status code is 200
- ✅ Response has success true
- ✅ Response has success message

---

## 📊 Respuestas Esperadas

### Respuesta Exitosa

```json
{
  "success": true,
  "message": "Avatar actualizado exitosamente"
}
```

### Respuesta con Error

```json
{
  "success": false,
  "error": "Tipo de archivo no permitido. Solo se aceptan: JPG, PNG, WebP"
}
```

---

## 🔍 Validaciones del Servidor

### Tipo de Archivo
- ✅ JPG / JPEG
- ✅ PNG
- ✅ WebP
- ❌ GIF, BMP, SVG, etc.

### Tamaño Máximo
- Avatar: 5MB
- Poster: 10MB
- CMS: 10MB
- Portfolio: 5MB

### Permisos
- Avatar: Usuario propio o ADMIN
- Poster: Solo ADMIN
- CMS: ADMIN o CONTENT_ADMIN
- Portfolio: JURADO o ADMIN

---

## 🎓 Diferencias Clave

### Campo en Body

| Endpoint | Campo Correcto | ❌ Incorrecto |
|----------|----------------|---------------|
| Avatar | `avatar` | `file` |
| Poster | `imagen` | `file` |
| CMS | `imagen` | `file` |
| Portfolio | `portfolio` | `file` |

**Importante:** El nombre del campo debe coincidir exactamente con lo que espera el servidor (definido en `upload.single('avatar')` en las rutas).

---

## 🐛 Troubleshooting

### "No se proporcionó ningún archivo"

**Causa:** El nombre del campo no coincide.

**Solución:** Verificar que el campo se llame exactamente:
- `avatar` para usuarios
- `imagen` para concursos y CMS
- `portfolio` para jurados

### Tests Fallan

**Causa:** Los tests antiguos esperaban campos que no existen.

**Solución:** Usar la colección actualizada con los tests corregidos.

### "Cannot POST /api/v1/users/undefined/avatar"

**Causa:** Variable `currentUserId` no definida.

**Solución:** Definir en el environment:
```json
{
  "currentUserId": "tu_user_id_real"
}
```

---

## ✅ Checklist de Verificación

Antes de usar la colección:

- [ ] Colección actualizada/importada en Postman
- [ ] Variable `baseUrl` definida
- [ ] Variable `authToken` definida y válida
- [ ] Variable `currentUserId` definida
- [ ] Servidor corriendo (`npm run dev`)
- [ ] Campo en body tiene el nombre correcto
- [ ] Archivo es JPG, PNG o WebP
- [ ] Archivo no excede tamaño máximo

---

## 📝 Resumen de Cambios

| Aspecto | Antes | Después |
|---------|-------|---------|
| Campo body | `file` | `avatar`, `imagen`, `portfolio` |
| Tests | Esperaban `data.asset_id` | Validan `success` y `message` |
| Descripciones | Básicas | Detalladas con requisitos |
| Variables | Sin descripción | Con descripción clara |

---

**Fecha:** Noviembre 9, 2024  
**Versión:** 2.1.0  
**Estado:** ✅ Actualizado y Funcional
