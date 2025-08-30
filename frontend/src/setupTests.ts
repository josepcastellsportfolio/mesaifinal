import '@testing-library/jest-dom';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as unknown as typeof IntersectionObserver;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as unknown as typeof ResizeObserver;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (globalThis as any).jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: (globalThis as any).jest.fn(), // deprecated
    removeListener: (globalThis as any).jest.fn(), // deprecated
    addEventListener: (globalThis as any).jest.fn(),
    removeEventListener: (globalThis as any).jest.fn(),
    dispatchEvent: (globalThis as any).jest.fn(),
  })),
});
