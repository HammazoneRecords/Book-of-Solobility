import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Glyph } from '../Glyph';

interface BookPreviewProps {
  previewPage: number;
  setPreviewPage: (page: number) => void;
  design: any;
  selectedReceipt: any;
  glyphName: string;
}

export const BookPreview: React.FC<BookPreviewProps> = ({
  previewPage,
  setPreviewPage,
  design,
  selectedReceipt,
  glyphName
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-black/20 rounded-lg border border-gray-800 p-12 min-h-[600px]">
      <div className="mb-8 flex items-center gap-4">
        <button 
          onClick={() => setPreviewPage(Math.max(0, previewPage - 1))}
          className="p-2 bg-[#111] border border-gray-800 rounded text-gray-500 hover:text-white disabled:opacity-20"
          disabled={previewPage === 0}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-[10px] uppercase tracking-widest text-gray-500">
          {previewPage === 0 ? 'Front Cover' : `Page ${previewPage}`}
        </span>
        <button 
          onClick={() => setPreviewPage(previewPage + 1)}
          className="p-2 bg-[#111] border border-gray-800 rounded text-gray-500 hover:text-white"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={previewPage}
          initial={{ opacity: 0, scale: 0.95, rotateY: previewPage > 0 ? -5 : 0 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          exit={{ opacity: 0, scale: 1.05, rotateY: 5 }}
          transition={{ duration: 0.4 }}
          className="relative w-[400px] aspect-[2/3] shadow-[0_30px_60px_rgba(0,0,0,0.5)] rounded-r-lg overflow-hidden"
          style={{ 
            backgroundColor: design.theme.bg, 
            color: design.theme.text,
            fontFamily: design.font.family,
            boxShadow: `20px 0 50px rgba(0,0,0,0.3), inset 2px 0 5px rgba(255,255,255,${design.theme.id === 'void' ? 0.1 : 0.5})`
          }}
        >
          {previewPage === 0 ? (
            /* Cover Preview */
            <div className="h-full flex flex-col items-center justify-between py-16 px-8 relative">
              <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                <img src={design.coverImage} alt="Cover art" className="w-full h-full object-cover" />
              </div>
              
              <div className="z-10 text-center">
                <p className="text-[10px] uppercase tracking-[0.4em] mb-2 opacity-60">The Book of</p>
                <h1 className="text-4xl font-bold tracking-[0.2em] uppercase">Solobility</h1>
              </div>

              {design.showGlyphOnCover && (
                <div className="z-10">
                  <Glyph type={selectedReceipt.gate as any} className="w-32 h-32" />
                </div>
              )}

              <div className="z-10 text-center">
                <p className="text-xs uppercase tracking-[0.2em] mb-1">{glyphName} Edition</p>
                <p className="text-lg italic font-serif opacity-80">{selectedReceipt.user_name}</p>
              </div>

              <div className="z-10 flex flex-col items-center opacity-40">
                <img src="/mwlogo.svg" alt="MindwaveJA" className="w-8 h-8 mb-1" style={{ filter: design.theme.id === 'minimal' ? 'invert(1)' : 'none' }} />
                <p className="text-[6px] uppercase tracking-[0.5em]">MindwaveJA</p>
              </div>
            </div>
          ) : (
            /* Internal Page Preview */
            <div className="h-full p-12 flex flex-col">
              <div className="flex justify-between items-center mb-12 opacity-40 text-[8px] uppercase tracking-widest">
                <span>{glyphName} Edition</span>
                <span>{selectedReceipt.user_name}</span>
              </div>
              
              <div className="flex-1 space-y-6">
                <h2 className="text-xl border-b pb-4" style={{ borderColor: `${design.theme.text}20` }}>
                  {previewPage === 1 ? 'The Threshold' : `Chapter ${previewPage}`}
                </h2>
                
                {previewPage === 1 && (
                  <div className="aspect-video w-full rounded overflow-hidden mb-6 opacity-80">
                    <img src={design.pageImages[0]} alt="Page illustration" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="space-y-4 text-sm leading-relaxed opacity-80">
                  <p>
                    Long ago, Anancy the spider decided that he wanted to own all the wisdom in the world. 
                    He spent many days traveling from village to village, collecting every bit of knowledge 
                    and cleverness he could find.
                  </p>
                  <p>
                    He stuffed all this wisdom into a large clay pot and tied it around his neck, letting 
                    it hang in front of his belly. He decided to hide the pot at the very top of a tall 
                    silk-cotton tree where no one else could find it.
                  </p>
                  <p>
                    But as Anancy tried to climb the tree, the big pot in front of him kept getting in 
                    the way. He would climb a few inches, then slip back down.
                  </p>
                </div>
              </div>

              <div className="mt-auto text-center text-[10px] opacity-40">
                {previewPage}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
