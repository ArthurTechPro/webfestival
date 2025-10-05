import { Request, Response, NextFunction } from 'express';
import { socialMediaService } from '../services/social-media.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware para generar metadatos Open Graph dinámicos
 * Requisito 11.4: Implementar Open Graph tags para previews
 */
export const generateOpenGraphMetadata = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    // Solo aplicar a rutas de medios públicos
    if (!req.path.includes('/public/media/')) {
      next();
      return;
    }

    const medioId = parseInt(req.params.medioId, 10);
    
    if (isNaN(medioId)) {
      next();
      return;
    }

    // Obtener información del medio
    const medio = await prisma.medios.findUnique({
      where: { id: medioId },
      include: {
        usuario: {
          select: { nombre: true }
        },
        concurso: {
          select: { titulo: true, status: true }
        }
      }
    });

    if (!medio || medio.concurso.status !== 'Finalizado') {
      next();
      return;
    }

    // Obtener posición del medio
    const resultados = await prisma.$queryRaw<Array<{ posicion: number }>>`
      SELECT 
        ROW_NUMBER() OVER (
          PARTITION BY m.categoria_id 
          ORDER BY AVG(cd.puntuacion * c.peso) DESC
        ) as posicion
      FROM medios m
      LEFT JOIN calificaciones cal ON cal.medio_id = m.id
      LEFT JOIN calificaciones_detalle cd ON cd.calificacion_id = cal.id
      LEFT JOIN criterios c ON c.id = cd.criterio_id
      WHERE m.concurso_id = ${medio.concurso_id}
        AND m.categoria_id = ${medio.categoria_id}
        AND m.id = ${medioId}
      GROUP BY m.id, m.categoria_id
    `;

    const posicion = resultados.length > 0 ? Number(resultados[0].posicion) : 999;

    // Generar metadatos Open Graph
    const shareData = {
      medioId: medio.id,
      titulo: medio.titulo,
      autorNombre: medio.usuario.nombre || 'Usuario',
      concursoTitulo: medio.concurso.titulo,
      posicion,
      tipoMedio: medio.tipo_medio as 'fotografia' | 'video' | 'audio' | 'corto_cine',
      medioUrl: medio.medio_url,
      thumbnailUrl: medio.thumbnail_url || undefined
    };

    const openGraphMetadata = socialMediaService.generateOpenGraphMetadata(shareData);

    // Agregar metadatos a la respuesta
    res.locals.openGraphMetadata = openGraphMetadata;
    res.locals.shareData = shareData;

    next();

  } catch (error) {
    console.error('Error generando metadatos Open Graph:', error);
    next(); // Continuar sin metadatos en caso de error
  }
};

/**
 * Middleware para inyectar metadatos Open Graph en respuestas HTML
 */
export const injectOpenGraphTags = (
  req: Request, 
  res: Response, 
  next: NextFunction
): void => {
  const originalSend = res.send;

  res.send = function(body: any) {
    if (res.locals.openGraphMetadata && typeof body === 'string' && body.includes('<head>')) {
      // Generar tags HTML
      const metaTags = Object.entries(res.locals.openGraphMetadata)
        .map(([property, content]) => `<meta property="${property}" content="${content}" />`)
        .join('\n    ');

      // Inyectar en el HTML
      body = body.replace('<head>', `<head>\n    ${metaTags}`);
    }

    return originalSend.call(this, body);
  };

  next();
};