export interface Selection {
  id: number;
  name: string;
  price: number;
}

export interface Market {
  id: number;
  name: string;
  selections: Selection[];
}

export interface Event {
  id: number;
  name: string;
  markets: Market[];
  timestamp: number;
  suspended?: boolean;
  status: 'live' | 'upcoming';
  startTime: string;
  score?: {
    home: number;
    away: number;
  };
  timeElapsed?: number;
}

export enum WsMessageType {
  SelectionPriceChange = 'SelectionPriceChange',
  EventStatusUpdate = 'EventStatusUpdate',
  ScoreUpdate = 'ScoreUpdate'
}

export interface SelectionPriceChangePayload {
  marketId: number;
  selectionId: number;
  price: number;
}

export interface EventUpdatePayload {
  id: number;
  suspended: boolean;
}

export interface ScoreUpdatePayload {
  id: number;
  score: {
    home: number;
    away: number;
  };
  timeElapsed: number;
}

export interface WebSocketMessage<T> {
  type: WsMessageType;
  payload: T;
}

export type SubscriptionSource = 
  | 'event_list'
  | 'market_list'
  | 'event_details'
  | 'market_details'
  | 'event_betslip'
  | 'market_betslip';

export interface SubscriptionTracker {
  sources: Set<SubscriptionSource>;
  unsubscribe: () => void;
}

export interface SubscriptionManager {
  events: Map<number, SubscriptionTracker>;
  markets: Map<number, SubscriptionTracker>;
}