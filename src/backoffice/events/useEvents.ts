import { useQuery } from '@tanstack/react-query';
import type { Event } from '../../types';

const fetchEvents = async (): Promise<Event[]> => {
  console.log('🔄 [BO] Fetching events...');
  const response = await fetch('http://localhost:3001/api/events', {
    // Add cache busting
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  });
  
  if (!response.ok) {
    console.error('❌ [BO] Failed to fetch events:', response.status, response.statusText);
    throw new Error('Failed to fetch events');
  }

  const data = await response.json();
  console.log('📦 [BO] Raw API response:', data);
  return data;
};

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    // // Disable caching
    // gcTime: 0,
    // staleTime: 0,
    // // Always refetch on mount
    // refetchOnMount: 'always',
    // // Log all state changes
    // onSuccess: (data) => {
    //   console.log('✨ [BO] Query succeeded:', {
    //     data,
    //     summary: {
    //       total: data.length,
    //       live: data.filter(e => e.status === 'live').length,
    //       upcoming: data.filter(e => e.status === 'upcoming').length,
    //       events: data.map(e => ({
    //         id: e.id,
    //         name: e.name,
    //         status: e.status,
    //         markets: e.markets?.length || 0,
    //         selections: e.markets?.reduce((acc, m) => acc + (m.selections?.length || 0), 0) || 0
    //       }))
    //     }
    //   });
    // },
    // onError: (error) => {
    //   console.error('❌ [BO] Query failed:', error);
    // }
  });
};