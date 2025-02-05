import type { SubscriptionSource } from '../../../types';

export interface Channel {
  channel: string;
  sources: SubscriptionSource[];
}

export interface WSMonitorProps {
  isConnected: boolean;
  activeTab?: 'live' | 'upcoming';
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
}

export interface MonitorHeaderProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  isConnected: boolean;
  activeTab?: 'live' | 'upcoming';
  totalChannels: number;
}

export interface ChannelListProps {
  eventChannels: Channel[];
  marketChannels: Channel[];
}