import { enhancedSocket } from '../../socket';
import { useBOEventsStore } from '../../backoffice/store/events';
import type { Event } from '../../types';

// Store cleanup functions
let unsubscribeFunctions: (() => void)[] = [];

export const initializeSocketListeners = () => {
  const { events, updateEvent } = useBOEventsStore.getState();

  // Subscribe to individual event channels
  events.forEach(event => {
    console.log(`⚡️ [BO] Setting up listener for event: ${event.id}`);
    const unsubscribe = enhancedSocket.subscribeToEvent(event.id, (updatedEvent: Event) => {
      console.log(`⚡️ [BO] Received update for event ${event.id}:`, updatedEvent);
      updateEvent(updatedEvent);
    });
    unsubscribeFunctions.push(unsubscribe);
  });
};

export const cleanupSocketListeners = () => {
  console.log('⚡️ [BO] Cleaning up socket listeners');
  
  // Clean up all subscriptions
  unsubscribeFunctions.forEach(unsubscribe => {
    unsubscribe();
  });
  unsubscribeFunctions = [];
  
  console.log('⚡️ [BO] Socket listeners cleaned up');
};