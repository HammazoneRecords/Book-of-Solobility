import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import volume0Manifest from '../data/volume0-manifest.json';
import { ReaderSidebar } from '../components/ReaderSidebar';
import { ChapterContent } from '../components/ChapterContent';
import { useSynapse } from '../hooks/useSynapse';

interface ChapterManifestItem {
  id: number;
  filename: string;
  title: string;
  pages: number;
}

const jhanosGates = [
  { name: 'SYLA', start: 0, end: 4, label: 'Stillness & Receiving' },
  { name: 'ZAYN', start: 5, end: 7, label: 'Origin & Identity' },
  { name: 'LOMI', start: 8, end: 11, label: 'Motion & Memory' },
  { name: 'VORAK', start: 12, end: 15, label: 'Liberation & Deconstruction' },
  { name: 'KHEM', start: 16, end: 19, label: 'The Forge & Tested Truth' },
  { name: 'BARA', start: 20, end: 23, label: 'Structure & Geometry' },
  { name: 'TARA', start: 24, end: 28, label: 'Nurturance & Mirror-Keeping' },
  { name: 'ORON', start: 29, end: 36, label: 'Order & The Creeds' }
];

export default function Reader() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentChapter, setCurrentChapter] = useState(0);
  const [subPage, setSubPage] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<{ chapter: number; subPage: number }[]>([]);
  const [chapterContent, setChapterContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const mainScrollRef = useRef<HTMLElement>(null);
  const [expandedGates, setExpandedGates] = useState<string[]>([]);

  const {
    activeSynapse,
    setActiveSynapse,
    processContentWithSynapses,
    handleContentClick
  } = useSynapse();

  const sessionId = searchParams.get('session_id');
  const gate = searchParams.get('gate');
  const name = searchParams.get('name');

  const chapters = volume0Manifest as ChapterManifestItem[];
  const pages = chapterContent.split('<!-- pagebreak -->');
  const currentContent = pages[subPage] || '';

  const currentAmbientGate = jhanosGates.find(g => currentChapter >= g.start && currentChapter <= g.end)?.name || 'SYLA';

  useEffect(() => {
    const gateColors: Record<string, string> = {
      SYLA: 'var(--syla-hc)',
      ZAYN: 'var(--zayn-hc)',
      LOMI: 'var(--lomi-hc)',
      VORAK: 'var(--vorak-hc)',
      KHEM: 'var(--khem-hc)',
      BARA: 'var(--bara-hc)',
      TARA: 'var(--tara-hc)',
      ORON: 'var(--oron-hc)',
    };

    document.documentElement.style.setProperty('--active-gate-color', `hsl(${gateColors[currentAmbientGate]})`);
  }, [currentAmbientGate]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1280) {
      setIsSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    const savedBookmarks = localStorage.getItem(`solob_bookmarks_${sessionId}`);
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
  }, [sessionId]);

  useEffect(() => {
    const fetchChapter = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/volume0/${chapters[currentChapter].filename}`);
        if (!response.ok) throw new Error('Failed to load chapter');
        const text = await response.text();
        setChapterContent(text);
      } catch (error) {
        console.error(error);
        setChapterContent('## Error\nFailed to load this chapter. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChapter();
  }, [currentChapter, chapters]);

  useEffect(() => {
    const activeGateObj = jhanosGates.find(g => currentChapter >= g.start && currentChapter <= g.end);
    if (activeGateObj) {
      setExpandedGates(prev =>
        prev.includes(activeGateObj.name) ? prev : [...prev, activeGateObj.name]
      );
    }
  }, [currentChapter]);

  const toggleBookmark = () => {
    const isBookmarked = bookmarks.some(b => b.chapter === currentChapter && b.subPage === subPage);
    const newBookmarks = isBookmarked
      ? bookmarks.filter(b => !(b.chapter === currentChapter && b.subPage === subPage))
      : [...bookmarks, { chapter: currentChapter, subPage: subPage }].sort((a, b) => {
        if (a.chapter !== b.chapter) return a.chapter - b.chapter;
        return a.subPage - b.subPage;
      });

    setBookmarks(newBookmarks);
    localStorage.setItem(`solob_bookmarks_${sessionId}`, JSON.stringify(newBookmarks));
  };

  const nextPage = () => {
    if (subPage < pages.length - 1) {
      setSubPage(subPage + 1);
      mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
      setSubPage(0);
      mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevPage = () => {
    if (subPage > 0) {
      setSubPage(subPage - 1);
      mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentChapter > 0) {
      const prevChapterIdx = currentChapter - 1;
      setCurrentChapter(prevChapterIdx);
      setSubPage(chapters[prevChapterIdx].pages - 1);
      mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getGlobalPageNumber = (chIdx: number, subIdx: number) => {
    let count = 0;
    for (let i = 0; i < chIdx; i++) {
      count += chapters[i].pages;
    }
    return count + subIdx + 1;
  };

  if (!sessionId || !gate || !name) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-gray-500">
        <p>Invalid session. Please return to the threshold.</p>
        <button onClick={() => navigate('/')} className="ml-4 text-[#00d0ff] hover:underline">Return</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-serif relative overflow-hidden flex">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(0,208,255,0.03)_0%,transparent_80%)] pointer-events-none" />

      <ReaderSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        navigate={navigate}
        currentAmbientGate={currentAmbientGate}
        currentChapter={currentChapter}
        setCurrentChapter={setCurrentChapter}
        subPage={subPage}
        setSubPage={setSubPage}
        mainScrollRef={mainScrollRef}
        bookmarks={bookmarks}
        sessionId={sessionId}
        gate={gate}
        name={name}
        chapters={chapters}
        jhanosGates={jhanosGates}
        expandedGates={expandedGates}
        setExpandedGates={setExpandedGates}
      />

      <ChapterContent
        mainScrollRef={mainScrollRef}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        toggleBookmark={toggleBookmark}
        bookmarks={bookmarks}
        currentChapter={currentChapter}
        subPage={subPage}
        globalPageNumber={getGlobalPageNumber(currentChapter, subPage)}
        isLoading={isLoading}
        processContentWithSynapses={processContentWithSynapses}
        currentContent={currentContent}
        handleContentClick={handleContentClick}
        prevPage={prevPage}
        nextPage={nextPage}
        pages={pages}
        chapters={chapters}
        navigate={navigate}
        sessionId={sessionId}
        gate={gate}
        name={name}
        activeSynapse={activeSynapse}
        setActiveSynapse={setActiveSynapse}
      />
    </div>
  );
}
