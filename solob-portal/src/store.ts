import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  name: string;
  gate: string | null;
  sessionId: string | null;
  tier: string | null;
  setName: (name: string) => void;
  setGate: (gate: string) => void;
  setSessionId: (id: string) => void;
  setTier: (tier: string) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      name: '',
      gate: null,
      sessionId: null,
      tier: null,
      setName: (name) => set({ name }),
      setGate: (gate) => set({ gate }),
      setSessionId: (sessionId) => set({ sessionId }),
      setTier: (tier) => set({ tier }),
      reset: () => set({ name: '', gate: null, sessionId: null, tier: null }),
    }),
    {
      name: 'solob-storage',
    }
  )
);
