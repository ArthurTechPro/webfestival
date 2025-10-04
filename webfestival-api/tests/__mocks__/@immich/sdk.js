/**
 * Mock del SDK de Immich para pruebas
 */

const mockInit = jest.fn();
const mockGetServerVersion = jest.fn().mockResolvedValue({
  version: '1.0.0',
  versionHash: 'mock-hash'
});

const mockDefaults = {
  baseUrl: '',
  headers: {}
};

module.exports = {
  init: mockInit,
  getServerVersion: mockGetServerVersion,
  defaults: mockDefaults
};