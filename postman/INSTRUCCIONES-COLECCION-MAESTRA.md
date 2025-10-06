# 🎯 Instrucciones para la Colección Maestra "Web Festival"

## ✨ ¿Qué es la Colección Maestra?

La **Colección Maestra "Web Festival"** es una colección unificada que contiene **toda la API WebFestival** organizada de manera jerárquica en una sola colección de Postman. Esto significa que cuando importes este archivo, tendrás acceso a todos los endpoints organizados por módulos dentro de una sola colección llamada "Web Festival".

## 🚀 Importación Rápida (2 archivos solamente)

### Paso 1: Importar Archivos
1. **Abre Postman**
2. **Haz clic en "Import"**
3. **Importa estos 2 archivos**:
   - `WebFestival-Master-Collection.postman_collection.json`
   - `WebFestival-Development.postman_environment.json`

### Paso 2: Configurar Entorno
1. **Selecciona el entorno** "WebFestival Development" en la esquina superior derecha
2. **¡Listo!** Ya tienes todo configurado

## 📋 Estructura de la Colección Maestra

Cuando importes la colección, verás esta estructura organizada:

```
📁 Web Festival
├── 🚀 Quick Start (7 requests básicos)
├── 🔐 Autenticación y Usuarios
│   ├── Registro y Login
│   └── Gestión de Perfil
├── 🏆 Concursos y Participación
│   ├── Gestión de Concursos
│   └── Inscripciones
├── 🎬 Medios Multimedia
│   ├── Configuración y Validación
│   ├── Subida de Medios
│   └── Galerías Públicas
├── 📊 Criterios y Evaluación
│   ├── Criterios por Tipo de Medio
│   └── Calificaciones (Jurados)
├── 💬 Interacciones Sociales
│   ├── Likes
│   └── Comentarios
├── 💳 Suscripciones y Pagos
│   ├── Planes de Suscripción
│   └── Gestión de Suscripciones
├── 🔔 Notificaciones
│   └── Gestión Personal
├── 📧 Newsletter y Contenido Educativo
│   ├── Newsletter
│   └── Contenido Educativo
├── 📝 Sistema CMS
│   ├── Gestión de Contenido
│   └── Analytics
├── 🌐 Redes Sociales
│   └── Compartir Contenido
└── 🏥 Health y Monitoreo
    ├── Health Checks
    └── Información del Sistema
```

## 🎯 Flujo de Inicio Recomendado

### 1. Ejecutar Quick Start (Automático)
1. **Expande** la carpeta "🚀 Quick Start"
2. **Ejecuta los 7 requests en orden**:
   - Health Check → Verificar servidor
   - Registrar Usuario → Crear cuenta
   - Login Usuario → Obtener token (se guarda automáticamente)
   - Login Admin → Obtener token admin
   - Obtener Perfil → Verificar autenticación
   - Ver Concursos Activos → Explorar contenido
   - Ver Documentación Swagger → Acceder a docs

### 2. Explorar por Módulos
Después del Quick Start, puedes explorar cualquier módulo:
- **Concursos**: Crear, inscribirse, gestionar
- **Medios**: Subir fotos, videos, audio
- **Evaluación**: Calificar como jurado
- **Social**: Likes, comentarios, interacciones
- **Suscripciones**: Planes, pagos, límites

## 🔧 Características Especiales

### ✅ Scripts Automáticos
- **Tokens se guardan automáticamente** al hacer login
- **Variables se actualizan** dinámicamente
- **IDs se capturan** para usar en otros requests

### ✅ Organización Intuitiva
- **Emojis** para identificar rápidamente cada sección
- **Nombres descriptivos** en español
- **Agrupación lógica** por funcionalidad
- **Orden de ejecución** recomendado

### ✅ Ejemplos Realistas
- **Datos de prueba** apropiados para cada endpoint
- **Casos de uso** reales documentados
- **Validaciones** incluidas en los requests

## 🎮 Casos de Uso Principales

### 👤 Como Participante
1. **Quick Start** → Login Usuario
2. **Concursos** → Ver Activos → Inscribirse
3. **Medios** → Subir Fotografía/Video
4. **Social** → Dar Likes → Comentar

### 👨‍⚖️ Como Jurado
1. **Quick Start** → Login Admin (para crear jurado)
2. **Criterios** → Ver por Tipo de Medio
3. **Evaluación** → Calificar Medios
4. **Notificaciones** → Ver Recordatorios

### 👨‍💼 Como Administrador
1. **Quick Start** → Login Admin
2. **Concursos** → Crear Nuevo Concurso
3. **CMS** → Gestionar Contenido
4. **Analytics** → Ver Métricas
5. **Health** → Monitorear Sistema

## 💡 Tips de Uso

### 🔄 Automatización
- Los **tokens se renuevan automáticamente**
- Las **variables se comparten** entre requests
- Los **IDs se capturan** para flujos completos

### 📊 Testing Eficiente
- Usa **Quick Start** para verificación rápida
- Ejecuta **carpetas completas** con Collection Runner
- **Guarda respuestas** para debugging

### 🐛 Troubleshooting
- Si un request falla, verifica el **Health Check**
- Asegúrate de tener el **entorno seleccionado**
- Revisa que el **servidor esté ejecutándose**

## 🆚 Ventajas vs Colecciones Individuales

### ✅ Colección Maestra
- **Una sola importación**
- **Organización jerárquica**
- **Variables compartidas**
- **Flujos integrados**
- **Fácil navegación**

### ⚖️ Colecciones Individuales
- **Más granularidad**
- **Importación selectiva**
- **Separación por módulos**
- **Para equipos especializados**

## 🎉 ¡Empezar es Súper Fácil!

1. **Importa** `WebFestival-Master-Collection.postman_collection.json`
2. **Importa** `WebFestival-Development.postman_environment.json`
3. **Selecciona** el entorno "WebFestival Development"
4. **Ejecuta** la carpeta "🚀 Quick Start"
5. **¡Explora!** Toda la API está a tu disposición

---

**¡La colección maestra hace que probar la API WebFestival sea súper fácil y organizado! 🚀**