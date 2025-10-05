import { Request, Response, NextFunction } from 'express';
import express from 'express';

/**
 * Middleware para manejar webhooks de Stripe que requieren el body raw
 * Debe aplicarse antes del middleware express.json()
 */
export const rawBodyMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.originalUrl === '/api/v1/subscriptions/webhooks/stripe') {
    let data = '';
    req.setEncoding('utf8');

    req.on('data', (chunk) => {
      data += chunk;
    });

    req.on('end', () => {
      req.body = data;
      next();
    });
  } else {
    next();
  }
};

/**
 * Middleware específico para rutas de webhook que necesitan el body raw
 */
export const webhookBodyParser = express.raw({ type: 'application/json' });

/**
 * Middleware para verificar que el webhook viene de Stripe
 */
export const verifyStripeWebhook = (req: Request, res: Response, next: NextFunction): void => {
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    res.status(400).json({
      success: false,
      error: 'Firma de webhook de Stripe faltante'
    });
    return;
  }

  next();
};

/**
 * Middleware para verificar que el webhook viene de PayPal
 */
export const verifyPayPalWebhook = (req: Request, res: Response, next: NextFunction): void => {
  // PayPal envía varios headers para verificación
  const requiredHeaders = [
    'paypal-auth-algo',
    'paypal-transmission-id',
    'paypal-cert-id',
    'paypal-transmission-sig',
    'paypal-transmission-time'
  ];

  const missingHeaders = requiredHeaders.filter(header => !req.headers[header]);

  if (missingHeaders.length > 0) {
    res.status(400).json({
      success: false,
      error: 'Headers de webhook de PayPal faltantes',
      missing: missingHeaders
    });
    return;
  }

  next();
};

/**
 * Middleware para logging de webhooks
 */
export const logWebhook = (provider: 'stripe' | 'paypal') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    console.log(`📨 Webhook recibido de ${provider.toUpperCase()}:`, {
      timestamp: new Date().toISOString(),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      contentType: req.headers['content-type'],
      bodySize: req.body ? JSON.stringify(req.body).length : 0
    });

    next();
  };
};