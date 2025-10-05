import { Request, Response } from 'express';
import { z } from 'zod';
import { socialMediaService, ShareableLinkData } from '../services/social-media.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Esquemas de validación para requests
const GenerateShareLinksSchema = z.object({
  medioId: z.number().int().positive()
});

const PublicMediaAccessSchema = z.object({
  medioId: z.string().transform(val => parseInt(val, 10)),
  slug: z.string().optional()
});

export class SocialMediaController {
  /**
   * Genera enlaces para compartir un medio ganador en redes sociales
   * Requisito 11.1: Mostrar botones para compartir en Facebook, Instagram, Twitter y LinkedIn
   * Requisito 11.2: Generar enlace público con contenido, título del concurso y posición
   * Requisito 11.3: Incluir hashtags relevantes del concurso y la plataforma
   */
  async generateShareLinks(req: Request, res: Response): Promise<void> {
    try {
      const { medioId } = GenerateShareLinksSchema.parse(req.body);
      const userId = req.user?.id;

      // Verificar que el medio existe y obtener información completa
      const medio = await prisma.medio.findUnique({
        where: { id: medioId },
        include: {
          usuario: {
            select: { id: true, nombre: true }
          },
          concurso: {
            select: { id: true, titulo: true, status: true }
          },
          categoria: {
            select: { id: true, nombre: true }
          }
        }
      });

      if (!medio) {
        res.status(404).json({
          success: false,
          message: 'Medio no encontrado'
        });
        return;
      }

      // Verificar que el concurso está finalizado
      if (medio.concurso.status !== 'FINALIZADO') {
        res.status(400).json({
          success: false,
          message: 'Solo se pueden compartir medios de concursos finalizados'
        });
        return;
      }

      // Verificar que el usuario es el propietario del medio
      if (userId && medio.usuario_id !== userId) {
        res.status(403).json({
          success: false,
          message: 'Solo puedes compartir tus propios medios'
        });
        return;
      }

      // Obtener la posición del medio en el concurso
      const resultados = await prisma.$queryRaw<Array<{ medio_id: number; posicion: number }>>`
        SELECT 
          m.id as medio_id,
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
        GROUP BY m.id, m.categoria_id
        HAVING m.id = ${medioId}
      `;

      const posicion = resultados.length > 0 ? Number(resultados[0]?.posicion) : 999;

      // Solo permitir compartir si está en los primeros 3 lugares
      if (posicion > 3) {
        res.status(400).json({
          success: false,
          message: 'Solo se pueden compartir medios ganadores (primeros 3 lugares)'
        });
        return;
      }

      // Preparar datos para generar enlaces
      const shareData: ShareableLinkData = {
        medioId: medio.id,
        titulo: medio.titulo,
        autorNombre: medio.usuario.nombre || 'Usuario',
        concursoTitulo: medio.concurso.titulo,
        posicion,
        tipoMedio: medio.tipo_medio as 'fotografia' | 'video' | 'audio' | 'corto_cine',
        medioUrl: medio.medio_url,
        thumbnailUrl: medio.thumbnail_url || undefined
      };

      // Generar todos los enlaces de compartir
      const shareUrls = socialMediaService.getAllShareUrls(shareData);
      const shareContent = socialMediaService.generateShareContent(shareData);

      res.json({
        success: true,
        data: {
          medio: {
            id: medio.id,
            titulo: medio.titulo,
            autor: medio.usuario.nombre,
            concurso: medio.concurso.titulo,
            posicion,
            tipoMedio: medio.tipo_medio
          },
          shareUrls,
          shareContent,
          message: 'Enlaces de compartir generados exitosamente'
        }
      });

    } catch (error) {
      console.error('Error generando enlaces de compartir:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: error.errors
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Endpoint público para acceder a medios compartidos
   * Requisito 11.4: Mostrar el medio con información básica del concurso para usuarios no autenticados
   */
  async getPublicMedia(req: Request, res: Response): Promise<void> {
    try {
      const { medioId } = PublicMediaAccessSchema.parse(req.params);

      // Obtener información completa del medio
      const medio = await prisma.medio.findUnique({
        where: { id: medioId },
        include: {
          usuario: {
            select: { id: true, nombre: true, picture_url: true }
          },
          concurso: {
            select: { 
              id: true, 
              titulo: true, 
              descripcion: true,
              status: true,
              fecha_inicio: true,
              fecha_final: true
            }
          },
          categoria: {
            select: { id: true, nombre: true }
          },
          calificaciones: {
            include: {
              detalles: {
                include: {
                  criterio: true
                }
              },
              jurado: {
                select: { nombre: true }
              }
            }
          }
        }
      });

      if (!medio) {
        res.status(404).json({
          success: false,
          message: 'Medio no encontrado'
        });
        return;
      }

      // Solo mostrar medios de concursos finalizados
      if (medio.concurso.status !== 'FINALIZADO') {
        res.status(404).json({
          success: false,
          message: 'Medio no disponible públicamente'
        });
        return;
      }

      // Calcular posición y puntaje
      const resultados = await prisma.$queryRaw<Array<{ 
        medio_id: number; 
        posicion: number; 
        puntaje_promedio: number;
        puntaje_ponderado: number;
      }>>`
        SELECT 
          m.id as medio_id,
          ROW_NUMBER() OVER (
            PARTITION BY m.categoria_id 
            ORDER BY AVG(cd.puntuacion * c.peso) DESC
          ) as posicion,
          AVG(cd.puntuacion) as puntaje_promedio,
          AVG(cd.puntuacion * c.peso) as puntaje_ponderado
        FROM medios m
        LEFT JOIN calificaciones cal ON cal.medio_id = m.id
        LEFT JOIN calificaciones_detalle cd ON cd.calificacion_id = cal.id
        LEFT JOIN criterios c ON c.id = cd.criterio_id
        WHERE m.concurso_id = ${medio.concurso_id}
          AND m.categoria_id = ${medio.categoria_id}
        GROUP BY m.id, m.categoria_id
        HAVING m.id = ${medioId}
      `;

      const resultado = resultados.length > 0 ? resultados[0] : null;

      // Preparar datos para Open Graph
      const shareData: ShareableLinkData = {
        medioId: medio.id,
        titulo: medio.titulo,
        autorNombre: medio.usuario.nombre || 'Usuario',
        concursoTitulo: medio.concurso.titulo,
        posicion: resultado ? Number(resultado.posicion) : 999,
        tipoMedio: medio.tipo_medio as 'fotografia' | 'video' | 'audio' | 'corto_cine',
        medioUrl: medio.medio_url,
        thumbnailUrl: medio.thumbnail_url || undefined
      };

      // Generar metadatos Open Graph
      const openGraphMetadata = socialMediaService.generateOpenGraphMetadata(shareData);

      // Calcular estadísticas de calificaciones
      const calificacionesStats = medio.calificaciones.length > 0 ? {
        totalJurados: medio.calificaciones.length,
        puntajePromedio: resultado ? Number(resultado.puntaje_promedio).toFixed(1) : '0.0',
        puntajePonderado: resultado ? Number(resultado.puntaje_ponderado).toFixed(1) : '0.0',
        criteriosEvaluados: medio.calificaciones[0]?.detalles?.length || 0
      } : null;

      res.json({
        success: true,
        data: {
          medio: {
            id: medio.id,
            titulo: medio.titulo,
            tipoMedio: medio.tipo_medio,
            medioUrl: medio.medio_url,
            thumbnailUrl: medio.thumbnail_url,
            previewUrl: medio.preview_url,
            duracion: medio.duracion,
            formato: medio.formato,
            fechaSubida: medio.fecha_subida
          },
          autor: {
            nombre: medio.usuario.nombre,
            pictureUrl: medio.usuario.picture_url
          },
          concurso: {
            titulo: medio.concurso.titulo,
            descripcion: medio.concurso.descripcion,
            fechaInicio: medio.concurso.fecha_inicio,
            fechaFinal: medio.concurso.fecha_final
          },
          categoria: {
            nombre: medio.categoria.nombre
          },
          resultado: resultado ? {
            posicion: Number(resultado.posicion),
            puntajePromedio: Number(resultado.puntaje_promedio).toFixed(1),
            puntajePonderado: Number(resultado.puntaje_ponderado).toFixed(1)
          } : null,
          estadisticas: calificacionesStats,
          openGraph: openGraphMetadata,
          shareUrls: socialMediaService.getAllShareUrls(shareData)
        }
      });

    } catch (error) {
      console.error('Error obteniendo medio público:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Parámetros inválidos',
          errors: error.errors
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtiene la configuración de redes sociales (para debugging)
   */
  async getConfiguration(_req: Request, res: Response): Promise<void> {
    try {
      const validation = socialMediaService.validateConfiguration();
      
      res.json({
        success: true,
        data: {
          isConfigured: validation.isValid,
          missingKeys: validation.missingKeys,
          availableServices: {
            facebook: !!process.env['FACEBOOK_APP_ID'],
            instagram: !!process.env['INSTAGRAM_ACCESS_TOKEN'],
            twitter: !!process.env['TWITTER_API_KEY'],
            linkedin: !!process.env['LINKEDIN_CLIENT_ID']
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo configuración:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

export const socialMediaController = new SocialMediaController();