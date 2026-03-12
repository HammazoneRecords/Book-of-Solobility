import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  name: string;
  gate: string | null;
  setName: (name: string) => void;
  setGate: (gate: string) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      name: '',
      gate: null,
      setName: (name) => set({ name }),
      setGate: (gate) => set({ gate }),
      reset: () => set({ name: '', gate: null }),
    }),
    {
      name: 'solob-storage',
    }
  )
);
