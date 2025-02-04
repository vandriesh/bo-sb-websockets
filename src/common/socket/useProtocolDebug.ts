import { useEffect, useRef } from 'react';
import { ProtocolDevTools, MessageTypes } from './protocol';

export const useProtocolDebug = (enabled = process.env.NODE_ENV === 'development') => {
  const statsIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled) return;

    // Print stats every minute
    statsIntervalRef.current = setInterval(() => {
      console.group('WebSocket Protocol Stats');
      console.table(ProtocolDevTools.messageStats.getReport());
      console.groupEnd();
    }, 60000);

    return () => {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return {
    validateMessage: ProtocolDevTools.debugMessage,
    generateExample: ProtocolDevTools.generateExample,
    trackMessage: ProtocolDevTools.messageStats.track,
    getStats: ProtocolDevTools.messageStats.getReport
  };
};