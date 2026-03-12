import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlyphProps {
  type: 'N' | 'S' | 'E' | 'W' | 'NE' | 'SE' | 'SW' | 'NW' | 'base1' | 'base2' | 'base3' | 'base4' | 'base5' | 'base6' | 'base7' | 'base8';
  className?: string;
}

export function Glyph({ type, className }: GlyphProps) {
  const getImagePath = () => {
    switch (type) {
      case 'N':
      case 'base1':
        return '/glyphs/syla.png';
      case 'NE':
      case 'base2':
        return '/glyphs/zayn.png';
      case 'E':
      case 'base3':
        return '/glyphs/lomi.png';
      case 'SE':
      case 'base4':
        return '/glyphs/vorak.png';
      case 'S':
      case 'base5':
        return '/glyphs/khem.png';
      case 'SW':
      case 'base6':
        return '/glyphs/bara.png';
      case 'W':
      case 'base7':
        return '/glyphs/tara.png';
      case 'NW':
      case 'base8':
        return '/glyphs/oron.png';
      default:
        return '/glyphs/syla.png';
    }
  };

  return (
    <img
      src={getImagePath()}
      alt={`Glyph ${type}`}
      className={cn(
        "object-contain drop-shadow-[0_0_8px_rgba(0,208,255,0.8)]",
        className
      )}
      referrerPolicy="no-referrer"
    />
  );
}
