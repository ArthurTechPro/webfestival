# Sistema de Estilos y Tema Personalizado - WebFestival

## Descripción General

Sistema completo de estilos CSS personalizado para WebFestival construido sobre Bootstrap 5.3+ con variables CSS personalizadas, componentes reutilizables, soporte multimedia, animaciones, utilidades y diseño responsive mobile-first.

## Arquitectura del Sistema

### 📁 Estructura de Archivos

```
webfestival-app/src/styles/
├── variables.css      # Variables CSS personalizadas y paleta de colores
├── components.css     # Componentes UI reutilizables
├── multimedia.css     # Estilos para reproductores multimedia
├── animations.css     # Animaciones y transiciones
├── utilities.css      # Clases de utilidad
├── responsive.css     # Diseño responsive mobile-first
└── theme.css         # Sistema de temas y modo dark/light
```

### 🎨 Paleta de Colores

#### Colores Principales
- **Primary**: `#6366f1` (Índigo vibrante)
- **Secondary**: `#f59e0b` (Ámbar dorado)
- **Success**: `#10b981` (Verde esmeralda)
- **Warning**: `#f59e0b` (Ámbar)
- **Danger**: `#ef4444` (Rojo coral)
- **Info**: `#3b82f6` (Azul cielo)

#### Colores Multimedia
- **Photo**: `#8b5cf6` (Violeta)
- **Video**: `#06b6d4` (Cian)
- **Audio**: `#f97316` (Naranja)
- **Cinema**: `#ec4899` (Rosa)

#### Escala de Grises
- Desde `--wf-gray-50` (muy claro) hasta `--wf-gray-900` (muy oscuro)

## Componentes Principales

### 🔘 Botones

```html
<!-- Botones básicos -->
<button class="wf-btn wf-btn-primary">Primario</button>
<button class="wf-btn wf-btn-secondary">Secundario</button>
<button class="wf-btn wf-btn-outline">Outline</button>
<button class="wf-btn wf-btn-ghost">Ghost</button>

<!-- Tamaños -->
<button class="wf-btn wf-btn-primary wf-btn-sm">Pequeño</button>
<button class="wf-btn wf-btn-primary">Normal</button>
<button class="wf-btn wf-btn-primary wf-btn-lg">Grande</button>
<button class="wf-btn wf-btn-primary wf-btn-xl">Extra Grande</button>

<!-- Botones multimedia -->
<button class="wf-btn wf-btn-photo">Fotografía</button>
<button class="wf-btn wf-btn-video">Video</button>
<button class="wf-btn wf-btn-audio">Audio</button>
<button class="wf-btn wf-btn-cinema">Cine</button>
```

### 🃏 Cards

```html
<div class="wf-card">
  <div class="wf-card-header">
    <h3 class="wf-card-title">Título de la Card</h3>
    <p class="wf-card-subtitle">Subtítulo opcional</p>
  </div>
  <div class="wf-card-body">
    <p class="wf-card-text">Contenido de la card...</p>
  </div>
  <div class="wf-card-footer">
    <button class="wf-btn wf-btn-primary">Acción</button>
  </div>
</div>

<!-- Card multimedia con overlay -->
<div class="wf-card wf-card-media">
  <img src="imagen.jpg" alt="Descripción">
  <div class="wf-card-media-overlay">
    <div>
      <h4>Título del medio</h4>
      <p>Descripción del contenido multimedia</p>
    </div>
  </div>
</div>
```

### 🚨 Alerts

```html
<div class="wf-alert wf-alert-success">
  <div class="wf-alert-icon">✅</div>
  <div class="wf-alert-content">
    <div class="wf-alert-title">¡Éxito!</div>
    <div class="wf-alert-message">La operación se completó correctamente.</div>
  </div>
</div>

<div class="wf-alert wf-alert-warning">
  <div class="wf-alert-icon">⚠️</div>
  <div class="wf-alert-content">
    <div class="wf-alert-title">Advertencia</div>
    <div class="wf-alert-message">Revisa los datos antes de continuar.</div>
  </div>
</div>
```

### 🏷️ Badges

```html
<!-- Badges básicos -->
<span class="wf-badge wf-badge-primary">Primario</span>
<span class="wf-badge wf-badge-success">Éxito</span>
<span class="wf-badge wf-badge-warning">Advertencia</span>

<!-- Badges multimedia -->
<span class="wf-badge wf-badge-photo">Fotografía</span>
<span class="wf-badge wf-badge-video">Video</span>
<span class="wf-badge wf-badge-audio">Audio</span>
<span class="wf-badge wf-badge-cinema">Cine</span>
```

## Reproductores Multimedia

### 📹 Reproductor de Video

```html
<div class="wf-video-player">
  <video src="video.mp4"></video>
  <div class="wf-video-controls">
    <div class="wf-video-progress">
      <div class="wf-video-progress-bar" style="width: 30%"></div>
    </div>
    <div class="wf-video-buttons">
      <button class="wf-video-btn">▶️</button>
      <button class="wf-video-btn">🔊</button>
      <span class="wf-video-time">02:30 / 08:45</span>
    </div>
  </div>
</div>
```

### 🎵 Reproductor de Audio

```html
<div class="wf-audio-player">
  <div class="wf-audio-artwork">🎵</div>
  <div class="wf-audio-controls">
    <button class="wf-audio-btn">▶️</button>
  </div>
  <div class="wf-audio-info">
    <div class="wf-audio-title">Nombre de la pista</div>
    <div class="wf-audio-progress-container">
      <span class="wf-audio-time">2:30</span>
      <div class="wf-audio-progress">
        <div class="wf-audio-progress-bar" style="width: 40%"></div>
      </div>
      <span class="wf-audio-time">6:15</span>
    </div>
  </div>
  <div class="wf-audio-volume">
    <button class="wf-audio-volume-btn">🔊</button>
    <div class="wf-audio-volume-slider">
      <div class="wf-audio-volume-bar" style="width: 70%"></div>
    </div>
  </div>
</div>
```

### 🖼️ Galería de Imágenes

```html
<div class="wf-image-gallery">
  <div class="wf-image-item">
    <img src="imagen1.jpg" alt="Descripción">
    <div class="wf-image-overlay">
      <h4 class="wf-image-title">Título de la imagen</h4>
      <p class="wf-image-meta">Por: Autor | Categoría: Paisaje</p>
    </div>
  </div>
  <!-- Más imágenes... -->
</div>
```

## Animaciones

### 🎬 Clases de Animación

```html
<!-- Animaciones de entrada -->
<div class="wf-animate-fade-in">Aparece gradualmente</div>
<div class="wf-animate-slide-in-up">Desliza desde abajo</div>
<div class="wf-animate-slide-in-left">Desliza desde la izquierda</div>
<div class="wf-animate-scale-in">Escala desde el centro</div>

<!-- Animaciones de hover -->
<div class="wf-hover-lift">Se eleva al hacer hover</div>
<div class="wf-hover-scale">Se escala al hacer hover</div>
<div class="wf-hover-glow">Brilla al hacer hover</div>

<!-- Animaciones de loading -->
<div class="wf-loading-dots">
  <span></span><span></span><span></span>
</div>

<div class="wf-loading-bars">
  <span></span><span></span><span></span><span></span><span></span>
</div>

<!-- Entrada escalonada -->
<div class="wf-stagger-children">
  <div>Elemento 1</div>
  <div>Elemento 2</div>
  <div>Elemento 3</div>
</div>
```

## Sistema de Temas

### 🎨 Temas Disponibles

1. **Auto**: Sigue la preferencia del sistema
2. **Light**: Tema claro siempre
3. **Dark**: Tema oscuro siempre
4. **Festival**: Colores vibrantes y festivos
5. **Professional**: Colores corporativos
6. **Artistic**: Colores creativos y únicos

### 🔧 Uso en React

```tsx
import { useTheme } from '../hooks/useTheme';
import { ThemeSelector, ThemeToggle } from '../components/ui';

function MyComponent() {
  const { theme, setTheme, toggleTheme, isDark } = useTheme();

  return (
    <div>
      {/* Selector completo de temas */}
      <ThemeSelector showLabel={true} />
      
      {/* Toggle simple claro/oscuro */}
      <ThemeToggle size="md" showLabel={true} />
      
      {/* Uso programático */}
      <button onClick={() => setTheme('festival')}>
        Cambiar a tema Festival
      </button>
      
      <p>Tema actual: {theme}</p>
      <p>¿Es oscuro?: {isDark ? 'Sí' : 'No'}</p>
    </div>
  );
}
```

## Utilidades CSS

### 📏 Espaciado

```html
<!-- Margin -->
<div class="wf-m-4">Margin en todos los lados</div>
<div class="wf-mt-6 wf-mb-4">Margin top y bottom</div>
<div class="wf-mx-auto">Centrado horizontalmente</div>

<!-- Padding -->
<div class="wf-p-6">Padding en todos los lados</div>
<div class="wf-px-4 wf-py-8">Padding horizontal y vertical</div>
```

### 🎨 Colores

```html
<!-- Colores de texto -->
<p class="wf-text-primary">Texto primario</p>
<p class="wf-text-secondary">Texto secundario</p>
<p class="wf-text-muted">Texto atenuado</p>
<p class="wf-text-success">Texto de éxito</p>

<!-- Colores de fondo -->
<div class="wf-bg-primary">Fondo primario</div>
<div class="wf-bg-secondary">Fondo secundario</div>
```

### 📱 Layout Responsive

```html
<!-- Flexbox -->
<div class="wf-flex wf-items-center wf-justify-between">
  <div>Izquierda</div>
  <div>Derecha</div>
</div>

<!-- Grid -->
<div class="wf-grid wf-grid-cols-1 wf-md:grid-cols-3 wf-gap-6">
  <div>Columna 1</div>
  <div>Columna 2</div>
  <div>Columna 3</div>
</div>

<!-- Responsive utilities -->
<div class="wf-hide-mobile">Solo en desktop</div>
<div class="wf-show-mobile">Solo en móvil</div>
```

## Diseño Responsive

### 📱 Breakpoints

- **xs**: 0px (móvil por defecto)
- **sm**: 576px (móvil grande)
- **md**: 768px (tablet)
- **lg**: 992px (desktop pequeño)
- **xl**: 1200px (desktop)
- **xxl**: 1400px (desktop grande)

### 🏗️ Layouts Predefinidos

```html
<!-- Container responsive -->
<div class="wf-container">
  Contenido centrado con padding responsive
</div>

<!-- Layout de dos columnas -->
<div class="wf-layout-two-col">
  <div>Columna 1</div>
  <div>Columna 2</div>
</div>

<!-- Layout con sidebar -->
<div class="wf-layout-sidebar">
  <aside>Sidebar</aside>
  <main>Contenido principal</main>
</div>

<!-- Dashboard grid -->
<div class="wf-dashboard-grid">
  <div class="wf-card">Widget 1</div>
  <div class="wf-card">Widget 2</div>
  <div class="wf-card">Widget 3</div>
</div>
```

## Accesibilidad

### ♿ Características Incluidas

- **Focus visible**: Indicadores claros de foco
- **Alto contraste**: Soporte para `prefers-contrast: high`
- **Movimiento reducido**: Respeta `prefers-reduced-motion: reduce`
- **Tamaños táctiles**: Mínimo 44px para elementos interactivos
- **Esquema de colores**: Soporte para `prefers-color-scheme`

### 🎯 Clases de Accesibilidad

```html
<!-- Skip link -->
<a href="#main-content" class="wf-skip-link">
  Saltar al contenido principal
</a>

<!-- Focus ring personalizado -->
<button class="wf-btn wf-focus-ring">
  Botón con focus ring
</button>

<!-- Sin impresión -->
<div class="wf-no-print">
  Este contenido no se imprime
</div>
```

## Integración con Bootstrap

El sistema está construido sobre Bootstrap 5.3+ y:

- ✅ **Mantiene compatibilidad** con clases de Bootstrap
- ✅ **Extiende funcionalidad** con componentes personalizados
- ✅ **Override variables** de Bootstrap con las de WebFestival
- ✅ **Mejora componentes** existentes con estilos adicionales

```html
<!-- Mezcla de Bootstrap y WebFestival -->
<div class="card wf-hover-lift">
  <div class="card-body">
    <h5 class="card-title wf-text-primary">Título</h5>
    <p class="card-text wf-text-secondary">Contenido...</p>
    <button class="btn btn-primary wf-btn-lg">
      Botón híbrido
    </button>
  </div>
</div>
```

## Optimización y Rendimiento

### ⚡ Características de Rendimiento

- **CSS Variables**: Cambios de tema instantáneos
- **Mobile-first**: Carga optimizada para móviles
- **Lazy loading**: Animaciones solo cuando son necesarias
- **Tree shaking**: Solo se cargan los estilos utilizados
- **Compresión**: CSS minificado en producción

### 🔧 Configuración de Build

El sistema se importa en `src/index.css`:

```css
/* Orden de importación optimizado */
@import 'bootstrap/dist/css/bootstrap.min.css';
@import './styles/variables.css';
@import './styles/components.css';
@import './styles/multimedia.css';
@import './styles/animations.css';
@import './styles/utilities.css';
@import './styles/responsive.css';
@import './styles/theme.css';
```

## Ejemplos de Uso Completo

### 🎬 Página de Concurso Multimedia

```html
<div class="wf-container wf-section-padding">
  <div class="wf-hero-section wf-mb-12">
    <h1 class="wf-title-responsive wf-brand-gradient">
      Concurso de Fotografía 2024
    </h1>
    <p class="wf-text-lg wf-mt-4">
      Participa en nuestro concurso anual de fotografía
    </p>
  </div>

  <div class="wf-layout-sidebar">
    <aside class="wf-card">
      <div class="wf-card-header">
        <h3 class="wf-card-title">Categorías</h3>
      </div>
      <div class="wf-card-body">
        <div class="wf-flex wf-flex-col wf-gap-3">
          <span class="wf-badge wf-badge-photo">Paisaje</span>
          <span class="wf-badge wf-badge-photo">Retrato</span>
          <span class="wf-badge wf-badge-photo">Macro</span>
        </div>
      </div>
    </aside>

    <main>
      <div class="wf-image-gallery wf-stagger-children">
        <div class="wf-image-item wf-hover-lift">
          <img src="foto1.jpg" alt="Paisaje montañoso">
          <div class="wf-image-overlay">
            <h4 class="wf-image-title">Amanecer en los Andes</h4>
            <p class="wf-image-meta">Por: María García</p>
          </div>
        </div>
        <!-- Más imágenes... -->
      </div>
    </main>
  </div>
</div>
```

### 🎵 Reproductor de Audio Completo

```html
<div class="wf-card">
  <div class="wf-card-header">
    <h3 class="wf-card-title">
      <span class="wf-badge wf-badge-audio wf-mr-3">Audio</span>
      Composición Original
    </h3>
  </div>
  <div class="wf-card-body">
    <div class="wf-audio-player">
      <div class="wf-audio-artwork">🎼</div>
      <div class="wf-audio-controls">
        <button class="wf-audio-btn">▶️</button>
      </div>
      <div class="wf-audio-info">
        <div class="wf-audio-title">Sinfonía del Amanecer</div>
        <div class="wf-audio-progress-container">
          <span class="wf-audio-time">3:45</span>
          <div class="wf-audio-progress">
            <div class="wf-audio-progress-bar" style="width: 60%"></div>
          </div>
          <span class="wf-audio-time">6:20</span>
        </div>
      </div>
      <div class="wf-audio-volume">
        <button class="wf-audio-volume-btn">🔊</button>
        <div class="wf-audio-volume-slider">
          <div class="wf-audio-volume-bar" style="width: 80%"></div>
        </div>
      </div>
    </div>
  </div>
  <div class="wf-card-footer">
    <button class="wf-btn wf-btn-primary wf-mr-3">
      ❤️ Me gusta
    </button>
    <button class="wf-btn wf-btn-outline">
      💬 Comentar
    </button>
  </div>
</div>
```

## Conclusión

El sistema de estilos de WebFestival proporciona:

- ✅ **Consistencia visual** en toda la aplicación
- ✅ **Flexibilidad** para diferentes tipos de contenido multimedia
- ✅ **Accesibilidad** incorporada desde el diseño
- ✅ **Responsive design** mobile-first
- ✅ **Temas personalizables** con modo oscuro/claro
- ✅ **Rendimiento optimizado** con CSS moderno
- ✅ **Compatibilidad** con Bootstrap 5.3+
- ✅ **Mantenibilidad** con arquitectura modular

Este sistema está listo para soportar todas las funcionalidades de la plataforma WebFestival, desde galerías multimedia hasta dashboards administrativos, manteniendo una experiencia de usuario coherente y profesional.