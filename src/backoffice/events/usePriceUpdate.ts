import React from 'react';
import { useEventsStore } from './useEventsStore';
import { enhancedSocket } from '../../socket';
import { WsMessageType, type SelectionPriceChangePayload } from '../../types';

export const usePriceUpdate = (eventId: string) => {
  const { updateSelectionPrice } = useEventsStore();
  const [updating, setUpdating] = React.useState<string | null>(null);
  const [updateDirection, setUpdateDirection] = React.useState<'up' | 'down' | null>(null);
  const pendingUpdateRef = React.useRef<{ marketId: number; selectionId: string; price: number; direction: 'up' | 'down' } | null>(null);
  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handlePriceUpdate = React.useCallback((marketId: number, selectionId: string, newPrice: number, direction: 'up' | 'down') => {
    updateSelectionPrice(eventId, marketId, selectionId, newPrice);
    pendingUpdateRef.current = { marketId, selectionId, price: newPrice, direction };

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (pendingUpdateRef.current) {
        const { marketId, selectionId, price, direction } = pendingUpdateRef.current;
        setUpdating(selectionId);
        setUpdateDirection(direction);
        
        const payload: SelectionPriceChangePayload = {
          marketId,
          selectionId: Number(selectionId),
          price
        };

        // Use market-based channel for price updates
        enhancedSocket.emitPriceUpdate(marketId, {
          type: WsMessageType.SelectionPriceChange,
          payload
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