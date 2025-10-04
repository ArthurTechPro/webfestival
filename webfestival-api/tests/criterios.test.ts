import { TipoMedio } from '@prisma/client';
import { criteriosService } from '../src/services/criterios.service';

describe('CriteriosService', () => {
  describe('getCriteriosPorTipoMedio', () => {
    test('debe obtener criterios para fotografía incluyendo universales', async () => {
      const criterios = await criteriosService.getCriteriosPorTipoMedio(TipoMedio.fotografia);
      
      expect(criterios).toBeDefined();
      expect(Array.isArray(criterios)).toBe(true);
      expect(criterios.length).toBeGreaterThan(0);
      
      // Verificar que incluye criterios específicos de fotografía
      const criteriosFotografia = criterios.filter(c => c.tipo_medio === TipoMedio.fotografia);
      expect(criteriosFotografia.length).toBeGreaterThan(0);
      
      // Verificar que incluye criterios universales
      const criteriosUniversales = criterios.filter(c => c.tipo_medio === null);
      expect(criteriosUniversales.length).toBeGreaterThan(0);
      
      // Verificar que todos los criterios están activos
      const criteriosActivos = criterios.filter(c => c.activo === true);
      expect(criteriosActivos.length).toBe(criterios.length);
    });

    test('debe obtener criterios para video incluyendo universales', async () => {
      const criterios = await criteriosService.getCriteriosPorTipoMedio(TipoMedio.video);
      
      expect(criterios).toBeDefined();
      expect(Array.isArray(criterios)).toBe(true);
      expect(criterios.length).toBeGreaterThan(0);
      
      // Verificar que incluye criterios específicos de video
      const criteriosVideo = criterios.filter(c => c.tipo_medio === TipoMedio.video);
      expect(criteriosVideo.length).toBeGreaterThan(0);
      
      // Verificar que incluye criterios universales
      const criteriosUniversales = criterios.filter(c => c.tipo_medio === null);
      expect(criteriosUniversales.length).toBeGreaterThan(0);
    });

    test('debe obtener criterios para audio incluyendo universales', async () => {
      const criterios = await criteriosService.getCriteriosPorTipoMedio(TipoMedio.audio);
      
      expect(criterios).toBeDefined();
      expect(Array.isArray(criterios)).toBe(true);
      expect(criterios.length).toBeGreaterThan(0);
      
      // Verificar que incluye criterios específicos de audio
      const criteriosAudio = criterios.filter(c => c.tipo_medio === TipoMedio.audio);
      expect(criteriosAudio.length).toBeGreaterThan(0);
      
      // Verificar que incluye criterios universales
      const criteriosUniversales = criterios.filter(c => c.tipo_medio === null);
      expect(criteriosUniversales.length).toBeGreaterThan(0);
    });

    test('debe obtener criterios para cortos de cine incluyendo universales', async () => {
      const criterios = await criteriosService.getCriteriosPorTipoMedio(TipoMedio.corto_cine);
      
      expect(criterios).toBeDefined();
      expect(Array.isArray(criterios)).toBe(true);
      expect(criterios.length).toBeGreaterThan(0);
      
      // Verificar que incluye criterios específicos de cine
      const criteriosCine = criterios.filter(c => c.tipo_medio === TipoMedio.corto_cine);
      expect(criteriosCine.length).toBeGreaterThan(0);
      
      // Verificar que incluye criterios universales
      const criteriosUniversales = criterios.filter(c => c.tipo_medio === null);
      expect(criteriosUniversales.length).toBeGreaterThan(0);
    });
  });

  describe('getCriteriosUniversales', () => {
    test('debe obtener solo criterios universales', async () => {
      const criterios = await criteriosService.getCriteriosUniversales();
      
      expect(criterios).toBeDefined();
      expect(Array.isArray(criterios)).toBe(true);
      expect(criterios.length).toBeGreaterThan(0);
      
      // Verificar que todos son criterios universales (tipo_medio = null)
      const todosUniversales = criterios.every(c => c.tipo_medio === null);
      expect(todosUniversales).toBe(true);
      
      // Verificar que todos están activos
      const todosActivos = criterios.every(c => c.activo === true);
      expect(todosActivos).toBe(true);
    });
  });

  describe('validarCriteriosCompletos', () => {
    test('debe validar que existen criterios suficientes para fotografía', async () => {
      const esValido = await criteriosService.validarCriteriosCompletos(TipoMedio.fotografia);
      expect(esValido).toBe(true);
    });

    test('debe validar que existen criterios suficientes para video', async () => {
      const esValido = await criteriosService.validarCriteriosCompletos(TipoMedio.video);
      expect(esValido).toBe(true);
    });

    test('debe validar que existen criterios suficientes para audio', async () => {
      const esValido = await criteriosService.validarCriteriosCompletos(TipoMedio.audio);
      expect(esValido).toBe(true);
    });

    test('debe validar que existen criterios suficientes para cortos de cine', async () => {
      const esValido = await criteriosService.validarCriteriosCompletos(TipoMedio.corto_cine);
      expect(esValido).toBe(true);
    });
  });

  describe('getPesoTotalCriterios', () => {
    test('debe calcular el peso total de criterios para fotografía', async () => {
      const pesoTotal = await criteriosService.getPesoTotalCriterios(TipoMedio.fotografia);
      expect(pesoTotal).toBeGreaterThan(0);
      expect(typeof pesoTotal).toBe('number');
    });

    test('debe calcular el peso total de criterios para video', async () => {
      const pesoTotal = await criteriosService.getPesoTotalCriterios(TipoMedio.video);
      expect(pesoTotal).toBeGreaterThan(0);
      expect(typeof pesoTotal).toBe('number');
    });

    test('debe calcular el peso total de criterios para audio', async () => {
      const pesoTotal = await criteriosService.getPesoTotalCriterios(TipoMedio.audio);
      expect(pesoTotal).toBeGreaterThan(0);
      expect(typeof pesoTotal).toBe('number');
    });

    test('debe calcular el peso total de criterios para cortos de cine', async () => {
      const pesoTotal = await criteriosService.getPesoTotalCriterios(TipoMedio.corto_cine);
      expect(pesoTotal).toBeGreaterThan(0);
      expect(typeof pesoTotal).toBe('number');
    });
  });

  describe('getEstadisticasCriterios', () => {
    test('debe obtener estadísticas completas de criterios', async () => {
      const estadisticas = await criteriosService.getEstadisticasCriterios();
      
      expect(estadisticas).toBeDefined();
      expect(estadisticas.total_criterios).toBeGreaterThan(0);
      expect(estadisticas.criterios_activos).toBeGreaterThan(0);
      expect(Array.isArray(estadisticas.criterios_por_tipo)).toBe(true);
      expect(Array.isArray(estadisticas.criterios_mas_usados)).toBe(true);
      
      // Verificar que hay criterios para cada tipo de medio
      expect(estadisticas.criterios_por_tipo.length).toBeGreaterThan(0);
    });
  });
});