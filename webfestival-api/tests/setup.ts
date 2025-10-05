// Configuración de variables de entorno para pruebas
process.env['JWT_SECRET'] = 'test-jwt-secret-key-for-testing-only';
process.env['JWT_EXPIRES_IN'] = '1h';
process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-key-for-testing-only';
process.env['JWT_REFRESH_EXPIRES_IN'] = '7d';
process.env['NODE_ENV'] = 'test';
process.env['DATABASE_URL'] = 'postgresql://postgres:wasi3355@localhost:5432/webfestival_test_db';

// Variables de entorno para PayPal (valores de prueba)
process.env['PAYPAL_CLIENT_ID'] = 'test-paypal-client-id';
process.env['PAYPAL_CLIENT_SECRET'] = 'test-paypal-client-secret';

// Variables de entorno para Stripe (valores de prueba)
process.env['STRIPE_SECRET_KEY'] = 'sk_test_test-stripe-secret-key';
process.env['STRIPE_WEBHOOK_SECRET'] = 'whsec_test-webhook-secret';