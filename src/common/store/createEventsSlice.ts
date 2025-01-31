import type { Event } from '../../types';
import type { StateCreator } from 'zustand';

export interface EventsSlice {
  events: Event[];
  setEvents: (events: Event[]) => void;
  updateEvent: (updatedEvent: Event) => void;
  updateSuspendedState: (eventId: string, suspended: boolean) => void;
}

export const createEventsSlice = <T extends EventsSlice>(
  set: StateCreator<T>['setState'],
  storeName: string,
  onStateChange?: (state: T) => void
): EventsSlice => ({
  events: [],
  setEvents: (events) => {
    console.log(`${storeName}: Setting events:`, events);
    set(
      (state) => {
        const newState = { events } as T;
        onStateChange?.(newState);
        return newState;
      },
      false,
      `${storeName}/setEvents`
    );
  },
  updateEvent: (updatedEvent) => {
    console.log(`${storeName}: Updating event:`, updatedEvent);
    set(
      (state) => {
        const newState = {
          events: (state as T).events.map(event => 
            event.id === updatedEvent.id ? updatedEvent : event
          )
        } as T;
        onStateChange?.(newState);
        return newState;
      },
      false,
      `${storeName}/updateEvent`
    );
  },
  updateSuspendedState: (eventId, suspended) => {
    console.log(`${storeName}: Updating suspended state:`, { eventId, suspended });
    set(
      (state) => {
        const newState = {
          events: (state as T).events.map(event =>
            event.id === eventId ? { ...event, suspended } : event
          )
        } as T;
        onStateChange?.(newState);
        return newState;
      },
      false,
      `${storeName}/updateSuspendedState`
    );
  }
});