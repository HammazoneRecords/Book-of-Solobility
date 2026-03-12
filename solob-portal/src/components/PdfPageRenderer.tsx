import React, { useRef, useEffect, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';

interface PdfPageRendererProps {
  pdfDoc: PDFDocumentProxy;
  pageNumber: number;
  className?: string;
}

export const PdfPageRenderer: React.FC<PdfPageRendererProps> = ({ pdfDoc, pageNumber, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const renderTaskRef = useRef<any>(null);

  useEffect(() => {
    let cancelled = false;

    const renderPage = async () => {
      if (!canvasRef.current || !containerRef.current) return;
      if (pageNumber < 1 || pageNumber > pdfDoc.numPages) return;

      // Cancel any in-progress render
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch {}
        renderTaskRef.current = null;
      }

      const page = await pdfDoc.getPage(pageNumber);
      if (cancelled) return;

      const container = containerRef.current;
      // Scale so the PDF page fills the container width
      const containerWidth = container.clientWidth;
      const unscaledViewport = page.getViewport({ scale: 1 });
      const scale = containerWidth / unscaledViewport.width;
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
    };

    renderPage();

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch {}
      }
    };
  }, [pdfDoc, pageNumber]);

  // Re-render on resize
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      // Trigger re-render by updating state
      const renderPage = async () => {
        if (renderTaskRef.current) {
          try { renderTaskRef.current.cancel(); } catch {}
          renderTaskRef.current = null;
        }

        const page = await pdfDoc.getPage(pageNumber);
        const container = containerRef.current;
        if (!container || !canvasRef.current) return;

        const containerWidth = container.clientWidth;
        const unscaledViewport = page.getViewport({ scale: 1 });
        const scale = containerWidth / unscaledViewport.width;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        ctx.scale(dpr, dpr);

        setDimensions({ width: viewport.width, height: viewport.height });

        const renderTask = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = renderTask;
        try { await renderTask.promise; } catch {}
      };
      renderPage();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pdfDoc, pageNumber]);

  return (
    <div ref={containerRef} className={`w-full flex justify-center ${className || ''}`}>
      <canvas
        ref={canvasRef}
        className="max-w-full rounded-sm"
        style={dimensions ? { width: dimensions.width, height: dimensions.height } : undefined}
      />
    </div>
  );
};
