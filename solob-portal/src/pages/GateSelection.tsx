import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useUserStore } from '../store';
import { Glyph } from '../components/Glyph';

const GATES = [
  { id: 'N', name: 'SYLA', function: 'The Anchor (Stillness & Receptive Potential)' },
  { id: 'NE', name: 'ZAYN', function: 'The Progenitor (Rebirth & Divine Recursion)' },
  { id: 'E', name: 'LOMI', function: 'The Historian (Motion, Rhythm & Memory)' },
  { id: 'SE', name: 'VORAK', function: 'The Liberator (Chaos & Breaking False Structures)' },
  { id: 'S', name: 'KHEM', function: 'The Catalyst (Transformation through Friction)' },
  { id: 'SW', name: 'BARA', function: 'The Architect (Structure & Primal Form)' },
  { id: 'W', name: 'TARA', function: 'The Nurturer (Mirror, Reflection & Context)' },
  { id: 'NW', name: 'ORON', function: 'The Weaver (Order, Symmetry & Proportion)' },
];

export default function GateSelection() {
  const [stage, setStage] = useState<'initial' | 'merging' | 'final' | 'forging'>('initial');
  const [hoveredGate, setHoveredGate] = useState<string | null>(null);
  const [selectedGate, setSelectedGateLocal] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const setGate = useUserStore((state) => state.setGate);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Sequence the animations
    const timer1 = setTimeout(() => setStage('merging'), 2000);
    const timer2 = setTimeout(() => setStage('final'), 4000);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleSelect = (id: string) => {
    setSelectedGateLocal(id);
  };

  const handleConfirm = () => {
    if (selectedGate) {
      setStage('forging');
      setTimeout(() => {
        setGate(selectedGate);
        navigate('/offering');
      }, 2500); // Wait for the forging animation to complete
    }
  };

  const currentRadius = windowWidth < 768 ? 120 : 180;
  const activeRadius = (stage === 'final' || stage === 'forging') ? currentRadius : 0;

  const gatePositions = GATES.map((gate, i) => {
    const angle = (i * Math.PI) / 4 - Math.PI / 2; // Start from top (N), 8 positions
    return {
      ...gate,
      x: Math.cos(angle) * activeRadius,
      y: Math.sin(angle) * activeRadius,
    };
  });

  const activeGateId = stage === 'forging' ? selectedGate : (hoveredGate || selectedGate);
  const activeGate = gatePositions.find(g => g.id === activeGateId);

  return (
    <div className="h-[100dvh] w-full flex flex-col items-center justify-center relative overflow-hidden bg-[#050505]">
      {/* Ambient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,208,255,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative w-full max-w-3xl aspect-square flex items-center justify-center">
        {/* Initial 8 Glyphs */}
        <AnimatePresence>
          {stage === 'initial' && (
            <>
              {[...Array(8)].map((_, i) => {
                const angle = (i * Math.PI) / 4;
                const radius = 100;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.div
                    key={`base-${i}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1, x, y }}
                    exit={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 180 }}
                    transition={{ duration: 1.5, delay: i * 0.1, ease: "easeInOut" }}
                    className="absolute w-10 h-10 md:w-12 md:h-12"
                  >
                    <Glyph type={`base${i + 1}` as any} className="w-full h-full opacity-40" />
                  </motion.div>
                );
              })}
            </>
          )}
        </AnimatePresence>

        {/* Center Text */}
        <AnimatePresence>
          {activeGate && (stage === 'final' || stage === 'forging') && (
            <motion.div
              key="center-text"
              initial={{ opacity: 0, scale: 0.8, x: 0, y: 0 }}
              animate={{
                opacity: 1,
                scale: stage === 'forging' ? 0.8 : 1,
                rotate: stage === 'forging' ? 1080 : 0,
                x: stage === 'forging' ? activeGate.x : 0,
                y: stage === 'forging' ? activeGate.y : 0
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: stage === 'forging' ? 2 : 0.3, ease: "easeInOut" }}
              className="absolute flex flex-col items-center justify-center text-center w-40 md:w-48 pointer-events-none z-0"
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.3, 0.5, 0.3],
                  filter: [
                    'drop-shadow(0 0 20px rgba(0,208,255,0.1))',
                    'drop-shadow(0 0 40px rgba(0,208,255,0.3))',
                    'drop-shadow(0 0 20px rgba(0,208,255,0.1))'
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Glyph
                  type={activeGate.id as any}
                  className="w-32 h-32 md:w-48 md:h-48 opacity-60"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Final 8 Gates */}
        <AnimatePresence>
          {(stage === 'merging' || stage === 'final' || stage === 'forging') && (
            <>
              {gatePositions.map((gate) => {
                const isSelected = selectedGate === gate.id;
                const isHovered = hoveredGate === gate.id;
                const isForging = stage === 'forging';

                const targetX = isForging && isSelected ? 0 : gate.x;
                const targetY = isForging && isSelected ? 0 : gate.y;
                const targetScale = isForging && isSelected ? 3 : (isSelected ? 1.3 : 1);
                const targetOpacity = isForging ? (isSelected ? 1 : 0) : (stage === 'final' ? (selectedGate && !isSelected ? 0.15 : 1) : 0.8);

                return (
                  <motion.div
                    key={gate.id}
                    initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: -180 }}
                    animate={{
                      opacity: targetOpacity,
                      scale: targetScale,
                      x: targetX,
                      y: targetY,
                      rotate: 0
                    }}
                    transition={{ duration: isForging ? 2 : 2, ease: "easeInOut" }}
                    className="absolute cursor-pointer flex flex-col items-center justify-center z-10 p-4 -m-4"
                    onMouseEnter={() => stage === 'final' && setHoveredGate(gate.id)}
                    onMouseLeave={() => setHoveredGate(null)}
                    onClick={() => stage === 'final' && handleSelect(gate.id)}
                  >
                    <motion.div
                      animate={{
                        filter: isHovered && !isSelected && !isForging ? 'drop-shadow(0 0 12px rgba(0,208,255,0.8))' : 'drop-shadow(0 0 4px rgba(0,208,255,0.4))',
                        scale: isHovered && !isSelected && !isForging ? 1.1 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <Glyph type={gate.id as any} className="w-12 h-12 md:w-16 md:h-16" />
                    </motion.div>
                  </motion.div>
                );
              })}
            </>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        className="absolute bottom-8 md:bottom-12 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: selectedGate && stage !== 'forging' ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={handleConfirm}
          disabled={!selectedGate || stage === 'forging'}
          className="px-8 py-3 border border-[#00d0ff] rounded-full text-sm uppercase tracking-[0.2em] text-[#00d0ff] hover:bg-[#00d0ff] hover:text-black transition-all duration-500 disabled:opacity-0"
          style={{ boxShadow: selectedGate ? '0 0 20px rgba(0, 208, 255, 0.2)' : 'none' }}
        >
          Forge My Reflection
        </button>
      </motion.div>
    </div>
  );
}
