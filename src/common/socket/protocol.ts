// ID Ranges
export const IdRanges = {
  EVENT: {
    MIN: 1,
    MAX: 999,
    validate: (id: number) => id >= IdRanges.EVENT.MIN && id <= IdRanges.EVENT.MAX,
    generate: () => Math.floor(Math.random() * (IdRanges.EVENT.MAX - IdRanges.EVENT.MIN + 1)) + IdRanges.EVENT.MIN
  },
  MARKET: {
    MIN: 1000,
    MAX: 9999,
    validate: (id: number) => id >= IdRanges.MARKET.MIN && id <= IdRanges.MARKET.MAX,
    generate: () => Math.floor(Math.random() * (IdRanges.MARKET.MAX - IdRanges.MARKET.MIN + 1)) + IdRanges.MARKET.MIN
  },
  PRICE: {
    MIN: 10000,
    MAX: 99999,
    validate: (id: number) => id >= IdRanges.PRICE.MIN && id <= IdRanges.PRICE.MAX,
    generate: () => Math.floor(Math.random() * (IdRanges.PRICE.MAX - IdRanges.PRICE.MIN + 1)) + IdRanges.PRICE.MIN
  }
} as const;

// Channel name formatters
export const Channels = {
  event: (eventId: number) => `*:Event:${eventId}`,
  connect: 'connect',
  disconnect: 'disconnect',
  error: 'error',
  reconnect: 'reconnect'
} as const;

// Message Types
export const MessageTypes = {
  ODDS_UPDATE: 'ODDS_UPDATE',
  EVENT_UPDATE: 'EVENT_UPDATE',
  BETSLIP_UPDATE: 'BETSLIP_UPDATE',
  SYSTEM_EVENT: 'SYSTEM_EVENT'
} as const;

// Message Payloads
export interface OddsUpdatePayload {
  id: number;
  selections: Array<{
    id: number;
    price: number;
  }>;
}

export interface EventUpdatePayload {
  id: number;
  suspended: boolean;
}

export interface BetslipUpdatePayload {
  userId: string;
  bets: Array<{
    eventId: number;
    selectionId: number;
    stake?: number;
  }>;
}

export interface SystemEventPayload {
  type: string;
  message: string;
  timestamp: number;
}

// Message Type Guards with Detailed Validation
export const isOddsUpdate = (payload: any): payload is OddsUpdatePayload => {
  if (!payload || typeof payload !== 'object') return false;
  if (typeof payload.id !== 'number' || !IdRanges.EVENT.validate(payload.id)) return false;
  if (!Array.isArray(payload.selections)) return false;
  
  return payload.selections.every((s: any) => {
    if (typeof s.id !== 'number' || !IdRanges.PRICE.validate(s.id)) return false;
    if (typeof s.price !== 'number' || s.price <= 0) return false;
    return true;
  });
};

export const isEventUpdate = (payload: any): payload is EventUpdatePayload => {
  if (!payload || typeof payload !== 'object') return false;
  if (typeof payload.id !== 'number' || !IdRanges.EVENT.validate(payload.id)) return false;
  if (typeof payload.suspended !== 'boolean') return false;
  return true;
};

// Protocol Documentation with Examples and Validation
export const ProtocolDocs = {
  idRanges: {
    event: '1-999: Reserved for event IDs',
    market: '1000-9999: Reserved for market IDs',
    price: '10000-99999: Reserved for price IDs'
  },
  channels: {
    event: 'Messages for a specific event (*:Event:id)',
    system: 'System-level events (connect, disconnect, errors)'
  },
  messageTypes: {
    ODDS_UPDATE: 'Updates to selection prices',
    EVENT_UPDATE: 'Updates to event status (suspension)',
    BETSLIP_UPDATE: 'Updates to user betslip',
    SYSTEM_EVENT: 'System-level messages'
  },
  examples: {
    oddsUpdate: {
      channel: '*:Event:123',
      message: {
        type: MessageTypes.ODDS_UPDATE,
        payload: {
          id: 123,
          selections: [{ id: 10001, price: 2.5 }]
        }
      }
    },
    eventUpdate: {
      channel: '*:Event:123',
      message: {
        type: MessageTypes.EVENT_UPDATE,
        payload: {
          id: 123,
          suspended: true
        }
      }
    }
  },
  validate: {
    message: (type: keyof typeof MessageTypes, payload: any): boolean => {
      switch (type) {
        case MessageTypes.ODDS_UPDATE:
          return isOddsUpdate(payload);
        case MessageTypes.EVENT_UPDATE:
          return isEventUpdate(payload);
        default:
          return false;
      }
    },
    channel: (channel: string): boolean => {
      // Handle system channels
      if (['connect', 'disconnect', 'error', 'reconnect'].includes(channel)) {
        return true;
      }

      // Handle event channels
      const match = channel.match(/^\*:Event:(\d+)$/);
      if (!match) return false;
      
      const eventId = parseInt(match[1], 10);
      return IdRanges.EVENT.validate(eventId);
    }
  }
} as const;

// Development Tools
export const ProtocolDevTools = {
  generateExample: (type: keyof typeof MessageTypes) => {
    switch (type) {
      case MessageTypes.ODDS_UPDATE:
        return ProtocolDocs.examples.oddsUpdate;
      case MessageTypes.EVENT_UPDATE:
        return ProtocolDocs.examples.eventUpdate;
      default:
        throw new Error(`No example available for type: ${type}`);
    }
  },

  debugMessage: (channel: string, type: keyof typeof MessageTypes, payload: any) => {
    const isChannelValid = ProtocolDocs.validate.channel(channel);
    const isPayloadValid = ProtocolDocs.validate.message(type, payload);
    
    if (process.env.NODE_ENV === 'development') {
      console.group('WebSocket Message Debug');
      console.log('Channel:', channel, isChannelValid ? '✅' : '❌');
      console.log('Type:', type);
      console.log('Payload:', payload, isPayloadValid ? '✅' : '❌');
      console.groupEnd();
    }
    
    return isChannelValid && isPayloadValid;
  },

  messageStats: {
    counts: {} as Record<string, number>,
    lastSeen: {} as Record<string, number>,
    
    track: (type: keyof typeof MessageTypes) => {
      ProtocolDevTools.messageStats.counts[type] = 
        (ProtocolDevTools.messageStats.counts[type] || 0) + 1;
      ProtocolDevTools.messageStats.lastSeen[type] = Date.now();
    },
    
    getReport: () => {
      return Object.entries(ProtocolDevTools.messageStats.counts).map(([type, count]) => ({
        type,
        count,
        lastSeen: new Date(ProtocolDevTools.messageStats.lastSeen[type]).toISOString()
      }));
    }
  }
};