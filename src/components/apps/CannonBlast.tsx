import { useCallback, useEffect, useRef, useState } from 'react'

/* A launch-and-bounce distance game: pick an angle, charge the cannon, and
   see how far the little creature travels. Obstacles along the way either
   fling it onward or bring it down.

   The creature is drawn here from scratch — a round original critter, not a
   copy of anyone's artwork. */

const GRAVITY = 0.28
const AIR = 0.9982
const GROUND_BOUNCE = 0.5
const GROUND_DRAG = 0.87
const STOP_SPEED = 0.9

type Phase = 'aiming' | 'charging' | 'flying' | 'done'

type Prop = {
  x: number
  kind: 'spring' | 'blast' | 'spike' | 'fan'
  used?: boolean
}

/* The landscape runs far to the right; the view scrolls to follow. */
const GROUND_Y = 250

function buildProps(): Prop[] {
  const out: Prop[] = []
  const kinds: Prop['kind'][] = ['spring', 'blast', 'fan', 'spike']
  let x = 420
  let i = 0
  while (x < 22000) {
    out.push({ x, kind: kinds[i % kinds.length] })
    x += 320 + ((i * 97) % 420)
    i++
  }
  return out
}

export function CannonBlast() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [phase, setPhase] = useState<Phase>('aiming')
  const [angle, setAngle] = useState(42)
  const [power, setPower] = useState(0)
  const [distance, setDistance] = useState(0)
  const [best, setBest] = useState(0)
  const [note, setNote] = useState('Set the angle, then hold to charge.')

  // Mutable game state the loop owns.
  const critter = useRef({ x: 60, y: GROUND_Y - 20, vx: 0, vy: 0, spin: 0 })
  const props = useRef<Prop[]>(buildProps())
  const camera = useRef(0)
  const size = useRef({ w: 600, h: 320 })
  const phaseRef = useRef(phase)
  const angleRef = useRef(angle)
  const powerRef = useRef(power)
  const chargingUp = useRef(true)

  useEffect(() => { phaseRef.current = phase }, [phase])
  useEffect(() => { angleRef.current = angle }, [angle])
  useEffect(() => { powerRef.current = power }, [power])

  const reset = useCallback(() => {
    critter.current = { x: 60, y: GROUND_Y - 20, vx: 0, vy: 0, spin: 0 }
    props.current = buildProps()
    camera.current = 0
    setPower(0)
    setDistance(0)
    setPhase('aiming')
    setNote('Set the angle, then hold to charge.')
  }, [])

  const fire = useCallback(() => {
    const a = (angleRef.current * Math.PI) / 180
    const p = 8 + (powerRef.current / 100) * 24
    critter.current.vx = Math.cos(a) * p
    critter.current.vy = -Math.sin(a) * p
    setPhase('flying')
    setNote('Away she goes.')
  }, [])

  /* Charging ramps up and down while the button is held. */
  useEffect(() => {
    if (phase !== 'charging') return
    const t = window.setInterval(() => {
      setPower((v) => {
        if (chargingUp.current) {
          if (v >= 100) { chargingUp.current = false; return 100 }
          return v + 3
        }
        if (v <= 0) { chargingUp.current = true; return 0 }
        return v - 3
      })
    }, 16)
    return () => window.clearInterval(t)
  }, [phase])

  /* The main loop. An interval rather than animation frames, so it keeps
     running in contexts where rAF is throttled. */
  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')!

    const fit = () => {
      const r = wrap.getBoundingClientRect()
      const w = Math.max(320, Math.floor(r.width))
      const h = Math.max(260, Math.floor(r.height))
      size.current = { w, h }
      canvas.width = w
      canvas.height = h
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(wrap)

    const step = () => {
      const { w, h } = size.current
      const c = critter.current
      const groundY = h - 70

      if (phaseRef.current === 'flying') {
        c.vy += GRAVITY
        c.vx *= AIR
        c.vy *= AIR
        c.x += c.vx
        c.y += c.vy
        c.spin += c.vx * 0.04

        // Props act when she passes over them near the ground.
        for (const p of props.current) {
          if (p.used) continue
          if (Math.abs(c.x - p.x) < 26 && c.y > groundY - 48) {
            p.used = true
            if (p.kind === 'spring') { c.vy = -Math.abs(c.vy) * 0.6 - 9; setNote('Boing!') }
            if (p.kind === 'blast') { c.vy = -13; c.vx += 5; setNote('Boom!') }
            if (p.kind === 'fan') { c.vx += 4.5; c.vy -= 2; setNote('Caught the updraught.') }
            if (p.kind === 'spike') { c.vx *= 0.25; c.vy = Math.abs(c.vy) * 0.2; setNote('Ouch.') }
          }
        }

        if (c.y > groundY) {
          c.y = groundY
          c.vy = -c.vy * GROUND_BOUNCE
          c.vx *= GROUND_DRAG
          if (Math.abs(c.vy) < STOP_SPEED && Math.abs(c.vx) < STOP_SPEED) {
            c.vx = 0
            c.vy = 0
            setPhase('done')
            setNote('Have another go.')
          }
        }

        const d = Math.max(0, Math.round((c.x - 60) / 6))
        setDistance(d)
        setBest((b) => (d > b ? d : b))
        camera.current = Math.max(0, c.x - w * 0.35)
      }

      /* ---- draw ---- */
      const sky = ctx.createLinearGradient(0, 0, 0, h)
      sky.addColorStop(0, '#9ed2f0')
      sky.addColorStop(1, '#dff0fb')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, w, h)

      const cam = camera.current

      // Hills drifting past at half speed, for a sense of travel.
      ctx.fillStyle = '#b8dfae'
      for (let i = -1; i < 12; i++) {
        const hx = i * 300 - (cam * 0.5) % 300
        ctx.beginPath()
        ctx.ellipse(hx, groundY + 10, 190, 70, 0, Math.PI, 0)
        ctx.fill()
      }

      ctx.fillStyle = '#6fbf5a'
      ctx.fillRect(0, groundY, w, h - groundY)
      ctx.fillStyle = '#58a844'
      ctx.fillRect(0, groundY, w, 5)

      // Distance posts every 100 units.
      ctx.fillStyle = '#4a7a3a'
      ctx.font = '11px Verdana, sans-serif'
      for (let m = 0; m < 5000; m += 200) {
        const px = 60 + m * 6 - cam
        if (px < -40 || px > w + 40) continue
        ctx.fillRect(px, groundY - 16, 2, 16)
        ctx.fillText(`${m}`, px + 4, groundY - 6)
      }

      for (const p of props.current) {
        const px = p.x - cam
        if (px < -60 || px > w + 60) continue
        if (p.kind === 'spring') {
          ctx.fillStyle = p.used ? '#9aa6b0' : '#d84a6a'
          ctx.fillRect(px - 16, groundY - 10, 32, 10)
          ctx.fillStyle = p.used ? '#7c8792' : '#a8314c'
          ctx.fillRect(px - 16, groundY - 4, 32, 4)
        } else if (p.kind === 'blast') {
          ctx.fillStyle = p.used ? '#9aa6b0' : '#3a3a3a'
          ctx.beginPath()
          ctx.arc(px, groundY - 12, 12, 0, Math.PI * 2)
          ctx.fill()
          if (!p.used) {
            ctx.strokeStyle = '#e8a02a'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(px + 6, groundY - 22)
            ctx.lineTo(px + 12, groundY - 30)
            ctx.stroke()
          }
        } else if (p.kind === 'fan') {
          ctx.fillStyle = p.used ? '#9aa6b0' : '#3a8fd4'
          ctx.fillRect(px - 12, groundY - 26, 24, 26)
          ctx.fillStyle = '#dff0fb'
          ctx.beginPath()
          ctx.arc(px, groundY - 13, 8, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillStyle = p.used ? '#9aa6b0' : '#8a8f98'
          for (let i = -1; i <= 1; i++) {
            ctx.beginPath()
            ctx.moveTo(px + i * 11 - 5, groundY)
            ctx.lineTo(px + i * 11, groundY - 18)
            ctx.lineTo(px + i * 11 + 5, groundY)
            ctx.closePath()
            ctx.fill()
          }
        }
      }

      // The cannon.
      const cx = 60 - cam
      if (cx > -80) {
        ctx.save()
        ctx.translate(cx, groundY - 14)
        ctx.fillStyle = '#5a4a3a'
        ctx.fillRect(-16, 0, 32, 14)
        ctx.rotate((-angleRef.current * Math.PI) / 180)
        ctx.fillStyle = '#3a3f48'
        ctx.fillRect(0, -9, 42, 18)
        ctx.fillStyle = '#2a2f36'
        ctx.fillRect(36, -10, 7, 20)
        ctx.restore()
      }

      /* She sits inside the barrel until launched, so nothing shows until
         the cannon fires. */
      const airborne = phaseRef.current === 'flying' || phaseRef.current === 'done'
      const ax = c.x - cam
      const ay = c.y
      if (airborne) {
      ctx.save()
      ctx.translate(ax, ay)
      ctx.rotate(c.spin)
      ctx.fillStyle = '#c4762c'
      ctx.beginPath()
      ctx.ellipse(0, 0, 13, 11, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(-9, -8); ctx.lineTo(-4, -17); ctx.lineTo(0, -8)
      ctx.closePath(); ctx.fill()
      ctx.beginPath()
      ctx.moveTo(3, -8); ctx.lineTo(7, -17); ctx.lineTo(11, -8)
      ctx.closePath(); ctx.fill()
      ctx.strokeStyle = '#c4762c'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(-12, 3)
      ctx.quadraticCurveTo(-22, 2, -19, -6)
      ctx.stroke()
      ctx.fillStyle = '#2a2018'
      ctx.beginPath(); ctx.arc(-4, -2, 1.8, 0, Math.PI * 2); ctx.fill()
      ctx.beginPath(); ctx.arc(5, -2, 1.8, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = '#e8a0a0'
      ctx.beginPath(); ctx.arc(1, 2, 1.6, 0, Math.PI * 2); ctx.fill()
      ctx.restore()
      }

      // The aiming guide, while she is still in the barrel.
      if (phaseRef.current === 'aiming' || phaseRef.current === 'charging') {
        const a = (angleRef.current * Math.PI) / 180
        const p = 8 + (powerRef.current / 100) * 24
        ctx.fillStyle = 'rgba(40,60,80,0.4)'
        let gx = 60 - cam
        let gy = groundY - 20
        let gvx = Math.cos(a) * p
        let gvy = -Math.sin(a) * p
        for (let i = 0; i < 44; i++) {
          gvy += GRAVITY
          gx += gvx
          gy += gvy
          if (gy > groundY) break
          if (i % 3 === 0) {
            ctx.beginPath()
            ctx.arc(gx, gy, 2, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }
    }

    const timer = window.setInterval(step, 16)
    return () => {
      window.clearInterval(timer)
      ro.disconnect()
    }
  }, [])

  const startCharge = () => {
    if (phase !== 'aiming') return
    chargingUp.current = true
    setPower(0)
    setPhase('charging')
    setNote('Let go to fire.')
  }

  const release = () => {
    if (phase !== 'charging') return
    fire()
  }

  return (
    <div className="cb">
      <div className="cb-bar">
        <span className="cb-title">Kitten Cannon</span>
        <label>
          Angle
          <input
            type="range"
            min={5}
            max={85}
            value={angle}
            disabled={phase === 'flying'}
            onChange={(e) => setAngle(Number(e.target.value))}
          />
          <b>{angle}&deg;</b>
        </label>
        <button
          onMouseDown={startCharge}
          onMouseUp={release}
          onMouseLeave={release}
          disabled={phase === 'flying'}
        >
          {phase === 'charging' ? 'Release!' : 'Hold to Fire'}
        </button>
        <button onClick={reset}>Reset</button>
      </div>

      <div className="cb-meter">
        <span style={{ width: `${power}%` }} />
      </div>

      <div className="cb-stage" ref={wrapRef}>
        <canvas ref={canvasRef} className="cb-canvas" />
        <div className="cb-score">
          <span>
            Distance: <b>{distance} ft</b>
          </span>
          <span>
            Best: <b>{best} ft</b>
          </span>
        </div>
        {phase === 'done' ? (
          <div className="cb-done">
            <b>{distance} ft</b>
            <button onClick={reset}>Fire Again</button>
          </div>
        ) : null}
      </div>

      <p className="cb-note">{note}</p>
    </div>
  )
}
