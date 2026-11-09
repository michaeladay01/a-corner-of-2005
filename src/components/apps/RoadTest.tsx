import { useCallback, useEffect, useRef, useState } from 'react'

/* A top-down driving test: stay on the road, keep off the oncoming traffic
   and the cones, and see how far you get before you prang it.

   Everything is drawn here from scratch. */

type Car = { x: number; y: number; speed: number; colour: string }
type Cone = { x: number; y: number }

const COLOURS = ['#d8443a', '#e8c83a', '#3a8fd4', '#5aa84a', '#c86ab0', '#e8903a']

export function RoadTest() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [running, setRunning] = useState(false)
  const [over, setOver] = useState(false)
  const [distance, setDistance] = useState(0)
  const [best, setBest] = useState(0)
  const [fouls, setFouls] = useState(0)
  const [note, setNote] = useState('Arrow keys or the buttons. Mind the cones.')

  const me = useRef({ x: 0.5, lane: 0 })   // x is 0..1 across the road
  const traffic = useRef<Car[]>([])
  const cones = useRef<Cone[]>([])
  const scroll = useRef(0)
  const speed = useRef(3.4)
  const size = useRef({ w: 520, h: 360 })
  const keys = useRef<Record<string, boolean>>({})
  const runRef = useRef(running)
  const overRef = useRef(over)
  useEffect(() => { runRef.current = running }, [running])
  useEffect(() => { overRef.current = over }, [over])

  const reset = useCallback(() => {
    me.current = { x: 0.5, lane: 0 }
    traffic.current = []
    cones.current = []
    scroll.current = 0
    speed.current = 3.4
    setDistance(0)
    setFouls(0)
    setOver(false)
    setRunning(false)
    setNote('Arrow keys or the buttons. Mind the cones.')
  }, [])

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault()
        keys.current[e.key] = true
      }
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
      size.current = { w: Math.max(320, Math.floor(b.width)), h: Math.max(260, Math.floor(b.height)) }
      canvas.width = size.current.w
      canvas.height = size.current.h
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(wrap)

    const step = () => {
      const { w, h } = size.current
      const roadL = w * 0.18
      const roadR = w * 0.82
      const roadW = roadR - roadL
      const myY = h - 70

      if (runRef.current && !overRef.current) {
        scroll.current += speed.current
        speed.current = Math.min(8.5, speed.current + 0.0016)

        if (keys.current.ArrowLeft) me.current.x -= 0.014
        if (keys.current.ArrowRight) me.current.x += 0.014
        me.current.x = Math.max(-0.08, Math.min(1.08, me.current.x))

        // Oncoming cars and cones arrive from the top.
        if (Math.random() < 0.021) {
          traffic.current.push({
            x: 0.12 + Math.random() * 0.76,
            y: -60,
            speed: 1.4 + Math.random() * 2.2,
            colour: COLOURS[Math.floor(Math.random() * COLOURS.length)],
          })
        }
        if (Math.random() < 0.016) {
          cones.current.push({ x: 0.08 + Math.random() * 0.84, y: -40 })
        }

        for (const c of traffic.current) c.y += speed.current + c.speed
        for (const c of cones.current) c.y += speed.current
        traffic.current = traffic.current.filter((c) => c.y < h + 80)
        cones.current = cones.current.filter((c) => c.y < h + 60)

        const myPx = roadL + me.current.x * roadW

        // Off the tarmac is a fault, not a crash.
        if (me.current.x < 0.02 || me.current.x > 0.98) {
          setFouls((f) => {
            const n = f + 1
            if (n >= 3) { setOver(true); setNote('Test failed.') }
            return n
          })
          me.current.x = Math.max(0.05, Math.min(0.95, me.current.x))
          setNote('Keep it on the road.')
        }

        for (const c of traffic.current) {
          const cx = roadL + c.x * roadW
          if (Math.abs(cx - myPx) < 26 && Math.abs(c.y - myY) < 38) {
            setOver(true)
            setNote('Crashed.')
          }
        }
        for (const c of cones.current) {
          const cx = roadL + c.x * roadW
          if (Math.abs(cx - myPx) < 18 && Math.abs(c.y - myY) < 24) {
            c.y = h + 100
            setFouls((f) => {
              const n = f + 1
              if (n >= 3) { setOver(true); setNote('Test failed.') }
              return n
            })
            setNote('That was a cone.')
          }
        }

        const d = Math.round(scroll.current / 14)
        setDistance(d)
        setBest((b) => (d > b ? d : b))
      }

      /* ---- draw ---- */
      ctx.fillStyle = '#5a8a4a'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#4a4a4e'
      ctx.fillRect(roadL, 0, roadW, h)
      ctx.fillStyle = '#d8d8d0'
      ctx.fillRect(roadL - 4, 0, 4, h)
      ctx.fillRect(roadR, 0, 4, h)

      // Centre dashes, moving with the road.
      ctx.fillStyle = '#e8e4c8'
      const dash = 34
      for (let y = -dash + (scroll.current % (dash * 2)); y < h; y += dash * 2) {
        ctx.fillRect(roadL + roadW / 2 - 2, y, 4, dash)
      }

      const car = (px: number, py: number, colour: string, flip: boolean) => {
        ctx.fillStyle = colour
        ctx.fillRect(px - 11, py - 19, 22, 38)
        ctx.fillStyle = 'rgba(255,255,255,0.75)'
        ctx.fillRect(px - 8, py - (flip ? 13 : 2), 16, 11)
        ctx.fillStyle = '#2a2a2e'
        ctx.fillRect(px - 13, py - 14, 4, 9)
        ctx.fillRect(px + 9, py - 14, 4, 9)
        ctx.fillRect(px - 13, py + 5, 4, 9)
        ctx.fillRect(px + 9, py + 5, 4, 9)
      }

      for (const c of traffic.current) car(roadL + c.x * roadW, c.y, c.colour, true)

      ctx.fillStyle = '#e8702a'
      for (const c of cones.current) {
        const cx = roadL + c.x * roadW
        ctx.beginPath()
        ctx.moveTo(cx - 7, c.y + 9)
        ctx.lineTo(cx, c.y - 9)
        ctx.lineTo(cx + 7, c.y + 9)
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = '#fdfdfd'
        ctx.fillRect(cx - 5, c.y, 10, 3)
        ctx.fillStyle = '#e8702a'
      }

      car(roadL + me.current.x * roadW, myY, '#2a6ad8', false)
    }

    const timer = window.setInterval(step, 16)
    return () => { window.clearInterval(timer); ro.disconnect() }
  }, [])

  const nudge = (dx: number) => { me.current.x += dx }

  return (
    <div className="rt">
      <div className="rt-bar">
        <span className="rt-title">Drivers Ed</span>
        <span>Distance <b>{distance} m</b></span>
        <span>Best <b>{best} m</b></span>
        <span>Faults <b>{fouls}/3</b></span>
        <button onClick={() => { if (over) reset(); setRunning((v) => (over ? true : !v)) }}>
          {over ? 'Try Again' : running ? 'Pause' : 'Drive'}
        </button>
        <button onClick={reset}>Reset</button>
      </div>

      <div className="rt-stage" ref={wrapRef}>
        <canvas ref={canvasRef} className="rt-canvas" />
        {!running && !over ? (
          <div className="rt-overlay">
            <b>Ready?</b>
            <button onClick={() => setRunning(true)}>Start Driving</button>
          </div>
        ) : null}
        {over ? (
          <div className="rt-overlay">
            <b>{distance} m</b>
            <button onClick={() => { reset(); setRunning(true) }}>Drive Again</button>
          </div>
        ) : null}
      </div>

      <div className="rt-pad">
        <button onMouseDown={() => nudge(-0.07)}>&#9664; Left</button>
        <span className="rt-note">{note}</span>
        <button onMouseDown={() => nudge(0.07)}>Right &#9654;</button>
      </div>
    </div>
  )
}
