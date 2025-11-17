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


### Actualización de Archivos de Tareas
- **En `tasks.md` solo marcar como completado** con ✅
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

## Mensajes de Error y Logs
- Mensajes de error personalizados en español
- Logs de desarrollo pueden mantenerse en inglés para compatibilidad con herramientas
- Documentación de APIs en español con ejemplos claros

## Configuración de Tests

### Framework de Testing por Proyecto
- **webfestival-api**: Jest (Node.js backend)
- **webfestival-app**: Vitest (React frontend con Vite)

### Configuración para jest (Backend - webfestival-api)
- **NUNCA importar funciones de 'node:test'** en archivos de test de Jest
- Jest proporciona `describe`, `it`, `expect`, `beforeEach`, `afterEach` como funciones globales
- Usar únicamente `/// <reference types="jest" />` para las definiciones de tipos
- Agregar comentarios explicativos cuando sea necesario para evitar conflictos de autofix

### Configuración para Vitest (Frontend - webfestival-app)
- **Usar Vitest con React Testing Library** para componentes React
- **Importar explícitamente** las funciones de testing: `import { describe, it, expect, vi, beforeEach } from 'vitest';`
- **Configurar tipos de jest-dom** en `tests/setup.ts` para matchers como `toBeInTheDocument()`
- **Estructura de archivos de test**: solo se implenta en la carpeta `tests/` y no en `src/ 

### Manejo del Autofix de Kiro IDE
- **CRÍTICO**: El autofix de Kiro IDE automáticamente agrega importaciones incorrectas de `node:test`
- **NUNCA usar el autofix automático** en archivos de test de Jest
- **Si aparecen importaciones de `node:test`**: eliminarlas inmediatamente y recrear el archivo si es necesario
- **Síntomas del problema**: Errores "Cannot find name 'jest'" o "Duplicate identifier"
- **Solución**: Recrear el archivo completo sin las importaciones problemáticas

### Ubicación de Archivos de Test

**Para webfestival-api (Jest):**
- **SIEMPRE colocar archivos de test en la carpeta `tests/`** por fuera de `src/`
- **Estructura correcta:**
  ```
  webfestival-api/
  ├── src/
  │   ├── services/
  │   │   └── email.service.ts
  │   └── controllers/
  └── tests/
      ├── email.service.test.ts
      └── setup.ts
  ```

**Para webfestival-app (Vitest):**
- **Usar para realizar los tes en  `tests/`según el tipo de test.
- **Tests de utilidades/hooks**: `tests/utilityName.test.ts`
- **Estructura correcta:**
  ```
  webfestival-app/
  ├── src/
  └── tests/
  │   ├── setup.ts
  │   ├── theme.test.ts
  │   └── routing.test.ts
  │   ├── components/
  │   └── auth/
  │   ├── __tests__/
  │   │  │   ├── LoginForm.test.tsx
  │   │  │   └── RegisterForm.test.tsx
  │   │  ├── LoginForm.tsx
  │   │  └── RegisterForm.tsx
  │   └── hooks/
  ```
