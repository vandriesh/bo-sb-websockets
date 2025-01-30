import React, { useEffect, useState } from 'react';
import { socket } from '../socket';
import type { Odds } from '../types';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export const SportsBook = () => {
  const [odds, setOdds] = useState<Odds[]>([]);
  const [priceChanges, setPriceChanges] = useState<Record<string, 'up' | 'down'>>({});

  useEffect(() => {
    socket.on('initialOdds', (initialOdds: Odds[]) => {
      setOdds(initialOdds);
    });

    socket.on('oddsUpdate', (updatedOdd: Odds) => {
      setOdds(currentOdds => {
        const newOdds = currentOdds.map(odd => 
          odd.id === updatedOdd.id ? updatedOdd : odd
        );
        
        // Track price changes for animation
        setPriceChanges(prev => ({
          ...prev,
          [updatedOdd.id]: currentOdds.find(o => o.id === updatedOdd.id)?.price! < updatedOdd.price ? 'up' : 'down'
        }));

        // Clear animation after 2 seconds
        setTimeout(() => {
          setPriceChanges(prev => {
            const newChanges = { ...prev };
            delete newChanges[updatedOdd.id];
            return newChanges;
          });
        }, 2000);

        return newOdds;
      });
    });

    return () => {
      socket.off('initialOdds');
      socket.off('oddsUpdate');
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Live Odds</h1>
        <div className="bg-white rounded-lg shadow-lg p-6">
          {odds.map((odd) => (
            <div key={odd.id} className="mb-6 last:mb-0">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="text-xl font-semibold">{odd.event}</h2>
                  <p className="text-gray-600">{odd.market} - {odd.selection}</p>
                </div>
                <div className="flex items-center">
                  <span className={`text-2xl font-bold ${
                    priceChanges[odd.id] === 'up' ? 'text-green-500' :
                    priceChanges[odd.id] === 'down' ? 'text-red-500' : ''
                  }`}>
                    {odd.price.toFixed(2)}
                  </span>
                  {priceChanges[odd.id] === 'up' && <ArrowUpCircle className="ml-2 text-green-500" />}
                  {priceChanges[odd.id] === 'down' && <ArrowDownCircle className="ml-2 text-red-500" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};