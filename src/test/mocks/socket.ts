import { vi } from 'vitest';

export const mockSocket = {
  socket: {
    off: vi.fn(),
    on: vi.fn(),
    emit: vi.fn()
  },
  subscribeToEvent: vi.fn(() => () => {}),
  subscribeToMarket: vi.fn(() => () => {}),
  getActiveSubscriptions: vi.fn(() => []),
  cleanupAllSubscriptions: vi.fn()
};