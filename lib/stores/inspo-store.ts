import { create } from 'zustand';
import type { NormalizedResource } from '@/lib/data/inspo';

export type ViewMode = 'sphere' | 'galaxy' | 'grid' | 'nebula' | 'starfield' | 'vortex';

interface ParticleSettings {
  particleCount: number;
  particleSize: number;
  animationSpeed: number;
  autoPlay: boolean;
}

interface ColorSettings {
  innerColor: string;
  outerColor: string;
}

interface ClusterState {
  centerId: number | null;
  nearbyIds: number[];
  isAnimating: boolean;
}

interface InspoState {
  // View mode
  viewMode: ViewMode;
  isTransitioning: boolean;
  
  // Particle settings
  particleSettings: ParticleSettings;
  
  // Color settings
  colorSettings: ColorSettings;
  
  // Control panel state
  isPanelOpen: boolean;

  // Resources data
  resources: NormalizedResource[];
  
  // Hover and cluster state
  hoveredNodeId: number | null;
  clusterState: ClusterState;

  // Actions
  setViewMode: (mode: ViewMode) => void;
  setTransitioning: (transitioning: boolean) => void;
  setParticleCount: (count: number) => void;
  setParticleSize: (size: number) => void;
  setAnimationSpeed: (speed: number) => void;
  setAutoPlay: (autoPlay: boolean) => void;
  setInnerColor: (color: string) => void;
  setOuterColor: (color: string) => void;
  setPanelOpen: (open: boolean) => void;
  togglePanel: () => void;
  setResources: (resources: NormalizedResource[]) => void;
  setHoveredNodeId: (id: number | null) => void;
  setClusterState: (state: ClusterState) => void;
  clearCluster: () => void;
}

const DEFAULT_PARTICLE_SETTINGS: ParticleSettings = {
  particleCount: 2000,
  particleSize: 0.12,
  animationSpeed: 0.5,
  autoPlay: true,
};

const DEFAULT_COLOR_SETTINGS: ColorSettings = {
  innerColor: '#FFFAEE', // Vanilla (center)
  outerColor: '#FE5102', // Aperol (edge)
};

const DEFAULT_CLUSTER_STATE: ClusterState = {
  centerId: null,
  nearbyIds: [],
  isAnimating: false,
};

export const useInspoStore = create<InspoState>((set) => ({
  viewMode: 'sphere',
  isTransitioning: false,
  particleSettings: DEFAULT_PARTICLE_SETTINGS,
  colorSettings: DEFAULT_COLOR_SETTINGS,
  isPanelOpen: false,
  resources: [],
  hoveredNodeId: null,
  clusterState: DEFAULT_CLUSTER_STATE,

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
  
  setInnerColor: (color) =>
    set((state) => ({
      colorSettings: { ...state.colorSettings, innerColor: color }
    })),
  
  setOuterColor: (color) =>
    set((state) => ({
      colorSettings: { ...state.colorSettings, outerColor: color }
    })),
  
  setPanelOpen: (open) => set({ isPanelOpen: open }),
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
  
  setResources: (resources) => set({ resources }),
  setHoveredNodeId: (id) => set({ hoveredNodeId: id }),
  setClusterState: (clusterState) => set({ clusterState }),
  clearCluster: () => set({ 
    hoveredNodeId: null, 
    clusterState: DEFAULT_CLUSTER_STATE 
  }),
}));
