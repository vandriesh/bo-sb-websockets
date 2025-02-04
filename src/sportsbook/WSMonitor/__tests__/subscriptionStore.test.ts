import { describe, test, expect, beforeEach } from 'vitest';
import { useSubscriptionStore } from '../../../common/store/subscriptionStore';
import type { SubscriptionSource } from '../../../types';

describe('Subscription Store', () => {
  beforeEach(() => {
    useSubscriptionStore.setState({
      subscriptions: new Map()
    });
  });

  test('should add sources to channels', () => {
    const store = useSubscriptionStore.getState();
    const channel = '*:Event:1';
    const source: SubscriptionSource = 'event_list';

    store.addSource(channel, source);
    const summary = store.getSubscriptionSummary();

    expect(summary.length).toBe(1);
    expect(summary[0].channel).toBe(channel);
    expect(summary[0].sources).toContain(source);
  });

  test('should remove sources from channels', () => {
    const store = useSubscriptionStore.getState();
    const channel = '*:Event:1';
    const source1: SubscriptionSource = 'event_list';
    const source2: SubscriptionSource = 'event_betslip';

    store.addSource(channel, source1);
    store.addSource(channel, source2);
    store.removeSource(channel, source1);

    const summary = store.getSubscriptionSummary();
    expect(summary[0].sources).not.toContain(source1);
    expect(summary[0].sources).toContain(source2);
  });

  test('should remove channel when last source is removed', () => {
    const store = useSubscriptionStore.getState();
    const channel = '*:Event:1';
    const source: SubscriptionSource = 'event_list';

    store.addSource(channel, source);
    store.removeSource(channel, source);

    const summary = store.getSubscriptionSummary();
    expect(summary.length).toBe(0);
  });

  test('should handle multiple channels', () => {
    const store = useSubscriptionStore.getState();
    const channel1 = '*:Event:1';
    const channel2 = '*:Market:1000';
    const source: SubscriptionSource = 'event_list';

    store.addSource(channel1, source);
    store.addSource(channel2, source);

    const summary = store.getSubscriptionSummary();
    expect(summary.length).toBe(2);
    expect(summary.map(s => s.channel)).toContain(channel1);
    expect(summary.map(s => s.channel)).toContain(channel2);
  });

  test('should prevent duplicate sources', () => {
    const store = useSubscriptionStore.getState();
    const channel = '*:Event:1';
    const source: SubscriptionSource = 'event_list';

    store.addSource(channel, source);
    store.addSource(channel, source);

    const summary = store.getSubscriptionSummary();
    expect(summary[0].sources.length).toBe(1);
  });
});