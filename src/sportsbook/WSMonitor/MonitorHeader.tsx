import React from 'react';
import { Radio, ChevronDown, ChevronUp, Clock, Calendar } from 'lucide-react';

interface MonitorHeaderProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  isConnected: boolean;
  activeTab?: 'live' | 'upcoming';
  totalChannels: number;
}

export const MonitorHeader: React.FC<MonitorHeaderProps> = ({
  isExpanded,
  setIsExpanded,
  isConnected,
  activeTab,
  totalChannels
}) => {
  return (
    <div 
      className="bg-gray-50 p-3 border-b flex items-center justify-between cursor-pointer hover:bg-gray-100"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center gap-2">
        <Radio className="w-4 h-4 text-blue-600" />
        <h3 className="font-medium text-sm">Active Subscriptions</h3>
        {activeTab && (
          <span className={`flex items-center text-xs px-2 py-0.5 rounded ${
            activeTab === 'live' 
              ? 'bg-red-100 text-red-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {activeTab === 'live' ? (
              <>
                <Clock className="w-3 h-3 mr-1" />
                Live
              </>
            ) : (
              <>
                <Calendar className="w-3 h-3 mr-1" />
                Upcoming
              </>
            )}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span className="text-xs text-gray-600">
          {totalChannels} total
        </span>
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        )}
      </div>
    </div>
  );
};