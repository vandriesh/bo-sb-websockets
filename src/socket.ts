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

// Simple channel validation
const validateChannel = (channel: string): boolean => {
  // Handle system channels
  if (['connect', 'disconnect', 'error', 'reconnect'].includes(channel)) {
    return true;
  }

  // Handle event channels
  const match = channel.match(/^\*:Event:(\d+)$/);
  if (!match) return false;
  
  const eventId = parseInt(match[1], 10);
  return eventId >= 1 && eventId <= 999; // Event IDs: 1-999
};

// Enhanced socket wrapper with basic validation
export const enhancedSocket = {
  socket,
  
  subscribeToEvent: (eventId: number, callback: (event: Event) => void) => {
    const channel = `*:Event:${eventId}`;
    
    // Validate channel format
    if (!validateChannel(channel)) {
      console.error('Invalid channel format:', channel);
      return () => {};
    }
    
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
  
  emitEventUpdate: (eventId: number, data: WebSocketMessage<any>) => {
    try {
      const channel = `*:Event:${eventId}`;
      
      // Validate channel
      if (!validateChannel(channel)) {
        throw new Error('Invalid channel format');
      }
      
      logMessage('bo', 'out', channel, data);
      // Changed to use 'event:update' event name to match server listener
      socket.emit('event:update', channel, data);
    } catch (error) {
      console.error('Error emitting event update:', error);
      throw error;
    }
  }
};

// Connection lifecycle events
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

socket.on('error', (error) => {
  console.error('WebSocket error:', error);
  logMessage('bo', 'in', 'error', { error: error.message });
  logMessage('sb', 'in', 'error', { error: error.message });
});

export { socket };