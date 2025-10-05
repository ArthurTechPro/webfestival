/// <reference types="jest" />

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInstanceOf(expected: any): R;
      toBeGreaterThan(expected: number): R;
      toBeGreaterThanOrEqual(expected: number): R;
      toBeLessThanOrEqual(expected: number): R;
      toBeDefined(): R;
    }
  }
}

export {};