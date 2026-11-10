import { drawBackdrop, drawCoin, drawFog, drawObstacle, drawPillars, drawPops, drawRoad } from './draw'
import { DEFAULT_CHARACTER } from './characters'
import type { Character } from './characters'
import { drawRunner } from './runner'
import { Z_FAR } from './types'
import type { Action, Coin, Handlers, Obstacle, Phase, Pop, RunStats, View } from './types'

const LANES = [-1, 0, 1]
const GRAVITY = 26
const JUMP_V = 9
const SLIDE_TIME = 0.55
const START_SPEED = 14
const MAX_SPEED = 31

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)

export class RunnerGame {
  private ctx: CanvasRenderingContext2D
  private view: View
  private raf = 0
  private last = 0
  private time = 0
  private phase: Phase = 'idle'
  private speed = 0
  private dist = 0
  private coins = 0
  private px = 0
  private target = 0
  private py = 0
  private vy = 0
  private slideT = 0
  private slideOnLand = false
  private runPhase = 0
  private deadT = 0
  private reported = false
  private shake = 0
  private cursor = 0
  private statKey = ''
  private obstacles: Obstacle[] = []
  private coinList: Coin[] = []
  private pops: Pop[] = []
  private character: Character = DEFAULT_CHARACTER

  setCharacter(c: Character) {
    this.character = c
  }

  constructor(
    private canvas: HTMLCanvasElement,
    private handlers: Handlers,
  ) {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D is not available')
    this.ctx = ctx
    this.view = { ctx, W: 400, H: 620, cx: 200, horizon: 186, ground: 540, laneW: 120, unit: 54 }
    this.raf = requestAnimationFrame(this.loop)
  }

  resize(W: number, H: number, dpr: number) {
    this.canvas.width = Math.round(W * dpr)
    this.canvas.height = Math.round(H * dpr)
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const laneW = Math.min(W * 0.3, H * 0.2)
    this.view = {
      ctx: this.ctx,
      W,
      H,
      cx: W / 2,
      horizon: H * 0.3,
      ground: H * 0.87,
      laneW,
      unit: laneW / 2.2,
    }
  }

  destroy() {
    cancelAnimationFrame(this.raf)
  }

  start() {
    this.phase = 'running'
    this.speed = START_SPEED
    this.dist = 0
    this.coins = 0
    this.px = 0
    this.target = 0
    this.py = 0
    this.vy = 0
    this.slideT = 0
    this.slideOnLand = false
    this.deadT = 0
    this.shake = 0
    this.reported = false
    this.cursor = 48
    this.obstacles = []
    this.coinList = []
    this.pops = []
    this.statKey = ''
    this.emitStats()
  }

  input(a: Action) {
    if (this.phase !== 'running') return
    const grounded = this.py <= 0.001 && this.vy === 0
    if (a === 'left') this.target = Math.max(-1, this.target - 1)
    else if (a === 'right') this.target = Math.min(1, this.target + 1)
    else if (a === 'jump' && grounded) {
      this.vy = JUMP_V
      this.slideT = 0
    } else if (a === 'slide') {
      if (grounded) this.slideT = SLIDE_TIME
      else {
        this.vy = -20
        this.slideOnLand = true
      }
    }
  }

  private stats(): RunStats {
    return { coins: this.coins, distance: Math.floor(this.dist) }
  }

  private emitStats() {
    const s = this.stats()
    const key = `${s.coins}:${s.distance}`
    if (key === this.statKey) return
    this.statKey = key
    this.handlers.onStats(s)
  }

  private loop = (ts: number) => {
    const dt = Math.min(0.033, this.last ? (ts - this.last) / 1000 : 0.016)
    this.last = ts
    this.step(dt)
    this.render()
    this.raf = requestAnimationFrame(this.loop)
  }

  private scroll(ds: number) {
    this.dist += ds
    for (const o of this.obstacles) o.z -= ds
    for (const c of this.coinList) c.z -= ds
    this.obstacles = this.obstacles.filter((o) => o.z > -4)
    this.coinList = this.coinList.filter((c) => c.z > -4)
  }

  private step(dt: number) {
    this.time += dt
    for (const p of this.pops) p.age += dt
    this.pops = this.pops.filter((p) => p.age < 0.8)
    this.shake = Math.max(0, this.shake - dt)

    if (this.phase === 'idle') {
      this.scroll(4 * dt)
      this.runPhase += dt * 6
      return
    }
    if (this.phase === 'dead') {
      this.deadT += dt
      this.speed = Math.max(0, this.speed - 70 * dt)
      this.scroll(this.speed * dt)
      if (this.deadT > 0.85 && !this.reported) {
        this.reported = true
        this.handlers.onGameOver(this.stats())
      }
      return
    }

    this.speed = Math.min(MAX_SPEED, this.speed + 0.35 * dt)
    this.scroll(this.speed * dt)
    this.runPhase += this.speed * dt * 0.75
    this.px += (this.target - this.px) * Math.min(1, dt * 14)
    if (this.slideT > 0) this.slideT -= dt

    if (this.py > 0 || this.vy !== 0) {
      this.vy -= GRAVITY * dt
      this.py += this.vy * dt
      if (this.py <= 0) {
        this.py = 0
        this.vy = 0
        if (this.slideOnLand) {
          this.slideT = SLIDE_TIME
          this.slideOnLand = false
        }
      }
    }

    while (this.cursor - this.dist < Z_FAR) {
      const z = this.cursor - this.dist
      const gap = 16 + this.speed * 0.9
      this.spawnRow(z)
      const trail = shuffle(LANES)[0]
      this.line(trail, z + gap * 0.5 - 4, 5, 0.6)
      this.cursor += gap
    }

    this.collide()
    this.emitStats()
  }

  private line(lane: number, z: number, n: number, elev: number) {
    for (let i = 0; i < n; i++) this.coinList.push({ lane, z: z + i * 1.7, elev, taken: false })
  }

  private arc(lane: number, z: number) {
    for (const dz of [-2, 0, 2]) this.coinList.push({ lane, z: z + dz, elev: 1.9, taken: false })
  }

  private spawnRow(z: number) {
    const r = Math.random()
    const lanes = shuffle(LANES)
    if (r < 0.3) {
      const picks = lanes.slice(0, Math.random() < 0.5 ? 1 : 2)
      picks.forEach((lane) => this.obstacles.push({ kind: 'block', lane, z }))
      this.arc(picks[0], z)
      this.line(lanes[lanes.length - 1], z - 3.4, 5, 0.6)
    } else if (r < 0.55) {
      const picks = lanes.slice(0, Math.random() < 0.5 ? 1 : 2)
      picks.forEach((lane) => this.obstacles.push({ kind: 'pillar', lane, z }))
      this.line(lanes[lanes.length - 1], z - 3.4, 5, 0.6)
    } else if (r < 0.78) {
      this.obstacles.push({ kind: 'beam', lane: 0, z })
      this.line(lanes[0], z - 3.4, 5, 0.6)
    } else {
      LANES.forEach((lane) => this.obstacles.push({ kind: 'block', lane, z }))
      this.arc(0, z)
    }
  }

  private collide() {
    for (const o of this.obstacles) {
      if (Math.abs(o.z) > 0.6) continue
      const inLane = o.kind === 'beam' || Math.abs(o.lane - this.px) < 0.62
      if (!inLane) continue
      const hit =
        o.kind === 'block' ? this.py < 0.65 : o.kind === 'beam' ? this.slideT <= 0 : true
      if (hit) {
        this.phase = 'dead'
        this.deadT = 0
        this.shake = 0.45
        return
      }
    }
    for (const c of this.coinList) {
      if (c.taken || Math.abs(c.z) > 0.8 || Math.abs(c.lane - this.px) > 0.6) continue
      const ok = c.elev > 1.5 ? this.py > 0.6 : this.py < 1.1
      if (!ok) continue
      c.taken = true
      this.coins += 1
      this.pops.push({ lane: c.lane, elev: c.elev, age: 0 })
    }
  }

  private render() {
    const v = this.view
    const { ctx } = v
    ctx.save()
    if (this.shake > 0) ctx.translate((Math.random() - 0.5) * this.shake * 18, (Math.random() - 0.5) * this.shake * 18)
    drawBackdrop(v)
    drawRoad(v, this.dist)
    drawPillars(v, this.dist)

    const items: Array<{ z: number; draw: () => void }> = []
    for (const o of this.obstacles) items.push({ z: o.z, draw: () => drawObstacle(v, o) })
    for (const c of this.coinList) items.push({ z: c.z, draw: () => drawCoin(v, c, this.time) })
    items.push({
      z: 0,
      draw: () =>
        drawRunner(
          v,
          {
            x: this.px,
            y: this.py,
            sliding: this.slideT > 0,
            phase: this.runPhase,
            lean: (this.target - this.px) * 0.22,
            dead: this.phase === 'dead' ? Math.min(1, this.deadT * 3) : 0,
          },
          this.character,
        ),
    })
    items.sort((a, b) => b.z - a.z)
    items.forEach((it) => it.draw())

    drawFog(v)
    drawPops(v, this.pops)
    ctx.restore()
  }
}
