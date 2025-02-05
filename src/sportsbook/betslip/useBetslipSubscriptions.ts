import { useEffect } from 'react';
import type { Event } from '../../types';
import { useSubscriptionManager } from '../WSMonitor';

export const useBetslipSubscriptions = (events: Event[]) => {
  const { addEventSubscription, addMarketSubscription } = useSubscriptionManager();

  useEffect(() => {
    const cleanupFns: Array<() => void> = [];

    // Setup subscriptions for all events in betslip
    events.forEach(event => {
      // Subscribe to event
      cleanupFns.push(addEventSubscription(event.id, 'event_betslip'));
      
      // Subscribe to all markets for this event
      event.markets.forEach(market => {
        cleanupFns.push(addMarketSubscription(market.id, 'market_betslip'));
      });
    });

    // Cleanup all subscriptions when component unmounts or events change
    return () => {
      cleanupFns.forEach(cleanup => cleanup());
    };
  }, [events, addEventSubscription, addMarketSubscription]); // Re-run when events or subscription functions change
};