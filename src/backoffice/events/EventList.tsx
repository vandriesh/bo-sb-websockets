import React from 'react';
import { useEvents } from './useEvents';
import { useEventsStore } from './useEventsStore';
import { EventItem } from './EventItem';

export const EventList = () => {
  const { events, setEvents } = useEventsStore();
  
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
            <EventItem key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
};