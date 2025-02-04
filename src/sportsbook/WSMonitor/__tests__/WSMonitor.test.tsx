import { describe, test, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WSMonitor } from '../WSMonitor';
import { useSubscriptionStore } from '../../../common/store/subscriptionStore';
import type { SubscriptionSource } from '../../../types';
import '@testing-library/jest-dom';

describe('WSMonitor Component', () => {
  beforeEach(() => {
    useSubscriptionStore.setState({ subscriptions: new Map() });
  });

  test('should display no subscriptions message when empty', () => {
    render(<WSMonitor isConnected={true} position="bottom-left" />);
    expect(screen.getByText('No active subscriptions')).toBeInTheDocument();
  });

  test('should display active subscriptions', () => {
    const store = useSubscriptionStore.getState();
    const eventChannel = '*:Event:1';
    const marketChannel = '*:Market:1000';
    const source: SubscriptionSource = 'event_list';

    store.addSubscription(eventChannel, source);
    store.addSubscription(marketChannel, source);

    render(<WSMonitor isConnected={true} position="bottom-left" />);

    expect(screen.getByText(eventChannel)).toBeInTheDocument();
    expect(screen.getByText(marketChannel)).toBeInTheDocument();
    expect(screen.getByText(source)).toBeInTheDocument();
  });

  test('should display connection status', () => {
    render(<WSMonitor isConnected={true} position="bottom-left" />);
    expect(screen.getByText('Active Subscriptions')).toBeInTheDocument();
  });

  test('should handle different positions', () => {
    const { container: bottomLeft } = render(
      <WSMonitor isConnected={true} position="bottom-left" />
    );
    expect(bottomLeft.firstChild).toHaveClass('bottom-4 left-4');

    const { container: topRight } = render(
      <WSMonitor isConnected={true} position="top-right" />
    );
    expect(topRight.firstChild).toHaveClass('top-4 right-4');
  });
});