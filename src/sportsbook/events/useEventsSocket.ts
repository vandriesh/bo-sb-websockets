import { enhancedSocket } from '../../socket';
import { useSportsBookStore } from './useEventsStore';
import type { Event } from '../../types';

const priceChangeTimeouts: { [key: string]: NodeJS.Timeout } = {};
let unsubscribeFunctions: (() => void)[] = [];

export const initializeSocketListeners = () => {
  const store = useSportsBookStore.getState();
  const { events, updateEvent, setPriceChange, clearPriceChange } = store;

  events.forEach(event => {
    console.log(`🎮 [SB] Setting up listener for event: ${event.id}`);
    const unsubscribe = enhancedSocket.subscribeToEvent(event.id, (updatedEvent: Event) => {
      console.log(`🎮 [SB] Received update for event ${event.id}:`, updatedEvent);
      const currentEvent = useSportsBookStore.getState().events.find(e => e.id === updatedEvent.id);
      
      if (currentEvent) {
        updatedEvent.selections.forEach(newSel => {
          const oldSel = currentEvent.selections.find(s => s.id === newSel.id);
          if (oldSel && oldSel.price !== newSel.price) {
            const direction = newSel.price > oldSel.price ? 'up' : 'down';
            
            if (priceChangeTimeouts[newSel.id]) {
              clearTimeout(priceChangeTimeouts[newSel.id]);
            }
            
            setPriceChange(newSel.id, direction);
            
            priceChangeTimeouts[newSel.id] = setTimeout(() => {
              clearPriceChange(newSel.id);
              delete priceChangeTimeouts[newSel.id];
            }, 2000);
          }
        });
        
        updateEvent(updatedEvent);
      }
    });
    unsubscribeFunctions.push(unsubscribe);
  });
};

export const cleanupSocketListeners = () => {
  console.log('🎮 [SB] Cleaning up socket listeners');
  
  unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
  unsubscribeFunctions = [];
  
  Object.entries(priceChangeTimeouts).forEach(([id, timeout]) => {
    clearTimeout(timeout);
    delete priceChangeTimeouts[id];
  });
};