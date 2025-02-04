import React from 'react';
import { useEvents } from './useEvents';
import { useEventsStore } from './useEventsStore';
import { EventItem } from './EventItem';
import { enhancedSocket } from '../../socket';

export const EventList = () => {
  const { events, updating, setUpdating, updateSelectionPrice, setEvents } = useEventsStore();
  const [updateDirection, setUpdateDirection] = React.useState<'up' | 'down' | null>(null);
  const pendingUpdateRef = React.useRef<{ eventId: string; id: string; price: number; direction: 'up' | 'down' } | null>(null);
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const { data: initialEvents, isLoading } = useEvents();

  React.useEffect(() => {
    if (initialEvents) {
      setEvents(initialEvents);
    }
  }, [initialEvents, setEvents]);

  const handlePriceUpdate = React.useCallback((eventId: string, id: string, newPrice: number, direction: 'up' | 'down') => {
    updateSelectionPrice(eventId, id, newPrice);
    pendingUpdateRef.current = { eventId, id, price: newPrice, direction };

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (pendingUpdateRef.current) {
        const { eventId, id, price, direction } = pendingUpdateRef.current;
        setUpdating(id);
        setUpdateDirection(direction);
        
        enhancedSocket.emitEventUpdate(eventId, {
          type: 'ODDS_UPDATE',
          payload: {
            id: eventId,
            selections: [{ id, price }]
          }
        });

        setTimeout(() => {
          setUpdating(null);
          setUpdateDirection(null);
        }, 500);

        pendingUpdateRef.current = null;
      }
    }, 300);
  }, [setUpdating, updateSelectionPrice]);

  React.useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-gray-600">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Back Office - Odds Management</h1>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-[1fr,repeat(3,180px),80px] gap-4 p-4 bg-gray-50 border-b font-semibold">
          <div>Event</div>
          <div className="text-center">1</div>
          <div className="text-center">X</div>
          <div className="text-center">2</div>
          <div className="text-center">Status</div>
        </div>

        <div className="divide-y">
          {events.map((event) => (
            <EventItem
              key={event.id}
              event={event}
              onPriceUpdate={handlePriceUpdate}
              updating={updating}
              updateDirection={updateDirection}
            />
          ))}
        </div>
      </div>
    </div>
  );
};