import { useEffect, useRef, useState } from 'react'

/* A ragdoll physics sandbox: drag the figure around and watch it flop off the
   drifting spheres. Verlet integration — each point remembers where it was
   last frame, and the constraints are solved by relaxation.

   The figure is drawn here from scratch; it is a plain jointed shape, not a
   copy of anyone's artwork. */

type Point = {
  x: number
  y: number
  px: number
  py: number
  /** Drawn radius, also used when it hits a sphere or a wall. */
  r: number
  pinned?: boolean
}

type Stick = { a: number; b: number; len: number }

type Sphere = { x: number; y: number; r: number; vx: number; vy: number }

const GRAVITY = 0.42
const FRICTION = 0.993
const BOUNCE = 0.42
const RELAX = 7

/* head, neck, shoulders, elbows, hands, hips, knees, feet */
function makeDoll(cx: number, cy: number): { pts: Point[]; sticks: Stick[] } {
  const P = (x: number, y: number, r: number): Point => ({ x, y, px: x, py: y, r })
  const pts: Point[] = [
    P(cx, cy - 46, 13),       // 0 head
    P(cx, cy - 28, 5),        // 1 neck
    P(cx - 16, cy - 22, 5),   // 2 shoulder L
    P(cx + 16, cy - 22, 5),   // 3 shoulder R
    P(cx - 30, cy - 4, 4.5),  // 4 elbow L
    P(cx + 30, cy - 4, 4.5),  // 5 elbow R
    P(cx - 42, cy + 14, 5),   // 6 hand L
    P(cx + 42, cy + 14, 5),   // 7 hand R
    P(cx - 10, cy + 14, 6),   // 8 hip L
    P(cx + 10, cy + 14, 6),   // 9 hip R
    P(cx - 14, cy + 44, 5),   // 10 knee L
    P(cx + 14, cy + 44, 5),   // 11 knee R
    P(cx - 16, cy + 72, 5.5), // 12 foot L
    P(cx + 16, cy + 72, 5.5), // 13 foot R
  ]

  const link = (a: number, b: number): Stick => ({
    a,
    b,
    len: Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y),
  })

  const sticks = [
    link(0, 1), link(1, 2), link(1, 3), link(2, 3),
    link(2, 4), link(4, 6), link(3, 5), link(5, 7),
    link(2, 8), link(3, 9), link(8, 9),
    link(8, 10), link(10, 12), link(9, 11), link(11, 13),
    // a few cross-braces so the torso keeps its shape
    link(2, 9), link(3, 8), link(1, 8), link(1, 9),
  ]
  return { pts, sticks }
}

function makeSpheres(w: number, h: number): Sphere[] {
  const out: Sphere[] = []
  const sizes = [74, 58, 46, 38, 66, 30, 52, 42]
  for (let i = 0; i < sizes.length; i++) {
    out.push({
      x: 70 + ((i * 137) % Math.max(1, w - 140)),
      y: 60 + ((i * 193) % Math.max(1, h - 120)),
      r: sizes[i],
      vx: (i % 2 ? 0.22 : -0.18) * (1 + (i % 3) * 0.3),
      vy: (i % 3 ? -0.14 : 0.2) * (1 + (i % 2) * 0.4),
    })
  }
  return out
}

export function BonelessGirl() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const [status, setStatus] = useState('Drag her around.')

  // Everything the loop mutates lives in refs so it never re-renders.
  const doll = useRef(makeDoll(260, 150))
  const spheres = useRef<Sphere[]>([])
  const held = useRef<number | null>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const size = useRef({ w: 520, h: 380 })
  const pausedRef = useRef(paused)

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  const reset = () => {
    const { w, h } = size.current
    doll.current = makeDoll(w / 2, h / 3)
    spheres.current = makeSpheres(w, h)
    setStatus('Drag her around.')
  }

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')!

    const fit = () => {
      const r = wrap.getBoundingClientRect()
      const w = Math.max(240, Math.floor(r.width))
      const h = Math.max(200, Math.floor(r.height))
      size.current = { w, h }
      canvas.width = w
      canvas.height = h
      if (!spheres.current.length) {
        spheres.current = makeSpheres(w, h)
        doll.current = makeDoll(w / 2, h / 3)
      }
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(wrap)

    const step = () => {
      const { w, h } = size.current
      const { pts, sticks } = doll.current

      if (!pausedRef.current) {
        // Spheres drift and bounce off the edges.
        for (const s of spheres.current) {
          s.x += s.vx
          s.y += s.vy
          if (s.x - s.r < 0 || s.x + s.r > w) s.vx *= -1
          if (s.y - s.r < 0 || s.y + s.r > h) s.vy *= -1
          s.x = Math.max(s.r, Math.min(w - s.r, s.x))
          s.y = Math.max(s.r, Math.min(h - s.r, s.y))
        }

        // Verlet: carry the last frame's motion forward, then add gravity.
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i]
          if (held.current === i) {
            p.px = p.x
            p.py = p.y
            p.x = pointer.current.x
            p.y = pointer.current.y
            continue
          }
          const vx = (p.x - p.px) * FRICTION
          const vy = (p.y - p.py) * FRICTION
          p.px = p.x
          p.py = p.y
          p.x += vx
          p.y += vy + GRAVITY
        }

        // Solve the limb lengths and the collisions, a few times over.
        for (let k = 0; k < RELAX; k++) {
          for (const st of sticks) {
            const a = pts[st.a]
            const b = pts[st.b]
            const dx = b.x - a.x
            const dy = b.y - a.y
            const d = Math.hypot(dx, dy) || 0.0001
            const diff = (st.len - d) / d / 2
            const ox = dx * diff
            const oy = dy * diff
            if (held.current !== st.a) { a.x -= ox; a.y -= oy }
            if (held.current !== st.b) { b.x += ox; b.y += oy }
          }

          for (const p of pts) {
            // Push out of any sphere she has sunk into.
            for (const s of spheres.current) {
              const dx = p.x - s.x
              const dy = p.y - s.y
              const d = Math.hypot(dx, dy) || 0.0001
              const min = s.r + p.r
              if (d < min) {
                const push = (min - d) / d
                p.x += dx * push
                p.y += dy * push
              }
            }
            // And keep her inside the window.
            if (p.x < p.r) { p.x = p.r; p.px = p.x + (p.px - p.x) * BOUNCE }
            if (p.x > w - p.r) { p.x = w - p.r; p.px = p.x + (p.px - p.x) * BOUNCE }
            if (p.y < p.r) { p.y = p.r; p.py = p.y + (p.py - p.y) * BOUNCE }
            if (p.y > h - p.r) { p.y = h - p.r; p.py = p.y + (p.py - p.y) * BOUNCE }
          }
        }
      }

      /* ---- draw ---- */
      const sky = ctx.createLinearGradient(0, 0, 0, h)
      sky.addColorStop(0, '#dde8ef')
      sky.addColorStop(1, '#cfdde6')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, w, h)

      for (const s of spheres.current) {
        const g = ctx.createRadialGradient(
          s.x - s.r * 0.35, s.y - s.r * 0.4, s.r * 0.1,
          s.x, s.y, s.r
        )
        g.addColorStop(0, '#ffffff')
        g.addColorStop(0.55, '#e8f1f4')
        g.addColorStop(1, '#c3d6dc')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()
      }

      // Limbs as tapered strokes, then the head on top.
      const limb = (a: number, b: number, width: number) => {
        ctx.lineWidth = width
        ctx.lineCap = 'round'
        ctx.strokeStyle = '#e0b48a'
        ctx.beginPath()
        ctx.moveTo(pts[a].x, pts[a].y)
        ctx.lineTo(pts[b].x, pts[b].y)
        ctx.stroke()
      }

      ctx.save()
      limb(2, 4, 9); limb(4, 6, 7)
      limb(3, 5, 9); limb(5, 7, 7)
      limb(8, 10, 11); limb(10, 12, 9)
      limb(9, 11, 11); limb(11, 13, 9)

      // Torso as a filled quad from shoulders to hips.
      ctx.fillStyle = '#2f3338'
      ctx.beginPath()
      ctx.moveTo(pts[2].x, pts[2].y)
      ctx.lineTo(pts[3].x, pts[3].y)
      ctx.lineTo(pts[9].x, pts[9].y)
      ctx.lineTo(pts[8].x, pts[8].y)
      ctx.closePath()
      ctx.fill()

      const head = pts[0]
      ctx.fillStyle = '#e0b48a'
      ctx.beginPath()
      ctx.arc(head.x, head.y, head.r, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#c99a63'
      ctx.beginPath()
      ctx.arc(head.x, head.y - 3, head.r * 0.92, Math.PI, Math.PI * 2)
      ctx.fill()
      ctx.restore()

    }

    /* A plain interval rather than animation frames, so the sandbox keeps
       running in contexts where rAF is throttled. */
    const timer = window.setInterval(step, 16)
    return () => {
      window.clearInterval(timer)
      ro.disconnect()
    }
  }, [])

  const at = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  const down = (e: React.PointerEvent) => {
    const p = at(e)
    pointer.current = p
    let best = -1
    let bestD = 36
    doll.current.pts.forEach((pt, i) => {
      const d = Math.hypot(pt.x - p.x, pt.y - p.y)
      if (d < bestD) { bestD = d; best = i }
    })
    if (best >= 0) {
      held.current = best
      setStatus('Let go and watch her fall.')
      e.currentTarget.setPointerCapture(e.pointerId)
    }
  }

  const move = (e: React.PointerEvent) => {
    if (held.current === null) return
    pointer.current = at(e)
  }

  const up = () => {
    held.current = null
    setStatus('Drag her around.')
  }

  return (
    <div className="bg-game">
      <div className="bg-bar">
        <span className="bg-title">Boneless Girl</span>
        <button onClick={() => setPaused((p) => !p)}>{paused ? 'Resume' : 'Pause'}</button>
        <button onClick={reset}>Reset</button>
        <span className="bg-status">{status}</span>
      </div>

      <div className="bg-stage" ref={wrapRef}>
        <canvas
          ref={canvasRef}
          className="bg-canvas"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        />
      </div>
    </div>
  )
}
