import { createServer } from 'http';
import { Server } from 'socket.io';
import { mockEvents } from '../__fixtures__/mock_data';
import type { Event, WebSocketMessage, OddsUpdate, EventUpdate } from '../types';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Helper to format event-specific channels
const formatEventChannel = (eventId: string) => `*:Event:${eventId}`;

// Use mock events data
let events: Event[] = mockEvents;

io.on('connection', (socket) => {
  console.log('⚡️ WebSocket connected:', socket.id);

  // Send initial events to clients
  socket.emit('initialEvents', events);
  console.log('⚡️ WebSocket sent:', { type: 'initialEvents', to: socket.id });

  // Handle event-specific updates
  socket.onAny((channel, message: WebSocketMessage<OddsUpdate | EventUpdate>) => {
    console.log('⚡️ WebSocket received:', { channel, message });

    // Only handle event-specific channels
    if (!channel.startsWith('*:Event:')) {
      console.log('⚡️ WebSocket not handled:', { channel, message });
      return;
    }

    const eventId = channel.split(':')[2];
    const event = events.find(e => e.id === eventId);
    
    if (!event) {
      console.log('⚡️ WebSocket error: Event not found:', eventId);
      return;
    }

    console.log('⚡️ WebSocket processing event update:', { eventId, message });
    
    switch (message.type) {
      case 'ODDS_UPDATE': {
        const oddsUpdate = message.payload as OddsUpdate;
        oddsUpdate.selections.forEach(update => {
          const selection = event.selections.find(sel => sel.id === update.id);
          if (selection) {
            selection.price = update.price;
            console.log('⚡️ WebSocket updated selection price:', { 
              eventId, 
              selectionId: update.id, 
              newPrice: update.price 
            });
          }
        });
        break;
      }
      
      case 'EVENT_UPDATE': {
        const eventUpdate = message.payload as EventUpdate;
        event.suspended = eventUpdate.suspended;
        console.log('⚡️ WebSocket updated event suspension:', { 
          eventId, 
          suspended: eventUpdate.suspended 
        });
        break;
      }
      
      default:
        console.log('⚡️ WebSocket unknown message type:', message);
        return;
    }
    
    event.timestamp = Date.now();
    
    // Broadcast the updated event to all clients
    const eventChannel = formatEventChannel(eventId);
    io.emit(eventChannel, event);
    console.log('⚡️ WebSocket broadcast:', { channel: eventChannel, event });
  });

  socket.on('disconnect', () => {
    console.log('⚡️ WebSocket disconnected:', socket.id);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`⚡️ WebSocket server running on port ${PORT}`);
});