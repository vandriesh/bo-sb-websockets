import { describe, test, expect, beforeEach } from 'vitest';
import { useSubscriptionStore } from '../subscriptionStore';
import type { SubscriptionSource } from '../../types';

// Helper to format subscriptions as ASCII text
const formatSubscriptions = (store: ReturnType<typeof useSubscriptionStore.getState>) => {
  const summary = store.getSubscriptionSummary();
  return summary
    .map(({ channel, sources }) => `${channel} : ${Array.from(sources).sort().join(', ')}`)
    .sort()
    .join('\n');
};

describe('Subscription Store', () => {
  beforeEach(() => {
    useSubscriptionStore.getState().clear();
  });

  test('should add subscriptions to channels', () => {
    const store = useSubscriptionStore.getState();
    
    store.addSubscription('*:Event:1', 'event_list');
    
    expect(formatSubscriptions(store)).toBe(
      '*:Event:1 : event_list'
    );
  });

  test('should handle multiple sources for same channel', () => {
    const store = useSubscriptionStore.getState();
    
    store.addSubscription('*:Event:1', 'event_list');
    store.addSubscription('*:Event:1', 'event_betslip');
    
    expect(formatSubscriptions(store)).toBe(
      '*:Event:1 : event_betslip, event_list'
    );
  });

  test('should handle multiple channels', () => {
    const store = useSubscriptionStore.getState();
    
    store.addSubscription('*:Event:1', 'event_list');
    store.addSubscription('*:Market:1000', 'market_list');
    store.addSubscription('*:Event:2', 'event_betslip');
    
    expect(formatSubscriptions(store)).toBe([
      '*:Event:1 : event_list',
      '*:Event:2 : event_betslip',
      '*:Market:1000 : market_list'
    ].join('\n'));
  });

  test('should remove subscriptions from channels', () => {
    const store = useSubscriptionStore.getState();
    
    store.addSubscription('*:Event:1', 'event_list');
    store.addSubscription('*:Event:1', 'event_betslip');
    store.removeSubscription('*:Event:1', 'event_list');
    
    expect(formatSubscriptions(store)).toBe(
      '*:Event:1 : event_betslip'
    );
  });

  test('should remove channel when last source is removed', () => {
    const store = useSubscriptionStore.getState();
    
    store.addSubscription('*:Event:1', 'event_list');
    store.removeSubscription('*:Event:1', 'event_list');
    
    expect(formatSubscriptions(store)).toBe('');
  });

  test('should prevent duplicate sources', () => {
    const store = useSubscriptionStore.getState();
    
    store.addSubscription('*:Event:1', 'event_list');
    store.addSubscription('*:Event:1', 'event_list'); // Duplicate
    
    expect(formatSubscriptions(store)).toBe(
      '*:Event:1 : event_list'
    );
  });

  test('should clear all subscriptions', () => {
    const store = useSubscriptionStore.getState();
    
    store.addSubscription('*:Event:1', 'event_list');
    store.addSubscription('*:Market:1000', 'market_list');
    store.clear();
    
    expect(formatSubscriptions(store)).toBe('');
  });
});