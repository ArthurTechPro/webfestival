import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeSelector from '../src/components/ui/ThemeSelector';

// Mock del hook useTheme
const mockSetTheme = vi.fn();
const mockCurrentThemeConfig = {
  name: 'corporate' as const,
  displayName: 'Corporate',
  category: 'professional' as const,
  description: 'Estilo corporativo minimalista y elegante',
  primaryColor: '#2563eb',
  isDark: false
};

const mockUseTheme = {
  theme: 'corporate' as const,
  currentThemeConfig: mockCurrentThemeConfig,
  setTheme: mockSetTheme,
  toggleTheme: vi.fn(),
  randomTheme: vi.fn(),
  resetTheme: vi.fn(),
  getThemesByCategory: vi.fn((category) => {
    if (category === 'professional') {
      return [{
        name: 'corporate',
        displayName: 'Corporate',
        category: 'professional',
        description: 'Estilo corporativo minimalista y elegante',
        primaryColor: '#2563eb',
        isDark: false
      }];
    } else if (category === 'cinematic') {
      return [
        {
          name: 'cinematic',
          displayName: 'Cinematic Dark',
          category: 'cinematic',
          description: 'Tema oscuro cinematográfico con efectos glassmorphism',
          primaryColor: '#4a7bc8',
          isDark: true
        },
        {
          name: 'retro',
          displayName: 'Retro Wave',
          category: 'cinematic',
          description: 'Estilo retro synthwave con colores vibrantes',
          primaryColor: '#ff6b9d',
          isDark: true
        }
      ];
    }
    return [];
  }),
  availableThemes: {
    corporate: mockCurrentThemeConfig,
    cinematic: {
      name: 'cinematic',
      displayName: 'Cinematic Dark',
      category: 'cinematic',
      description: 'Tema oscuro cinematográfico con efectos glassmorphism',
      primaryColor: '#4a7bc8',
      isDark: true
    },
    retro: {
      name: 'retro',
      displayName: 'Retro Wave',
      category: 'cinematic',
      description: 'Estilo retro synthwave con colores vibrantes',
      primaryColor: '#ff6b9d',
      isDark: true
    }
  },
  isDark: false,
};

vi.mock('../src/hooks/useTheme', () => ({
  useTheme: () => mockUseTheme,
  THEMES: {
    corporate: mockCurrentThemeConfig,
    cinematic: {
      name: 'cinematic',
      displayName: 'Cinematic Dark',
      category: 'cinematic',
      description: 'Tema oscuro cinematográfico con efectos glassmorphism',
      primaryColor: '#4a7bc8',
      isDark: true
    },
    retro: {
      name: 'retro',
      displayName: 'Retro Wave',
      category: 'cinematic',
      description: 'Estilo retro synthwave con colores vibrantes',
      primaryColor: '#ff6b9d',
      isDark: true
    }
  }
}));

describe('ThemeSelector con 3 temas', () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
  });

  it('renderiza correctamente y muestra 3 opciones de tema', () => {
    render(<ThemeSelector />);
    
    // Hacer clic en el botón para abrir el selector
    const button = screen.getByLabelText('Selector de tema');
    fireEvent.click(button);
    
    // Verificar que hay 3 opciones de tema en total
    const themeOptions = screen.getAllByRole('button').filter(btn => 
      btn.getAttribute('tabindex') === '0' && btn !== button
    );
    expect(themeOptions).toHaveLength(3);
  });

  it('muestra las descripciones correctas para los temas', () => {
    render(<ThemeSelector />);
    
    // Abrir el selector
    const button = screen.getByLabelText('Selector de tema');
    fireEvent.click(button);
    
    // Verificar descripciones de los temas
    expect(screen.getByText('Estilo corporativo minimalista y elegante')).toBeInTheDocument();
    expect(screen.getByText('Tema oscuro cinematográfico con efectos glassmorphism')).toBeInTheDocument();
    expect(screen.getByText('Estilo retro synthwave con colores vibrantes')).toBeInTheDocument();
  });

  it('permite hacer clic en todas las opciones de tema', () => {
    render(<ThemeSelector />);
    
    // Abrir el selector
    const button = screen.getByLabelText('Selector de tema');
    fireEvent.click(button);
    
    // Obtener todas las opciones de tema y hacer clic en cada una
    const corporateOption = screen.getByText('Corporate').closest('[role="button"]');
    const cinematicOption = screen.getByText('Cinematic Dark').closest('[role="button"]');
    const retroOption = screen.getByText('Retro Wave').closest('[role="button"]');
    
    if (corporateOption) fireEvent.click(corporateOption);
    if (cinematicOption) fireEvent.click(cinematicOption);
    if (retroOption) fireEvent.click(retroOption);
    
    // Verificar que se llamó setTheme al menos 3 veces
    expect(mockSetTheme).toHaveBeenCalledTimes(3);
  });

  it('incluye los 3 temas en las opciones', () => {
    render(<ThemeSelector />);
    
    // Abrir el selector
    const button = screen.getByLabelText('Selector de tema');
    fireEvent.click(button);
    
    // Verificar que los nombres de los temas están presentes
    expect(screen.getByText('Corporate')).toBeInTheDocument();
    expect(screen.getByText('Cinematic Dark')).toBeInTheDocument();
    expect(screen.getByText('Retro Wave')).toBeInTheDocument();
  });

  it('renderiza correctamente con showLabel=true', () => {
    render(<ThemeSelector showLabel={true} />);
    
    // El botón debería mostrar el label del tema actual
    const button = screen.getByLabelText('Selector de tema');
    expect(button).toBeInTheDocument();
    expect(screen.getByText('Corporate')).toBeInTheDocument();
  });
});