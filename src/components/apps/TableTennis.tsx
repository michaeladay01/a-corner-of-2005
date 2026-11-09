import { useCallback, useEffect, useRef, useState } from 'react'

/* Table tennis seen down the length of the table. The ball carries a depth as
   well as a position, and everything is projected towards a vanishing point,
   so it grows as it comes at you and shrinks as it goes away.

   First to eleven. All drawn here from scratch. */

const TABLE_LEN = 300      // far end to near end, in depth units
const HALF_W = 80          // half the table width
const NET_Z = TABLE_LEN / 2
const WIN = 11

type Ball = { x: number; y: number; z: number; vx: number; vy: number; vz: number }

export function TableTennis() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [you, setYou] = useState(0)
  const [them, setThem] = useState(0)
  const [running, setRunning] = useState(false)
  const [note, setNote] = useState('Move with the mouse or the arrows. First to 11.')

  const ball = useRef<Ball>({ x: 0, y: 30, z: NET_Z, vx: 0, vy: 0, vz: 0 })
  const myX = useRef(0)
  const theirX = useRef(0)
  const size = useRef({ w: 560, h: 360 })
  const keys = useRef<Record<string, boolean>>({})
  const runRef = useRef(running)
  const serveFor = useRef<'you' | 'them'>('you')
  useEffect(() => { runRef.current = running }, [running])

  const serve = useCallback((who: 'you' | 'them') => {
    serveFor.current = who
    ball.current = {
      x: 0,
      y: 40,
      z: who === 'you' ? TABLE_LEN - 40 : 40,
      vx: (Math.random() - 0.5) * 1.2,
      vy: 1.4,
      vz: who === 'you' ? -3.4 : 3.4,
    }
  }, [])

  const reset = useCallback(() => {
    setYou(0); setThem(0); setRunning(false)
    myX.current = 0; theirX.current = 0
    serve('you')
    setNote('Move with the mouse or the arrows. First to 11.')
  }, [serve])

  useEffect(() => { reset() }, [reset])

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); keys.current[e.key] = true }
    }
    const onUp = (e: KeyboardEvent) => { keys.current[e.key] = false }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')!

    const fit = () => {
      const b = wrap.getBoundingClientRect()
      size.current = { w: Math.max(340, Math.floor(b.width)), h: Math.max(260, Math.floor(b.height)) }
      canvas.width = size.current.w
      canvas.height = size.current.h
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(wrap)

    const step = () => {
      const { w, h } = size.current
      const b = ball.current

      /** Depth 0 is the far end, TABLE_LEN the near end. */
      const project = (x: number, y: number, z: number) => {
        const t = 1 - z / TABLE_LEN           // 0 near, 1 far
        const scale = 0.34 + 0.66 * (1 - t)   // things grow as they approach
        return {
          px: w / 2 + x * scale * 2.1,
          py: h * 0.30 + (h * 0.52) * (1 - t) - y * scale * 1.5,
          s: scale,
        }
      }

      if (runRef.current) {
        if (keys.current.ArrowLeft) myX.current -= 3.4
        if (keys.current.ArrowRight) myX.current += 3.4
        myX.current = Math.max(-HALF_W - 14, Math.min(HALF_W + 14, myX.current))

        // The far player drifts towards the ball, imperfectly.
        theirX.current += (b.x - theirX.current) * 0.055
        theirX.current = Math.max(-HALF_W - 10, Math.min(HALF_W + 10, theirX.current))

        b.vy -= 0.085
        b.x += b.vx
        b.y += b.vy
        b.z += b.vz

        // Bounce off the table top.
        if (b.y < 0 && b.z > 0 && b.z < TABLE_LEN) {
          b.y = 0
          b.vy = Math.abs(b.vy) * 0.78
        }

        // Off the side of the table.
        if (Math.abs(b.x) > HALF_W + 26) {
          const whoWon = b.vz < 0 ? 'them' : 'you'
          if (whoWon === 'you') { setYou((v) => v + 1); setNote('Out — your point.') }
          else { setThem((v) => v + 1); setNote('Out — their point.') }
          serve(whoWon === 'you' ? 'them' : 'you')
        }

        // Your end.
        if (b.z > TABLE_LEN - 12 && b.vz > 0) {
          if (Math.abs(b.x - myX.current) < 26 && b.y < 52) {
            b.vz = -Math.abs(b.vz) * 1.03
            b.vx += (b.x - myX.current) * 0.06
            b.vy = 1.5
            setNote('Good return.')
          } else if (b.z > TABLE_LEN + 20) {
            setThem((v) => v + 1)
            setNote('Missed it.')
            serve('them')
          }
        }

        // Their end.
        if (b.z < 12 && b.vz < 0) {
          if (Math.abs(b.x - theirX.current) < 28 && b.y < 52) {
            b.vz = Math.abs(b.vz) * 1.02
            b.vx += (b.x - theirX.current) * 0.05
            b.vy = 1.5
          } else if (b.z < -20) {
            setYou((v) => v + 1)
            setNote('Point to you.')
            serve('you')
          }
        }
      }

      /* ---- draw ---- */
      ctx.fillStyle = '#16212e'
      ctx.fillRect(0, 0, w, h)

      // Table top as a trapezium between the two ends.
      const fl = project(-HALF_W, 0, 0)
      const fr = project(HALF_W, 0, 0)
      const nl = project(-HALF_W, 0, TABLE_LEN)
      const nr = project(HALF_W, 0, TABLE_LEN)
      ctx.fillStyle = '#1d5fa8'
      ctx.beginPath()
      ctx.moveTo(fl.px, fl.py); ctx.lineTo(fr.px, fr.py)
      ctx.lineTo(nr.px, nr.py); ctx.lineTo(nl.px, nl.py)
      ctx.closePath(); ctx.fill()

      ctx.strokeStyle = '#eaf2fa'
      ctx.lineWidth = 2
      ctx.stroke()

      // Centre line down the table.
      const cf = project(0, 0, 0)
      const cn = project(0, 0, TABLE_LEN)
      ctx.beginPath(); ctx.moveTo(cf.px, cf.py); ctx.lineTo(cn.px, cn.py); ctx.stroke()

      // The net across the middle.
      const ml = project(-HALF_W - 6, 0, NET_Z)
      const mr = project(HALF_W + 6, 0, NET_Z)
      const mlt = project(-HALF_W - 6, 22, NET_Z)
      const mrt = project(HALF_W + 6, 22, NET_Z)
      ctx.fillStyle = 'rgba(235,242,250,0.55)'
      ctx.beginPath()
      ctx.moveTo(ml.px, ml.py); ctx.lineTo(mr.px, mr.py)
      ctx.lineTo(mrt.px, mrt.py); ctx.lineTo(mlt.px, mlt.py)
      ctx.closePath(); ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // The far bat, then the ball, then the near bat, so they overlap right.
      const bat = (x: number, z: number, colour: string) => {
        const p = project(x, 16, z)
        ctx.fillStyle = colour
        ctx.beginPath()
        ctx.ellipse(p.px, p.py, 26 * p.s, 30 * p.s, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = '#6a4a2a'
        ctx.fillRect(p.px - 4 * p.s, p.py + 26 * p.s, 8 * p.s, 20 * p.s)
      }

      bat(theirX.current, 4, '#c0392b')

      const shadow = project(b.x, 0, b.z)
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.beginPath()
      ctx.ellipse(shadow.px, shadow.py, 7 * shadow.s, 3 * shadow.s, 0, 0, Math.PI * 2)
      ctx.fill()

      const bp = project(b.x, b.y, b.z)
      ctx.fillStyle = '#fdfdf0'
      ctx.beginPath()
      ctx.arc(bp.px, bp.py, 7 * bp.s, 0, Math.PI * 2)
      ctx.fill()

      bat(myX.current, TABLE_LEN - 6, '#1f3f8f')
    }

    const timer = window.setInterval(step, 16)
    return () => { window.clearInterval(timer); ro.disconnect() }
  }, [serve])

  // A finished match stops the rally.
  useEffect(() => {
    if (you >= WIN || them >= WIN) {
      setRunning(false)
      setNote(you >= WIN ? 'You win the match.' : 'They take it.')
    }
  }, [you, them])

  const track = (e: React.MouseEvent) => {
    const r = canvasRef.current!.getBoundingClientRect()
    const t = (e.clientX - r.left) / r.width
    myX.current = (t - 0.5) * (HALF_W * 2.6)
  }

  const done = you >= WIN || them >= WIN

  return (
    <div className="tt">
      <div className="tt-bar">
        <span className="tt-title">Ping Pong 3D</span>
        <span>You <b>{you}</b></span>
        <span>Them <b>{them}</b></span>
        <button onClick={() => (done ? (reset(), setRunning(true)) : setRunning((v) => !v))}>
          {done ? 'New Match' : running ? 'Pause' : 'Play'}
        </button>
        <button onClick={reset}>Reset</button>
      </div>

      <div className="tt-stage" ref={wrapRef}>
        <canvas ref={canvasRef} className="tt-canvas" onMouseMove={track} />
        {!running ? (
          <div className="tt-overlay">
            <b>{done ? (you >= WIN ? 'You win' : 'They win') : 'Ping Pong 3D'}</b>
            <button onClick={() => { if (done) reset(); setRunning(true) }}>
              {done ? 'Play Again' : 'Start'}
            </button>
          </div>
        ) : null}
      </div>

      <p className="tt-note">{note}</p>
    </div>
  )
}
