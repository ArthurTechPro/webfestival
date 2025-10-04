import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { concursoService } from '../src/services/concurso.service';
import { CreateConcursoDto, UpdateConcursoDto } from '../src/schemas/concurso.schemas';

const prisma = new PrismaClient();

describe('ConcursoService', () => {
  let testUserId: string;
  let testConcursoId: number;

  beforeEach(async () => {
    // Crear usuario de prueba
    const testUser = await prisma.usuario.create({
      data: {
        email: 'test-concurso@example.com',
        nombre: 'Test User Concurso',
        password: 'hashedpassword',
        role: 'PARTICIPANTE'
      }
    });
    testUserId = testUser.id;
  });

  afterEach(async () => {
    // Limpiar datos de prueba
    if (testConcursoId) {
      await prisma.inscripcion.deleteMany({
        where: { concurso_id: testConcursoId }
      });
      await prisma.concurso.delete({
        where: { id: testConcursoId }
      }).catch(() => {}); // Ignorar si ya fue eliminado
    }

    await prisma.usuario.delete({
      where: { id: testUserId }
    }).catch(() => {}); // Ignorar si ya fue eliminado
  });

  describe('createConcurso', () => {
    it('debería crear un concurso exitosamente', async () => {
      const concursoData: CreateConcursoDto = {
        titulo: 'Concurso de Fotografía Test',
        descripcion: 'Descripción del concurso de prueba',
        reglas: 'Reglas del concurso',
        fecha_inicio: new Date(Date.now() + 86400000).toISOString(), // Mañana
        fecha_final: new Date(Date.now() + 7 * 86400000).toISOString(), // En una semana
        max_envios: 3,
        tamano_max_mb: 10
      };

      const concurso = await concursoService.createConcurso(concursoData);
      testConcursoId = concurso.id;

      expect(concurso).toBeDefined();
      expect(concurso.titulo).toBe(concursoData.titulo);
      expect(concurso.descripcion).toBe(concursoData.descripcion);
      expect(concurso.status).toBe('PROXIMAMENTE');
      expect(concurso.max_envios).toBe(3);
      expect(concurso.tamano_max_mb).toBe(10);
    });

    it('debería fallar si la fecha final es anterior a la fecha de inicio', async () => {
      const concursoData: CreateConcursoDto = {
        titulo: 'Concurso Inválido',
        descripcion: 'Descripción del concurso inválido',
        fecha_inicio: new Date(Date.now() + 7 * 86400000).toISOString(), // En una semana
        fecha_final: new Date(Date.now() + 86400000).toISOString(), // Mañana
        max_envios: 3,
        tamano_max_mb: 10
      };

      await expect(concursoService.createConcurso(concursoData))
        .rejects.toThrow();
    });
  });

  describe('getConcursosActivos', () => {
    it('debería obtener solo concursos activos', async () => {
      // Crear concurso activo
      const concursoActivo = await prisma.concurso.create({
        data: {
          titulo: 'Concurso Activo',
          descripcion: 'Concurso en estado activo',
          fecha_inicio: new Date(Date.now() - 86400000), // Ayer
          fecha_final: new Date(Date.now() + 7 * 86400000), // En una semana
          status: 'ACTIVO'
        }
      });

      // Crear concurso finalizado
      const concursoFinalizado = await prisma.concurso.create({
        data: {
          titulo: 'Concurso Finalizado',
          descripcion: 'Concurso finalizado',
          fecha_inicio: new Date(Date.now() - 14 * 86400000), // Hace dos semanas
          fecha_final: new Date(Date.now() - 7 * 86400000), // Hace una semana
          status: 'FINALIZADO'
        }
      });

      const concursosActivos = await concursoService.getConcursosActivos();

      expect(concursosActivos).toBeDefined();
      expect(concursosActivos.length).toBeGreaterThan(0);
      expect(concursosActivos.some(c => c.id === concursoActivo.id)).toBe(true);
      expect(concursosActivos.some(c => c.id === concursoFinalizado.id)).toBe(false);

      // Limpiar
      await prisma.concurso.deleteMany({
        where: {
          id: {
            in: [concursoActivo.id, concursoFinalizado.id]
          }
        }
      });
    });
  });

  describe('inscribirUsuario', () => {
    beforeEach(async () => {
      // Crear concurso activo para inscripciones
      const concurso = await prisma.concurso.create({
        data: {
          titulo: 'Concurso para Inscripción',
          descripcion: 'Concurso para probar inscripciones',
          fecha_inicio: new Date(Date.now() - 86400000), // Ayer
          fecha_final: new Date(Date.now() + 7 * 86400000), // En una semana
          status: 'ACTIVO'
        }
      });
      testConcursoId = concurso.id;
    });

    it('debería inscribir un usuario exitosamente', async () => {
      const inscripcion = await concursoService.inscribirUsuario(testUserId, testConcursoId);

      expect(inscripcion).toBeDefined();
      expect(inscripcion.usuario_id).toBe(testUserId);
      expect(inscripcion.concurso_id).toBe(testConcursoId);
      expect(inscripcion.concurso.titulo).toBe('Concurso para Inscripción');
    });

    it('debería fallar si el usuario ya está inscrito', async () => {
      // Primera inscripción
      await concursoService.inscribirUsuario(testUserId, testConcursoId);

      // Segunda inscripción (debería fallar)
      await expect(concursoService.inscribirUsuario(testUserId, testConcursoId))
        .rejects.toThrow('Ya estás inscrito en este concurso');
    });

    it('debería fallar si el concurso no está activo', async () => {
      // Cambiar estado del concurso
      await prisma.concurso.update({
        where: { id: testConcursoId },
        data: { status: 'FINALIZADO' }
      });

      await expect(concursoService.inscribirUsuario(testUserId, testConcursoId))
        .rejects.toThrow('El concurso no está activo para inscripciones');
    });
  });

  describe('updateConcurso', () => {
    beforeEach(async () => {
      const concurso = await prisma.concurso.create({
        data: {
          titulo: 'Concurso Original',
          descripcion: 'Descripción original',
          fecha_inicio: new Date(Date.now() + 86400000), // Mañana
          fecha_final: new Date(Date.now() + 7 * 86400000), // En una semana
          status: 'PROXIMAMENTE'
        }
      });
      testConcursoId = concurso.id;
    });

    it('debería actualizar un concurso exitosamente', async () => {
      const updateData: UpdateConcursoDto = {
        titulo: 'Concurso Actualizado',
        descripcion: 'Descripción actualizada',
        status: 'ACTIVO'
      };

      const concursoActualizado = await concursoService.updateConcurso(testConcursoId, updateData);

      expect(concursoActualizado.titulo).toBe('Concurso Actualizado');
      expect(concursoActualizado.descripcion).toBe('Descripción actualizada');
      expect(concursoActualizado.status).toBe('ACTIVO');
    });
  });

  describe('verificarInscripcion', () => {
    beforeEach(async () => {
      const concurso = await prisma.concurso.create({
        data: {
          titulo: 'Concurso Verificación',
          descripcion: 'Concurso para verificar inscripción',
          fecha_inicio: new Date(Date.now() - 86400000), // Ayer
          fecha_final: new Date(Date.now() + 7 * 86400000), // En una semana
          status: 'ACTIVO'
        }
      });
      testConcursoId = concurso.id;
    });

    it('debería retornar true si el usuario está inscrito', async () => {
      await concursoService.inscribirUsuario(testUserId, testConcursoId);
      
      const estaInscrito = await concursoService.verificarInscripcion(testUserId, testConcursoId);
      expect(estaInscrito).toBe(true);
    });

    it('debería retornar false si el usuario no está inscrito', async () => {
      const estaInscrito = await concursoService.verificarInscripcion(testUserId, testConcursoId);
      expect(estaInscrito).toBe(false);
    });
  });
});