import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { socket } from '../../socket';
import type { Event, Selection } from '../../types';

interface EventsState {
  events: Event[];
  priceChanges: Record<string, 'up' | 'down'>;
  updating: string | null;
  setEvents: (events: Event[]) => void;
  updateEvent: (updatedEvent: Event) => void;
  updateSelectionPrice: (eventId: string, selectionId: string, newPrice: number) => void;
  setPriceChange: (id: string, direction: 'up' | 'down') => void;
  clearPriceChange: (id: string) => void;
  setUpdating: (id: string | null) => void;
  setSuspended: (eventId: string, suspended: boolean) => void;
  updateSuspendedState: (eventId: string, suspended: boolean) => void;
}

export const useEventsStore = create<EventsState>()(
  devtools(
    persist(
      (set, get) => ({
        events: [],
        priceChanges: {},
        updating: null,
        setEvents: (events) => {
          console.log('Setting events:', events);
          set({ events }, false, 'events/setEvents');
        },
        updateEvent: (updatedEvent) => {
          console.log('Updating event:', updatedEvent);
          set(
            (state) => ({
              events: state.events.map(event => 
                event.id === updatedEvent.id ? updatedEvent : event
              )
            }),
            false,
            'events/updateEvent'
          );
        },
        updateSelectionPrice: (eventId, selectionId, newPrice) => {
          console.log('Updating selection price:', { eventId, selectionId, newPrice });
          set(
            (state) => ({
              events: state.events.map(event => {
                if (event.id === eventId) {
                  return {
                    ...event,
                    selections: event.selections.map(selection => 
                      selection.id === selectionId 
                        ? { ...selection, price: newPrice }
                        : selection
                    )
                  };
                }
                return event;
              })
            }),
            false,
            'events/updateSelectionPrice'
          );
        },
        setPriceChange: (id, direction) => {
          console.log('Setting price change:', { id, direction });
          set(
            (state) => ({
              priceChanges: { ...state.priceChanges, [id]: direction }
            }),
            false,
            'events/setPriceChange'
          );
        },
        clearPriceChange: (id) => {
          console.log('Clearing price change:', id);
          set(
            (state) => {
              const newChanges = { ...state.priceChanges };
              delete newChanges[id];
              return { priceChanges: newChanges };
            },
            false,
            'events/clearPriceChange'
          );
        },
        setUpdating: (id) => {
          console.log('Setting updating:', id);
          set({ updating: id }, false, 'events/setUpdating');
        },
        // This is called from the UI to initiate a suspension
        setSuspended: (eventId, suspended) => {
          console.log('Initiating suspension:', { eventId, suspended });
          // Only emit the socket event, don't update state
          socket.emit('suspendEvent', { eventId, suspended });
        },
        // This is called when receiving a suspension update from the server
        updateSuspendedState: (eventId, suspended) => {
          console.log('Updating suspended state:', { eventId, suspended });
          set(
            (state) => ({
              events: state.events.map(event =>
                event.id === eventId ? { ...event, suspended } : event
              )
            }),
            false,
            'events/updateSuspendedState'
          );
        }
      }),
      {
        name: 'events-storage'
      }
    ),
    {
      name: 'Events Store',
      enabled: true
    }
  )
);