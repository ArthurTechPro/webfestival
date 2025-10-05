---
inclusion: always
---

# Configuración de Idioma y Comunicación

## Idioma Principal
- **Responder siempre en español** para todas las explicaciones, documentación y comunicación con el usuario
- Usar terminología técnica en español cuando exista una traducción apropiada
- Mantener un tono profesional pero accesible en español

## Convenciones de Código
- **Nombres de variables, funciones y clases**: siempre en inglés (siguiendo estándares internacionales)
- **Comentarios de código**: en español para facilitar la comprensión del equipo
- **Documentación técnica**: en español (README, especificaciones, etc.)
- **Mensajes de commit**: en español
- **Nombres de archivos**: en inglés para compatibilidad

## Documentación y Explicaciones
- Explicar conceptos técnicos de manera clara y concisa en español
- Usar ejemplos prácticos cuando sea posible
- Incluir terminología en inglés entre paréntesis cuando sea relevante
- Priorizar la claridad sobre la brevedad

## Generación de Documentación Técnica
- **SIEMPRE crear documentación en la carpeta `docs/`** para servicios y componentes importantes
- **NUNCA documentar detalles de implementación en archivos de tareas** (`tasks.md`)
- **Los archivos de tareas deben mantener solo información esencial** de la tarea completada
- **La documentación detallada va en `docs/`** con archivos numerados según la tarea

### Estructura de Documentación Obligatoria
```
proyecto/
├── docs/
│   ├── [numero-tarea]-[descripcion-principal]-README.md
│   ├── [numero-tarea]-[descripcion-api]-README.md
│   ├── [numero-tarea]-[descripcion-deployment]-README.md
│   └── [numero-tarea]-[descripcion-integration]-README.md
├── src/
└── tests/
```

### Convenciones para Archivos de Documentación
- **Formato de nombres**: `[numero-tarea]-[descripcion-kebab-case]-README.md`
- **Ejemplos correctos**:
  - `8-2-notification-system-README.md` (documentación principal)
  - `8-2-notification-api-README.md` (documentación de API)
  - `8-2-notification-deployment-README.md` (configuración y despliegue)
  - `8-2-notification-integration-README.md` (integración frontend)

### Contenido Obligatorio por Tipo de Documentación
**Documentación Principal (`-README.md`):**
- Descripción general del sistema/servicio
- Arquitectura y componentes
- Configuración básica
- Ejemplos de uso
- Testing y troubleshooting

**Documentación de API (`-api-README.md`):**
- Todos los endpoints con ejemplos
- Parámetros y respuestas detalladas
- Códigos de error y soluciones
- Ejemplos de integración con JavaScript/frameworks

**Documentación de Despliegue (`-deployment-README.md`):**
- Configuración de variables de entorno
- Instrucciones para diferentes entornos
- Docker, Kubernetes, PM2
- Monitoreo, logs y métricas

**Documentación de Integración (`-integration-README.md`):**
- Componentes frontend listos para usar
- Ejemplos con React, Vue, Angular
- WebSocket y notificaciones push
- Estilos CSS y configuración

### Actualización de Archivos de Tareas
- **En `tasks.md` solo marcar como completado** con ✅
- **Agregar referencia a la documentación** generada
- **NO incluir detalles de implementación** en el archivo de tareas
- **Ejemplo correcto en tasks.md**:
  ```markdown
  - [x] 8.2 Implementar notificaciones automáticas
    - Sistema completo implementado con 4 tipos de notificaciones
    - API con 10 endpoints y automatización completa
    - Documentación completa en docs/8-2-notification-*-README.md
    - _Requisitos: 12.1, 12.2, 12.3, 12.4, 15.2_
  ```

### Cuándo Generar Documentación
- **Siempre** al implementar un nuevo servicio
- **Siempre** al crear integraciones con APIs externas
- **Siempre** al implementar funcionalidades complejas
- **Siempre** al completar tareas de especificaciones técnicas
- **Generar mínimo 2 archivos**: principal y API
- **Para sistemas complejos**: agregar deployment e integration

## Mensajes de Error y Logs
- Mensajes de error personalizados en español
- Logs de desarrollo pueden mantenerse en inglés para compatibilidad con herramientas
- Documentación de APIs en español con ejemplos claros

## Configuración de Tests y Jest
- **NUNCA importar funciones de 'node:test'** en archivos de test de Jest
- Jest proporciona `describe`, `it`, `expect`, `beforeEach`, `afterEach` como funciones globales
- Usar únicamente `/// <reference types="jest" />` para las definiciones de tipos
- Agregar comentarios explicativos cuando sea necesario para evitar conflictos de autofix

### Manejo del Autofix de Kiro IDE
- **CRÍTICO**: El autofix de Kiro IDE automáticamente agrega importaciones incorrectas de `node:test`
- **NUNCA usar el autofix automático** en archivos de test de Jest
- **Si aparecen importaciones de `node:test`**: eliminarlas inmediatamente y recrear el archivo si es necesario
- **Síntomas del problema**: Errores "Cannot find name 'jest'" o "Duplicate identifier"
- **Solución**: Recrear el archivo completo sin las importaciones problemáticas
- **Prevención**: Agregar comentarios preventivos al inicio del archivo:
  ```typescript
  /// <reference types="jest" />
  
  // IMPORTANTE: NO IMPORTAR FUNCIONES DE 'node:test' - USAR JEST GLOBALS
  // Jest proporciona describe, it, expect, beforeEach, afterEach globalmente
  // El autofix de Kiro IDE puede agregar importaciones incorrectas - eliminarlas siempre
  ```

### Ubicación de Archivos de Test
- **SIEMPRE colocar archivos de test en la carpeta `tests/`** por fuera de `src/`
- **NUNCA crear archivos de test dentro de `src/`** o subcarpetas de `src/`
- **Estructura correcta del proyecto:**
  ```
  proyecto/
  ├── src/
  │   ├── services/
  │   │   └── email.service.ts
  │   └── controllers/
  └── tests/
      ├── email.service.test.ts
      └── setup.ts
  ```
- **Razón técnica**: Separar código de producción de código de testing para mejor organización y builds

### Ejemplo Correcto de Archivo de Test
```typescript
/// <reference types="jest" />

// NOTA: No importar funciones de 'node:test' - usar Jest globals
// Jest proporciona describe, it, expect, beforeEach, afterEach globalmente

import { MiServicio } from '../src/services/mi-servicio';
```

