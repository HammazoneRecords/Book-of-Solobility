import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation, AnimatePresence } from 'motion/react';
import { useUserStore } from '../store';

export default function Threshold() {
  const [inputName, setInputName] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [receipt, setReceipt] = useState('');
  const [selectedGate, setSelectedGate] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [showAnalyticsInput, setShowAnalyticsInput] = useState(false);
  const [analyticsCode, setAnalyticsCode] = useState('');
  const [isVerifyingAnalytics, setIsVerifyingAnalytics] = useState(false);

  const setName = useUserStore((state) => state.setName);
  const navigate = useNavigate();
  const controls = useAnimation();

  useEffect(() => {
    const intensity = Math.min(inputName.length * 0.1, 1);
    controls.start({
      scale: 1 + intensity * 0.5,
      opacity: 0.1 + intensity * 0.4,
      rotate: intensity * 90,
      transition: { duration: 1.2, ease: "easeOut" }
    });
  }, [inputName, controls]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName.trim()) {
      setName(inputName.trim());
      navigate('/gates');
    }
  };

  const handleAnalyticsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analyticsCode.trim()) return;

    const code = analyticsCode.trim().toUpperCase();

    setIsVerifyingAnalytics(true);
    try {
      // Try admin auth first
      const adminRes = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      if (adminRes.ok) {
        navigate('/dashboard');
        return;
      }

      // Otherwise treat as receipt lookup
      const response = await fetch(`/api/verify-receipt?receipt=${encodeURIComponent(code)}`);
      const data = await response.json();
      if (data.success) {
        const { session_id, gate, user_name, tier } = data.purchase;
        navigate(`/reader?session_id=${session_id}&gate=${gate}&name=${encodeURIComponent(user_name)}&tier=${tier}&restored=true`);
      } else {
        alert('Invalid receipt number or admin code.');
      }
    } catch (error) {
      alert('The system is unresponsive. Try again later.');
    } finally {
      setIsVerifyingAnalytics(false);
    }
  };

  const handleReturningUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receipt || !selectedGate) return;

    setIsVerifying(true);
    try {
      const response = await fetch(`/api/verify-receipt?receipt=${receipt}&gate=${selectedGate}`);
      const data = await response.json();
      if (data.success) {
        const { session_id, gate, user_name, tier } = data.purchase;
        navigate(`/confirmation?session_id=${session_id}&gate=${gate}&name=${encodeURIComponent(user_name)}&tier=${tier}&restored=true`);
      } else {
        alert('The path remains closed. Check your credentials.');
      }
    } catch (error) {
      alert('The gate is unresponsive. Try again later.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#050505]">
      {/* Dynamic ambient background */}
      <motion.div
        animate={controls}
        initial={{ scale: 1, opacity: 0.1, rotate: 0 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div className="w-[100vw] h-[100vw] max-w-[1000px] max-h-[1000px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,208,255,0.15)_0%,transparent_70%)] blur-3xl" />
      </motion.div>

      {/* Secondary reactive orb */}
      <motion.div
        animate={{
          scale: 1 + Math.min(inputName.length * 0.05, 0.5),
          opacity: 0.05 + Math.min(inputName.length * 0.02, 0.2),
          x: Math.sin(inputName.length) * 20,
          y: Math.cos(inputName.length) * 20,
        }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,208,255,0.2)_0%,transparent_60%)] blur-3xl pointer-events-none"
      />

      {/* Tertiary reactive orb */}
      <motion.div
        animate={{
          scale: 1 + Math.min(inputName.length * 0.08, 0.6),
          opacity: 0.05 + Math.min(inputName.length * 0.03, 0.2),
          x: Math.cos(inputName.length) * -30,
          y: Math.sin(inputName.length) * -30,
        }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(0,208,255,0.15)_0%,transparent_60%)] blur-3xl pointer-events-none"
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="z-10 w-full max-w-lg flex flex-col items-center p-12 md:p-16 rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/5 shadow-[0_0_80px_rgba(0,208,255,0.05)] relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
        <div className="relative mb-16 w-full flex justify-center">
          <motion.h1
            className="text-4xl md:text-5xl font-light tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 text-center"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ textShadow: '0 0 30px rgba(0, 208, 255, 0.2)' }}
          >
            what is sol<span
              onClick={() => setShowLogin(!showLogin)}
              className="cursor-pointer text-[#00d0ff] hover:text-white transition-colors duration-500"
              style={{ textShadow: '0 0 20px rgba(0, 208, 255, 0.6)' }}
            >o</span>b?
          </motion.h1>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-max opacity-50 flex flex-col items-center">
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#00d0ff] to-transparent mb-2" />
            <p className="text-[9px] uppercase tracking-[0.5em] text-[#00d0ff]">Volume One</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!showLogin ? (
            <motion.form
              key="start-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSubmit}
              className="w-full flex flex-col items-center space-y-10"
            >
              <div className="w-full relative group">
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="State the name of the Source"
                  className="w-full bg-transparent border-b border-white/10 pb-4 text-center text-xl font-serif italic focus:outline-none focus:border-transparent transition-colors duration-500 text-gray-200 placeholder:text-gray-700 tracking-wide"
                  required
                />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-gradient-to-r from-transparent via-[#00d0ff] to-transparent transition-all duration-700 group-focus-within:w-full opacity-70" />
              </div>

              <motion.button
                type="submit"
                disabled={!inputName.trim()}
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 208, 255, 0.05)' }}
                whileTap={{ scale: 0.98 }}
                animate={inputName.trim() ? { boxShadow: ['0px 0px 0px rgba(0,208,255,0)', '0px 0px 20px rgba(0,208,255,0.4)', '0px 0px 0px rgba(0,208,255,0)'], borderColor: ['rgba(255,255,255,0.1)', 'rgba(0,208,255,0.5)', 'rgba(255,255,255,0.1)'] } : {}}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="px-8 py-3.5 border border-white/10 rounded-full text-xs uppercase tracking-[0.2em] text-gray-400 hover:text-[#00d0ff] hover:border-[#00d0ff]/50 transition-all duration-500 disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-gray-400 disabled:hover:bg-transparent"
              >
                Begin Reflection
              </motion.button>
            </motion.form>
          ) : (
            <motion.form
              key="login-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleReturningUser}
              className="w-full flex flex-col items-center space-y-6"
            >
              <div className="w-full space-y-4">
                <input
                  type="text"
                  value={receipt}
                  onChange={(e) => setReceipt(e.target.value)}
                  placeholder="Receipt Number (SOLOB-XXXX)"
                  className="w-full bg-transparent border-b border-gray-800 pb-2 text-center text-sm focus:outline-none focus:border-[#00d0ff] transition-colors placeholder:text-gray-700"
                  required
                />
                <select
                  value={selectedGate}
                  onChange={(e) => setSelectedGate(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-800 pb-2 text-center text-sm focus:outline-none focus:border-[#00d0ff] transition-colors text-gray-400"
                  required
                >
                  <option value="" disabled className="bg-[#050505]">Select Your Gate</option>
                  <option value="N" className="bg-[#050505]">Syla (N)</option>
                  <option value="NE" className="bg-[#050505]">Zayn (NE)</option>
                  <option value="E" className="bg-[#050505]">Lomi (E)</option>
                  <option value="SE" className="bg-[#050505]">Vorak (SE)</option>
                  <option value="S" className="bg-[#050505]">Khem (S)</option>
                  <option value="SW" className="bg-[#050505]">Bara (SW)</option>
                  <option value="W" className="bg-[#050505]">Tara (W)</option>
                  <option value="NW" className="bg-[#050505]">Oron (NW)</option>
                </select>
              </div>

              <motion.button
                type="submit"
                disabled={isVerifying}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-2 border border-gray-800 rounded-full text-[10px] uppercase tracking-[0.3em] text-gray-500 hover:text-[#00d0ff] hover:border-[#00d0ff] transition-all duration-500"
              >
                {isVerifying ? 'Verifying...' : 'Restore Access'}
              </motion.button>

              <button
                type="button"
                onClick={() => setShowLogin(false)}
                className="text-[8px] uppercase tracking-widest text-gray-700 hover:text-gray-500 transition-colors"
              >
                Return to Start
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Subtle Dashboard Link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        whileHover={{ opacity: 0.8 }}
        className="absolute bottom-8 right-8 z-20 flex flex-col items-end gap-3"
      >
        <AnimatePresence>
          {showAnalyticsInput && (
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleAnalyticsSubmit}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={analyticsCode}
                onChange={(e) => setAnalyticsCode(e.target.value)}
                placeholder="Enter Code or Receipt"
                className="bg-black/50 border border-gray-800 px-3 py-1.5 text-[10px] uppercase tracking-widest text-gray-300 focus:outline-none focus:border-[#00d0ff] transition-colors rounded"
                autoFocus
              />
              <button
                type="submit"
                disabled={isVerifyingAnalytics}
                className="text-[#00d0ff] text-[10px] uppercase tracking-widest hover:text-white px-2 py-1.5 border border-[#00d0ff]/30 rounded hover:border-[#00d0ff] transition-colors"
              >
                {isVerifyingAnalytics ? '...' : 'Go'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
        <button
          onClick={() => setShowAnalyticsInput(!showAnalyticsInput)}
          className="text-[10px] uppercase tracking-[0.3em] text-gray-600 hover:text-[#00d0ff] transition-colors duration-500 flex items-center gap-2"
        >
          <div className="w-1 h-1 bg-current rounded-full" />
          System Analytics
        </button>
      </motion.div>
    </div>
  );
}
