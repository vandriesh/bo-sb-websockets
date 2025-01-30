import React, { useEffect, useState } from 'react';
import { socket } from '../socket';
import type { Odds } from '../types';
import { RefreshCw } from 'lucide-react';

export const BackOffice = () => {
  const [odds, setOdds] = useState<Odds[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    socket.on('initialOdds', (initialOdds: Odds[]) => {
      setOdds(initialOdds);
    });

    socket.on('oddsUpdate', (updatedOdd: Odds) => {
      setOdds(currentOdds => 
        currentOdds.map(odd => 
          odd.id === updatedOdd.id ? updatedOdd : odd
        )
      );
    });

    return () => {
      socket.off('initialOdds');
      socket.off('oddsUpdate');
    };
  }, []);

  const handlePriceUpdate = (id: string, newPrice: number) => {
    setUpdating(id);
    socket.emit('updateOdds', { id, price: newPrice });
    setTimeout(() => setUpdating(null), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Back Office - Odds Management</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          {odds.map((odd) => (
            <div key={odd.id} className="mb-6 last:mb-0 border-b pb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{odd.event}</h2>
                  <p className="text-gray-600">{odd.market} - {odd.selection}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handlePriceUpdate(odd.id, odd.price - 0.1)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    -0.1
                  </button>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold">{odd.price.toFixed(2)}</span>
                    {updating === odd.id && (
                      <RefreshCw className="ml-2 w-5 h-5 animate-spin text-blue-500" />
                    )}
                  </div>
                  <button
                    onClick={() => handlePriceUpdate(odd.id, odd.price + 0.1)}
                    className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                  >
                    +0.1
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};