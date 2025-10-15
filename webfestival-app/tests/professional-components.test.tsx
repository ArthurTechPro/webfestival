/// <reference types="vitest/globals" />

// IMPORTANTE: NO IMPORTAR FUNCIONES DE 'node:test' - USAR VITEST GLOBALS
// Vitest proporciona describe, it, expect, beforeEach, afterEach globalmente

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import { AuthProvider } from '../src/contexts/AuthContext';
import HeroProfessional from '../src/components/ui/HeroProfessional';
import AuthFormProfessional from '../src/components/auth/AuthFormProfessional';
import HeroAdaptive from '../src/components/ui/HeroAdaptive';
import AuthFormAdaptive from '../src/components/auth/AuthFormAdaptive';
import { useComponentVariant } from '../src/hooks/useComponentVariant';

// Mock del hook useTheme
const mockUseTheme = {
    theme: 'looper' as const,
    setTheme: vi.fn(),
    isDark: false,
    isLight: false,
    toggleTheme: vi.fn()
};

vi.mock('../src/hooks/useTheme', () => ({
    useTheme: () => mockUseTheme
}));

// Mock del servicio de autenticación
vi.mock('../src/services/auth.service', () => ({
    authService: {
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        getCurrentUser: vi.fn(),
        refreshToken: vi.fn()
    }
}));

// Wrapper para tests con contextos necesarios
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <BrowserRouter>
        <AuthProvider>
            {children}
        </AuthProvider>
    </BrowserRouter>
);

describe('Componentes Profesionales', () => {
    describe('HeroProfessional', () => {
        const heroProps = {
            title: 'Título de Prueba',
            subtitle: 'Subtítulo de Prueba',
            description: 'Descripción de prueba para el componente hero profesional',
            primaryAction: {
                text: 'Acción Principal',
                href: '/test',
                variant: 'primary' as const
            },
            secondaryAction: {
                text: 'Acción Secundaria',
                href: '/test2'
            }
        };

        it('renderiza correctamente con layout split', () => {
            render(
                <TestWrapper>
                    <HeroProfessional {...heroProps} layout="split" />
                </TestWrapper>
            );

            expect(screen.getByText('Título de Prueba')).toBeInTheDocument();
            expect(screen.getByText('Subtítulo de Prueba')).toBeInTheDocument();
            expect(screen.getByText('Descripción de prueba para el componente hero profesional')).toBeInTheDocument();
            expect(screen.getByText('Acción Principal')).toBeInTheDocument();
            expect(screen.getByText('Acción Secundaria')).toBeInTheDocument();
        });

        it('renderiza correctamente con layout centered', () => {
            render(
                <TestWrapper>
                    <HeroProfessional {...heroProps} layout="centered" />
                </TestWrapper>
            );

            expect(screen.getByText('Título de Prueba')).toBeInTheDocument();
            const heroElement = screen.getByText('Título de Prueba').closest('.wf-hero-professional');
            expect(heroElement).toHaveClass('wf-hero-professional-centered');
        });

        it('renderiza correctamente con layout minimal', () => {
            render(
                <TestWrapper>
                    <HeroProfessional {...heroProps} layout="minimal" />
                </TestWrapper>
            );

            expect(screen.getByText('Título de Prueba')).toBeInTheDocument();
            const heroElement = screen.getByText('Título de Prueba').closest('.wf-hero-professional');
            expect(heroElement).toHaveClass('wf-hero-professional-minimal');
        });

        it('aplica clases de tema correctamente', () => {
            render(
                <TestWrapper>
                    <HeroProfessional {...heroProps} theme="looper" />
                </TestWrapper>
            );

            const heroElement = screen.getByText('Título de Prueba').closest('.wf-hero-professional');
            expect(heroElement).toHaveClass('wf-hero-looper');
        });
    });

    describe('AuthFormProfessional', () => {
        const mockOnSubmit = vi.fn();

        beforeEach(() => {
            mockOnSubmit.mockClear();
        });

        it('renderiza formulario de login correctamente', () => {
            render(
                <TestWrapper>
                    <AuthFormProfessional
                        mode="login"
                        onSubmit={mockOnSubmit}
                    />
                </TestWrapper>
            );

            expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument();
            expect(screen.getByLabelText('Email')).toBeInTheDocument();
            expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
        });

        it('renderiza formulario de registro correctamente', () => {
            render(
                <TestWrapper>
                    <AuthFormProfessional
                        mode="register"
                        onSubmit={mockOnSubmit}
                    />
                </TestWrapper>
            );

            expect(screen.getByRole('heading', { name: 'Crear Cuenta' })).toBeInTheDocument();
            expect(screen.getByLabelText('Nombre completo')).toBeInTheDocument();
            expect(screen.getByLabelText('Email')).toBeInTheDocument();
            expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
            expect(screen.getByLabelText('Confirmar contraseña')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
        });

        it('muestra panel de anuncio con contenido personalizado', () => {
            const announcementContent = {
                title: 'Título de Anuncio',
                description: 'Descripción del anuncio de prueba',
                action: {
                    text: 'Acción de Anuncio',
                    href: '/test'
                }
            };

            render(
                <TestWrapper>
                    <AuthFormProfessional
                        mode="login"
                        onSubmit={mockOnSubmit}
                        announcementContent={announcementContent}
                    />
                </TestWrapper>
            );

            expect(screen.getByText('Título de Anuncio')).toBeInTheDocument();
            expect(screen.getByText('Descripción del anuncio de prueba')).toBeInTheDocument();
            expect(screen.getByText('Acción de Anuncio')).toBeInTheDocument();
        });

        it('aplica clases de tema correctamente', () => {
            render(
                <TestWrapper>
                    <AuthFormProfessional
                        mode="login"
                        onSubmit={mockOnSubmit}
                        theme="corporate"
                    />
                </TestWrapper>
            );

            const authElement = document.querySelector('.wf-auth-professional');
            expect(authElement).toHaveClass('wf-auth-professional-corporate');
        });
    });

    describe('Componentes Adaptativos', () => {
        it('HeroAdaptive selecciona HeroProfessional para tema looper', () => {
            // El tema ya está mockeado como 'looper'
            render(
                <TestWrapper>
                    <HeroAdaptive
                        title="Título Adaptativo"
                        description="Descripción adaptativa"
                    />
                </TestWrapper>
            );

            expect(screen.getByText('Título Adaptativo')).toBeInTheDocument();
            // Verificar que se usa el componente profesional
            const heroElement = screen.getByText('Título Adaptativo').closest('.wf-hero-professional');
            expect(heroElement).toBeInTheDocument();
        });

        it('AuthFormAdaptive selecciona AuthFormProfessional para tema looper', () => {
            render(
                <TestWrapper>
                    <AuthFormAdaptive
                        mode="login"
                        onSubmit={vi.fn()}
                    />
                </TestWrapper>
            );

            // Verificar que se usa el componente profesional
            const authElement = document.querySelector('.wf-auth-professional');
            expect(authElement).toBeInTheDocument();
        });
    });

    describe('Sistema de Selección Automática', () => {
        it('useComponentVariant retorna configuración correcta para tema looper', () => {
            let result: any;

            function TestComponent() {
                result = useComponentVariant();
                return null;
            }

            render(
                <TestWrapper>
                    <TestComponent />
                </TestWrapper>
            );

            expect(result.variant).toBe('professional');
            expect(result.isProfessional).toBe(true);
            expect(result.isCinematic).toBe(false);
            expect(result.shouldUseProfessionalComponent).toBe(true);
        });
    });
});