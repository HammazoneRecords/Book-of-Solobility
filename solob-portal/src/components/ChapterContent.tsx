import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SynapseBubble } from './SynapseBubble';

interface ChapterManifestItem {
  id: number;
  filename: string;
  title: string;
  pages: number;
}

interface ChapterContentProps {
  mainScrollRef: React.RefObject<HTMLElement | null>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  toggleBookmark: () => void;
  bookmarks: { chapter: number; subPage: number }[];
  currentChapter: number;
  subPage: number;
  globalPageNumber: number;
  isLoading: boolean;
  processContentWithSynapses: (text: string) => string;
  currentContent: string;
  handleContentClick: (e: React.MouseEvent<HTMLElement>) => void;
  prevPage: () => void;
  nextPage: () => void;
  pages: string[];
  chapters: ChapterManifestItem[];
  navigate: (path: string) => void;
  sessionId: string;
  gate: string;
  name: string;
  activeSynapse: any;
  setActiveSynapse: (val: any) => void;
}

export const ChapterContent: React.FC<ChapterContentProps> = ({
  mainScrollRef,
  isSidebarOpen,
  setIsSidebarOpen,
  toggleBookmark,
  bookmarks,
  currentChapter,
  subPage,
  globalPageNumber,
  isLoading,
  processContentWithSynapses,
  currentContent,
  handleContentClick,
  prevPage,
  nextPage,
  pages,
  chapters,
  navigate,
  sessionId,
  gate,
  name,
  activeSynapse,
  setActiveSynapse
}) => {
  const isBookmarked = bookmarks.some(b => b.chapter === currentChapter && b.subPage === subPage);

  return (
    <main ref={mainScrollRef as any} className="flex-1 flex flex-col items-center pb-32 overflow-y-auto h-screen custom-scrollbar relative">
      {/* Control Bar (Top) */}
      <div className={`fixed top-0 left-0 h-16 flex items-center justify-between px-8 z-40 bg-gradient-to-b from-black/80 to-transparent pointer-events-none transition-all duration-300 ${isSidebarOpen ? 'w-full xl:w-[calc(100%-320px)] xl:left-[320px]' : 'w-full left-0'}`}>
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

        <button
          onClick={toggleBookmark}
          className="pointer-events-auto ml-auto flex items-center gap-2 px-4 py-2 text-[8px] uppercase tracking-[0.3em] transition-all rounded-full border border-white/5 hover:border-[#00d0ff]/30"
        >
          <span className={isBookmarked ? 'text-[#00d0ff]' : 'text-gray-500'}>
            {isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
          </span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className={`fixed top-0 z-50 h-1 bg-gray-900 transition-all duration-300 ${isSidebarOpen ? 'w-full xl:w-[calc(100%-320px)] xl:left-[320px]' : 'w-full left-0'}`}>
        <motion.div
          className="h-full bg-[#00d0ff]"
          initial={{ width: 0 }}
          animate={{ width: `${(globalPageNumber / 144) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentChapter}-${subPage}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="z-10 w-full max-w-4xl p-10 md:p-20 mt-16 bg-black/40 backdrop-blur-md border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] rounded-sm min-h-[70vh] flex flex-col relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] via-transparent to-white/[0.03] pointer-events-none rounded-sm" />

          <div className="relative flex-1 text-gray-300 leading-[2.2] text-lg md:text-xl font-serif">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4 opacity-50">
                <div className="w-12 h-12 border-t-2 border-[#00d0ff] rounded-full animate-spin" />
                <p className="text-[10px] uppercase tracking-widest">Opening the Tome...</p>
              </div>
            ) : (
              <div
                className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-headings:font-serif prose-p:text-gray-300 prose-a:text-[#00d0ff]"
                onClick={handleContentClick as any}
                dangerouslySetInnerHTML={{
                  __html: processContentWithSynapses(currentContent)
                }}
              />
            )}
          </div>

          <div className="mt-16 flex justify-between items-center pt-8 pb-12 md:pb-8 border-t border-gray-800/50">
            <button
              onClick={prevPage}
              disabled={currentChapter === 0 && subPage === 0}
              className={`text-[10px] uppercase tracking-widest transition-colors p-4 -m-4 ${currentChapter === 0 && subPage === 0 ? 'text-gray-800 cursor-not-allowed' : 'text-gray-500 hover:text-white'}`}
            >
              ← Previous
            </button>

            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#00d0ff] font-sans">
                Page {globalPageNumber} of 144
              </span>
              <div className="flex gap-2">
                {chapters[currentChapter] && Array.from({ length: chapters[currentChapter].pages }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1 h-1 rounded-full transition-colors ${idx === subPage ? 'bg-[#00d0ff]' : 'bg-gray-800'}`}
                  />
                ))}
              </div>
            </div>

            {currentChapter < chapters.length - 1 || subPage < pages.length - 1 ? (
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

      {/* Synapse Popover HUD */}
      {activeSynapse && (
        <SynapseBubble
          term={activeSynapse.term}
          definition={activeSynapse.definition}
          sourceChapter={activeSynapse.sourceChapter}
          targetRect={activeSynapse.rect}
          onClose={() => setActiveSynapse(null)}
        />
      )}
    </main>
  );
};
