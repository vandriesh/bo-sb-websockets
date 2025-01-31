import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createEventsSlice, type EventsSlice } from '../../common/store/createEventsSlice';
import type { Event } from '../../types';

interface BetslipBet {
  eventId: string;
  selectionId: string;
  stake?: number;
}

interface SportsBookState extends EventsSlice {
  // Events-related state
  priceChanges: Record<string, 'up' | 'down'>;
  setPriceChange: (id: string, direction: 'up' | 'down') => void;
  clearPriceChange: (id: string) => void;
  
  // Betslip-related state
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
      (set, get) => ({
        // Events slice with debug logging
        ...createEventsSlice(set, 'sportsbook', (state) => {
          console.log('🎮 [SB Store] Current state:', state);
        }),
        
        // Price changes
        priceChanges: {},
        setPriceChange: (id, direction) => {
          console.log('Setting price change:', { id, direction });
          set(
            (state) => {
              console.log('🎮 [SB Store] Setting price change, current state:', state);
              return {
                priceChanges: { ...state.priceChanges, [id]: direction }
              };
            },
            false,
            'sportsbook/setPriceChange'
          );
        },
        clearPriceChange: (id) => {
          console.log('Clearing price change:', id);
          set(
            (state) => {
              console.log('🎮 [SB Store] Clearing price change, current state:', state);
              const newChanges = { ...state.priceChanges };
              delete newChanges[id];
              return { priceChanges: newChanges };
            },
            false,
            'sportsbook/clearPriceChange'
          );
        },

        // Betslip
        bets: [],
        addBet: (eventId, selectionId) => {
          console.log('Adding bet:', { eventId, selectionId });
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
          console.log('Removing bet:', selectionId);
          set(
            (state) => ({
              bets: state.bets.filter(bet => bet.selectionId !== selectionId)
            }),
            false,
            'sportsbook/removeBet'
          );
        },
        removeBetsByEventId: (eventId) => {
          console.log('Removing bets for event:', eventId);
          set(
            (state) => ({
              bets: state.bets.filter(bet => bet.eventId !== eventId)
            }),
            false,
            'sportsbook/removeBetsByEventId'
          );
        },
        updateStake: (selectionId, stake) => {
          console.log('Updating stake:', { selectionId, stake });
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
          console.log('Clearing betslip');
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