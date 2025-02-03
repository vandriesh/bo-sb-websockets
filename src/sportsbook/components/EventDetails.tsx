import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowUpCircle, ArrowDownCircle, ArrowLeft, Lock } from 'lucide-react';
import { useSportsBookStore } from '../store';

export const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { events, priceChanges, bets, addBet, removeBet } = useSportsBookStore();

  const event = events.find(e => e.id === id);

  const handleSelectionClick = (selection: any) => {
    if (!event) return;
    
    const isSelected = bets.some(bet => bet.selectionId === selection.id);
    if (isSelected) {
      removeBet(selection.id);
    } else {
      addBet(event.id, selection.id);
    }
  };

  if (!event) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>
        <p className="text-gray-600">Loading event details...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Events
      </Link>
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{event.name}</h1>
        {event.suspended && (
          <div className="flex items-center text-red-500">
            <Lock className="w-5 h-5 mr-2" />
            <span className="font-medium">Event Suspended</span>
          </div>
        )}
      </div>
      
      <div className="space-y-6">
        {event.selections.map((selection) => {
          const isSelected = bets.some(bet => bet.selectionId === selection.id);
          return (
            <div key={selection.id} className="flex justify-between items-center border-b pb-4 last:border-b-0">
              <div>
                <h2 className="text-lg font-semibold">{event.market}</h2>
                <p className="text-gray-600">{selection.name}</p>
              </div>
              <button
                onClick={() => handleSelectionClick(selection)}
                className={`flex items-center px-4 py-2 rounded transition-colors ${
                  isSelected 
                    ? 'bg-blue-100 text-blue-700' 
                    : event.suspended
                    ? 'bg-gray-100 text-gray-500'
                    : 'hover:bg-gray-100'
                }`}
              >
                {!event.suspended && (
                  <>
                    {priceChanges[selection.id] === 'up' && <ArrowUpCircle className="mr-2 text-green-500" />}
                    {priceChanges[selection.id] === 'down' && <ArrowDownCircle className="mr-2 text-red-500" />}
                  </>
                )}
                {event.suspended && <Lock className="mr-2 w-4 h-4" />}
                <span className={`text-2xl font-bold ${
                  event.suspended ? 'text-gray-500' :
                  priceChanges[selection.id] === 'up' ? 'text-green-500' :
                  priceChanges[selection.id] === 'down' ? 'text-red-500' : ''
                }`}>
                  {selection.price.toFixed(2)}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};