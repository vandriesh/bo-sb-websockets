import React from 'react';
import { enhancedSocket } from '../../socket';
import { useBOEventsStore } from '../store/events';
import { useEvents } from '../../common/hooks/useEvents';
import { EventItem } from './EventItem';

export const BackOffice = () => {
  const { events, updating, setUpdating, updateSelectionPrice, setEvents } = useBOEventsStore();
  const [updateDirection, setUpdateDirection] = React.useState<'up' | 'down' | null>(null);
  const pendingUpdateRef = React.useRef<{ eventId: string; id: string; price: number; direction: 'up' | 'down' } | null>(null);
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Fetch initial events using React Query
  const { data: initialEvents, isLoading } = useEvents();

  // Set initial events when data is loaded
  React.useEffect(() => {
    if (initialEvents) {
      setEvents(initialEvents);
    }
  }, [initialEvents, setEvents]);

  const handlePriceUpdate = React.useCallback((eventId: string, id: string, newPrice: number, direction: 'up' | 'down') => {
    // Immediately update the UI
    updateSelectionPrice(eventId, id, newPrice);

    // Store the latest update
    pendingUpdateRef.current = { eventId, id, price: newPrice, direction };

    // Clear any existing timeouts
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set a new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      if (pendingUpdateRef.current) {
        const { eventId, id, price, direction } = pendingUpdateRef.current;
        
        // Show spinner
        setUpdating(id);
        setUpdateDirection(direction);
        
        // Send update using enhanced socket
        enhancedSocket.emitEventUpdate(eventId, {
          type: 'ODDS_UPDATE',
          payload: {
            id: eventId,
            selections: [{
              id,
              price
            }]
          }
        });

        // Clear spinner after 500ms
        setTimeout(() => {
          setUpdating(null);
          setUpdateDirection(null);
        }, 500);

        // Clear pending update
        pendingUpdateRef.current = null;
      }
    }, 300); // Wait 300ms after last click
  }, [setUpdating, updateSelectionPrice]);

  // Cleanup timeouts on unmount
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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Back Office - Odds Management</h1>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr,repeat(3,180px),80px] gap-4 p-4 bg-gray-50 border-b font-semibold">
            <div>Event</div>
            <div className="text-center">1</div>
            <div className="text-center">X</div>
            <div className="text-center">2</div>
            <div className="text-center">Status</div>
          </div>

          {/* Events */}
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
    </div>
  );
};