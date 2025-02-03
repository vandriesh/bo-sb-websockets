import { createServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
import { mockEvents } from '../__fixtures__/mock_data';
import { getEvents } from './api/events';
import type { Event, WebSocketMessage, OddsUpdate, EventUpdate } from '../types';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/events', getEvents);

// Use mock events data
let events: Event[] = mockEvents;

io.on('connection', (socket) => {
  console.log('⚡️ WebSocket connected:', socket.id);

  // Handle event-specific updates
  socket.onAny((channel, message: WebSocketMessage<OddsUpdate | EventUpdate>) => {
    console.log('⚡️ WebSocket received:', { channel, message });

    // Parse event ID from channel
    const [prefix, eventId, suffix] = channel.split(':');
    
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
    
    // Broadcast the updated event to all clients on the event-specific channel
    io.emit(`event:${eventId}:update`, event);
    console.log('⚡️ WebSocket broadcast:', { channel: `event:${eventId}:update`, event });
  });

  socket.on('disconnect', () => {
    console.log('⚡️ WebSocket disconnected:', socket.id);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`⚡️ Server running on port ${PORT}`);
});