import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { EventList } from './components/EventList';
import { EventDetails } from './components/EventDetails';
import { Betslip } from './components/Betslip';
import { initializeSocketListeners, cleanupSocketListeners } from '../common/socket/sb-socket';
import '../index.css';

function App() {
  useEffect(() => {
    initializeSocketListeners();
    return () => {
      cleanupSocketListeners();
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-lg mb-8">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex h-16 items-center">
              <h1 className="text-xl font-bold">Sportsbook</h1>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 flex gap-8">
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<EventList />} />
              <Route path="/:id" element={<EventDetails />} />
            </Routes>
          </div>
          <div className="w-96 bg-white rounded-lg shadow-lg">
            <Betslip />
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App