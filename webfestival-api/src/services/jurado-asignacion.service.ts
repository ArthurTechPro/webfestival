import { PrismaClient, TipoMedio } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateAsignacionDto {
  usuario_id: string;
  categoria_id: number;
}

export interface AsignacionInteligente {
  usuario_id: string;
  categorias_sugeridas: number[];
  razon: string;
  compatibilidad: number; // 0-100
}

export class JuradoAsignacionService {
  /**
   * Crear una nueva asignación de jurado a categoría
   */
  async createAsignacion(data: CreateAsignacionDto) {
    // Verificar que el usuario tiene rol JURADO
    const usuario = await prisma.usuario.findUnique({
      where: { id: data.usuario_id }
    });

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    if (usuario.role !== 'JURADO') {
      throw new Error('El usuario debe tener rol de JURADO');
    }

    // Verificar que la categoría existe
    const categoria = await prisma.categoria.findUnique({
      where: { id: data.categoria_id },
      include: {
        concurso: true
      }
    });

    if (!categoria) {
      throw new Error('Categoría no encontrada');
    }

    // Verificar que no existe una asignación duplicada
    const asignacionExistente = await prisma.juradoAsignacion.findUnique({
      where: {
        usuario_id_categoria_id: {
          usuario_id: data.usuario_id,
          categoria_id: data.categoria_id
        }
      }
    });

    if (asignacionExistente) {
      throw new Error('El jurado ya está asignado a esta categoría');
    }

    // Crear la asignación
    const asignacion = await prisma.juradoAsignacion.create({
      data: {
        usuario_id: data.usuario_id,
        categoria_id: data.categoria_id
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            picture_url: true
          }
        },
        categoria: {
          include: {
            concurso: {
              select: {
                id: true,
                titulo: true,
                status: true
              }
            }
          }
        }
      }
    });

    return asignacion;
  }

  /**
   * Obtener todas las asignaciones con filtros
   */
  async getAsignaciones(filters: {
    usuario_id?: string;
    categoria_id?: number;
    concurso_id?: number;
  } = {}) {
    const where: any = {};

    if (filters.usuario_id) {
      where.usuario_id = filters.usuario_id;
    }

    if (filters.categoria_id) {
      where.categoria_id = filters.categoria_id;
    }

    if (filters.concurso_id) {
      where.categoria = {
        concurso_id: filters.concurso_id
      };
    }

    return await prisma.juradoAsignacion.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            picture_url: true
          }
        },
        categoria: {
          include: {
            concurso: {
              select: {
                id: true,
                titulo: true,
                status: true
              }
            }
          }
        }
      },
      orderBy: [
        { categoria: { concurso: { fecha_inicio: 'desc' } } },
        { usuario: { nombre: 'asc' } }
      ]
    });
  }

  /**
   * Obtener asignaciones de un jurado específico
   */
  async getAsignacionesJurado(usuarioId: string) {
    return await this.getAsignaciones({ usuario_id: usuarioId });
  }

  /**
   * Obtener jurados asignados a una categoría
   */
  async getJuradosCategoria(categoriaId: number) {
    return await this.getAsignaciones({ categoria_id: categoriaId });
  }

  /**
   * Obtener jurados asignados a un concurso
   */
  async getJuradosConcurso(concursoId: number) {
    return await this.getAsignaciones({ concurso_id: concursoId });
  }

  /**
   * Eliminar una asignación
   */
  async deleteAsignacion(usuarioId: string, categoriaId: number) {
    // Verificar que la asignación existe
    const asignacion = await prisma.juradoAsignacion.findUnique({
      where: {
        usuario_id_categoria_id: {
          usuario_id: usuarioId,
          categoria_id: categoriaId
        }
      },
      include: {
        categoria: {
          include: {
            concurso: true
          }
        }
      }
    });

    if (!asignacion) {
      throw new Error('Asignación no encontrada');
    }

    // Verificar que el concurso no esté finalizado
    if (asignacion.categoria.concurso.status === 'FINALIZADO') {
      throw new Error('No se pueden eliminar asignaciones de concursos finalizados');
    }

    // Verificar si el jurado ya ha calificado medios de esta categoría
    const calificacionesExistentes = await prisma.calificacion.count({
      where: {
        jurado_id: usuarioId,
        medio: {
          categoria_id: categoriaId
        }
      }
    });

    if (calificacionesExistentes > 0) {
      throw new Error(`No se puede eliminar la asignación porque el jurado ya ha calificado ${calificacionesExistentes} medios de esta categoría`);
    }

    // Eliminar la asignación
    await prisma.juradoAsignacion.delete({
      where: {
        usuario_id_categoria_id: {
          usuario_id: usuarioId,
          categoria_id: categoriaId
        }
      }
    });

    return { message: 'Asignación eliminada exitosamente' };
  }

  /**
   * Asignación inteligente de jurados basada en especialización
   */
  async sugerirAsignacionesInteligentes(concursoId: number): Promise<AsignacionInteligente[]> {
    // Obtener categorías del concurso
    const categorias = await prisma.categoria.findMany({
      where: { concurso_id: concursoId }
    });

    // Obtener jurados disponibles
    const jurados = await prisma.usuario.findMany({
      where: { 
        role: 'JURADO'
      }
    });

    const sugerencias: AsignacionInteligente[] = [];

    for (const jurado of jurados) {
      const categoriasCompatibles: number[] = [];
      let compatibilidadTotal = 0;
      let razonesCompatibilidad: string[] = [];

      // Determinar tipo de medio de cada categoría (heurística basada en nombre)
      for (const categoria of categorias) {
        let tipoMedioCategoria: TipoMedio | null = null;
        const nombreLower = categoria.nombre.toLowerCase();

        if (nombreLower.includes('foto') || nombreLower.includes('imagen') || nombreLower.includes('retrato')) {
          tipoMedioCategoria = 'fotografia';
        } else if (nombreLower.includes('video') || nombreLower.includes('documental') || nombreLower.includes('clip')) {
          tipoMedioCategoria = 'video';
        } else if (nombreLower.includes('audio') || nombreLower.includes('música') || nombreLower.includes('sonido')) {
          tipoMedioCategoria = 'audio';
        } else if (nombreLower.includes('corto') || nombreLower.includes('cine') || nombreLower.includes('film')) {
          tipoMedioCategoria = 'corto_cine';
        }

        // Por ahora, asignar compatibilidad base a todos los jurados
        // TODO: Implementar sistema de especializaciones en el futuro
        let compatibilidadCategoria = 70; // Compatibilidad base para todos los jurados
        razonesCompatibilidad.push('Jurado calificado');
        
        // Evitar warning de variable no usada
        console.log(`Evaluando compatibilidad para tipo: ${tipoMedioCategoria || 'general'}`);

        if (compatibilidadCategoria >= 60) { // Umbral mínimo de compatibilidad
          categoriasCompatibles.push(categoria.id);
          compatibilidadTotal += compatibilidadCategoria;
        }
      }

      if (categoriasCompatibles.length > 0) {
        const compatibilidadPromedio = Math.round(compatibilidadTotal / categoriasCompatibles.length);
        
        sugerencias.push({
          usuario_id: jurado.id,
          categorias_sugeridas: categoriasCompatibles,
          razon: razonesCompatibilidad.join(', '),
          compatibilidad: compatibilidadPromedio
        });
      }
    }

    // Ordenar por compatibilidad descendente
    return sugerencias.sort((a, b) => b.compatibilidad - a.compatibilidad);
  }

  /**
   * Asignar múltiples jurados automáticamente
   */
  async asignarJuradosAutomaticamente(concursoId: number) {
    const sugerencias = await this.sugerirAsignacionesInteligentes(concursoId);
    const asignacionesCreadas = [];

    for (const sugerencia of sugerencias) {
      for (const categoriaId of sugerencia.categorias_sugeridas) {
        try {
          const asignacion = await this.createAsignacion({
            usuario_id: sugerencia.usuario_id,
            categoria_id: categoriaId
          });
          asignacionesCreadas.push(asignacion);
        } catch (error) {
          // Ignorar errores de asignaciones duplicadas
          console.log(`Asignación ya existe: ${sugerencia.usuario_id} -> ${categoriaId}`);
        }
      }
    }

    return {
      asignaciones_creadas: asignacionesCreadas.length,
      sugerencias_procesadas: sugerencias.length,
      asignaciones: asignacionesCreadas
    };
  }

  /**
   * Obtener estadísticas de asignaciones
   */
  async getEstadisticasAsignaciones() {
    const totalAsignaciones = await prisma.juradoAsignacion.count();
    
    const asignacionesPorConcurso = await prisma.juradoAsignacion.groupBy({
      by: ['categoria_id'],
      _count: true,
      orderBy: {
        _count: {
          categoria_id: 'desc'
        }
      },
      take: 10
    });

    const juradosActivos = await prisma.usuario.count({
      where: {
        role: 'JURADO'
      }
    });

    const juradosConAsignaciones = await prisma.juradoAsignacion.groupBy({
      by: ['usuario_id'],
      _count: true
    });

    return {
      total_asignaciones: totalAsignaciones,
      jurados_activos: juradosActivos,
      jurados_con_asignaciones: juradosConAsignaciones.length,
      asignaciones_por_concurso: asignacionesPorConcurso,
      promedio_asignaciones_por_jurado: juradosConAsignaciones.length > 0 
        ? Math.round(totalAsignaciones / juradosConAsignaciones.length * 100) / 100 
        : 0
    };
  }

  /**
   * Validar cobertura de jurados para un concurso
   */
  async validarCoberturaJurados(concursoId: number) {
    const categorias = await prisma.categoria.findMany({
      where: { concurso_id: concursoId },
      include: {
        jurado_asignaciones: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true
              }
            }
          }
        }
      }
    });

    const cobertura = categorias.map(categoria => {
      const juradosActivos = categoria.jurado_asignaciones;

      return {
        categoria_id: categoria.id,
        categoria_nombre: categoria.nombre,
        jurados_asignados: juradosActivos.length,
        jurados_requeridos: 3, // Mínimo recomendado
        cobertura_completa: juradosActivos.length >= 3,
        jurados: juradosActivos.map((a: any) => ({
          id: a.usuario.id,
          nombre: a.usuario.nombre
        }))
      };
    });

    const categoriasSinCobertura = cobertura.filter(c => !c.cobertura_completa);
    const coberturaTotal = cobertura.length > 0 
      ? (cobertura.filter(c => c.cobertura_completa).length / cobertura.length) * 100 
      : 0;

    return {
      concurso_id: concursoId,
      cobertura_total: Math.round(coberturaTotal * 100) / 100,
      categorias_con_cobertura: cobertura.filter(c => c.cobertura_completa).length,
      categorias_sin_cobertura: categoriasSinCobertura.length,
      detalles_por_categoria: cobertura,
      categorias_problematicas: categoriasSinCobertura
    };
  }
}

export const juradoAsignacionService = new JuradoAsignacionService();