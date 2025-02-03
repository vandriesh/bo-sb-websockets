import { enhancedSocket } from '../../socket';
import { useSportsBookStore } from '../../sportsbook/store';
import type { Event } from '../../types';

// Store timeouts for each selection
const priceChangeTimeouts: { [key: string]: NodeJS.Timeout } = {};

export const initializeSocketListeners = () => {
  const store = useSportsBookStore.getState();
  const { setEvents, updateEvent, setPriceChange, clearPriceChange, updateSuspendedState } = store;

  // Subscribe to initial events
  enhancedSocket.subscribeToAllEvents((initialEvents: Event[]) => {
    console.log('🎮 [SB] Received initial events:', initialEvents);
    setEvents(initialEvents);
    
    // Set up listeners for each event after receiving initial events
    initialEvents.forEach(event => {
      console.log(`🎮 [SB] Setting up listener for event: ${event.id}`);
      enhancedSocket.subscribeToEvent(event.id, (updatedEvent: Event) => {
        console.log('🎮 [SB] Received event update:', updatedEvent);
        const currentEvent = useSportsBookStore.getState().events.find(e => e.id === updatedEvent.id);
        
        if (currentEvent) {
          console.log('🎮 [SB] Current event state:', currentEvent);
          
          // Compare selections to determine price changes
          updatedEvent.selections.forEach(newSel => {
            const oldSel = currentEvent.selections.find(s => s.id === newSel.id);
            if (oldSel && oldSel.price !== newSel.price) {
              const direction = newSel.price > oldSel.price ? 'up' : 'down';
              console.log(`🎮 [SB] Price change detected for selection ${newSel.id}:`, {
                old: oldSel.price,
                new: newSel.price,
                direction
              });

              // Clear existing timeout if there is one
              if (priceChangeTimeouts[newSel.id]) {
                console.log(`🎮 [SB] Clearing existing timeout for selection ${newSel.id}`);
                clearTimeout(priceChangeTimeouts[newSel.id]);
              }
              
              // Set new price change and timeout
              setPriceChange(newSel.id, direction);
              console.log(`🎮 [SB] Set price change indicator for selection ${newSel.id}:`, direction);
              
              priceChangeTimeouts[newSel.id] = setTimeout(() => {
                console.log(`🎮 [SB] Clearing price change indicator for selection ${newSel.id}`);
                clearPriceChange(newSel.id);
                delete priceChangeTimeouts[newSel.id];
              }, 2000);
            }
          });
          
          // Update event in store
          updateEvent(updatedEvent);
          console.log('🎮 [SB] Event state updated:', updatedEvent);

          // Handle suspension state changes
          if (updatedEvent.suspended !== currentEvent.suspended) {
            console.log('🎮 [SB] Suspension state changed:', {
              eventId: updatedEvent.id,
              oldState: currentEvent.suspended,
              newState: updatedEvent.suspended
            });
            updateSuspendedState(updatedEvent.id, updatedEvent.suspended);
          }
        }
      });
    });
  });
};

export const cleanupSocketListeners = () => {
  console.log('🎮 [SB] Cleaning up socket listeners');
  
  // Clear all existing timeouts
  Object.entries(priceChangeTimeouts).forEach(([id, timeout]) => {
    console.log(`🎮 [SB] Clearing timeout for selection ${id}`);
    clearTimeout(timeout);
  });
  
  // Clean up all subscriptions
  useSportsBookStore.getState().events.forEach(event => {
    enhancedSocket.socket.off(`*:Event:${event.id}`);
  });
  enhancedSocket.socket.off('initialEvents');
  
  console.log('🎮 [SB] Socket listeners cleaned up');
};