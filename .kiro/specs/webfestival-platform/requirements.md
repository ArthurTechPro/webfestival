# Documento de Requisitos - Plataforma WebFestival

## Introducción

WebFestival es una plataforma web completa para la gestión de concursos de fotografía online. La plataforma debe ser escalable, con una arquitectura API-first que permita servir tanto a la aplicación web actual como a una futura aplicación móvil nativa. El sistema gestiona tres tipos de usuarios principales: participantes (fotógrafos), jurados y administradores, cada uno con funcionalidades específicas para el flujo completo de un concurso fotográfico.

## Requisitos

### Requisito 1

**Historia de Usuario:** Como participante (fotógrafo), quiero poder crear una cuenta y gestionar mi perfil, para poder participar en los concursos de fotografía.

#### Criterios de Aceptación

1. CUANDO un usuario accede al registro ENTONCES el sistema DEBERÁ permitir crear una cuenta con email, nombre, contraseña y opcionalmente foto de perfil y biografía
2. CUANDO un usuario se registra ENTONCES el sistema DEBERÁ asignar automáticamente el rol "PARTICIPANTE"
3. CUANDO un participante accede a su perfil ENTONCES el sistema DEBERÁ permitir editar nombre, biografía y foto de perfil
4. CUANDO un participante intenta usar un email ya registrado ENTONCES el sistema DEBERÁ mostrar un error de validación

### Requisito 2

**Historia de Usuario:** Como participante, quiero ver y inscribirme en los concursos activos, para poder participar en las competencias que me interesen.

#### Criterios de Aceptación

1. CUANDO un participante accede a la lista de concursos ENTONCES el sistema DEBERÁ mostrar todos los concursos con estado "Activo"
2. CUANDO un participante ve un concurso ENTONCES el sistema DEBERÁ mostrar título, descripción, reglas, fechas de inicio y fin, e imagen del concurso
3. CUANDO un participante se inscribe en un concurso ENTONCES el sistema DEBERÁ registrar la inscripción con fecha actual
4. SI un participante ya está inscrito en un concurso ENTONCES el sistema DEBERÁ mostrar el estado de inscripción y no permitir inscripción duplicada

### Requisito 3

**Historia de Usuario:** Como participante, quiero poder subir mis fotografías a las categorías correspondientes, para participar en el concurso con mis mejores trabajos.

#### Criterios de Aceptación

1. CUANDO un participante inscrito accede a un concurso ENTONCES el sistema DEBERÁ mostrar todas las categorías disponibles
2. CUANDO un participante sube una fotografía ENTONCES el sistema DEBERÁ generar una URL pre-firmada para subida directa al almacenamiento
3. CUANDO la subida es exitosa ENTONCES el sistema DEBERÁ guardar la foto_url, título, concurso_id y categoria_id en la base de datos
4. CUANDO un participante intenta subir sin estar inscrito ENTONCES el sistema DEBERÁ denegar el acceso

### Requisito 4

**Historia de Usuario:** Como participante, quiero ver el estado y los resultados de mis envíos, para hacer seguimiento de mi participación en los concursos.

#### Criterios de Aceptación

1. CUANDO un participante accede a "Mis Envíos" ENTONCES el sistema DEBERÁ mostrar todas sus fotografías enviadas con estado del concurso solo se permiten 3 envios.
2. CUANDO un concurso está en evaluación ENTONCES el sistema DEBERÁ mostrar el estado "En Calificación"
3. CUANDO un concurso finaliza ENTONCES el sistema DEBERÁ mostrar los resultados y calificaciones recibidas
4. CUANDO hay comentarios de jurados ENTONCES el sistema DEBERÁ mostrarlos junto con las calificaciones

### Requisito 5

**Historia de Usuario:** Como jurado, quiero acceder a un panel para ver las fotografías que me han sido asignadas, para poder evaluarlas según mi área de especialización.

#### Criterios de Aceptación

1. CUANDO un jurado accede al sistema ENTONCES el sistema DEBERÁ mostrar solo las categorías asignadas a él
2. CUANDO un jurado ve sus asignaciones ENTONCES el sistema DEBERÁ mostrar todas las fotografías de las categorías correspondientes
3. CUANDO un jurado accede a una fotografía ENTONCES el sistema DEBERÁ mostrar la imagen, título y datos del concurso
4. SI un jurado no tiene asignaciones ENTONCES el sistema DEBERÁ mostrar un mensaje informativo

### Requisito 6

**Historia de Usuario:** Como jurado, quiero poder calificar y dejar comentarios en cada fotografía, para proporcionar evaluación profesional a los participantes.

#### Criterios de Aceptación

1. CUANDO un jurado evalúa una fotografía ENTONCES el sistema DEBERÁ permitir calificar enfoque, exposición, composición, creatividad e impacto visual (escala 1-10)
2. CUANDO un jurado envía calificación ENTONCES el sistema DEBERÁ requerir puntuación en los cinco criterios
3. CUANDO un jurado deja comentarios ENTONCES el sistema DEBERÁ permitir texto libre opcional
4. CUANDO un jurado ya calificó una foto ENTONCES el sistema DEBERÁ permitir editar la calificación hasta que el concurso cierre

### Requisito 7

**Historia de Usuario:** Como administrador, quiero un panel de control para gestionar concursos, categorías, usuarios y jurados, para tener control completo sobre la plataforma.

#### Criterios de Aceptación

1. CUANDO un administrador accede al panel ENTONCES el sistema DEBERÁ mostrar opciones para gestionar concursos, categorías, usuarios y jurados
2. CUANDO un administrador crea un concurso ENTONCES el sistema DEBERÁ permitir definir título, descripción, reglas, fechas y imagen
3. CUANDO un administrador gestiona categorías ENTONCES el sistema DEBERÁ permitir crear, editar y eliminar categorías por concurso
4. CUANDO un administrador asigna jurados ENTONCES el sistema DEBERÁ permitir asignar usuarios con rol JURADO a categorías específicas

### Requisito 8

**Historia de Usuario:** Como administrador, quiero poder monitorear el progreso de las evaluaciones y anunciar a los ganadores, para gestionar el ciclo completo del concurso.

#### Criterios de Aceptación

1. CUANDO un administrador ve el progreso ENTONCES el sistema DEBERÁ mostrar estadísticas de calificaciones completadas por categoría
2. CUANDO todas las evaluaciones están completas ENTONCES el sistema DEBERÁ permitir cambiar el estado del concurso a "Finalizado"
3. CUANDO un concurso finaliza ENTONCES el sistema DEBERÁ calcular automáticamente los puntajes finales por fotografía
4. CUANDO se anuncian ganadores ENTONCES el sistema DEBERÁ hacer visibles los resultados a todos los participantes

### Requisito 9

**Historia de Usuario:** Como sistema, necesito manejar la autenticación y autorización de usuarios, para garantizar la seguridad y el acceso apropiado según roles.

#### Criterios de Aceptación

1. CUANDO un usuario se autentica ENTONCES el sistema DEBERÁ generar un token JWT válido
2. CUANDO se accede a rutas protegidas ENTONCES el sistema DEBERÁ validar el token y el rol del usuario
3. CUANDO un token expira ENTONCES el sistema DEBERÁ requerir nueva autenticación
4. CUANDO un usuario intenta acceder sin permisos ENTONCES el sistema DEBERÁ denegar el acceso con error 403

### Requisito 10

**Historia de Usuario:** Como sistema, necesito gestionar el almacenamiento de fotografías de manera eficiente y segura, para manejar archivos de gran tamaño sin impactar el rendimiento.

#### Criterios de Aceptación

1. CUANDO se solicita subir una foto ENTONCES el sistema DEBERÁ generar una URL pre-firmada temporal
2. CUANDO la subida es directa al almacenamiento ENTONCES el sistema DEBERÁ validar la notificación de éxito
3. CUANDO se almacena la referencia ENTONCES el sistema DEBERÁ guardar solo la URL en la base de datos
4. CUANDO se accede a una foto ENTONCES el sistema DEBERÁ servir la URL del almacenamiento externo

### Requisito 11

**Historia de Usuario:** Como participante, quiero poder compartir mis fotografías ganadoras en redes sociales, para promocionar mis logros y atraer más seguidores a mi trabajo.

#### Criterios de Aceptación

1. CUANDO un participante gana un concurso ENTONCES el sistema DEBERÁ mostrar botones para compartir en Facebook, Instagram, Twitter y LinkedIn
2. CUANDO se comparte una fotografía ENTONCES el sistema DEBERÁ generar un enlace público con la imagen, título del concurso y posición obtenida
3. CUANDO se comparte ENTONCES el sistema DEBERÁ incluir hashtags relevantes del concurso y la plataforma
4. CUANDO un usuario no autenticado accede al enlace compartido ENTONCES el sistema DEBERÁ mostrar la fotografía con información básica del concurso

### Requisito 12

**Historia de Usuario:** Como usuario del sistema, quiero recibir notificaciones importantes sobre concursos y evaluaciones, para estar siempre informado de eventos relevantes.

#### Criterios de Aceptación

1. CUANDO se acerca la fecha límite de un concurso inscrito ENTONCES el sistema DEBERÁ enviar notificación por email 48 horas antes
2. CUANDO un jurado completa la evaluación de mis fotografías ENTONCES el sistema DEBERÁ notificarme por email
3. CUANDO se publican los resultados de un concurso ENTONCES el sistema DEBERÁ enviar notificación a todos los participantes
4. CUANDO un administrador crea un nuevo concurso ENTONCES el sistema DEBERÁ notificar a todos los usuarios registrados

### Requisito 13

**Historia de Usuario:** Como visitante de la plataforma, quiero ver una galería pública con las mejores fotografías, para inspirarme y conocer el nivel de calidad de los concursos.

#### Criterios de Aceptación

1. CUANDO un visitante accede a la galería pública ENTONCES el sistema DEBERÁ mostrar fotografías ganadoras de concursos finalizados
2. CUANDO se muestra una fotografía ENTONCES el sistema DEBERÁ incluir título, nombre del fotógrafo, concurso y posición obtenida
3. CUANDO un visitante hace clic en una fotografía ENTONCES el sistema DEBERÁ mostrar detalles completos y comentarios de jurados
4. CUANDO se filtra la galería ENTONCES el sistema DEBERÁ permitir filtrar por categoría, concurso y año

### Requisito 14

**Historia de Usuario:** Como administrador, quiero acceder a métricas y estadísticas detalladas de la plataforma, para tomar decisiones informadas sobre la gestión de concursos.

#### Criterios de Aceptación

1. CUANDO un administrador accede al dashboard de métricas ENTONCES el sistema DEBERÁ mostrar número total de usuarios, concursos activos y fotografías subidas
2. CUANDO se consultan métricas de participación ENTONCES el sistema DEBERÁ mostrar gráficos de inscripciones por concurso y categoría
3. CUANDO se analizan tendencias ENTONCES el sistema DEBERÁ mostrar estadísticas de crecimiento mensual de usuarios y participación
4. CUANDO se evalúa el rendimiento de jurados ENTONCES el sistema DEBERÁ mostrar tiempo promedio de evaluación y completitud de calificaciones

### Requisito 15

**Historia de Usuario:** Como participante, quiero poder seguir a otros fotógrafos y ver sus trabajos, para crear una comunidad y aprender de otros artistas.

#### Criterios de Aceptación

1. CUANDO un participante ve el perfil de otro fotógrafo ENTONCES el sistema DEBERÁ mostrar un botón "Seguir"
2. CUANDO sigo a un fotógrafo ENTONCES el sistema DEBERÁ notificar al fotógrafo seguido
3. CUANDO accedo a mi feed ENTONCES el sistema DEBERÁ mostrar las nuevas fotografías de los fotógrafos que sigo
4. CUANDO un fotógrafo que sigo gana un concurso ENTONCES el sistema DEBERÁ mostrar la notificación en mi feed

### Requisito 16

**Historia de Usuario:** Como participante, quiero poder comentar en las fotografías de otros participantes después de que termine el concurso, para crear interacción y feedback de la comunidad.

#### Criterios de Aceptación

1. CUANDO un concurso finaliza ENTONCES el sistema DEBERÁ habilitar comentarios públicos en todas las fotografías participantes
2. CUANDO escribo un comentario ENTONCES el sistema DEBERÁ requerir que esté autenticado y mostrar mi nombre y foto de perfil
3. CUANDO se publica un comentario ENTONCES el sistema DEBERÁ notificar al autor de la fotografía
4. CUANDO hay comentarios inapropiados ENTONCES el sistema DEBERÁ permitir reportarlos para revisión de administradores

### Requisito 17

**Historia de Usuario:** Como participante usando la aplicación móvil o aplicacion web, quiero poder subir fotografías directamente desde mi dispositivo a un servidor independiente de Immich, para tener una experiencia fluida y segura de carga de archivos con gestión avanzada de metadatos.

#### Criterios de Aceptación

1. CUANDO subo una foto desde la app móvil o la aplicacion web ENTONCES el sistema DEBERÁ conectarse a un servidor Immich independiente configurado específicamente para WebFestival
2. CUANDO la subida es exitosa ENTONCES el servidor Immich DEBERÁ generar un enlace público seguro y extraer metadatos EXIF automáticamente
3. CUANDO se obtiene el enlace ENTONCES el sistema DEBERÁ almacenar la URL y metadatos relevantes en la base de datos de WebFestival
4. CUANDO se visualiza una fotografía ENTONCES el sistema DEBERÁ cargar la imagen directamente desde el servidor Immich usando el enlace almacenado

### Requisito 18

**Historia de Usuario:** Como administrador del sistema, quiero que la configuración de conexión y seguridad con Immich esté completamente implementada, para garantizar la integridad, disponibilidad y gestión avanzada de las fotografías.

#### Criterios de Aceptación

1. CUANDO se configura la conexión ENTONCES el sistema DEBERÁ establecer autenticación segura con el servidor Immich usando API keys
2. CUANDO se sube un archivo ENTONCES el sistema DEBERÁ validar formato, tamaño y aprovechar las capacidades de procesamiento automático de Immich
3. CUANDO hay errores de conexión ENTONCES el sistema DEBERÁ implementar reintentos automáticos y notificar al usuario en caso de falla persistente
4. CUANDO se accede a una imagen ENTONCES el sistema DEBERÁ aprovechar las capacidades de caché y optimización nativas de Immich

### Requisito 19

**Historia de Usuario:** Como visitante de la web, quiero acceder a una página estática informativa sobre WebFestival, para conocer la plataforma, concursos destacados y cómo participar.

#### Criterios de Aceptación

1. CUANDO un visitante accede a la página estática ENTONCES el sistema DEBERÁ mostrar información sobre la plataforma, misión y beneficios
2. CUANDO se muestran concursos destacados ENTONCES el sistema DEBERÁ obtener datos en tiempo real de la base de datos de WebFestival
3. CUANDO un visitante quiere registrarse ENTONCES el sistema DEBERÁ redirigir a la aplicación principal de WebFestival al formulario de registro.
4. CUANDO se carga la página ENTONCES el sistema DEBERÁ optimizar para SEO con meta tags, structured data y sitemap

### Requisito 20

**Historia de Usuario:** Como administrador de contenido con rol CONTENT_ADMIN, quiero gestionar el contenido de la página estática desde un mini CMS integrado, para mantener la información actualizada sin necesidad de conocimientos técnicos.

#### Criterios de Aceptación

1. CUANDO accedo al mini CMS ENTONCES el sistema DEBERÁ mostrar un editor WYSIWYG para cada sección de contenido
2. CUANDO subo imágenes ENTONCES el sistema DEBERÁ integrarlas con Immich y generar URLs optimizadas
3. CUANDO reordeno secciones ENTONCES el sistema DEBERÁ permitir cambiar el orden de visualización mediante drag & drop
4. CUANDO publico cambios ENTONCES el sistema DEBERÁ actualizar inmediatamente la página estática y registrar el usuario que hizo el cambio

### Requisito 23

**Historia de Usuario:** Como sistema, necesito gestionar roles específicos para administración de contenido, para separar las responsabilidades de gestión técnica y gestión de contenido.

#### Criterios de Aceptación

1. CUANDO se asigna el rol CONTENT_ADMIN ENTONCES el sistema DEBERÁ permitir acceso solo al mini CMS y gestión de contenido estático
2. CUANDO un CONTENT_ADMIN accede al sistema ENTONCES el sistema DEBERÁ mostrar únicamente las funcionalidades de gestión de contenido
3. CUANDO se realizan cambios de contenido ENTONCES el sistema DEBERÁ registrar qué usuario CONTENT_ADMIN realizó la modificación
4. CUANDO un ADMIN gestiona usuarios ENTONCES el sistema DEBERÁ permitir asignar y revocar el rol CONTENT_ADMIN

### Requisito 21

**Historia de Usuario:** Como administrador del sistema, quiero configurar límites de tamaño y peso para las fotografías, para optimizar el rendimiento de la plataforma y controlar el uso de almacenamiento.

#### Criterios de Aceptación

1. CUANDO se configura la aplicación ENTONCES el sistema DEBERÁ permitir establecer tamaño máximo de archivo (ej: 10MB) y dimensiones máximas (ej: 4000x4000px)
2. CUANDO un usuario intenta subir una foto que excede los límites ENTONCES el sistema DEBERÁ mostrar error específico con los límites permitidos
3. CUANDO se sube una foto válida ENTONCES el sistema DEBERÁ generar automáticamente versiones optimizadas (thumbnail 300x300px, preview 800x800px, original)
4. CUANDO se almacenan las configuraciones ENTONCES el sistema DEBERÁ guardar los límites en la base de datos para permitir ajustes dinámicos por concurso

### Requisito 22

**Historia de Usuario:** Como sistema, necesito optimizar automáticamente las imágenes subidas, para mejorar los tiempos de carga y reducir el uso de ancho de banda.

#### Criterios de Aceptación

1. CUANDO se sube una fotografía ENTONCES el sistema DEBERÁ comprimir automáticamente la imagen manteniendo calidad visual aceptable
2. CUANDO se genera el thumbnail ENTONCES el sistema DEBERÁ crear una versión de 300x300px optimizada para listados y galerías
3. CUANDO se genera el preview ENTONCES el sistema DEBERÁ crear una versión de 800x800px para visualización rápida en modales
4. CUANDO se sirven las imágenes ENTONCES el sistema DEBERÁ seleccionar automáticamente la versión apropiada según el contexto de uso