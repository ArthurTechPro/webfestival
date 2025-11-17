# 📋 Resumen de Actualizaciones en Postman

## ✅ Cambios Aplicados

### 1. WebFestival-API-Flujo-Completo-Subida.postman_collection.json

**Actualizado:**
- ✅ URL de Immich corregida: `/api/assets` (en lugar de `/api/asset/upload`)
- ✅ Agregada sección "8️⃣ Consultar Imágenes (Frontend)" con:
  - Ver Imagen Original (Proxy)
  - Ver Thumbnail (Proxy)
  - Ver Preview (Proxy)
  - Listar Medios con URLs

**Flujo Completo:**
1. Autenticación (Login)
2. Explorar Concursos (Ver activos + Detalles)
3. Inscripción
4. Preparar Subida (Config + Generar URL)
5. Subir Archivo (a Immich)
6. Procesar Subida (Confirmar + Crear Álbum)
7. Verificación (Ver medio + Mis medios + Límites)
8. **NUEVO:** Consultar Imágenes (Proxy URLs para frontend)

---

## 📁 Colecciones Actuales

### ✅ Mantener y Usar

1. **WebFestival-API-Flujo-Completo-Subida.postman_collection.json**
   - **Propósito:** Flujo completo de subida de medios a concursos
   - **Estado:** ✅ Actualizado
   - **Uso:** Principal para testing de subida de medios

2. **WebFestival-API-Upload-Immich.postman_collection.json**
   - **Propósito:** Upload de avatares y posters (usuarios y concursos)
   - **Estado:** ⚠️ Revisar endpoints
   - **Uso:** Secundario para imágenes de perfil

---

## 🔄 Endpoints Actualizados

### Subida a Immich

**❌ Antes (Incorrecto):**
```
POST https://medios.webfestival.art/api/asset/upload
```

**✅ Ahora (Correcto):**
```
POST https://medios.webfestival.art/api/assets
```

### URLs de Imágenes

**❌ Antes (Requiere autenticación):**
```
https://medios.webfestival.art/api/asset/file/{assetId}
```

**✅ Ahora (Público vía proxy):**
```
http://localhost:3000/proxy/media/{assetId}
http://localhost:3000/proxy/media/{assetId}?size=400x225
http://localhost:3000/proxy/media/{assetId}?size=1280x720
```

---

## 📸 Consulta de Imágenes desde Frontend

### Endpoints Disponibles

#### 1. Imagen Original
```
GET /proxy/media/:assetId
```

**Ejemplo:**
```
http://localhost:3000/proxy/media/996199b5-2af5-48fa-b09e-5a21b07d442d
```

**Uso en HTML:**
```html
<img src="http://localhost:3000/proxy/media/996199b5-2af5-48fa-b09e-5a21b07d442d" />
```

#### 2. Thumbnail (Miniatura)
```
GET /proxy/media/:assetId?size=400x225
```

**Ejemplo:**
```
http://localhost:3000/proxy/media/996199b5-2af5-48fa-b09e-5a21b07d442d?size=400x225
```

**Uso en React:**
```jsx
<img 
  src={`${API_URL}/proxy/media/${medio.immich_asset_id}?size=400x225`}
  alt={medio.titulo}
/>
```

#### 3. Preview (Vista Previa HD)
```
GET /proxy/media/:assetId?size=1280x720
```

**Ejemplo:**
```
http://localhost:3000/proxy/media/996199b5-2af5-48fa-b09e-5a21b07d442d?size=1280x720
```

**Uso en Vue:**
```vue
<img 
  :src="`${apiUrl}/proxy/media/${medio.immich_asset_id}?size=1280x720`"
  :alt="medio.titulo"
/>
```

---

## 🎨 Ejemplo de Respuesta de Medios

### GET /media/user/:userId

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "titulo": "Mi Fotografía Ganadora",
        "tipo_medio": "fotografia",
        "medio_url": "http://localhost:3000/proxy/media/996199b5-2af5-48fa-b09e-5a21b07d442d",
        "thumbnail_url": "http://localhost:3000/proxy/media/996199b5-2af5-48fa-b09e-5a21b07d442d?size=400x225",
        "preview_url": "http://localhost:3000/proxy/media/996199b5-2af5-48fa-b09e-5a21b07d442d?size=1280x720",
        "immich_asset_id": "996199b5-2af5-48fa-b09e-5a21b07d442d",
        "immich_album_id": "album-123-456",
        "usuario": {
          "id": "user-123",
          "nombre": "Carlos Arturo Hernandez"
        },
        "concurso": {
          "id": 1,
          "titulo": "Concurso Actualizado"
        },
        "categoria": {
          "id": 1,
          "nombre": "Fotografía de Naturaleza"
        }
      }
    ]
  }
}
```

---

## 🔑 Características del Proxy

### Ventajas

✅ **Sin autenticación:** Las URLs funcionan directamente en el navegador
✅ **Cache:** Headers de cache configurados (1 año)
✅ **Seguridad:** El API key de Immich no se expone al cliente
✅ **Simplicidad:** URLs limpias y fáciles de usar

### Cómo Funciona

1. Cliente solicita: `GET /proxy/media/{assetId}`
2. Servidor agrega automáticamente el `x-api-key` de Immich
3. Servidor hace request a Immich: `GET https://medios.webfestival.art/api/asset/file/{assetId}`
4. Servidor retorna la imagen al cliente

---

## 📁 Organización de Álbumes en Immich

### Formato Automático

Cuando se confirma una subida, el sistema crea automáticamente un álbum con el formato:

```
Concurso: [Título del Concurso] / Usuario: [Nombre del Usuario]
```

### Ejemplos

- `Concurso: Fotografía de Naturaleza 2024 / Usuario: Carlos Arturo Hernandez`
- `Concurso: Video Documental 2024 / Usuario: María García`
- `Concurso: Cortometraje Experimental / Usuario: Juan Pérez`

### Comportamiento

- ✅ Si el álbum ya existe, se reutiliza
- ✅ Todos los medios del usuario para ese concurso van al mismo álbum
- ✅ El `immich_album_id` se guarda en la base de datos

---

## 🧪 Testing en Postman

### Flujo Recomendado

1. **Ejecutar colección completa:**
   - Abrir: `WebFestival-API-Flujo-Completo-Subida.postman_collection.json`
   - Ejecutar todos los pasos en orden
   - Verificar que cada paso guarde las variables correctamente

2. **Probar consulta de imágenes:**
   - Ejecutar sección "8️⃣ Consultar Imágenes"
   - Copiar URLs y abrirlas en el navegador
   - Verificar que las imágenes se muestren sin error

3. **Verificar álbum en Immich:**
   - Ir a `https://medios.webfestival.art`
   - Login con credenciales de admin
   - Ir a "Álbumes"
   - Verificar que existe el álbum con formato correcto
   - Verificar que la foto está dentro del álbum

---

## 🐛 Troubleshooting

### Error: "Cannot POST /api/asset/upload"

**Causa:** URL incorrecta de Immich

**Solución:** Usar `/api/assets` (plural)

### Error: "IMMICH_API_KEY no está configurado"

**Causa:** Variable de entorno faltante

**Solución:** 
1. Agregar en `.env`: `IMMICH_API_KEY=tu_key`
2. Reiniciar servidor

### Error: "Do not know how to serialize a BigInt"

**Causa:** Campo `tamano_archivo` no convertido

**Solución:** Ya corregido en `concurso.service.ts` y `media.service.ts`

### Imagen no se muestra en navegador

**Causa:** URL incorrecta o servidor no corriendo

**Solución:**
1. Verificar que el servidor esté corriendo
2. Usar URLs del proxy: `/proxy/media/{assetId}`
3. Verificar que `SERVER_URL` esté configurado en `.env`

---

## ✅ Checklist de Verificación

- [ ] Colección de Postman actualizada
- [ ] URL de Immich corregida a `/api/assets`
- [ ] Sección de consulta de imágenes agregada
- [ ] Variables de entorno configuradas (`IMMICH_API_KEY`, `IMMICH_SERVER_URL`)
- [ ] Servidor reiniciado
- [ ] Flujo completo probado en Postman
- [ ] Imágenes visibles en navegador vía proxy
- [ ] Álbumes creados correctamente en Immich
- [ ] URLs funcionan sin autenticación

---

**Fecha:** Noviembre 11, 2024  
**Estado:** ✅ Actualizado  
**Próximo Paso:** Testing completo del flujo
