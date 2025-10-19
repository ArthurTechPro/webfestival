import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../src/hooks/useTheme';

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
    it('incluye los temas Corporate, Cinematic y Retro', () => {
      const { result } = renderHook(() => useTheme());
      
      // Verificar que el tema inicial es 'corporate'
      expect(result.current.theme).toBe('corporate');
      
      // Probar cambio a tema Cinematic
      act(() => {
        result.current.setTheme('cinematic');
      });
      
      expect(result.current.theme).toBe('cinematic');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('webfestival-theme', 'cinematic');
      
      // Probar cambio a tema Retro
      act(() => {
        result.current.setTheme('retro');
      });
      
      expect(result.current.theme).toBe('retro');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('webfestival-theme', 'retro');
    });

    it('valida correctamente el tema Corporate al cargar desde localStorage', () => {
      // Simular tema Corporate guardado
      localStorageMock.getItem.mockReturnValue('corporate');
      
      const { result } = renderHook(() => useTheme());
      
      expect(result.current.theme).toBe('corporate');
    });

    it('valida correctamente el tema Cinematic al cargar desde localStorage', () => {
      // Simular tema Cinematic guardado
      localStorageMock.getItem.mockReturnValue('cinematic');
      
      const { result } = renderHook(() => useTheme());
      
      expect(result.current.theme).toBe('cinematic');
    });

    it('rechaza temas inválidos y usa corporate por defecto', () => {
      localStorageMock.getItem.mockReturnValue('tema-inexistente');
      
      const { result } = renderHook(() => useTheme());
      
      expect(result.current.theme).toBe('corporate');
    });
  });

  describe('Temas disponibles', () => {
    it('incluye información de los 3 temas disponibles', () => {
      const { result } = renderHook(() => useTheme());
      
      // Verificar que tenemos exactamente 3 temas
      expect(Object.keys(result.current.availableThemes)).toHaveLength(3);
      
      // Verificar que incluye los temas correctos
      expect(result.current.availableThemes).toHaveProperty('corporate');
      expect(result.current.availableThemes).toHaveProperty('cinematic');
      expect(result.current.availableThemes).toHaveProperty('retro');
      
      // Verificar información específica del tema Corporate
      expect(result.current.availableThemes.corporate.displayName).toBe('Corporate');
      expect(result.current.availableThemes.corporate.description).toBe('Estilo corporativo minimalista y elegante');
      
      // Verificar información específica del tema Cinematic
      expect(result.current.availableThemes.cinematic.displayName).toBe('Cinematic Dark');
      expect(result.current.availableThemes.cinematic.description).toBe('Tema oscuro cinematográfico con efectos glassmorphism');
    });

    it('mantiene solo los 3 temas seleccionados', () => {
      const { result } = renderHook(() => useTheme());
      
      const themeNames = Object.keys(result.current.availableThemes);
      
      // Verificar que solo tenemos los 3 temas que queremos
      expect(themeNames).toEqual(['corporate', 'cinematic', 'retro']);
      expect(themeNames).not.toContain('professional');
      expect(themeNames).not.toContain('minimal');
      expect(themeNames).not.toContain('neuro');
      expect(themeNames).not.toContain('ocean');
      expect(themeNames).not.toContain('sunset');
      expect(themeNames).not.toContain('forest');
    });
  });

  describe('Aplicación de temas al DOM', () => {
    it('aplica correctamente el atributo data-theme para Corporate', () => {
      const { result } = renderHook(() => useTheme());
      
      act(() => {
        result.current.setTheme('corporate');
      });
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('corporate');
    });

    it('aplica correctamente el atributo data-theme para Cinematic', () => {
      const { result } = renderHook(() => useTheme());
      
      act(() => {
        result.current.setTheme('cinematic');
      });
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('cinematic');
    });

    it('aplica correctamente el atributo data-theme para Retro', () => {
      const { result } = renderHook(() => useTheme());
      
      act(() => {
        result.current.setTheme('retro');
      });
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('retro');
    });
  });

  describe('Funcionalidad de los temas', () => {
    it('mantiene funcionalidad de los 3 temas disponibles', () => {
      const { result } = renderHook(() => useTheme());
      
      const temasDisponibles = ['corporate', 'cinematic', 'retro'];
      
      temasDisponibles.forEach(tema => {
        act(() => {
          result.current.setTheme(tema as any);
        });
        
        expect(result.current.theme).toBe(tema);
        expect(document.documentElement.getAttribute('data-theme')).toBe(tema);
      });
    });
  });
});