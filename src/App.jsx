import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotificationToast from './components/NotificationToast';
import Home from './pages/Home';
import Arcade from './pages/Arcade';
import Records from './pages/Records';

export default function App() {
  const [toast, setToast] = useState(null);

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
        <Route path="/" element={<Home onNotify={handleNotify} />} />
        <Route path="/arcade" element={<Arcade onNotify={handleNotify} />} />
        <Route path="/records" element={<Records />} />
        {/* Fallback route */}
        <Route path="*" element={<Home onNotify={handleNotify} />} />
      </Routes>
      <Footer />

      {/* Global Notification Toast */}
      <NotificationToast toast={toast} onClose={handleCloseToast} />
    </>
  );
}
