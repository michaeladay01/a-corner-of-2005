import { useCallback, useEffect, useRef, useState } from 'react'

/* A falling-block puzzle: seven four-square pieces drop down a ten-wide well,
   you slide and spin them, and full rows clear. Written from scratch. */

const COLS = 10
const ROWS = 20

/* Each piece is listed by the cells it fills in its 4x4 box, for each of its
   four turns. Index 0 means empty. */
const SHAPES: number[][][] = [
  // long bar
  [[1, 5, 9, 13], [4, 5, 6, 7]],
  // square
  [[5, 6, 9, 10]],
  // T
  [[5, 4, 6, 9], [1, 4, 5, 9], [1, 4, 5, 6], [1, 5, 6, 9]],
  // S
  [[6, 5, 9, 8], [1, 5, 6, 10]],
  // Z
  [[4, 5, 9, 10], [2, 5, 6, 9]],
  // L
  [[1, 5, 9, 10], [4, 5, 6, 8], [1, 2, 6, 10], [2, 4, 5, 6]],
  // J
  [[2, 6, 9, 10], [4, 8, 9, 10], [1, 2, 5, 9], [4, 5, 6, 10]],
]

const COLOURS = [
  '#3ab0c8', // bar
  '#e8c83a', // square
  '#a05ac0', // T
  '#4aa84a', // S
  '#d8443a', // Z
  '#e88a2a', // L
  '#3a6ad8', // J
]

type Piece = { kind: number; turn: number; x: number; y: number }

const emptyWell = () => Array.from({ length: ROWS }, () => Array<number>(COLS).fill(-1))

function cellsOf(p: Piece): [number, number][] {
  const out: [number, number][] = []
  for (const i of SHAPES[p.kind][p.turn % SHAPES[p.kind].length]) {
    out.push([p.x + (i % 4), p.y + Math.floor(i / 4)])
  }
  return out
}

export function BlockDrop() {
  const [well, setWell] = useState<number[][]>(emptyWell)
  const [piece, setPiece] = useState<Piece | null>(null)
  const [nextKind, setNextKind] = useState(() => Math.floor(Math.random() * 7))
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [over, setOver] = useState(false)
  const [paused, setPaused] = useState(false)

  // The loop reads these, so keep them where it can see the latest value.
  const wellRef = useRef(well)
  const pieceRef = useRef(piece)
  const overRef = useRef(over)
  const pausedRef = useRef(paused)
  useEffect(() => { wellRef.current = well }, [well])
  useEffect(() => { pieceRef.current = piece }, [piece])
  useEffect(() => { overRef.current = over }, [over])
  useEffect(() => { pausedRef.current = paused }, [paused])

  const level = Math.floor(lines / 10) + 1

  const fits = useCallback((p: Piece, w: number[][]) => {
    return cellsOf(p).every(
      ([x, y]) => x >= 0 && x < COLS && y < ROWS && (y < 0 || w[y][x] === -1)
    )
  }, [])

  const spawn = useCallback(
    (kind: number, w: number[][]) => {
      const p: Piece = { kind, turn: 0, x: 3, y: -1 }
      if (!fits(p, w)) {
        setOver(true)
        setPiece(null)
        return
      }
      setPiece(p)
      setNextKind(Math.floor(Math.random() * 7))
    },
    [fits]
  )

  const reset = useCallback(() => {
    const w = emptyWell()
    setWell(w)
    setScore(0)
    setLines(0)
    setOver(false)
    setPaused(false)
    spawn(Math.floor(Math.random() * 7), w)
  }, [spawn])

  useEffect(() => {
    reset()
    // Only on mount; reset is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Settle the piece into the well, clear any full rows, send the next one. */
  const land = useCallback(
    (p: Piece) => {
      const w = wellRef.current.map((r) => r.slice())
      for (const [x, y] of cellsOf(p)) {
        if (y < 0) {
          setOver(true)
          setPiece(null)
          return
        }
        w[y][x] = p.kind
      }
      const kept = w.filter((row) => row.some((c) => c === -1))
      const cleared = ROWS - kept.length
      while (kept.length < ROWS) kept.unshift(Array<number>(COLS).fill(-1))
      if (cleared) {
        setLines((n) => n + cleared)
        setScore((s) => s + [0, 100, 300, 500, 800][cleared] * level)
      }
      setWell(kept)
      wellRef.current = kept
      spawn(nextKind, kept)
    },
    [level, nextKind, spawn]
  )

  const drop = useCallback(() => {
    const p = pieceRef.current
    if (!p || overRef.current || pausedRef.current) return
    const down = { ...p, y: p.y + 1 }
    if (fits(down, wellRef.current)) setPiece(down)
    else land(p)
  }, [fits, land])

  /* A plain interval, so it keeps ticking where animation frames are throttled. */
  useEffect(() => {
    const ms = Math.max(90, 600 - (level - 1) * 55)
    const t = window.setInterval(drop, ms)
    return () => window.clearInterval(t)
  }, [drop, level])

  const nudge = useCallback(
    (dx: number) => {
      const p = pieceRef.current
      if (!p || overRef.current || pausedRef.current) return
      const next = { ...p, x: p.x + dx }
      if (fits(next, wellRef.current)) setPiece(next)
    },
    [fits]
  )

  const spin = useCallback(() => {
    const p = pieceRef.current
    if (!p || overRef.current || pausedRef.current) return
    const turned = { ...p, turn: (p.turn + 1) % SHAPES[p.kind].length }
    // Shove it off the wall if the turn would hang over the edge.
    for (const dx of [0, -1, 1, -2, 2]) {
      const t = { ...turned, x: turned.x + dx }
      if (fits(t, wellRef.current)) {
        setPiece(t)
        return
      }
    }
  }, [fits])

  const slam = useCallback(() => {
    const p = pieceRef.current
    if (!p || overRef.current || pausedRef.current) return
    let cur = p
    while (fits({ ...cur, y: cur.y + 1 }, wellRef.current)) cur = { ...cur, y: cur.y + 1 }
    setPiece(cur)
    pieceRef.current = cur
    land(cur)
  }, [fits, land])

  const onKey = (e: React.KeyboardEvent) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' ', 'p', 'P']
    if (!keys.includes(e.key)) return
    e.preventDefault()
    if (e.key === 'ArrowLeft') nudge(-1)
    if (e.key === 'ArrowRight') nudge(1)
    if (e.key === 'ArrowDown') drop()
    if (e.key === 'ArrowUp') spin()
    if (e.key === ' ') slam()
    if (e.key === 'p' || e.key === 'P') setPaused((v) => !v)
  }

  // What to paint: the settled well plus the piece on its way down.
  const view = well.map((r) => r.slice())
  if (piece) {
    for (const [x, y] of cellsOf(piece)) {
      if (y >= 0 && y < ROWS && x >= 0 && x < COLS) view[y][x] = piece.kind
    }
  }

  const preview = SHAPES[nextKind][0]

  return (
    <div className="bd" tabIndex={0} onKeyDown={onKey}>
      <div className="bd-bar">
        <span className="bd-title">Tetris</span>
        <button onClick={() => setPaused((p) => !p)} disabled={over}>
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button onClick={reset}>New Game</button>
        <span className="bd-hint">Arrows move &amp; rotate, space drops</span>
      </div>

      <div className="bd-body">
        <div className="bd-well">
          {view.map((row, y) =>
            row.map((cell, x) => (
              <span
                key={`${x}-${y}`}
                className={`bd-cell${cell >= 0 ? ' on' : ''}`}
                style={cell >= 0 ? { background: COLOURS[cell] } : undefined}
              />
            ))
          )}
          {over ? (
            <div className="bd-over">
              <b>Game Over</b>
              <button onClick={reset}>Play Again</button>
            </div>
          ) : null}
          {paused && !over ? (
            <div className="bd-over">
              <b>Paused</b>
            </div>
          ) : null}
        </div>

        <aside className="bd-side">
          <h3>Next</h3>
          <div className="bd-next">
            {Array.from({ length: 16 }, (_, i) => (
              <span
                key={i}
                className={`bd-cell${preview.includes(i) ? ' on' : ''}`}
                style={preview.includes(i) ? { background: COLOURS[nextKind] } : undefined}
              />
            ))}
          </div>
          <dl>
            <dt>Score</dt>
            <dd>{score}</dd>
            <dt>Lines</dt>
            <dd>{lines}</dd>
            <dt>Level</dt>
            <dd>{level}</dd>
          </dl>
          <div className="bd-pad">
            <button onClick={spin}>&#9650;</button>
            <span>
              <button onClick={() => nudge(-1)}>&#9664;</button>
              <button onClick={drop}>&#9660;</button>
              <button onClick={() => nudge(1)}>&#9654;</button>
            </span>
            <button className="bd-slam" onClick={slam}>
              Drop
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
