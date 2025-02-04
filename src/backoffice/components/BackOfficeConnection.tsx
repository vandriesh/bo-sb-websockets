import React from 'react';
import { ConnectionStatus } from '../../common/components/ConnectionStatus';
import { useBackOfficeConnection } from '../hooks/useBackOfficeConnection';

export const BackOfficeConnection = () => {
  const { isConnected, lastPing, reconnectAttempts, subscriptions, toggleConnection } = useBackOfficeConnection();

  return (
    <ConnectionStatus
      isConnected={isConnected}
      lastPing={lastPing}
      reconnectAttempts={reconnectAttempts}
      subscriptions={subscriptions}
      onToggleConnection={toggleConnection}
    />
  );
};