import { enhancedSocket } from '../../socket';
import { useBOEventsStore } from '../../backoffice/store/events';
import type { Event } from '../../types';

export const initializeSocketListeners = () => {
  const { setEvents } = useBOEventsStore.getState();

  // Subscribe to initial events only
  enhancedSocket.subscribeToAllEvents((initialEvents: Event[]) => {
    console.log('⚡️ [BO] Received initial events:', initialEvents);
    setEvents(initialEvents);
  });
};

export const cleanupSocketListeners = () => {
  enhancedSocket.socket.off('initialEvents');
};