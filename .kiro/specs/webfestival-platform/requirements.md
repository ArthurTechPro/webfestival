# Documento de Requisitos - Plataforma WebFestival

## Introducción

WebFestival es un ecosistema completo de aplicaciones para la gestión de concursos multimedia online que conecta artistas creativos (fotógrafos, videomakers, músicos, cineastas), jurados profesionales y organizadores en un ambiente colaborativo y competitivo. El sistema está dividido en tres proyectos independientes pero interconectados:

1. **webfestival-api**: API backend desarrollada con Node.js 22+, Express.js 4.17+ y Prisma 5+ + PostgreSQL 14+ que centraliza toda la lógica de negocio
2. **webfestival-app**: Aplicación React 19+ que consume la API y proporciona interfaces especializadas para participantes, jurados y administradores
3. **webfestival-cms**: Landing page con Next.js 15+ que incluye CMS dinámico y blog, también consumiendo la API

El sistema gestiona cuatro tipos de usuarios principales: participantes (artistas creativos), jurados especializados por tipo de medio, administradores y administradores de contenido (CONTENT_ADMIN), cada uno con funcionalidades específicas para el flujo completo de un concurso multimedia. La plataforma integra Immich ([https://immich.app/](https://immich.app/)) para gestión inteligente de medios multimedia con extracción automática de metadatos y está diseñada con arquitectura API-first para máxima escalabilidad y flexibilidad.

**Visión del Producto**: Crear la plataforma líder en concursos multimedia online que facilite el descubrimiento de talento creativo emergente en múltiples disciplinas (fotografía, video, audio, cine) y genere una comunidad activa de creadores y profesionales del sector con contenido educativo continuo.

## Requisitos

### Requisito 1

**Historia de Usuario:** Como participante (artista creativo), quiero poder crear una cuenta y gestionar mi perfil, para poder participar en los concursos multimedia.

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

**Historia de Usuario:** Como participante (artista creativo), quiero poder subir mis obras multimedia (fotografías, videos, audios, cortos de cine) a las categorías correspondientes, para participar en el concurso con mis mejores trabajos creativos.

#### Criterios de Aceptación

1. CUANDO un participante inscrito accede a un concurso ENTONCES el sistema DEBERÁ mostrar todas las categorías disponibles organizadas por tipo de medio
2. CUANDO un participante sube un medio ENTONCES el sistema DEBERÁ conectarse con Immich para generar una URL segura y extraer metadatos automáticamente (EXIF para imágenes, metadata para videos/audios)
3. CUANDO la subida es exitosa ENTONCES el sistema DEBERÁ guardar la medio_url, título, tipo_medio, concurso_id, categoria_id y metadatos, generando versiones optimizadas (thumbnails, previews) según el tipo de medio
4. CUANDO un participante intenta subir más de 3 medios por concurso ENTONCES el sistema DEBERÁ mostrar error indicando el límite máximo
5. CUANDO un participante intenta subir sin estar inscrito ENTONCES el sistema DEBERÁ denegar el acceso

### Requisito 4

**Historia de Usuario:** Como participante, quiero ver el estado y los resultados de mis envíos, para hacer seguimiento de mi participación en los concursos.

#### Criterios de Aceptación

1. CUANDO un participante accede a "Mis Envíos" ENTONCES el sistema DEBERÁ mostrar todos sus medios enviados con estado del concurso y límite máximo de 3 envíos por concurso
2. CUANDO un concurso está en evaluación ENTONCES el sistema DEBERÁ mostrar el estado "En Calificación"
3. CUANDO un concurso finaliza ENTONCES el sistema DEBERÁ mostrar los resultados y calificaciones recibidas con todos los criterios evaluados según el tipo de medio
4. CUANDO hay comentarios de jurados ENTONCES el sistema DEBERÁ mostrarlos junto con las calificaciones

### Requisito 5

**Historia de Usuario:** Como jurado, quiero acceder a un panel para ver los medios que me han sido asignados, para poder evaluarlos según mi área de especialización.

#### Criterios de Aceptación

1. CUANDO un jurado accede al sistema ENTONCES el sistema DEBERÁ mostrar solo las categorías asignadas a él
2. CUANDO un jurado ve sus asignaciones ENTONCES el sistema DEBERÁ mostrar todos los medios de las categorías correspondientes según su especialización
3. CUANDO un jurado accede a un medio ENTONCES el sistema DEBERÁ mostrar el contenido multimedia, título y datos del concurso con reproductor integrado si es necesario
4. SI un jurado no tiene asignaciones ENTONCES el sistema DEBERÁ mostrar un mensaje informativo

### Requisito 6

**Historia de Usuario:** Como jurado, quiero poder calificar y dejar comentarios en cada medio, para proporcionar evaluación profesional a los participantes.

#### Criterios de Aceptación

1. CUANDO un jurado evalúa un medio ENTONCES el sistema DEBERÁ mostrar los criterios dinámicos configurados para ese tipo de medio (escala 1-10 para cada criterio)
2. CUANDO un jurado envía calificación ENTONCES el sistema DEBERÁ requerir puntuación en todos los criterios activos para ese tipo de medio
3. CUANDO un jurado deja comentarios ENTONCES el sistema DEBERÁ permitir texto libre opcional
4. CUANDO un jurado ya calificó un medio ENTONCES el sistema DEBERÁ permitir editar la calificación hasta que el concurso cierre

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
3. CUANDO un concurso finaliza ENTONCES el sistema DEBERÁ calcular automáticamente los puntajes finales por medio
4. CUANDO se anuncian ganadores ENTONCES el sistema DEBERÁ hacer visibles los resultados a todos los participantes

### Requisito 9

**Historia de Usuario:** Como sistema, necesito manejar la autenticación y autorización de usuarios, para garantizar la seguridad y el acceso apropiado según roles.

#### Criterios de Aceptación

1. CUANDO un usuario se autentica ENTONCES el sistema DEBERÁ generar un token JWT válido
2. CUANDO se accede a rutas protegidas ENTONCES el sistema DEBERÁ validar el token y el rol del usuario
3. CUANDO un token expira ENTONCES el sistema DEBERÁ requerir nueva autenticación
4. CUANDO un usuario intenta acceder sin permisos ENTONCES el sistema DEBERÁ denegar el acceso con error 403

### Requisito 10

**Historia de Usuario:** Como sistema, necesito gestionar el almacenamiento de medios multimedia de manera eficiente y segura, para manejar archivos de gran tamaño sin impactar el rendimiento.

#### Criterios de Aceptación

1. CUANDO se solicita subir un medio ENTONCES el sistema DEBERÁ generar una URL pre-firmada temporal
2. CUANDO la subida es directa al almacenamiento ENTONCES el sistema DEBERÁ validar la notificación de éxito
3. CUANDO se almacena la referencia ENTONCES el sistema DEBERÁ guardar solo la URL en la base de datos
4. CUANDO se accede a un medio ENTONCES el sistema DEBERÁ servir la URL del almacenamiento externo

### Requisito 11

**Historia de Usuario:** Como participante, quiero poder compartir mis medios ganadores en redes sociales, para promocionar mis logros y atraer más seguidores a mi trabajo.

#### Criterios de Aceptación

1. CUANDO un participante gana un concurso ENTONCES el sistema DEBERÁ mostrar botones para compartir en Facebook, Instagram, Twitter y LinkedIn
2. CUANDO se comparte un medio ENTONCES el sistema DEBERÁ generar un enlace público con el contenido, título del concurso y posición obtenida
3. CUANDO se comparte ENTONCES el sistema DEBERÁ incluir hashtags relevantes del concurso y la plataforma
4. CUANDO un usuario no autenticado accede al enlace compartido ENTONCES el sistema DEBERÁ mostrar el medio con información básica del concurso

### Requisito 12

**Historia de Usuario:** Como usuario del sistema, quiero recibir notificaciones importantes sobre concursos y evaluaciones, para estar siempre informado de eventos relevantes.

#### Criterios de Aceptación

1. CUANDO se acerca la fecha límite de un concurso inscrito ENTONCES el sistema DEBERÁ enviar notificación por email 48 horas antes
2. CUANDO un jurado completa la evaluación de mis medios ENTONCES el sistema DEBERÁ notificarme por email
3. CUANDO se publican los resultados de un concurso ENTONCES el sistema DEBERÁ enviar notificación a todos los participantes
4. CUANDO un administrador crea un nuevo concurso ENTONCES el sistema DEBERÁ notificar a todos los usuarios registrados

### Requisito 13

**Historia de Usuario:** Como visitante de la plataforma, quiero ver una galería pública multimedia con los mejores trabajos creativos, para inspirarme y conocer el nivel de calidad de los concursos en diferentes disciplinas artísticas.

#### Criterios de Aceptación

1. CUANDO un visitante accede a la galería pública ENTONCES el sistema DEBERÁ mostrar medios ganadores de concursos finalizados (fotografías, videos, audios, cortos de cine)
2. CUANDO se muestra un medio ENTONCES el sistema DEBERÁ incluir título, nombre del artista creativo, tipo de medio, concurso y posición obtenida
3. CUANDO un visitante hace clic en un medio ENTONCES el sistema DEBERÁ mostrar detalles completos, reproductor integrado (para videos/audios) y comentarios de jurados
4. CUANDO se filtra la galería ENTONCES el sistema DEBERÁ permitir filtrar por tipo de medio, categoría, concurso y año

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

**Historia de Usuario:** Como participante usando la aplicación móvil o aplicación web, quiero poder subir fotografías directamente desde mi dispositivo a un servidor independiente de Immich, para tener una experiencia fluida y segura de carga de archivos con gestión avanzada de metadatos.

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
3. CUANDO un visitante quiere registrarse ENTONCES el sistema DEBERÁ redirigir a la aplicación principal de WebFestival mostrando el formulario de registro
4. CUANDO se carga la página ENTONCES el sistema DEBERÁ optimizar para SEO con meta tags, structured data y sitemap

### Requisito 20

**Historia de Usuario:** Como administrador de contenido con rol CONTENT_ADMIN, quiero gestionar el contenido de la página estática desde un mini CMS integrado, para mantener la información actualizada sin necesidad de conocimientos técnicos.

#### Criterios de Aceptación

1. CUANDO accedo al mini CMS ENTONCES el sistema DEBERÁ mostrar un editor WYSIWYG para cada sección de contenido
2. CUANDO subo imágenes ENTONCES el sistema DEBERÁ integrarlas con Immich y generar URLs optimizadas
3. CUANDO reordeno secciones ENTONCES el sistema DEBERÁ permitir cambiar el orden de visualización mediante drag & drop
4. CUANDO publico cambios ENTONCES el sistema DEBERÁ actualizar inmediatamente la página estática y registrar el usuario que hizo el cambio

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

### Requisito 24

**Historia de Usuario:** Como sistema, necesito optimizar las imágenes en formato widescreen para redes sociales y visualización moderna, para mejorar la experiencia visual y compatibilidad con plataformas sociales.

#### Criterios de Aceptación

1. CUANDO se procesa una imagen ENTONCES el sistema DEBERÁ generar automáticamente versiones en formato 16:9 (widescreen)
2. CUANDO se genera el thumbnail ENTONCES el sistema DEBERÁ crear una versión de 400x225px optimizada para listados
3. CUANDO se genera el preview ENTONCES el sistema DEBERÁ crear una versión de 1280x720px para visualización detallada
4. CUANDO se comparte en redes sociales ENTONCES el sistema DEBERÁ usar automáticamente las versiones widescreen optimizadas

### Requisito 23

**Historia de Usuario:** Como administrador del sistema, necesito gestionar roles específicos para administración de contenido, para separar las responsabilidades de gestión técnica y gestión de contenido.

#### Criterios de Aceptación

1. CUANDO se asigna el rol CONTENT_ADMIN ENTONCES el sistema DEBERÁ permitir acceso solo al mini CMS y gestión de contenido estático
2. CUANDO un CONTENT_ADMIN accede al sistema ENTONCES el sistema DEBERÁ mostrar únicamente las funcionalidades de gestión de contenido
3. CUANDO se realizan cambios de contenido ENTONCES el sistema DEBERÁ registrar qué usuario CONTENT_ADMIN realizó la modificación
4. CUANDO un ADMIN gestiona usuarios ENTONCES el sistema DEBERÁ permitir asignar y revocar el rol CONTENT_ADMIN

### Requisito 25

**Historia de Usuario:** Como administrador de contenido (CONTENT_ADMIN), quiero gestionar todo tipo de contenido de forma unificada a través de un CMS dinámico, para mantener tanto la página estática como el blog de la comunidad de manera eficiente y escalable.

#### Criterios de Aceptación

1. CUANDO accedo al sistema CMS ENTONCES el sistema DEBERÁ mostrar una interfaz unificada para gestionar contenido estático, posts de blog y futuras extensiones
2. CUANDO creo contenido ENTONCES el sistema DEBERÁ permitir seleccionar el tipo (página estática, blog post, sección CMS) y mostrar campos apropiados dinámicamente
3. CUANDO trabajo con cualquier tipo de contenido ENTONCES el sistema DEBERÁ proporcionar editor WYSIWYG, gestión de imágenes, categorización flexible y configuración SEO
4. CUANDO guardo cambios ENTONCES el sistema DEBERÁ generar automáticamente slugs únicos y permitir preview en tiempo real sin afectar el contenido publicado

### Requisito 26

**Historia de Usuario:** Como visitante o usuario registrado, quiero leer posts del blog de la comunidad, para mantenerme informado sobre noticias, consejos y eventos relacionados con fotografía.

#### Criterios de Aceptación

1. CUANDO accedo al blog ENTONCES el sistema DEBERÁ mostrar todos los posts publicados ordenados por fecha de publicación más reciente
2. CUANDO leo un post ENTONCES el sistema DEBERÁ mostrar título, contenido, autor, fecha, categoría, etiquetas e imagen destacada
3. CUANDO navego por el blog ENTONCES el sistema DEBERÁ permitir filtrar por categoría, etiqueta, autor y buscar por texto
4. CUANDO accedo desde dispositivos móviles ENTONCES el sistema DEBERÁ mostrar el contenido optimizado para lectura en pantallas pequeñas

### Requisito 27

**Historia de Usuario:** Como usuario registrado, quiero interactuar con cualquier tipo de contenido que permita interacciones, para participar activamente en la comunidad y expresar mi opinión de manera unificada.

#### Criterios de Aceptación

1. CUANDO veo contenido que permite interacciones ENTONCES el sistema DEBERÁ mostrar botones para likes y comentarios de forma consistente independientemente del tipo de contenido
2. CUANDO doy like ENTONCES el sistema DEBERÁ actualizar el contador y registrar mi interacción usando el sistema unificado de likes
3. CUANDO escribo un comentario ENTONCES el sistema DEBERÁ usar el sistema unificado de comentarios con soporte para respuestas anidadas
4. CUANDO reporto contenido inapropiado ENTONCES el sistema DEBERÁ usar el sistema unificado de reportes para cualquier tipo de elemento (contenido o comentario)

### Requisito 28

**Historia de Usuario:** Como administrador de contenido, quiero gestionar la organización del contenido de forma flexible, para mantener una estructura coherente que se adapte a diferentes tipos de contenido y facilite la navegación de los usuarios.

#### Criterios de Aceptación

1. CUANDO organizo contenido ENTONCES el sistema DEBERÁ permitir asignar categorías de texto libre que se adapten al tipo de contenido (ej: "técnicas" para blog, "hero" para página estática)
2. CUANDO uso etiquetas ENTONCES el sistema DEBERÁ proporcionar autocompletado basado en etiquetas existentes y permitir crear nuevas dinámicamente
3. CUANDO filtro contenido ENTONCES el sistema DEBERÁ permitir búsqueda por tipo, categoría, etiquetas y estado de publicación
4. CUANDO visualizo estadísticas ENTONCES el sistema DEBERÁ mostrar métricas unificadas de contenido por tipo, categoría y etiquetas más utilizadas

### Requisito 29

**Historia de Usuario:** Como administrador, quiero moderar comentarios del blog y gestionar reportes, para mantener un ambiente respetuoso y constructivo en la comunidad.

#### Criterios de Aceptación

1. CUANDO accedo al panel de moderación ENTONCES el sistema DEBERÁ mostrar todos los comentarios pendientes de aprobación y reportados
2. CUANDO apruebo un comentario ENTONCES el sistema DEBERÁ hacerlo visible públicamente y notificar al autor del post
3. CUANDO rechazo un comentario ENTONCES el sistema DEBERÁ mantenerlo oculto y opcionalmente notificar al autor del comentario
4. CUANDO reviso reportes ENTONCES el sistema DEBERÁ mostrar el comentario, la razón del reporte y permitir tomar acciones (aprobar, rechazar, eliminar)

### Requisito 30

**Historia de Usuario:** Como visitante interesado, quiero suscribirme a un newsletter para recibir actualizaciones sobre nuevos posts del blog y concursos destacados, para mantenerme informado sin tener que visitar la plataforma constantemente.

#### Criterios de Aceptación

1. CUANDO me suscribo al newsletter ENTONCES el sistema DEBERÁ validar mi email y enviar un correo de confirmación
2. CUANDO confirmo mi suscripción ENTONCES el sistema DEBERÁ activar mi suscripción y enviar un email de bienvenida
3. CUANDO se publican nuevos posts ENTONCES el sistema DEBERÁ enviar un digest semanal con los posts más destacados
4. CUANDO quiero cancelar la suscripción ENTONCES el sistema DEBERÁ proporcionar un enlace de cancelación en cada email

### Requisito 31

**Historia de Usuario:** Como administrador de contenido, quiero acceder a estadísticas del blog, para entender qué tipo de contenido genera más interacción y optimizar la estrategia de contenido.

#### Criterios de Aceptación

1. CUANDO accedo a las estadísticas ENTONCES el sistema DEBERÁ mostrar número total de posts, comentarios, likes y vistas
2. CUANDO analizo el rendimiento ENTONCES el sistema DEBERÁ mostrar los posts más populares, categorías más leídas y tendencias de engagement
3. CUANDO reviso métricas temporales ENTONCES el sistema DEBERÁ mostrar gráficos de actividad por día, semana y mes
4. CUANDO evalúo el crecimiento ENTONCES el sistema DEBERÁ mostrar estadísticas de suscriptores del newsletter y nuevos comentaristas

### Requisito 32

**Historia de Usuario:** Como sistema, necesito optimizar el SEO del blog, para mejorar la visibilidad en motores de búsqueda y atraer más visitantes a la plataforma.

#### Criterios de Aceptación

1. CUANDO se publica un post ENTONCES el sistema DEBERÁ generar automáticamente meta tags optimizados (title, description, keywords)
2. CUANDO se indexa contenido ENTONCES el sistema DEBERÁ crear structured data (JSON-LD) para mejorar la comprensión de los motores de búsqueda
3. CUANDO se genera el sitemap ENTONCES el sistema DEBERÁ incluir todas las URLs del blog con fechas de última modificación
4. CUANDO se comparte en redes sociales ENTONCES el sistema DEBERÁ generar Open Graph tags optimizados con imagen, título y descripción

### Requisito 33

**Historia de Usuario:** Como administrador, quiero gestionar criterios de evaluación dinámicos, para poder configurar y personalizar los criterios según el tipo de medio y las necesidades específicas de cada concurso.

#### Criterios de Aceptación

1. CUANDO accedo a la gestión de criterios ENTONCES el sistema DEBERÁ permitir crear, editar y eliminar criterios de evaluación
2. CUANDO creo un criterio ENTONCES el sistema DEBERÁ permitir definir nombre, descripción, tipo de medio aplicable, peso y orden de presentación
3. CUANDO configuro criterios por tipo de medio ENTONCES el sistema DEBERÁ permitir asignar criterios específicos a fotografía, video, audio o corto de cine
4. CUANDO un jurado evalúa un medio ENTONCES el sistema DEBERÁ mostrar solo los criterios activos configurados para ese tipo de medio
5. CUANDO se calcula el puntaje final ENTONCES el sistema DEBERÁ aplicar los pesos configurados para cada criterio

### Requisito 34

**Historia de Usuario:** Como sistema, necesito proporcionar criterios de evaluación preconfigurados por tipo de medio, para facilitar la configuración inicial y garantizar evaluaciones profesionales especializadas.

#### Criterios de Aceptación

1. CUANDO se inicializa el sistema ENTONCES el sistema DEBERÁ incluir criterios preconfigurados para fotografía (Enfoque, Exposición, Composición, Creatividad, Impacto Visual)
2. CUANDO se evalúan videos ENTONCES el sistema DEBERÁ proporcionar criterios específicos (Narrativa, Técnica Visual, Audio, Creatividad, Impacto Emocional)
3. CUANDO se evalúan audios ENTONCES el sistema DEBERÁ incluir criterios especializados (Calidad Técnica, Composición, Creatividad, Producción, Impacto Sonoro)
4. CUANDO se evalúan cortos de cine ENTONCES el sistema DEBERÁ ofrecer criterios cinematográficos (Narrativa, Dirección, Técnica, Creatividad, Impacto Cinematográfico)
5. CUANDO se configuran criterios universales ENTONCES el sistema DEBERÁ permitir criterios que apliquen a todos los tipos de medios

### Requisito 35

**Historia de Usuario:** Como jurado especializado, quiero que el sistema reconozca mi área de especialización, para ser asignado a evaluar solo los tipos de medios en los que tengo experiencia profesional.

#### Criterios de Aceptación

1. CUANDO se configura mi perfil de jurado ENTONCES el sistema DEBERÁ permitir seleccionar mis especializaciones (fotografía, video, audio, cine)
2. CUANDO un administrador asigna jurados ENTONCES el sistema DEBERÁ mostrar solo jurados especializados en el tipo de medio de la categoría
3. CUANDO accedo a mi panel de evaluación ENTONCES el sistema DEBERÁ mostrar solo medios del tipo en el que estoy especializado
4. CUANDO evalúo un medio ENTONCES el sistema DEBERÁ cargar automáticamente los criterios específicos para mi especialización

### Requisito 36

**Historia de Usuario:** Como usuario de la aplicación, quiero tener acceso a temas de diseño profesionales adicionales basados en referencias modernas, para poder elegir entre el estilo actual y opciones más corporativas según mis preferencias.

#### Criterios de Aceptación

1. CUANDO accedo al selector de temas ENTONCES el sistema DEBERÁ mostrar los temas existentes más dos nuevos temas profesionales: "Looper" y "Corporate"
2. CUANDO selecciono el tema "Looper" ENTONCES el sistema DEBERÁ aplicar la paleta de colores profesional (#346CB0, #f6f7f9) y tipografía Fira Sans basada en el template de referencia
3. CUANDO selecciono el tema "Corporate" ENTONCES el sistema DEBERÁ aplicar un diseño limpio y minimalista inspirado en PollUnit.com
4. CUANDO cambio entre temas ENTONCES el sistema DEBERÁ mantener toda la funcionalidad existente y componentes premium funcionando correctamente
5. CUANDO uso los nuevos temas ENTONCES el sistema DEBERÁ adaptar automáticamente todos los componentes (botones, cards, modals, formularios) al estilo seleccionado

### Requisito 37

**Historia de Usuario:** Como desarrollador, quiero componentes de interfaz adicionales con variantes profesionales, para poder crear interfaces que se adapten tanto al estilo cinematográfico existente como a estilos corporativos.

#### Criterios de Aceptación

1. CUANDO uso componentes existentes ENTONCES el sistema DEBERÁ mantener todas las variantes cinematográficas actuales (glassmorphism, efectos premium, animaciones)
2. CUANDO necesito variantes profesionales ENTONCES el sistema DEBERÁ proporcionar versiones corporativas de HeroCinematic, CardPremium, ButtonCinematic y ModalPremium
3. CUANDO implemento formularios de autenticación ENTONCES el sistema DEBERÁ ofrecer tanto el LoginForm cinematográfico actual como una variante AuthFormProfessional basada en auth-signin-v2.html
4. CUANDO creo landing pages ENTONCES el sistema DEBERÁ permitir usar tanto HeroCinematic como HeroProfessional basado en el template landing-page.html
5. CUANDO desarrollo interfaces ENTONCES el sistema DEBERÁ permitir mezclar componentes cinematográficos y profesionales según las necesidades del proyectoación

### Requisito 36

**Historia de Usuario:** Como administrador del negocio, quiero implementar un sistema de planes de suscripción, para generar ingresos sostenibles y ofrecer funcionalidades premium a usuarios comprometidos.

#### Criterios de Aceptación

1. CUANDO se configura el sistema ENTONCES el sistema DEBERÁ soportar múltiples planes de suscripción (Básico, Profesional, Premium, Organizador)
2. CUANDO un usuario se suscribe a un plan ENTONCES el sistema DEBERÁ aplicar las limitaciones y beneficios correspondientes (límites de participación, funcionalidades premium)
3. CUANDO un usuario excede los límites de su plan ENTONCES el sistema DEBERÁ mostrar opciones de upgrade
4. CUANDO se procesan pagos ENTONCES el sistema DEBERÁ integrar con pasarelas de pago seguras y manejar renovaciones automáticas

### Requisito 37

**Historia de Usuario:** Como visitante interesado en la comunidad creativa, quiero acceder a contenido educativo y de inspiración a través del blog, para mejorar mis habilidades y mantenerme actualizado sobre tendencias en medios multimedia.

#### Criterios de Aceptación

1. CUANDO accedo al blog ENTONCES el sistema DEBERÁ mostrar contenido educativo sobre técnicas de fotografía, video, audio y cine
2. CUANDO leo un artículo ENTONCES el sistema DEBERÁ mostrar contenido relacionado y sugerencias personalizadas
3. CUANDO interactúo con el contenido ENTONCES el sistema DEBERÁ permitir comentarios, likes y compartir en redes sociales
4. CUANDO me suscribo al newsletter ENTONCES el sistema DEBERÁ enviar digest semanal con contenido destacado y nuevos concursos
### Re
quisito 38

**Historia de Usuario:** Como desarrollador del sistema, necesito implementar un sistema de estilos SCSS modular y escalable, para mantener consistencia visual, facilitar el mantenimiento y permitir la extensión eficiente de temas y componentes.

#### Criterios de Aceptación

1. CUANDO se estructura el sistema de estilos ENTONCES el sistema DEBERÁ usar arquitectura SCSS modular con archivos separados (_variables.scss, _mixins.scss, _themes.scss, _utilities.scss)
2. CUANDO se definen temas ENTONCES el sistema DEBERÁ usar variables SCSS y mixins reutilizables para garantizar consistencia y facilitar cambios globales
3. CUANDO se crean componentes ENTONCES el sistema DEBERÁ usar mixins SCSS parametrizables para efectos, animaciones y responsive design
4. CUANDO se migran componentes existentes ENTONCES el sistema DEBERÁ mantener compatibilidad total con el hook useTheme y componentes ThemeSelector/ThemeToggle existentes
5. CUANDO se compila el CSS ENTONCES el sistema DEBERÁ generar un archivo CSS optimizado eliminando código no utilizado y manteniendo rendimiento óptimo
### Requi
sito 38

**Historia de Usuario:** Como usuario del sistema, quiero tener un sistema de navegación principal consistente con menú superior y lateral, para poder acceder fácilmente a todas las funcionalidades según mi rol de usuario.

#### Criterios de Aceptación

1. CUANDO accedo a la aplicación ENTONCES el sistema DEBERÁ mostrar un menú superior fijo con el logo de WebFestival y opciones de usuario (perfil, notificaciones, configuración)
2. CUANDO navego por la aplicación ENTONCES el sistema DEBERÁ mostrar un menú lateral izquierdo con iconos y opciones específicas según mi rol de usuario
3. CUANDO soy participante ENTONCES el sistema DEBERÁ mostrar opciones de navegación para Dashboard, Concursos, Mis Envíos, Galería, Perfil y Comunidad
4. CUANDO soy jurado ENTONCES el sistema DEBERÁ mostrar opciones para Dashboard, Evaluaciones, Progreso, Especialización y Perfil
5. CUANDO soy administrador ENTONCES el sistema DEBERÁ mostrar opciones para Dashboard, Concursos, Usuarios, Criterios, Métricas y Configuración
6. CUANDO soy administrador de contenido ENTONCES el sistema DEBERÁ mostrar opciones para Dashboard, CMS, Blog, Newsletter y Analytics