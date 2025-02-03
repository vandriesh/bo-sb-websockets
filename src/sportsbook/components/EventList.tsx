import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpCircle, ArrowDownCircle, Lock } from 'lucide-react';
import { useSportsBookStore } from '../store';

export const EventList = () => {
  const { events, priceChanges, bets, addBet, removeBet } = useSportsBookStore();

  const handleSelectionClick = (event: any, selection: any) => {
    const isSelected = bets.some(bet => bet.selectionId === selection.id);
    if (isSelected) {
      removeBet(selection.id);
    } else {
      addBet(event.id, selection.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="grid grid-cols-[1fr,repeat(3,120px)] gap-4 p-4 bg-gray-50 border-b font-semibold">
        <div>Event</div>
        <div className="text-center">1</div>
        <div className="text-center">X</div>
        <div className="text-center">2</div>
      </div>

      <div className="divide-y">
        {events.map((event) => (
          <div key={event.id} className="grid grid-cols-[1fr,repeat(3,120px)] gap-4 p-4 items-center">
            <Link 
              to={`/${event.id}`}
              className="font-medium hover:text-blue-600"
            >
              {event.name}
              {event.suspended && (
                <span className="ml-2 inline-flex items-center text-red-500 text-sm">
                  <Lock className="w-4 h-4 mr-1" />
                  Suspended
                </span>
              )}
            </Link>
            {event.selections.map((selection) => {
              const isSelected = bets.some(bet => bet.selectionId === selection.id);
              return (
                <button
                  key={selection.id}
                  onClick={() => handleSelectionClick(event, selection)}
                  className={`flex items-center justify-center p-2 rounded transition-colors ${
                    isSelected 
                      ? 'bg-blue-100 text-blue-700' 
                      : event.suspended
                      ? 'bg-gray-100 text-gray-500'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {!event.suspended && (
                    <>
                      {priceChanges[selection.id] === 'up' && <ArrowUpCircle className="mr-1 w-4 h-4 text-green-500" />}
                      {priceChanges[selection.id] === 'down' && <ArrowDownCircle className="mr-1 w-4 h-4 text-red-500" />}
                    </>
                  )}
                  {event.suspended && <Lock className="mr-1 w-4 h-4" />}
                  <span className={`font-bold ${
                    event.suspended ? 'text-gray-500' :
                    priceChanges[selection.id] === 'up' ? 'text-green-500' :
                    priceChanges[selection.id] === 'down' ? 'text-red-500' : ''
                  }`}>
                    {selection.price.toFixed(2)}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};