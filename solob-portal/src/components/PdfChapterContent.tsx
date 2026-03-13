import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PdfPageRenderer } from './PdfPageRenderer';
import type { PDFDocumentProxy } from 'pdfjs-dist';

interface ChapterManifestItem {
  id: number;
  filename: string;
  title: string;
  pages: number;
}

interface PdfChapterContentProps {
  mainScrollRef: React.RefObject<HTMLElement | null>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  currentPdfPage: number;
  totalPages: number;
  isLoading: boolean;
  pdfDoc: PDFDocumentProxy | null;
  prevPage: () => void;
  nextPage: () => void;
  chapters: ChapterManifestItem[];
  currentChapter: number;
  subPage: number;
  navigate: (path: string) => void;
  sessionId: string;
  gate: string;
  name: string;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.25;

export const PdfChapterContent: React.FC<PdfChapterContentProps> = ({
  mainScrollRef,
  isSidebarOpen,
  setIsSidebarOpen,
  currentPdfPage,
  totalPages,
  isLoading,
  pdfDoc,
  prevPage,
  nextPage,
  chapters,
  currentChapter,
  subPage,
  navigate,
  sessionId,
  gate,
  name,
}) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPageJumpActive, setIsPageJumpActive] = useState(false);
  const [pageJumpValue, setPageJumpValue] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const pageJumpInputRef = useRef<HTMLInputElement>(null);

  // Zoom handlers
  const zoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  }, []);

  const zoomReset = useCallback(() => {
    setZoomLevel(1);
  }, []);

  // Pinch-to-zoom callback
  const handlePinchZoom = useCallback((delta: number) => {
    setZoomLevel(prev => Math.min(Math.max(prev + delta, MIN_ZOOM), MAX_ZOOM));
  }, []);

  // Page jump handlers
  const openPageJump = () => {
    setPageJumpValue(String(currentPdfPage));
    setIsPageJumpActive(true);
    setTimeout(() => pageJumpInputRef.current?.select(), 50);
  };

  const handlePageJump = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseInt(pageJumpValue, 10);
    if (target >= 1 && target <= totalPages) {
      // We need to navigate - use a custom event the parent listens to
      const event = new CustomEvent('solob-page-jump', { detail: { page: target } });
      window.dispatchEvent(event);
    }
    setIsPageJumpActive(false);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      contentRef.current?.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Listen for fullscreen exit (e.g. Esc key)
  React.useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const zoomPercent = Math.round(zoomLevel * 100);

  return (
    <main ref={(el) => {
      (mainScrollRef as any).current = el;
      (contentRef as any).current = el;
    }} className="flex-1 flex flex-col items-center overflow-y-auto h-screen custom-scrollbar relative bg-[#050505] px-4">
      {/* Control Bar (Top) */}
      <div className={`fixed top-0 left-0 h-14 flex items-center justify-between px-4 md:px-8 z-40 bg-gradient-to-b from-black/90 via-black/60 to-transparent pointer-events-none transition-all duration-300 ${isSidebarOpen ? 'w-full lg:w-[calc(100%-320px)] lg:left-[320px]' : 'w-full left-0'}`}>
        {/* Left: Hamburger */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className={`pointer-events-auto w-12 h-12 p-2 -m-2 flex items-center justify-center text-gray-500 hover:text-[#00d0ff] transition-all group ${isSidebarOpen ? 'hidden' : 'flex'}`}
        >
          <div className="space-y-1.5">
            <div className="w-5 h-0.5 bg-current transition-all group-hover:w-6" />
            <div className="w-4 h-0.5 bg-current transition-all group-hover:w-6" />
            <div className="w-6 h-0.5 bg-current transition-all group-hover:w-6" />
          </div>
        </button>

        {/* Right: Controls */}
        <div className="pointer-events-auto ml-auto flex items-center gap-1 md:gap-2 flex-wrap justify-end">
          {/* Zoom Controls */}
          <div className="flex items-center gap-0.5 border border-white/5 rounded-full px-1 shrink-0">
            <button
              onClick={zoomOut}
              disabled={zoomLevel <= MIN_ZOOM}
              className="px-2 py-1.5 text-[10px] text-gray-400 hover:text-[#00d0ff] transition-colors disabled:opacity-30 disabled:hover:text-gray-400 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
              title="Zoom Out"
            >
              −
            </button>
            <button
              onClick={zoomReset}
              className="px-2 py-1.5 text-[8px] uppercase tracking-widest text-gray-500 hover:text-[#00d0ff] transition-colors min-w-[3rem] text-center min-h-[44px] md:min-h-0 flex items-center justify-center"
              title="Reset Zoom"
            >
              {zoomPercent}%
            </button>
            <button
              onClick={zoomIn}
              disabled={zoomLevel >= MAX_ZOOM}
              className="px-2 py-1.5 text-[10px] text-gray-400 hover:text-[#00d0ff] transition-colors disabled:opacity-30 disabled:hover:text-gray-400 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 flex items-center justify-center"
              title="Zoom In"
            >
              +
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center gap-2 px-3 py-2 text-[8px] uppercase tracking-[0.3em] transition-all rounded-full border border-white/5 hover:border-[#00d0ff]/30 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 justify-center"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span className={isDarkMode ? 'text-[#00d0ff]' : 'text-gray-500'}>
              {isDarkMode ? '☾' : '☀'}
            </span>
          </button>



          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-3 py-2 text-[8px] uppercase tracking-[0.3em] transition-all rounded-full border border-white/5 hover:border-[#00d0ff]/30 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 justify-center"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            <span className="text-gray-500 hover:text-[#00d0ff]">
              {isFullscreen ? '⛶' : '⛶'}
            </span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`fixed top-0 z-50 h-1 bg-gray-900 transition-all duration-300 ${isSidebarOpen ? 'w-full lg:w-[calc(100%-320px)] lg:left-[320px]' : 'w-full left-0'}`}>
        <motion.div
          className="h-full bg-[#00d0ff]"
          initial={{ width: 0 }}
          animate={{ width: `${(currentPdfPage / totalPages) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPdfPage}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="z-10 w-full max-w-4xl p-3 sm:p-4 md:p-12 mt-16 md:mt-24 mb-16 bg-black/40 backdrop-blur-md border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] rounded-sm flex flex-col relative shrink-0"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] via-transparent to-white/[0.03] pointer-events-none rounded-sm" />

          <div
            className="relative w-full flex items-start justify-center transition-all duration-500 overflow-visible"
            style={isDarkMode ? {
              filter: 'invert(0.92) hue-rotate(180deg)',
              borderRadius: '4px'
            } : undefined}
          >
            {isLoading || !pdfDoc ? (
              <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4 opacity-50"
                style={isDarkMode ? { filter: 'invert(1) hue-rotate(180deg)' } : undefined}
              >
                <div className="w-12 h-12 border-t-2 border-[#00d0ff] rounded-full animate-spin" />
                <p className="text-[10px] uppercase tracking-widest">Opening the Tome...</p>
              </div>
            ) : (
              <PdfPageRenderer
                pdfDoc={pdfDoc}
                pageNumber={currentPdfPage}
                zoom={zoomLevel}
                onPinchZoom={handlePinchZoom}
              />
            )}
          </div>

          <div className="mt-4 sm:mt-8 flex justify-between items-center pt-4 sm:pt-8 pb-12 md:pb-8 border-t border-gray-800/50">
            <button
              onClick={prevPage}
              disabled={currentPdfPage <= 1}
              className={`text-[10px] uppercase tracking-widest transition-colors p-4 -m-4 ${currentPdfPage <= 1 ? 'text-gray-800 cursor-not-allowed' : 'text-gray-500 hover:text-white'}`}
            >
              ← Previous
            </button>

            <div className="flex flex-col items-center gap-1">
              {/* Page indicator / Page Jump */}
              {isPageJumpActive ? (
                <form onSubmit={handlePageJump} className="flex items-center gap-2">
                  <input
                    ref={pageJumpInputRef}
                    type="number"
                    min={1}
                    max={totalPages}
                    value={pageJumpValue}
                    onChange={(e) => setPageJumpValue(e.target.value)}
                    onBlur={() => setIsPageJumpActive(false)}
                    className="w-16 bg-black/50 border border-[#00d0ff]/30 rounded px-2 py-1 text-center text-[10px] text-[#00d0ff] font-sans uppercase tracking-widest focus:outline-none focus:border-[#00d0ff]"
                    autoFocus
                  />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-gray-600 font-sans">
                    of {totalPages}
                  </span>
                </form>
              ) : (
                <button
                  onClick={openPageJump}
                  className="text-[10px] uppercase tracking-[0.4em] text-[#00d0ff] font-sans hover:text-white transition-colors cursor-pointer"
                  title="Click to jump to a page"
                >
                  Page {currentPdfPage} of {totalPages}
                </button>
              )}
              <div className="flex gap-2">
                {chapters[currentChapter] && Array.from({ length: chapters[currentChapter].pages }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1 h-1 rounded-full transition-colors ${idx === subPage ? 'bg-[#00d0ff]' : 'bg-gray-800'}`}
                  />
                ))}
              </div>
            </div>

            {currentPdfPage < totalPages ? (
              <button
                onClick={nextPage}
                className="text-[10px] uppercase tracking-widest text-[#00d0ff] hover:text-white transition-colors p-4 -m-4"
              >
              Next →
              </button>
            ) : (
              <button
                onClick={() => navigate(`/confirmation?session_id=${sessionId}&gate=${gate}&name=${encodeURIComponent(name)}&restored=true`)}
                className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#00d0ff] transition-colors p-4 -m-4"
              >
                Finish Reading
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </main>
  );
};
