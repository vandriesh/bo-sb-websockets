import React from 'react';
import { useEventsStore } from './useEventsStore';
import { enhancedSocket } from '../../socket';

export const usePriceUpdate = (eventId: string) => {
  const { updateSelectionPrice } = useEventsStore();
  const [updating, setUpdating] = React.useState<string | null>(null);
  const [updateDirection, setUpdateDirection] = React.useState<'up' | 'down' | null>(null);
  const pendingUpdateRef = React.useRef<{ id: string; price: number; direction: 'up' | 'down' } | null>(null);
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handlePriceUpdate = React.useCallback((id: string, newPrice: number, direction: 'up' | 'down') => {
    updateSelectionPrice(eventId, id, newPrice);
    pendingUpdateRef.current = { id, price: newPrice, direction };

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (pendingUpdateRef.current) {
        const { id, price, direction } = pendingUpdateRef.current;
        setUpdating(id);
        setUpdateDirection(direction);
        
        enhancedSocket.emitEventUpdate(eventId, {
          type: 'ODDS_UPDATE',
          payload: {
            id: eventId,
            selections: [{ id, price }]
          }
        });

        setTimeout(() => {
          setUpdating(null);
          setUpdateDirection(null);
        }, 500);

        pendingUpdateRef.current = null;
      }
    }, 300);
  }, [eventId, updateSelectionPrice]);

  React.useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    updating,
    updateDirection,
    handlePriceUpdate
  };
};