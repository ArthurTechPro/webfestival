# WebFestival Platform

Una plataforma web completa para la gestión de concursos de fotografía online que conecta fotógrafos, jurados profesionales y organizadores en un ecosistema colaborativo y competitivo.

## 🎯 Visión del Proyecto

WebFestival es la plataforma líder para concursos de fotografía online, diseñada para facilitar el descubrimiento de talento fotográfico emergente y crear una comunidad activa de fotógrafos y profesionales del sector.

## 🚀 Características Principales

### Para Fotógrafos
- ✨ Plataforma profesional para mostrar talento
- 🏆 Participación en concursos especializados
- 👥 Comunidad activa y networking
- 📊 Feedback profesional de jurados expertos

### Para Jurados
- 🎯 Herramientas especializadas de evaluación
- 📝 Sistema de calificación multi-criterio
- 💬 Feedback constructivo a participantes
- 📈 Dashboard de progreso de evaluaciones

### Para Administradores
- 🎛️ Sistema completo de gestión de concursos
- 📊 Métricas y analytics avanzados
- 👤 Gestión de usuarios y permisos
- 🎨 Mini CMS para contenido estático

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14+ con TypeScript 5+
- **Backend**: Next.js API Routes
- **Base de Datos**: PostgreSQL 16+
- **Almacenamiento**: [Immich Server](https://immich.app/) para gestión inteligente de imágenes
- **Autenticación**: NextAuth.js o Clerk
- **Estilos**: Bootstrap 5.3+ con componentes React
- **Notificaciones**: SendGrid/Resend para emails

## 🏗️ Arquitectura

La plataforma utiliza una arquitectura API-first que permite:
- 🌐 Servir tanto aplicaciones web como móviles
- 📱 Escalabilidad horizontal
- 🔒 Seguridad robusta con JWT
- 🚀 Rendimiento optimizado

## 📁 Estructura del Proyecto

```
webfestival-platform/
├── .kiro/specs/                 # Especificaciones del proyecto
│   ├── requirements.md          # Requisitos funcionales
│   ├── design.md               # Diseño técnico y arquitectura
│   ├── project.md              # Documentación del proyecto
│   └── PRD.md                  # Product Requirements Document
├── src/                        # Código fuente (próximamente)
├── docs/                       # Documentación adicional
├── .gitignore                  # Archivos ignorados por Git
└── README.md                   # Este archivo
```

## 🎨 Funcionalidades Destacadas

### Sistema de Evaluación Avanzado
- **Enfoque**: Nitidez, profundidad de campo, precisión
- **Exposición**: Iluminación, contraste, balance de blancos
- **Composición**: Regla de tercios, balance, encuadre
- **Creatividad**: Originalidad, concepto, innovación
- **Impacto Visual**: Fuerza emocional, atractivo estético

### Gestión Inteligente de Imágenes
- 🖼️ Integración con Immich para almacenamiento optimizado
- 📏 Formato widescreen (16:9) para mejor visualización
- 🔍 Extracción automática de metadatos EXIF
- ⚡ Optimización automática de thumbnails y previews

### Mini CMS Integrado
- ✏️ Editor WYSIWYG para contenido estático
- 🎨 Gestión de imágenes integrada
- 👤 Rol específico CONTENT_ADMIN
- 👀 Preview en tiempo real

## 🚦 Roadmap de Desarrollo

### Fase 1: MVP (3-4 meses)
- [ ] Sistema básico de usuarios y autenticación
- [ ] Gestión fundamental de concursos
- [ ] Subida y evaluación de fotografías
- [ ] Panel de administración básico

### Fase 2: Funcionalidades Sociales (2-3 meses)
- [ ] Sistema de seguimiento y feed
- [ ] Comentarios públicos
- [ ] Integración con redes sociales
- [ ] Galería pública

### Fase 3: Analytics y Optimización (2 meses)
- [ ] Dashboard de métricas avanzadas
- [ ] Sistema de notificaciones completo
- [ ] Mini CMS para contenido estático
- [ ] Optimizaciones de rendimiento

### Fase 4: Expansión (3-4 meses)
- [ ] Aplicación móvil React Native
- [ ] Funcionalidades premium
- [ ] Integraciones adicionales
- [ ] Escalabilidad y optimización

## 📊 Métricas de Éxito

- 🎯 **Adopción**: 1,000 usuarios registrados en los primeros 6 meses
- 💪 **Engagement**: 70% de usuarios activos mensualmente
- 🔄 **Retención**: 60% de retención a 3 meses
- ⭐ **Calidad**: 4.5+ estrellas en satisfacción de usuarios

## 🤝 Contribución

Este proyecto está en fase de especificación y diseño. Para contribuir:

1. Revisa la documentación en `.kiro/specs/`
2. Consulta el PRD para entender la visión completa
3. Sigue las especificaciones técnicas en `design.md`

## 📄 Documentación

- [📋 Requisitos Funcionales](.kiro/specs/webfestival-platform/requirements.md)
- [🏗️ Diseño Técnico](.kiro/specs/webfestival-platform/design.md)
- [📖 Documentación del Proyecto](.kiro/specs/webfestival-platform/project.md)
- [📊 Product Requirements Document](.kiro/specs/webfestival-platform/PRD.md)

## 📞 Contacto

Para más información sobre el proyecto WebFestival, consulta la documentación técnica o contacta al equipo de desarrollo.

---

**Estado del Proyecto**: 🔧 En Especificación y Diseño  
**Última Actualización**: Septiembre 2024  
**Versión de Especificaciones**: 1.0