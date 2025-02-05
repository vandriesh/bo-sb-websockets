import { useEffect } from 'react';
import { enhancedSocket } from '../../socket';
import type { Event } from '../../types';

export const useEventSubscription = (event: Event) => {
  useEffect(() => {
    console.log(`📡 Setting up subscriptions for event ${event.id}`);
    
    // Subscribe to all markets for this event
    const marketUnsubscribes = event.markets.map(market => {
      console.log(`📡 Subscribing to market ${market.id} for event ${event.id}`);
      return enhancedSocket.subscribeToMarket(market.id, (message: any) => {
        console.log(`📡 Received market update for ${market.id}:`, message);
      });
    });

    // Subscribe to event status updates
    console.log(`📡 Subscribing to event ${event.id} status updates`);
    const eventUnsubscribe = enhancedSocket.subscribeToEvent(event.id, (message: any) => {
      console.log(`📡 Received event update for ${event.id}:`, message);
    });

    // Cleanup subscriptions when component unmounts
    return () => {
      console.log(`📡 Cleaning up subscriptions for event ${event.id}`);
      marketUnsubscribes.forEach(unsubscribe => unsubscribe());
      eventUnsubscribe();
    };
  }, [event.id]); // Only re-run if event ID changes
};