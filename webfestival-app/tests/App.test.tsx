// IMPORTANTE: NO IMPORTAR FUNCIONES DE 'node:test' - USAR VITEST GLOBALS
// Vitest proporciona describe, it, expect, beforeEach, afterEach globalmente

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../src/App';

describe('App Component', () => {
  it('renderiza correctamente la página principal', () => {
    render(<App />);

    // Verificar que el título principal esté presente
    expect(screen.getByText('WebFestival App')).toBeInTheDocument();

    // Verificar que la descripción esté presente
    expect(
      screen.getByText(
        'Plataforma de concursos multimedia para artistas creativos'
      )
    ).toBeInTheDocument();

    // Verificar que el mensaje de autenticación implementada esté presente
    expect(
      screen.getByText(/Sistema de autenticación implementado!/)
    ).toBeInTheDocument();
  });

  it('muestra la URL del API configurada', () => {
    render(<App />);

    // Verificar que se muestre la URL del API
    expect(screen.getByText(/API URL configurada:/)).toBeInTheDocument();
  });
});
