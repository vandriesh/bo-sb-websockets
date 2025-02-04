import { useMemo } from 'react';
import type { Event, Selection } from '../../types';

interface BetslipBet {
  eventId: string;
  selectionId: string;
  stake?: number;
}

interface BetWithData extends BetslipBet {
  event: Event;
  selection: Selection;
}

export const useBetslipCalculations = (
  bets: BetslipBet[],
  events: Event[]
) => {
  const betsWithData = useMemo(() => {
    return bets
      .map(bet => {
        const event = events.find(e => e.id === bet.eventId);
        const selection = event?.selections.find(s => s.id === bet.selectionId);
        return {
          ...bet,
          event,
          selection
        };
      })
      .filter((bet): bet is BetWithData => 
        bet.event !== undefined && bet.selection !== undefined
      );
  }, [bets, events]);

  const totalStake = useMemo(() => 
    betsWithData.reduce((sum, bet) =>
      bet.event.suspended ? sum : sum + (bet.stake || 0)
    , 0)
  , [betsWithData]);

  const potentialWinnings = useMemo(() => 
    betsWithData.reduce((sum, bet) =>
      bet.event.suspended ? sum : sum + (bet.stake || 0) * bet.selection.price
    , 0)
  , [betsWithData]);

  const hasActiveBets = useMemo(() => 
    betsWithData.some(bet => !bet.event.suspended)
  , [betsWithData]);

  return {
    betsWithData,
    totalStake,
    potentialWinnings,
    hasActiveBets
  };
};