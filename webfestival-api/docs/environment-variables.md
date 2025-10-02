# Variables de Entorno - WebFestival API

## Configuración del Servidor

### SERVER_NAME
- **Descripción**: Nombre del servidor que aparece en logs y respuestas del API
- **Valor por defecto**: `"WebFestival API"`
- **Ejemplos**:
  - Desarrollo: `"WebFestival API - Development"`
  - Producción: `"WebFestival API - Production"`
  - Staging: `"WebFestival API - Staging"`

### SERVER_URL
- **Descripción**: URL completa del servidor para generar enlaces y referencias
- **Valor por defecto**: `"http://localhost:{PORT}"`
- **Ejemplos**:
  - Desarrollo: `"http://localhost:3001"`
  - Producción: `"https://api.webfestival.com"`
  - Staging: `"https://staging-api.webfestival.com"`

### PORT
- **Descripción**: Puerto en el que ejecuta el servidor
- **Valor por defecto**: `3001`

## Uso en Producción

Para configurar el servidor en producción, asegúrate de establecer estas variables:

```bash
# Producción
SERVER_NAME="WebFestival API - Production"
SERVER_URL="https://api.webfestival.com"
PORT=3001
NODE_ENV="production"
```

## Beneficios

1. **Flexibilidad**: Fácil configuración para diferentes entornos
2. **Branding**: Personalización del nombre del servidor por entorno
3. **URLs dinámicas**: Generación automática de enlaces correctos
4. **Logs claros**: Identificación fácil del entorno en logs
5. **API responses**: Información clara sobre el servidor en respuestas

## Endpoints que usan estas variables

- `GET /api/v1` - Muestra información del servidor incluyendo nombre y URL
- Logs de inicio del servidor
- Health checks y monitoreo