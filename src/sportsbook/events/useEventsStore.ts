import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createEventsSlice, type EventsSlice } from '../../common/store/createEventsSlice';
import type { SelectionPriceChangePayload, EventUpdatePayload } from '../../types';

interface BetslipBet {
  eventId: string;
  selectionId: string;
  stake?: number;
}

interface SportsBookState extends EventsSlice {
  activeTab: 'live' | 'upcoming';
  setActiveTab: (tab: 'live' | 'upcoming') => void;

  priceChanges: Record<string, 'up' | 'down'>;
  setPriceChange: (id: string, direction: 'up' | 'down') => void;
  clearPriceChange: (id: string) => void;
  
  bets: BetslipBet[];
  addBet: (eventId: string, selectionId: string) => void;
  removeBet: (selectionId: string) => void;
  removeBetsByEventId: (eventId: string) => void;
  updateStake: (selectionId: string, stake: number) => void;
  clearBetslip: () => void;

  handlePriceChange: (eventId: string, payload: SelectionPriceChangePayload) => void;
  handleEventUpdate: (payload: EventUpdatePayload) => void;
}

export const useSportsBookStore = create<SportsBookState>()(
  devtools(
    persist(
      (set, get) => ({
        ...createEventsSlice(set, 'sportsbook'),
        
        activeTab: 'live',
        setActiveTab: (tab) => {
          set({ activeTab: tab }, false, 'sportsbook/setActiveTab');
        },

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
        },

        handlePriceChange: (eventId, payload) => {
          const { marketId, selectionId, price } = payload;
          console.log('🎮 [Store] Handling price change:', { eventId, marketId, selectionId, price });

          // Find current price to determine direction
          const event = get().events.find(e => e.id === eventId);
          const currentPrice = event?.markets
            .find(m => m.id === marketId)
            ?.selections
            .find(s => s.id === selectionId)
            ?.price;

          if (currentPrice !== undefined && price !== currentPrice) {
            // Set price change direction
            const direction = price > currentPrice ? 'up' : 'down';
            get().setPriceChange(selectionId.toString(), direction);

            // Update the price in the store
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
                                ? { ...selection, price }
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
              'sportsbook/handlePriceChange'
            );

            // Clear price change indicator after delay
            setTimeout(() => {
              get().clearPriceChange(selectionId.toString());
            }, 2000);
          }
        },

        handleEventUpdate: (payload) => {
          const { id, suspended } = payload;
          set(
            (state) => ({
              events: state.events.map(event =>
                event.id === id ? { ...event, suspended } : event
              )
            }),
            false,
            'sportsbook/handleEventUpdate'
          );
        }
      }),
      {
        name: 'sportsbook-storage',
        partialize: (state) => ({
          bets: state.bets,
          activeTab: state.activeTab
        })
      }
    ),
    {
      name: 'Sportsbook Store',
      enabled: true
    }
  )
);