# Implementation Plan: Sistema Seguro de Subida de Medios

- [x] 1. Configurar infraestructura base para subida de medios
  - Crear configuración de Multer para manejo de archivos multipart
  - Configurar límites de tamaño y tipos de archivo permitidos
  - Agregar variables de entorno para configuración de uploads
  - _Requirements: 1.1, 1.2, 5.1, 5.2_

- [x] 2. Implementar clases de error personalizadas
  - Crear `MediaUploadError` como clase base
  - Implementar `FileValidationError` para errores de validación (400)
  - Implementar `ImmichUploadError` para errores de comunicación con Immich (502)
  - Implementar `DatabaseSaveError` para errores de persistencia (500)
  - Implementar `ImmichUnavailableError` para servicio no disponible (503)
  - _Requirements: 3.1, 4.3, 5.5_

- [ ] 3. Crear middleware de validación de archivos
  - Implementar `validateMediaFile` middleware que valide tipo MIME
  - Validar extensión de archivo contra lista permitida
  - Validar tamaño de archivo contra límite configurado
  - Retornar errores descriptivos con código 400 para archivos inválidos
  - _Requirements: 2.4, 5.1, 5.2_

- [x] 4. Extender ImmichService con funcionalidad de subida

  - [x] 4.1 Implementar método `uploadAsset` para subir archivos a Immich

    - Crear FormData con el archivo y metadata
    - Hacer POST a `/api/assets` de Immich con API key
    - Parsear respuesta y extraer asset ID y URLs
    - _Requirements: 2.1, 2.2_
  
  - [x] 4.2 Implementar método `deleteAsset` para rollback
    - Hacer DELETE a `/api/assets/{id}` de Immich
    - Manejar errores silenciosamente para no bloquear rollback
    - _Requirements: 3.5_
  
  - [x] 4.3 Implementar método `getAssetInfo` para obtener metadata
    - Hacer GET a `/api/assets/{id}` de Immich
    - Retornar información completa del asset
    - _Requirements: 2.2, 3.2, 3.3_
  
  - [x] 4.4 Implementar método `generateAssetUrl` para construir URLs
    - Generar URL del asset original
    - Generar URL del thumbnail
    - Generar URL del preview si aplica
    - _Requirements: 2.2, 3.2, 4.2_

- [x] 5. Crear MediaUploadService con lógica de negocio

  - [x] 5.1 Implementar método `uploadMedia` principal
    - Validar que el usuario esté autenticado
    - Llamar a `uploadToImmich` para subir el archivo
    - Llamar a `saveMediaMetadata` para guardar en DB
    - Implementar try-catch con rollback en caso de error
    - Retornar respuesta formateada al cliente
    - _Requirements: 1.1, 1.3, 2.1, 3.1, 4.1_
  
  - [x] 5.2 Implementar método privado `uploadToImmich`
    - Preparar buffer del archivo para Immich
    - Llamar a `immichService.uploadAsset` con reintentos
    - Extraer URLs y metadata de la respuesta
    - Aplicar timeout de 30 segundos
    - _Requirements: 2.1, 2.2, 4.4, 5.3_

  - [x] 5.3 Implementar método privado `saveMediaMetadata`
    - Crear registro en tabla `medios` con Prisma
    - Guardar immich_asset_id, medio_url, thumbnail_url
    - Guardar metadata en campo JSON
    - Asociar con usuario_id del token JWT
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [x] 5.4 Implementar método privado `rollbackImmichUpload`
    - Llamar a `immichService.deleteAsset` con el asset ID
    - Registrar en logs el intento de rollback
    - No lanzar error si el rollback falla
    - _Requirements: 3.5_
  
  - [x] 5.5 Implementar método `getMediaById`
    - Consultar medio por ID en base de datos
    - Incluir información del usuario relacionado
    - Retornar 404 si no existe
    - _Requirements: 4.2_
 
  - [x] 5.6 Implementar método `getUserMedia` con paginación
    - Consultar medios del usuario con filtros opcionales
    - Implementar paginación (page, limit)
    - Filtrar por tipo de medio si se especifica
    - Retornar lista con metadata de paginación
    - _Requirements: 4.2_

- [ ] 6. Crear MediaUploadController para manejar peticiones HTTP
  - [x] 6.1 Implementar endpoint POST `/api/v1/media/upload`
    - Aplicar middleware de autenticación JWT
    - Aplicar middleware de validación de archivos
    - Aplicar rate limiting específico para uploads
    - Extraer userId del token JWT
    - Llamar a `mediaUploadService.uploadMedia`
    - Retornar respuesta 201 con metadata del medio
    - Manejar errores y retornar códigos HTTP apropiados
    - _Requirements: 1.1, 1.3, 1.4, 2.1, 4.1, 4.2, 4.3_
  
  - [x] 6.2 Implementar endpoint GET `/api/v1/media/:id`
    - Aplicar middleware de autenticación JWT
    - Llamar a `mediaUploadService.getMediaById`
    - Retornar información completa del medio
    - _Requirements: 4.2_
  
  
  - [x] 6.3 Implementar endpoint GET `/api/v1/media/user/:userId`
    - Aplicar middleware de autenticación JWT
    - Validar query parameters (page, limit, tipoMedio)
    - Llamar a `mediaUploadService.getUserMedia`
    - Retornar lista paginada de medios
    - _Requirements: 4.2_

- [x] 7. Configurar rutas y middleware en la aplicación
  - Crear archivo de rutas `media-upload.routes.ts`
  - Registrar rutas en el router principal de la API
  - Configurar Multer middleware para manejo de multipart/form-data
  - Aplicar middleware `requireImmichConnection` a las rutas
  - _Requirements: 1.1, 1.3, 2.1_

- [x] 8. Agregar logging y monitoreo



  - Registrar inicio de subida con metadata del archivo
  - Registrar subida exitosa con duración y IDs
  - Registrar errores con contexto completo (stage, userId, filename)
  - Agregar métricas de tiempo de procesamiento
  - _Requirements: 5.4_

- [ ]* 9. Crear tests de integración
  - Escribir test para flujo completo de subida exitosa
  - Escribir test para rollback cuando falla guardado en DB
  - Escribir test para manejo de Immich no disponible
  - Escribir test para validación de archivos inválidos
  - Escribir test para validación de autenticación
  - _Requirements: 1.3, 1.4, 2.3, 3.5, 4.3, 5.1, 5.2, 5.3, 5.5_

- [x] 10. Documentar API con Swagger

  - Agregar anotaciones JSDoc para endpoint de upload
  - Documentar request multipart/form-data
  - Documentar respuestas exitosas y de error
  - Agregar ejemplos de uso
  - Agregar endpoint y actaulizar los enpont de la carpeta 'postman/'
  - Verificar que todos lo enponts y actulizarlos, adicional al flojo completo de emmish. 
  - _Requirements: 4.1, 4.2, 4.3_
