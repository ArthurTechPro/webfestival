import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import LoginForm from '../src/components/auth/LoginForm';
import { AuthProvider } from '../src/contexts/AuthContext';

// Mock de los hooks
vi.mock('../src/hooks/useRoleBasedNavigation', () => ({
  useRoleBasedNavigation: () => ({
    navigateToDashboard: vi.fn(),
  }),
}));

// Mock del servicio de autenticación
vi.mock('../src/services/auth.service', () => ({
  authService: {
    login: vi.fn().mockResolvedValue({
      user: { id: 1, email: 'test@example.com', role: 'PARTICIPANTE' },
      token: 'mock-token'
    }),
    getToken: vi.fn(() => null),
    getStoredUser: vi.fn(() => null),
    verifyToken: vi.fn(() => null),
  },
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza correctamente', () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Tu contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('permite escribir en los campos de entrada', () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByPlaceholderText('tu@email.com');
    const passwordInput = screen.getByPlaceholderText('Tu contraseña');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('envía el formulario con datos válidos', async () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByPlaceholderText('tu@email.com');
    const passwordInput = screen.getByPlaceholderText('Tu contraseña');
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Verificar que el botón cambia a estado de carga
    expect(submitButton).toHaveTextContent('Iniciando sesión...');
  });

  it('muestra error para contraseña muy corta', async () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByPlaceholderText('tu@email.com');
    const passwordInput = screen.getByPlaceholderText('Tu contraseña');
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('La contraseña debe tener al menos 6 caracteres')).toBeInTheDocument();
    });
  });

  it('permite cambiar el estado del checkbox "Mantenerme conectado"', () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const checkbox = screen.getByLabelText('Mantenerme conectado');
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('contiene enlaces de navegación correctos', () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    expect(screen.getByText('Crear una')).toHaveAttribute('href', '/register');
    expect(screen.getByText('¿Olvidaste tu contraseña?')).toHaveAttribute('href', '/forgot-password');
    expect(screen.getByText('Explorar Galería')).toHaveAttribute('href', '/galeria');
  });

  it('deshabilita el formulario durante el envío', async () => {
    render(
      <TestWrapper>
        <LoginForm />
      </TestWrapper>
    );

    const emailInput = screen.getByPlaceholderText('tu@email.com');
    const passwordInput = screen.getByPlaceholderText('Tu contraseña');
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Los campos deberían estar deshabilitados durante el envío
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });
});