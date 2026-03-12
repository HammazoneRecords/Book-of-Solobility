import React from 'react';
import { Book } from 'lucide-react';

interface SelectionScreenProps {
  purchases: any[];
  onSelect: (purchase: any) => void;
  gateToGlyphName: Record<string, string>;
}

export const SelectionScreen: React.FC<SelectionScreenProps> = ({ purchases, onSelect, gateToGlyphName }) => {
  return (
    <div className="bg-[#111] border border-gray-800 rounded-lg p-12 text-center">
      <Book className="w-16 h-16 text-gray-700 mx-auto mb-6" />
      <h2 className="text-2xl font-light tracking-widest text-gray-200 mb-4 uppercase">Print Production Designer</h2>
      <p className="text-gray-500 mb-8 max-w-md mx-auto italic font-serif">
        Select a forging from the list below to begin designing its physical manifestation.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {purchases.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className="p-4 bg-black/40 border border-gray-800 rounded hover:border-[#00d0ff] transition-all text-left group"
          >
            <p className="text-[#00d0ff] text-[10px] uppercase tracking-widest mb-1">
              Invoice: {p.session_id.includes('_') ? `SOLOB-${p.session_id.split('_')[1]}` : p.session_id}
            </p>
            <p className="text-gray-200 font-medium">{p.user_name}</p>
            <p className="text-gray-500 text-xs italic font-serif">{gateToGlyphName[p.gate] || p.gate} Edition</p>
          </button>
        ))}
      </div>
    </div>
  );
};
