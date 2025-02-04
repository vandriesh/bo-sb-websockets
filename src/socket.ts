import { io } from 'socket.io-client';
import type { Event, WebSocketMessage } from './types';

// Create socket with WebContainer-compatible configuration
const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling'],
  path: '/socket.io/',
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

  // Handle market channels
  const marketMatch = channel.match(/^\*:Market:(\d+)$/);
  if (marketMatch) {
    const marketId = parseInt(marketMatch[1], 10);
    return marketId >= 1000 && marketId <= 9999; // Market IDs: 1000-9999
  }

  // Handle event channels (for suspension updates)
  const eventMatch = channel.match(/^\*:Event:(\d+)$/);
  if (eventMatch) {
    const eventId = parseInt(eventMatch[1], 10);
    return eventId >= 1 && eventId <= 999; // Event IDs: 1-999
  }

  return false;
};

// Enhanced socket wrapper with basic validation and connection state
export const enhancedSocket = {
  socket,
  
  subscribeToMarket: (marketId: number, callback: (data: any) => void) => {
    const channel = `*:Market:${marketId}`;
    
    if (!validateChannel(channel)) {
      console.error('Invalid market channel format:', channel);
      return () => {};
    }
    
    logMessage('sb', 'out', 'subscribe', { channel });
    
    socket.on(channel, (data) => {
      try {
        logMessage('sb', 'in', channel, data);
        callback(data);
      } catch (error) {
        console.error('Error in market subscription callback:', error);
      }
    });

    return () => {
      logMessage('sb', 'out', 'unsubscribe', { channel });
      socket.off(channel);
    };
  },

  subscribeToEvent: (eventId: number, callback: (data: any) => void) => {
    const channel = `*:Event:${eventId}`;
    
    if (!validateChannel(channel)) {
      console.error('Invalid event channel format:', channel);
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
  
  emitPriceUpdate: (marketId: number, data: WebSocketMessage<any>) => {
    try {
      const channel = `*:Market:${marketId}`;
      
      if (!validateChannel(channel)) {
        throw new Error('Invalid market channel format');
      }
      
      logMessage('bo', 'out', channel, data);
      socket.emit('market:update', channel, data);
    } catch (error) {
      console.error('Error emitting price update:', error);
      throw error;
    }
  },

  emitEventUpdate: (eventId: number, data: WebSocketMessage<any>) => {
    try {
      const channel = `*:Event:${eventId}`;
      
      if (!validateChannel(channel)) {
        throw new Error('Invalid event channel format');
      }
      
      logMessage('bo', 'out', channel, data);
      socket.emit('event:update', channel, data);
    } catch (error) {
      console.error('Error emitting event update:', error);
      throw error;
    }
  }
};

// Connection lifecycle events with better error handling
socket.on('connect', () => {
  console.log('Connected to WebSocket server with ID:', socket.id);
  logMessage('bo', 'in', 'connect', { id: socket.id });
  logMessage('sb', 'in', 'connect', { id: socket.id });
});

socket.on('connect_error', (error) => {
  console.warn('WebSocket connection error:', error.message);
  logMessage('bo', 'in', 'connect_error', { error: error.message });
  logMessage('sb', 'in', 'connect_error', { error: error.message });
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

socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected to WebSocket server after', attemptNumber, 'attempts');
  logMessage('bo', 'in', 'reconnect', { attemptNumber });
  logMessage('sb', 'in', 'reconnect', { attemptNumber });
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log('Attempting to reconnect:', attemptNumber);
});

socket.on('reconnect_error', (error) => {
  console.warn('WebSocket reconnection error:', error.message);
});

socket.on('reconnect_failed', () => {
  console.error('WebSocket reconnection failed');
});

export { socket };