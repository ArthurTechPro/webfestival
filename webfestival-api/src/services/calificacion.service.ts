import { PrismaClient, TipoMedio } from '@prisma/client';
import { criteriosService } from './criterios.service';
import { getNotificationService } from './notification.service';

const prisma = new PrismaClient();

export interface CreateCalificacionDto {
  medio_id: number;
  comentarios?: string | undefined;
  criterios: {
    criterio_id: number;
    puntuacion: number; // 1-10
  }[];
}

export interface UpdateCalificacionDto {
  comentarios?: string | undefined;
  criterios?: {
    criterio_id: number;
    puntuacion: number;
  }[] | undefined;
}

export interface CalificacionFilters {
  medio_id?: number;
  jurado_id?: string;
  concurso_id?: number;
  categoria_id?: number;
  tipo_medio?: TipoMedio;
}

export interface ProgresoEvaluacion {
  concurso_id: number;
  total_medios: number;
  medios_evaluados: number;
  medios_pendientes: number;
  porcentaje_completado: number;
  jurados_asignados: number;
  evaluaciones_completadas: number;
  evaluaciones_pendientes: number;
}

export interface ResultadoFinal {
  medio_id: number;
  puntaje_total: number;
  puntaje_promedio: number;
  posicion: number;
  numero_evaluaciones: number;
  detalles_por_criterio: {
    criterio_id: number;
    criterio_nombre: string;
    puntaje_promedio: number;
    peso: number;
    puntaje_ponderado: number;
  }[];
}

export class CalificacionService {
  /**
   * Crear una nueva calificación con criterios dinámicos
   */
  async createCalificacion(juradoId: string, data: CreateCalificacionDto) {
    // Verificar que el medio existe
    const medio = await prisma.medio.findUnique({
      where: { id: data.medio_id },
      include: {
        concurso: true,
        categoria: true
      }
    });

    if (!medio) {
      throw new Error('Medio no encontrado');
    }

    // Verificar que el jurado está asignado a la categoría
    const asignacion = await prisma.juradoAsignacion.findUnique({
      where: {
        usuario_id_categoria_id: {
          usuario_id: juradoId,
          categoria_id: medio.categoria_id
        }
      }
    });

    if (!asignacion) {
      throw new Error('No tienes permisos para evaluar medios de esta categoría');
    }

    // Verificar que no existe una calificación previa
    const calificacionExistente = await prisma.calificacion.findUnique({
      where: {
        medio_id_jurado_id: {
          medio_id: data.medio_id,
          jurado_id: juradoId
        }
      }
    });

    if (calificacionExistente) {
      throw new Error('Ya has calificado este medio');
    }

    // Obtener criterios aplicables para el tipo de medio
    const criteriosAplicables = await criteriosService.getCriteriosPorTipoMedio(medio.tipo_medio);
    const criteriosIds = criteriosAplicables.map(c => c.id);

    // Validar que todos los criterios requeridos están incluidos
    const criteriosEnviados = data.criterios.map(c => c.criterio_id);
    const criteriosFaltantes = criteriosIds.filter(id => !criteriosEnviados.includes(id));

    if (criteriosFaltantes.length > 0) {
      throw new Error(`Faltan calificaciones para los criterios: ${criteriosFaltantes.join(', ')}`);
    }

    // Validar que no se envíen criterios no aplicables
    const criteriosInvalidos = criteriosEnviados.filter(id => !criteriosIds.includes(id));
    if (criteriosInvalidos.length > 0) {
      throw new Error(`Criterios no aplicables para este tipo de medio: ${criteriosInvalidos.join(', ')}`);
    }

    // Validar puntuaciones (1-10)
    for (const criterio of data.criterios) {
      if (criterio.puntuacion < 1 || criterio.puntuacion > 10) {
        throw new Error(`La puntuación debe estar entre 1 y 10. Criterio ${criterio.criterio_id}: ${criterio.puntuacion}`);
      }
    }

    // Crear la calificación con transacción
    const calificacion = await prisma.$transaction(async (tx) => {
      // Crear calificación principal
      const nuevaCalificacion = await tx.calificacion.create({
        data: {
          medio_id: data.medio_id,
          jurado_id: juradoId,
          comentarios: data.comentarios || null
        }
      });

      // Crear detalles de calificación
      await tx.calificacionDetalle.createMany({
        data: data.criterios.map(criterio => ({
          calificacion_id: nuevaCalificacion.id,
          criterio_id: criterio.criterio_id,
          puntuacion: criterio.puntuacion
        }))
      });

      return nuevaCalificacion;
    });

    // Enviar notificación automática de evaluación completada
    try {
      const notificationService = getNotificationService(prisma);
      await notificationService.sendEvaluationComplete({
        medioId: data.medio_id,
        juradoId: juradoId
      });
    } catch (notificationError) {
      console.error('Error enviando notificación de evaluación completada:', notificationError);
      // No fallar la operación principal por error de notificación
    }

    // Retornar calificación completa
    return await this.getCalificacionById(calificacion.id);
  }

  /**
   * Actualizar una calificación existente
   */
  async updateCalificacion(calificacionId: number, juradoId: string, data: UpdateCalificacionDto) {
    // Verificar que la calificación existe y pertenece al jurado
    const calificacion = await prisma.calificacion.findUnique({
      where: { id: calificacionId },
      include: {
        medio: {
          include: {
            concurso: true
          }
        }
      }
    });

    if (!calificacion) {
      throw new Error('Calificación no encontrada');
    }

    if (calificacion.jurado_id !== juradoId) {
      throw new Error('No tienes permisos para editar esta calificación');
    }

    // Verificar que el concurso no esté finalizado
    if (calificacion.medio.concurso.status === 'FINALIZADO') {
      throw new Error('No se puede editar calificaciones de concursos finalizados');
    }

    // Actualizar con transacción
    await prisma.$transaction(async (tx) => {
      // Actualizar comentarios si se proporcionan
      if (data.comentarios !== undefined) {
        await tx.calificacion.update({
          where: { id: calificacionId },
          data: { comentarios: data.comentarios }
        });
      }

      // Actualizar criterios si se proporcionan
      if (data.criterios && data.criterios.length > 0) {
        // Eliminar detalles existentes
        await tx.calificacionDetalle.deleteMany({
          where: { calificacion_id: calificacionId }
        });

        // Crear nuevos detalles
        await tx.calificacionDetalle.createMany({
          data: data.criterios.map(criterio => ({
            calificacion_id: calificacionId,
            criterio_id: criterio.criterio_id,
            puntuacion: criterio.puntuacion
          }))
        });
      }
    });

    return await this.getCalificacionById(calificacionId);
  }

  /**
   * Obtener calificación por ID con detalles completos
   */
  async getCalificacionById(id: number) {
    return await prisma.calificacion.findUnique({
      where: { id },
      include: {
        medio: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                picture_url: true
              }
            },
            concurso: {
              select: {
                id: true,
                titulo: true,
                status: true
              }
            },
            categoria: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        },
        jurado: {
          select: {
            id: true,
            nombre: true,
            picture_url: true
          }
        },
        detalles: {
          include: {
            criterio: true
          },
          orderBy: {
            criterio: {
              orden: 'asc'
            }
          }
        }
      }
    });
  }

  /**
   * Obtener calificaciones con filtros
   */
  async getCalificaciones(filters: CalificacionFilters) {
    const where: any = {};

    if (filters.medio_id) {
      where.medio_id = filters.medio_id;
    }

    if (filters.jurado_id) {
      where.jurado_id = filters.jurado_id;
    }

    if (filters.concurso_id) {
      where.medio = {
        concurso_id: filters.concurso_id
      };
    }

    if (filters.categoria_id) {
      where.medio = {
        ...where.medio,
        categoria_id: filters.categoria_id
      };
    }

    if (filters.tipo_medio) {
      where.medio = {
        ...where.medio,
        tipo_medio: filters.tipo_medio
      };
    }

    return await prisma.calificacion.findMany({
      where,
      include: {
        medio: {
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
        jurado: {
          select: {
            id: true,
            nombre: true,
            picture_url: true
          }
        },
        detalles: {
          include: {
            criterio: true
          }
        }
      },
      orderBy: {
        fecha_calificacion: 'desc'
      }
    });
  }

  /**
   * Obtener medios asignados a un jurado para evaluación
   */
  async getMediosAsignados(juradoId: string) {
    // Obtener categorías asignadas al jurado
    const asignaciones = await prisma.juradoAsignacion.findMany({
      where: { usuario_id: juradoId },
      include: {
        categoria: {
          include: {
            concurso: true
          }
        }
      }
    });

    const categoriasIds = asignaciones.map(a => a.categoria_id);

    if (categoriasIds.length === 0) {
      return [];
    }

    // Obtener medios de las categorías asignadas
    const medios = await prisma.medio.findMany({
      where: {
        categoria_id: {
          in: categoriasIds
        },
        concurso: {
          status: {
            in: ['ACTIVO', 'CALIFICACION']
          }
        }
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            picture_url: true
          }
        },
        concurso: {
          select: {
            id: true,
            titulo: true,
            status: true
          }
        },
        categoria: {
          select: {
            id: true,
            nombre: true
          }
        },
        calificaciones: {
          where: {
            jurado_id: juradoId
          },
          include: {
            detalles: {
              include: {
                criterio: true
              }
            }
          }
        }
      },
      orderBy: {
        fecha_subida: 'asc'
      }
    });

    // Agregar información de estado de evaluación
    return medios.map(medio => ({
      ...medio,
      ya_evaluado: medio.calificaciones.length > 0,
      criterios_aplicables: null // Se cargará dinámicamente en el frontend
    }));
  }

  /**
   * Obtener progreso de evaluaciones por concurso
   */
  async getProgresoEvaluacion(concursoId: number): Promise<ProgresoEvaluacion> {
    // Obtener total de medios del concurso
    const totalMedios = await prisma.medio.count({
      where: { concurso_id: concursoId }
    });

    // Obtener jurados asignados al concurso
    const juradosAsignados = await prisma.juradoAsignacion.count({
      where: {
        categoria: {
          concurso_id: concursoId
        }
      }
    });

    // Obtener evaluaciones completadas
    const evaluacionesCompletadas = await prisma.calificacion.count({
      where: {
        medio: {
          concurso_id: concursoId
        }
      }
    });

    // Calcular medios únicos evaluados
    const mediosEvaluados = await prisma.calificacion.groupBy({
      by: ['medio_id'],
      where: {
        medio: {
          concurso_id: concursoId
        }
      }
    });

    const numeroMediosEvaluados = mediosEvaluados.length;
    const mediosPendientes = totalMedios - numeroMediosEvaluados;
    const evaluacionesPendientes = (totalMedios * juradosAsignados) - evaluacionesCompletadas;
    const porcentajeCompletado = totalMedios > 0 ? (numeroMediosEvaluados / totalMedios) * 100 : 0;

    return {
      concurso_id: concursoId,
      total_medios: totalMedios,
      medios_evaluados: numeroMediosEvaluados,
      medios_pendientes: mediosPendientes,
      porcentaje_completado: Math.round(porcentajeCompletado * 100) / 100,
      jurados_asignados: juradosAsignados,
      evaluaciones_completadas: evaluacionesCompletadas,
      evaluaciones_pendientes: Math.max(0, evaluacionesPendientes)
    };
  }

  /**
   * Calcular resultados finales de un concurso
   */
  async calcularResultadosFinales(concursoId: number): Promise<ResultadoFinal[]> {
    // Obtener todos los medios del concurso con sus calificaciones
    const medios = await prisma.medio.findMany({
      where: { concurso_id: concursoId },
      include: {
        calificaciones: {
          include: {
            detalles: {
              include: {
                criterio: true
              }
            }
          }
        }
      }
    });

    const resultados: ResultadoFinal[] = [];

    for (const medio of medios) {
      if (medio.calificaciones.length === 0) {
        // Medio sin calificaciones
        resultados.push({
          medio_id: medio.id,
          puntaje_total: 0,
          puntaje_promedio: 0,
          posicion: 0,
          numero_evaluaciones: 0,
          detalles_por_criterio: []
        });
        continue;
      }

      // Agrupar calificaciones por criterio
      const criteriosMap = new Map<number, {
        criterio_id: number;
        criterio_nombre: string;
        peso: number;
        puntuaciones: number[];
      }>();

      for (const calificacion of medio.calificaciones) {
        for (const detalle of calificacion.detalles) {
          const criterioId = detalle.criterio_id;
          
          if (!criteriosMap.has(criterioId)) {
            criteriosMap.set(criterioId, {
              criterio_id: criterioId,
              criterio_nombre: detalle.criterio.nombre,
              peso: Number(detalle.criterio.peso),
              puntuaciones: []
            });
          }

          criteriosMap.get(criterioId)?.puntuaciones.push(detalle.puntuacion);
        }
      }

      // Calcular promedios y puntajes ponderados
      const detallesPorCriterio = Array.from(criteriosMap.values()).map(criterio => {
        const puntajePromedio = criterio.puntuaciones.reduce((sum, p) => sum + p, 0) / criterio.puntuaciones.length;
        const puntajePonderado = puntajePromedio * criterio.peso;

        return {
          criterio_id: criterio.criterio_id,
          criterio_nombre: criterio.criterio_nombre,
          puntaje_promedio: Math.round(puntajePromedio * 100) / 100,
          peso: criterio.peso,
          puntaje_ponderado: Math.round(puntajePonderado * 100) / 100
        };
      });

      // Calcular puntaje total ponderado
      const puntajeTotal = detallesPorCriterio.reduce((sum, d) => sum + d.puntaje_ponderado, 0);
      const pesoTotal = detallesPorCriterio.reduce((sum, d) => sum + d.peso, 0);
      const puntajePromedio = pesoTotal > 0 ? puntajeTotal / pesoTotal : 0;

      resultados.push({
        medio_id: medio.id,
        puntaje_total: Math.round(puntajeTotal * 100) / 100,
        puntaje_promedio: Math.round(puntajePromedio * 100) / 100,
        posicion: 0, // Se calculará después del ordenamiento
        numero_evaluaciones: medio.calificaciones.length,
        detalles_por_criterio: detallesPorCriterio
      });
    }

    // Ordenar por puntaje total descendente y asignar posiciones
    resultados.sort((a, b) => b.puntaje_total - a.puntaje_total);
    
    resultados.forEach((resultado, index) => {
      resultado.posicion = index + 1;
    });

    return resultados;
  }

  /**
   * Eliminar una calificación
   */
  async deleteCalificacion(calificacionId: number, juradoId: string) {
    // Verificar que la calificación existe y pertenece al jurado
    const calificacion = await prisma.calificacion.findUnique({
      where: { id: calificacionId },
      include: {
        medio: {
          include: {
            concurso: true
          }
        }
      }
    });

    if (!calificacion) {
      throw new Error('Calificación no encontrada');
    }

    if (calificacion.jurado_id !== juradoId) {
      throw new Error('No tienes permisos para eliminar esta calificación');
    }

    // Verificar que el concurso no esté finalizado
    if (calificacion.medio.concurso.status === 'FINALIZADO') {
      throw new Error('No se pueden eliminar calificaciones de concursos finalizados');
    }

    // Eliminar calificación (los detalles se eliminan en cascada)
    await prisma.calificacion.delete({
      where: { id: calificacionId }
    });

    return { message: 'Calificación eliminada exitosamente' };
  }

  /**
   * Obtener estadísticas de calificaciones
   */
  async getEstadisticasCalificaciones() {
    const totalCalificaciones = await prisma.calificacion.count();
    
    const calificacionesPorConcurso = await prisma.calificacion.groupBy({
      by: ['medio_id'],
      _count: true,
      orderBy: {
        _count: {
          medio_id: 'desc'
        }
      },
      take: 10
    });

    const promediosPorCriterio = await prisma.calificacionDetalle.groupBy({
      by: ['criterio_id'],
      _avg: {
        puntuacion: true
      },
      _count: true
    });

    return {
      total_calificaciones: totalCalificaciones,
      calificaciones_por_concurso: calificacionesPorConcurso,
      promedios_por_criterio: promediosPorCriterio
    };
  }
}

export const calificacionService = new CalificacionService();