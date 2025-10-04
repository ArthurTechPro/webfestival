import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import { concursoController } from '../controllers/concurso.controller';
import { concursoService } from '../services/concurso.service';
import { AuthenticatedRequest } from '../types';

// Mock del servicio
jest.mock('../services/concurso.service');
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

    it('debería manejar errores correctamente', async () => {
      const errorMessage = 'Error de base de datos';
      mockConcursoService.getConcursosActivos.mockRejectedValue(new Error(errorMessage));

      await concursoController.getConcursosActivos(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: errorMessage
      });
    });
  });

  describe('getConcursoById', () => {
    it('debería retornar un concurso por ID exitosamente', async () => {
      const mockConcurso = {
        id: 1,
        titulo: 'Concurso Test',
        descripcion: 'Descripción test',
        categorias: [],
        inscripciones: [],
        medios: [],
        _count: { inscripciones: 0, medios: 0 }
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

    it('debería retornar error 400 para ID inválido', async () => {
      mockRequest.params = { id: 'invalid' };

      await concursoController.getConcursoById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'ID de concurso inválido'
      });
    });

    it('debería retornar error 404 para concurso no encontrado', async () => {
      mockRequest.params = { id: '999' };
      mockConcursoService.getConcursoById.mockRejectedValue(new Error('Concurso no encontrado'));

      await concursoController.getConcursoById(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'Concurso no encontrado'
      });
    });
  });

  describe('inscribirseAConcurso', () => {
    beforeEach(() => {
      (mockRequest as AuthenticatedRequest).user = {
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

    it('debería retornar false si no está inscrito', async () => {
      mockRequest.params = { concursoId: '1' };
      mockConcursoService.verificarInscripcion.mockResolvedValue(false);

      await concursoController.verificarInscripcion(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: { inscrito: false }
      });
    });
  });
});