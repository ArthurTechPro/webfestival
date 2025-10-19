import { z } from 'zod';

// Esquema de validación para la configuración de Immich
const immichConfigSchema = z.object({
  serverUrl: z.string().default('http://localhost:2283'),
  apiKey: z.string().default('demo-key'),
  timeout: z.number().positive().default(30000), // 30 segundos por defecto
  retryAttempts: z.number().min(0).default(1),
  retryDelay: z.number().positive().default(1000), // 1 segundo por defecto
});

export type ImmichConfig = z.infer<typeof immichConfigSchema>;

/**
 * Configuración de conexión con Immich
 * Valida las variables de entorno necesarias para la conexión
 */
export const immichConfig: ImmichConfig = immichConfigSchema.parse({
  serverUrl: process.env['IMMICH_SERVER_URL'] || 'http://localhost:2283',
  apiKey: process.env['IMMICH_API_KEY'] || 'demo-key',
  timeout: parseInt(process.env['IMMICH_TIMEOUT'] || '30000'),
  retryAttempts: parseInt(process.env['IMMICH_RETRY_ATTEMPTS'] || '1'),
  retryDelay: parseInt(process.env['IMMICH_RETRY_DELAY'] || '1000'),
});

/**
 * Valida que la configuración de Immich esté completa
 * @throws Error si la configuración es inválida
 */
export function validateImmichConfig(): void {
  try {
    immichConfigSchema.parse({
      serverUrl: process.env['IMMICH_SERVER_URL'],
      apiKey: process.env['IMMICH_API_KEY'],
      timeout: parseInt(process.env['IMMICH_TIMEOUT'] || '30000'),
      retryAttempts: parseInt(process.env['IMMICH_RETRY_ATTEMPTS'] || '3'),
      retryDelay: parseInt(process.env['IMMICH_RETRY_DELAY'] || '1000'),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Configuración de Immich inválida: ${messages.join(', ')}`);
    }
    throw error;
  }
}