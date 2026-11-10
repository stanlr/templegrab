export type Action = 'left' | 'right' | 'jump' | 'slide'
export type Phase = 'idle' | 'running' | 'dead'
export type ObsKind = 'block' | 'pillar' | 'beam'

export interface RunStats {
  coins: number
  distance: number
}

export interface Obstacle {
  kind: ObsKind
  lane: number
  z: number
}

export interface Coin {
  lane: number
  z: number
  elev: number
  taken: boolean
}

export interface Pop {
  lane: number
  elev: number
  age: number
}

export interface View {
  ctx: CanvasRenderingContext2D
  W: number
  H: number
  cx: number
  horizon: number
  ground: number
  laneW: number
  unit: number
}

export interface Pt {
  x: number
  y: number
  p: number
}

export interface RunnerPose {
  x: number
  y: number
  sliding: boolean
  phase: number
  lean: number
  dead: number
}

export interface Handlers {
  onStats: (s: RunStats) => void
  onGameOver: (s: RunStats) => void
}

/** Perspective focal length in meters. */
export const FOCAL = 10
/** How far ahead objects spawn, in meters. */
export const Z_FAR = 90
