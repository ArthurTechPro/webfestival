import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateImageFile(file: File): {
  isValid: boolean;
  error?: string;
} {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = parseInt(process.env.MAX_FILE_SIZE_MB || '10') * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Formato de archivo no permitido. Use JPEG, PNG o WebP.',
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `El archivo es demasiado grande. Máximo ${
        maxSize / 1024 / 1024
      }MB.`,
    };
  }

  return { isValid: true };
}