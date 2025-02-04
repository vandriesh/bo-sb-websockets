export interface Selection {
  id: number;
  name: string;
  price: number;
}

export interface Event {
  id: number;
  name: string;
  market: number;
  selections: Selection[];
  timestamp: number;
  suspended?: boolean;
}

export type WebSocketMessageType = 'ODDS_UPDATE' | 'EVENT_UPDATE';

export interface WebSocketMessage<T> {
  type: WebSocketMessageType;
  payload: T;
}

export interface OddsUpdate {
  id: number;
  selections: Array<{
    id: number;
    price: number;
  }>;
}

export interface EventUpdate {
  id: number;
  suspended: boolean;
}