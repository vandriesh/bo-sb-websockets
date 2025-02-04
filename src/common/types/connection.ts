export interface ConnectionStatusData {
  isConnected: boolean;
  lastPing: number | null;
  reconnectAttempts: number;
  subscriptions: string[];
};