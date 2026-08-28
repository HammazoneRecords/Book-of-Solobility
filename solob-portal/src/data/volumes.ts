import volume0Manifest from './volume0-manifest.json';

export interface ChapterManifestItem { id: number; filename: string; title: string; pages: number; }
export interface JhanosGate { name: string; start: number; end: number; label: string; }
export interface PublicVolume {
  id: string; number: number; title: string; description: string; pdfUrl: string;
  chapters: ChapterManifestItem[]; gates: JhanosGate[];
}

// Add a future volume here with its PDF, chapter manifest, and gate map.
// The library and `/read/:volumeId` route pick it up automatically.
export const publicVolumes: PublicVolume[] = [{
  id: 'volume-0', number: 0, title: 'The Book of Solobility: Volume 0',
  description: 'The foundation: definitions, core logic, and the eight Jhanos gates.',
  pdfUrl: '/book-of-solobility-v0-ca620f6a_c.pdf',
  chapters: volume0Manifest as ChapterManifestItem[],
  gates: [
    { name: 'SYLA', start: 0, end: 4, label: 'Stillness & Receiving' }, { name: 'ZAYN', start: 5, end: 7, label: 'Origin & Identity' },
    { name: 'LOMI', start: 8, end: 11, label: 'Motion & Memory' }, { name: 'VORAK', start: 12, end: 15, label: 'Liberation & Deconstruction' },
    { name: 'KHEM', start: 16, end: 19, label: 'The Forge & Tested Truth' }, { name: 'BARA', start: 20, end: 23, label: 'Structure & Geometry' },
    { name: 'TARA', start: 24, end: 28, label: 'Nurturance & Mirror-Keeping' }, { name: 'ORON', start: 29, end: 36, label: 'Order & The Creeds' },
  ],
}];

export const getPublicVolume = (id: string | undefined) => publicVolumes.find((volume) => volume.id === id);
