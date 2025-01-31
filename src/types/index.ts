export interface Selection {
  id: string;
  name: string;
  price: number;
}

export interface Event {
  id: string;
  name: string;
  market: string;
  selections: Selection[];
  timestamp: number;
  suspended?: boolean;
}

// WebSocket message types
export type WebSocketMessageType = 'ODDS_UPDATE' | 'EVENT_UPDATE';

export interface WebSocketMessage<T> {
  type: WebSocketMessageType;
  payload: T;
}

export interface OddsUpdate {
  id: string;
  selections: Array<{
    id: string;
    price: number;
  }>;
}

export interface EventUpdate {
  id: string;
  suspended: boolean;
}