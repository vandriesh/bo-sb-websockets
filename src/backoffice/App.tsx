import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BackOffice } from './components/BackOffice';
import { WSLogger } from '../common/components/WSLogger';
import { initializeSocketListeners, cleanupSocketListeners } from '../common/socket/bo-socket';
import '../index.css';

const queryClient = new QueryClient();

function App() {
  useEffect(() => {
    initializeSocketListeners();
    return () => {
      cleanupSocketListeners();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100">
        <BackOffice />
        <WSLogger title="Back Office" />
      </div>
    </QueryClientProvider>
  );
}

export default App;