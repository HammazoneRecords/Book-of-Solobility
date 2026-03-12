import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useUserStore } from './store';
import Threshold from './pages/Threshold';
import GateSelection from './pages/GateSelection';
import Offering from './pages/Offering';
import Confirmation from './pages/Confirmation';
import Dashboard from './pages/Dashboard';
import Reader from './pages/Reader';
import BookDesigner from './pages/BookDesigner';

import { Home } from 'lucide-react';

function GlobalNav() {
  const navigate = useNavigate();

  return (
    <div className="fixed top-8 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <button
        onClick={() => {
          navigate('/confirmation');
        }}
        className="pointer-events-auto p-2 text-gray-500 hover:text-[#00d0ff] transition-colors duration-500"
        title="Return to Receipt & Confirmation"
      >
        <Home className="w-5 h-5 opacity-50 hover:opacity-100 transition-opacity" />
      </button>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { name, gate } = useUserStore();

  if (!name && window.location.pathname !== '/dashboard') {
    return <Navigate to="/" replace />;
  }

  if (!gate && window.location.pathname !== '/gates' && window.location.pathname !== '/dashboard') {
    return <Navigate to="/gates" replace />;
  }

  return <>{children}</>;
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(15px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(15px)' }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="w-full h-full min-h-screen relative"
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      {/* @ts-expect-error key is needed for AnimatePresence */}
      <Routes location={location} key={location.pathname.split('/')[1] || 'home'}>
        <Route path="/reader" element={<PageWrapper><Reader /></PageWrapper>} />
        <Route path="*" element={
          <PageWrapper>
            <GlobalNav />
            <Routes location={location}>
              <Route path="/" element={<Threshold />} />
              <Route path="/gates" element={<ProtectedRoute><GateSelection /></ProtectedRoute>} />
              <Route path="/offering" element={<ProtectedRoute><Offering /></ProtectedRoute>} />
              <Route path="/confirmation" element={<Confirmation />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/designer" element={<BookDesigner />} />
            </Routes>
          </PageWrapper>
        } />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans selection:bg-blue-900 selection:text-blue-100">
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  );
}
