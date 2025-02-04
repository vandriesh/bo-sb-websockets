import { enhancedSocket } from '../../socket';
import { useEventsStore } from './useEventsStore';
import type { Event } from '../../types';

let unsubscribeFunctions: (() => void)[] = [];

export const initializeSocketListeners = () => {
  const { events, updateEvent } = useEventsStore.getState();

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
  unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
  unsubscribeFunctions = [];
  console.log('⚡️ [BO] Socket listeners cleaned up');
};