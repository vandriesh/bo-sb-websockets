import { io } from 'socket.io-client';
import type { Event, EventUpdate } from './types';

// Force WebSocket transport only, no polling
const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling'],
});

// Helper to format event-specific channels
const formatEventChannel = (eventId: string) => `*:Event:${eventId}`;

// Enhanced socket wrapper with event-specific subscriptions
export const enhancedSocket = {
  socket,
  
  // Subscribe to specific event updates
  subscribeToEvent: (eventId: string, callback: (event: Event) => void) => {
    const channel = formatEventChannel(eventId);
    socket.on(channel, callback);
    return () => socket.off(channel);
  },
  
  // Emit event-specific updates (for back office)
  emitEventUpdate: (eventId: string, data: Partial<Event>) => {
    const channel = formatEventChannel(eventId);
    socket.emit(channel, data);
  },
  
  // Subscribe to all events (initial load)
  subscribeToAllEvents: (callback: (events: Event[]) => void) => {
    socket.on('initialEvents', callback);
    return () => socket.off('initialEvents');
  }
};

// Connection lifecycle events
socket.on('connect', () => {
  console.log('Connected to WebSocket server with ID:', socket.id);
  console.log('Transport type:', socket.io.engine.transport.name);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected from WebSocket server:', reason);
});

socket.on('connect_error', (error) => {
  console.error('WebSocket connection error:', error);
  console.log('Current transport:', socket.io.engine.transport?.name);
  console.log('Available transports:', socket.io.engine.opts.transports);
});

// Debug logging only in development
if (import.meta.env.DEV) {
  socket.onAny((eventName, ...args) => {
    console.log('⬇️ Received event:', eventName, args);
  });

  socket.onAnyOutgoing((eventName, ...args) => {
    console.log('⬆️ Sending event:', eventName, args);
  });
}

export { socket };