import React from 'react';
import { RefreshCw, Lock, Unlock } from 'lucide-react';
import type { Event } from '../../types';
import { useEventsStore } from './useEventsStore';
import { enhancedSocket } from '../../socket';

interface EventItemProps {
  event: Event;
  onPriceUpdate: (eventId: string, id: string, newPrice: number, direction: 'up' | 'down') => void;
  updating: string | null;
  updateDirection: 'up' | 'down' | null;
}

export const EventItem = React.memo(({ event, onPriceUpdate, updating, updateDirection }: EventItemProps) => {
  const { setSuspended } = useEventsStore();

  const handleSuspendToggle = () => {
    setSuspended(event.id, !event.suspended);
  };

  return (
    <div className="grid grid-cols-[1fr,repeat(3,180px),80px] gap-4 p-4 items-center">
      <div className="font-medium">
        {event.name}
        {event.suspended && (
          <span className="ml-2 text-sm text-red-500">(Suspended)</span>
        )}
      </div>
      {event.selections.map((selection) => (
        <div key={selection.id} className="flex items-center justify-center space-x-2">
          <button
            onClick={() => onPriceUpdate(event.id, selection.id, selection.price - 0.1, 'down')}
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
            onClick={() => onPriceUpdate(event.id, selection.id, selection.price + 0.1, 'up')}
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