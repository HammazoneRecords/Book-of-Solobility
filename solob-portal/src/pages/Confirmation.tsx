import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useUserStore } from '../store';
import { Glyph } from '../components/Glyph';

import { QRCodeSVG } from 'qrcode.react';

const DownloadPyramid = ({ gate }: { gate: string | null }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);

  const handleDownload = () => {
    if (isSpinning || hasSpun) return;
    setIsSpinning(true);

    setTimeout(() => {
      setIsSpinning(false);
      setHasSpun(true);
      // Download the actual PDF
      const link = document.createElement('a');
      link.href = '/book-of-solobility-v0-ca620f6a_c.pdf';
      link.download = 'The_Book_of_Solobility_V0.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center mb-12 cursor-pointer group" onClick={handleDownload}>
      <div className="relative w-[120px] h-[120px] flex items-center justify-center" style={{ perspective: '1000px' }}>
        <AnimatePresence mode="wait">
          {!hasSpun ? (
            <motion.div
              key="pyramid"
              className="w-full h-full relative"
              style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-20deg)' }}
              exit={{ opacity: 0, scale: 0, rotateY: 1080 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="w-full h-full relative"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isSpinning ? 1080 : 0 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                whileHover={!isSpinning ? { scale: 1.1, rotateY: 15 } : {}}
              >
                {/* Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] bg-[#00d0ff] rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" style={{ transform: 'translateZ(-60px)' }} />

                {/* Front */}
                <div className="absolute top-0 left-0 w-0 h-0 border-l-[60px] border-r-[60px] border-b-[120px] border-l-transparent border-r-transparent" style={{ borderBottomColor: 'rgba(0,208,255,0.9)', transformOrigin: '50% 100%', transform: 'translateZ(60px) rotateX(30deg)' }} />
                {/* Back */}
                <div className="absolute top-0 left-0 w-0 h-0 border-l-[60px] border-r-[60px] border-b-[120px] border-l-transparent border-r-transparent" style={{ borderBottomColor: 'rgba(0,208,255,0.4)', transformOrigin: '50% 100%', transform: 'rotateY(180deg) translateZ(60px) rotateX(30deg)' }} />
                {/* Right */}
                <div className="absolute top-0 left-0 w-0 h-0 border-l-[60px] border-r-[60px] border-b-[120px] border-l-transparent border-r-transparent" style={{ borderBottomColor: 'rgba(0,208,255,0.6)', transformOrigin: '50% 100%', transform: 'rotateY(90deg) translateZ(60px) rotateX(30deg)' }} />
                {/* Left */}
                <div className="absolute top-0 left-0 w-0 h-0 border-l-[60px] border-r-[60px] border-b-[120px] border-l-transparent border-r-transparent" style={{ borderBottomColor: 'rgba(0,208,255,0.5)', transformOrigin: '50% 100%', transform: 'rotateY(-90deg) translateZ(60px) rotateX(30deg)' }} />
                {/* Bottom */}
                <div className="absolute top-0 left-0 w-[120px] h-[120px] shadow-[0_0_20px_rgba(0,208,255,0.5)]" style={{ backgroundColor: 'rgba(0,208,255,0.3)', transform: 'translateY(60px) rotateX(90deg)' }} />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="glyph"
              initial={{ opacity: 0, scale: 0, rotateY: -180 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {gate && <Glyph type={gate as any} className="w-32 h-32 opacity-100 drop-shadow-[0_0_15px_rgba(0,208,255,0.8)]" />}
              <motion.div
                className="absolute inset-0 bg-[#00d0ff] rounded-full blur-3xl -z-10"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-8 text-center h-6">
        <AnimatePresence mode="wait">
          {!hasSpun ? (
            <motion.span
              key="download-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[#00d0ff] text-xs uppercase tracking-[0.2em] font-semibold group-hover:text-white transition-colors duration-300"
            >
              {isSpinning ? 'Forging Digital Copy...' : 'Download Digital Copy'}
            </motion.span>
          ) : (
            <motion.span
              key="success-text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#00d0ff] text-xs uppercase tracking-[0.2em] font-semibold"
            >
              Digital Copy Acquired
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function Confirmation() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const gateParam = searchParams.get('gate');
  const nameParam = searchParams.get('name');
  const tierParam = searchParams.get('tier');
  const isRestored = searchParams.get('restored') === 'true';

  const { name, gate, setSessionId, setTier, reset, sessionId: storedSessionId, tier: storedTier } = useUserStore();
  const navigate = useNavigate();
  const [invoiceNumber, setInvoiceNumber] = useState('');

  useEffect(() => {
    const activeSessionId = sessionId || storedSessionId;
    if (!activeSessionId) {
      navigate('/');
      return;
    }

    setInvoiceNumber(activeSessionId);
    
    // Auto-save session details to local storage upon landing if they arrived via URL
    if (sessionId) setSessionId(sessionId);
    if (tierParam) setTier(tierParam);

  }, [sessionId, storedSessionId, tierParam, setSessionId, setTier, navigate]);

  const handleReset = () => {
    reset();
    navigate('/');
  };

  const currentGate = gate || gateParam;
  const currentName = name || nameParam;
  const currentTier = tierParam || storedTier || 'free';
  const showPhysicalTome = currentTier !== 'free';

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

  const glyphName = currentGate ? gateToGlyphName[currentGate] || currentGate : 'Unknown';
  const paymentMethod = tierParam === 'free' ? 'Free Purchase' : tierParam === 'premium' ? '$99 Premium Purchase' : '$77 Standard Purchase';
  const shareUrl = `${window.location.origin}/?ref=${invoiceNumber}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#050505] relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,208,255,0.05)_0%,transparent_70%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="z-10 w-full max-w-2xl flex flex-col items-center justify-center text-center mt-12 mb-12"
      >
        <DownloadPyramid gate={currentGate} />

        <h1 className="text-2xl sm:text-4xl font-light tracking-widest text-gray-200 mb-6">
          Reflection Forged
        </h1>

        <p className="text-lg sm:text-xl text-[#00d0ff] font-serif italic mb-12">
          Thank you, {currentName}. Your purchase is confirmed.
        </p>

        <div className="flex flex-col gap-4 w-full max-w-md mb-12">
          <button
            onClick={() => navigate(`/reader?session_id=${invoiceNumber}&gate=${currentGate}&name=${encodeURIComponent(currentName)}&tier=${tierParam}`)}
            className="w-full px-6 py-4 bg-[#00d0ff] text-black text-sm uppercase tracking-[0.2em] font-bold rounded hover:bg-white transition-colors duration-300 shadow-[0_0_20px_rgba(0,208,255,0.3)]"
          >
            Read Your Book Now
          </button>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-lg p-8 w-full max-w-md mb-12 shadow-2xl">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">Invoice Number</p>
          <p className="text-2xl sm:text-3xl font-mono text-gray-200 tracking-wider bg-black/50 py-4 rounded border border-gray-800 break-all">
            {invoiceNumber}
          </p>

          {showPhysicalTome ? (
            <div className="mt-8 pt-8 border-t border-gray-800 text-left">
              <h3 className="text-gray-300 font-serif italic mb-4 text-center">The Physical Tome</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 text-center">
                To request shipping for your optional hand-signed, physical hardcover copy, please complete a bank transfer using the details below and present your invoice number.
              </p>

              <div className="bg-black/50 p-6 rounded border border-gray-800 mb-8">
                <p className="text-[#00d0ff] text-xs uppercase tracking-widest mb-4">My Scotiabank account details are:</p>
                <ul className="text-sm text-gray-300 space-y-3 list-disc list-inside marker:text-gray-600">
                  <li><span className="text-gray-500 mr-2">First name:</span> OVANDO</li>
                  <li><span className="text-gray-500 mr-2">Last name:</span> BROWN</li>
                  <li><span className="text-gray-500 mr-2">Bank name:</span> Scotiabank</li>
                  <li><span className="text-gray-500 mr-2">Account type:</span> CHEQUING</li>
                  <li><span className="text-gray-500 mr-2">Account number:</span> 50575 000807115</li>
                  <li><span className="text-gray-500 mr-2">Account currency:</span> JMD</li>
                </ul>
              </div>

              <div className="text-center">
                <a
                  href="https://mindwaveja.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full px-6 py-3 border border-[#00d0ff] text-[#00d0ff] text-xs uppercase tracking-[0.15em] rounded hover:bg-[#00d0ff] hover:text-black transition-colors duration-300"
                >
                  VISIT MINDWAVEJA.COM FOR PHYSICAL COPIES
                </a>
              </div>
            </div>
          ) : (
            <div className="mt-8 pt-8 border-t border-gray-800 text-center">
              <h3 className="text-gray-300 font-serif italic mb-4">The Physical Tome</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Want to hold the truth? You can purchase a physical hardcover copy of The Book of Solobility anytime.
              </p>
              <a
                href="https://mindwaveja.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full px-6 py-3 border border-[#00d0ff] text-[#00d0ff] text-xs uppercase tracking-[0.15em] rounded hover:bg-[#00d0ff] hover:text-black transition-colors duration-300"
              >
                REQUEST PHYSICAL COPY AT MINDWAVEJA.COM
              </a>
            </div>
          )}

          {isRestored && (
            <div className="mt-8 pt-8 border-t border-gray-800 text-center space-y-6">
              <div>
                <h3 className="text-gray-300 font-serif italic mb-4">Share Your Reflection</h3>
                <p className="text-gray-500 text-xs leading-relaxed mb-6">
                  Allow others to witness your chosen path. Scan the code or share the link below.
                </p>

                <div className="flex justify-center mb-6">
                  <div className="bg-white p-4 rounded-lg">
                    <QRCodeSVG
                      value={shareUrl}
                      size={120}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="L"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-black/50 p-2 rounded border border-gray-800 mb-6">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="bg-transparent text-gray-400 text-[10px] w-full focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      alert('Link copied to clipboard');
                    }}
                    className="text-[#00d0ff] text-[10px] uppercase tracking-widest hover:text-white px-3 py-1 border border-[#00d0ff]/30 rounded"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <a
                href="https://github.com/HammazoneRecords/Book-of-Solobility"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full px-6 py-3 border border-gray-800 text-gray-500 text-[10px] uppercase tracking-[0.2em] rounded hover:border-gray-600 hover:text-gray-300 transition-colors duration-300"
              >
                Access GitHub Repository
              </a>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 w-full">

          <button
            onClick={() => {
              const content = `INVOICE: ${invoiceNumber}\nDate: ${new Date().toLocaleDateString()}\nUser: ${currentName}\nGlyph: ${glyphName} Edition\nPayment Method: ${paymentMethod}\n\nThank you for your purchase of The Book of Solobility.`;
              const blob = new Blob([content], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `Invoice_${invoiceNumber}.txt`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}
            className="text-gray-600 text-[10px] uppercase tracking-widest hover:text-gray-400 transition-colors py-2"
          >
            Download Invoice
          </button>
          
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear your current reflection and start over?")) {
                reset();
                navigate('/');
              }
            }}
            className="text-[8px] uppercase tracking-widest text-[#00d0ff]/50 hover:text-amber-500/80 transition-colors mt-8"
          >
            Start Anew (Clear Reflection)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
