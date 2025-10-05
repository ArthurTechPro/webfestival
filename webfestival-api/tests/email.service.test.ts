/// <reference types="jest" />

// IMPORTANTE: NO IMPORTAR FUNCIONES DE 'node:test' - USAR JEST GLOBALS
// Jest proporciona describe, it, expect, beforeEach, afterEach globalmente
// El autofix de Kiro IDE puede agregar importaciones incorrectas - eliminarlas siempre

import { EmailService, EmailData } from '../src/services/email.service';

// Mock de SendGrid
jest.mock('@sendgrid/mail', () => ({
    setApiKey: jest.fn(),
    send: jest.fn()
}));

// Mock de Resend
jest.mock('resend', () => ({
    Resend: jest.fn().mockImplementation(() => ({
        emails: {
            send: jest.fn()
        }
    }))
}));

describe('EmailService', () => {
    let emailService: EmailService;
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        // Guardar variables de entorno originales
        originalEnv = { ...process.env };

        // Configurar variables de entorno para testing
        process.env['EMAIL_SERVICE'] = 'sendgrid';
        process.env['SENDGRID_API_KEY'] = 'test-sendgrid-key';
        process.env['SENDGRID_FROM_EMAIL'] = 'test@webfestival.com';
        process.env['RESEND_API_KEY'] = 'test-resend-key';
        process.env['RESEND_FROM_EMAIL'] = 'test@webfestival.com';

        // Crear nueva instancia del servicio
        emailService = new EmailService();

        // Limpiar mocks
        jest.clearAllMocks();
    });

    afterEach(() => {
        // Restaurar variables de entorno
        process.env = originalEnv;
    });

    describe('Constructor y configuración', () => {
        it('debería inicializar con SendGrid por defecto', () => {
            expect(emailService).toBeDefined();
            expect(emailService['emailProvider']).toBe('sendgrid');
        });

        it('debería inicializar con Resend cuando se especifica', () => {
            process.env['EMAIL_SERVICE'] = 'resend';
            const resendService = new EmailService();
            expect(resendService['emailProvider']).toBe('resend');
        });

        it('debería lanzar error si falta SENDGRID_API_KEY', () => {
            delete process.env['SENDGRID_API_KEY'];
            expect(() => new EmailService()).toThrow('SENDGRID_API_KEY es requerido cuando EMAIL_SERVICE es sendgrid');
        });

        it('debería lanzar error si falta RESEND_API_KEY para Resend', () => {
            process.env['EMAIL_SERVICE'] = 'resend';
            delete process.env['RESEND_API_KEY'];
            expect(() => new EmailService()).toThrow('RESEND_API_KEY es requerido cuando EMAIL_SERVICE es resend');
        });
    });

    describe('sendEmail', () => {
        const mockEmailData: EmailData = {
            to: 'test@example.com',
            subject: 'Test Subject',
            html: '<p>Test HTML</p>',
            text: 'Test text'
        };

        it('debería enviar email exitosamente con SendGrid', async () => {
            const sgMail = require('@sendgrid/mail');
            sgMail.send.mockResolvedValueOnce([{ statusCode: 202 }]);

            const result = await emailService.sendEmail(mockEmailData);

            expect(result).toBe(true);
            expect(sgMail.send).toHaveBeenCalledWith({
                to: mockEmailData.to,
                from: 'test@webfestival.com',
                subject: mockEmailData.subject,
                html: mockEmailData.html,
                text: mockEmailData.text || ''
            });
        });

        it('debería reintentar en caso de error', async () => {
            const sgMail = require('@sendgrid/mail');
            sgMail.send
                .mockRejectedValueOnce(new Error('Network error'))
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce([{ statusCode: 202 }]);

            const result = await emailService.sendEmail(mockEmailData);

            expect(result).toBe(true);
            expect(sgMail.send).toHaveBeenCalledTimes(3);
        });

        it('debería fallar después del máximo de reintentos', async () => {
            const sgMail = require('@sendgrid/mail');
            sgMail.send.mockRejectedValue(new Error('Persistent error'));

            const result = await emailService.sendEmail(mockEmailData);

            expect(result).toBe(false);
            expect(sgMail.send).toHaveBeenCalledTimes(3); // maxRetries = 3
        });
    });

    describe('Métodos de notificación específicos', () => {
        beforeEach(() => {
            // Mock del método sendEmail para evitar llamadas reales
            jest.spyOn(emailService, 'sendEmail').mockResolvedValue(true);
        });

        describe('sendDeadlineReminder', () => {
            it('debería enviar recordatorio de fecha límite correctamente', async () => {
                const result = await emailService.sendDeadlineReminder(
                    'user@example.com',
                    'Juan Pérez',
                    'Concurso de Fotografía 2024'
                );

                expect(result).toBe(true);
                expect(emailService.sendEmail).toHaveBeenCalledWith({
                    to: 'user@example.com',
                    subject: '⏰ Recordatorio: Concurso de Fotografía 2024 - Fecha límite próxima',
                    html: expect.stringContaining('Juan Pérez'),
                    text: expect.stringContaining('Juan Pérez')
                });
            });

            it('debería incluir el título del concurso en el mensaje', async () => {
                await emailService.sendDeadlineReminder(
                    'user@example.com',
                    'Juan Pérez',
                    'Concurso de Arte Digital'
                );

                const callArgs = (emailService.sendEmail as jest.Mock).mock.calls[0][0];
                expect(callArgs.html).toContain('Concurso de Arte Digital');
                expect(callArgs.subject).toContain('Concurso de Arte Digital');
            });
        });

        describe('sendEvaluationComplete', () => {
            it('debería enviar notificación de evaluación completada', async () => {
                const result = await emailService.sendEvaluationComplete(
                    'user@example.com',
                    'María García',
                    'Concurso de Video 2024'
                );

                expect(result).toBe(true);
                expect(emailService.sendEmail).toHaveBeenCalledWith({
                    to: 'user@example.com',
                    subject: '✅ Evaluación completada - Concurso de Video 2024',
                    html: expect.stringContaining('María García'),
                    text: expect.stringContaining('María García')
                });
            });
        });

        describe('sendResultsPublished', () => {
            it('debería enviar notificación de resultados publicados', async () => {
                const result = await emailService.sendResultsPublished(
                    'user@example.com',
                    'Carlos López',
                    'Concurso de Música 2024'
                );

                expect(result).toBe(true);
                expect(emailService.sendEmail).toHaveBeenCalledWith({
                    to: 'user@example.com',
                    subject: '🏆 Resultados publicados - Concurso de Música 2024',
                    html: expect.stringContaining('Carlos López'),
                    text: expect.stringContaining('Carlos López')
                });
            });
        });

        describe('sendNewContestNotification', () => {
            it('debería enviar notificación de nuevo concurso', async () => {
                const result = await emailService.sendNewContestNotification(
                    'user@example.com',
                    'Ana Martínez',
                    'Nuevo Concurso de Fotografía Nocturna'
                );

                expect(result).toBe(true);
                expect(emailService.sendEmail).toHaveBeenCalledWith({
                    to: 'user@example.com',
                    subject: '🎯 Nuevo concurso disponible - Nuevo Concurso de Fotografía Nocturna',
                    html: expect.stringContaining('Ana Martínez'),
                    text: expect.stringContaining('Ana Martínez')
                });
            });
        });
    });

    describe('testConnection', () => {
        it('debería retornar true para verificación de configuración', async () => {
            const result = await emailService.testConnection();
            expect(result).toBe(true);
        });
    });

    describe('Configuración de proveedores', () => {
        it('debería usar el email de origen correcto para SendGrid', () => {
            process.env['EMAIL_SERVICE'] = 'sendgrid';
            process.env['SENDGRID_FROM_EMAIL'] = 'sendgrid@webfestival.com';

            const service = new EmailService();
            expect(service['fromEmail']).toBe('sendgrid@webfestival.com');
        });

        it('debería usar el email de origen correcto para Resend', () => {
            process.env['EMAIL_SERVICE'] = 'resend';
            process.env['RESEND_FROM_EMAIL'] = 'resend@webfestival.com';

            const service = new EmailService();
            expect(service['fromEmail']).toBe('resend@webfestival.com');
        });

        it('debería usar email por defecto si no se especifica', () => {
            delete process.env['SENDGRID_FROM_EMAIL'];

            const service = new EmailService();
            expect(service['fromEmail']).toBe('noreply@webfestival.com');
        });
    });

    describe('Manejo de errores', () => {
        it('debería manejar errores de SendGrid correctamente', async () => {
            const sgMail = require('@sendgrid/mail');
            const mockError = new Error('SendGrid API Error');
            sgMail.send.mockRejectedValue(mockError);

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const result = await emailService.sendEmail({
                to: 'test@example.com',
                subject: 'Test',
                html: '<p>Test</p>'
            });

            expect(result).toBe(false);
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Falló el envío de email'),
                mockError
            );

            consoleSpy.mockRestore();
        });
    });

    describe('Delay entre reintentos', () => {
        it('debería implementar delay incremental', async () => {
            const delaySpy = jest.spyOn(emailService as any, 'delay').mockResolvedValue(undefined);
            const sgMail = require('@sendgrid/mail');
            sgMail.send
                .mockRejectedValueOnce(new Error('Error 1'))
                .mockRejectedValueOnce(new Error('Error 2'))
                .mockResolvedValueOnce([{ statusCode: 202 }]);

            await emailService.sendEmail({
                to: 'test@example.com',
                subject: 'Test',
                html: '<p>Test</p>'
            });

            expect(delaySpy).toHaveBeenCalledWith(1000); // Primer reintento: 1s
            expect(delaySpy).toHaveBeenCalledWith(2000); // Segundo reintento: 2s

            delaySpy.mockRestore();
        });
    });
});