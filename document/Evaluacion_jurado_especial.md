# Análisis de Autenticidad de Fotografías
Análisis de autenticidad que aparece en la página de evaluación de medios, específicamente en la sección de metadatos. El sistema detecta:

Indicadores implementados:

Software de edición: Detecta si la foto fue editada con Photoshop, GIMP, Lightroom, Affinity, Pixelmator, Snapseed o Canva
Capturas de pantalla/descargas: Identifica si la imagen proviene de un navegador o herramienta de captura
Ausencia de metadatos de cámara: Alerta cuando no hay información de cámara (sospechoso en fotografías)
Dimensiones típicas de pantalla: Detecta resoluciones comunes de monitores (1920×1080, 1280×720, etc.)
Formato PNG: Alerta sobre formato PNG en fotografías (poco común en cámaras profesionales)
Características del indicador:

Solo aparece si se detectan alertas (no molesta cuando todo está bien)
Usa un sistema de colores según el nivel de alerta:
🟠 Bajo (1 alerta): Naranja claro
🟠 Medio (2 alertas): Naranja
🔴 Alto (3+ alertas): Rojo
Diseño sutil y profesional que no acusa, solo informa
Ubicado debajo de los metadatos EXIF, integrado visualmente con el resto de la interfaz
Solo se muestra para fotografías (no para videos o audio)
Ejemplo de alertas:

"Editada con Adobe Photoshop • Sin información de cámara • Formato PNG"
"Posible captura de pantalla • Dimensiones típicas de pantalla"