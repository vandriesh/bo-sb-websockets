import { describe, test, expect, beforeEach, vi } from 'vitest';
import { useSubscriptionStore } from '../../../common/store/subscriptionStore';
import { useSubscriptionManager } from '../hooks/useSubscriptionManager';
import { mockSocket } from '../../../test/mocks/socket';
import type { SubscriptionSource } from '../../../types';

// Mock the socket
vi.mock('../../../socket', () => ({
  enhancedSocket: mockSocket
}));

// Helper to format subscriptions as ASCII text
const formatSubscriptions = (manager: ReturnType<typeof useSubscriptionManager>) => {
  const summary = manager.getSubscriptionSummary();
  const eventSubs = summary.events
    .map(({ channel, sources }) => `${channel} : ${Array.from(sources).sort().join(', ')}`)
    .sort();
  const marketSubs = summary.markets
    .map(({ channel, sources }) => `${channel} : ${Array.from(sources).sort().join(', ')}`)
    .sort();
  
  return [...eventSubs, ...marketSubs].join('\n');
};

describe('Subscription Manager', () => {
  beforeEach(() => {
    useSubscriptionStore.setState({ subscriptions: new Map() });
    vi.clearAllMocks();
  });

  test('should track event subscription sources', () => {
    const manager = useSubscriptionManager();
    
    const cleanup1 = manager.addEventSubscription(1, 'event_list');
    const cleanup2 = manager.addEventSubscription(1, 'event_betslip');
    
    expect(formatSubscriptions(manager)).toBe(
      '*:Event:1 : event_betslip, event_list'
    );
    expect(mockSocket.subscribeToEvent).toHaveBeenCalledTimes(1);

    // Cleanup one source
    cleanup1();
    expect(formatSubscriptions(manager)).toBe(
      '*:Event:1 : event_betslip'
    );
    expect(mockSocket.socket.off).not.toHaveBeenCalled();

    // Cleanup last source
    cleanup2();
    expect(formatSubscriptions(manager)).toBe('');
    expect(mockSocket.socket.off).toHaveBeenCalledWith('*:Event:1');
  });

  test('should track market subscription sources', () => {
    const manager = useSubscriptionManager();
    
    const cleanup1 = manager.addMarketSubscription(1000, 'market_list');
    const cleanup2 = manager.addMarketSubscription(1000, 'market_betslip');
    
    expect(formatSubscriptions(manager)).toBe(
      '*:Market:1000 : market_betslip, market_list'
    );
    expect(mockSocket.subscribeToMarket).toHaveBeenCalledTimes(1);

    // Cleanup one source
    cleanup1();
    expect(formatSubscriptions(manager)).toBe(
      '*:Market:1000 : market_betslip'
    );
    expect(mockSocket.socket.off).not.toHaveBeenCalled();

    // Cleanup last source
    cleanup2();
    expect(formatSubscriptions(manager)).toBe('');
    expect(mockSocket.socket.off).toHaveBeenCalledWith('*:Market:1000');
  });

  test('should handle multiple subscriptions to different channels', () => {
    const manager = useSubscriptionManager();
    
    manager.addEventSubscription(1, 'event_list');
    manager.addEventSubscription(2, 'event_list');
    manager.addMarketSubscription(1000, 'market_list');
    manager.addMarketSubscription(1001, 'market_list');
    
    expect(formatSubscriptions(manager)).toBe([
      '*:Event:1 : event_list',
      '*:Event:2 : event_list',
      '*:Market:1000 : market_list',
      '*:Market:1001 : market_list'
    ].join('\n'));
    
    expect(mockSocket.subscribeToEvent).toHaveBeenCalledTimes(2);
    expect(mockSocket.subscribeToMarket).toHaveBeenCalledTimes(2);
  });

  test('should handle subscription cleanup correctly', () => {
    const manager = useSubscriptionManager();
    
    const cleanup1 = manager.addEventSubscription(1, 'event_list');
    const cleanup2 = manager.addEventSubscription(1, 'event_betslip');
    const cleanup3 = manager.addMarketSubscription(1000, 'market_list');
    
    expect(formatSubscriptions(manager)).toBe([
      '*:Event:1 : event_betslip, event_list',
      '*:Market:1000 : market_list'
    ].join('\n'));

    cleanup1();
    cleanup2();
    cleanup3();
    
    expect(formatSubscriptions(manager)).toBe('');
    expect(mockSocket.socket.off).toHaveBeenCalledTimes(2);
  });
});