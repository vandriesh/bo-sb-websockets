import { useState, useEffect } from 'react';
import { socket, enhancedSocket } from '../../socket';

export const useConnectionStatus = (appName: string) => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastPing, setLastPing] = useState<number | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [subscriptions, setSubscriptions] = useState<string[]>([]);

  useEffect(() => {
    const onConnect = () => {
      console.log(`🔌 [${appName}] Connected to WebSocket`);
      setIsConnected(true);
      setLastPing(Date.now());
    };

    const onDisconnect = (reason: string) => {
      console.log(`🔌 [${appName}] Disconnected from WebSocket:`, reason);
      setIsConnected(false);
    };

    const onReconnect = (attempt: number) => {
      console.log(`🔌 [${appName}] Reconnected after ${attempt} attempts`);
      setReconnectAttempts(attempt);
      setLastPing(Date.now());
    };

    const onReconnectAttempt = (attempt: number) => {
      console.log(`🔌 [${appName}] Reconnection attempt ${attempt}`);
      setReconnectAttempts(attempt);
    };

    const onPing = () => {
      setLastPing(Date.now());
    };

    // Track subscriptions
    const updateSubscriptions = () => {
      const subs = Object.keys(socket.hasListeners());
      setSubscriptions(subs);
      console.log(`🔌 [${appName}] Active subscriptions:`, subs);
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
  }, [appName]);

  return {
    isConnected,
    lastPing,
    reconnectAttempts,
    subscriptions
  };
};