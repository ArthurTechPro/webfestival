import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';
import RegisterForm from '../src/components/auth/RegisterForm';
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
        register: vi.fn().mockResolvedValue({
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

describe('RegisterForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renderiza correctamente', () => {
        render(
            <TestWrapper>
                <RegisterForm />
            </TestWrapper>
        );

        expect(screen.getByRole('heading', { name: 'Crear Cuenta' })).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Tu nombre completo')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Mínimo 6 caracteres')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Repite tu contraseña')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
    });

    it('permite escribir en todos los campos', () => {
        render(
            <TestWrapper>
                <RegisterForm />
            </TestWrapper>
        );

        const nameInput = screen.getByPlaceholderText('Tu nombre completo');
        const emailInput = screen.getByPlaceholderText('tu@email.com');
        const passwordInput = screen.getByPlaceholderText('Mínimo 6 caracteres');
        const confirmPasswordInput = screen.getByPlaceholderText('Repite tu contraseña');

        fireEvent.change(nameInput, { target: { value: 'Juan Pérez' } });
        fireEvent.change(emailInput, { target: { value: 'juan@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

        expect(nameInput).toHaveValue('Juan Pérez');
        expect(emailInput).toHaveValue('juan@example.com');
        expect(passwordInput).toHaveValue('password123');
        expect(confirmPasswordInput).toHaveValue('password123');
    });

    it('envía el formulario con datos válidos', async () => {
        render(
            <TestWrapper>
                <RegisterForm />
            </TestWrapper>
        );

        const nameInput = screen.getByPlaceholderText('Tu nombre completo');
        const emailInput = screen.getByPlaceholderText('tu@email.com');
        const passwordInput = screen.getByPlaceholderText('Mínimo 6 caracteres');
        const confirmPasswordInput = screen.getByPlaceholderText('Repite tu contraseña');
        const termsCheckbox = screen.getByLabelText(/acepto los términos/i);
        const submitButton = screen.getByRole('button', { name: /crear cuenta/i });

        fireEvent.change(nameInput, { target: { value: 'Juan Pérez' } });
        fireEvent.change(emailInput, { target: { value: 'juan@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        fireEvent.click(termsCheckbox);
        fireEvent.click(submitButton);

        // Verificar que el botón cambia a estado de carga
        expect(submitButton).toHaveTextContent('Creando cuenta...');
    });

    it('permite mostrar/ocultar contraseñas', () => {
        render(
            <TestWrapper>
                <RegisterForm />
            </TestWrapper>
        );

        const passwordInput = screen.getByPlaceholderText('Mínimo 6 caracteres');
        const confirmPasswordInput = screen.getByPlaceholderText('Repite tu contraseña');
        const passwordToggleButtons = screen.getAllByText('👁️');

        expect(passwordInput).toHaveAttribute('type', 'password');
        expect(confirmPasswordInput).toHaveAttribute('type', 'password');

        // Mostrar primera contraseña
        fireEvent.click(passwordToggleButtons[0]);
        expect(passwordInput).toHaveAttribute('type', 'text');

        // Mostrar segunda contraseña
        fireEvent.click(passwordToggleButtons[1]);
        expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    });

    it('requiere aceptar términos y condiciones', () => {
        render(
            <TestWrapper>
                <RegisterForm />
            </TestWrapper>
        );

        const submitButton = screen.getByRole('button', { name: /crear cuenta/i });
        expect(submitButton).toBeDisabled();

        const termsCheckbox = screen.getByLabelText(/acepto los términos/i);
        fireEvent.click(termsCheckbox);
        expect(submitButton).not.toBeDisabled();
    });

    it('contiene enlaces correctos', () => {
        render(
            <TestWrapper>
                <RegisterForm />
            </TestWrapper>
        );

        expect(screen.getByText('términos y condiciones')).toHaveAttribute('href', '/terms');
        expect(screen.getByText('política de privacidad')).toHaveAttribute('href', '/privacy');
        expect(screen.getByText('Inicia sesión aquí')).toHaveAttribute('href', '/login');
    });

    it('deshabilita el formulario durante el envío', async () => {
        render(
            <TestWrapper>
                <RegisterForm />
            </TestWrapper>
        );

        const nameInput = screen.getByPlaceholderText('Tu nombre completo');
        const emailInput = screen.getByPlaceholderText('tu@email.com');
        const passwordInput = screen.getByPlaceholderText('Mínimo 6 caracteres');
        const confirmPasswordInput = screen.getByPlaceholderText('Repite tu contraseña');
        const termsCheckbox = screen.getByLabelText(/acepto los términos/i);
        const submitButton = screen.getByRole('button', { name: /crear cuenta/i });

        fireEvent.change(nameInput, { target: { value: 'Juan Pérez' } });
        fireEvent.change(emailInput, { target: { value: 'juan@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        fireEvent.click(termsCheckbox);
        fireEvent.click(submitButton);

        // Los campos deberían estar deshabilitados durante el envío
        expect(nameInput).toBeDisabled();
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
        expect(confirmPasswordInput).toBeDisabled();
        expect(submitButton).toBeDisabled();
    });
});