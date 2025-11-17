import { PrismaClient, StatusConcurso } from '@prisma/client';
import { CreateConcursoDto, UpdateConcursoDto, ConcursoFilters } from '../schemas/concurso.schemas';
import { getNotificationService } from './notification.service';

const prisma = new PrismaClient();

export class ConcursoService {
  // Crear un nuevo concurso (solo ADMIN)
  async createConcurso(data: CreateConcursoDto) {
    const concurso = await prisma.concurso.create({
      data: {
        titulo: data.titulo,
        descripcion: data.descripcion,
        reglas: data.reglas || null,
        fecha_inicio: new Date(data.fecha_inicio),
        fecha_final: new Date(data.fecha_final),
        imagen_url: data.imagen_url || null,
        max_envios: data.max_envios || 3,
        tamano_max_mb: data.tamano_max_mb || 10,
      },
      include: {
        categorias: true,
        _count: {
          select: {
            inscripciones: true,
            medios: true,
          }
        }
      }
    });

    return concurso;
  }

  // Obtener todos los concursos con filtros
  async getConcursos(filters: ConcursoFilters) {
    const { status, page, limit, search } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { titulo: { contains: search, mode: 'insensitive' } },
        { descripcion: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [concursos, total] = await Promise.all([
      prisma.concurso.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          categorias: true,
          _count: {
            select: {
              inscripciones: true,
              medios: true,
            }
          }
        }
      }),
      prisma.concurso.count({ where })
    ]);

    return {
      concursos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Obtener concursos activos (para participantes)
  async getConcursosActivos() {
    const concursos = await prisma.concurso.findMany({
      where: {
        status: StatusConcurso.ACTIVO,
        fecha_final: {
          gte: new Date()
        }
      },
      orderBy: { fecha_final: 'asc' },
      include: {
        categorias: true,
        _count: {
          select: {
            inscripciones: true,
            medios: true,
          }
        }
      }
    });

    return concursos;
  }

  // Obtener concursos finalizados (para galería pública)
  async getConcursosFinalizados(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [concursos, total] = await Promise.all([
      prisma.concurso.findMany({
        where: {
          status: StatusConcurso.FINALIZADO
        },
        skip,
        take: limit,
        orderBy: { fecha_final: 'desc' },
        include: {
          categorias: true,
          _count: {
            select: {
              inscripciones: true,
              medios: true,
            }
          }
        }
      }),
      prisma.concurso.count({
        where: {
          status: StatusConcurso.FINALIZADO
        }
      })
    ]);

    return {
      concursos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Obtener un concurso por ID
  async getConcursoById(id: number) {
    const concurso = await prisma.concurso.findUnique({
      where: { id },
      include: {
        categorias: true,
        inscripciones: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                picture_url: true
              }
            }
          }
        },
        medios: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                picture_url: true
              }
            },
            categoria: true
          }
        },
        _count: {
          select: {
            inscripciones: true,
            medios: true,
          }
        }
      }
    });

    if (!concurso) {
      throw new Error('Concurso no encontrado');
    }

    // Convertir BigInt a Number en medios
    const concursoTransformado = {
      ...concurso,
      medios: concurso.medios.map(medio => ({
        ...medio,
        tamano_archivo: Number(medio.tamano_archivo)
      }))
    };

    return concursoTransformado;
  }

  // Actualizar un concurso (solo ADMIN)
  async updateConcurso(id: number, data: UpdateConcursoDto) {
    // Obtener el estado anterior del concurso
    const concursoAnterior = await prisma.concurso.findUnique({
      where: { id }
    });

    if (!concursoAnterior) {
      throw new Error('Concurso no encontrado');
    }

    const updateData: any = {};

    if (data.titulo !== undefined) updateData.titulo = data.titulo;
    if (data.descripcion !== undefined) updateData.descripcion = data.descripcion;
    if (data.reglas !== undefined) updateData.reglas = data.reglas;
    if (data.fecha_inicio !== undefined) updateData.fecha_inicio = new Date(data.fecha_inicio);
    if (data.fecha_final !== undefined) updateData.fecha_final = new Date(data.fecha_final);
    if (data.status !== undefined) updateData.status = data.status;
    if (data.imagen_url !== undefined) updateData.imagen_url = data.imagen_url;
    if (data.max_envios !== undefined) updateData.max_envios = data.max_envios;
    if (data.tamano_max_mb !== undefined) updateData.tamano_max_mb = data.tamano_max_mb;

    const concurso = await prisma.concurso.update({
      where: { id },
      data: updateData,
      include: {
        categorias: true,
        _count: {
          select: {
            inscripciones: true,
            medios: true,
          }
        }
      }
    });

    // Enviar notificaciones automáticas según cambios de estado
    try {
      const notificationService = getNotificationService(prisma);

      // Si el concurso cambió a ACTIVO, notificar nuevo concurso
      if (data.status === 'ACTIVO' && concursoAnterior.status !== 'ACTIVO') {
        await notificationService.sendNewContestNotification({
          concursoId: id
        });
      }

      // Si el concurso cambió a FINALIZADO, notificar resultados publicados
      if (data.status === 'FINALIZADO' && concursoAnterior.status !== 'FINALIZADO') {
        await notificationService.sendResultsPublished({
          concursoId: id
        });
      }
    } catch (notificationError) {
      console.error('Error enviando notificaciones automáticas:', notificationError);
      // No fallar la operación principal por error de notificación
    }

    return concurso;
  }

  // Eliminar un concurso (solo ADMIN)
  async deleteConcurso(id: number) {
    // Verificar que el concurso existe
    const concurso = await prisma.concurso.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            inscripciones: true,
            medios: true,
          }
        }
      }
    });

    if (!concurso) {
      throw new Error('Concurso no encontrado');
    }

    // No permitir eliminar concursos con inscripciones o medios
    if (concurso._count.inscripciones > 0 || concurso._count.medios > 0) {
      throw new Error('No se puede eliminar un concurso con inscripciones o medios enviados');
    }

    await prisma.concurso.delete({
      where: { id }
    });

    return { message: 'Concurso eliminado exitosamente' };
  }

  // Inscribir usuario a un concurso
  async inscribirUsuario(usuarioId: string, concursoId: number) {
    // Verificar que el concurso existe y está activo
    const concurso = await prisma.concurso.findUnique({
      where: { id: concursoId }
    });

    if (!concurso) {
      throw new Error('Concurso no encontrado');
    }

    if (concurso.status !== StatusConcurso.ACTIVO) {
      throw new Error('El concurso no está activo para inscripciones');
    }

    if (new Date() > concurso.fecha_final) {
      throw new Error('El período de inscripción ha finalizado');
    }

    // Verificar si ya está inscrito
    const inscripcionExistente = await prisma.inscripcion.findUnique({
      where: {
        usuario_id_concurso_id: {
          usuario_id: usuarioId,
          concurso_id: concursoId
        }
      }
    });

    if (inscripcionExistente) {
      throw new Error('Ya estás inscrito en este concurso');
    }

    // Crear la inscripción
    const inscripcion = await prisma.inscripcion.create({
      data: {
        usuario_id: usuarioId,
        concurso_id: concursoId
      },
      include: {
        concurso: {
          select: {
            id: true,
            titulo: true,
            descripcion: true,
            fecha_final: true
          }
        },
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true
          }
        }
      }
    });

    return inscripcion;
  }

  // Cancelar inscripción de usuario
  async cancelarInscripcion(usuarioId: string, concursoId: number) {
    // Verificar que la inscripción existe
    const inscripcion = await prisma.inscripcion.findUnique({
      where: {
        usuario_id_concurso_id: {
          usuario_id: usuarioId,
          concurso_id: concursoId
        }
      },
      include: {
        concurso: true
      }
    });

    if (!inscripcion) {
      throw new Error('No estás inscrito en este concurso');
    }

    // No permitir cancelar si el concurso ya finalizó o está en calificación
    if (inscripcion.concurso.status === StatusConcurso.FINALIZADO || 
        inscripcion.concurso.status === StatusConcurso.CALIFICACION) {
      throw new Error('No se puede cancelar la inscripción en un concurso finalizado o en calificación');
    }

    // Verificar si tiene medios enviados
    const mediosEnviados = await prisma.medio.count({
      where: {
        usuario_id: usuarioId,
        concurso_id: concursoId
      }
    });

    if (mediosEnviados > 0) {
      throw new Error('No se puede cancelar la inscripción si ya has enviado medios al concurso');
    }

    await prisma.inscripcion.delete({
      where: {
        usuario_id_concurso_id: {
          usuario_id: usuarioId,
          concurso_id: concursoId
        }
      }
    });

    return { message: 'Inscripción cancelada exitosamente' };
  }

  // Obtener inscripciones de un usuario
  async getInscripcionesUsuario(usuarioId: string) {
    const inscripciones = await prisma.inscripcion.findMany({
      where: { usuario_id: usuarioId },
      include: {
        concurso: {
          include: {
            categorias: true,
            _count: {
              select: {
                medios: {
                  where: {
                    usuario_id: usuarioId
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { fecha_inscripcion: 'desc' }
    });

    return inscripciones;
  }

  // Verificar si un usuario está inscrito en un concurso
  async verificarInscripcion(usuarioId: string, concursoId: number) {
    const inscripcion = await prisma.inscripcion.findUnique({
      where: {
        usuario_id_concurso_id: {
          usuario_id: usuarioId,
          concurso_id: concursoId
        }
      }
    });

    return !!inscripcion;
  }
}

export const concursoService = new ConcursoService();