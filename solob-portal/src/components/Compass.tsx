import React from 'react';
import { motion } from 'motion/react';
import { Glyph } from './Glyph';
import { cn } from './Glyph';

interface CompassProps {
    currentGate: string;
    onGateSelect: (gate: string) => void;
    className?: string;
}

const GATES = [
    { id: 'N', name: 'SYLA', label: 'Stillness' },
    { id: 'NE', name: 'ZAYN', label: 'Origin' },
    { id: 'E', name: 'LOMI', label: 'Motion' },
    { id: 'SE', name: 'VORAK', label: 'Chaos' },
    { id: 'S', name: 'KHEM', label: 'Friction' },
    { id: 'SW', name: 'BARA', label: 'Structure' },
    { id: 'W', name: 'TARA', label: 'Reflection' },
    { id: 'NW', name: 'ORON', label: 'Order' },
];

export function Compass({ currentGate, onGateSelect, className }: CompassProps) {
    return (
        <div className={cn("relative w-48 h-48 flex items-center justify-center", className)}>
            {/* Compass Outer Ring */}
            <div className="absolute inset-0 rounded-full border border-white/5 bg-black/20 backdrop-blur-sm" />

            {/* Gate Nodes */}
            {GATES.map((gate, i) => {
                const angle = (i * Math.PI) / 4 - Math.PI / 2;
                const radius = 80;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                const isCurrent = currentGate === gate.id;

                return (
                    <motion.div
                        key={gate.id}
                        className="absolute flex flex-col items-center justify-center cursor-pointer group p-2 -m-2 z-10"
                        style={{ x, y }}
                        onClick={() => onGateSelect(gate.name)}
                        whileHover={{ scale: 1.2 }}
                        animate={{
                            scale: isCurrent ? 1.3 : 1,
                            filter: isCurrent ? 'drop-shadow(0 0 8px var(--active-gate-color))' : 'none'
                        }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                        <Glyph
                            type={gate.id as any}
                            className={cn(
                                "w-6 h-6 transition-all duration-300",
                                isCurrent ? "opacity-100" : "opacity-30 group-hover:opacity-70"
                            )}
                        />
                        {/* Tooltip on hover */}
                        <div className="absolute top-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <span className="text-[8px] uppercase tracking-widest text-[#00d0ff] bg-black/80 px-1.5 py-0.5 rounded border border-white/10 whitespace-nowrap">
                                {gate.name}
                            </span>
                        </div>
                    </motion.div>
                );
            })}

            {/* Center Label (Current Gate) */}
            <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
                <span className="text-[10px] uppercase tracking-[0.4em] shimmer-text font-medium">
                    {GATES.find(g => g.id === currentGate)?.name || currentGate}
                </span>
            </motion.div>
        </div>
    );
}
