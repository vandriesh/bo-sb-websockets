import { useRef, useCallback } from 'react';
import type { SubscriptionSource, SubscriptionTracker, SubscriptionManager } from '../../types';
import { enhancedSocket } from '../../socket';
import { useSportsBookStore } from '../events/useEventsStore';

export const useSubscriptionManager = () => {
  const subscriptionsRef = useRef<SubscriptionManager>({
    events: new Map(),
    markets: new Map()
  });

  const store = useSportsBookStore.getState();

  const addEventSubscription = useCallback((eventId: number, source: SubscriptionSource) => {
    const { events } = subscriptionsRef.current;
    
    if (!events.has(eventId)) {
      // Create new subscription if this is the first source
      const unsubscribe = enhancedSocket.subscribeToEvent(eventId, (message) => {
        console.log(`📡 [${source}] Event ${eventId} update:`, message);
        if (message.type === 'EventStatusUpdate') {
          store.handleEventUpdate(message.payload);
        }
      });
      
      events.set(eventId, {
        sources: new Set([source]),
        unsubscribe
      });
    } else {
      // Add source to existing subscription
      events.get(eventId)!.sources.add(source);
    }
    
    return () => removeEventSubscription(eventId, source);
  }, []);

  const addMarketSubscription = useCallback((marketId: number, source: SubscriptionSource) => {
    const { markets } = subscriptionsRef.current;
    
    if (!markets.has(marketId)) {
      // Create new subscription if this is the first source
      const unsubscribe = enhancedSocket.subscribeToMarket(marketId, (message) => {
        console.log(`📡 [${source}] Market ${marketId} update:`, message);
        if (message.type === 'SelectionPriceChange') {
          // Find the event that contains this market
          const event = store.events.find(e => 
            e.markets.some(m => m.id === message.payload.marketId)
          );
          if (event) {
            store.handlePriceChange(event.id, message.payload);
          }
        }
      });
      
      markets.set(marketId, {
        sources: new Set([source]),
        unsubscribe
      });
    } else {
      // Add source to existing subscription
      markets.get(marketId)!.sources.add(source);
    }
    
    return () => removeMarketSubscription(marketId, source);
  }, []);

  const removeEventSubscription = useCallback((eventId: number, source: SubscriptionSource) => {
    const { events } = subscriptionsRef.current;
    const subscription = events.get(eventId);
    
    if (subscription) {
      subscription.sources.delete(source);
      
      // If no sources left, unsubscribe and remove
      if (subscription.sources.size === 0) {
        subscription.unsubscribe();
        events.delete(eventId);
      }
    }
  }, []);

  const removeMarketSubscription = useCallback((marketId: number, source: SubscriptionSource) => {
    const { markets } = subscriptionsRef.current;
    const subscription = markets.get(marketId);
    
    if (subscription) {
      subscription.sources.delete(source);
      
      // If no sources left, unsubscribe and remove
      if (subscription.sources.size === 0) {
        subscription.unsubscribe();
        markets.delete(marketId);
      }
    }
  }, []);

  const getSubscriptionSummary = useCallback(() => {
    const { events, markets } = subscriptionsRef.current;
    
    return {
      events: Array.from(events.entries()).map(([id, { sources }]) => ({
        channel: `*:Event:${id}`,
        sources: Array.from(sources)
      })),
      markets: Array.from(markets.entries()).map(([id, { sources }]) => ({
        channel: `*:Market:${id}`,
        sources: Array.from(sources)
      }))
    };
  }, []);

  return {
    addEventSubscription,
    addMarketSubscription,
    removeEventSubscription,
    removeMarketSubscription,
    getSubscriptionSummary
  };
};