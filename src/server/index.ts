import { createServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
import { mockEvents } from '../__fixtures__/mock_data';
import { getEvents } from './api/events';
import type { Event, WebSocketMessage, OddsUpdate, EventUpdate } from '../types';

const app = express();
const httpServer = createServer(app);

// Configure CORS for both HTTP and WebSocket
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST"],
  credentials: false
};

app.use(cors(corsOptions));
app.use(express.json());

// Configure Socket.IO with CORS and better error handling
const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ['websocket', 'polling'],
  pingTimeout: 30000,
  pingInterval: 25000,
  connectTimeout: 10000,
  allowEIO3: true
});

// API Routes
app.get('/api/events', getEvents);

// Use mock events data
let events: Event[] = mockEvents;

io.on('connection', (socket) => {
  console.log('⚡️ WebSocket connected:', socket.id);

  // Send initial events to the client
  socket.emit('initialEvents', events);

  // Handle event-specific updates
  socket.onAny((channel, message: WebSocketMessage<OddsUpdate | EventUpdate>) => {
    try {
      console.log('⚡️ WebSocket received:', { channel, message });

      // Parse event ID from channel
      const eventId = channel.split(':')[1];
      
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
      io.emit(`event:${eventId}:update`, event);
      console.log('⚡️ WebSocket broadcast:', { channel: `event:${eventId}:update`, event });
    } catch (error) {
      console.error('⚡️ WebSocket error processing message:', error);
      socket.emit('error', { message: 'Error processing message' });
    }
  });

  socket.on('error', (error) => {
    console.error('⚡️ WebSocket error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('⚡️ WebSocket disconnected:', { id: socket.id, reason });
  });
});

// Error handling for the HTTP server
httpServer.on('error', (error) => {
  console.error('Server error:', error);
});

const PORT = 3001;

// Start server with better error handling
try {
  httpServer.listen(PORT, () => {
    console.log(`⚡️ Server running on port ${PORT}`);
  });
} catch (error) {
  console.error('Failed to start server:', error);
  process.exit(1);
}