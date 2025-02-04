import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EventList } from './events/EventList';
import { WSLogger } from '../common/components/WSLogger';
import '../index.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100 p-8">
        <EventList />
        <WSLogger title="Back Office" />
      </div>
    </QueryClientProvider>
  );
}

export default App;