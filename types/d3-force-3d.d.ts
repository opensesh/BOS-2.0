/**
 * Type declarations for d3-force-3d
 * 
 * Extends d3-force with 3D simulation capabilities
 */

declare module 'd3-force-3d' {
  import { SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';

  export interface Simulation3DNodeDatum extends SimulationNodeDatum {
    x?: number;
    y?: number;
    z?: number;
    vx?: number;
    vy?: number;
    vz?: number;
    fx?: number | null;
    fy?: number | null;
    fz?: number | null;
  }

  export interface Force3D<NodeDatum extends Simulation3DNodeDatum> {
    (alpha: number): void;
    initialize?(nodes: NodeDatum[], random: () => number): void;
  }

  export interface Simulation3D<
    NodeDatum extends Simulation3DNodeDatum,
    LinkDatum extends SimulationLinkDatum<NodeDatum> | undefined = undefined
  > {
    restart(): this;
    stop(): this;
    tick(iterations?: number): this;
    nodes(): NodeDatum[];
    nodes(nodes: NodeDatum[]): this;
    alpha(): number;
    alpha(alpha: number): this;
    alphaMin(): number;
    alphaMin(min: number): this;
    alphaDecay(): number;
    alphaDecay(decay: number): this;
    alphaTarget(): number;
    alphaTarget(target: number): this;
    velocityDecay(): number;
    velocityDecay(decay: number): this;
    force(name: string): Force3D<NodeDatum> | undefined;
    force(name: string, force: Force3D<NodeDatum> | null): this;
    find(x: number, y: number, z?: number, radius?: number): NodeDatum | undefined;
    randomSource(): () => number;
    randomSource(source: () => number): this;
    on(typenames: string): ((this: Simulation3D<NodeDatum, LinkDatum>) => void) | undefined;
    on(typenames: string, listener: ((this: Simulation3D<NodeDatum, LinkDatum>) => void) | null): this;
  }

  export function forceSimulation<NodeDatum extends Simulation3DNodeDatum>(
    nodes?: NodeDatum[],
    numDimensions?: number
  ): Simulation3D<NodeDatum>;

  export function forceCenter<NodeDatum extends Simulation3DNodeDatum>(
    x?: number,
    y?: number,
    z?: number
  ): ForceCenter<NodeDatum>;

  export interface ForceCenter<NodeDatum extends Simulation3DNodeDatum> extends Force3D<NodeDatum> {
    x(): number;
    x(x: number): this;
    y(): number;
    y(y: number): this;
    z(): number;
    z(z: number): this;
    strength(): number;
    strength(strength: number): this;
  }

  export function forceManyBody<NodeDatum extends Simulation3DNodeDatum>(): ForceManyBody<NodeDatum>;

  export interface ForceManyBody<NodeDatum extends Simulation3DNodeDatum> extends Force3D<NodeDatum> {
    strength(): number | ((d: NodeDatum, i: number, data: NodeDatum[]) => number);
    strength(strength: number | ((d: NodeDatum, i: number, data: NodeDatum[]) => number)): this;
    theta(): number;
    theta(theta: number): this;
    distanceMin(): number;
    distanceMin(distance: number): this;
    distanceMax(): number;
    distanceMax(distance: number): this;
  }

  export function forceCollide<NodeDatum extends Simulation3DNodeDatum>(
    radius?: number | ((d: NodeDatum, i: number, data: NodeDatum[]) => number)
  ): ForceCollide<NodeDatum>;

  export interface ForceCollide<NodeDatum extends Simulation3DNodeDatum> extends Force3D<NodeDatum> {
    radius(): number | ((d: NodeDatum, i: number, data: NodeDatum[]) => number);
    radius(radius: number | ((d: NodeDatum, i: number, data: NodeDatum[]) => number)): this;
    strength(): number;
    strength(strength: number): this;
    iterations(): number;
    iterations(iterations: number): this;
  }

  export function forceX<NodeDatum extends Simulation3DNodeDatum>(
    x?: number | ((d: NodeDatum, i: number, data: NodeDatum[]) => number)
  ): ForceX<NodeDatum>;

  export interface ForceX<NodeDatum extends Simulation3DNodeDatum> extends Force3D<NodeDatum> {
    x(): number | ((d: NodeDatum, i: number, data: NodeDatum[]) => number);
    x(x: number | ((d: NodeDatum, i: number, data: NodeDatum[]) => number)): this;
    strength(): number | ((d: NodeDatum, i: number, data: NodeDatum[]) => number);
    strength(strength: number | ((d: NodeDatum, i: number, data: NodeDatum[]) => number)): this;
  }

  export function forceY<NodeDatum extends Simulation3DNodeDatum>(
    y?: number | ((d: NodeDatum, i: number, data: NodeDatum[]) => number)
  ): ForceY<NodeDatum>;

  export interface ForceY<NodeDatum extends Simulation3DNodeDatum> extends Force3D<NodeDatum> {
    y(): number | ((d: NodeDatum, i: number, data: NodeDatum[]) => number);
    y(y: number | ((d: NodeDatum, i: number, data: NodeDatum[]) => number)): this;
    strength(): number | ((d: NodeDatum, i: number, data: NodeDatum[]) => number);
    strength(strength: number | ((d: NodeDatum, i: number, data: NodeDatum[]) => number)): this;
  }

  export function forceZ<NodeDatum extends Simulation3DNodeDatum>(
    z?: number | ((d: NodeDatum, i: number, data: NodeDatum[]) => number)
  ): ForceZ<NodeDatum>;

  export interface ForceZ<NodeDatum extends Simulation3DNodeDatum> extends Force3D<NodeDatum> {
    z(): number | ((d: NodeDatum, i: number, data: NodeDatum[]) => number);
    z(z: number | ((d: NodeDatum, i: number, data: NodeDatum[]) => number)): this;
    strength(): number | ((d: NodeDatum, i: number, data: NodeDatum[]) => number);
    strength(strength: number | ((d: NodeDatum, i: number, data: NodeDatum[]) => number)): this;
  }

  export function forceLink<
    NodeDatum extends Simulation3DNodeDatum,
    LinkDatum extends SimulationLinkDatum<NodeDatum>
  >(
    links?: LinkDatum[]
  ): ForceLink<NodeDatum, LinkDatum>;

  export interface ForceLink<
    NodeDatum extends Simulation3DNodeDatum,
    LinkDatum extends SimulationLinkDatum<NodeDatum>
  > extends Force3D<NodeDatum> {
    links(): LinkDatum[];
    links(links: LinkDatum[]): this;
    id(): (d: NodeDatum, i: number, data: NodeDatum[]) => string | number;
    id(id: (d: NodeDatum, i: number, data: NodeDatum[]) => string | number): this;
    iterations(): number;
    iterations(iterations: number): this;
    strength(): number | ((d: LinkDatum, i: number, data: LinkDatum[]) => number);
    strength(strength: number | ((d: LinkDatum, i: number, data: LinkDatum[]) => number)): this;
    distance(): number | ((d: LinkDatum, i: number, data: LinkDatum[]) => number);
    distance(distance: number | ((d: LinkDatum, i: number, data: LinkDatum[]) => number)): this;
  }

  export function forceRadial<NodeDatum extends Simulation3DNodeDatum>(
    radius: number | ((d: NodeDatum, i: number, data: NodeDatum[]) => number),
    x?: number,
    y?: number,
    z?: number
  ): ForceRadial<NodeDatum>;

  export interface ForceRadial<NodeDatum extends Simulation3DNodeDatum> extends Force3D<NodeDatum> {
    radius(): number | ((d: NodeDatum, i: number, data: NodeDatum[]) => number);
    radius(radius: number | ((d: NodeDatum, i: number, data: NodeDatum[]) => number)): this;
    x(): number;
    x(x: number): this;
    y(): number;
    y(y: number): this;
    z(): number;
    z(z: number): this;
    strength(): number | ((d: NodeDatum, i: number, data: NodeDatum[]) => number);
    strength(strength: number | ((d: NodeDatum, i: number, data: NodeDatum[]) => number)): this;
  }
}
