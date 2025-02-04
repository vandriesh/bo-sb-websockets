import { createServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
import { getEvents } from './api/events';
import type { Event, WebSocketMessage, SelectionPriceChangePayload, EventUpdatePayload } from '../types';

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

io.on('connection', (socket) => {
  console.log('⚡️ WebSocket connected:', socket.id);

  // Handle event-specific updates
  socket.on('event:update', (channel: string, message: WebSocketMessage<SelectionPriceChangePayload | EventUpdatePayload>) => {
    try {
      console.log('⚡️ WebSocket received update:', { channel, message });

      // Parse event ID from channel
      const match = channel.match(/\*:Event:(\d+)/);
      if (!match) {
        console.log('⚡️ WebSocket error: Invalid channel format:', channel);
        return;
      }
      
      const eventId = parseInt(match[1], 10);
      
      console.log('⚡️ WebSocket processing event update:', { eventId, message });
      
      switch (message.type) {
        case 'SelectionPriceChange': {
          const priceChange = message.payload as SelectionPriceChangePayload;
          // Broadcast the price change to all OTHER clients (excluding sender)
          socket.broadcast.emit(`*:Event:${eventId}`, {
            type: 'SelectionPriceChange',
            payload: {
              eventId,
              marketId: priceChange.marketId,
              selectionId: priceChange.selectionId,
              price: priceChange.price
            }
          });
          break;
        }
        
        case 'EVENT_UPDATE': {
          const eventUpdate = message.payload as EventUpdatePayload;
          // Broadcast the event update to all OTHER clients (excluding sender)
          socket.broadcast.emit(`*:Event:${eventId}`, {
            type: 'EVENT_UPDATE',
            payload: {
              id: eventId,
              suspended: eventUpdate.suspended
            }
          });
          break;
        }
        
        default:
          console.log('⚡️ WebSocket unknown message type:', message);
          return;
      }
      
      console.log('⚡️ WebSocket broadcast:', { channel: `*:Event:${eventId}`, message });
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