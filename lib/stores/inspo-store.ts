import { create } from 'zustand';

export type ViewMode = 'sphere' | 'galaxy' | 'grid';

interface InspoState {
  viewMode: ViewMode;
  isTransitioning: boolean;

  setViewMode: (mode: ViewMode) => void;
  setTransitioning: (transitioning: boolean) => void;
}

export const useInspoStore = create<InspoState>((set) => ({
  viewMode: 'sphere',
  isTransitioning: false,

  setViewMode: (mode) => set({ viewMode: mode }),
  setTransitioning: (transitioning) => set({ isTransitioning: transitioning }),
}));
