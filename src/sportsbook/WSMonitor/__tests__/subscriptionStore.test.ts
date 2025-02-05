import { describe, test, expect, beforeEach } from 'vitest';
import { useSubscriptionStore } from '../../../common/store/subscriptionStore';
import type { SubscriptionSource } from '../../../types';

describe('Subscription Store', () => {
  beforeEach(() => {
    useSubscriptionStore.setState({
      subscriptions: new Map()
    });
  });

  test('should add subscriptions to channels', () => {
    const store = useSubscriptionStore.getState();
    const channel = '*:Event:1';
    const source: SubscriptionSource = 'event_list';

    store.addSubscription(channel, source);
    const summary = store.getSubscriptionSummary();

    expect(summary.length).toBe(1);
    expect(summary[0].channel).toBe(channel);
    expect(summary[0].sources).toContain(source);
  });

  test('should remove subscriptions from channels', () => {
    const store = useSubscriptionStore.getState();
    const channel = '*:Event:1';
    const source1: SubscriptionSource = 'event_list';
    const source2: SubscriptionSource = 'event_betslip';

    store.addSubscription(channel, source1);
    store.addSubscription(channel, source2);
    store.removeSubscription(channel, source1);

    const summary = store.getSubscriptionSummary();
    expect(summary[0].sources).not.toContain(source1);
    expect(summary[0].sources).toContain(source2);
  });

  test('should remove channel when last subscription is removed', () => {
    const store = useSubscriptionStore.getState();
    const channel = '*:Event:1';
    const source: SubscriptionSource = 'event_list';

    store.addSubscription(channel, source);
    store.removeSubscription(channel, source);

    const summary = store.getSubscriptionSummary();
    expect(summary.length).toBe(0);
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

  test('should prevent duplicate subscriptions', () => {
    const store = useSubscriptionStore.getState();
    const channel = '*:Event:1';
    const source: SubscriptionSource = 'event_list';

    store.addSubscription(channel, source);
    store.addSubscription(channel, source);

    const summary = store.getSubscriptionSummary();
    expect(summary[0].sources.length).toBe(1);
  });

  test('should format subscriptions as ASCII text', () => {
    const store = useSubscriptionStore.getState();
    
    store.addSubscription('*:Event:1', 'event_list');
    store.addSubscription('*:Event:1', 'event_betslip');
    store.addSubscription('*:Market:1000', 'market_list');
    
    const summary = store.getSubscriptionSummary()
      .map(({ channel, sources }) => `${channel} : ${Array.from(sources).sort().join(', ')}`)
      .sort()
      .join('\n');
    
    expect(summary).toBe([
      '*:Event:1 : event_betslip, event_list',
      '*:Market:1000 : market_list'
    ].join('\n'));
  });
});