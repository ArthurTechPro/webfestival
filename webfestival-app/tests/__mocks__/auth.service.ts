import { vi } from 'vitest';

export const authService = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  verifyToken: vi.fn(),
  refreshToken: vi.fn(),
  getToken: vi.fn(),
  getRefreshToken: vi.fn(),
  getStoredUser: vi.fn(),
  isAuthenticated: vi.fn(),
  hasRole: vi.fn(),
  hasAnyRole: vi.fn(),
};