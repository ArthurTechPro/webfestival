import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from '../src/components/pages/Landing/LandingPage';
import { beforeEach } from 'node:test';

// Mock del hook useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

describe('LandingPage Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('navega a login cuando se hace clic en "Iniciar Sesión" del navbar', () => {
    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>
    );

    const loginButtons = screen.getAllByRole('button', { name: /iniciar sesión/i });
    // El primer botón es del navbar (tamaño sm)
    fireEvent.click(loginButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('navega a register cuando se hace clic en "Registrarse Gratis" del hero', () => {
    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>
    );

    const registerButtons = screen.getAllByRole('button', { name: /registrarse gratis/i });
    // El primer botón es del hero
    fireEvent.click(registerButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  it('navega a showcase cuando se hace clic en "Ver Demo"', () => {
    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>
    );

    const demoButton = screen.getByRole('button', { name: /ver demo/i });
    fireEvent.click(demoButton);

    expect(mockNavigate).toHaveBeenCalledWith('/showcase');
  });

  it('contiene todos los botones de navegación principales', () => {
    render(
      <TestWrapper>
        <LandingPage />
      </TestWrapper>
    );

    // Verificar que existen múltiples botones de cada tipo
    expect(screen.getAllByRole('button', { name: /iniciar sesión/i })).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /registrarse gratis/i })).toHaveLength(2);
    expect(screen.getByRole('button', { name: /ver demo/i })).toBeInTheDocument();
  });
});