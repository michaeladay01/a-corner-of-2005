import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { play } from '../../lib/sounds'

/* Klondike, dealt three at a time, the way Windows dealt it out of the box.
   Cards can be dragged, or clicked once to pick up and once to put down —
   a mouse in 2005 was less forgiving than a trackpad in 2026. */

type Suit = 'S' | 'H' | 'D' | 'C'
type Card = { id: string; suit: Suit; rank: number; up: boolean }

/** Where a card can be: the stock, the turned-over waste, a home, a column. */
type PileId =
  | 'stock'
  | 'waste'
  | `home-${0 | 1 | 2 | 3}`
  | `col-${0 | 1 | 2 | 3 | 4 | 5 | 6}`

type Board = {
  stock: Card[]
  waste: Card[]
  homes: [Card[], Card[], Card[], Card[]]
  cols: [Card[], Card[], Card[], Card[], Card[], Card[], Card[]]
}

const SUITS: Suit[] = ['S', 'H', 'D', 'C']
const PIP: Record<Suit, string> = { S: '♠', H: '♥', D: '♦', C: '♣' }
const RANKS = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

const red = (s: Suit) => s === 'H' || s === 'D'

function shuffled(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ id: `${suit}${rank}`, suit, rank, up: false })
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

function deal(): Board {
  const deck = shuffled()
  const cols = [[], [], [], [], [], [], []] as unknown as Board['cols']
  for (let c = 0; c < 7; c++) {
    for (let n = 0; n <= c; n++) {
      const card = deck.pop() as Card
      card.up = n === c
      cols[c].push(card)
    }
  }
  return { stock: deck, waste: [], homes: [[], [], [], []], cols }
}

/** A home takes its suit in order; a column takes the other colour, counting down. */
function fitsHome(card: Card, pile: Card[]) {
  const top = pile[pile.length - 1]
  return top ? top.suit === card.suit && card.rank === top.rank + 1 : card.rank === 1
}

function fitsColumn(card: Card, pile: Card[]) {
  const top = pile[pile.length - 1]
  return top ? top.up && red(top.suit) !== red(card.suit) && card.rank === top.rank - 1 : card.rank === 13
}

function clone(b: Board): Board {
  return {
    stock: [...b.stock],
    waste: [...b.waste],
    homes: b.homes.map((p) => [...p]) as Board['homes'],
    cols: b.cols.map((p) => [...p]) as Board['cols'],
  }
}

/** The cards being moved: a card and everything sitting on top of it. */
type Held = { from: PileId; cards: Card[] }

export function Solitaire() {
  const [board, setBoard] = useState<Board>(deal)
  const [held, setHeld] = useState<Held | null>(null)
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null)
  const grabbedAt = useRef<{ x: number; y: number } | null>(null)
  const [menu, setMenu] = useState<null | 'game' | 'help'>(null)
  const [score, setScore] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [steps, setSteps] = useState(0)
  const history = useRef<{ board: Board; score: number }[]>([])
  const root = useRef<HTMLDivElement>(null)

  // The game is over when all four homes are full: that is a fact about the
  // board, not a separate piece of state to keep in step with it.
  const won = board.homes.every((h) => h.length === 13)

  useEffect(() => {
    if (won) return
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(t)
  }, [won])

  useEffect(() => {
    if (won) play('startup')
  }, [won])

  const newGame = useCallback(() => {
    history.current = []
    setBoard(deal())
    setHeld(null)
    setScore(0)
    setSeconds(0)
    setSteps(0)
  }, [])

  const remember = (b: Board, s: number) => {
    history.current.push({ board: clone(b), score: s })
    if (history.current.length > 40) history.current.shift()
    setSteps(history.current.length)
  }

  const undo = () => {
    const last = history.current.pop()
    if (!last) return
    setBoard(last.board)
    setScore(last.score)
    setSteps(history.current.length)
    setHeld(null)
    play('click')
  }

  const pileOf = (b: Board, id: PileId): Card[] =>
    id === 'stock'
      ? b.stock
      : id === 'waste'
        ? b.waste
        : id.startsWith('home-')
          ? b.homes[Number(id.slice(5)) as 0]
          : b.cols[Number(id.slice(4)) as 0]

  const setPile = (b: Board, id: PileId, cards: Card[]) => {
    if (id === 'stock') b.stock = cards
    else if (id === 'waste') b.waste = cards
    else if (id.startsWith('home-')) b.homes[Number(id.slice(5)) as 0] = cards
    else b.cols[Number(id.slice(4)) as 0] = cards
  }

  /* Turning the stock over: three at a time, and round again when it runs out. */
  const tapStock = () => {
    setHeld(null)
    setBoard((b) => {
      remember(b, score)
      const next = clone(b)
      if (next.stock.length === 0) {
        next.stock = next.waste.reverse().map((c) => ({ ...c, up: false }))
        next.waste = []
        setScore((s) => Math.max(0, s - 20))
      } else {
        const taken = next.stock.splice(-3).reverse().map((c) => ({ ...c, up: true }))
        next.waste = [...next.waste, ...taken]
      }
      return next
    })
    play('click')
  }

  /** Drop what is being held onto a pile, if the rules allow it. */
  const drop = (to: PileId) => {
    if (!held) return false
    if (to === held.from || to === 'stock' || to === 'waste') {
      setHeld(null)
      return false
    }
    const moving = held.cards
    const target = pileOf(board, to)
    const home = to.startsWith('home-')
    const ok = home
      ? moving.length === 1 && fitsHome(moving[0], target)
      : fitsColumn(moving[0], target)
    if (!ok) {
      setHeld(null)
      return false
    }

    remember(board, score)
    const next = clone(board)
    const source = pileOf(next, held.from).slice(0, -moving.length)
    // The card underneath turns over once the one on top has left.
    const last = source[source.length - 1]
    if (last && !last.up && held.from.startsWith('col-')) {
      source[source.length - 1] = { ...last, up: true }
      setScore((s) => s + 5)
    }
    setPile(next, held.from, source)
    setPile(next, to, [...target, ...moving])
    setBoard(next)
    setHeld(null)
    setScore((s) => s + (home ? 10 : held.from === 'waste' ? 5 : 0))
    play('click')
    return true
  }

  /** Double-click: send it home if there is a home for it. */
  const sendHome = (from: PileId, card: Card) => {
    const index = board.homes.findIndex((h) => fitsHome(card, h))
    if (index < 0) return
    const pile = pileOf(board, from)
    if (pile[pile.length - 1]?.id !== card.id) return

    remember(board, score)
    const next = clone(board)
    const source = pileOf(next, from).slice(0, -1)
    const last = source[source.length - 1]
    if (last && !last.up && from.startsWith('col-')) source[source.length - 1] = { ...last, up: true }
    setPile(next, from, source)
    next.homes[index as 0] = [...next.homes[index as 0], card]
    setBoard(next)
    setHeld(null)
    setScore((s) => s + 10)
    play('click')
  }

  /** Picking up: a face-up card brings everything stacked on it. */
  const pickUp = (from: PileId, index: number) => {
    const pile = pileOf(board, from)
    const card = pile[index]
    if (!card?.up) return
    if (from === 'waste' && index !== pile.length - 1) return
    if (from.startsWith('home-') && index !== pile.length - 1) return
    setHeld({ from, cards: pile.slice(index) })
  }

  const onCardDown = (e: React.PointerEvent, from: PileId, index: number) => {
    e.stopPropagation()
    const pile = pileOf(board, from)
    if (held) {
      // Already holding something: this click is where it goes.
      if (!drop(from)) pickUp(from, index)
      return
    }
    if (!pile[index]?.up) return
    pickUp(from, index)
    grabbedAt.current = { x: e.clientX, y: e.clientY }
    setDrag({ x: e.clientX, y: e.clientY })
  }

  // While something is held, it follows the pointer and lands where it is let go.
  useEffect(() => {
    if (!drag) return
    const move = (ev: PointerEvent) => setDrag({ x: ev.clientX, y: ev.clientY })
    const up = (ev: PointerEvent) => {
      setDrag(null)
      const start = grabbedAt.current
      grabbedAt.current = null
      // A click that did not travel is a pick-up, not a drop: the card stays
      // held, and the next click says where it goes.
      const travelled =
        !start || Math.abs(ev.clientX - start.x) > 4 || Math.abs(ev.clientY - start.y) > 4
      if (!travelled) return
      const el = document.elementFromPoint(ev.clientX, ev.clientY)
      const pile = el?.closest<HTMLElement>('[data-pile]')?.dataset.pile as PileId | undefined
      if (pile) drop(pile)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  })

  const heldIds = useMemo(() => new Set(held?.cards.map((c) => c.id)), [held])
  const dragging = drag !== null && held !== null

  return (
    <div className="sol" ref={root} onPointerDown={() => { setMenu(null); setHeld(null) }}>
      <div className="sol-menubar">
        <button className={menu === 'game' ? 'on' : ''} onPointerDown={(e) => { e.stopPropagation(); setMenu(menu === 'game' ? null : 'game') }}>
          <u>G</u>ame
        </button>
        <button className={menu === 'help' ? 'on' : ''} onPointerDown={(e) => { e.stopPropagation(); setMenu(menu === 'help' ? null : 'help') }}>
          <u>H</u>elp
        </button>

        {menu === 'game' ? (
          <div className="sol-menu" onPointerDown={(e) => e.stopPropagation()}>
            <button onClick={() => { newGame(); setMenu(null) }}>Deal</button>
            <button onClick={() => { undo(); setMenu(null) }} disabled={steps === 0}>
              Undo
            </button>
          </div>
        ) : null}

        {menu === 'help' ? (
          <div className="sol-menu sol-menu-help" onPointerDown={(e) => e.stopPropagation()}>
            <button onClick={() => setMenu(null)}>Contents</button>
            <button onClick={() => setMenu(null)}>About Solitaire</button>
          </div>
        ) : null}
      </div>

      <div
        className="sol-felt"
        onPointerDown={(e) => {
          // Clicking a pile — its empty space included — is where a held card
          // goes. Clicking the felt itself puts it back.
          if (!held) return
          const pile = (e.target as HTMLElement).closest<HTMLElement>('[data-pile]')?.dataset
            .pile as PileId | undefined
          if (pile) drop(pile)
          else setHeld(null)
        }}
      >
        <div className="sol-top">
          <div className="sol-deal">
            <div
              className="sol-pile"
              data-pile="stock"
              onPointerDown={(e) => { e.stopPropagation(); tapStock() }}
            >
              {board.stock.length ? (
                <CardFace card={board.stock[board.stock.length - 1]} back />
              ) : (
                <div className="sol-slot sol-recycle">↻</div>
              )}
            </div>

            <div className="sol-pile sol-waste" data-pile="waste">
              {board.waste.length === 0 ? <div className="sol-slot" /> : null}
              {board.waste.slice(-3).map((card, i, shown) => (
                <div key={card.id} className="sol-fan" style={{ left: i * 14 }}>
                  <CardFace
                    card={card}
                    held={heldIds.has(card.id)}
                    onPointerDown={(e) =>
                      onCardDown(e, 'waste', board.waste.length - shown.length + i)
                    }
                    onDoubleClick={() => sendHome('waste', card)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="sol-homes">
            {board.homes.map((pile, i) => (
              <div className="sol-pile" key={i} data-pile={`home-${i}`}>
                {pile.length ? (
                  <CardFace
                    card={pile[pile.length - 1]}
                    held={heldIds.has(pile[pile.length - 1].id)}
                    onPointerDown={(e) => onCardDown(e, `home-${i}` as PileId, pile.length - 1)}
                  />
                ) : (
                  <div className="sol-slot" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="sol-cols">
          {board.cols.map((pile, c) => (
            <div className="sol-col" key={c} data-pile={`col-${c}`}>
              {pile.length === 0 ? <div className="sol-slot" /> : null}
              {pile.map((card, i) => (
                <div
                  key={card.id}
                  className="sol-stacked"
                  style={{ top: i * (card.up ? 19 : 6) - (i ? 0 : 0) }}
                >
                  <CardFace
                    card={card}
                    back={!card.up}
                    held={heldIds.has(card.id)}
                    onPointerDown={(e) => onCardDown(e, `col-${c}` as PileId, i)}
                    onDoubleClick={() => card.up && sendHome(`col-${c}` as PileId, card)}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        {won ? (
          <div className="sol-won">
            <p>Congratulations!</p>
            <button className="xp-button" onPointerDown={(e) => { e.stopPropagation(); newGame() }}>
              Deal again
            </button>
          </div>
        ) : null}
      </div>

      <div className="sol-status">
        <span>Score: {score}</span>
        <span>Time: {seconds}</span>
      </div>

      {dragging && held ? (
        <div className="sol-ghost" style={{ left: drag.x, top: drag.y }}>
          {held.cards.map((card, i) => (
            <div key={card.id} className="sol-stacked" style={{ top: i * 19 }}>
              <CardFace card={card} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function CardFace({
  card,
  back,
  held,
  onPointerDown,
  onDoubleClick,
}: {
  card: Card
  back?: boolean
  held?: boolean
  onPointerDown?: (e: React.PointerEvent) => void
  onDoubleClick?: () => void
}) {
  if (back || !card.up) {
    return <div className="sol-card back" onPointerDown={onPointerDown} />
  }
  return (
    <div
      className={`sol-card${red(card.suit) ? ' red' : ''}${held ? ' held' : ''}`}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
    >
      <span className="corner">
        {RANKS[card.rank]}
        <i>{PIP[card.suit]}</i>
      </span>
      <span className="middle">{PIP[card.suit]}</span>
      <span className="corner bottom">
        {RANKS[card.rank]}
        <i>{PIP[card.suit]}</i>
      </span>
    </div>
  )
}
