import React from 'react';
import { useEvents } from './useEvents';
import { useEventsStore } from './useEventsStore';
import { EventItem } from './EventItem';

export const EventList = () => {
  const { events, setEvents } = useEventsStore();
  
  const { data: initialEvents, isLoading } = useEvents();

  React.useEffect(() => {
    if (initialEvents) {
      console.log('🔄 [BO] Setting initial events:', initialEvents);
      setEvents(initialEvents);
    }
  }, [initialEvents, setEvents]);

  const liveEvents = events.filter(event => event.status === 'live');
  const upcomingEvents = events.filter(event => event.status === 'upcoming');

  console.log('📊 [BO] Current events state:', { 
    total: events.length,
    live: liveEvents.length,
    upcoming: upcomingEvents.length
  });

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
      
      <div className="space-y-8">
        {/* Live Events Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-red-50 p-4 border-b">
            <h2 className="text-lg font-semibold text-red-700">
              Live Events ({liveEvents.length})
            </h2>
          </div>

          <div className="grid grid-cols-[1fr,repeat(3,180px),80px] gap-4 p-4 bg-gray-50 border-b font-semibold">
            <div>Event</div>
            <div className="text-center">1</div>
            <div className="text-center">X</div>
            <div className="text-center">2</div>
            <div className="text-center">Status</div>
          </div>

          <div className="divide-y">
            {liveEvents.map((event) => (
              <EventItem key={event.id} event={event} />
            ))}
          </div>
        </div>

        {/* Upcoming Events Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-50 p-4 border-b">
            <h2 className="text-lg font-semibold text-blue-700">
              Upcoming Events ({upcomingEvents.length})
            </h2>
          </div>

          <div className="grid grid-cols-[1fr,repeat(3,180px),80px] gap-4 p-4 bg-gray-50 border-b font-semibold">
            <div>Event</div>
            <div className="text-center">1</div>
            <div className="text-center">X</div>
            <div className="text-center">2</div>
            <div className="text-center">Status</div>
          </div>

          <div className="divide-y">
            {upcomingEvents.map((event) => (
              <EventItem key={event.id} event={event} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};