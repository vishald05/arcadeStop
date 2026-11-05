import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotificationToast from './components/NotificationToast';
import Home from './pages/Home';
import Arcade from './pages/Arcade';
import Records from './pages/Records';
import GamePage from './pages/GamePage';
import { useGames } from './hooks/useGames';

export default function App() {
  const [toast, setToast] = useState(null);
  const { games, loading, error, refetch } = useGames();

  const handleNotify = ({ title, message, icon }) => {
    setToast({
      id: Date.now(),
      title,
      message,
      icon
    });
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  return (
    <>
      <Navbar />
      <Routes>
        <Route 
          path="/" 
          element={
            <Home 
              games={games} 
              loading={loading} 
              error={error} 
              onRetry={refetch} 
              onNotify={handleNotify} 
            />
          } 
        />
        <Route 
          path="/arcade" 
          element={
            <Arcade 
              games={games} 
              loading={loading} 
              error={error} 
              onRetry={refetch} 
              onNotify={handleNotify} 
            />
          } 
        />
        <Route path="/records" element={<Records />} />
        <Route 
          path="/games/:slug" 
          element={<GamePage games={games} loading={loading} error={error} />} 
        />
        {/* Fallback route */}
        <Route 
          path="*" 
          element={
            <Home 
              games={games} 
              loading={loading} 
              error={error} 
              onRetry={refetch} 
              onNotify={handleNotify} 
            />
          } 
        />
      </Routes>
      <Footer />

      {/* Global Notification Toast */}
      <NotificationToast toast={toast} onClose={handleCloseToast} />
    </>
  );
}
