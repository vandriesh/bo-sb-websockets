import { io } from 'socket.io-client';
import type { Event, WebSocketMessage } from './types';

// Create socket with better configuration
const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling'],
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  timeout: 10000,
  autoConnect: true
});

// Helper to log messages to the appropriate logger
const logMessage = (source: 'bo' | 'sb', direction: 'in' | 'out', event: string, data: any) => {
  const key = `ws-logger-${source === 'bo' ? 'back-office' : 'sportsbook'}`;
  if ((window as any)[key]?.addMessage) {
    (window as any)[key].addMessage(direction, event, data);
  }
};

// Enhanced socket wrapper with better error handling
export const enhancedSocket = {
  socket,
  
  subscribeToEvent: (eventId: string, callback: (event: Event) => void) => {
    const channel = `event:${eventId}:update`;
    logMessage('sb', 'out', 'subscribe', { channel });
    
    socket.on(channel, (data) => {
      try {
        logMessage('sb', 'in', channel, data);
        callback(data);
      } catch (error) {
        console.error('Error in event subscription callback:', error);
      }
    });

    return () => {
      logMessage('sb', 'out', 'unsubscribe', { channel });
      socket.off(channel);
    };
  },
  
  emitEventUpdate: (eventId: string, data: WebSocketMessage<any>) => {
    try {
      const channel = `event:${eventId}:update`;
      logMessage('bo', 'out', channel, data);
      socket.emit(channel, data);
    } catch (error) {
      console.error('Error emitting event update:', error);
    }
  }
};

// Connection lifecycle events with better error handling
socket.on('connect', () => {
  console.log('Connected to WebSocket server with ID:', socket.id);
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

socket.on('error', (error) => {
  console.error('WebSocket error:', error);
  logMessage('bo', 'in', 'error', { error: error.message });
  logMessage('sb', 'in', 'error', { error: error.message });
});

socket.io.on('error', (error) => {
  console.error('Socket.IO error:', error);
});

socket.io.on('reconnect', (attempt) => {
  console.log('Reconnected on attempt:', attempt);
});

socket.io.on('reconnect_attempt', (attempt) => {
  console.log('Attempting to reconnect:', attempt);
});

socket.io.on('reconnect_error', (error) => {
  console.error('Reconnection error:', error);
});

socket.io.on('reconnect_failed', () => {
  console.error('Failed to reconnect');
});

export { socket };