import { PrismaClient, TipoMedio, Criterio } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateCriterioDto {
  nombre: string;
  descripcion?: string;
  tipo_medio?: TipoMedio;
  peso?: number;
  orden?: number;
}

export interface UpdateCriterioDto {
  nombre?: string;
  descripcion?: string;
  tipo_medio?: TipoMedio;
  peso?: number;
  orden?: number;
  activo?: boolean;
}

export interface CriterioFilters {
  tipo_medio?: TipoMedio | null;
  activo?: boolean;
  incluir_universales?: boolean;
}

export class CriteriosService {
  /**
   * Obtiene todos los criterios con filtros opcionales
   */
  async getCriterios(filters: CriterioFilters = {}): Promise<Criterio[]> {
    const where: any = {};

    if (filters.activo !== undefined) {
      where.activo = filters.activo;
    }

    if (filters.tipo_medio !== undefined) {
      if (filters.incluir_universales) {
        // Incluir criterios específicos del tipo Y criterios universales (null)
        where.OR = [
          { tipo_medio: filters.tipo_medio },
          { tipo_medio: null }
        ];
      } else {
        where.tipo_medio = filters.tipo_medio;
      }
    }

    return await prisma.criterio.findMany({
      where,
      orderBy: [
        { tipo_medio: 'asc' },
        { orden: 'asc' },
        { nombre: 'asc' }
      ]
    });
  }

  /**
   * Obtiene criterios específicos para un tipo de medio (incluye universales)
   */
  async getCriteriosPorTipoMedio(tipoMedio: TipoMedio): Promise<Criterio[]> {
    return await this.getCriterios({
      tipo_medio: tipoMedio,
      activo: true,
      incluir_universales: true
    });
  }

  /**
   * Obtiene solo criterios universales
   */
  async getCriteriosUniversales(): Promise<Criterio[]> {
    return await prisma.criterio.findMany({
      where: {
        tipo_medio: null,
        activo: true
      },
      orderBy: { orden: 'asc' }
    });
  }

  /**
   * Obtiene un criterio por ID
   */
  async getCriterioById(id: number): Promise<Criterio | null> {
    return await prisma.criterio.findUnique({
      where: { id }
    });
  }

  /**
   * Crea un nuevo criterio
   */
  async createCriterio(data: CreateCriterioDto): Promise<Criterio> {
    // Verificar que el nombre no exista
    const existingCriterio = await prisma.criterio.findUnique({
      where: { nombre: data.nombre }
    });

    if (existingCriterio) {
      throw new Error(`Ya existe un criterio con el nombre: ${data.nombre}`);
    }

    // Si no se especifica orden, usar el siguiente disponible
    if (!data.orden) {
      const maxOrden = await prisma.criterio.aggregate({
        where: { tipo_medio: data.tipo_medio || null },
        _max: { orden: true }
      });
      data.orden = (maxOrden._max.orden || 0) + 1;
    }

    return await prisma.criterio.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        tipo_medio: data.tipo_medio || null,
        peso: data.peso || 1.0,
        orden: data.orden,
        activo: true
      }
    });
  }

  /**
   * Actualiza un criterio existente
   */
  async updateCriterio(id: number, data: UpdateCriterioDto): Promise<Criterio> {
    // Verificar que el criterio existe
    const existingCriterio = await this.getCriterioById(id);
    if (!existingCriterio) {
      throw new Error(`No se encontró el criterio con ID: ${id}`);
    }

    // Si se cambia el nombre, verificar que no exista otro con ese nombre
    if (data.nombre && data.nombre !== existingCriterio.nombre) {
      const duplicateCriterio = await prisma.criterio.findUnique({
        where: { nombre: data.nombre }
      });

      if (duplicateCriterio) {
        throw new Error(`Ya existe un criterio con el nombre: ${data.nombre}`);
      }
    }

    return await prisma.criterio.update({
      where: { id },
      data
    });
  }

  /**
   * Elimina un criterio (soft delete - lo marca como inactivo)
   */
  async deleteCriterio(id: number): Promise<Criterio> {
    return await this.updateCriterio(id, { activo: false });
  }

  /**
   * Elimina permanentemente un criterio
   */
  async deleteCriterioPermanente(id: number): Promise<void> {
    // Verificar que no esté siendo usado en calificaciones
    const calificacionesUsando = await prisma.calificacionDetalle.count({
      where: { criterio_id: id }
    });

    if (calificacionesUsando > 0) {
      throw new Error(`No se puede eliminar el criterio porque está siendo usado en ${calificacionesUsando} calificaciones`);
    }

    await prisma.criterio.delete({
      where: { id }
    });
  }

  /**
   * Reordena criterios de un tipo específico
   */
  async reordenarCriterios(_tipoMedio: TipoMedio | null, criteriosOrdenados: number[]): Promise<void> {
    // Actualizar el orden de cada criterio
    for (let i = 0; i < criteriosOrdenados.length; i++) {
      const criterioId = criteriosOrdenados[i];
      if (criterioId) {
        await prisma.criterio.update({
          where: { id: criterioId },
          data: { orden: i + 1 }
        });
      }
    }
  }

  /**
   * Obtiene estadísticas de uso de criterios
   */
  async getEstadisticasCriterios(): Promise<any> {
    const totalCriterios = await prisma.criterio.count();
    const criteriosActivos = await prisma.criterio.count({ where: { activo: true } });
    
    const criteriosPorTipo = await prisma.criterio.groupBy({
      by: ['tipo_medio'],
      _count: true,
      where: { activo: true }
    });

    const criteriosMasUsados = await prisma.calificacionDetalle.groupBy({
      by: ['criterio_id'],
      _count: true,
      orderBy: { _count: { criterio_id: 'desc' } },
      take: 10
    });

    // Obtener nombres de los criterios más usados
    const criteriosConNombres = await Promise.all(
      criteriosMasUsados.map(async (item) => {
        const criterio = await this.getCriterioById(item.criterio_id);
        return {
          criterio: criterio?.nombre || 'Desconocido',
          usos: item._count
        };
      })
    );

    return {
      total_criterios: totalCriterios,
      criterios_activos: criteriosActivos,
      criterios_por_tipo: criteriosPorTipo,
      criterios_mas_usados: criteriosConNombres
    };
  }

  /**
   * Valida que todos los criterios requeridos estén presentes para un tipo de medio
   */
  async validarCriteriosCompletos(tipoMedio: TipoMedio): Promise<boolean> {
    const criterios = await this.getCriteriosPorTipoMedio(tipoMedio);
    
    // Validar que existan al menos 3 criterios activos para el tipo de medio
    return criterios.length >= 3;
  }

  /**
   * Obtiene el peso total de criterios para un tipo de medio
   */
  async getPesoTotalCriterios(tipoMedio: TipoMedio): Promise<number> {
    const criterios = await this.getCriteriosPorTipoMedio(tipoMedio);
    return criterios.reduce((total, criterio) => total + Number(criterio.peso), 0);
  }
}

export const criteriosService = new CriteriosService();