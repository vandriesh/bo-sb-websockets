import { createServer } from 'http';
import { Server } from 'socket.io';
import type { Odds, OddsUpdate } from '../types';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Initial odds data
let odds: Odds[] = [
  {
    id: '1',
    event: 'Manchester United vs Liverpool',
    market: 'Match Winner',
    selection: 'Manchester United',
    price: 2.5,
    timestamp: Date.now()
  },
  {
    id: '2',
    event: 'Manchester United vs Liverpool',
    market: 'Match Winner',
    selection: 'Liverpool',
    price: 2.8,
    timestamp: Date.now()
  }
];

io.on('connection', (socket) => {
  console.log('Client connected');

  // Send initial odds to clients
  socket.emit('initialOdds', odds);

  // Handle odds updates from backoffice
  socket.on('updateOdds', (update: OddsUpdate) => {
    const oddIndex = odds.findIndex(odd => odd.id === update.id);
    if (oddIndex !== -1) {
      odds[oddIndex] = {
        ...odds[oddIndex],
        price: update.price,
        timestamp: Date.now()
      };
      // Broadcast the update to all clients
      io.emit('oddsUpdate', odds[oddIndex]);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});