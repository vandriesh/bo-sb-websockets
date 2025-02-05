import React from 'react';
import { Wifi, WifiOff, Power } from 'lucide-react';
import type { ConnectionStatusData } from '../types/connection';

interface ConnectionStatusProps {
  isConnected: boolean;
  lastPing: number | null;
  reconnectAttempts: number;
  subscriptions: string[];
  onToggleConnection: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  lastPing,
  reconnectAttempts,
  subscriptions,
  onToggleConnection
}) => {
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
        isConnected ? 'bg-green-100' : 'bg-red-100'
      }`}>
        {isConnected ? (
          <Wifi className="w-4 h-4 text-green-600" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-600" />
        )}
        <span className={`text-sm font-medium ${
          isConnected ? 'text-green-700' : 'text-red-700'
        }`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
        
        <button
          onClick={onToggleConnection}
          className={`ml-2 p-1 rounded transition-colors ${
            isConnected 
              ? 'bg-red-100 text-red-600 hover:bg-red-200'
              : 'bg-green-100 text-green-600 hover:bg-green-200'
          }`}
          title={isConnected ? 'Disconnect' : 'Connect'}
        >
          <Power className="w-4 h-4" />
        </button>
        
        <button 
          onClick={() => {
            const details = {
              lastPing: lastPing ? new Date(lastPing).toLocaleTimeString() : 'N/A',
              reconnectAttempts,
              activeSubscriptions: subscriptions
            };
            console.table(details);
          }}
          className="ml-2 text-xs underline text-gray-600 hover:text-gray-800"
        >
          Details
        </button>
      </div>
    </div>
  );
};