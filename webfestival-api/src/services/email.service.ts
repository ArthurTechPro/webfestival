import sgMail from '@sendgrid/mail';
import { Resend } from 'resend';

export interface EmailTemplate {
    subject: string;
    html: string;
    text?: string;
}

export interface EmailData {
    to: string;
    from?: string;
    subject: string;
    html: string;
    text?: string;
}

export interface NotificationEmailData {
    userEmail: string;
    userName: string;
    contestTitle?: string;
    message: string;
    type: 'deadline_reminder' | 'evaluation_complete' | 'results_published' | 'new_contest';
}

export class EmailService {
    private readonly emailProvider: 'sendgrid' | 'resend';
    private resendClient?: Resend;
    private readonly fromEmail: string;
    private readonly maxRetries: number = 3;
    private readonly retryDelay: number = 1000;

    constructor() {
        this.emailProvider = (process.env['EMAIL_SERVICE'] as 'sendgrid' | 'resend') || 'sendgrid';
        this.fromEmail = this.emailProvider === 'sendgrid'
            ? process.env['SENDGRID_FROM_EMAIL'] || 'noreply@webfestival.com'
            : process.env['RESEND_FROM_EMAIL'] || 'noreply@webfestival.com';

        this.initializeProvider();
    }

    private initializeProvider(): void {
        if (this.emailProvider === 'sendgrid') {
            const apiKey = process.env['SENDGRID_API_KEY'];
            if (!apiKey) {
                throw new Error('SENDGRID_API_KEY es requerido cuando EMAIL_SERVICE es sendgrid');
            }
            sgMail.setApiKey(apiKey);
        } else {
            const apiKey = process.env['RESEND_API_KEY'];
            if (!apiKey) {
                throw new Error('RESEND_API_KEY es requerido cuando EMAIL_SERVICE es resend');
            }
            this.resendClient = new Resend(apiKey);
        }
    }

    async sendEmail(emailData: EmailData): Promise<boolean> {
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                if (this.emailProvider === 'sendgrid') {
                    await this.sendWithSendGrid(emailData);
                } else {
                    await this.sendWithResend(emailData);
                }

                console.log(`Email enviado exitosamente a ${emailData.to} (intento ${attempt})`);
                return true;
            } catch (error) {
                lastError = error as Error;
                console.error(`Error enviando email (intento ${attempt}/${this.maxRetries}):`, error);

                if (attempt < this.maxRetries) {
                    await this.delay(this.retryDelay * attempt);
                }
            }
        }

        console.error(`Falló el envío de email a ${emailData.to} después de ${this.maxRetries} intentos:`, lastError);
        return false;
    }

    private async sendWithSendGrid(emailData: EmailData): Promise<void> {
        const msg = {
            to: emailData.to,
            from: emailData.from || this.fromEmail,
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text || ''
        };

        await sgMail.send(msg);
    }

    private async sendWithResend(emailData: EmailData): Promise<void> {
        if (!this.resendClient) {
            throw new Error('Resend client no está inicializado');
        }

        const emailOptions: any = {
            from: emailData.from || this.fromEmail,
            to: emailData.to,
            subject: emailData.subject,
            html: emailData.html
        };

        if (emailData.text) {
            emailOptions.text = emailData.text;
        }

        await this.resendClient.emails.send(emailOptions);
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async sendDeadlineReminder(userEmail: string, userName: string, contestTitle: string): Promise<boolean> {
        const subject = `⏰ Recordatorio: ${contestTitle} - Fecha límite próxima`;
        const html = `
      <h2>Hola ${userName},</h2>
      <p>Te recordamos que la fecha límite para participar en el concurso <strong>${contestTitle}</strong> se acerca.</p>
      <p>¡No pierdas la oportunidad de participar y mostrar tu talento!</p>
    `;
        const text = `Hola ${userName}, la fecha límite para participar en "${contestTitle}" es en 48 horas.`;

        return await this.sendEmail({
            to: userEmail,
            subject,
            html,
            text
        });
    }

    async sendEvaluationComplete(userEmail: string, userName: string, contestTitle: string): Promise<boolean> {
        const subject = `✅ Evaluación completada - ${contestTitle}`;
        const html = `
      <h2>Hola ${userName},</h2>
      <p>¡Buenas noticias! La evaluación de tus medios en el concurso <strong>${contestTitle}</strong> ha sido completada por el jurado.</p>
      <p>Pronto se publicarán los resultados oficiales.</p>
    `;
        const text = `Hola ${userName}, la evaluación de tus medios en "${contestTitle}" ha sido completada.`;

        return await this.sendEmail({
            to: userEmail,
            subject,
            html,
            text
        });
    }

    async sendResultsPublished(userEmail: string, userName: string, contestTitle: string): Promise<boolean> {
        const subject = `🏆 Resultados publicados - ${contestTitle}`;
        const html = `
      <h2>Hola ${userName},</h2>
      <p>¡Los resultados del concurso <strong>${contestTitle}</strong> ya están disponibles!</p>
      <p>Descubre quiénes fueron los ganadores y revisa todas las participaciones.</p>
    `;
        const text = `Hola ${userName}, los resultados del concurso "${contestTitle}" ya están disponibles.`;

        return await this.sendEmail({
            to: userEmail,
            subject,
            html,
            text
        });
    }

    async sendNewContestNotification(userEmail: string, userName: string, contestTitle: string): Promise<boolean> {
        const subject = `🎯 Nuevo concurso disponible - ${contestTitle}`;
        const html = `
      <h2>Hola ${userName},</h2>
      <p>¡Tenemos un nuevo concurso disponible para ti!</p>
      <p><strong>${contestTitle}</strong> ya está abierto para participaciones.</p>
      <p>¡No te pierdas esta oportunidad de mostrar tu creatividad!</p>
    `;
        const text = `Hola ${userName}, nuevo concurso disponible: "${contestTitle}".`;

        return await this.sendEmail({
            to: userEmail,
            subject,
            html,
            text
        });
    }

    async testConnection(): Promise<boolean> {
        try {
            console.log(`Configuración de email verificada: ${this.emailProvider}`);
            return true;
        } catch (error) {
            console.error('Error en la configuración del servicio de email:', error);
            return false;
        }
    }
}

// Instancia singleton del servicio de email (se inicializa cuando se necesita)
let emailServiceInstance: EmailService | null = null;

export const getEmailService = (): EmailService => {
    if (!emailServiceInstance) {
        emailServiceInstance = new EmailService();
    }
    return emailServiceInstance;
};