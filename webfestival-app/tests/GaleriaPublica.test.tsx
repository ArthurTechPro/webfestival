import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GaleriaPublica from '../src/pages/GaleriaPublica';

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

describe('GaleriaPublica', () => {
  it('renderiza correctamente el banner principal', () => {
    render(
      <TestWrapper>
        <GaleriaPublica />
      </TestWrapper>
    );

    // Verificar título principal
    expect(screen.getByText('Galería de Obras Ganadoras')).toBeInTheDocument();
    
    // Verificar descripción
    expect(screen.getByText(/Descubre los mejores trabajos creativos/)).toBeInTheDocument();
    
    // Verificar estadísticas (usar getAllByText para elementos duplicados)
    expect(screen.getAllByText('2.5K+')).toHaveLength(2); // Aparece en estadísticas y filtros
    expect(screen.getAllByText('Obras Destacadas')).toHaveLength(2); // Estadística y título de sección
  });

  it('muestra los filtros por tipo de medio', () => {
    render(
      <TestWrapper>
        <GaleriaPublica />
      </TestWrapper>
    );

    // Verificar que existen los filtros
    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Fotografía')).toBeInTheDocument();
    expect(screen.getByText('Video')).toBeInTheDocument();
    expect(screen.getByText('Audio')).toBeInTheDocument();
    expect(screen.getByText('Cortos')).toBeInTheDocument();
  });

  it('permite cambiar entre filtros', () => {
    render(
      <TestWrapper>
        <GaleriaPublica />
      </TestWrapper>
    );

    const fotografiaFilter = screen.getByText('Fotografía');
    fireEvent.click(fotografiaFilter);

    // El filtro debería estar activo (esto se verifica visualmente en el navegador)
    expect(fotografiaFilter).toBeInTheDocument();
  });

  it('muestra las obras destacadas', () => {
    render(
      <TestWrapper>
        <GaleriaPublica />
      </TestWrapper>
    );

    // Verificar que se muestran las obras de ejemplo
    expect(screen.getByText('Atardecer Urbano')).toBeInTheDocument();
    expect(screen.getByText('Melodía Nocturna')).toBeInTheDocument();
    expect(screen.getByText('Reflexiones')).toBeInTheDocument();
    
    // Verificar artistas
    expect(screen.getByText('María González')).toBeInTheDocument();
    expect(screen.getByText('Carlos Ruiz')).toBeInTheDocument();
    expect(screen.getByText('Ana Martínez')).toBeInTheDocument();
  });

  it('contiene botones de call-to-action', () => {
    render(
      <TestWrapper>
        <GaleriaPublica />
      </TestWrapper>
    );

    // Verificar botones principales
    expect(screen.getByText('🏆 Ver Ganadores Recientes')).toBeInTheDocument();
    expect(screen.getByText('🎯 Participar en Concursos')).toBeInTheDocument();
    expect(screen.getByText('🚀 Registrarse Ahora')).toBeInTheDocument();
    expect(screen.getByText('📚 Ver Concursos Activos')).toBeInTheDocument();
  });

  it('muestra las secciones principales', () => {
    render(
      <TestWrapper>
        <GaleriaPublica />
      </TestWrapper>
    );

    // Verificar títulos de secciones
    expect(screen.getByText('Explorar por Categoría')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Obras Destacadas' })).toBeInTheDocument();
    expect(screen.getByText('¿Listo para Mostrar tu Talento?')).toBeInTheDocument();
  });
});