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
}

export enum WsMessageType {
  SelectionPriceChange = 'SelectionPriceChange',
  EventUpdate = 'EVENT_UPDATE'
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

export interface WebSocketMessage<T> {
  type: WsMessageType;
  payload: T;
}