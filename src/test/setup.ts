import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn()
  }))
}));

// Mock console methods to reduce noise in tests
console.log = vi.fn();
console.error = vi.fn();
console.warn = vi.fn();

// Add custom matchers
declare global {
  namespace Vi {
    interface JestMatchers<T> {
      toBeInTheDocument(): boolean;
      toHaveClass(className: string): boolean;
      toHaveTextContent(text: string): boolean;
    }
  }
}