import React from 'react';
import { 
  Book, 
  Palette, 
  Layers, 
  ChevronLeft, 
  CheckCircle, 
  Download 
} from 'lucide-react';
import { clsx } from 'clsx';

interface DesignerSidebarProps {
  onBack: () => void;
  activeTab: 'cover' | 'pages' | 'settings';
  setActiveTab: (tab: 'cover' | 'pages' | 'settings') => void;
  design: any;
  setDesign: (design: any) => void;
  themes: any[];
  fonts: any[];
}

export const DesignerSidebar: React.FC<DesignerSidebarProps> = ({
  onBack,
  activeTab,
  setActiveTab,
  design,
  setDesign,
  themes,
  fonts
}) => {
  return (
    <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center text-gray-500 hover:text-white text-xs uppercase tracking-widest mb-4"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to List
      </button>

      <div className="bg-[#111] border border-gray-800 rounded-lg overflow-hidden">
        <div className="flex border-b border-gray-800">
          <button 
            onClick={() => setActiveTab('cover')}
            className={clsx("flex-1 py-3 text-[10px] uppercase tracking-widest flex flex-col items-center gap-1", activeTab === 'cover' ? "text-[#00d0ff] bg-[#00d0ff]/5" : "text-gray-500")}
          >
            <Book className="w-4 h-4" /> Cover
          </button>
          <button 
            onClick={() => setActiveTab('pages')}
            className={clsx("flex-1 py-3 text-[10px] uppercase tracking-widest flex flex-col items-center gap-1", activeTab === 'pages' ? "text-[#00d0ff] bg-[#00d0ff]/5" : "text-gray-500")}
          >
            <Layers className="w-4 h-4" /> Pages
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={clsx("flex-1 py-3 text-[10px] uppercase tracking-widest flex flex-col items-center gap-1", activeTab === 'settings' ? "text-[#00d0ff] bg-[#00d0ff]/5" : "text-gray-500")}
          >
            <Palette className="w-4 h-4" /> Style
          </button>
        </div>

        <div className="p-6 space-y-6">
          {activeTab === 'settings' && (
            <>
              <div>
                <label className="text-gray-500 text-[10px] uppercase tracking-widest mb-3 block">Book Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  {themes.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setDesign({...design, theme: t})}
                      className={clsx(
                        "p-2 rounded border text-[10px] uppercase tracking-tighter transition-all",
                        design.theme.id === t.id ? "border-[#00d0ff] text-[#00d0ff] bg-[#00d0ff]/5" : "border-gray-800 text-gray-500 hover:border-gray-700"
                      )}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-500 text-[10px] uppercase tracking-widest mb-3 block">Typography</label>
                <div className="space-y-2">
                  {fonts.map(f => (
                    <button
                      key={f.id}
                      onClick={() => setDesign({...design, font: f})}
                      className={clsx(
                        "w-full p-2 rounded border text-left text-xs transition-all flex items-center justify-between",
                        design.font.id === f.id ? "border-[#00d0ff] text-[#00d0ff] bg-[#00d0ff]/5" : "border-gray-800 text-gray-500 hover:border-gray-700"
                      )}
                      style={{ fontFamily: f.family }}
                    >
                      {f.name}
                      {design.font.id === f.id && <CheckCircle className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'cover' && (
            <>
              <div>
                <label className="text-gray-500 text-[10px] uppercase tracking-widest mb-3 block">Cover Art</label>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map(i => (
                    <button
                      key={i}
                      onClick={() => setDesign({...design, coverImage: `https://picsum.photos/seed/solob${i}/800/1200`})}
                      className={clsx(
                        "aspect-[2/3] rounded overflow-hidden border-2 transition-all",
                        design.coverImage.includes(`solob${i}`) ? "border-[#00d0ff]" : "border-transparent opacity-50 hover:opacity-100"
                      )}
                    >
                      <img src={`https://picsum.photos/seed/solob${i}/200/300`} alt="Cover option" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-[10px] uppercase tracking-widest">Show Glyph</span>
                <button 
                  onClick={() => setDesign({...design, showGlyphOnCover: !design.showGlyphOnCover})}
                  className={clsx("w-10 h-5 rounded-full relative transition-colors", design.showGlyphOnCover ? "bg-[#00d0ff]" : "bg-gray-800")}
                >
                  <div className={clsx("absolute top-1 w-3 h-3 rounded-full bg-white transition-all", design.showGlyphOnCover ? "left-6" : "left-1")} />
                </button>
              </div>
            </>
          )}

          {activeTab === 'pages' && (
            <div className="space-y-6">
              <div>
                <label className="text-gray-500 text-[10px] uppercase tracking-widest mb-3 block">Internal Illustrations</label>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map(i => (
                    <button
                      key={i}
                      onClick={() => {
                        const newImages = [...design.pageImages];
                        newImages[0] = `https://picsum.photos/seed/page${i}/600/400`;
                        setDesign({...design, pageImages: newImages});
                      }}
                      className={clsx(
                        "aspect-video rounded overflow-hidden border-2 transition-all",
                        design.pageImages[0].includes(`page${i}`) ? "border-[#00d0ff]" : "border-transparent opacity-50 hover:opacity-100"
                      )}
                    >
                      <img src={`https://picsum.photos/seed/page${i}/200/150`} alt="Page option" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-500 text-[10px] uppercase tracking-widest mb-3 block">Paper Quality</label>
                <select 
                  className="w-full bg-black border border-gray-800 rounded p-2 text-xs text-gray-300 focus:outline-none focus:border-[#00d0ff]"
                  value={design.paperType}
                  onChange={(e) => setDesign({...design, paperType: e.target.value})}
                >
                  <option>Standard White</option>
                  <option>Premium Matte</option>
                  <option>Textured Linen</option>
                  <option>Recycled Kraft</option>
                </select>
              </div>
              <div>
                <label className="text-gray-500 text-[10px] uppercase tracking-widest mb-3 block">Binding Method</label>
                <select 
                  className="w-full bg-black border border-gray-800 rounded p-2 text-xs text-gray-300 focus:outline-none focus:border-[#00d0ff]"
                  value={design.binding}
                  onChange={(e) => setDesign({...design, binding: e.target.value})}
                >
                  <option>Softcover (Perfect Bound)</option>
                  <option>Hardcover (Case Wrap)</option>
                  <option>Spiral Bound</option>
                  <option>Hand-Stitched Leather</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-black/40 border-t border-gray-800">
          <button className="w-full py-3 bg-[#00d0ff] text-black text-[10px] font-bold uppercase tracking-[0.2em] rounded hover:bg-white transition-colors flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Export for Print
          </button>
        </div>
      </div>
    </div>
  );
};
