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

  // Handle market-specific price updates
  socket.on('market:update', (channel: string, message: WebSocketMessage<SelectionPriceChangePayload>) => {
    try {
      console.log('⚡️ WebSocket received market update:', { channel, message });

      // Parse market ID from channel
      const match = channel.match(/\*:Market:(\d+)/);
      if (!match) {
        console.log('⚡️ WebSocket error: Invalid market channel format:', channel);
        return;
      }
      
      const marketId = parseInt(match[1], 10);
      
      if (message.type === 'SelectionPriceChange') {
        const priceChange = message.payload;
        // Broadcast the price change to all OTHER clients (excluding sender)
        socket.broadcast.emit(channel, {
          type: 'SelectionPriceChange',
          payload: {
            marketId,
            selectionId: priceChange.selectionId,
            price: priceChange.price
          }
        });
        
        console.log('⚡️ WebSocket broadcast price change:', { channel, message });
      }
    } catch (error) {
      console.error('⚡️ WebSocket error processing market update:', error);
      socket.emit('error', { message: 'Error processing market update' });
    }
  });

  // Handle event-specific updates (e.g., suspension)
  socket.on('event:update', (channel: string, message: WebSocketMessage<EventUpdatePayload>) => {
    try {
      console.log('⚡️ WebSocket received event update:', { channel, message });

      // Parse event ID from channel
      const match = channel.match(/\*:Event:(\d+)/);
      if (!match) {
        console.log('⚡️ WebSocket error: Invalid event channel format:', channel);
        return;
      }
      
      const eventId = parseInt(match[1], 10);
      
      if (message.type === 'EventStatusUpdate') {
        const eventUpdate = message.payload;
        // Broadcast the event update to all OTHER clients (excluding sender)
        socket.broadcast.emit(channel, {
          type: 'EventStatusUpdate',
          payload: {
            id: eventId,
            suspended: eventUpdate.suspended
          }
        });
        
        console.log('⚡️ WebSocket broadcast event update:', { channel, message });
      }
    } catch (error) {
      console.error('⚡️ WebSocket error processing event update:', error);
      socket.emit('error', { message: 'Error processing event update' });
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