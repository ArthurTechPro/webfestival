// Configuración de variables de entorno para pruebas
process.env['JWT_SECRET'] = 'test-jwt-secret-key-for-testing-only';
process.env['JWT_EXPIRES_IN'] = '1h';
process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-key-for-testing-only';
process.env['JWT_REFRESH_EXPIRES_IN'] = '7d';
process.env['NODE_ENV'] = 'test';
process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test_db';