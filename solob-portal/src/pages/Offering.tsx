import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useUserStore } from '../store';
import { Glyph } from '../components/Glyph';
import { clsx } from 'clsx';

const gateToGlyphName: Record<string, string> = {
  N: 'Syla',
  NE: 'Zayn',
  E: 'Lomi',
  SE: 'Vorak',
  S: 'Khem',
  SW: 'Bara',
  W: 'Tara',
  NW: 'Oron'
};

export default function Offering() {
  const { name, gate, name: storedName, gate: storedGate, sessionId: storedSessionId, tier: storedTier } = useUserStore();
  const glyphName = gate ? gateToGlyphName[gate] || gate : '';
  const [isLoading, setIsLoading] = useState(false);
  const [mainOption, setMainOption] = useState<'free' | 'pay_later' | null>(null);
  const [lockedOption, setLockedOption] = useState<'free' | 'pay_later' | null>(null);
  const [subOption, setSubOption] = useState<'standard' | 'premium' | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // If they already have a session, don't let them go through the offering again
    if (storedSessionId) {
      navigate(`/reader?session_id=${storedSessionId}&gate=${storedGate}&name=${encodeURIComponent(storedName)}&tier=${storedTier}&restored=true`, { replace: true });
      return;
    }

    if (mainOption && !lockedOption) {
      const timer = setTimeout(() => {
        setLockedOption(mainOption);
      }, 3000); // 3 seconds to fade out completely
      return () => clearTimeout(timer);
    }
  }, [mainOption, lockedOption]);

  const handleCheckout = async () => {
    if (!mainOption) return;
    if (mainOption === 'pay_later' && !subOption) return;

    setIsLoading(true);

    const tier = mainOption === 'free' ? 'free' : subOption;

    try {
      const response = await fetch('/api/forge-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gate, name, tier })
      });

      const data = await response.json();
      if (data.url) {
        navigate(data.url);
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setIsLoading(false);
      alert('The path is currently blocked. Please try again later.');
    }
  };

  const isProceedDisabled = isLoading || !mainOption || (mainOption === 'pay_later' && !subOption);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0a0a0a] relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,208,255,0.05)_0%,transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="z-10 w-full max-w-5xl flex flex-col items-center justify-center gap-8 md:flex-row md:gap-12"
      >
        {/* Book Mockup */}
        <motion.div
          className="relative w-52 h-[20rem] sm:w-72 sm:h-[28rem] bg-[#111] rounded-r-xl rounded-l-sm shadow-2xl border border-gray-800 overflow-hidden flex-shrink-0 group"
          whileHover={{ rotateY: -10, rotateX: 5, scale: 1.05 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ transformStyle: 'preserve-3d', perspective: '1200px', boxShadow: '20px 20px 50px rgba(0,0,0,0.5), inset 2px 0 5px rgba(255,255,255,0.1)' }}
        >
          {/* Book spine effect */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/80 to-transparent z-20 pointer-events-none" />

          {/* Lighting effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 pointer-events-none mix-blend-overlay" />

          <div className="absolute inset-0 flex flex-col items-center justify-between py-12 px-6 z-10">
            <div className="text-center">
              <h2 className="text-gray-500 uppercase tracking-[0.3em] text-xs mb-2">The Book of</h2>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-200 tracking-widest uppercase">SOLOBILITY</h1>
            </div>

            <div className="my-8 flex-1 flex items-center justify-center">
              {gate && <Glyph type={gate as any} className="w-32 h-32 opacity-80" />}
            </div>

            <div className="text-center w-full border-t border-gray-800 pt-4">
              <p className="text-gray-400 text-xs uppercase tracking-widest">Prepared for</p>
              <p className="text-[#00d0ff] font-serif italic mt-1 text-lg">{name}</p>

              <div className="mt-6 flex flex-col items-center justify-center opacity-60">
                <img src="/mwlogo.svg" alt="MindwaveJA Logo" className="w-6 h-6 mb-1" />
                <p className="text-gray-600 text-[6px] uppercase tracking-[0.5em]">MindwaveJA</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Purchase Details */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-xl w-full">
          <h2 className="text-2xl sm:text-3xl font-light tracking-widest text-gray-200 mb-2">Your Reflection is Ready</h2>
          <p className="text-xl text-[#00d0ff] font-serif italic mb-6">
            The Book of Solobility: {glyphName} Edition
          </p>
          <p className="text-gray-400 leading-relaxed mb-8 font-serif italic">
            The {glyphName} Gate has been opened. Your personalized guide to alignment and clarity awaits. This digital tome is uniquely forged with your essence.
          </p>

          {/* Main Options */}
          <motion.div layout className={clsx("grid gap-4 w-full mb-6", lockedOption ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
            <AnimatePresence mode="popLayout">
              {(!lockedOption || lockedOption === 'pay_later') && (
                <motion.div
                  key="pay_later"
                  layout
                  initial={{ opacity: 1 }}
                  animate={{ opacity: (mainOption && mainOption !== 'pay_later') ? 0 : 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                  onClick={() => !lockedOption && setMainOption('pay_later')}
                  className={clsx(
                    "border p-4 rounded cursor-pointer flex items-center justify-center text-sm uppercase tracking-widest transition-colors duration-300",
                    mainOption === 'pay_later'
                      ? "border-[#00d0ff] text-[#00d0ff] shadow-[0_0_15px_rgba(0,208,255,0.2)] bg-[#00d0ff]/5"
                      : "border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300"
                  )}
                >
                  Pay Later
                </motion.div>
              )}
              {(!lockedOption || lockedOption === 'free') && (
                <motion.div
                  key="free"
                  layout
                  initial={{ opacity: 1 }}
                  animate={{ opacity: (mainOption && mainOption !== 'free') ? 0 : 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                  onClick={() => !lockedOption && setMainOption('free')}
                  className={clsx(
                    "border p-4 rounded cursor-pointer flex items-center justify-center text-sm uppercase tracking-widest transition-colors duration-300",
                    mainOption === 'free'
                      ? "border-[#00d0ff] text-[#00d0ff] shadow-[0_0_15px_rgba(0,208,255,0.2)] bg-[#00d0ff]/5"
                      : "border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300"
                  )}
                >
                  Purchase For Free
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Sub Options (Only visible if Pay Later is selected) */}
          <AnimatePresence>
            {mainOption === 'pay_later' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full overflow-hidden mb-8"
              >
                <p className="text-gray-500 text-xs uppercase tracking-widest mb-3 text-center md:text-left">Select your edition:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div
                    onClick={() => setSubOption('standard')}
                    className={clsx(
                      "border p-4 rounded cursor-pointer transition-all duration-300 flex items-center justify-center text-sm uppercase tracking-widest",
                      subOption === 'standard'
                        ? "border-[#00d0ff] text-[#00d0ff] shadow-[0_0_15px_rgba(0,208,255,0.2)] bg-[#00d0ff]/5"
                        : "border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300"
                    )}
                  >
                    $77 Standard
                  </div>
                  <div
                    onClick={() => setSubOption('premium')}
                    className={clsx(
                      "border p-4 rounded cursor-pointer transition-all duration-300 flex items-center justify-center text-sm uppercase tracking-widest",
                      subOption === 'premium'
                        ? "border-[#00d0ff] text-[#00d0ff] shadow-[0_0_15px_rgba(0,208,255,0.2)] bg-[#00d0ff]/5"
                        : "border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300"
                    )}
                  >
                    $99 Standard
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handleCheckout}
            disabled={isProceedDisabled}
            whileHover={!isProceedDisabled ? { scale: 1.02 } : {}}
            whileTap={!isProceedDisabled ? { scale: 0.98 } : {}}
            className="w-full px-8 py-4 bg-[#00d0ff] text-black font-semibold uppercase tracking-[0.2em] rounded-sm hover:bg-white transition-colors duration-300 disabled:opacity-50 flex items-center justify-center mt-4"
          >
            {isLoading ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <span>Proceed on the Path</span>
            )}
          </motion.button>

          <p className="text-xs text-gray-600 mt-4 text-center w-full">
            Secure processing. Instant digital delivery.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
