import React, { useEffect } from 'react';
import { BackOffice } from './components/BackOffice';
import { initializeSocketListeners, cleanupSocketListeners } from '../common/socket/bo-socket';
import '../index.css';

function App() {
  useEffect(() => {
    initializeSocketListeners();
    return () => {
      cleanupSocketListeners();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <BackOffice />
    </div>
  );
}

export default App;