import { enhancedSocket } from '../../socket';
import { useSportsBookStore } from './useEventsStore';
import { WsMessageType } from '../../types';

let unsubscribeFunctions: (() => void)[] = [];

export const initializeSocketListeners = () => {
  const store = useSportsBookStore.getState();
  const { events, handlePriceChange, handleEventUpdate } = store;

  events.forEach(event => {
    console.log(`🎮 [SB] Setting up listener for event: ${event.id}`);
    const unsubscribe = enhancedSocket.subscribeToEvent(event.id, (message: any) => {
      console.log(`🎮 [SB] Received update for event ${event.id}:`, message);
      
      if (message.type === WsMessageType.SelectionPriceChange) {
        handlePriceChange(event.id, message.payload);
      } else if (message.type === WsMessageType.EventUpdate) {
        handleEventUpdate(message.payload);
      }
    });
    unsubscribeFunctions.push(unsubscribe);
  });
};

export const cleanupSocketListeners = () => {
  console.log('🎮 [SB] Cleaning up socket listeners');
  unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
  unsubscribeFunctions = [];
};