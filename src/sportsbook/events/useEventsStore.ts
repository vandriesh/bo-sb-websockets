import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createEventsSlice, type EventsSlice } from '../../common/store/createEventsSlice';

interface BetslipBet {
  eventId: string;
  selectionId: string;
  stake?: number;
}

interface SportsBookState extends EventsSlice {
  priceChanges: Record<string, 'up' | 'down'>;
  setPriceChange: (id: string, direction: 'up' | 'down') => void;
  clearPriceChange: (id: string) => void;
  
  bets: BetslipBet[];
  addBet: (eventId: string, selectionId: string) => void;
  removeBet: (selectionId: string) => void;
  removeBetsByEventId: (eventId: string) => void;
  updateStake: (selectionId: string, stake: number) => void;
  clearBetslip: () => void;
}

export const useSportsBookStore = create<SportsBookState>()(
  devtools(
    persist(
      (set) => ({
        ...createEventsSlice(set, 'sportsbook'),
        
        priceChanges: {},
        setPriceChange: (id, direction) => {
          set(
            (state) => ({
              priceChanges: { ...state.priceChanges, [id]: direction }
            }),
            false,
            'sportsbook/setPriceChange'
          );
        },
        clearPriceChange: (id) => {
          set(
            (state) => {
              const newChanges = { ...state.priceChanges };
              delete newChanges[id];
              return { priceChanges: newChanges };
            },
            false,
            'sportsbook/clearPriceChange'
          );
        },

        bets: [],
        addBet: (eventId, selectionId) => {
          set(
            (state) => {
              if (state.bets.some(bet => bet.selectionId === selectionId)) {
                return state;
              }
              return { bets: [...state.bets, { eventId, selectionId }] };
            },
            false,
            'sportsbook/addBet'
          );
        },
        removeBet: (selectionId) => {
          set(
            (state) => ({
              bets: state.bets.filter(bet => bet.selectionId !== selectionId)
            }),
            false,
            'sportsbook/removeBet'
          );
        },
        removeBetsByEventId: (eventId) => {
          set(
            (state) => ({
              bets: state.bets.filter(bet => bet.eventId !== eventId)
            }),
            false,
            'sportsbook/removeBetsByEventId'
          );
        },
        updateStake: (selectionId, stake) => {
          set(
            (state) => ({
              bets: state.bets.map(bet => 
                bet.selectionId === selectionId ? { ...bet, stake } : bet
              )
            }),
            false,
            'sportsbook/updateStake'
          );
        },
        clearBetslip: () => {
          set({ bets: [] }, false, 'sportsbook/clear');
        }
      }),
      {
        name: 'sportsbook-storage'
      }
    ),
    {
      name: 'Sportsbook Store',
      enabled: true
    }
  )
);