import { useCallback } from 'react';
import { useSubscriptionManager } from './useSubscriptionManager';

export const useWSMonitor = () => {
  const { getSubscriptionSummary } = useSubscriptionManager();
  
  const summary = getSubscriptionSummary();

  return {
    summary
  };
};