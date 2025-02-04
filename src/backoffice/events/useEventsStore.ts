import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createEventsSlice, type EventsSlice } from '../../common/store/createEventsSlice';
import { enhancedSocket } from '../../socket';
import { WsMessageType } from '../../types';

interface BOEventsState extends EventsSlice {
  updating: string | null;
  updateSelectionPrice: (eventId: string, marketId: number, selectionId: string, newPrice: number) => void;
  setUpdating: (id: string | null) => void;
  setSuspended: (eventId: string, suspended: boolean) => void;
}

export const useEventsStore = create<BOEventsState>()(
  devtools(
    (set) => ({
      ...createEventsSlice(set, 'boEvents'),
      updating: null,
      updateSelectionPrice: (eventId, marketId, selectionId, newPrice) => {
        console.log('Updating selection price:', { eventId, marketId, selectionId, newPrice });
        set(
          (state) => ({
            events: state.events.map(event => {
              if (event.id === eventId) {
                return {
                  ...event,
                  markets: event.markets.map(market => {
                    if (market.id === marketId) {
                      return {
                        ...market,
                        selections: market.selections.map(selection => 
                          selection.id === selectionId 
                            ? { ...selection, price: newPrice }
                            : selection
                        )
                      };
                    }
                    return market;
                  })
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
        set(
          (state) => ({
            events: state.events.map(event =>
              event.id === eventId ? { ...event, suspended } : event
            )
          }),
          false,
          'boEvents/setSuspended'
        );
        
        enhancedSocket.emitEventUpdate(eventId, {
          type: WsMessageType.EventUpdate,
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