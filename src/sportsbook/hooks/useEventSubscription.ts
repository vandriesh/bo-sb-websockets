import { useEffect } from 'react';
import { enhancedSocket } from '../../socket';
import { useSportsBookStore } from '../events/useEventsStore';
import type { Event, SubscriptionSource } from '../../types';
import { WsMessageType } from '../../types';

export const useEventSubscription = (event: Event | undefined, source: SubscriptionSource) => {
  const store = useSportsBookStore.getState();
  
  useEffect(() => {
    if (!event) return;

    console.log(`🎮 [${source}] Setting up subscriptions for event ${event.id}`);
    
    // Subscribe to event status updates
    const eventUnsubscribe = enhancedSocket.subscribeToEvent(event.id, (message) => {
      console.log(`🎮 [${source}] Event update for ${event.id}:`, message);
      
      if (message.type === WsMessageType.EventStatusUpdate) {
        store.handleEventUpdate(message.payload);
      }
    });

    // Subscribe to all markets for this event
    const marketUnsubscribes = event.markets.map(market => {
      console.log(`🎮 [${source}] Subscribing to market ${market.id} for event ${event.id}`);
      return enhancedSocket.subscribeToMarket(market.id, (message) => {
        console.log(`🎮 [${source}] Market update for ${market.id}:`, message);
        
        if (message.type === WsMessageType.SelectionPriceChange) {
          store.handlePriceChange(event.id, message.payload);
        }
      });
    });

    // Cleanup subscriptions when component unmounts
    return () => {
      console.log(`🎮 [${source}] Cleaning up subscriptions for event ${event.id}`);
      eventUnsubscribe();
      marketUnsubscribes.forEach(cleanup => cleanup());
    };
  }, [event?.id, source]); // Only depend on event ID and source
};