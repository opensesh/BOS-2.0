/**
 * Force-Directed Cluster Layout
 * Uses d3-force-3d to position resource nodes with category/section clustering
 */

import {
  forceSimulation,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
  forceZ,
} from 'd3-force-3d';
import type { ResourceNode, ResourceCluster } from '@/types/resource-discovery';
import { DEFAULT_CATEGORY_COLORS } from '@/types/resource-discovery';
import type { NormalizedResource } from '@/lib/data/inspo';

/**
 * Configuration for force simulation
 */
interface ForceLayoutConfig {
  clusterRadius: number;      // Distance between cluster centers
  nodeRepulsion: number;      // Repulsion strength between nodes
  clusterStrength: number;    // Attraction strength to cluster center
  collisionRadius: number;    // Minimum distance between nodes
  iterations: number;         // Simulation iterations
  centerForce: number;        // Strength of centering force
}

const DEFAULT_CONFIG: ForceLayoutConfig = {
  clusterRadius: 20,
  nodeRepulsion: -8,
  clusterStrength: 0.3,
  collisionRadius: 1.2,
  iterations: 150,
  centerForce: 0.02,
};

/**
 * Generates cluster centers arranged in a sphere
 * Categories form major clusters, sections form sub-clusters
 */
function generateClusterCenters(
  categories: string[],
  radius: number
): Map<string, { x: number; y: number; z: number }> {
  const centers = new Map<string, { x: number; y: number; z: number }>();
  const count = categories.length;
  
  // Golden angle for Fibonacci sphere distribution
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  
  categories.forEach((category, i) => {
    // Fibonacci sphere distribution for even spacing
    const y = 1 - (i / (count - 1 || 1)) * 2; // Range [-1, 1]
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    
    const x = Math.cos(theta) * radiusAtY * radius;
    const z = Math.sin(theta) * radiusAtY * radius;
    
    centers.set(category, { x, y: y * radius * 0.6, z }); // Flatten Y slightly
  });
  
  return centers;
}

/**
 * Generates section offsets within a category cluster
 * Creates sub-groupings for sections
 */
function getSectionOffset(
  sectionIndex: number,
  totalSections: number,
  subRadius: number = 5
): { x: number; y: number; z: number } {
  if (totalSections <= 1) return { x: 0, y: 0, z: 0 };
  
  // Arrange sections in a ring around category center
  const angle = (sectionIndex / totalSections) * Math.PI * 2;
  
  return {
    x: Math.cos(angle) * subRadius,
    y: (Math.random() - 0.5) * 2,
    z: Math.sin(angle) * subRadius,
  };
}

/**
 * Creates ResourceNode with initial cluster-based positioning
 */
function createResourceNode(
  resource: NormalizedResource,
  clusterCenter: { x: number; y: number; z: number },
  sectionOffset: { x: number; y: number; z: number },
  clusterId: string,
  clusterIndex: number
): ResourceNode {
  // Add some random jitter within cluster
  const jitter = {
    x: (Math.random() - 0.5) * 3,
    y: (Math.random() - 0.5) * 3,
    z: (Math.random() - 0.5) * 3,
  };
  
  return {
    ...resource,
    x: clusterCenter.x + sectionOffset.x + jitter.x,
    y: clusterCenter.y + sectionOffset.y + jitter.y,
    z: clusterCenter.z + sectionOffset.z + jitter.z,
    clusterId,
    clusterIndex,
  };
}

/**
 * Main function: Generate force-directed clustered layout
 * 
 * @param resources - Normalized resources from Supabase
 * @param config - Optional configuration overrides
 * @returns Object with positioned nodes and cluster metadata
 */
export function generateClusteredLayout(
  resources: NormalizedResource[],
  config: Partial<ForceLayoutConfig> = {}
): { nodes: ResourceNode[]; clusters: ResourceCluster[] } {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  
  // Extract unique categories and sections
  const categoryMap = new Map<string, Set<string>>();
  
  resources.forEach(r => {
    const category = r.category || 'Uncategorized';
    if (!categoryMap.has(category)) {
      categoryMap.set(category, new Set());
    }
    if (r.section) {
      categoryMap.get(category)!.add(r.section);
    }
  });
  
  const categories = Array.from(categoryMap.keys()).sort();
  const clusterCenters = generateClusterCenters(categories, cfg.clusterRadius);
  
  // Track sections per category for offset calculation
  const sectionIndices = new Map<string, Map<string, number>>();
  categories.forEach(cat => {
    const sections = Array.from(categoryMap.get(cat) || []).sort();
    const indexMap = new Map<string, number>();
    sections.forEach((sec, i) => indexMap.set(sec, i));
    sectionIndices.set(cat, indexMap);
  });
  
  // Create initial nodes with cluster-based positioning
  let clusterIdx = 0;
  const clusterIdToIndex = new Map<string, number>();
  
  const nodes: ResourceNode[] = resources.map(resource => {
    const category = resource.category || 'Uncategorized';
    const section = resource.section || '';
    const clusterId = `${category}::${section}`;
    
    if (!clusterIdToIndex.has(clusterId)) {
      clusterIdToIndex.set(clusterId, clusterIdx++);
    }
    
    const center = clusterCenters.get(category) || { x: 0, y: 0, z: 0 };
    const sectionMap = sectionIndices.get(category);
    const sectionIdx = sectionMap?.get(section) ?? 0;
    const totalSections = sectionMap?.size ?? 1;
    const offset = getSectionOffset(sectionIdx, totalSections);
    
    return createResourceNode(
      resource,
      center,
      offset,
      clusterId,
      clusterIdToIndex.get(clusterId)!
    );
  });
  
  // Run force simulation
  const simulation = forceSimulation(nodes, 3)
    // Repulsion between all nodes
    .force('charge', forceManyBody().strength(cfg.nodeRepulsion))
    // Prevent overlap
    .force('collide', forceCollide().radius(cfg.collisionRadius))
    // Gentle centering
    .force('center', forceCenter(0, 0, 0).strength(cfg.centerForce))
    // Pull towards cluster X
    .force('x', forceX<ResourceNode>((d) => {
      const center = clusterCenters.get(d.category || 'Uncategorized');
      return center?.x ?? 0;
    }).strength(cfg.clusterStrength))
    // Pull towards cluster Y
    .force('y', forceY<ResourceNode>((d) => {
      const center = clusterCenters.get(d.category || 'Uncategorized');
      return center?.y ?? 0;
    }).strength(cfg.clusterStrength))
    // Pull towards cluster Z
    .force('z', forceZ<ResourceNode>((d) => {
      const center = clusterCenters.get(d.category || 'Uncategorized');
      return center?.z ?? 0;
    }).strength(cfg.clusterStrength));
  
  // Run simulation synchronously
  simulation.stop();
  for (let i = 0; i < cfg.iterations; i++) {
    simulation.tick();
  }
  
  // Build cluster metadata
  const clusterData = new Map<string, {
    resources: ResourceNode[];
    category: string;
    section: string | null;
  }>();
  
  nodes.forEach(node => {
    if (!clusterData.has(node.clusterId)) {
      clusterData.set(node.clusterId, {
        resources: [],
        category: node.category || 'Uncategorized',
        section: node.section,
      });
    }
    clusterData.get(node.clusterId)!.resources.push(node);
  });
  
  // Calculate cluster centers and create metadata
  const clusters: ResourceCluster[] = Array.from(clusterData.entries()).map(
    ([id, data]) => {
      const { resources: clusterResources, category, section } = data;
      
      // Calculate centroid of all nodes in cluster
      const center = clusterResources.reduce(
        (acc, node) => ({
          x: acc.x + node.x / clusterResources.length,
          y: acc.y + node.y / clusterResources.length,
          z: acc.z + node.z / clusterResources.length,
        }),
        { x: 0, y: 0, z: 0 }
      );
      
      return {
        id,
        category,
        section,
        count: clusterResources.length,
        center,
        color: DEFAULT_CATEGORY_COLORS[category] || DEFAULT_CATEGORY_COLORS.default,
      };
    }
  );
  
  return { nodes, clusters };
}

/**
 * Update node positions for re-clustering (e.g., after filter change)
 * Uses existing positions as starting point for smoother transitions
 */
export function updateClusterPositions(
  nodes: ResourceNode[],
  activeCategory: string | null,
  config: Partial<ForceLayoutConfig> = {}
): ResourceNode[] {
  const cfg = { ...DEFAULT_CONFIG, ...config, iterations: 50 }; // Fewer iterations for updates
  
  // If category is active, pull inactive nodes away
  if (activeCategory) {
    nodes.forEach(node => {
      if (node.category !== activeCategory) {
        // Push non-active nodes outward
        const distance = Math.sqrt(node.x ** 2 + node.y ** 2 + node.z ** 2);
        const scale = distance > 0 ? 40 / distance : 1;
        node.fx = node.x * scale;
        node.fy = node.y * scale;
        node.fz = node.z * scale;
      } else {
        // Release fixed positions for active category
        node.fx = null;
        node.fy = null;
        node.fz = null;
      }
    });
  } else {
    // Release all fixed positions
    nodes.forEach(node => {
      node.fx = null;
      node.fy = null;
      node.fz = null;
    });
  }
  
  const simulation = forceSimulation(nodes, 3)
    .force('charge', forceManyBody().strength(cfg.nodeRepulsion))
    .force('collide', forceCollide().radius(cfg.collisionRadius))
    .force('center', forceCenter(0, 0, 0).strength(cfg.centerForce));
  
  simulation.stop();
  for (let i = 0; i < cfg.iterations; i++) {
    simulation.tick();
  }
  
  return nodes;
}
