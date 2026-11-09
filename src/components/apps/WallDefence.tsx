import { useCallback, useEffect, useRef, useState } from 'react'

/* A wall-defence shooter: waves of figures march in from the right, you click
   to fire, and between rounds you spend what you earned on repairs, ammo and
   better guns.

   The attackers are plain stick figures drawn here from scratch. */

type Foe = { x: number; y: number; hp: number; speed: number; worth: number; hit: number }
type Shot = { x: number; y: number; life: number }
/** A fleck of red thrown off when one of them is hit. */
type Fleck = { x: number; y: number; vx: number; vy: number; life: number; r: number }
/** Where it landed, so the ground keeps a record of the wave. */
type Stain = { x: number; y: number; r: number }

type Gun = { name: string; damage: number; clip: number; reload: number; cost: number }

const GUNS: Gun[] = [
  { name: 'Pistol', damage: 1, clip: 8, reload: 34, cost: 0 },
  { name: 'Rifle', damage: 2, clip: 14, reload: 26, cost: 120 },
  { name: 'Repeater', damage: 3, clip: 24, reload: 18, cost: 320 },
  { name: 'Cannon', damage: 6, clip: 30, reload: 12, cost: 700 },
]

const WALL_X = 110
const GROUND = 250

export function WallDefence() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [wave, setWave] = useState(1)
  const [wallHp, setWallHp] = useState(100)
  const [money, setMoney] = useState(0)
  const [gunIdx, setGunIdx] = useState(0)
  const [ammo, setAmmo] = useState(GUNS[0].clip)
  const [shopping, setShopping] = useState(true)
  const [over, setOver] = useState(false)
  const [note, setNote] = useState('Buy what you can, then start the wave.')

  const foes = useRef<Foe[]>([])
  const shots = useRef<Shot[]>([])
  const flecks = useRef<Fleck[]>([])
  const stains = useRef<Stain[]>([])
  const size = useRef({ w: 640, h: 330 })
  const cooldown = useRef(0)

  // Mirrors for the loop.
  const r = {
    wallHp: useRef(wallHp), ammo: useRef(ammo), gunIdx: useRef(gunIdx),
    shopping: useRef(shopping), over: useRef(over), wave: useRef(wave),
  }
  useEffect(() => { r.wallHp.current = wallHp }, [wallHp, r.wallHp])
  useEffect(() => { r.ammo.current = ammo }, [ammo, r.ammo])
  useEffect(() => { r.gunIdx.current = gunIdx }, [gunIdx, r.gunIdx])
  useEffect(() => { r.shopping.current = shopping }, [shopping, r.shopping])
  useEffect(() => { r.over.current = over }, [over, r.over])
  useEffect(() => { r.wave.current = wave }, [wave, r.wave])

  const spawnWave = useCallback((n: number) => {
    const count = 4 + n * 2
    const list: Foe[] = []
    for (let i = 0; i < count; i++) {
      const tough = n > 3 && i % 4 === 0
      list.push({
        x: 700 + i * (58 + ((i * 53) % 74)),
        y: GROUND,
        hp: tough ? 4 + Math.floor(n / 2) : 1 + Math.floor(n / 3),
        speed: (tough ? 0.5 : 0.85) + n * 0.07,
        worth: tough ? 28 : 12,
        hit: 0,
      })
    }
    foes.current = list
  }, [])

  const restart = useCallback(() => {
    setWave(1); setWallHp(100); setMoney(60); setGunIdx(0)
    setAmmo(GUNS[0].clip); setShopping(true); setOver(false)
    foes.current = []; shots.current = []
    flecks.current = []; stains.current = []
    setNote('Buy what you can, then start the wave.')
  }, [])

  useEffect(() => { restart() }, [restart])

  const startWave = () => {
    spawnWave(wave)
    setShopping(false)
    setNote(`Wave ${wave}. Click to fire.`)
  }

  /* The loop. An interval, so it keeps running where rAF is throttled. */
  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')!

    const fit = () => {
      const b = wrap.getBoundingClientRect()
      size.current = { w: Math.max(380, Math.floor(b.width)), h: Math.max(260, Math.floor(b.height)) }
      canvas.width = size.current.w
      canvas.height = size.current.h
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(wrap)

    const step = () => {
      const { w, h } = size.current
      const groundY = h - 70
      if (cooldown.current > 0) cooldown.current--

      if (!r.shopping.current && !r.over.current) {
        for (const f of foes.current) {
          if (f.hit > 0) f.hit--
          if (f.x > WALL_X + 26) f.x -= f.speed
          else {
            // Chewing through the wall.
            setWallHp((v) => {
              const next = Math.max(0, v - 0.08)
              if (next === 0 && v > 0) { setOver(true); setNote('The wall is down.') }
              return next
            })
          }
        }

        for (const s of shots.current) s.life--
        shots.current = shots.current.filter((s) => s.life > 0)

        for (const f of flecks.current) {
          f.vy += 0.42
          f.x += f.vx
          f.y += f.vy
          f.life--
          if (f.y >= groundY) {
            f.life = 0
            stains.current.push({ x: f.x, y: groundY + (Math.random() * 3 - 1), r: f.r + 0.6 })
          }
        }
        flecks.current = flecks.current.filter((f) => f.life > 0)
        if (stains.current.length > 320) stains.current.splice(0, stains.current.length - 320)

        if (foes.current.length === 0) {
          setShopping(true)
          setWave((n) => n + 1)
          setNote('Wave cleared. Spend up.')
        }
      }

      /* ---- draw ---- */
      const sky = ctx.createLinearGradient(0, 0, 0, h)
      sky.addColorStop(0, '#2b3a5c')
      sky.addColorStop(1, '#6a7ea4')
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, w, h)

      ctx.fillStyle = '#4a4034'
      ctx.fillRect(0, groundY, w, h - groundY)
      ctx.fillStyle = '#3a3228'
      ctx.fillRect(0, groundY, w, 4)

      // Stains left on the ground from earlier hits.
      ctx.fillStyle = '#7d1612'
      for (const st of stains.current) {
        ctx.beginPath()
        ctx.ellipse(st.x, st.y, st.r * 1.6, st.r * 0.55, 0, 0, Math.PI * 2)
        ctx.fill()
      }

      // The wall, shrinking as it takes damage.
      const hp = r.wallHp.current
      const wallH = 150 * (0.35 + 0.65 * (hp / 100))
      ctx.fillStyle = '#9a8f80'
      ctx.fillRect(40, groundY - wallH, 70, wallH)
      ctx.fillStyle = '#7d7366'
      for (let y = groundY - wallH; y < groundY; y += 14) {
        ctx.fillRect(40, y, 70, 2)
      }
      ctx.fillStyle = hp > 50 ? '#4aa84a' : hp > 20 ? '#e8c83a' : '#d8443a'
      ctx.fillRect(40, groundY - wallH - 9, 70 * (hp / 100), 5)

      // Figures: a head, a body and two legs.
      for (const f of foes.current) {
        ctx.strokeStyle = f.hit > 0 ? '#ff8a6a' : '#1a1a1a'
        ctx.lineWidth = 2.5
        ctx.beginPath()
        ctx.arc(f.x, groundY - 34, 5, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(f.x, groundY - 29)
        ctx.lineTo(f.x, groundY - 12)
        ctx.moveTo(f.x, groundY - 12)
        ctx.lineTo(f.x - 6, groundY)
        ctx.moveTo(f.x, groundY - 12)
        ctx.lineTo(f.x + 6, groundY)
        ctx.moveTo(f.x, groundY - 24)
        ctx.lineTo(f.x - 7, groundY - 18)
        ctx.moveTo(f.x, groundY - 24)
        ctx.lineTo(f.x + 7, groundY - 18)
        ctx.stroke()
      }

      ctx.fillStyle = '#c4201a'
      for (const f of flecks.current) {
        ctx.beginPath()
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.fillStyle = '#ffe08a'
      for (const s of shots.current) {
        ctx.beginPath()
        ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const timer = window.setInterval(step, 16)
    return () => { window.clearInterval(timer); ro.disconnect() }
  }, [r.over, r.shopping, r.wallHp])

  const shoot = (e: React.MouseEvent) => {
    if (shopping || over) return
    if (cooldown.current > 0) return
    if (ammo <= 0) { setNote('Out of ammo — buy more between waves.'); return }
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const gun = GUNS[gunIdx]
    cooldown.current = Math.max(4, Math.round(gun.reload / 3))
    setAmmo((a) => a - 1)
    shots.current.push({ x, y, life: 8 })

    // Anything close enough to the click takes a hit.
    const burst = (bx: number, by: number, n: number, force: number) => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2
        const sp = Math.random() * force + 1
        flecks.current.push({
          x: bx,
          y: by,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 1.6,
          life: 40 + Math.random() * 30,
          r: 1 + Math.random() * 2,
        })
      }
    }

    let earned = 0
    const groundY = size.current.h - 70
    foes.current = foes.current.filter((f) => {
      const d = Math.hypot(f.x - x, groundY - 24 - y)
      if (d < 26) {
        f.hp -= gun.damage
        f.hit = 6
        if (f.hp <= 0) {
          earned += f.worth
          burst(f.x, groundY - 24, 16, 4.5)
          return false
        }
        burst(f.x, groundY - 24, 5, 2.6)
      }
      return true
    })
    if (earned) setMoney((m) => m + earned)
  }

  const buy = (what: 'repair' | 'ammo' | number) => {
    if (what === 'repair') {
      if (money < 40) { setNote('Not enough for repairs.'); return }
      setMoney((m) => m - 40)
      setWallHp((v) => Math.min(100, v + 30))
      setNote('Wall patched up.')
    } else if (what === 'ammo') {
      if (money < 25) { setNote('Not enough for ammo.'); return }
      setMoney((m) => m - 25)
      setAmmo((a) => a + GUNS[gunIdx].clip)
      setNote('Reloaded.')
    } else {
      const g = GUNS[what]
      if (money < g.cost) { setNote(`The ${g.name} costs ${g.cost}.`); return }
      setMoney((m) => m - g.cost)
      setGunIdx(what)
      setAmmo(g.clip)
      setNote(`${g.name} in hand.`)
    }
  }

  return (
    <div className="wd">
      <div className="wd-bar">
        <span className="wd-title">Storm the House</span>
        <span>Wave <b>{wave}</b></span>
        <span>Wall <b>{Math.round(wallHp)}%</b></span>
        <span>Ammo <b>{ammo}</b></span>
        <span>Cash <b>{money}</b></span>
        <span className="wd-gun">{GUNS[gunIdx].name}</span>
      </div>

      <div className="wd-stage" ref={wrapRef}>
        <canvas ref={canvasRef} className="wd-canvas" onMouseDown={shoot} />

        {shopping && !over ? (
          <div className="wd-shop">
            <h3>Between Waves</h3>
            <div className="wd-buys">
              <button onClick={() => buy('repair')}>Repair wall +30 &mdash; 40</button>
              <button onClick={() => buy('ammo')}>Ammo +{GUNS[gunIdx].clip} &mdash; 25</button>
              {GUNS.map((g, i) =>
                i > gunIdx ? (
                  <button key={g.name} onClick={() => buy(i)}>
                    {g.name} &mdash; {g.cost}
                  </button>
                ) : null
              )}
            </div>
            <button className="wd-start" onClick={startWave}>
              Start Wave {wave}
            </button>
          </div>
        ) : null}

        {over ? (
          <div className="wd-shop">
            <h3>Overrun on wave {wave}</h3>
            <button className="wd-start" onClick={restart}>Try Again</button>
          </div>
        ) : null}
      </div>

      <p className="wd-note">{note}</p>
    </div>
  )
}
