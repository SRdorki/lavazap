import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Painel from './pages/Painel';
import BookingPage from './pages/BookingPage';
import ProtectedRoute from './components/ProtectedRoute';
import SuperAdmin from './pages/SuperAdmin';
import SuperAdminRoute from './components/SuperAdminRoute';
import CookiesPage from './pages/CookiesPage';
import PrivacyPage from './pages/PrivacyPage';
import CheckoutPage from './pages/CheckoutPage';

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
    });
    
    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        {/* Rotas específicas ANTES do wildcard /:slug */}
        <Route path="/checkout/:id" element={<CheckoutPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/privacidade" element={<PrivacyPage />} />
        <Route 
          path="/painel" 
          element={
            <ProtectedRoute>
              <Painel />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <SuperAdminRoute>
              <SuperAdmin />
            </SuperAdminRoute>
          } 
        />
        {/* Wildcard por último para não capturar rotas específicas */}
        <Route path="/:slug" element={<BookingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
