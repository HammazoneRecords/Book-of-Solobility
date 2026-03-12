import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';

interface SynapseBubbleProps {
    term: string;
    definition: string;
    sourceChapter: string;
    targetRect: DOMRect | null;
    onClose: () => void;
}

export function SynapseBubble({ term, definition, sourceChapter, targetRect, onClose }: SynapseBubbleProps) {
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const bubbleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (targetRect && bubbleRef.current) {
            const bubbleRect = bubbleRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Default positioning: below the term
            let top = targetRect.bottom + window.scrollY + 8;
            let left = targetRect.left + window.scrollX + (targetRect.width / 2) - (bubbleRect.width / 2);

            // Prevent popping off-screen horizontally
            if (left < 16) left = 16;
            if (left + bubbleRect.width > viewportWidth - 16) left = viewportWidth - bubbleRect.width - 16;

            // Prevent popping off-screen vertically
            if (top + bubbleRect.height > viewportHeight + window.scrollY - 16) {
                // Place above the term if it flows off the bottom
                top = targetRect.top + window.scrollY - bubbleRect.height - 8;
            }

            setPosition({ top, left });
        }
    }, [targetRect, definition]);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (bubbleRef.current && !bubbleRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        // Slight delay to prevent immediate closure if the term click also registers here
        const timer = setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 50);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [onClose]);

    if (!targetRect) return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                ref={bubbleRef}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="absolute z-[100] w-64 md:w-80 p-4 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-sm shadow-[0_10px_40px_rgba(0,0,0,0.8)] pointer-events-auto"
                style={{ top: position.top, left: position.left }}
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[var(--active-gate-color)]/5 to-transparent pointer-events-none rounded-sm" />

                <div className="relative border-b border-white/10 pb-2 mb-3 pr-6">
                    <h4 className="text-[11px] uppercase tracking-[0.3em] font-sans font-medium text-[var(--active-gate-color)]">
                        {term}
                    </h4>
                    <button
                        onClick={onClose}
                        className="absolute top-0 right-0 text-gray-500 hover:text-white transition-colors"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <p className="text-sm font-serif leading-relaxed text-gray-300 relative">
                    {definition}
                </p>

                <div className="mt-4 pt-2 border-t border-white/5 flex justify-between items-end">
                    <span className="text-[8px] uppercase tracking-widest text-gray-600 font-sans">
                        Source: {sourceChapter}
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--active-gate-color)] animate-pulse" />
                </div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
}
