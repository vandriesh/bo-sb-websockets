import React from 'react';
import { ConnectionStatus } from '../../common/components/ConnectionStatus';
import { WSMonitor } from '../../common/components/WSMonitor';
import { useSportsbookConnection } from '../hooks/useSportsbookConnection';

export const SportsbookConnection = () => {
  const { isConnected, lastPing, reconnectAttempts, subscriptions, toggleConnection } = useSportsbookConnection();

  return (
    <>
      <ConnectionStatus
        isConnected={isConnected}
        lastPing={lastPing}
        reconnectAttempts={reconnectAttempts}
        subscriptions={subscriptions}
        onToggleConnection={toggleConnection}
      />
      <WSMonitor 
        subscriptions={subscriptions}
        isConnected={isConnected}
      />
    </>
  );
};