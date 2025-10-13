# Documentación del Proyecto WebFestival App

Esta carpeta contiene toda la documentación técnica del proyecto **webfestival-app**, la aplicación frontend del ecosistema WebFestival.

## Estructura de Documentación

### Convenciones de Nomenclatura
Los archivos de documentación siguen el patrón:
```
[numero-tarea]-[descripcion-kebab-case]-README.md
```

### Tipos de Documentación

#### 📋 Documentación Principal (`-README.md`)
Documentación completa de sistemas y servicios implementados:
- Descripción general del sistema/servicio
- Arquitectura y componentes
- Configuración y setup
- Ejemplos de uso
- Guías de desarrollo

#### 🔌 Documentación de API (`-api-README.md`)
Documentación específica para integraciones con APIs:
- Endpoints disponibles con ejemplos
- Parámetros y respuestas detalladas
- Códigos de error y soluciones
- Ejemplos de integración
- Configuración de variables de entorno

## Documentos Disponibles

### Configuración Base
- [`10-configuracion-inicial-react-README.md`](./10-configuracion-inicial-react-README.md) - Configuración inicial completa del proyecto React

### Próximos Documentos
Los siguientes documentos se generarán conforme se implementen las tareas:

#### Sistema de Autenticación
- `11-1-autenticacion-react-README.md` - Implementación de autenticación en React
- `11-2-routing-protegido-README.md` - Sistema de routing protegido por roles

#### Interfaces de Usuario
- `12-x-interfaz-participantes-README.md` - Interfaces para participantes
- `13-x-interfaz-jurados-README.md` - Interfaces para jurados  
- `14-x-panel-administracion-README.md` - Panel de administración

#### Funcionalidades Avanzadas
- `15-x-gestion-medios-README.md` - Sistema de gestión de medios
- `16-x-sistema-calificacion-README.md` - Sistema de calificación
- `17-x-notificaciones-frontend-README.md` - Sistema de notificaciones

## Guías de Desarrollo

### Para Desarrolladores
1. **Configuración inicial**: Consulta `10-configuracion-inicial-react-README.md`
2. **Estructura del proyecto**: Revisa la arquitectura de carpetas
3. **Estándares de código**: ESLint y Prettier configurados
4. **Testing**: Vitest y React Testing Library

### Para Nuevos Miembros del Equipo
1. Comienza con la documentación de configuración inicial
2. Revisa la estructura de tipos TypeScript en `/src/types/`
3. Familiarízate con los servicios base en `/src/services/`
4. Ejecuta los tests para verificar el setup: `npm run test`

## Comandos Útiles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build           # Build de producción
npm run test            # Ejecutar tests

# Calidad de código
npm run lint            # Verificar linting
npm run format          # Formatear código
```

## Contribución a la Documentación

### Reglas para Documentar
1. **Siempre crear documentación** para nuevos servicios y componentes importantes
2. **Mantener actualizada** la documentación existente
3. **Incluir ejemplos prácticos** y casos de uso
4. **Documentar en español** siguiendo las convenciones del proyecto

### Plantilla para Nueva Documentación
```markdown
# [Título del Sistema/Servicio] - WebFestival App

## Descripción General
[Descripción breve del sistema]

## Arquitectura y Tecnologías
[Stack tecnológico utilizado]

## Configuración
[Pasos de configuración]

## Uso y Ejemplos
[Ejemplos prácticos de uso]

## Testing
[Información sobre tests]

## Notas Técnicas
[Consideraciones técnicas importantes]
```

## Enlaces Útiles

- [Proyecto Principal](../) - Raíz del proyecto webfestival-app
- [Código Fuente](../src/) - Código fuente de la aplicación
- [Tests](../tests/) - Suite de tests
- [Configuración](../package.json) - Dependencias y scripts

---

**Nota**: Esta documentación se actualiza automáticamente conforme se implementan nuevas funcionalidades del proyecto.