import type { Character } from './characters'
import type { RunnerPose, View } from './types'
import { ellipse, project } from './view'

function drawHead(ctx: CanvasRenderingContext2D, ch: Character, s: number) {
  const hy = -1.62 * s
  if (ch.head === 'hood') {
    ctx.fillStyle = ch.accent
    ctx.beginPath()
    ctx.arc(0, hy, 0.21 * s, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(-0.21 * s, hy, 0.42 * s, 0.2 * s)
    return
  }
  ctx.fillStyle = ch.skin
  ctx.beginPath()
  ctx.arc(0, hy, 0.17 * s, 0, Math.PI * 2)
  ctx.fill()
  if (ch.head === 'fedora') {
    ctx.fillStyle = ch.accent
    ctx.beginPath()
    ctx.ellipse(0, -1.7 * s, 0.28 * s, 0.07 * s, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(-0.15 * s, -1.88 * s, 0.3 * s, 0.19 * s)
    ctx.fillStyle = ch.shirt
    ctx.fillRect(-0.15 * s, -1.74 * s, 0.3 * s, 0.05 * s)
  } else if (ch.head === 'cap') {
    ctx.fillStyle = ch.accent
    ctx.beginPath()
    ctx.arc(0, -1.66 * s, 0.18 * s, Math.PI, 0)
    ctx.fill()
    ctx.fillRect(-0.18 * s, -1.68 * s, 0.36 * s, 0.04 * s)
    ctx.fillStyle = '#122d45'
    ctx.fillRect(-0.04 * s, -1.83 * s, 0.08 * s, 0.05 * s)
  } else {
    ctx.fillStyle = ch.accent
    ctx.fillRect(-0.175 * s, -1.7 * s, 0.35 * s, 0.07 * s)
    ctx.fillRect(0.1 * s, -1.66 * s, 0.14 * s, 0.04 * s)
    ctx.fillRect(0.2 * s, -1.62 * s, 0.1 * s, 0.04 * s)
  }
}

/** Back-view runner, drawn at the player's depth (z = 0). */
export function drawRunner(v: View, r: RunnerPose, ch: Character) {
  const { ctx, unit: s } = v
  const base = project(v, r.x, 0, r.y)
  const gnd = project(v, r.x, 0, 0)
  const shadow = Math.max(0.45, 1 - r.y * 0.28)
  ellipse(ctx, gnd.x, gnd.y, s * 0.42 * shadow, s * 0.12 * shadow, 'rgba(18,45,69,0.22)')

  ctx.save()
  ctx.translate(base.x, base.y)
  ctx.rotate(r.lean + r.dead * 1.35)
  if (r.sliding) ctx.scale(1.2, 0.55)

  const air = r.y > 0.05

  for (const side of [-1, 1]) {
    const lift = air ? 0.32 : Math.max(0, Math.sin(r.phase + (side > 0 ? 0 : Math.PI))) * 0.34
    ctx.strokeStyle = ch.pants
    ctx.lineWidth = 0.14 * s
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(side * 0.1 * s, -0.85 * s)
    ctx.lineTo(side * 0.13 * s, -lift * s - 0.04 * s)
    ctx.stroke()
    ctx.fillStyle = ch.shoes
    ctx.fillRect(side * 0.13 * s - 0.09 * s, -lift * s - 0.08 * s, 0.18 * s, 0.09 * s)
  }

  ctx.fillStyle = ch.shirt
  ctx.fillRect(-0.25 * s, -1.47 * s, 0.5 * s, 0.66 * s)
  ctx.fillStyle = ch.pack
  ctx.fillRect(-0.17 * s, -1.4 * s, 0.34 * s, 0.4 * s)
  ctx.fillStyle = 'rgba(18,45,69,0.25)'
  ctx.fillRect(-0.17 * s, -1.2 * s, 0.34 * s, 0.05 * s)

  for (const side of [-1, 1]) {
    const bob = air ? -0.25 : Math.sin(r.phase + (side > 0 ? Math.PI : 0)) * 0.16
    ctx.strokeStyle = ch.sleeve
    ctx.lineWidth = 0.11 * s
    ctx.beginPath()
    ctx.moveTo(side * 0.28 * s, -1.38 * s)
    ctx.lineTo(side * 0.36 * s, (-0.98 + bob) * s)
    ctx.stroke()
    ctx.fillStyle = ch.skin
    ctx.beginPath()
    ctx.arc(side * 0.36 * s, (-0.96 + bob) * s, 0.06 * s, 0, Math.PI * 2)
    ctx.fill()
  }

  drawHead(ctx, ch, s)
  ctx.restore()
}
