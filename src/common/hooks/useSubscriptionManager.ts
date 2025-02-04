import { useCallback } from 'react';
import type { SubscriptionSource } from '../../types';
import { enhancedSocket } from '../../socket';
import { useSportsBookStore } from '../../sportsbook/events/useEventsStore';
import { useSubscriptionStore } from '../store/subscriptionStore';

// Track active socket subscriptions
const activeSocketSubscriptions = new Set<string>();

export const useSubscriptionManager = () => {
  const store = useSportsBookStore.getState();
  const subscriptionStore = useSubscriptionStore();

  const addEventSubscription = useCallback((eventId: number, source: SubscriptionSource) => {
    const channel = `*:Event:${eventId}`;
    
    // Add source to store
    subscriptionStore.addSource(channel, source);
    
    // Only create socket subscription if it doesn't exist yet
    if (!activeSocketSubscriptions.has(channel)) {
      console.log(`📡 Creating new socket subscription for ${channel}`);
      activeSocketSubscriptions.add(channel);
      
      enhancedSocket.subscribeToEvent(eventId, (message) => {
        if (message.type === 'EventStatusUpdate') {
          store.handleEventUpdate(message.payload);
        }
      });
    }
    
    return () => {
      subscriptionStore.removeSource(channel, source);
      
      // Only remove socket subscription if no sources left
      const remainingSources = subscriptionStore.subscriptions.get(channel);
      if (!remainingSources || remainingSources.size === 0) {
        console.log(`📡 Removing socket subscription for ${channel}`);
        activeSocketSubscriptions.delete(channel);
        enhancedSocket.socket.off(channel);
      }
    };
  }, []);

  const addMarketSubscription = useCallback((marketId: number, source: SubscriptionSource) => {
    const channel = `*:Market:${marketId}`;
    
    // Add source to store
    subscriptionStore.addSource(channel, source);
    
    // Only create socket subscription if it doesn't exist yet
    if (!activeSocketSubscriptions.has(channel)) {
      console.log(`📡 Creating new socket subscription for ${channel}`);
      activeSocketSubscriptions.add(channel);
      
      enhancedSocket.subscribeToMarket(marketId, (message) => {
        if (message.type === 'SelectionPriceChange') {
          const event = store.events.find(e => 
            e.markets.some(m => m.id === message.payload.marketId)
          );
          if (event) {
            store.handlePriceChange(event.id, message.payload);
          }
        }
      });
    }
    
    return () => {
      subscriptionStore.removeSource(channel, source);
      
      // Only remove socket subscription if no sources left
      const remainingSources = subscriptionStore.subscriptions.get(channel);
      if (!remainingSources || remainingSources.size === 0) {
        console.log(`📡 Removing socket subscription for ${channel}`);
        activeSocketSubscriptions.delete(channel);
        enhancedSocket.socket.off(channel);
      }
    };
  }, []);

  return {
    addEventSubscription,
    addMarketSubscription,
    getSubscriptionSummary: subscriptionStore.getSubscriptionSummary
  };
};