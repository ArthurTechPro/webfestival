import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme, useThemeInfo } from '../src/hooks/useTheme';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Sistema de Temas Extendido', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    document.documentElement.removeAttribute('data-theme');
  });

  describe('useTheme hook', () => {
    it('incluye los nuevos temas Looper y Corporate', () => {
      const { result } = renderHook(() => useTheme());
      
      // Verificar que el tema inicial es 'auto'
      expect(result.current.theme).toBe('auto');
      
      // Probar cambio a tema Looper
      act(() => {
        result.current.setTheme('looper');
      });
      
      expect(result.current.theme).toBe('looper');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('webfestival-theme', 'looper');
      
      // Probar cambio a tema Corporate
      act(() => {
        result.current.setTheme('corporate');
      });
      
      expect(result.current.theme).toBe('corporate');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('webfestival-theme', 'corporate');
    });

    it('valida correctamente los nuevos temas al cargar desde localStorage', () => {
      // Simular tema Looper guardado
      localStorageMock.getItem.mockReturnValue('looper');
      
      const { result } = renderHook(() => useTheme());
      
      expect(result.current.theme).toBe('looper');
    });

    it('valida correctamente el tema Corporate al cargar desde localStorage', () => {
      // Simular tema Corporate guardado
      localStorageMock.getItem.mockReturnValue('corporate');
      
      const { result } = renderHook(() => useTheme());
      
      expect(result.current.theme).toBe('corporate');
    });

    it('rechaza temas inválidos y usa auto por defecto', () => {
      localStorageMock.getItem.mockReturnValue('tema-inexistente');
      
      const { result } = renderHook(() => useTheme());
      
      expect(result.current.theme).toBe('auto');
    });
  });

  describe('useThemeInfo hook', () => {
    it('incluye información de los nuevos temas', () => {
      const { result } = renderHook(() => useThemeInfo());
      
      const themeNames = result.current.themes.map(theme => theme.value);
      
      // Verificar que incluye todos los temas, incluyendo los nuevos
      expect(themeNames).toContain('looper');
      expect(themeNames).toContain('corporate');
      
      // Verificar que hay 9 temas en total (7 existentes + 2 nuevos)
      expect(result.current.themes).toHaveLength(9);
      
      // Verificar información específica del tema Looper
      const looperTheme = result.current.themes.find(theme => theme.value === 'looper');
      expect(looperTheme).toBeDefined();
      expect(looperTheme?.label).toBe('Looper');
      expect(looperTheme?.description).toBe('Diseño profesional corporativo');
      
      // Verificar información específica del tema Corporate
      const corporateTheme = result.current.themes.find(theme => theme.value === 'corporate');
      expect(corporateTheme).toBeDefined();
      expect(corporateTheme?.label).toBe('Corporate');
      expect(corporateTheme?.description).toBe('Estilo minimalista empresarial');
    });

    it('mantiene todos los temas existentes', () => {
      const { result } = renderHook(() => useThemeInfo());
      
      const themeNames = result.current.themes.map(theme => theme.value);
      
      // Verificar que todos los temas originales siguen presentes
      expect(themeNames).toContain('auto');
      expect(themeNames).toContain('light');
      expect(themeNames).toContain('dark');
      expect(themeNames).toContain('festival');
      expect(themeNames).toContain('professional');
      expect(themeNames).toContain('artistic');
      expect(themeNames).toContain('cinematic');
    });
  });

  describe('Aplicación de temas al DOM', () => {
    it('aplica correctamente el atributo data-theme para Looper', () => {
      const { result } = renderHook(() => useTheme());
      
      act(() => {
        result.current.setTheme('looper');
      });
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('looper');
    });

    it('aplica correctamente el atributo data-theme para Corporate', () => {
      const { result } = renderHook(() => useTheme());
      
      act(() => {
        result.current.setTheme('corporate');
      });
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('corporate');
    });

    it('no aplica atributo data-theme para tema auto', () => {
      const { result } = renderHook(() => useTheme());
      
      // Cambiar a un tema específico primero
      act(() => {
        result.current.setTheme('looper');
      });
      
      // Luego cambiar a auto
      act(() => {
        result.current.setTheme('auto');
      });
      
      expect(document.documentElement.getAttribute('data-theme')).toBeNull();
    });
  });

  describe('Compatibilidad con temas existentes', () => {
    it('mantiene funcionalidad de todos los temas existentes', () => {
      const { result } = renderHook(() => useTheme());
      
      const temasExistentes = ['light', 'dark', 'festival', 'professional', 'artistic', 'cinematic'];
      
      temasExistentes.forEach(tema => {
        act(() => {
          result.current.setTheme(tema as any);
        });
        
        expect(result.current.theme).toBe(tema);
        expect(document.documentElement.getAttribute('data-theme')).toBe(tema);
      });
    });
  });
});