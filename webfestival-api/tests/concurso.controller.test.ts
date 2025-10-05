/// <reference types="jest" />

// IMPORTANTE: NO IMPORTAR FUNCIONES DE 'node:test' - USAR JEST GLOBALS
// Jest proporciona describe, it, expect, beforeEach, afterEach globalmente

import { Request, Response } from 'express';
import { concursoController } from '../src/controllers/concurso.controller';
import { concursoService } from '../src/services/concurso.service';
import { AuthenticatedRequest } from '../src/types';

// Mock del servicio
jest.mock('../src/services/concurso.service');
const mockConcursoService = concursoService as jest.Mocked<typeof concursoService>;

describe('ConcursoController', () => {
  let mockRequest: Partial<Request | AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnThis();
    
    mockResponse = {
      json: mockJson,
      status: mockStatus
    } as any;

    mockRequest = {
      body: {},
      params: {},
      query: {}
    };

    jest.clearAllMocks();
  });

  describe('getConcursosActivos', () => {
    it('debería retornar concursos activos exitosamente', async () => {
      const mockConcursos = [
        {
          id: 1,
          titulo: 'Concurso Activo',
          descripcion: 'Descripción',
          status: 'ACTIVO',
          categorias: [],
          _count: { inscripciones: 5, medios: 10 }
        }
      ];

      mockConcursoService.getConcursosActivos.mockResolvedValue(mockConcursos as any);

      await concursoController.getConcursosActivos(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockConcursoService.getConcursosActivos).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockConcursos
      });
    });

    it('debería manejar errores del servicio', async () => {
      mockConcursoService.getConcursosActivos.mockRejectedValue(new Error('Error de base de datos'));

      await concursoController.getConcursosActivos(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Error interno del servidor'
      });
    });
  });

  describe('createConcurso', () => {
    beforeEach(() => {
      (mockRequest as AuthenticatedRequest).user = {
        id: 'admin-user-id',
        userId: 'admin-user-id',
        email: 'admin@example.com',
        role: 'ADMIN'
      };
    });

    it('debería crear un concurso exitosamente', async () => {
      const concursoData = {
        titulo: 'Nuevo Concurso',
        descripcion: 'Descripción del concurso',
        fecha_inicio: '2024-01-01T00:00:00.000Z',
        fecha_final: '2024-01-31T23:59:59.000Z',
        max_envios: 3,
        tamano_max_mb: 10
      };

      const mockConcurso = {
        id: 1,
        ...concursoData,
        status: 'PROXIMAMENTE',
        categorias: [],
        _count: { inscripciones: 0, medios: 0 }
      };

      mockRequest.body = concursoData;
      mockConcursoService.createConcurso.mockResolvedValue(mockConcurso as any);

      await concursoController.createConcurso(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockConcursoService.createConcurso).toHaveBeenCalledWith(concursoData);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Concurso creado exitosamente',
        data: mockConcurso
      });
    });

    it('debería manejar errores de validación', async () => {
      mockRequest.body = {
        titulo: '', // Título vacío debería fallar
        descripcion: 'Descripción'
      };

      await concursoController.createConcurso(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          errors: expect.any(Array)
        })
      );
    });

    it('debería rechazar usuarios no autenticados', async () => {
      (mockRequest as AuthenticatedRequest).user = undefined;

      await concursoController.createConcurso(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Usuario no autenticado'
      });
    });
  });

  describe('inscribirseAConcurso', () => {
    beforeEach(() => {
      (mockRequest as AuthenticatedRequest).user = {
        id: 'user123',
        userId: 'user123',
        email: 'test@example.com',
        role: 'PARTICIPANTE'
      };
    });

    it('debería inscribir usuario exitosamente', async () => {
      const mockInscripcion = {
        id: 1,
        usuario_id: 'user123',
        concurso_id: 1,
        fecha_inscripcion: new Date(),
        concurso: { id: 1, titulo: 'Test Contest' },
        usuario: { id: 'user123', nombre: 'Test User', email: 'test@example.com' }
      };

      mockRequest.body = { concurso_id: 1 };
      mockConcursoService.inscribirUsuario.mockResolvedValue(mockInscripcion as any);

      await concursoController.inscribirseAConcurso(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockConcursoService.inscribirUsuario).toHaveBeenCalledWith('user123', 1);
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Inscripción realizada exitosamente',
        data: mockInscripcion
      });
    });

    it('debería manejar errores de validación', async () => {
      mockRequest.body = { concurso_id: 'invalid' };

      await concursoController.inscribirseAConcurso(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          errors: expect.any(Array)
        })
      );
    });
  });

  describe('verificarInscripcion', () => {
    beforeEach(() => {
      (mockRequest as AuthenticatedRequest).user = {
        id: 'user123',
        userId: 'user123',
        email: 'test@example.com',
        role: 'PARTICIPANTE'
      };
    });

    it('debería verificar inscripción exitosamente', async () => {
      mockRequest.params = { concursoId: '1' };
      mockConcursoService.verificarInscripcion.mockResolvedValue(true);

      await concursoController.verificarInscripcion(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockConcursoService.verificarInscripcion).toHaveBeenCalledWith('user123', 1);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: { inscrito: true }
      });
    });

    it('debería manejar parámetros inválidos', async () => {
      mockRequest.params = { concursoId: 'invalid' };

      await concursoController.verificarInscripcion(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'ID de concurso inválido'
      });
    });
  });

  describe('updateConcurso', () => {
    beforeEach(() => {
      (mockRequest as AuthenticatedRequest).user = {
        id: 'admin-user-id',
        userId: 'admin-user-id',
        email: 'admin@example.com',
        role: 'ADMIN'
      };
    });

    it('debería actualizar un concurso exitosamente', async () => {
      const updateData = {
        titulo: 'Concurso Actualizado',
        descripcion: 'Nueva descripción',
        status: 'ACTIVO'
      };

      const mockUpdatedConcurso = {
        id: 1,
        ...updateData,
        fecha_inicio: new Date(),
        fecha_final: new Date(),
        categorias: [],
        _count: { inscripciones: 0, medios: 0 }
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockConcursoService.updateConcurso.mockResolvedValue(mockUpdatedConcurso as any);

      await concursoController.updateConcurso(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockConcursoService.updateConcurso).toHaveBeenCalledWith(1, updateData);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Concurso actualizado exitosamente',
        data: mockUpdatedConcurso
      });
    });

    it('debería manejar concurso no encontrado', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { titulo: 'Nuevo título' };
      mockConcursoService.updateConcurso.mockRejectedValue(new Error('Concurso no encontrado'));

      await concursoController.updateConcurso(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'Error interno del servidor'
      });
    });
  });

  describe('getConcursoById', () => {
    it('debería obtener un concurso por ID exitosamente', async () => {
      const mockConcurso = {
        id: 1,
        titulo: 'Concurso Test',
        descripcion: 'Descripción test',
        status: 'ACTIVO',
        categorias: [],
        _count: { inscripciones: 5, medios: 10 }
      };

      mockRequest.params = { id: '1' };
      mockConcursoService.getConcursoById.mockResolvedValue(mockConcurso as any);

      await concursoController.getConcursoById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockConcursoService.getConcursoById).toHaveBeenCalledWith(1);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockConcurso
      });
    });

    it('debería manejar ID inválido', async () => {
      mockRequest.params = { id: 'invalid' };

      await concursoController.getConcursoById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: 'ID de concurso inválido'
      });
    });
  });
});