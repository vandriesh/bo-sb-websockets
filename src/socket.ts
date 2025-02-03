import { io } from 'socket.io-client';
import type { Event, WebSocketMessage } from './types';

// Force WebSocket transport only, no polling
const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling'],
});

// Helper to log messages to the appropriate logger
const logMessage = (source: 'bo' | 'sb', direction: 'in' | 'out', event: string, data: any) => {
  const key = `ws-logger-${source === 'bo' ? 'back-office' : 'sportsbook'}`;
  if ((window as any)[key]?.addMessage) {
    (window as any)[key].addMessage(direction, event, data);
  }
};

// Enhanced socket wrapper with event-specific subscriptions
export const enhancedSocket = {
  socket,
  
  // Subscribe to specific event updates
  subscribeToEvent: (eventId: string, callback: (event: Event) => void) => {
    const channel = `event:${eventId}:update`;
    // Log subscription
    logMessage('sb', 'out', 'subscribe', { channel });
    
    socket.on(channel, (data) => {
      logMessage('sb', 'in', channel, data);
      callback(data);
    });
    return () => {
      logMessage('sb', 'out', 'unsubscribe', { channel });
      socket.off(channel);
    };
  },
  
  // Emit event-specific updates (for back office)
  emitEventUpdate: (eventId: string, data: WebSocketMessage<any>) => {
    const channel = `event:${eventId}:update`;
    logMessage('bo', 'out', channel, data);
    socket.emit(channel, data);
  }
};

// Connection lifecycle events
socket.on('connect', () => {
  console.log('Connected to WebSocket server with ID:', socket.id);
  console.log('Transport type:', socket.io.engine.transport.name);
  logMessage('bo', 'in', 'connect', { id: socket.id });
  logMessage('sb', 'in', 'connect', { id: socket.id });
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected from WebSocket server:', reason);
  logMessage('bo', 'in', 'disconnect', { reason });
  logMessage('sb', 'in', 'disconnect', { reason });
});

socket.on('connect_error', (error) => {
  console.error('WebSocket connection error:', error);
  logMessage('bo', 'in', 'connect_error', { error: error.message });
  logMessage('sb', 'in', 'connect_error', { error: error.message });
});

export { socket };