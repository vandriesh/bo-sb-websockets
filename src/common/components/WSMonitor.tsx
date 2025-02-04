import React from 'react';
import { Radio, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface WSMonitorProps {
  subscriptions: string[];
  isConnected: boolean;
}

export const WSMonitor: React.FC<WSMonitorProps> = ({ subscriptions, isConnected }) => {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const marketChannels = subscriptions.filter(channel => channel.startsWith('*:Market:'));
  const eventChannels = subscriptions.filter(channel => channel.startsWith('*:Event:'));
  const otherChannels = subscriptions.filter(channel => 
    !channel.startsWith('*:Market:') && !channel.startsWith('*:Event:')
  );

  return (
    <div className="fixed bottom-4 left-4 z-50 w-80 bg-white rounded-lg shadow-lg overflow-hidden">
      <div 
        className="bg-gray-50 p-3 border-b flex items-center justify-between cursor-pointer hover:bg-gray-100"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-blue-600" />
          <h3 className="font-medium text-sm">Active Channels</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-xs text-gray-600">
            {subscriptions.length} total
          </span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {subscriptions.length === 0 ? (
            <div className="flex items-center justify-center gap-2 text-gray-500 py-4">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">No active subscriptions</p>
            </div>
          ) : (
            <>
              {marketChannels.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 mb-2">
                    Market Channels ({marketChannels.length})
                  </h4>
                  <div className="space-y-1">
                    {marketChannels.map(channel => (
                      <div key={channel} className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        {channel}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {eventChannels.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 mb-2">
                    Event Channels ({eventChannels.length})
                  </h4>
                  <div className="space-y-1">
                    {eventChannels.map(channel => (
                      <div key={channel} className="text-sm bg-green-50 text-green-700 px-2 py-1 rounded">
                        {channel}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {otherChannels.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 mb-2">
                    System Channels ({otherChannels.length})
                  </h4>
                  <div className="space-y-1">
                    {otherChannels.map(channel => (
                      <div key={channel} className="text-sm bg-gray-50 text-gray-700 px-2 py-1 rounded">
                        {channel}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};