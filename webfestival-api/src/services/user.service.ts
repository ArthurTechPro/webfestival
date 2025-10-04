import { PrismaClient } from '@prisma/client';
import { 
  User, 
  UserProfile, 
  JuradoEspecializacion, 
  Seguimiento, 
  JuradoAsignacion,
  PaginatedResponse,
  ApiError 
} from '@/types';
import { 
  UpdateProfileRequest, 
  JuradoEspecializacionRequest, 
  UpdateEspecializacionRequest,
  UserFiltersRequest 
} from '@/schemas/user.schemas';

const prisma = new PrismaClient();

export class UserService {
  /**
   * Obtener usuario por ID
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      const user = await prisma.usuario.findUnique({
        where: { id }
      });

      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        nombre: user.nombre || '',
        role: user.role as User['role'],
        picture_url: user.picture_url || undefined,
        bio: user.bio || undefined,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
    } catch (error) {
      console.error('Error al obtener usuario por ID:', error);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Obtener usuario por email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await prisma.usuario.findUnique({
        where: { email }
      });

      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        nombre: user.nombre || '',
        role: user.role as User['role'],
        picture_url: user.picture_url || undefined,
        bio: user.bio || undefined,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
    } catch (error) {
      console.error('Error al obtener usuario por email:', error);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Obtener perfil público de usuario con estadísticas
   */
  async getUserProfile(userId: string, currentUserId?: string): Promise<UserProfile | null> {
    try {
      const user = await prisma.usuario.findUnique({
        where: { id: userId },
        include: {
          _count: {
            select: {
              seguimientos_seguidor: true,
              seguimientos_seguido: true,
              medios: true
            }
          },
          jurado_especializaciones: true
        }
      });

      if (!user) return null;

      // Verificar si el usuario actual sigue a este usuario
      let isFollowing = false;
      if (currentUserId && currentUserId !== userId) {
        const seguimiento = await prisma.seguimiento.findUnique({
          where: {
            seguidor_id_seguido_id: {
              seguidor_id: currentUserId,
              seguido_id: userId
            }
          }
        });
        isFollowing = !!seguimiento;
      }

      return {
        id: user.id,
        email: user.email,
        nombre: user.nombre || '',
        role: user.role as User['role'],
        picture_url: user.picture_url || undefined,
        bio: user.bio || undefined,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        seguimientos_count: user._count.seguimientos_seguidor,
        seguidores_count: user._count.seguimientos_seguido,
        medios_count: user._count.medios,
        especializaciones: user.jurado_especializaciones.map((esp: any) => ({
          id: esp.id,
          usuario_id: esp.usuario_id,
          especializacion: esp.especializacion as JuradoEspecializacion['especializacion'],
          experiencia_años: esp.experiencia_anios || undefined,
          certificaciones: esp.certificaciones || undefined,
          portfolio_url: esp.portfolio_url || undefined
        })),
        is_following: isFollowing
      };
    } catch (error) {
      console.error('Error al obtener perfil de usuario:', error);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateProfile(userId: string, profileData: UpdateProfileRequest): Promise<User> {
    try {
      const updatedUser = await prisma.usuario.update({
        where: { id: userId },
        data: {
          ...(profileData.nombre && { nombre: profileData.nombre }),
          ...(profileData.bio !== undefined && { bio: profileData.bio }),
          ...(profileData.picture_url !== undefined && { picture_url: profileData.picture_url }),
          updated_at: new Date()
        }
      });

      return {
        id: updatedUser.id,
        email: updatedUser.email,
        nombre: updatedUser.nombre || '',
        role: updatedUser.role as User['role'],
        picture_url: updatedUser.picture_url || undefined,
        bio: updatedUser.bio || undefined,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at
      };
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Seguir a un usuario
   */
  async followUser(seguidorId: string, seguidoId: string): Promise<Seguimiento> {
    try {
      // Verificar que no se esté siguiendo a sí mismo
      if (seguidorId === seguidoId) {
        const error = new Error('No puedes seguirte a ti mismo') as ApiError;
        error.status = 400;
        throw error;
      }

      // Verificar que el usuario a seguir existe
      const usuarioASeguir = await prisma.usuario.findUnique({
        where: { id: seguidoId }
      });

      if (!usuarioASeguir) {
        const error = new Error('Usuario no encontrado') as ApiError;
        error.status = 404;
        throw error;
      }

      // Verificar si ya lo sigue
      const seguimientoExistente = await prisma.seguimiento.findUnique({
        where: {
          seguidor_id_seguido_id: {
            seguidor_id: seguidorId,
            seguido_id: seguidoId
          }
        }
      });

      if (seguimientoExistente) {
        const error = new Error('Ya sigues a este usuario') as ApiError;
        error.status = 400;
        throw error;
      }

      const seguimiento = await prisma.seguimiento.create({
        data: {
          seguidor_id: seguidorId,
          seguido_id: seguidoId
        }
      });

      return {
        id: seguimiento.id,
        seguidor_id: seguimiento.seguidor_id,
        seguido_id: seguimiento.seguido_id,
        fecha_seguimiento: seguimiento.fecha_seguimiento
      };
    } catch (error) {
      if (error instanceof Error && 'status' in error) {
        throw error;
      }
      console.error('Error al seguir usuario:', error);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Dejar de seguir a un usuario
   */
  async unfollowUser(seguidorId: string, seguidoId: string): Promise<void> {
    try {
      const seguimiento = await prisma.seguimiento.findUnique({
        where: {
          seguidor_id_seguido_id: {
            seguidor_id: seguidorId,
            seguido_id: seguidoId
          }
        }
      });

      if (!seguimiento) {
        const error = new Error('No sigues a este usuario') as ApiError;
        error.status = 400;
        throw error;
      }

      await prisma.seguimiento.delete({
        where: {
          seguidor_id_seguido_id: {
            seguidor_id: seguidorId,
            seguido_id: seguidoId
          }
        }
      });
    } catch (error) {
      if (error instanceof Error && 'status' in error) {
        throw error;
      }
      console.error('Error al dejar de seguir usuario:', error);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Obtener usuarios seguidos por un usuario
   */
  async getFollowing(userId: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<UserProfile>> {
    try {
      const offset = (page - 1) * limit;

      const [seguimientos, total] = await Promise.all([
        prisma.seguimiento.findMany({
          where: { seguidor_id: userId },
          include: {
            seguido: {
              include: {
                _count: {
                  select: {
                    seguimientos_seguidor: true,
                    seguimientos_seguido: true,
                    medios: true
                  }
                }
              }
            }
          },
          skip: offset,
          take: limit,
          orderBy: { fecha_seguimiento: 'desc' }
        }),
        prisma.seguimiento.count({
          where: { seguidor_id: userId }
        })
      ]);

      const users = seguimientos.map((seg: any) => ({
        id: seg.seguido.id,
        email: seg.seguido.email,
        nombre: seg.seguido.nombre || '',
        role: seg.seguido.role as User['role'],
        picture_url: seg.seguido.picture_url || undefined,
        bio: seg.seguido.bio || undefined,
        createdAt: seg.seguido.created_at,
        updatedAt: seg.seguido.updated_at,
        seguimientos_count: seg.seguido._count.seguimientos_seguidor,
        seguidores_count: seg.seguido._count.seguimientos_seguido,
        medios_count: seg.seguido._count.medios,
        is_following: true
      }));

      return {
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error al obtener usuarios seguidos:', error);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Obtener seguidores de un usuario
   */
  async getFollowers(userId: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<UserProfile>> {
    try {
      const offset = (page - 1) * limit;

      const [seguimientos, total] = await Promise.all([
        prisma.seguimiento.findMany({
          where: { seguido_id: userId },
          include: {
            seguidor: {
              include: {
                _count: {
                  select: {
                    seguimientos_seguidor: true,
                    seguimientos_seguido: true,
                    medios: true
                  }
                }
              }
            }
          },
          skip: offset,
          take: limit,
          orderBy: { fecha_seguimiento: 'desc' }
        }),
        prisma.seguimiento.count({
          where: { seguido_id: userId }
        })
      ]);

      const users = seguimientos.map((seg: any) => ({
        id: seg.seguidor.id,
        email: seg.seguidor.email,
        nombre: seg.seguidor.nombre || '',
        role: seg.seguidor.role as User['role'],
        picture_url: seg.seguidor.picture_url || undefined,
        bio: seg.seguidor.bio || undefined,
        createdAt: seg.seguidor.created_at,
        updatedAt: seg.seguidor.updated_at,
        seguimientos_count: seg.seguidor._count.seguimientos_seguidor,
        seguidores_count: seg.seguidor._count.seguimientos_seguido,
        medios_count: seg.seguidor._count.medios,
        is_following: false // Los seguidores no necesariamente son seguidos de vuelta
      }));

      return {
        data: users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error al obtener seguidores:', error);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Buscar usuarios con filtros
   */
  async searchUsers(filters: UserFiltersRequest, currentUserId?: string): Promise<PaginatedResponse<UserProfile>> {
    try {
      const offset = (filters.page - 1) * filters.limit;

      // Construir condiciones de búsqueda
      const whereConditions: any = {};

      if (filters.role) {
        whereConditions.role = filters.role;
      }

      if (filters.search) {
        whereConditions.OR = [
          { nombre: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { bio: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      // Si se filtra por especialización, solo incluir jurados con esa especialización
      if (filters.especialización) {
        whereConditions.jurado_especializaciones = {
          some: {
            especializacion: filters.especialización
          }
        };
      }

      const [users, total] = await Promise.all([
        prisma.usuario.findMany({
          where: whereConditions,
          include: {
            _count: {
              select: {
                seguimientos_seguidor: true,
                seguimientos_seguido: true,
                medios: true
              }
            },
            jurado_especializaciones: true
          },
          skip: offset,
          take: filters.limit,
          orderBy: { created_at: 'desc' }
        }),
        prisma.usuario.count({
          where: whereConditions
        })
      ]);

      // Verificar qué usuarios sigue el usuario actual
      let followingIds: string[] = [];
      if (currentUserId) {
        const following = await prisma.seguimiento.findMany({
          where: { seguidor_id: currentUserId },
          select: { seguido_id: true }
        });
        followingIds = following.map((f: any) => f.seguido_id);
      }

      const userProfiles = users.map((user: any) => ({
        id: user.id,
        email: user.email,
        nombre: user.nombre || '',
        role: user.role as User['role'],
        picture_url: user.picture_url || undefined,
        bio: user.bio || undefined,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        seguimientos_count: user._count.seguimientos_seguidor,
        seguidores_count: user._count.seguimientos_seguido,
        medios_count: user._count.medios,
        especializaciones: user.jurado_especializaciones.map((esp: any) => ({
          id: esp.id,
          usuario_id: esp.usuario_id,
          especializacion: esp.especializacion as JuradoEspecializacion['especializacion'],
          experiencia_años: esp.experiencia_anios || undefined,
          certificaciones: esp.certificaciones || undefined,
          portfolio_url: esp.portfolio_url || undefined
        })),
        is_following: currentUserId ? followingIds.includes(user.id) : false
      }));

      return {
        data: userProfiles,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit)
        }
      };
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Crear especialización de jurado
   */
  async createJuradoEspecializacion(userId: string, especializacionData: JuradoEspecializacionRequest): Promise<JuradoEspecializacion[]> {
    try {
      // Verificar que el usuario existe y es jurado
      const user = await prisma.usuario.findUnique({
        where: { id: userId }
      });

      if (!user) {
        const error = new Error('Usuario no encontrado') as ApiError;
        error.status = 404;
        throw error;
      }

      if (user.role !== 'JURADO') {
        const error = new Error('Solo los jurados pueden tener especializaciones') as ApiError;
        error.status = 403;
        throw error;
      }

      // Eliminar especializaciones existentes
      await prisma.juradoEspecializacion.deleteMany({
        where: { usuario_id: userId }
      });

      // Crear nuevas especializaciones
      const especializaciones = await Promise.all(
        especializacionData.especializaciones.map(esp =>
          prisma.juradoEspecializacion.create({
            data: {
              usuario_id: userId,
              especializacion: esp,
              experiencia_anios: especializacionData.experiencia_años || 0,
              certificaciones: especializacionData.certificaciones || [],
              portfolio_url: especializacionData.portfolio_url || null
            }
          })
        )
      );

      return especializaciones.map((esp: any) => ({
        id: esp.id,
        usuario_id: esp.usuario_id,
        especializacion: esp.especializacion as JuradoEspecializacion['especializacion'],
        experiencia_años: esp.experiencia_anios || undefined,
        certificaciones: esp.certificaciones || undefined,
        portfolio_url: esp.portfolio_url || undefined
      }));
    } catch (error) {
      if (error instanceof Error && 'status' in error) {
        throw error;
      }
      console.error('Error al crear especialización de jurado:', error);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Actualizar especialización de jurado
   */
  async updateJuradoEspecializacion(userId: string, especializacionData: UpdateEspecializacionRequest): Promise<JuradoEspecializacion[]> {
    try {
      // Verificar que el usuario existe y es jurado
      const user = await prisma.usuario.findUnique({
        where: { id: userId }
      });

      if (!user) {
        const error = new Error('Usuario no encontrado') as ApiError;
        error.status = 404;
        throw error;
      }

      if (user.role !== 'JURADO') {
        const error = new Error('Solo los jurados pueden tener especializaciones') as ApiError;
        error.status = 403;
        throw error;
      }

      // Si se proporcionan nuevas especializaciones, reemplazar todas
      if (especializacionData.especializaciones) {
        await prisma.juradoEspecializacion.deleteMany({
          where: { usuario_id: userId }
        });

        const especializaciones = await Promise.all(
          especializacionData.especializaciones.map(esp =>
            prisma.juradoEspecializacion.create({
              data: {
                usuario_id: userId,
                especializacion: esp,
                experiencia_anios: especializacionData.experiencia_años || 0,
                certificaciones: especializacionData.certificaciones || [],
                portfolio_url: especializacionData.portfolio_url || null
              }
            })
          )
        );

        return especializaciones.map((esp: any) => ({
          id: esp.id,
          usuario_id: esp.usuario_id,
          especializacion: esp.especializacion as JuradoEspecializacion['especializacion'],
          experiencia_años: esp.experiencia_anios || undefined,
          certificaciones: esp.certificaciones || undefined,
          portfolio_url: esp.portfolio_url || undefined
        }));
      } else {
        // Solo actualizar campos específicos
        const updateData: any = {};
        if (especializacionData.experiencia_años !== undefined) {
          updateData.experiencia_anios = especializacionData.experiencia_años;
        }
        if (especializacionData.certificaciones !== undefined) {
          updateData.certificaciones = especializacionData.certificaciones;
        }
        if (especializacionData.portfolio_url !== undefined) {
          updateData.portfolio_url = especializacionData.portfolio_url;
        }

        await prisma.juradoEspecializacion.updateMany({
          where: { usuario_id: userId },
          data: updateData
        });

        const especializaciones = await prisma.juradoEspecializacion.findMany({
          where: { usuario_id: userId }
        });

        return especializaciones.map((esp: any) => ({
          id: esp.id,
          usuario_id: esp.usuario_id,
          especializacion: esp.especializacion as JuradoEspecializacion['especializacion'],
          experiencia_años: esp.experiencia_anios || undefined,
          certificaciones: esp.certificaciones || undefined,
          portfolio_url: esp.portfolio_url || undefined
        }));
      }
    } catch (error) {
      if (error instanceof Error && 'status' in error) {
        throw error;
      }
      console.error('Error al actualizar especialización de jurado:', error);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Obtener jurados especializados por tipo de medio
   */
  async getJuradosEspecializados(tipoMedio: 'fotografia' | 'video' | 'audio' | 'corto_cine'): Promise<UserProfile[]> {
    try {
      const jurados = await prisma.usuario.findMany({
        where: {
          role: 'JURADO',
          jurado_especializaciones: {
            some: {
              especializacion: tipoMedio
            }
          }
        },
        include: {
          _count: {
            select: {
              seguimientos_seguidor: true,
              seguimientos_seguido: true,
              medios: true
            }
          },
          jurado_especializaciones: {
            where: {
              especializacion: tipoMedio
            }
          }
        }
      });

      return jurados.map((jurado: any) => ({
        id: jurado.id,
        email: jurado.email,
        nombre: jurado.nombre || '',
        role: jurado.role as User['role'],
        picture_url: jurado.picture_url || undefined,
        bio: jurado.bio || undefined,
        createdAt: jurado.created_at,
        updatedAt: jurado.updated_at,
        seguimientos_count: jurado._count.seguimientos_seguidor,
        seguidores_count: jurado._count.seguimientos_seguido,
        medios_count: jurado._count.medios,
        especializaciones: jurado.jurado_especializaciones.map((esp: any) => ({
          id: esp.id,
          usuario_id: esp.usuario_id,
          especializacion: esp.especializacion as JuradoEspecializacion['especializacion'],
          experiencia_años: esp.experiencia_anios || undefined,
          certificaciones: esp.certificaciones || undefined,
          portfolio_url: esp.portfolio_url || undefined
        }))
      }));
    } catch (error) {
      console.error('Error al obtener jurados especializados:', error);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Asignar jurado a categoría
   */
  async asignarJuradoACategoria(juradoId: string, categoriaId: number): Promise<JuradoAsignacion> {
    try {
      // Verificar que el usuario es jurado
      const jurado = await prisma.usuario.findUnique({
        where: { id: juradoId }
      });

      if (!jurado) {
        const error = new Error('Jurado no encontrado') as ApiError;
        error.status = 404;
        throw error;
      }

      if (jurado.role !== 'JURADO') {
        const error = new Error('El usuario no es un jurado') as ApiError;
        error.status = 400;
        throw error;
      }

      // Verificar que la categoría existe
      const categoria = await prisma.categoria.findUnique({
        where: { id: categoriaId }
      });

      if (!categoria) {
        const error = new Error('Categoría no encontrada') as ApiError;
        error.status = 404;
        throw error;
      }

      // Verificar si ya está asignado
      const asignacionExistente = await prisma.juradoAsignacion.findUnique({
        where: {
          usuario_id_categoria_id: {
            usuario_id: juradoId,
            categoria_id: categoriaId
          }
        }
      });

      if (asignacionExistente) {
        const error = new Error('El jurado ya está asignado a esta categoría') as ApiError;
        error.status = 400;
        throw error;
      }

      const asignacion = await prisma.juradoAsignacion.create({
        data: {
          usuario_id: juradoId,
          categoria_id: categoriaId
        }
      });

      return {
        id: asignacion.id,
        usuario_id: asignacion.usuario_id,
        categoria_id: asignacion.categoria_id
      };
    } catch (error) {
      if (error instanceof Error && 'status' in error) {
        throw error;
      }
      console.error('Error al asignar jurado a categoría:', error);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Remover asignación de jurado
   */
  async removerAsignacionJurado(juradoId: string, categoriaId: number): Promise<void> {
    try {
      const asignacion = await prisma.juradoAsignacion.findUnique({
        where: {
          usuario_id_categoria_id: {
            usuario_id: juradoId,
            categoria_id: categoriaId
          }
        }
      });

      if (!asignacion) {
        const error = new Error('Asignación no encontrada') as ApiError;
        error.status = 404;
        throw error;
      }

      await prisma.juradoAsignacion.delete({
        where: {
          usuario_id_categoria_id: {
            usuario_id: juradoId,
            categoria_id: categoriaId
          }
        }
      });
    } catch (error) {
      if (error instanceof Error && 'status' in error) {
        throw error;
      }
      console.error('Error al remover asignación de jurado:', error);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Obtener asignaciones de un jurado
   */
  async getAsignacionesJurado(juradoId: string): Promise<JuradoAsignacion[]> {
    try {
      const asignaciones = await prisma.juradoAsignacion.findMany({
        where: { usuario_id: juradoId }
      });

      return asignaciones.map((asignacion: any) => ({
        id: asignacion.id,
        usuario_id: asignacion.usuario_id,
        categoria_id: asignacion.categoria_id
      }));
    } catch (error) {
      console.error('Error al obtener asignaciones de jurado:', error);
      throw new Error('Error interno del servidor');
    }
  }
}

export const userService = new UserService();