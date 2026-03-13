import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';

interface PdfPageRendererProps {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  zoom: number;
  onPinchZoom?: (delta: number) => void;
  className?: string;
}

export const PdfPageRenderer: React.FC<PdfPageRendererProps> = ({ pdfDoc, pageNumber, zoom, onPinchZoom, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const renderTaskRef = useRef<any>(null);

  // Pinch-to-zoom tracking
  const lastPinchDistRef = useRef<number | null>(null);

  const renderPage = useCallback(async () => {
    if (!canvasRef.current || !containerRef.current) return;
    if (pageNumber < 1 || pageNumber > pdfDoc.numPages) return;

    // Cancel any in-progress render
    if (renderTaskRef.current) {
      try { renderTaskRef.current.cancel(); } catch {}
      renderTaskRef.current = null;
    }

    const page = await pdfDoc.getPage(pageNumber);

    const container = containerRef.current;
    if (!container || !canvasRef.current) return;

    // Scale so the PDF page fills the container width, then apply zoom
    const containerWidth = container.clientWidth;
    const unscaledViewport = page.getViewport({ scale: 1 });
    const baseScale = containerWidth / unscaledViewport.width;
    const scale = baseScale * zoom;
    const viewport = page.getViewport({ scale });

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use devicePixelRatio for crisp rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = viewport.width * dpr;
    canvas.height = viewport.height * dpr;
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    ctx.scale(dpr, dpr);

    setDimensions({ width: viewport.width, height: viewport.height });

    const renderTask = page.render({ canvasContext: ctx, viewport });
    renderTaskRef.current = renderTask;

    try {
      await renderTask.promise;
    } catch (err: any) {
      if (err?.name !== 'RenderingCancelledException') {
        console.error('PDF render error:', err);
      }
    }
  }, [pdfDoc, pageNumber, zoom]);

  // Render on page/zoom change
  useEffect(() => {
    let cancelled = false;
    const doRender = async () => {
      if (!cancelled) await renderPage();
    };
    doRender();
    return () => { cancelled = true; };
  }, [renderPage]);

  // Re-render on window resize
  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => renderPage(), 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, [renderPage]);

  // Pinch-to-zoom gesture handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onPinchZoom) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastPinchDistRef.current = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && lastPinchDistRef.current !== null) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const delta = (dist - lastPinchDistRef.current) * 0.005;
        lastPinchDistRef.current = dist;
        onPinchZoom(delta);
      }
    };

    const handleTouchEnd = () => {
      lastPinchDistRef.current = null;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onPinchZoom]);

  return (
    <div
      ref={containerRef}
      className={`w-full flex justify-center overflow-x-auto custom-scrollbar ${className || ''}`}
    >
      <canvas
        ref={canvasRef}
        className="rounded-sm"
        style={dimensions ? { width: dimensions.width, height: dimensions.height, maxWidth: zoom > 1 ? 'none' : '100%' } : undefined}
      />
    </div>
  );
};
