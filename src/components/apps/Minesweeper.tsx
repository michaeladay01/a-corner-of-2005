import { useEffect, useMemo, useRef, useState } from 'react'
import { play } from '../../lib/sounds'

type Level = { name: string; w: number; h: number; mines: number }

const LEVELS: Record<string, Level> = {
  beginner: { name: 'Beginner', w: 9, h: 9, mines: 10 },
  intermediate: { name: 'Intermediate', w: 16, h: 16, mines: 40 },
  expert: { name: 'Expert', w: 30, h: 16, mines: 99 },
}

type Cell = { mine: boolean; near: number; revealed: boolean; flagged: boolean; boom?: boolean }

/** The classic number colours, straight off the original board. */
const NUMBER_COLOUR = [
  '',
  '#0000ff',
  '#008000',
  '#ff0000',
  '#000080',
  '#800000',
  '#008080',
  '#000000',
  '#808080',
]

function neighbours(i: number, w: number, h: number): number[] {
  const x = i % w
  const y = Math.floor(i / w)
  const out: number[] = []
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
      out.push(ny * w + nx)
    }
  }
  return out
}

function build(level: Level): Cell[] {
  const total = level.w * level.h
  const cells: Cell[] = Array.from({ length: total }, () => ({
    mine: false,
    near: 0,
    revealed: false,
    flagged: false,
  }))
  let placed = 0
  while (placed < level.mines) {
    const i = Math.floor(Math.random() * total)
    if (cells[i].mine) continue
    cells[i].mine = true
    placed += 1
  }
  for (let i = 0; i < total; i++) {
    cells[i].near = neighbours(i, level.w, level.h).filter((n) => cells[n].mine).length
  }
  return cells
}

/** Seven-segment LED digits, as on the mine and timer counters. */
const SEGMENTS: Record<string, number[]> = {
  //      a  b  c  d  e  f  g
  '0': [1, 1, 1, 1, 1, 1, 0],
  '1': [0, 1, 1, 0, 0, 0, 0],
  '2': [1, 1, 0, 1, 1, 0, 1],
  '3': [1, 1, 1, 1, 0, 0, 1],
  '4': [0, 1, 1, 0, 0, 1, 1],
  '5': [1, 0, 1, 1, 0, 1, 1],
  '6': [1, 0, 1, 1, 1, 1, 1],
  '7': [1, 1, 1, 0, 0, 0, 0],
  '8': [1, 1, 1, 1, 1, 1, 1],
  '9': [1, 1, 1, 1, 0, 1, 1],
  '-': [0, 0, 0, 0, 0, 0, 1],
}

function Digit({ char }: { char: string }) {
  const on = SEGMENTS[char] ?? SEGMENTS['0']
  const lit = '#ff0000'
  const dim = '#3b0000'
  const c = (i: number) => (on[i] ? lit : dim)
  return (
    <svg className="ms-digit" viewBox="0 0 13 23" xmlns="http://www.w3.org/2000/svg">
      <rect width="13" height="23" fill="#000" />
      <polygon points="3,2 10,2 8.6,3.6 4.4,3.6" fill={c(0)} />
      <polygon points="10.6,2.6 10.6,10.4 9.2,9.2 9.2,4.2" fill={c(1)} />
      <polygon points="10.6,12.6 10.6,20.4 9.2,18.8 9.2,13.8" fill={c(2)} />
      <polygon points="3,21 10,21 8.6,19.4 4.4,19.4" fill={c(3)} />
      <polygon points="2.4,12.6 2.4,20.4 3.8,18.8 3.8,13.8" fill={c(4)} />
      <polygon points="2.4,2.6 2.4,10.4 3.8,9.2 3.8,4.2" fill={c(5)} />
      <polygon points="3.2,11.5 4.4,10.4 8.6,10.4 9.8,11.5 8.6,12.6 4.4,12.6" fill={c(6)} />
    </svg>
  )
}

function Counter({ value }: { value: number }) {
  const clamped = Math.max(-99, Math.min(999, value))
  const text =
    clamped < 0
      ? '-' + Math.abs(clamped).toString().padStart(2, '0')
      : clamped.toString().padStart(3, '0')
  return (
    <span className="ms-counter">
      {text.split('').map((ch, i) => (
        <Digit key={i} char={ch} />
      ))}
    </span>
  )
}

/** The mine: a shaded sphere with blunt spikes. Black on the board. */
function Mine({ size = 13, colour = '#000' }: { size?: number; colour?: string }) {
  const spikes = [0, 45, 90, 135, 180, 225, 270, 315]
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <g stroke={colour} strokeWidth="3.4" strokeLinecap="round">
        {spikes.map((a) => {
          const r = (a * Math.PI) / 180
          return (
            <line
              key={a}
              x1={16 + Math.cos(r) * 7}
              y1={16 + Math.sin(r) * 7}
              x2={16 + Math.cos(r) * 13.5}
              y2={16 + Math.sin(r) * 13.5}
            />
          )
        })}
      </g>
      <circle cx="16" cy="16" r="9.5" fill={colour} />
      <rect x="11" y="10.5" width="3.4" height="3.4" fill="#fff" />
    </svg>
  )
}

function Flag() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 3 L6 8 L11.5 5.5 Z" fill="#ff0000" />
      <rect x="5.2" y="3" width="1.2" height="9" fill="#000" />
      <rect x="3" y="12" width="9" height="1.6" fill="#000" />
      <rect x="4" y="10.6" width="7" height="1.4" fill="#000" />
    </svg>
  )
}

function Face({ state, pressed }: { state: 'ready' | 'playing' | 'won' | 'lost'; pressed: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#ffff00" stroke="#000" strokeWidth="1.2" />
      {state === 'lost' ? (
        <>
          <path d="M6.6 7.4 l3.2 3.2 M9.8 7.4 l-3.2 3.2 M14.2 7.4 l3.2 3.2 M17.4 7.4 l-3.2 3.2"
            stroke="#000" strokeWidth="1.5" />
          <circle cx="12" cy="16.2" r="3" fill="none" stroke="#000" strokeWidth="1.5" />
        </>
      ) : state === 'won' ? (
        <>
          <path d="M4.6 9 h5.6 v3.2 h-5.6 z M13.8 9 h5.6 v3.2 h-5.6 z M10.2 10 h3.6"
            fill="#000" stroke="#000" strokeWidth="1.2" />
          <path d="M7.5 15.6 q4.5 3.6 9 0" fill="none" stroke="#000" strokeWidth="1.5" />
        </>
      ) : pressed ? (
        <>
          <circle cx="8.6" cy="9.6" r="1.4" fill="#000" />
          <circle cx="15.4" cy="9.6" r="1.4" fill="#000" />
          <circle cx="12" cy="15.4" r="3.2" fill="none" stroke="#000" strokeWidth="1.5" />
        </>
      ) : (
        <>
          <circle cx="8.6" cy="9.4" r="1.4" fill="#000" />
          <circle cx="15.4" cy="9.4" r="1.4" fill="#000" />
          <path d="M7.4 14.4 q4.6 4 9.2 0" fill="none" stroke="#000" strokeWidth="1.5" />
        </>
      )}
    </svg>
  )
}

export function Minesweeper() {
  const [levelKey, setLevelKey] = useState<keyof typeof LEVELS>('expert')
  const level = LEVELS[levelKey]
  const [cells, setCells] = useState<Cell[]>(() => build(LEVELS.expert))
  const [state, setState] = useState<'ready' | 'playing' | 'won' | 'lost'>('ready')
  const [seconds, setSeconds] = useState(0)
  const [menu, setMenu] = useState<string | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (state !== 'playing') return
    const t = window.setInterval(() => setSeconds((s) => Math.min(999, s + 1)), 1000)
    return () => window.clearInterval(t)
  }, [state])

  const flags = useMemo(() => cells.filter((c) => c.flagged).length, [cells])

  const reset = (next: Level = level) => {
    setCells(build(next))
    setState('ready')
    setSeconds(0)
  }

  const pick = (key: keyof typeof LEVELS) => {
    setLevelKey(key)
    reset(LEVELS[key])
    setMenu(null)
  }

  const reveal = (index: number) => {
    if (state === 'won' || state === 'lost') return
    const next = cells.map((c) => ({ ...c }))
    if (next[index].flagged || next[index].revealed) return
    if (state === 'ready') setState('playing')

    if (next[index].mine) {
      next.forEach((c) => {
        if (c.mine) c.revealed = true
      })
      next[index].boom = true
      setCells(next)
      setState('lost')
      play('error')
      return
    }

    const stack = [index]
    while (stack.length) {
      const i = stack.pop()!
      const cell = next[i]
      if (cell.revealed || cell.flagged) continue
      cell.revealed = true
      if (cell.near === 0) stack.push(...neighbours(i, level.w, level.h))
    }
    setCells(next)

    if (next.filter((c) => !c.mine).every((c) => c.revealed)) {
      setState('won')
      play('signin')
    }
  }

  const flag = (index: number, e: React.MouseEvent) => {
    e.preventDefault()
    if (state === 'won' || state === 'lost') return
    setCells((list) =>
      list.map((c, i) => (i === index && !c.revealed ? { ...c, flagged: !c.flagged } : c))
    )
  }

  return (
    <div className="ms" onClick={() => menu && setMenu(null)}>
      <div className="ms-menubar">
        <button
          className={menu === 'game' ? 'open' : ''}
          onClick={(e) => { e.stopPropagation(); setMenu(menu === 'game' ? null : 'game') }}
        >
          Game
        </button>
        <button
          className={menu === 'help' ? 'open' : ''}
          onClick={(e) => { e.stopPropagation(); setMenu(menu === 'help' ? null : 'help') }}
        >
          Help
        </button>

        {menu === 'game' ? (
          <div className="ms-menu" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => { reset(); setMenu(null) }}>New</button>
            <hr />
            {(Object.keys(LEVELS) as (keyof typeof LEVELS)[]).map((k) => (
              <button key={k} onClick={() => pick(k)}>
                <span className="ms-tick">{levelKey === k ? '•' : ''}</span>
                {LEVELS[k].name}
              </button>
            ))}
            <hr />
            <button onClick={() => setMenu(null)}>Exit</button>
          </div>
        ) : null}

        {menu === 'help' ? (
          <div className="ms-menu ms-menu-help" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setMenu(null)}>Contents</button>
            <button onClick={() => setMenu(null)}>About Minesweeper</button>
          </div>
        ) : null}
      </div>

      <div className="ms-frame">
        <div className="ms-status">
          <Counter value={level.mines - flags} />
          <button
            className="ms-face"
            onClick={() => { reset() }}
            title="New game"
          >
            <Face state={state} pressed={false} />
          </button>
          <Counter value={seconds} />
        </div>

        <div
          className="ms-board"
          ref={boardRef}
          style={{ gridTemplateColumns: `repeat(${level.w}, 16px)` }}
        >
          {cells.map((cell, i) => (
            <button
              key={i}
              className={[
                'ms-cell',
                cell.revealed ? 'open' : '',
                cell.boom ? 'boom' : '',
              ].filter(Boolean).join(' ')}
              style={cell.revealed && cell.near ? { color: NUMBER_COLOUR[cell.near] } : undefined}
              onClick={() => reveal(i)}
              onContextMenu={(e) => flag(i, e)}
              aria-label={`Cell ${i + 1}`}
            >
              {cell.revealed ? (
                cell.mine ? <Mine /> : cell.near ? cell.near : ''
              ) : cell.flagged ? (
                <Flag />
              ) : (
                ''
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export { Mine as MineGlyph }
