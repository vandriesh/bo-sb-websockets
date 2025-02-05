import { useState, useEffect } from 'react';
import { socket, enhancedSocket } from '../../socket';

export const useBackOfficeConnection = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastPing, setLastPing] = useState<number | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [subscriptions, setSubscriptions] = useState<string[]>([]);

  useEffect(() => {
    const onConnect = () => {
      console.log('🔌 [BO] Connected to WebSocket');
      setIsConnected(true);
      setLastPing(Date.now());
    };

    const onDisconnect = (reason: string) => {
      console.log('🔌 [BO] Disconnected from WebSocket:', reason);
      setIsConnected(false);
    };

    const onReconnect = (attempt: number) => {
      console.log('🔌 [BO] Reconnected after', attempt, 'attempts');
      setReconnectAttempts(attempt);
      setLastPing(Date.now());
    };

    const onReconnectAttempt = (attempt: number) => {
      console.log('🔌 [BO] Reconnection attempt', attempt);
      setReconnectAttempts(attempt);
    };

    const onPing = () => {
      setLastPing(Date.now());
    };

    // Track subscriptions
    const updateSubscriptions = () => {
      setSubscriptions(enhancedSocket.getActiveSubscriptions());
    };

    // Initial state
    setIsConnected(socket.connected);
    updateSubscriptions();

    // Socket event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('reconnect', onReconnect);
    socket.on('reconnect_attempt', onReconnectAttempt);
    socket.on('ping', onPing);

    // Subscription tracking
    const subscriptionInterval = setInterval(updateSubscriptions, 5000);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('reconnect', onReconnect);
      socket.off('reconnect_attempt', onReconnectAttempt);
      socket.off('ping', onPing);
      clearInterval(subscriptionInterval);
    };
  }, []);

  const toggleConnection = () => {
    if (isConnected) {
      socket.disconnect();
    } else {
      socket.connect();
    }
  };

  return {
    isConnected,
    lastPing,
    reconnectAttempts,
    subscriptions,
    toggleConnection
  };
};