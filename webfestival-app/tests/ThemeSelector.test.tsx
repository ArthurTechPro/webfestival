import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeSelector from '../src/components/ui/ThemeSelector';

// Mock del hook useTheme
const mockSetTheme = vi.fn();
const mockUseTheme = {
  theme: 'auto' as const,
  setTheme: mockSetTheme,
  toggleTheme: vi.fn(),
  isDark: false,
};

vi.mock('../src/hooks/useTheme', () => ({
  useTheme: () => mockUseTheme,
  useThemeInfo: () => ({
    themes: [
      { value: 'auto', label: 'Automático', description: 'Sigue la preferencia del sistema' },
      { value: 'light', label: 'Claro', description: 'Tema claro siempre' },
      { value: 'dark', label: 'Oscuro', description: 'Tema oscuro siempre' },
      { value: 'festival', label: 'Festival', description: 'Colores vibrantes y festivos' },
      { value: 'professional', label: 'Profesional', description: 'Colores corporativos' },
      { value: 'artistic', label: 'Artístico', description: 'Colores creativos y únicos' },
      { value: 'cinematic', label: 'Cinematográfico', description: 'Estilo de película dramático' },
      { value: 'looper', label: 'Looper', description: 'Diseño profesional corporativo' },
      { value: 'corporate', label: 'Corporate', description: 'Estilo minimalista empresarial' },
    ]
  })
}));

describe('ThemeSelector con nuevos temas', () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
  });

  it('renderiza correctamente y muestra 9 opciones de tema', () => {
    render(<ThemeSelector />);
    
    // Hacer clic en el botón para abrir el selector
    const button = screen.getByRole('button', { name: /seleccionar tema/i });
    fireEvent.click(button);
    
    // Verificar que hay 9 opciones de tema en total (7 originales + 2 nuevos)
    const themeOptions = screen.getAllByRole('menuitem');
    expect(themeOptions).toHaveLength(9);
  });

  it('muestra las descripciones correctas para los nuevos temas', () => {
    render(<ThemeSelector />);
    
    // Abrir el selector
    const button = screen.getByRole('button', { name: /seleccionar tema/i });
    fireEvent.click(button);
    
    // Verificar descripciones de los nuevos temas
    expect(screen.getByText('Diseño profesional corporativo')).toBeInTheDocument();
    expect(screen.getByText('Estilo minimalista empresarial')).toBeInTheDocument();
  });

  it('permite hacer clic en todas las opciones de tema', () => {
    render(<ThemeSelector />);
    
    // Abrir el selector
    const button = screen.getByRole('button', { name: /seleccionar tema/i });
    fireEvent.click(button);
    
    // Obtener todas las opciones y hacer clic en cada una
    const themeOptions = screen.getAllByRole('menuitem');
    
    themeOptions.forEach((option, index) => {
      fireEvent.click(option);
      expect(mockSetTheme).toHaveBeenCalled();
    });
    
    // Verificar que se llamó setTheme al menos 9 veces (una por cada tema)
    expect(mockSetTheme).toHaveBeenCalledTimes(9);
  });

  it('incluye los nuevos temas en las opciones', () => {
    render(<ThemeSelector />);
    
    // Abrir el selector
    const button = screen.getByRole('button', { name: /seleccionar tema/i });
    fireEvent.click(button);
    
    // Verificar que las clases CSS de los nuevos temas están presentes
    const looperPreview = document.querySelector('.wf-theme-preview.looper');
    const corporatePreview = document.querySelector('.wf-theme-preview.corporate');
    
    expect(looperPreview).toBeInTheDocument();
    expect(corporatePreview).toBeInTheDocument();
  });

  it('renderiza correctamente con showLabel=true', () => {
    render(<ThemeSelector showLabel={true} />);
    
    // El botón debería mostrar el label del tema actual
    const button = screen.getByRole('button', { name: /seleccionar tema/i });
    expect(button).toBeInTheDocument();
  });
});