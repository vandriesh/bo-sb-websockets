import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Selection } from '../../types';

interface BetslipBet {
  eventId: string;
  eventName: string;
  selection: Selection;
  stake?: number;
}

interface BetslipState {
  bets: BetslipBet[];
  addBet: (eventId: string, eventName: string, selection: Selection) => void;
  removeBet: (selectionId: string) => void;
  removeBetsByEventId: (eventId: string) => void;
  updateStake: (selectionId: string, stake: number) => void;
  updateBetPrice: (selectionId: string, newPrice: number) => void;
  clearBetslip: () => void;
}

export const useBetslipStore = create<BetslipState>()(
  devtools(
    persist(
      (set) => ({
        bets: [],
        addBet: (eventId, eventName, selection) => {
          console.log('Adding bet:', { eventId, eventName, selection });
          set(
            (state) => {
              if (state.bets.some(bet => bet.selection.id === selection.id)) {
                return state;
              }
              return { bets: [...state.bets, { eventId, eventName, selection }] };
            },
            false,
            'betslip/addBet'
          );
        },
        removeBet: (selectionId) => {
          console.log('Removing bet:', selectionId);
          set(
            (state) => ({
              bets: state.bets.filter(bet => bet.selection.id !== selectionId)
            }),
            false,
            'betslip/removeBet'
          );
        },
        removeBetsByEventId: (eventId) => {
          console.log('Removing bets for event:', eventId);
          set(
            (state) => ({
              bets: state.bets.filter(bet => bet.eventId !== eventId)
            }),
            false,
            'betslip/removeBetsByEventId'
          );
        },
        updateStake: (selectionId, stake) => {
          console.log('Updating stake:', { selectionId, stake });
          set(
            (state) => ({
              bets: state.bets.map(bet => 
                bet.selection.id === selectionId ? { ...bet, stake } : bet
              )
            }),
            false,
            'betslip/updateStake'
          );
        },
        updateBetPrice: (selectionId, newPrice) => {
          console.log('Updating bet price:', { selectionId, newPrice });
          set(
            (state) => ({
              bets: state.bets.map(bet =>
                bet.selection.id === selectionId
                  ? { ...bet, selection: { ...bet.selection, price: newPrice } }
                  : bet
              )
            }),
            false,
            'betslip/updateBetPrice'
          );
        },
        clearBetslip: () => {
          console.log('Clearing betslip');
          set({ bets: [] }, false, 'betslip/clear');
        }
      }),
      {
        name: 'betslip-storage'
      }
    ),
    {
      name: 'Betslip Store',
      enabled: true
    }
  )
);