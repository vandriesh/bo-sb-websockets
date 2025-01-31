import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createEventsSlice, type EventsSlice } from '../../common/store/createEventsSlice';
import type { Event } from '../../types';

interface SBEventsState extends EventsSlice {
  priceChanges: Record<string, 'up' | 'down'>;
  setPriceChange: (id: string, direction: 'up' | 'down') => void;
  clearPriceChange: (id: string) => void;
}

export const useSBEventsStore = create<SBEventsState>()(
  devtools(
    persist(
      (set) => ({
        ...createEventsSlice(set, 'sbEvents'),
        priceChanges: {},
        setPriceChange: (id, direction) => {
          console.log('Setting price change:', { id, direction });
          set(
            (state) => ({
              priceChanges: { ...state.priceChanges, [id]: direction }
            }),
            false,
            'sbEvents/setPriceChange'
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
            'sbEvents/clearPriceChange'
          );
        }
      }),
      {
        name: 'sportsbook-events-storage'
      }
    ),
    {
      name: 'Sportsbook Events Store',
      enabled: true
    }
  )
);