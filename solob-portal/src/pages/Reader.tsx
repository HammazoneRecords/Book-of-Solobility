import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import volume0Manifest from '../data/volume0-manifest.json';
import { ReaderSidebar } from '../components/ReaderSidebar';
import { PdfChapterContent } from '../components/PdfChapterContent';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

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

const PDF_URL = '/Book_of_Solobility_V0.pdf';

export default function Reader() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentPdfPage, setCurrentPdfPage] = useState(1);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const mainScrollRef = useRef<HTMLElement>(null);
  const [expandedGates, setExpandedGates] = useState<string[]>([]);

  const sessionId = searchParams.get('session_id');
  const gate = searchParams.get('gate');
  const name = searchParams.get('name');

  const chapters = volume0Manifest as ChapterManifestItem[];

  // Build a mapping: chapterIndex → first PDF page number (1-indexed)
  const chapterStartPages = useMemo(() => {
    const starts: number[] = [];
    let page = 1;
    for (const ch of chapters) {
      starts.push(page);
      page += ch.pages;
    }
    return starts;
  }, [chapters]);

  // Derive currentChapter and subPage from currentPdfPage
  const currentChapter = useMemo(() => {
    for (let i = chapterStartPages.length - 1; i >= 0; i--) {
      if (currentPdfPage >= chapterStartPages[i]) return i;
    }
    return 0;
  }, [currentPdfPage, chapterStartPages]);

  const subPage = useMemo(() => {
    return currentPdfPage - chapterStartPages[currentChapter];
  }, [currentPdfPage, chapterStartPages, currentChapter]);

  const currentAmbientGate = jhanosGates.find(g => currentChapter >= g.start && currentChapter <= g.end)?.name || 'SYLA';

  // Load the PDF document and restore last page
  useEffect(() => {
    let cancelled = false;
    const loadPdf = async () => {
      setIsLoading(true);
      try {
        const doc = await pdfjsLib.getDocument(PDF_URL).promise;
        if (!cancelled) {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          setIsLoading(false);

          // Restore last read page from localStorage
          const savedPage = localStorage.getItem(`solob_lastpage_${sessionId}`);
          if (savedPage) {
            const page = parseInt(savedPage, 10);
            if (page >= 1 && page <= doc.numPages) {
              setCurrentPdfPage(page);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load PDF:', err);
        if (!cancelled) setIsLoading(false);
      }
    };
    loadPdf();
    return () => { cancelled = true; };
  }, []);

  // Save current page to localStorage on every page change
  useEffect(() => {
    if (sessionId && currentPdfPage > 0) {
      localStorage.setItem(`solob_lastpage_${sessionId}`, String(currentPdfPage));
    }
  }, [currentPdfPage, sessionId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          nextPage();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevPage();
          break;
        case 'Home':
          e.preventDefault();
          setCurrentPdfPage(1);
          mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          break;
        case 'End':
          e.preventDefault();
          if (totalPages > 0) {
            setCurrentPdfPage(totalPages);
            mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPdfPage, totalPages]);

  // Listen for page-jump events from PdfChapterContent
  useEffect(() => {
    const handlePageJump = (e: Event) => {
      const page = (e as CustomEvent).detail?.page;
      if (page >= 1 && page <= totalPages) {
        setCurrentPdfPage(page);
        mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('solob-page-jump', handlePageJump);
    return () => window.removeEventListener('solob-page-jump', handlePageJump);
  }, [totalPages]);

  // Silent analytics heartbeat (every 30s)
  const maxPageRef = useRef(1);
  useEffect(() => {
    if (currentPdfPage > maxPageRef.current) maxPageRef.current = currentPdfPage;
  }, [currentPdfPage]);

  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(() => {
      fetch('/api/analytics/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_name: name,
          gate,
          current_page: currentPdfPage,
          max_page_reached: maxPageRef.current
        })
      }).catch(() => {}); // Silent fail
    }, 30000);
    // Send initial heartbeat immediately
    fetch('/api/analytics/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        user_name: name,
        gate,
        current_page: currentPdfPage,
        max_page_reached: maxPageRef.current
      })
    }).catch(() => {});
    return () => clearInterval(interval);
  }, [sessionId, name, gate]);

  // Gate color theming
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

  // Auto-open sidebar on wide screens
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1280) {
      setIsSidebarOpen(true);
    }
  }, []);

  // Load bookmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`solob_bookmarks_pdf_${sessionId}`);
    if (saved) setBookmarks(JSON.parse(saved));
  }, [sessionId]);

  // Auto-expand gate in sidebar when navigating
  useEffect(() => {
    const activeGateObj = jhanosGates.find(g => currentChapter >= g.start && currentChapter <= g.end);
    if (activeGateObj) {
      setExpandedGates(prev =>
        prev.includes(activeGateObj.name) ? prev : [...prev, activeGateObj.name]
      );
    }
  }, [currentChapter]);

  const toggleBookmark = () => {
    const isBookmarked = bookmarks.includes(currentPdfPage);
    const newBookmarks = isBookmarked
      ? bookmarks.filter(p => p !== currentPdfPage)
      : [...bookmarks, currentPdfPage].sort((a, b) => a - b);
    setBookmarks(newBookmarks);
    localStorage.setItem(`solob_bookmarks_pdf_${sessionId}`, JSON.stringify(newBookmarks));
  };

  const nextPage = () => {
    if (currentPdfPage < totalPages) {
      setCurrentPdfPage(currentPdfPage + 1);
      mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevPage = () => {
    if (currentPdfPage > 1) {
      setCurrentPdfPage(currentPdfPage - 1);
      mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navigateToChapter = (idx: number) => {
    setCurrentPdfPage(chapterStartPages[idx]);
    if (typeof window !== 'undefined' && window.innerWidth < 1280) {
      setIsSidebarOpen(false);
    }
    mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToSubPage = (chapterIdx: number, subPageIdx: number) => {
    setCurrentPdfPage(chapterStartPages[chapterIdx] + subPageIdx);
    if (typeof window !== 'undefined' && window.innerWidth < 1280) {
      setIsSidebarOpen(false);
    }
    mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToBookmarkPage = (page: number) => {
    setCurrentPdfPage(page);
    if (typeof window !== 'undefined' && window.innerWidth < 1280) {
      setIsSidebarOpen(false);
    }
    mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Convert a PDF page to its chapter index + subPage
  const pageToChapterInfo = (page: number) => {
    for (let i = chapterStartPages.length - 1; i >= 0; i--) {
      if (page >= chapterStartPages[i]) {
        return { chapter: i, subPage: page - chapterStartPages[i] };
      }
    }
    return { chapter: 0, subPage: 0 };
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
        setCurrentChapter={navigateToChapter}
        subPage={subPage}
        setSubPage={(ch: number, sp: number) => navigateToSubPage(ch, sp)}
        mainScrollRef={mainScrollRef}
        bookmarks={bookmarks.map(p => {
          const info = pageToChapterInfo(p);
          return { chapter: info.chapter, subPage: info.subPage };
        })}
        sessionId={sessionId}
        gate={gate}
        name={name}
        chapters={chapters}
        jhanosGates={jhanosGates}
        expandedGates={expandedGates}
        setExpandedGates={setExpandedGates}
        pdfBookmarks={bookmarks}
        onBookmarkClick={navigateToBookmarkPage}
      />

      <PdfChapterContent
        mainScrollRef={mainScrollRef}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        toggleBookmark={toggleBookmark}
        isBookmarked={bookmarks.includes(currentPdfPage)}
        currentPdfPage={currentPdfPage}
        totalPages={totalPages}
        isLoading={isLoading}
        pdfDoc={pdfDoc}
        prevPage={prevPage}
        nextPage={nextPage}
        chapters={chapters}
        currentChapter={currentChapter}
        subPage={subPage}
        navigate={navigate}
        sessionId={sessionId}
        gate={gate}
        name={name}
      />
    </div>
  );
}
