import React from 'react';
import { Radio, AlertCircle, ChevronDown, ChevronUp, Clock, Calendar } from 'lucide-react';
import { useWSMonitor } from './useWSMonitor';
import { ChannelList } from './ChannelList';
import { MonitorHeader } from './MonitorHeader';

interface WSMonitorProps {
  isConnected: boolean;
  activeTab?: 'live' | 'upcoming';
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

export const WSMonitor: React.FC<WSMonitorProps> = ({ 
  isConnected,
  activeTab,
  position = 'bottom-left'
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const { summary } = useWSMonitor();

  const positionClasses = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4'
  }[position];

  return (
    <div className={`fixed ${positionClasses} z-50 w-80 bg-white rounded-lg shadow-lg overflow-hidden`}>
      <MonitorHeader 
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        isConnected={isConnected}
        activeTab={activeTab}
        totalChannels={summary.events.length + summary.markets.length}
      />

      {isExpanded && (
        <div className="p-3 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {summary.events.length === 0 && summary.markets.length === 0 ? (
            <div className="flex items-center justify-center gap-2 text-gray-500 py-4">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">No active subscriptions</p>
            </div>
          ) : (
            <ChannelList 
              eventChannels={summary.events}
              marketChannels={summary.markets}
            />
          )}
        </div>
      )}
    </div>
  );
};