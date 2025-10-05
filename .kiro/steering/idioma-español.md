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
- **Generar archivos README numerados** con formato descriptivo: `[numero]-[descripcion]-README.md`
- **Estructura de documentación obligatoria:**
  ```
  proyecto/
  ├── docs/
  │   ├── 01-email-service-README.md
  │   ├── 02-auth-service-README.md
  │   ├── 03-payment-integration-README.md
  │   └── api-documentation.md
  ├── src/
  └── tests/
  ```

### Convenciones para Archivos README Numerados
- **Formato de nombres**: `[numero]-[descripcion-kebab-case]-README.md`
- **Ejemplos correctos**:
  - `01-email-service-README.md`
  - `02-authentication-system-README.md`
  - `03-payment-gateway-integration-README.md`
- **Contenido obligatorio en cada README**:
  - Descripción del servicio/componente
  - Configuración necesaria
  - Ejemplos de uso
  - Troubleshooting
  - Referencias y enlaces

### Cuándo Generar Documentación
- **Siempre** al implementar un nuevo servicio
- **Siempre** al crear integraciones con APIs externas
- **Siempre** al implementar funcionalidades complejas
- **Siempre** al completar tareas de especificaciones técnicas

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

## Instrucciones Adicionales para Futuras Iteraciones
- **Siempre verificar** que los archivos de test no contengan importaciones de `node:test`
- **Verificar ubicación correcta** de archivos de test en carpeta `tests/` (no en `src/`)
- **Generar documentación obligatoria** en `docs/` para cada servicio implementado
- **Crear README numerado** con formato `[numero]-[descripcion]-README.md`
- **Documentar claramente** las razones técnicas detrás de las decisiones de configuración
- **Mantener consistencia** en el uso de Jest vs otras herramientas de testing
- **Agregar comentarios preventivos** en código sensible a modificaciones automáticas
- **Mover archivos de test** si se encuentran en ubicaciones incorrectas (ej: `src/tests/` → `tests/`)
- **Verificar que existe documentación** antes de marcar una tarea como completada
- **NUNCA usar autofix automático** en archivos de test - revisar manualmente todas las importaciones
- **Recrear archivos de test completamente** si el autofix contamina con importaciones de `node:test`
- **Verificar después de cada edición** que no aparezcan importaciones no deseadas

