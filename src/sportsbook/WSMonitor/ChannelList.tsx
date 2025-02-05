import React from 'react';
import type { SubscriptionSource } from '../../types';

interface Channel {
  channel: string;
  sources: SubscriptionSource[];
}

interface ChannelListProps {
  eventChannels: Channel[];
  marketChannels: Channel[];
}

export const ChannelList: React.FC<ChannelListProps> = ({
  eventChannels,
  marketChannels
}) => {
  return (
    <>
      {eventChannels.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 mb-2">
            Event Channels ({eventChannels.length})
          </h4>
          <div className="space-y-2">
            {eventChannels.map(({ channel, sources }) => (
              <div key={channel} className="text-sm">
                <div className="bg-green-50 text-green-700 px-2 py-1 rounded">
                  {channel}
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {sources.map(source => (
                    <span key={source} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {marketChannels.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-500 mb-2">
            Market Channels ({marketChannels.length})
          </h4>
          <div className="space-y-2">
            {marketChannels.map(({ channel, sources }) => (
              <div key={channel} className="text-sm">
                <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                  {channel}
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {sources.map(source => (
                    <span key={source} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                      {source}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};