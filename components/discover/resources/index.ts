/**
 * Resource Discovery Components
 * 
 * 3D clustered particle visualization for exploring resources
 */

export { default as ResourceDiscoveryView } from './ResourceDiscoveryView';
export { default as ResourceDiscoveryCanvas } from './ResourceDiscoveryCanvas';
export { default as ResourceParticleSystem } from './ResourceParticleSystem';
export { default as CategoryFilterBar } from './CategoryFilterBar';
export { default as ResourceTooltip } from './ResourceTooltip';

// Re-export store and types for convenience
export {
  useResourceDiscoveryStore,
  selectActiveResources,
  selectCategories,
  selectSubCategories
} from '@/lib/stores/resource-discovery-store';

export type {
  ResourceNode,
  ResourceCluster,
  CameraTarget,
  FilterState
} from '@/types/resource-discovery';

export { DEFAULT_CATEGORY_COLORS } from '@/types/resource-discovery';
