import { FOCAL } from './types'
import type { Pt, View } from './types'

/** Project a lane position (lane units), depth z (meters) and elevation (meters) to screen space. */
export function project(v: View, lane: number, z: number, elev = 0): Pt {
  const zz = Math.max(z, -FOCAL * 0.8)
  const p = FOCAL / (FOCAL + zz)
  return {
    x: v.cx + lane * v.laneW * p,
    y: v.horizon + (v.ground - v.horizon) * p - elev * v.unit * p,
    p,
  }
}

export function ellipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fill: string,
) {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.ellipse(x, y, Math.max(rx, 0.1), Math.max(ry, 0.1), 0, 0, Math.PI * 2)
  ctx.fill()
}

export function poly(ctx: CanvasRenderingContext2D, pts: Array<[number, number]>, fill: string) {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1])
  ctx.closePath()
  ctx.fill()
}
