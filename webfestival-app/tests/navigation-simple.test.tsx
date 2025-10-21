import { describe, it, expect, beforeEach, vi } from 'vitest';
import navigationService from '../src/services/navigation.service';

// Mock del servicio de navegación
vi.mock('../src/services/navigation.service');

describe('Navigation Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should exist and be importable', () => {
    expect(navigationService).toBeDefined();
  });

  it('should have required methods', () => {
    expect(typeof navigationService.getNavigationForRole).toBe('function');
    expect(typeof navigationService.filterMenuByPermissions).toBe('function');
    expect(typeof navigationService.hasPermissionForRoute).toBe('function');
    expect(typeof navigationService.generateBreadcrumbs).toBe('function');
  });
});