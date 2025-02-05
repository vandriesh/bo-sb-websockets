import { useEffect } from 'react';
import { enhancedSocket } from '../../socket';
import { useSportsBookStore } from './useEventsStore';
import { useSubscriptionStore } from '../../common/store/subscriptionStore';
import type { Event, SubscriptionSource, WsMessageType } from '../../types';

export const useEventSubscription = (event: Event, source: SubscriptionSource) => {
  const { handlePriceChange, handleEventUpdate } = useSportsBookStore();
  const subscriptionStore = useSubscriptionStore();

  useEffect(() => {
    console.log(`🎮 [${source}] Setting up subscriptions for event ${event.id}`);
    
    // Subscribe to event status updates
    const eventChannel = `*:Event:${event.id}`;
    subscriptionStore.addSource(eventChannel, source);
    
    const eventUnsubscribe = enhancedSocket.subscribeToEvent(event.id, (message: any) => {
      console.log(`🎮 [${source}] Event update for ${event.id}:`, message);
      
      if (message.type === WsMessageType.EventStatusUpdate) {
        handleEventUpdate(message.payload);
      }
    });

    // Subscribe to all markets for this event
    const marketUnsubscribes = event.markets.map(market => {
      const marketChannel = `*:Market:${market.id}`;
      subscriptionStore.addSource(marketChannel, source);
      
      console.log(`🎮 [${source}] Subscribing to market ${market.id} for event ${event.id}`);
      return enhancedSocket.subscribeToMarket(market.id, (message: any) => {
        console.log(`🎮 [${source}] Market update for ${market.id}:`, message);
        
        if (message.type === WsMessageType.SelectionPriceChange) {
          handlePriceChange(event.id, message.payload);
        }
      });
    });

    // Cleanup subscriptions when component unmounts
    return () => {
      console.log(`🎮 [${source}] Cleaning up subscriptions for event ${event.id}`);
      subscriptionStore.removeSource(eventChannel, source);
      event.markets.forEach(market => {
        subscriptionStore.removeSource(`*:Market:${market.id}`, source);
      });
      eventUnsubscribe();
      marketUnsubscribes.forEach(cleanup => cleanup());
    };
  }, [event.id, source, handlePriceChange, handleEventUpdate, subscriptionStore]);
};