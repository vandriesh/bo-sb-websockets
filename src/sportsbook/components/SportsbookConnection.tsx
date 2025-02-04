import React from 'react';
import { ConnectionStatus } from '../../common/components/ConnectionStatus';
import { WSMonitor } from '../WSMonitor';
import { useSportsbookConnection } from '../hooks/useSportsbookConnection';
import { useSportsBookStore } from '../events/useEventsStore';

export const SportsbookConnection = () => {
  const { isConnected, lastPing, reconnectAttempts, subscriptions, toggleConnection } = useSportsbookConnection();
  const activeTab = useSportsBookStore(state => state.activeTab);

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
        isConnected={isConnected}
        activeTab={activeTab}
        position="bottom-left"
      />
    </>
  );
};