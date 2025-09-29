import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Global test setup
beforeAll(async () => {
  // Setup test database or mock services if needed
});

afterAll(async () => {
  // Cleanup after all tests
});

// Increase timeout for integration tests
jest.setTimeout(30000);