import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Painel from './pages/Painel';
import BookingPage from './pages/BookingPage';
import ProtectedRoute from './components/ProtectedRoute';
import SuperAdmin from './pages/SuperAdmin';
import SuperAdminRoute from './components/SuperAdminRoute';
import CookiesPage from './pages/CookiesPage';
import PrivacyPage from './pages/PrivacyPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/:slug" element={<BookingPage />} />
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
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/privacidade" element={<PrivacyPage />} />
        {/* Redirect any unknown routes to Landing Page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
