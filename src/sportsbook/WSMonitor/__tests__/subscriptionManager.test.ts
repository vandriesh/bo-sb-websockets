import { describe, test, expect, beforeEach, vi } from 'vitest';
import { useSubscriptionStore } from '../../../common/store/subscriptionStore';
import { useSubscriptionManager } from '../hooks/useSubscriptionManager';
import { mockSocket } from '../../../test/mocks/socket';
import type { SubscriptionSource } from '../../../types';

// Mock the socket
vi.mock('../../../socket', () => ({
  enhancedSocket: mockSocket
}));

describe('Subscription Manager', () => {
  beforeEach(() => {
    // Clear the subscription store
    useSubscriptionStore.setState({ subscriptions: new Map() });
    vi.clearAllMocks();
  });

  test('should track event subscription sources', () => {
    const manager = useSubscriptionManager();
    const eventId = 1;
    const source1: SubscriptionSource = 'event_list';
    const source2: SubscriptionSource = 'event_betslip';

    // Add subscriptions
    const cleanup1 = manager.addEventSubscription(eventId, source1);
    const cleanup2 = manager.addEventSubscription(eventId, source2);

    // Check subscription store
    const summary = manager.getSubscriptionSummary();
    const eventChannel = summary.events.find(e => e.channel === `*:Event:${eventId}`);

    expect(eventChannel).toBeDefined();
    expect(eventChannel?.sources).toContain(source1);
    expect(eventChannel?.sources).toContain(source2);
    expect(mockSocket.subscribeToEvent).toHaveBeenCalledTimes(1);

    // Cleanup one source
    cleanup1();
    const updatedSummary = manager.getSubscriptionSummary();
    const updatedChannel = updatedSummary.events.find(e => e.channel === `*:Event:${eventId}`);

    expect(updatedChannel?.sources).not.toContain(source1);
    expect(updatedChannel?.sources).toContain(source2);
    expect(mockSocket.socket.off).not.toHaveBeenCalled();

    // Cleanup last source
    cleanup2();
    const finalSummary = manager.getSubscriptionSummary();
    expect(finalSummary.events.length).toBe(0);
    expect(mockSocket.socket.off).toHaveBeenCalledWith(`*:Event:${eventId}`);
  });

  test('should track market subscription sources', () => {
    const manager = useSubscriptionManager();
    const marketId = 1000;
    const source1: SubscriptionSource = 'market_list';
    const source2: SubscriptionSource = 'market_betslip';

    // Add subscriptions
    const cleanup1 = manager.addMarketSubscription(marketId, source1);
    const cleanup2 = manager.addMarketSubscription(marketId, source2);

    // Check subscription store
    const summary = manager.getSubscriptionSummary();
    const marketChannel = summary.markets.find(m => m.channel === `*:Market:${marketId}`);

    expect(marketChannel).toBeDefined();
    expect(marketChannel?.sources).toContain(source1);
    expect(marketChannel?.sources).toContain(source2);
    expect(mockSocket.subscribeToMarket).toHaveBeenCalledTimes(1);

    // Cleanup one source
    cleanup1();
    const updatedSummary = manager.getSubscriptionSummary();
    const updatedChannel = updatedSummary.markets.find(m => m.channel === `*:Market:${marketId}`);

    expect(updatedChannel?.sources).not.toContain(source1);
    expect(updatedChannel?.sources).toContain(source2);
    expect(mockSocket.socket.off).not.toHaveBeenCalled();

    // Cleanup last source
    cleanup2();
    const finalSummary = manager.getSubscriptionSummary();
    expect(finalSummary.markets.length).toBe(0);
    expect(mockSocket.socket.off).toHaveBeenCalledWith(`*:Market:${marketId}`);
  });

  test('should handle multiple subscriptions to different channels', () => {
    const manager = useSubscriptionManager();
    const eventId1 = 1;
    const eventId2 = 2;
    const marketId1 = 1000;
    const marketId2 = 1001;
    const source: SubscriptionSource = 'event_list';

    // Add multiple subscriptions
    manager.addEventSubscription(eventId1, source);
    manager.addEventSubscription(eventId2, source);
    manager.addMarketSubscription(marketId1, source);
    manager.addMarketSubscription(marketId2, source);

    const summary = manager.getSubscriptionSummary();

    expect(summary.events.length).toBe(2);
    expect(summary.markets.length).toBe(2);
    expect(mockSocket.subscribeToEvent).toHaveBeenCalledTimes(2);
    expect(mockSocket.subscribeToMarket).toHaveBeenCalledTimes(2);
  });

  test('should handle subscription cleanup correctly', () => {
    const manager = useSubscriptionManager();
    const eventId = 1;
    const marketId = 1000;
    const source1: SubscriptionSource = 'event_list';
    const source2: SubscriptionSource = 'event_betslip';

    const cleanup1 = manager.addEventSubscription(eventId, source1);
    const cleanup2 = manager.addEventSubscription(eventId, source2);
    const cleanup3 = manager.addMarketSubscription(marketId, source1);

    cleanup1();
    cleanup2();
    cleanup3();

    const summary = manager.getSubscriptionSummary();
    expect(summary.events.length).toBe(0);
    expect(summary.markets.length).toBe(0);
    expect(mockSocket.socket.off).toHaveBeenCalledTimes(2);
  });
});