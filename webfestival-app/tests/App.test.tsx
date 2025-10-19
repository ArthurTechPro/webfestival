// IMPORTANTE: NO IMPORTAR FUNCIONES DE 'node:test' - USAR VITEST GLOBALS
// Vitest proporciona describe, it, expect, beforeEach, afterEach globalmente

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../src/App';

describe('App Component', () => {
  it('renderiza correctamente la página principal', () => {
    render(<App />);

    // Verificar que el título principal esté presente
    expect(screen.getByText(/La Plataforma Definitiva para/)).toBeInTheDocument();

    // Verificar que la descripción esté presente
    expect(
      screen.getByText(/Conecta artistas creativos, jurados profesionales/)
    ).toBeInTheDocument();

    // Verificar que el selector de tema esté presente
    expect(screen.getByLabelText('Selector de tema')).toBeInTheDocument();
  });

  it('muestra el selector de tema en la posición correcta', () => {
    render(<App />);

    // Verificar que el selector de tema esté presente
    const themeSelector = screen.getByLabelText('Selector de tema');
    expect(themeSelector).toBeInTheDocument();
    
    // Verificar que el contenedor del selector tenga las clases correctas para posición inferior izquierda
    const selectorContainer = themeSelector.closest('.wf-fixed.wf-bottom-4.wf-left-4');
    expect(selectorContainer).toBeInTheDocument();
  });
});
