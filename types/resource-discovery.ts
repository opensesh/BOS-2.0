/**
 * Types for 3D Resource Discovery Experience
 * Defines the data structures for clustered particle visualization
 */

/**
 * A node in the 3D resource visualization
 * Extends normalized resource data with 3D positioning
 */
export interface ResourceNode {
  // Core identifiers
  id: number;
  name: string;
  url: string;
  
  // Content metadata
  description: string | null;
  category: string | null;
  section: string | null;
  tags: string[] | null;
  
  // Resource attributes
  pricing: string | null;
  featured: boolean;
  opensource: boolean;
  tier: number | null;
  
  // Visual assets
  thumbnail: string | null;
  screenshot: string | null;
  
  // 3D positioning (computed by force layout)
  x: number;
  y: number;
  z: number;
  
  // Force simulation properties
  vx?: number;
  vy?: number;
  vz?: number;
  fx?: number | null;
  fy?: number | null;
  fz?: number | null;
  
  // Cluster assignment
  clusterId: string; // category-section composite key
  clusterIndex: number; // numeric index for positioning
}

/**
 * Cluster metadata for category/section groupings
 */
export interface ResourceCluster {
  id: string; // category-section composite key
  category: string;
  section: string | null;
  count: number;
  center: { x: number; y: number; z: number };
  color: string;
}

/**
 * Camera target state for smooth transitions
 */
export interface CameraTarget {
  position: { x: number; y: number; z: number };
  lookAt: { x: number; y: number; z: number };
}

/**
 * Filter state for resource visibility
 */
export interface FilterState {
  activeCategory: string | null;
  activeSection: string | null;
  searchQuery: string;
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  duration: number; // in seconds
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

/**
 * Color mapping for categories
 */
export type CategoryColorMap = Record<string, string>;

/**
 * Default category colors using brand palette
 */
export const DEFAULT_CATEGORY_COLORS: CategoryColorMap = {
  'Design': '#FE5102',      // Aperol
  'Development': '#4F46E5', // Indigo
  'Marketing': '#10B981',   // Emerald
  'Business': '#F59E0B',    // Amber
  'AI': '#8B5CF6',          // Violet
  'Tools': '#EC4899',       // Pink
  'Resources': '#06B6D4',   // Cyan
  'Learning': '#84CC16',    // Lime
  'default': '#FFFAEE',     // Vanilla
};
