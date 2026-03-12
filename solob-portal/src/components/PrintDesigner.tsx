import { useState } from 'react';
import { SelectionScreen } from './print/SelectionScreen';
import { DesignerSidebar } from './print/DesignerSidebar';
import { BookPreview } from './print/BookPreview';
import { gateToGlyphName, THEMES, FONTS } from './print/constants';

export const PrintDesigner = ({ purchases }: { purchases: any[] }) => {
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'cover' | 'pages' | 'settings'>('cover');
  const [design, setDesign] = useState({
    theme: THEMES[0],
    font: FONTS[0],
    coverImage: 'https://picsum.photos/seed/solob1/800/1200',
    pageImages: ['https://picsum.photos/seed/page1/600/400', 'https://picsum.photos/seed/page2/600/400'],
    showGlyphOnCover: true,
    paperType: 'Premium Matte',
    binding: 'Hardcover'
  });

  const [previewPage, setPreviewPage] = useState(0);

  if (!selectedReceipt && purchases?.length > 0) {
    return (
      <SelectionScreen 
        purchases={purchases} 
        onSelect={setSelectedReceipt} 
        gateToGlyphName={gateToGlyphName} 
      />
    );
  }

  if (!selectedReceipt) return null;

  const glyphName = gateToGlyphName[selectedReceipt.gate] || selectedReceipt.gate;

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <DesignerSidebar 
        onBack={() => setSelectedReceipt(null)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        design={design}
        setDesign={setDesign}
        themes={THEMES}
        fonts={FONTS}
      />

      <BookPreview 
        previewPage={previewPage}
        setPreviewPage={setPreviewPage}
        design={design}
        selectedReceipt={selectedReceipt}
        glyphName={glyphName}
      />
    </div>
  );
};
