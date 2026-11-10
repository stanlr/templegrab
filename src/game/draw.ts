import { Z_FAR } from './types'
import type { Coin, Obstacle, Pop, View } from './types'
import { ellipse, poly, project } from './view'

const SEG = 3
const PILLAR_GAP = 7
const FOG = '253,236,207'

function quad(v: View, l0: number, l1: number, za: number, zb: number, color: string) {
  const a = project(v, l0, za)
  const b = project(v, l1, za)
  const c = project(v, l1, zb)
  const d = project(v, l0, zb)
  poly(v.ctx, [[a.x, a.y], [b.x, b.y], [c.x, c.y], [d.x, d.y]], color)
}

export function drawBackdrop(v: View) {
  const { ctx, W, H, horizon: h, cx } = v
  const sky = ctx.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, '#b9d3ee')
  sky.addColorStop(1, `rgb(${FOG})`)
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, W, h + 1)

  ellipse(ctx, W * 0.74, h * 0.55, W * 0.07, W * 0.07, 'rgba(255,255,255,0.8)')

  poly(ctx, [
    [0, h], [W * 0.12, h - H * 0.07], [W * 0.28, h - H * 0.025], [W * 0.45, h - H * 0.09],
    [W * 0.62, h - H * 0.03], [W * 0.8, h - H * 0.075], [W, h - H * 0.02], [W, h],
  ], '#a9bfcf')

  // distant stepped temple
  const steps = [[0.34, 0.03], [0.26, 0.06], [0.18, 0.09], [0.1, 0.12]]
  steps.forEach(([w, top]) => {
    ctx.fillStyle = '#8aa2b4'
    ctx.fillRect(cx - (W * w) / 2, h - H * top, W * w, H * top)
  })
  ctx.fillStyle = '#7890a3'
  ctx.fillRect(cx - W * 0.03, h - H * 0.15, W * 0.06, H * 0.03)

  const grass = ctx.createLinearGradient(0, h, 0, H)
  grass.addColorStop(0, '#8a9a6c')
  grass.addColorStop(1, '#5f6f48')
  ctx.fillStyle = grass
  ctx.fillRect(0, h, W, H - h)
}

export function drawRoad(v: View, dist: number) {
  const base = Math.floor(dist / SEG)
  const off = dist - base * SEG
  for (let i = 0; ; i++) {
    const z0 = i * SEG - off
    if (z0 >= Z_FAR) break
    const za = Math.max(z0, -2)
    const zb = z0 + SEG
    if (zb <= za) continue
    const par = (base + i) & 1
    const side = par ? '#7f8f5f' : '#768659'
    quad(v, -12, -1.5, za, zb, side)
    quad(v, 1.5, 12, za, zb, side)
    quad(v, -1.58, 1.58, za, zb, '#8a7456')
    quad(v, -1.5, 1.5, za, zb, par ? '#dcc6a1' : '#d0b88f')
    if (par) {
      quad(v, -0.52, -0.48, za, zb, 'rgba(255,255,255,0.5)')
      quad(v, 0.48, 0.52, za, zb, 'rgba(255,255,255,0.5)')
    }
  }
}

export function drawPillars(v: View, dist: number) {
  const { ctx } = v
  const base = Math.floor(dist / PILLAR_GAP)
  const off = dist - base * PILLAR_GAP
  for (let i = Math.floor(Z_FAR / PILLAR_GAP); i >= 0; i--) {
    const z = i * PILLAR_GAP - off
    if (z < -3) continue
    for (const side of [-1, 1]) {
      const lane = side * 2.15
      const bot = project(v, lane, z, 0)
      const top = project(v, lane, z, 4.6)
      const w = 0.55 * v.laneW * bot.p
      ctx.fillStyle = '#bfae93'
      ctx.fillRect(bot.x - w / 2, top.y, w, bot.y - top.y)
      ctx.fillStyle = 'rgba(18,45,69,0.12)'
      ctx.fillRect(bot.x + (side > 0 ? 0 : -w / 2), top.y, w / 2, bot.y - top.y)
      const capH = 0.3 * v.unit * bot.p
      ctx.fillStyle = '#a8967a'
      ctx.fillRect(bot.x - w * 0.7, top.y, w * 1.4, capH)
      ctx.fillRect(bot.x - w * 0.65, bot.y - capH, w * 1.3, capH)
    }
  }
}

export function drawFog(v: View) {
  const { ctx, W, H, horizon: h } = v
  const g = ctx.createLinearGradient(0, h - 10, 0, h + H * 0.18)
  g.addColorStop(0, `rgba(${FOG},0.95)`)
  g.addColorStop(1, `rgba(${FOG},0)`)
  ctx.fillStyle = g
  ctx.fillRect(0, h - 10, W, H * 0.18 + 10)
}

function drawBeam(v: View, z: number) {
  const { ctx } = v
  const l = project(v, -1.45, z, 0)
  const r = project(v, 1.45, z, 0)
  const pw = 0.24 * v.laneW * l.p
  const ph = 2.1 * v.unit * l.p
  ctx.fillStyle = '#6e5f52'
  ctx.fillRect(l.x - pw / 2, l.y - ph, pw, ph)
  ctx.fillRect(r.x - pw / 2, r.y - ph, pw, ph)
  const topY = project(v, 0, z, 1.7).y
  const botY = project(v, 0, z, 0.95).y
  ctx.fillStyle = '#8a5a3c'
  ctx.fillRect(l.x - pw / 2, topY, r.x - l.x + pw, botY - topY)
  const n = 14
  const sw = (r.x - l.x + pw) / n
  ctx.fillStyle = '#e9c36a'
  for (let k = 0; k < n; k += 2) ctx.fillRect(l.x - pw / 2 + k * sw, topY, sw, botY - topY)
  ctx.fillStyle = 'rgba(18,45,69,0.18)'
  ctx.fillRect(l.x - pw / 2, botY - (botY - topY) * 0.25, r.x - l.x + pw, (botY - topY) * 0.25)
}

export function drawObstacle(v: View, o: Obstacle) {
  if (o.kind === 'beam') {
    drawBeam(v, o.z)
    return
  }
  const { ctx } = v
  const b = project(v, o.lane, o.z, 0)
  const tall = o.kind === 'pillar'
  const w = (tall ? 0.7 : 0.88) * v.laneW * b.p
  const h = (tall ? 3.2 : 0.75) * v.unit * b.p
  ellipse(ctx, b.x, b.y, w * 0.62, w * 0.12, 'rgba(18,45,69,0.2)')
  ctx.fillStyle = tall ? '#6f6053' : '#8f7d6b'
  ctx.fillRect(b.x - w / 2, b.y - h, w, h)
  if (tall) {
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.fillRect(b.x - w / 2, b.y - h, w * 0.25, h)
    ctx.fillStyle = '#948471'
    const capH = 0.35 * v.unit * b.p
    ctx.fillRect(b.x - w * 0.62, b.y - h - capH * 0.4, w * 1.24, capH)
    ctx.fillStyle = 'rgba(18,45,69,0.22)'
    for (let k = 1; k < 5; k++) ctx.fillRect(b.x - w / 2, b.y - (h * k) / 5, w, Math.max(1, h * 0.018))
    return
  }
  const th = 0.3 * v.unit * b.p
  poly(ctx, [
    [b.x - w / 2, b.y - h], [b.x + w / 2, b.y - h],
    [b.x + w * 0.4, b.y - h - th], [b.x - w * 0.4, b.y - h - th],
  ], '#b09c86')
  ctx.fillStyle = 'rgba(18,45,69,0.2)'
  ctx.fillRect(b.x - w / 2, b.y - h * 0.5, w, Math.max(1, h * 0.04))
  poly(ctx, [
    [b.x, b.y - h * 0.85], [b.x + w * 0.16, b.y - h * 0.5],
    [b.x, b.y - h * 0.15], [b.x - w * 0.16, b.y - h * 0.5],
  ], 'rgba(18,45,69,0.16)')
}

export function drawCoin(v: View, c: Coin, t: number) {
  if (c.taken) return
  const { ctx } = v
  const a = project(v, c.lane, c.z, c.elev)
  const r = 0.34 * v.unit * a.p
  if (r < 1.5) return
  const g = project(v, c.lane, c.z, 0)
  ellipse(ctx, g.x, g.y, r * 0.9, r * 0.26, 'rgba(18,45,69,0.16)')
  const sx = Math.max(0.28, Math.abs(Math.cos(t * 4 + c.lane * 1.3 + c.elev)))
  ctx.save()
  ctx.translate(a.x, a.y)
  ctx.scale(sx, 1)
  ctx.fillStyle = '#2775ca'
  ctx.beginPath()
  ctx.arc(0, 0, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.lineWidth = Math.max(1, r * 0.13)
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.74, 0, Math.PI * 2)
  ctx.stroke()
  if (r > 7) {
    ctx.fillStyle = '#ffffff'
    ctx.font = `700 ${r * 1.05}px 'Space Grotesk', sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('$', 0, r * 0.05)
  }
  ctx.restore()
}

export function drawPops(v: View, pops: Pop[]) {
  const { ctx } = v
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const p of pops) {
    const a = project(v, p.lane, 0, p.elev)
    ctx.globalAlpha = Math.max(0, 1 - p.age / 0.8)
    ctx.fillStyle = '#122d45'
    ctx.font = "700 15px 'Space Grotesk', sans-serif"
    ctx.fillText('+0.01', a.x, a.y - 30 - p.age * 55)
  }
  ctx.globalAlpha = 1
}
