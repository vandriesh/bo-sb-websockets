import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { socket, enhancedSocket } from '../../socket';
import { createEventsSlice, type EventsSlice } from '../../common/store/createEventsSlice';
import type { Event } from '../../types';

interface BOEventsState extends EventsSlice {
  updating: string | null;
  updateSelectionPrice: (eventId: string, selectionId: string, newPrice: number) => void;
  setUpdating: (id: string | null) => void;
  setSuspended: (eventId: string, suspended: boolean) => void;
}

export const useBOEventsStore = create<BOEventsState>()(
  devtools(
    (set) => ({
      ...createEventsSlice(set, 'boEvents'),
      updating: null,
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
          'boEvents/updateSelectionPrice'
        );
      },
      setUpdating: (id) => {
        console.log('Setting updating:', id);
        set({ updating: id }, false, 'boEvents/setUpdating');
      },
      setSuspended: (eventId, suspended) => {
        console.log('Initiating suspension:', { eventId, suspended });
        // First update local state for immediate feedback
        set(
          (state) => ({
            events: state.events.map(event =>
              event.id === eventId ? { ...event, suspended } : event
            )
          }),
          false,
          'boEvents/setSuspended'
        );
        
        // Then emit socket event with correct format
        enhancedSocket.emitEventUpdate(eventId, {
          type: 'EVENT_UPDATE',
          payload: {
            id: eventId,
            suspended
          }
        });
      }
    }),
    {
      name: 'Back Office Events Store',
      enabled: true
    }
  )
);