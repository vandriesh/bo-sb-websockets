import React from 'react';
import { Trash2 } from 'lucide-react';
import { useSportsBookStore } from '../events/useEventsStore';
import { useBetslipCalculations } from './useBetslipCalculations';
import { BetslipItem } from './BetslipItem';

export const Betslip = React.memo(() => {
  const bets = useSportsBookStore(state => state.bets);
  const events = useSportsBookStore(state => state.events);
  const priceChanges = useSportsBookStore(state => state.priceChanges);
  const { removeBet, updateStake, clearBetslip } = useSportsBookStore();

  const { betsWithData, totalStake, potentialWinnings, hasActiveBets } = useBetslipCalculations(bets, events);

  const handleRemoveBet = React.useCallback((selectionId: string) => {
    removeBet(selectionId);
  }, [removeBet]);

  const handleUpdateStake = React.useCallback((selectionId: string, value: number) => {
    updateStake(selectionId, value);
  }, [updateStake]);

  const handleClearBetslip = React.useCallback(() => {
    clearBetslip();
  }, [clearBetslip]);

  if (bets.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <p>Your betslip is empty</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold">Betslip ({bets.length})</h2>
        <button
          onClick={handleClearBetslip}
          className="text-gray-500 hover:text-gray-700"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {betsWithData.map(({ event, selection, stake }) => (
          <BetslipItem
            key={selection.id}
            event={event}
            selection={selection}
            stake={stake}
            priceDirection={priceChanges[selection.id]}
            onRemove={handleRemoveBet}
            onStakeChange={handleUpdateStake}
          />
        ))}
      </div>

      <div className="border-t p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Total Stake:</span>
          <span className="font-semibold">${totalStake.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Potential Winnings:</span>
          <span className="font-semibold text-green-600">${potentialWinnings.toFixed(2)}</span>
        </div>
        <button
          disabled={!hasActiveBets}
          className={`w-full py-2 rounded-lg transition-colors ${
            hasActiveBets
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Place Bets
        </button>
      </div>
    </div>
  );
});

Betslip.displayName = 'Betslip';