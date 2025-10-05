import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'WebFestival API',
    version: '1.0.0',
    description: 'API completa para la plataforma WebFestival - Sistema de concursos multimedia que conecta artistas creativos, jurados profesionales y organizadores',
    contact: {
      name: 'WebFestival Team',
      email: 'api@webfestival.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3001/api/v1',
      description: 'Servidor de desarrollo'
    },
    {
      url: 'https://api.webfestival.com/api/v1',
      description: 'Servidor de producción'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT para autenticación. Formato: Bearer <token>'
      }
    },
    schemas: {
      // Esquemas de respuesta comunes
      ApiResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indica si la operación fue exitosa'
          },
          message: {
            type: 'string',
            description: 'Mensaje descriptivo de la respuesta'
          },
          data: {
            type: 'object',
            description: 'Datos de respuesta (opcional)'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            description: 'Mensaje de error'
          },
          error: {
            type: 'string',
            description: 'Código o tipo de error'
          },
          details: {
            type: 'object',
            description: 'Detalles adicionales del error (opcional)'
          }
        }
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              type: 'object'
            }
          },
          pagination: {
            type: 'object',
            properties: {
              page: {
                type: 'integer',
                description: 'Página actual'
              },
              limit: {
                type: 'integer',
                description: 'Elementos por página'
              },
              total: {
                type: 'integer',
                description: 'Total de elementos'
              },
              totalPages: {
                type: 'integer',
                description: 'Total de páginas'
              }
            }
          }
        }
      },
      // Esquemas de entidades principales
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'ID único del usuario'
          },
          nombre: {
            type: 'string',
            description: 'Nombre completo del usuario'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email del usuario'
          },
          role: {
            type: 'string',
            enum: ['PARTICIPANTE', 'JURADO', 'ADMIN', 'CONTENT_ADMIN'],
            description: 'Rol del usuario en la plataforma'
          },
          picture_url: {
            type: 'string',
            format: 'uri',
            description: 'URL de la foto de perfil (opcional)'
          },
          bio: {
            type: 'string',
            description: 'Biografía del usuario (opcional)'
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de creación de la cuenta'
          },
          updated_at: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de última actualización'
          }
        }
      },
      Concurso: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'ID único del concurso'
          },
          titulo: {
            type: 'string',
            description: 'Título del concurso'
          },
          descripcion: {
            type: 'string',
            description: 'Descripción detallada del concurso'
          },
          reglas: {
            type: 'string',
            description: 'Reglas y términos del concurso'
          },
          fecha_inicio: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de inicio del concurso'
          },
          fecha_final: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de finalización del concurso'
          },
          status: {
            type: 'string',
            enum: ['Próximamente', 'Activo', 'Calificación', 'Finalizado'],
            description: 'Estado actual del concurso'
          },
          imagen_url: {
            type: 'string',
            format: 'uri',
            description: 'URL de la imagen del concurso (opcional)'
          },
          max_envios: {
            type: 'integer',
            default: 3,
            description: 'Máximo número de envíos por participante'
          },
          tamaño_max_mb: {
            type: 'integer',
            default: 10,
            description: 'Tamaño máximo de archivo en MB'
          },
          created_at: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de creación del concurso'
          }
        }
      },
      Categoria: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'ID único de la categoría'
          },
          nombre: {
            type: 'string',
            description: 'Nombre de la categoría'
          },
          concurso_id: {
            type: 'integer',
            description: 'ID del concurso al que pertenece'
          }
        }
      },
      Medio: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'ID único del medio'
          },
          titulo: {
            type: 'string',
            description: 'Título del medio'
          },
          tipo_medio: {
            type: 'string',
            enum: ['fotografia', 'video', 'audio', 'corto_cine'],
            description: 'Tipo de medio multimedia'
          },
          usuario_id: {
            type: 'string',
            description: 'ID del usuario que subió el medio'
          },
          concurso_id: {
            type: 'integer',
            description: 'ID del concurso'
          },
          categoria_id: {
            type: 'integer',
            description: 'ID de la categoría'
          },
          medio_url: {
            type: 'string',
            format: 'uri',
            description: 'URL del archivo multimedia'
          },
          thumbnail_url: {
            type: 'string',
            format: 'uri',
            description: 'URL del thumbnail (opcional)'
          },
          preview_url: {
            type: 'string',
            format: 'uri',
            description: 'URL del preview (opcional)'
          },
          duracion: {
            type: 'integer',
            description: 'Duración en segundos (para videos y audios)'
          },
          formato: {
            type: 'string',
            description: 'Formato del archivo (JPEG, PNG, MP4, etc.)'
          },
          tamaño_archivo: {
            type: 'integer',
            description: 'Tamaño del archivo en bytes'
          },
          metadatos: {
            type: 'object',
            description: 'Metadatos extraídos del archivo (EXIF, etc.)'
          },
          fecha_subida: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de subida del medio'
          }
        }
      },
      Criterio: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'ID único del criterio'
          },
          nombre: {
            type: 'string',
            description: 'Nombre del criterio de evaluación'
          },
          descripcion: {
            type: 'string',
            description: 'Descripción detallada del criterio (opcional)'
          },
          tipo_medio: {
            type: 'string',
            enum: ['fotografia', 'video', 'audio', 'corto_cine'],
            description: 'Tipo de medio al que aplica (opcional para criterios universales)'
          },
          peso: {
            type: 'number',
            format: 'float',
            default: 1.0,
            description: 'Peso del criterio en la calificación final'
          },
          activo: {
            type: 'boolean',
            default: true,
            description: 'Indica si el criterio está activo'
          },
          orden: {
            type: 'integer',
            default: 0,
            description: 'Orden de presentación del criterio'
          }
        }
      },
      Calificacion: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'ID único de la calificación'
          },
          medio_id: {
            type: 'integer',
            description: 'ID del medio calificado'
          },
          jurado_id: {
            type: 'string',
            description: 'ID del jurado que calificó'
          },
          comentarios: {
            type: 'string',
            description: 'Comentarios del jurado (opcional)'
          },
          fecha_calificacion: {
            type: 'string',
            format: 'date-time',
            description: 'Fecha de la calificación'
          },
          detalles: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/CalificacionDetalle'
            },
            description: 'Detalles de calificación por criterio'
          }
        }
      },
      CalificacionDetalle: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: 'ID único del detalle'
          },
          calificacion_id: {
            type: 'integer',
            description: 'ID de la calificación padre'
          },
          criterio_id: {
            type: 'integer',
            description: 'ID del criterio evaluado'
          },
          puntuacion: {
            type: 'integer',
            minimum: 1,
            maximum: 10,
            description: 'Puntuación otorgada (1-10)'
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  tags: [
    {
      name: 'Autenticación',
      description: 'Endpoints para autenticación y gestión de sesiones'
    },
    {
      name: 'Usuarios',
      description: 'Gestión de usuarios y perfiles'
    },
    {
      name: 'Concursos',
      description: 'Gestión de concursos y categorías'
    },
    {
      name: 'Medios',
      description: 'Gestión de archivos multimedia'
    },
    {
      name: 'Criterios',
      description: 'Gestión de criterios de evaluación'
    },
    {
      name: 'Calificaciones',
      description: 'Sistema de calificaciones y evaluaciones'
    },
    {
      name: 'Jurados',
      description: 'Gestión de jurados y asignaciones'
    },
    {
      name: 'CMS',
      description: 'Sistema de gestión de contenido'
    },
    {
      name: 'Interacciones',
      description: 'Sistema de likes, comentarios y reportes'
    },
    {
      name: 'Newsletter',
      description: 'Gestión de newsletter y contenido educativo'
    },
    {
      name: 'Suscripciones',
      description: 'Sistema de suscripciones y monetización'
    },
    {
      name: 'Facturación',
      description: 'Gestión de pagos y facturación'
    },
    {
      name: 'Notificaciones',
      description: 'Sistema de notificaciones automáticas'
    },
    {
      name: 'Redes Sociales',
      description: 'Integración con redes sociales'
    },
    {
      name: 'Sistema',
      description: 'Endpoints de sistema y salud'
    }
  ]
};

const options = {
  definition: swaggerDefinition,
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/schemas/*.ts'
  ]
};

export const swaggerSpec = swaggerJsdoc(options);