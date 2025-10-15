# Extensión de Componentes con Variantes Profesionales

## Descripción General

Esta implementación extiende los componentes existentes (`ButtonCinematic`, `CardPremium`, `ModalPremium`) con nuevas variantes profesionales que se adaptan automáticamente según el tema seleccionado por el usuario.

## Componentes Extendidos

### 1. ButtonCinematic

**Nuevas Variantes:**
- `professional`: Estilo profesional con bordes redondeados y efectos sutiles
- `corporate`: Estilo corporativo minimalista con sombras suaves
- `minimal`: Estilo básico sin efectos especiales

**Nuevas Props:**
```typescript
interface ButtonCinematicProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'photo' | 'video' | 'audio' | 'cinema' | 'professional' | 'corporate' | 'minimal';
  theme?: 'auto' | 'looper' | 'corporate';
}
```

**Adaptación Automática:**
- Tema `looper` → variante `professional`
- Tema `corporate` → variante `corporate`
- Tema `cinematic` → mantiene estilo cinematográfico
- Otros temas → variante `primary` estándar

### 2. CardPremium

**Nuevas Variantes:**
- `clean`: Card limpia con bordes definidos y sombras sutiles
- `professional`: Card profesional con efectos de hover mejorados
- `corporate`: Card corporativa con diseño minimalista

**Nuevos Efectos de Hover:**
- `subtle`: Hover sutil para temas profesionales
- `none`: Sin efectos de hover

**Nuevas Props:**
```typescript
interface CardPremiumProps {
  variant?: 'glass' | 'neuro' | 'cinematic' | 'clean' | 'professional' | 'corporate';
  hover?: 'lift' | 'cinematic' | 'glow' | 'subtle' | 'none';
  theme?: 'auto' | 'looper' | 'corporate';
}
```

**Adaptación Automática:**
- Tema `professional` → variante `professional` + hover `subtle`
- Tema `corporate` → variante `corporate` + hover `subtle`
- Tema `cinematic` → mantiene variante `glass` + hover `cinematic`
- Otros temas → variante `clean` + hover `lift`

### 3. ModalPremium

**Nuevas Variantes:**
- `professional`: Modal profesional con sombras mejoradas
- `corporate`: Modal corporativo con diseño limpio
- `clean`: Modal básico sin efectos especiales

**Nuevos Layouts:**
- `form`: Layout optimizado para formularios (más estrecho)
- `split`: Layout de dos columnas para contenido complejo
- `centered`: Layout centrado para contenido simple

**Nuevas Props:**
```typescript
interface ModalPremiumProps {
  variant?: 'glass' | 'cinematic' | 'dark' | 'professional' | 'corporate' | 'clean';
  layout?: 'default' | 'form' | 'split' | 'centered';
  theme?: 'auto' | 'looper' | 'corporate';
}
```

## Integración con Sistema de Temas

### Hook useComponentVariant

Los componentes utilizan el hook `useComponentVariant` para determinar automáticamente la variante apropiada según el tema activo:

```typescript
const { variant: autoVariant, getComponentClasses } = useComponentVariant();
```

### Mapeo de Temas a Variantes

| Tema | ButtonCinematic | CardPremium | ModalPremium |
|------|----------------|-------------|--------------|
| `looper` | `professional` | `professional` | `professional` |
| `corporate` | `corporate` | `corporate` | `corporate` |
| `cinematic` | `primary` | `glass` | `glass` |
| `professional` | `professional` | `professional` | `professional` |
| Otros | `primary` | `clean` | `clean` |

## Estilos CSS Agregados

### Botones Profesionales
```css
.wf-btn-professional {
  background-color: var(--wf-primary);
  color: var(--wf-white);
  border-color: var(--wf-primary);
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.15s ease-in-out;
}

.wf-btn-corporate {
  background-color: var(--wf-primary);
  color: var(--wf-white);
  border-color: var(--wf-primary);
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.15s ease-in-out;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
```

### Cards Profesionales
```css
.wf-card-professional {
  background: var(--wf-bg-primary);
  border: 1px solid var(--wf-border-color);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.15s ease-in-out;
}

.wf-hover-subtle:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: var(--wf-primary);
}
```

### Modales Profesionales
```css
.wf-modal-professional {
  background: var(--wf-bg-primary);
  border: 1px solid var(--wf-border-color);
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.wf-modal-form-layout {
  max-width: 28rem;
}

.wf-modal-split-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 56rem;
}
```

## Compatibilidad

### Retrocompatibilidad
- Todas las variantes cinematográficas existentes se mantienen intactas
- Los componentes funcionan sin cambios en código existente
- La prop `theme="auto"` es el valor por defecto

### Migración
No se requiere migración. Los componentes existentes continuarán funcionando con sus variantes cinematográficas actuales.

## Uso Recomendado

### Adaptación Automática (Recomendado)
```tsx
// Se adapta automáticamente al tema seleccionado
<ButtonCinematic variant="primary">
  Botón Adaptativo
</ButtonCinematic>

<CardPremium variant="glass">
  Contenido de la card
</CardPremium>
```

### Variante Específica
```tsx
// Fuerza una variante específica
<ButtonCinematic variant="professional">
  Botón Profesional
</ButtonCinematic>

<CardPremium variant="corporate" hover="subtle">
  Card Corporativa
</CardPremium>

<ModalPremium variant="professional" layout="form">
  Modal de Formulario
</ModalPremium>
```

### Control de Tema
```tsx
// Controla el tema específicamente para el componente
<ButtonCinematic theme="corporate" variant="primary">
  Botón con Tema Corporate
</ButtonCinematic>
```

## Beneficios

1. **Adaptación Automática**: Los componentes se adaptan automáticamente al tema seleccionado
2. **Flexibilidad**: Permite override manual de variantes cuando sea necesario
3. **Consistencia**: Mantiene coherencia visual con el tema activo
4. **Retrocompatibilidad**: No rompe código existente
5. **Escalabilidad**: Fácil agregar nuevas variantes en el futuro

## Próximos Pasos

Esta implementación sienta las bases para:
- Agregar más variantes según necesidades específicas
- Extender otros componentes con el mismo patrón
- Crear temas personalizados con variantes específicas
- Implementar variantes responsive automáticas