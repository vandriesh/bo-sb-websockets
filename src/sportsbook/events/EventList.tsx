import React from 'react';
import { useEvents } from './useEvents';
import { useSportsBookStore } from './useEventsStore';
import { EventItem } from './EventItem';
import { Clock, Calendar } from 'lucide-react';

export const EventList = () => {
  const { events, setEvents } = useSportsBookStore();
  const [activeTab, setActiveTab] = React.useState<'live' | 'upcoming'>('live');
  
  const { data: initialEvents, isLoading } = useEvents();

  React.useEffect(() => {
    if (initialEvents) {
      setEvents(initialEvents);
    }
  }, [initialEvents, setEvents]);

  const liveEvents = events.filter(event => event.status === 'live');
  const upcomingEvents = events.filter(event => event.status === 'upcoming');

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <p className="text-gray-600">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('live')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === 'live'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          Live Events ({liveEvents.length})
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors ${
            activeTab === 'upcoming'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Upcoming ({upcomingEvents.length})
        </button>
      </div>

      {/* Header */}
      <div className="grid grid-cols-[1fr,repeat(3,120px)] gap-4 p-4 bg-gray-50 border-b font-semibold">
        <div>Event</div>
        <div className="text-center">1</div>
        <div className="text-center">X</div>
        <div className="text-center">2</div>
      </div>

      {/* Event List */}
      <div className="divide-y">
        {(activeTab === 'live' ? liveEvents : upcomingEvents).map((event) => (
          <EventItem 
            key={event.id} 
            id={event.id} 
            source="event_list"
          />
        ))}
      </div>
    </div>
  );
};