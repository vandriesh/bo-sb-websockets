export interface Odds {
  id: string;
  event: string;
  market: string;
  selection: string;
  price: number;
  timestamp: number;
}

export interface OddsUpdate {
  id: string;
  price: number;
}