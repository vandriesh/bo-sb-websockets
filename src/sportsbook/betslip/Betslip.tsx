import React from 'react';
import { X, Trash2, ArrowUpCircle, ArrowDownCircle, Lock } from 'lucide-react';
import { useSportsBookStore } from '../events/useEventsStore';
import { useBetslipCalculations } from './useBetslipCalculations';

export const Betslip = () => {
  const { bets, events, priceChanges, removeBet, updateStake, clearBetslip } = useSportsBookStore();
  const { betsWithData, totalStake, potentialWinnings, hasActiveBets } = useBetslipCalculations(bets, events);

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
          onClick={clearBetslip}
          className="text-gray-500 hover:text-gray-700"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {betsWithData.map(({ event, selection, stake }) => (
          <div 
            key={selection.id} 
            className={`p-4 border-b ${event.suspended ? 'bg-gray-50' : ''}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{event.name}</p>
                  {event.suspended && (
                    <span className="inline-flex items-center text-red-500 text-sm">
                      <Lock className="w-3 h-3 mr-1" />
                      Suspended
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{selection.name}</p>
              </div>
              <button
                onClick={() => removeBet(selection.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <input
                type="number"
                min="0"
                step="0.1"
                value={stake || ''}
                onChange={(e) => updateStake(selection.id, parseFloat(e.target.value) || 0)}
                placeholder="Stake"
                disabled={event.suspended}
                className={`w-24 px-2 py-1 border rounded text-right ${
                  event.suspended 
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                    : ''
                }`}
              />
              <div className="flex items-center">
                {event.suspended ? (
                  <Lock className="w-4 h-4 text-gray-400 mr-2" />
                ) : (
                  <>
                    {priceChanges[selection.id] === 'up' && <ArrowUpCircle className="mr-1 w-4 h-4 text-green-500" />}
                    {priceChanges[selection.id] === 'down' && <ArrowDownCircle className="mr-1 w-4 h-4 text-red-500" />}
                  </>
                )}
                <span className={`font-semibold ${
                  event.suspended ? 'text-gray-400' :
                  priceChanges[selection.id] === 'up' ? 'text-green-500' :
                  priceChanges[selection.id] === 'down' ? 'text-red-500' : ''
                }`}>
                  {selection.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
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
};