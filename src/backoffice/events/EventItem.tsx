import React from 'react';
import { RefreshCw, Lock, Unlock, Clock } from 'lucide-react';
import type { Event } from '../../types';
import { useEventsStore } from './useEventsStore';
import { usePriceUpdate } from './usePriceUpdate';

interface EventItemProps {
  event: Event;
}

export const EventItem = React.memo(({ event }: EventItemProps) => {
  const { setSuspended } = useEventsStore();
  const { updating, updateDirection, handlePriceUpdate } = usePriceUpdate(event.id);

  const handleSuspendToggle = () => {
    setSuspended(event.id, !event.suspended);
  };

  // We know we always have at least one market with three selections
  const mainMarket = event.markets[0];

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="grid grid-cols-[1fr,repeat(3,180px),80px] gap-4 p-4 items-center">
      <div>
        <div className="font-medium">
          <span className="text-gray-500 mr-2">[{event.id}]</span>
          {event.name}
        </div>
        <div className="flex items-center gap-2 mt-1">
          {event.status === 'live' ? (
            <>
              <span className="inline-flex items-center text-red-500 text-sm">
                <Clock className="w-3 h-3 mr-1" />
                {event.timeElapsed}'
              </span>
              <span className="text-sm font-semibold">
                {event.score?.home} - {event.score?.away}
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-500">
              {formatTime(event.startTime)}
            </span>
          )}
          
          {event.suspended && (
            <span className="text-sm text-red-500">(Suspended)</span>
          )}
        </div>
      </div>

      {mainMarket.selections.map((selection) => (
        <div key={selection.id} className="flex items-center justify-center space-x-2">
          <button
            onClick={() => handlePriceUpdate(mainMarket.id, selection.id, selection.price - 0.1, 'down')}
            className={`w-10 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded hover:bg-red-200 ${
              event.suspended ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={event.suspended}
          >
            {updating === selection.id && updateDirection === 'down' ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              '-'
            )}
          </button>
          <span className="text-xl font-bold w-16 text-center">
            {selection.price.toFixed(2)}
          </span>
          <button
            onClick={() => handlePriceUpdate(mainMarket.id, selection.id, selection.price + 0.1, 'up')}
            className={`w-10 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded hover:bg-green-200 ${
              event.suspended ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={event.suspended}
          >
            {updating === selection.id && updateDirection === 'up' ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              '+'
            )}
          </button>
        </div>
      ))}
      <button
        onClick={handleSuspendToggle}
        className={`flex items-center justify-center p-2 rounded transition-colors ${
          event.suspended 
            ? 'bg-red-100 text-red-600 hover:bg-red-200'
            : 'bg-green-100 text-green-600 hover:bg-green-200'
        }`}
      >
        {event.suspended ? (
          <Lock className="w-5 h-5" />
        ) : (
          <Unlock className="w-5 h-5" />
        )}
      </button>
    </div>
  );
});