# Requirements Document

## Introduction

Este documento define los requisitos para implementar un sistema seguro de subida de medios a Immich a través de la API backend. El objetivo principal es evitar exponer las credenciales de Immich en las aplicaciones cliente, centralizando la gestión de medios en el servidor y simplificando el proceso de subida desde los aplicativos.

## Glossary

- **API Backend**: El servidor que actúa como intermediario entre las aplicaciones cliente y Immich
- **Immich**: Sistema de gestión de medios donde se almacenan las imágenes y videos
- **Cliente**: Aplicación móvil o web que consume la API Backend
- **Media Upload Endpoint**: Endpoint de la API Backend que recibe archivos multimedia
- **Immich API Key**: Credencial de acceso a Immich que debe mantenerse segura en el servidor
- **URL Temporal**: URL generada por Immich para acceder a un medio subido
- **Base de Datos**: Sistema de almacenamiento de metadatos de medios en el Backend

## Requirements

### Requirement 1

**User Story:** Como desarrollador de aplicaciones cliente, quiero subir medios a través de la API Backend sin necesidad de conocer las credenciales de Immich, para mantener la seguridad del sistema.

#### Acceptance Criteria

1. WHEN el Cliente envía un archivo multimedia al Media Upload Endpoint, THE API Backend SHALL recibir el archivo sin requerir credenciales de Immich del Cliente
2. THE API Backend SHALL almacenar la Immich API Key de forma segura en variables de entorno del servidor
3. THE API Backend SHALL validar que el Cliente esté autenticado antes de aceptar archivos multimedia
4. THE API Backend SHALL rechazar solicitudes de subida de medios que no incluyan un token de autenticación válido del Cliente

### Requirement 2

**User Story:** Como API Backend, quiero procesar y subir medios a Immich de forma automática, para centralizar la gestión de almacenamiento multimedia.

#### Acceptance Criteria

1. WHEN el API Backend recibe un archivo multimedia válido, THE API Backend SHALL subir el archivo a Immich utilizando la Immich API Key almacenada en el servidor
2. WHEN Immich confirma la subida exitosa, THE API Backend SHALL obtener la URL Temporal y metadatos del medio desde Immich
3. IF la subida a Immich falla, THEN THE API Backend SHALL retornar un error descriptivo al Cliente sin exponer detalles internos de Immich
4. THE API Backend SHALL soportar formatos de imagen comunes (JPEG, PNG, HEIC, WebP) y formatos de video comunes (MP4, MOV, AVI)

### Requirement 3

**User Story:** Como API Backend, quiero almacenar los metadatos de medios subidos en mi Base de Datos, para mantener un registro sincronizado con Immich.

#### Acceptance Criteria

1. WHEN Immich confirma la subida exitosa de un medio, THE API Backend SHALL guardar en la Base de Datos el identificador único del medio en Immich
2. THE API Backend SHALL almacenar en la Base de Datos la URL Temporal generada por Immich para el medio
3. THE API Backend SHALL registrar en la Base de Datos metadatos adicionales incluyendo nombre de archivo, tipo de contenido, tamaño y fecha de subida
4. THE API Backend SHALL asociar cada registro de medio en la Base de Datos con el usuario que lo subió
5. WHEN la transacción de guardado en Base de Datos falla, THE API Backend SHALL intentar eliminar el medio de Immich para mantener consistencia

### Requirement 4

**User Story:** Como Cliente, quiero recibir una respuesta inmediata después de subir un medio, para confirmar que la operación fue exitosa y obtener la información del medio.

#### Acceptance Criteria

1. WHEN la subida y registro del medio se completan exitosamente, THE API Backend SHALL retornar al Cliente un código de estado HTTP 201 (Created)
2. THE API Backend SHALL incluir en la respuesta exitosa el identificador del medio, la URL Temporal y metadatos relevantes
3. WHEN ocurre un error durante el proceso, THE API Backend SHALL retornar un código de estado HTTP apropiado (400, 401, 413, 500) con un mensaje de error descriptivo
4. THE API Backend SHALL completar el proceso de subida en un tiempo máximo de 30 segundos para archivos de hasta 50MB

### Requirement 5

**User Story:** Como administrador del sistema, quiero que el proceso de subida sea eficiente y maneje errores correctamente, para garantizar la confiabilidad del servicio.

#### Acceptance Criteria

1. THE API Backend SHALL validar el tamaño del archivo antes de procesarlo, rechazando archivos que excedan el límite configurado
2. THE API Backend SHALL validar el tipo MIME del archivo para asegurar que sea un formato multimedia soportado
3. WHEN ocurre un error de red al comunicarse con Immich, THE API Backend SHALL reintentar la operación hasta 3 veces con backoff exponencial
4. THE API Backend SHALL registrar en logs todos los intentos de subida, incluyendo éxitos, fallos y detalles de errores
5. IF el API Backend no puede conectarse con Immich después de los reintentos, THEN THE API Backend SHALL retornar un error 503 (Service Unavailable) al Cliente