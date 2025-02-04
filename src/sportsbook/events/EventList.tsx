import React from 'react';
import { useEvents } from './useEvents';
import { useSportsBookStore } from './useEventsStore';
import { EventItem } from './EventItem';

export const EventList = () => {
  const { events, setEvents } = useSportsBookStore();
  
  const { data: initialEvents, isLoading } = useEvents();

  React.useEffect(() => {
    if (initialEvents) {
      setEvents(initialEvents);
    }
  }, [initialEvents, setEvents]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <p className="text-gray-600">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="grid grid-cols-[1fr,repeat(3,120px)] gap-4 p-4 bg-gray-50 border-b font-semibold">
        <div>Event</div>
        <div className="text-center">1</div>
        <div className="text-center">X</div>
        <div className="text-center">2</div>
      </div>

      <div className="divide-y">
        {events.map((event) => (
          <EventItem key={event.id} id={event.id} />
        ))}
      </div>
    </div>
  );
};