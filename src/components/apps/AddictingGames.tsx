import { useState } from 'react'
import { LogoImg } from '../Icons'
import { BonelessGirl } from './BonelessGirl'
import { BlockDrop } from './BlockDrop'
import { CannonBlast } from './CannonBlast'
import { WallDefence } from './WallDefence'
import { RoadTest } from './RoadTest'
import { TableTennis } from './TableTennis'
import { asset } from '../../lib/asset'

/* AddictingGames.com in 2005: the blue-grey header band, the Featured Games
   box with its search panel, then the category columns of blue links with
   their star bullets.

   Every thumbnail is a blank slot. Drop a file into public/addictinggames/
   named after the slot shown on the placeholder and it appears in its place. */

function Slot({ name, w, h }: { name: string; w: number; h: number }) {
  const [missing, setMissing] = useState(false)
  return (
    <span className="ag-slot" style={{ width: w, height: h }}>
      {missing ? (
        <span className="ag-blank">{name}</span>
      ) : (
        <img
          src={asset(`addictinggames/${name}.png`)}
          alt=""
          onError={() => setMissing(true)}
        />
      )}
    </span>
  )
}

type Featured = { slot: string; title: string; blurb: string; play?: string }

const FEATURED: Featured[] = [
  {
    slot: 'boneless-girl',
    title: 'Boneless Girl',
    blurb: 'Drag her about and bounce her off the bubbles.',
    play: 'boneless',
  },
  {
    slot: 'tetris',
    title: 'Tetris',
    blurb: 'Slide and spin the falling blocks to clear whole rows.',
    play: 'tetris',
  },
  {
    slot: 'kitten-cannon',
    title: 'Kitten Cannon',
    blurb: 'Fire her across the field and see how far she gets.',
    play: 'cannon',
  },
  {
    slot: 'storm-house',
    title: 'Storm the House',
    blurb: 'Hold off the waves and spend your winnings between rounds.',
    play: 'storm',
  },
  {
    slot: 'drivers-ed',
    title: 'Drivers Ed',
    blurb: 'Keep it on the tarmac and off the cones.',
    play: 'drivers',
  },
  {
    slot: 'ping-pong-3d',
    title: 'Ping Pong 3D',
    blurb: 'Table tennis down the length of the table. First to eleven.',
    play: 'pingpong',
  },
]

/** One link in a category's list: its name, and whether it gets a star. */
type Entry = [name: string, starred: boolean]

type Category = {
  id: string
  name: string
  /* The three with pictures at the top of the column. */
  top: { slot: string; title: string; play?: string }[]
  /* The long list beneath. A leading star marks the popular ones. */
  list: Entry[]
  more?: boolean
}

const CATEGORIES: Category[] = [
  {
    id: 'puzzle',
    name: 'Puzzle & Board Games',
    top: [
      { slot: 'hapland2', title: 'Hapland 2' },
      { slot: 'battleship', title: 'Battleship' },
      { slot: 'bookworm', title: 'Bookworm' },
    ],
    list: [
      ['Bejeweled', true], ['Big Money', false], ['Daily Jigsaw', false],
      ['Hang The Alien', true], ['Labyrinth', true], ['Magnetism 2', true],
      ['Text Twist', false], ['Wacky Wordsearch', true],
    ] as Entry[],
  },
  {
    id: 'action',
    name: 'Action Games',
    top: [
      { slot: 'madness', title: 'Madness Interactive' },
      { slot: 'waterslide', title: 'Waterslide' },
      { slot: 'black-knight', title: 'The Black Knight' },
    ],
    list: [
      ['Bloody Rage', false], ['Capoeira Fighter 3', true], ['Drakojan Skies 2', true],
      ['Dynasty Street', true], ['Heli Attack 3', true], ['King of the Hill', true],
      ['Sabermania', true], ['Thing-Thing 2', true],
    ] as Entry[],
  },
  {
    id: 'sports',
    name: 'Sports & Skill Games',
    top: [
      { slot: 'mini-putt-2', title: 'Mini Putt 2' },
      { slot: 'bmx-freestyle', title: 'BMX Freestyle' },
      { slot: 'billiards', title: '3D Billiards' },
    ],
    list: [
      ['501 Darts', true], ['Baseball', true], ['Curve Ball', false],
      ['Drag Racer v3', false], ['Funky Pong', true], ['Knievels Wild Ride', true],
      ['Mountain Bike Madness', true], ['Switch Wakeboarding', true],
    ] as Entry[],
  },
  {
    id: 'adventure',
    name: 'Adventure Games',
    top: [
      { slot: 'blob-bob', title: 'The Adventures of Blob Bob' },
      { slot: 'cheese-hunt', title: 'Cheese Hunt' },
      { slot: 'barbarian-bob', title: 'Barbarian Bob' },
    ],
    list: [
      ['Angry Old Wizard', true], ['Beaver Dive', true], ['Castle Cat 3', true],
      ['Dolphin Dash', false], ['Hobbit Rampage', true], ['HoverBot', true],
      ['Space Dude', true], ['The Viking', true],
    ] as Entry[],
  },
  {
    id: 'card',
    name: 'Card & Casino Games',
    top: [
      { slot: 'blackjack', title: 'BlackJack' },
      { slot: 'solitaire', title: 'Solitaire' },
      { slot: 'poker', title: 'Poker' },
    ],
    list: [
      ['2D Memory', false], ['Brainiac', false], ['Golf Solitaire', false],
      ['Mah Jong Solitaire', false], ['Multiplayer Hearts', true], ['Multiplayer Spades', true],
      ['Perfect Match', false], ['Pyramid Solitaire', false],
    ] as Entry[],
  },
  {
    id: 'arcade',
    name: 'Arcade & Classic Games',
    top: [
      { slot: 'helicopter', title: 'Helicopter Game' },
      { slot: 'bubble-trouble', title: 'Bubble Trouble' },
      { slot: 'gold-miner', title: 'Gold Miner' },
    ],
    list: [
      ['Armada Assault', true], ['Battle for Gondor', true], ['Cornfield 5000', true],
      ['Crab Wars', true], ['Drakojan Skies', true], ['Flip the Frog', false],
      ['Golden Gate Drop', true], ['Hostile Skies', false],
    ] as Entry[],
  },
]

function Column({ cat, onPlay }: { cat: Category; onPlay: (id: string) => void }) {
  const open = (id?: string) => {
    if (id) onPlay(id)
  }
  return (
    <div className="ag-col">
      <h3>
        <a>{cat.name}</a>
      </h3>

      <ul className="ag-top">
        {cat.top.map((t, i) => (
          <li key={t.slot} className={i % 2 ? 'alt' : undefined}>
            <button className="ag-thumbbtn" onClick={() => open(t.play)}>
              <Slot name={t.slot} w={52} h={48} />
            </button>
            <a onClick={() => open(t.play)}>{t.title}</a>
          </li>
        ))}
      </ul>

      <ul className="ag-list">
        {cat.list.map(([name, star]) => (
          <li key={name}>
            {star ? <span className="ag-star" aria-hidden /> : <span className="ag-nostar" />}
            <a>{name}</a>
          </li>
        ))}
      </ul>

      {cat.more !== false ? (
        <p className="ag-more">
          <a>
            Click here for more
            <br />
            {cat.name}...
          </a>
        </p>
      ) : (
        <p className="ag-more">
          <a>
            Click here for more
            <br />
            Recent Games...
          </a>
        </p>
      )}
    </div>
  )
}

/* An embed can ask for one game straight away: ?open=games&play=cannon. */
function requestedGame(): string | null {
  if (typeof window === 'undefined') return null
  const want = new URLSearchParams(window.location.search).get('play')
  return want && FEATURED.some((f) => f.play === want) ? want : null
}

export function AddictingGames() {
  const [query, setQuery] = useState('')
  const [note, setNote] = useState<string | null>(null)
  const [playing, setPlaying] = useState<string | null>(requestedGame)

  const search = () =>
    setNote(
      query.trim()
        ? `No games found matching ${query.trim()}.`
        : 'Please enter something to search for.'
    )

  const rows = [CATEGORIES.slice(0, 3), CATEGORIES.slice(3, 6)]

  return (
    <div className="ag">
      <header className="ag-head">
        <LogoImg name="addictinggames" size={360} height={56}>
          <span className="ag-wordmark">AddictingGames.com</span>
        </LogoImg>
        <p>
          Welcome to Addicting Games, the largest source of great free online games including
          arcade games, action games, sports games, puzzle games, flash games and more. Updated
          every Friday!
        </p>
      </header>
      <div className="ag-rule" />

      {note ? (
        <div className="ag-note">
          {note}
          <button onClick={() => setNote(null)}>close</button>
        </div>
      ) : null}

      <div className="ag-body scroll">
        <div className="ag-feature">
          <section className="ag-featured">
            {playing ? (
              <>
                <h2 className="ag-playhead">
                  {FEATURED.find((f) => f.play === playing)?.title}
                  <a onClick={() => setPlaying(null)}>&laquo; Back to Featured Games</a>
                </h2>
                <div className="ag-stage">
                  {playing === 'boneless' ? <BonelessGirl /> : null}
                  {playing === 'tetris' ? <BlockDrop /> : null}
                  {playing === 'cannon' ? <CannonBlast /> : null}
                  {playing === 'storm' ? <WallDefence /> : null}
                  {playing === 'drivers' ? <RoadTest /> : null}
                  {playing === 'pingpong' ? <TableTennis /> : null}
                </div>
              </>
            ) : (
              <>
                <h2>Featured Games : Updated December 9</h2>
                <ul>
                  {FEATURED.map((f) => (
                    <li key={f.slot}>
                      <button
                        className="ag-thumbbtn"
                        onClick={() => f.play && setPlaying(f.play)}
                      >
                        <Slot name={f.slot} w={48} h={48} />
                      </button>
                      <span>
                        <a onClick={() => f.play && setPlaying(f.play)}>{f.title}</a>
                        <i>{f.blurb}</i>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <aside className="ag-searchbox">
            <h2>Search For More Games</h2>
            <div className="ag-searchrow">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && search()}
                aria-label="Search for games"
              />
              <button onClick={search}>Search</button>
            </div>
            <p className="ag-links">
              <a>View All Games</a>
              <a>View Last Week&rsquo;s Features</a>
            </p>
            <p className="ag-links">
              <a>Add To Favorites!</a>
              <a>Tell A Friend</a>
              <a>Make Us Your Homepage</a>
            </p>
            <span className="ag-classic">
              <b>AddictingGames.com</b>
              <i>CLASSIC</i>
            </span>
          </aside>
        </div>

        {rows.map((row, i) => (
          <div className="ag-cols" key={i}>
            {row.map((cat) => (
              <Column key={cat.id} cat={cat} onPlay={setPlaying} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
