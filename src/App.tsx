import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { SportsBook } from './components/SportsBook';
import { BackOffice } from './components/BackOffice';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-lg mb-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex space-x-8">
                <Link
                  to="/"
                  className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-gray-600"
                >
                  Sportsbook
                </Link>
                <Link
                  to="/backoffice"
                  className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-gray-600"
                >
                  Back Office
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<SportsBook />} />
          <Route path="/backoffice" element={<BackOffice />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;