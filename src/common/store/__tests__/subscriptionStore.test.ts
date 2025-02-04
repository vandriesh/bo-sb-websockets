import { describe, test, expect, beforeEach } from 'vitest';
import { useSubscriptionStore } from '../subscriptionStore';
import type { SubscriptionSource } from '../../types';

describe('Subscription Store', () => {
  beforeEach(() => {
    useSubscriptionStore.getState().clear();
  });

  test('should add subscriptions to channels', () => {
    const store = useSubscriptionStore.getState();
    const channel = '*:Event:1';
    const source: SubscriptionSource = 'event_list';

    store.addSubscription(channel, source);
    
    const sources = store.getChannelSources(channel);
    expect(sources.has(source)).toBe(true);
    expect(sources.size).toBe(1);
  });

  test('should handle multiple sources for same channel', () => {
    const store = useSubscriptionStore.getState();
    const channel = '*:Event:1';
    const source1: SubscriptionSource = 'event_list';
    const source2: SubscriptionSource = 'event_betslip';

    store.addSubscription(channel, source1);
    store.addSubscription(channel, source2);

    const sources = store.getChannelSources(channel);
    expect(sources.has(source1)).toBe(true);
    expect(sources.has(source2)).toBe(true);
    expect(sources.size).toBe(2);
  });

  test('should remove subscriptions from channels', () => {
    const store = useSubscriptionStore.getState();
    const channel = '*:Event:1';
    const source: SubscriptionSource = 'event_list';

    store.addSubscription(channel, source);
    store.removeSubscription(channel, source);

    const sources = store.getChannelSources(channel);
    expect(sources.size).toBe(0);
    expect(store.getSubscriptionSummary().length).toBe(0);
  });

  test('should handle multiple channels', () => {
    const store = useSubscriptionStore.getState();
    const channel1 = '*:Event:1';
    const channel2 = '*:Market:1000';
    const source: SubscriptionSource = 'event_list';

    store.addSubscription(channel1, source);
    store.addSubscription(channel2, source);

    const summary = store.getSubscriptionSummary();
    expect(summary.length).toBe(2);
    expect(summary.map(s => s.channel)).toContain(channel1);
    expect(summary.map(s => s.channel)).toContain(channel2);
  });

  test('should prevent duplicate sources', () => {
    const store = useSubscriptionStore.getState();
    const channel = '*:Event:1';
    const source: SubscriptionSource = 'event_list';

    store.addSubscription(channel, source);
    store.addSubscription(channel, source);

    const sources = store.getChannelSources(channel);
    expect(sources.size).toBe(1);
  });

  test('should clear all subscriptions', () => {
    const store = useSubscriptionStore.getState();
    const channel1 = '*:Event:1';
    const channel2 = '*:Market:1000';
    const source: SubscriptionSource = 'event_list';

    store.addSubscription(channel1, source);
    store.addSubscription(channel2, source);
    store.clear();

    expect(store.getSubscriptionSummary().length).toBe(0);
    expect(store.getChannelSources(channel1).size).toBe(0);
    expect(store.getChannelSources(channel2).size).toBe(0);
  });

  test('should return empty set for non-existent channel', () => {
    const store = useSubscriptionStore.getState();
    const sources = store.getChannelSources('non-existent');
    expect(sources).toBeInstanceOf(Set);
    expect(sources.size).toBe(0);
  });
});