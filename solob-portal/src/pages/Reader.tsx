import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { getPublicVolume } from '../data/volumes';
import { ReaderSidebar } from '../components/ReaderSidebar';
import { PdfChapterContent } from '../components/PdfChapterContent';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

export default function Reader() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { volumeId } = useParams();
  const volume = getPublicVolume(volumeId);
  const [currentPdfPage, setCurrentPdfPage] = useState(1);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const mainScrollRef = useRef<HTMLElement>(null);
  const [expandedGates, setExpandedGates] = useState<string[]>([]);
  const [anonymousSessionId] = useState(() => `public-volume-0-${crypto.randomUUID()}`);

  // Volume 0 is public until the Volume 1 launch restores the gated journey.
  const sessionId = searchParams.get('session_id') ?? anonymousSessionId;
  const gate = searchParams.get('gate') ?? 'VOLUME_0';
  const name = searchParams.get('name') ?? 'Public Reader';

  const chapters = volume?.chapters ?? [];

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

  const currentAmbientGate = volume?.gates.find(g => currentChapter >= g.start && currentChapter <= g.end)?.name || 'SYLA';

  // Load the PDF document and restore last page
  useEffect(() => {
    let cancelled = false;
    const loadPdf = async () => {
      setIsLoading(true);
      try {
        if (!volume) {
          setIsLoading(false);
          return;
        }
        const doc = await pdfjsLib.getDocument(volume.pdfUrl).promise;
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
  }, [volume]);

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
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setIsSidebarOpen(true);
    }
  }, []);

  // Auto-expand gate in sidebar when navigating
  useEffect(() => {
    const activeGateObj = volume?.gates.find(g => currentChapter >= g.start && currentChapter <= g.end);
    if (activeGateObj) {
      setExpandedGates(prev =>
        prev.includes(activeGateObj.name) ? prev : [...prev, activeGateObj.name]
      );
    }
  }, [currentChapter]);

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
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
    mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToSubPage = (chapterIdx: number, subPageIdx: number) => {
    setCurrentPdfPage(chapterStartPages[chapterIdx] + subPageIdx);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
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

  if (!volume) {
    return <div className="min-h-screen flex items-center justify-center bg-[#050505] text-gray-400">
      <div className="text-center"><p>That volume is not available yet.</p><button onClick={() => navigate('/read')} className="mt-4 text-[#00d0ff] hover:underline">View available volumes</button></div>
    </div>;
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
        sessionId={sessionId}
        gate={gate}
        name={name}
        chapters={chapters}
        jhanosGates={volume.gates}
        expandedGates={expandedGates}
        setExpandedGates={setExpandedGates}
      />

      <PdfChapterContent
        mainScrollRef={mainScrollRef}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
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
