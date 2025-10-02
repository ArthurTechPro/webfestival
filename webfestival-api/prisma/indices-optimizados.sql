-- ============================================================================
-- ÍNDICES OPTIMIZADOS PARA EL SISTEMA CMS NORMALIZADO
-- ============================================================================

-- Índices para la tabla principal de contenido
CREATE INDEX IF NOT EXISTS idx_contenido_tipo ON contenido(tipo);
CREATE INDEX IF NOT EXISTS idx_contenido_estado ON contenido(estado);
CREATE INDEX IF NOT EXISTS idx_contenido_autor_id ON contenido(autor_id);
CREATE INDEX IF NOT EXISTS idx_contenido_fecha_publicacion ON contenido(fecha_publicacion);
CREATE INDEX IF NOT EXISTS idx_contenido_created_at ON contenido(created_at);
CREATE INDEX IF NOT EXISTS idx_contenido_updated_at ON contenido(updated_at);

-- Índice compuesto para consultas frecuentes de contenido publicado
CREATE INDEX IF NOT EXISTS idx_contenido_tipo_estado_fecha ON contenido(tipo, estado, fecha_publicacion DESC);

-- Índice para búsquedas de texto en título y contenido
CREATE INDEX IF NOT EXISTS idx_contenido_titulo_gin ON contenido USING gin(to_tsvector('spanish', titulo));
CREATE INDEX IF NOT EXISTS idx_contenido_contenido_gin ON contenido USING gin(to_tsvector('spanish', contenido));

-- Índices para la tabla de configuración
CREATE INDEX IF NOT EXISTS idx_contenido_config_activo ON contenido_configuracion(activo);
CREATE INDEX IF NOT EXISTS idx_contenido_config_destacado ON contenido_configuracion(destacado);
CREATE INDEX IF NOT EXISTS idx_contenido_config_orden ON contenido_configuracion(orden);

-- Índices para la tabla de métricas
CREATE INDEX IF NOT EXISTS idx_contenido_metricas_vistas ON contenido_metricas(vistas DESC);
CREATE INDEX IF NOT EXISTS idx_contenido_metricas_likes ON contenido_metricas(likes DESC);
CREATE INDEX IF NOT EXISTS idx_contenido_metricas_ultima_vista ON contenido_metricas(ultima_vista);

-- Índices para la tabla de taxonomía
CREATE INDEX IF NOT EXISTS idx_contenido_taxonomia_categoria ON contenido_taxonomia(categoria);
CREATE INDEX IF NOT EXISTS idx_contenido_taxonomia_etiqueta ON contenido_taxonomia(etiqueta);
CREATE INDEX IF NOT EXISTS idx_contenido_taxonomia_tipo ON contenido_taxonomia(tipo_taxonomia);
CREATE INDEX IF NOT EXISTS idx_contenido_taxonomia_contenido_tipo ON contenido_taxonomia(contenido_id, tipo_taxonomia);

-- Índices para comentarios unificados
CREATE INDEX IF NOT EXISTS idx_contenido_comentarios_contenido_id ON contenido_comentarios(contenido_id);
CREATE INDEX IF NOT EXISTS idx_contenido_comentarios_usuario_id ON contenido_comentarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_contenido_comentarios_aprobado ON contenido_comentarios(aprobado);
CREATE INDEX IF NOT EXISTS idx_contenido_comentarios_reportado ON contenido_comentarios(reportado);
CREATE INDEX IF NOT EXISTS idx_contenido_comentarios_parent_id ON contenido_comentarios(parent_id);
CREATE INDEX IF NOT EXISTS idx_contenido_comentarios_fecha ON contenido_comentarios(fecha_comentario DESC);

-- Índice compuesto para comentarios aprobados por contenido
CREATE INDEX IF NOT EXISTS idx_contenido_comentarios_contenido_aprobado_fecha ON contenido_comentarios(contenido_id, aprobado, fecha_comentario DESC);

-- Índices para likes unificados
CREATE INDEX IF NOT EXISTS idx_contenido_likes_contenido_id ON contenido_likes(contenido_id);
CREATE INDEX IF NOT EXISTS idx_contenido_likes_usuario_id ON contenido_likes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_contenido_likes_fecha ON contenido_likes(fecha_like DESC);

-- Índices para reportes unificados
CREATE INDEX IF NOT EXISTS idx_contenido_reportes_elemento_id ON contenido_reportes(elemento_id);
CREATE INDEX IF NOT EXISTS idx_contenido_reportes_tipo_elemento ON contenido_reportes(tipo_elemento);
CREATE INDEX IF NOT EXISTS idx_contenido_reportes_estado ON contenido_reportes(estado);
CREATE INDEX IF NOT EXISTS idx_contenido_reportes_fecha ON contenido_reportes(fecha_reporte DESC);

-- Índice compuesto para reportes pendientes
CREATE INDEX IF NOT EXISTS idx_contenido_reportes_estado_fecha ON contenido_reportes(estado, fecha_reporte DESC);

-- Índices para newsletter
CREATE INDEX IF NOT EXISTS idx_newsletter_activo ON newsletter_suscriptores(activo);
CREATE INDEX IF NOT EXISTS idx_newsletter_confirmado ON newsletter_suscriptores(confirmado);
CREATE INDEX IF NOT EXISTS idx_newsletter_fecha_suscripcion ON newsletter_suscriptores(fecha_suscripcion DESC);

-- Índice compuesto para suscriptores activos y confirmados
CREATE INDEX IF NOT EXISTS idx_newsletter_activo_confirmado ON newsletter_suscriptores(activo, confirmado);

-- ============================================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN DE CONSULTAS COMPLEJAS
-- ============================================================================

-- Índice para consultas de contenido con métricas (expresión calculada)
CREATE INDEX IF NOT EXISTS idx_contenido_metricas_popularidad ON contenido_metricas((vistas + likes) DESC);

-- Índice para contenido destacado y activo
CREATE INDEX IF NOT EXISTS idx_contenido_destacado_activo ON contenido_configuracion(destacado, activo) WHERE destacado = true AND activo = true;

-- Índice parcial para contenido publicado
CREATE INDEX IF NOT EXISTS idx_contenido_publicado ON contenido(fecha_publicacion DESC) WHERE estado = 'PUBLICADO';

-- Índice para búsquedas por autor y tipo
CREATE INDEX IF NOT EXISTS idx_contenido_autor_tipo ON contenido(autor_id, tipo);

-- Índice para comentarios no reportados y aprobados
CREATE INDEX IF NOT EXISTS idx_comentarios_validos ON contenido_comentarios(contenido_id, fecha_comentario DESC) WHERE aprobado = true AND reportado = false;

-- ============================================================================
-- COMENTARIOS SOBRE OPTIMIZACIÓN
-- ============================================================================

/*
Estos índices están diseñados para optimizar las siguientes consultas frecuentes:

1. Listado de contenido por tipo y estado
2. Búsqueda de texto completo en títulos y contenido
3. Contenido más popular (por vistas y likes)
4. Comentarios aprobados por contenido
5. Reportes pendientes de moderación
6. Suscriptores activos del newsletter
7. Contenido destacado y publicado
8. Taxonomía por categorías y etiquetas

Los índices GIN para búsqueda de texto completo permiten búsquedas eficientes
en español usando el diccionario de PostgreSQL.

Los índices compuestos están ordenados según la selectividad de las columnas
para maximizar la eficiencia de las consultas.
*/