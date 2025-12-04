import { create } from 'zustand';

export type ViewMode = 'sphere' | 'galaxy' | 'grid' | 'nebula' | 'starfield' | 'vortex';

interface ParticleSettings {
  particleCount: number;
  particleSize: number;
  animationSpeed: number;
  autoPlay: boolean;
}

interface InspoState {
  // View mode
  viewMode: ViewMode;
  isTransitioning: boolean;
  
  // Particle settings
  particleSettings: ParticleSettings;
  
  // Control panel state
  isPanelOpen: boolean;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setTransitioning: (transitioning: boolean) => void;
  setParticleCount: (count: number) => void;
  setParticleSize: (size: number) => void;
  setAnimationSpeed: (speed: number) => void;
  setAutoPlay: (autoPlay: boolean) => void;
  setPanelOpen: (open: boolean) => void;
  togglePanel: () => void;
}

const DEFAULT_PARTICLE_SETTINGS: ParticleSettings = {
  particleCount: 2000,
  particleSize: 0.12,
  animationSpeed: 0.5,
  autoPlay: true,
};

export const useInspoStore = create<InspoState>((set) => ({
  viewMode: 'sphere',
  isTransitioning: false,
  particleSettings: DEFAULT_PARTICLE_SETTINGS,
  isPanelOpen: false,

  setViewMode: (mode) => set({ viewMode: mode }),
  setTransitioning: (transitioning) => set({ isTransitioning: transitioning }),
  
  setParticleCount: (count) => 
    set((state) => ({ 
      particleSettings: { ...state.particleSettings, particleCount: count } 
    })),
  
  setParticleSize: (size) => 
    set((state) => ({ 
      particleSettings: { ...state.particleSettings, particleSize: size } 
    })),
  
  setAnimationSpeed: (speed) => 
    set((state) => ({ 
      particleSettings: { ...state.particleSettings, animationSpeed: speed } 
    })),
  
  setAutoPlay: (autoPlay) => 
    set((state) => ({ 
      particleSettings: { ...state.particleSettings, autoPlay } 
    })),
  
  setPanelOpen: (open) => set({ isPanelOpen: open }),
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
}));
