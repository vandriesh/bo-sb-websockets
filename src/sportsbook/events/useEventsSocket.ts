import { enhancedSocket } from '../../socket';
import { useSportsBookStore } from './useEventsStore';
import { WsMessageType } from '../../types';

let marketSubscriptions: (() => void)[] = [];
let eventSubscriptions: (() => void)[] = [];

export const initializeSocketListeners = () => {
  const store = useSportsBookStore.getState();
  const { events, handlePriceChange, handleEventUpdate } = store;

  // Subscribe to all unique markets
  const uniqueMarkets = new Set(events.flatMap(event => 
    event.markets.map(market => market.id)
  ));

  uniqueMarkets.forEach(marketId => {
    console.log(`🎮 [SB] Setting up listener for market: ${marketId}`);
    const unsubscribe = enhancedSocket.subscribeToMarket(marketId, (message: any) => {
      console.log(`🎮 [SB] Received update for market ${marketId}:`, message);
      
      if (message.type === WsMessageType.SelectionPriceChange) {
        // Find the event that contains this market
        const event = events.find(e => 
          e.markets.some(m => m.id === message.payload.marketId)
        );
        if (event) {
          handlePriceChange(event.id, message.payload);
        }
      }
    });
    marketSubscriptions.push(unsubscribe);
  });

  // Subscribe to events for suspension updates
  events.forEach(event => {
    console.log(`🎮 [SB] Setting up listener for event: ${event.id}`);
    const unsubscribe = enhancedSocket.subscribeToEvent(event.id, (message: any) => {
      console.log(`🎮 [SB] Received update for event ${event.id}:`, message);
      
      if (message.type === WsMessageType.EventStatusUpdate) {
        handleEventUpdate(message.payload);
      }
    });
    eventSubscriptions.push(unsubscribe);
  });
};

export const cleanupSocketListeners = () => {
  console.log('🎮 [SB] Cleaning up socket listeners');
  marketSubscriptions.forEach(unsubscribe => unsubscribe());
  eventSubscriptions.forEach(unsubscribe => unsubscribe());
  marketSubscriptions = [];
  eventSubscriptions = [];
};