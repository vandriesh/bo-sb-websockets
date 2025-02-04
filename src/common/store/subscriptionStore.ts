import { create } from 'zustand';
import type { SubscriptionSource } from '../types';

interface SubscriptionState {
  // Map of channel -> Set of sources that subscribe to it
  subscriptions: Map<string, Set<SubscriptionSource>>;
  
  // Add a source subscription to a channel
  addSubscription: (channel: string, source: SubscriptionSource) => void;
  
  // Remove a source subscription from a channel
  removeSubscription: (channel: string, source: SubscriptionSource) => void;
  
  // Get all sources for a channel
  getChannelSources: (channel: string) => Set<SubscriptionSource>;
  
  // Get summary of all subscriptions
  getSubscriptionSummary: () => Array<{
    channel: string;
    sources: SubscriptionSource[];
  }>;
  
  // Clear all subscriptions
  clear: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()((set, get) => ({
  subscriptions: new Map(),

  addSubscription: (channel, source) => set(state => {
    const newSubscriptions = new Map(state.subscriptions);
    if (!newSubscriptions.has(channel)) {
      newSubscriptions.set(channel, new Set());
    }
    newSubscriptions.get(channel)!.add(source);
    return { subscriptions: newSubscriptions };
  }),

  removeSubscription: (channel, source) => set(state => {
    const newSubscriptions = new Map(state.subscriptions);
    const sources = newSubscriptions.get(channel);
    if (sources) {
      sources.delete(source);
      if (sources.size === 0) {
        newSubscriptions.delete(channel);
      }
    }
    return { subscriptions: newSubscriptions };
  }),

  getChannelSources: (channel) => {
    return get().subscriptions.get(channel) || new Set();
  },

  getSubscriptionSummary: () => {
    const { subscriptions } = get();
    return Array.from(subscriptions.entries()).map(([channel, sources]) => ({
      channel,
      sources: Array.from(sources)
    }));
  },

  clear: () => set({ subscriptions: new Map() })
}));