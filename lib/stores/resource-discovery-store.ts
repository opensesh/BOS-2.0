import { create } from 'zustand';
import type { 
  ResourceNode, 
  ResourceCluster, 
  CameraTarget, 
  FilterState
} from '@/types/resource-discovery';

/**
 * Resource Discovery Store
 * Manages state for 3D orbital resource visualization
 */

interface ResourceDiscoveryState {
  // Data
  resources: ResourceNode[];
  clusters: ResourceCluster[];
  isLoading: boolean;
  error: string | null;
  
  // Filter state
  filter: FilterState;
  
  // Camera state
  cameraTarget: CameraTarget;
  isAnimating: boolean;
  
  // Hover/selection state
  hoveredResourceId: number | null;
  selectedResourceId: number | null;
  
  // Actions - Data
  setResources: (resources: ResourceNode[]) => void;
  setClusters: (clusters: ResourceCluster[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Actions - Filtering
  setActiveCategory: (category: string | null) => void;
  setActiveSubCategory: (subCategory: string | null) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
  
  // Actions - Camera
  setCameraTarget: (target: CameraTarget) => void;
  setAnimating: (animating: boolean) => void;
  focusOnCluster: (clusterId: string) => void;
  resetCamera: () => void;
  
  // Actions - Interaction
  setHoveredResource: (id: number | null) => void;
  setSelectedResource: (id: number | null) => void;
}

// Default camera position (overview)
const DEFAULT_CAMERA: CameraTarget = {
  position: { x: 0, y: 5, z: 35 },
  lookAt: { x: 0, y: 0, z: 0 },
};

// Default filter state
const DEFAULT_FILTER: FilterState = {
  activeCategory: null,
  activeSubCategory: null,
  searchQuery: '',
};

export const useResourceDiscoveryStore = create<ResourceDiscoveryState>((set, get) => ({
  // Initial state
  resources: [],
  clusters: [],
  isLoading: true,
  error: null,
  filter: DEFAULT_FILTER,
  cameraTarget: DEFAULT_CAMERA,
  isAnimating: false,
  hoveredResourceId: null,
  selectedResourceId: null,
  
  // Data actions
  setResources: (resources) => set({ resources }),
  setClusters: (clusters) => set({ clusters }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  // Filter actions
  setActiveCategory: (category) => {
    set({
      filter: { ...get().filter, activeCategory: category, activeSubCategory: null }
    });
    
    // Auto-focus on category cluster if set
    if (category) {
      const clusters = get().clusters;
      const categoryCluster = clusters.find(c => c.category === category);
      if (categoryCluster) {
        get().focusOnCluster(categoryCluster.id);
      }
    } else {
      get().resetCamera();
    }
  },
  
  setActiveSubCategory: (subCategory) => {
    set({ filter: { ...get().filter, activeSubCategory: subCategory } });
  },
  
  setSearchQuery: (query) => {
    set({ filter: { ...get().filter, searchQuery: query } });
  },
  
  clearFilters: () => {
    set({ filter: DEFAULT_FILTER });
    get().resetCamera();
  },
  
  // Camera actions
  setCameraTarget: (target) => set({ cameraTarget: target }),
  setAnimating: (animating) => set({ isAnimating: animating }),
  
  focusOnCluster: (clusterId) => {
    const clusters = get().clusters;
    const cluster = clusters.find(c => c.id === clusterId);
    
    if (!cluster) return;
    
    // Calculate camera position to frame the cluster
    const { center } = cluster;
    const distance = 18; // Distance from cluster center
    
    set({
      cameraTarget: {
        position: {
          x: center.x,
          y: center.y + 5,
          z: center.z + distance,
        },
        lookAt: center,
      },
      isAnimating: true,
    });
  },
  
  resetCamera: () => {
    set({
      cameraTarget: DEFAULT_CAMERA,
      isAnimating: true,
    });
  },
  
  // Interaction actions
  setHoveredResource: (id) => set({ hoveredResourceId: id }),
  setSelectedResource: (id) => set({ selectedResourceId: id }),
}));

/**
 * Selector helpers for common computed values
 */
export const selectActiveResources = (state: ResourceDiscoveryState): ResourceNode[] => {
  const { resources, filter } = state;
  
  return resources.filter(resource => {
    // Category filter
    if (filter.activeCategory && resource.category !== filter.activeCategory) {
      return false;
    }
    
    // Sub-category filter
    if (filter.activeSubCategory && resource.subCategory !== filter.activeSubCategory) {
      return false;
    }
    
    // Search filter
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      const matchesName = resource.name.toLowerCase().includes(query);
      const matchesDescription = resource.description?.toLowerCase().includes(query);
      const matchesTags = resource.tags?.some(tag => tag.toLowerCase().includes(query));
      
      if (!matchesName && !matchesDescription && !matchesTags) {
        return false;
      }
    }
    
    return true;
  });
};

export const selectCategories = (state: ResourceDiscoveryState): string[] => {
  const categories = new Set<string>();
  state.resources.forEach(r => {
    if (r.category) categories.add(r.category);
  });
  return Array.from(categories).sort();
};

export const selectSubCategories = (state: ResourceDiscoveryState): string[] => {
  const { filter, resources } = state;
  const subCategories = new Set<string>();

  resources.forEach(r => {
    // Only show sub-categories for active category
    if (filter.activeCategory && r.category !== filter.activeCategory) return;
    if (r.subCategory) subCategories.add(r.subCategory);
  });

  return Array.from(subCategories).sort();
};
