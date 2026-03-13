import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass } from './Compass';

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
  bookmarks: { chapter: number; subPage: number }[];
  sessionId: string;
  gate: string;
  name: string;
  chapters: ChapterManifestItem[];
  jhanosGates: { name: string; start: number; end: number; label: string }[];
  expandedGates: string[];
  setExpandedGates: React.Dispatch<React.SetStateAction<string[]>>;
  pdfBookmarks?: number[];
  onBookmarkClick?: (page: number) => void;
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
  bookmarks,
  sessionId,
  gate,
  name,
  chapters,
  jhanosGates,
  expandedGates,
  setExpandedGates,
  pdfBookmarks,
  onBookmarkClick
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
    if (typeof window !== 'undefined' && window.innerWidth < 1280) {
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] cursor-pointer xl:hidden"
          />

          <motion.div
            initial={typeof window !== 'undefined' && window.innerWidth < 1280 ? { x: '-100%' } : false}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`
              fixed xl:relative left-0 top-0 h-screen w-full max-w-[320px] 
              bg-[#0a0a0a] border-r border-white/5 z-[70] xl:z-0 
              flex flex-col p-8 shadow-2xl xl:shadow-none
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
                <h3 className="text-[9px] uppercase tracking-[0.6em] text-gray-600 font-sans border-t border-white/5 pt-4">Table of Contents</h3>
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

            <div className="flex justify-center mb-8 border-b border-white/5 pb-8">
              <Compass
                currentGate={currentAmbientGate}
                onGateSelect={(gateName) => {
                  const targetGate = jhanosGates.find(g => g.name === gateName);
                  if (targetGate) {
                    setCurrentChapter(targetGate.start);
                    setExpandedGates(prev => [...new Set([...prev, gateName])]);
                  }
                }}
                className="scale-90"
              />
            </div>

            <nav className="flex-1 overflow-y-auto space-y-4 pr-4 custom-scrollbar">
              {jhanosGates.map((gateItem) => {
                const isExpanded = expandedGates.includes(gateItem.name);
                return (
                  <div key={gateItem.name} className="space-y-2">
                    <div
                      className="border-b border-white/10 pb-2 cursor-pointer group flex justify-between items-center"
                      onClick={() => toggleGate(gateItem.name)}
                    >
                      <div>
                        <h4 className="text-[10px] uppercase tracking-[0.4em] text-[#00d0ff] group-hover:text-white transition-colors">{gateItem.name}</h4>
                        <p className="text-[8px] uppercase tracking-widest text-gray-600 mt-1">{gateItem.label}</p>
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
                          <div className="space-y-4 pl-2 border-l border-white/5 pt-2 pb-2">
                            {chapters.slice(gateItem.start, gateItem.end + 1).map((ch, idxOffset) => {
                              const idx = gateItem.start + idxOffset;
                              const isCurrentChapter = idx === currentChapter;
                              const chapterBookmarks = bookmarks.filter(b => b.chapter === idx);

                              return (
                                <div key={idx} className="space-y-4 pl-2">
                                  <button
                                    onClick={() => setCurrentChapter(idx)}
                                    className="w-full text-left group flex items-start gap-4"
                                  >
                                    <span className={`text-[10px] font-sans mt-2 transition-colors ${isCurrentChapter ? 'text-[#00d0ff]' : 'text-gray-700 group-hover:text-gray-400'}`}>
                                      {String(idx).padStart(2, '0')}
                                    </span>
                                    <div className="flex-1">
                                      <p className={`text-lg transition-colors ${isCurrentChapter ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'} font-serif italic line-clamp-2`}>
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

                                  {chapterBookmarks.length > 0 && (
                                    <div className="ml-9 flex flex-wrap gap-2">
                                      {chapterBookmarks.map((b, bIdx) => (
                                          <button 
                                            key={bIdx} 
                                            onClick={() => {
                                              const page = getGlobalPageNumber(b.chapter, b.subPage);
                                              if (onBookmarkClick) onBookmarkClick(page);
                                            }}
                                            className="text-[7px] uppercase tracking-widest text-[#00d0ff]/80 hover:text-white px-1.5 py-0.5 border border-[#00d0ff]/20 hover:border-[#00d0ff]/60 hover:bg-[#00d0ff]/10 rounded-sm transition-all cursor-pointer"
                                            title="Go to Bookmark"
                                          >
                                            P.{getGlobalPageNumber(b.chapter, b.subPage)}
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

            <div className="pt-6 border-t border-white/5 flex flex-col max-h-[50vh]">
              <h3 className="text-[9px] uppercase tracking-[0.6em] text-gray-600 font-sans mb-4">My Anchors</h3>
              {bookmarks.length === 0 ? (
                <p className="text-[8px] uppercase tracking-widest text-gray-700 italic">No bookmarks saved yet.</p>
              ) : (
                <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2 pb-4">
                  {pdfBookmarks && onBookmarkClick ? (
                    pdfBookmarks.map((page, idx) => {
                      // Find which chapter this page belongs to
                      let chIdx = 0;
                      let pageAcc = 0;
                      for (let i = 0; i < chapters.length; i++) {
                        if (page <= pageAcc + chapters[i].pages) { chIdx = i; break; }
                        pageAcc += chapters[i].pages;
                      }
                      const ch = chapters[chIdx];
                      return (
                        <button
                          key={idx}
                          onClick={() => onBookmarkClick(page)}
                          className="w-full text-left group flex flex-col p-2 rounded-sm hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                        >
                          <span className="text-[8px] font-sans text-[#00d0ff] mb-1">
                            Page {page}
                          </span>
                          <span className="text-[11px] text-gray-500 group-hover:text-white font-serif line-clamp-1 italic">
                            {ch ? ch.title : 'Untitled'}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    bookmarks.map((b, idx) => {
                      const ch = chapters[b.chapter];
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setCurrentChapter(b.chapter);
                            setSubPage(b.subPage);
                            if (typeof window !== 'undefined' && window.innerWidth < 1280) setIsSidebarOpen(false);
                            mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="w-full text-left group flex flex-col p-2 rounded-sm hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                        >
                          <span className="text-[8px] font-sans text-[#00d0ff] mb-1">
                            Page {getGlobalPageNumber(b.chapter, b.subPage)}
                          </span>
                          <span className="text-[11px] text-gray-500 group-hover:text-white font-serif line-clamp-1 italic">
                            {ch ? ch.title : 'Untitled'}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}


              <div className="mt-4 flex justify-between items-end opacity-40">
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
