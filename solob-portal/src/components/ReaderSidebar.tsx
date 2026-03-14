import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ChapterManifestItem {
  id: number;
  filename: string;
  title: string;
  pages: number;
}

interface ReaderSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  navigate: (path: string) => void;
  currentAmbientGate: string;
  currentChapter: number;
  setCurrentChapter: (idx: number) => void;
  subPage: number;
  setSubPage: (chapterIdx: number, subPageIdx: number) => void;
  mainScrollRef: React.RefObject<HTMLElement | null>;
  sessionId: string;
  gate: string;
  name: string;
  chapters: ChapterManifestItem[];
  jhanosGates: { name: string; start: number; end: number; label: string }[];
  expandedGates: string[];
  setExpandedGates: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ReaderSidebar: React.FC<ReaderSidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  navigate,
  currentAmbientGate,
  currentChapter,
  setCurrentChapter,
  subPage,
  setSubPage,
  mainScrollRef,
  sessionId,
  gate,
  name,
  chapters,
  jhanosGates,
  expandedGates,
  setExpandedGates
}) => {
  const getGlobalPageNumber = (chIdx: number, subIdx: number) => {
    let count = 0;
    for (let i = 0; i < chIdx; i++) {
        if (chapters[i]) count += chapters[i].pages;
    }
    return count + subIdx + 1;
  };

  const navigateToChapter = (idx: number) => {
    setCurrentChapter(idx);
    setSubPage(0);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleGate = (gateName: string) => {
    setExpandedGates(prev =>
      prev.includes(gateName) ? prev.filter(g => g !== gateName) : [...prev, gateName]
    );
  };

  return (
    <AnimatePresence initial={false}>
      {isSidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] cursor-pointer lg:hidden"
          />

          <motion.div
            initial={typeof window !== 'undefined' && window.innerWidth < 1024 ? { x: '-100%' } : false}
            animate={{ x: 0 }}
            exit={typeof window !== 'undefined' && window.innerWidth < 1024 ? { x: '-100%' } : undefined}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`
              fixed lg:relative left-0 top-0 h-screen w-full max-w-[320px] 
              bg-[#0a0a0a] border-r border-white/5 z-[70] lg:z-0 
              flex flex-col p-8 shadow-2xl lg:shadow-none
            `}
          >
            <div className="flex justify-between items-start mb-12">
              <div className="flex flex-col">
                <button
                  onClick={() => navigate('/')}
                  className="text-[10px] uppercase tracking-[0.4em] text-gray-400 hover:text-[#00d0ff] transition-colors mb-4 text-left"
                >
                  whatissolob.com
                </button>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-[#00d0ff] transition-colors"
                title="Collapse Sidebar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <nav className="flex-1 min-h-[150px] overflow-y-auto pr-4 custom-scrollbar overflow-x-hidden border-t border-white/5 pt-8 space-y-10">
              {jhanosGates.map((gateItem) => {
                const isExpanded = expandedGates.includes(gateItem.name);
                return (
                  <div key={gateItem.name} className="space-y-2">
                    <div
                      className="border-b border-white/10 pb-2 cursor-pointer group flex justify-between items-center"
                      onClick={() => toggleGate(gateItem.name)}
                    >
                      <div>
                        <h4 className="text-[10px] uppercase font-bold tracking-[0.5em] text-[#00d0ff]/90 group-hover:text-white transition-colors">{gateItem.name}</h4>
                        <p className="text-[9px] uppercase tracking-widest text-gray-700 mt-1.5 font-medium">{gateItem.label}</p>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        className="text-gray-600 group-hover:text-[#00d0ff] transition-colors pr-2"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </motion.div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-6 pl-1 border-l border-white/5 pt-6 pb-2 mt-2">
                            {chapters.slice(gateItem.start, gateItem.end + 1).map((ch, idxOffset) => {
                              const idx = gateItem.start + idxOffset;
                              const isCurrentChapter = idx === currentChapter;

                              return (
                                <div key={idx} className={`relative transition-all duration-300 ${isCurrentChapter ? 'pl-4' : 'pl-2'}`}>
                                  {isCurrentChapter && (
                                    <motion.div
                                      layoutId="active-indicator"
                                      className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#00d0ff] shadow-[0_0_8px_rgba(0,208,255,0.6)]"
                                    />
                                  )}
                                  <button
                                    onClick={() => navigateToChapter(idx)}
                                    className="w-full text-left group flex items-start gap-5 py-1"
                                  >
                                    <span className={`text-[11px] font-sans mt-1.5 transition-colors w-5 shrink-0 ${isCurrentChapter ? 'text-[#00d0ff]' : 'text-gray-800 group-hover:text-gray-500'}`}>
                                      {String(idx).padStart(2, '0')}
                                    </span>
                                    <div className="flex-1">
                                      <p className={`text-[1.1rem] leading-relaxed transition-colors ${isCurrentChapter ? 'text-white' : 'text-gray-600 group-hover:text-gray-300'} font-serif italic line-clamp-2`}>
                                        {ch.title}
                                      </p>
                                    </div>
                                  </button>

                                  {ch.pages > 1 && (
                                    <div className="ml-9 flex flex-wrap gap-2 pt-1 pb-4">
                                      {Array.from({ length: ch.pages }).map((_, sIdx) => (
                                        <button
                                          key={sIdx}
                                          onClick={() => {
                                            setSubPage(idx, sIdx);
                                            if (typeof window !== 'undefined' && window.innerWidth < 1280) setIsSidebarOpen(false);
                                          }}
                                          className={`w-6 h-6 flex items-center justify-center text-[8px] rounded-full border transition-all ${isCurrentChapter && sIdx === subPage
                                            ? 'bg-[#00d0ff] border-[#00d0ff] text-black font-bold'
                                            : 'border-white/10 text-gray-500 hover:border-white/30'
                                            }`}
                                        >
                                          {sIdx + 1}
                                        </button>
                                      ))}
                                    </div>
                                  )}


                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>
            <div className="pt-6 border-t border-white/5 flex flex-col shrink-0 mt-auto">
              <div className="flex justify-between items-end opacity-40">
                <p className="text-[6px] uppercase tracking-[0.4em] text-gray-500 font-sans w-2/3 break-all">{sessionId}</p>
                <img src="/mwlogo.svg" alt="MindwaveJA" className="w-5 h-5 mb-1 opacity-50" />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
