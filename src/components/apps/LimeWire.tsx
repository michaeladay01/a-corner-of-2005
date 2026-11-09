import { useEffect, useMemo, useRef, useState } from 'react'
import { play } from '../../lib/sounds'
import { asset } from '../../lib/asset'

/* LimeWire 4.x, as it stood in 2005: the menu bar, the three tabs, the
   Filter Results column down the left, the starred result table and the
   four big buttons along the bottom. */

type Result = {
  id: string
  name: string
  ext: string
  size: string
  speed: string
  bitrate: string
  quality: number
  sources: number
  artist: string
  album: string
  media: 'Audio' | 'Video' | 'Programs'
  /** Downloads that are not at all what the file name promises. */
  dodgy?: string
}

type Download = {
  id: string
  name: string
  bytes: number
  total: number
  speed: number
  state: 'queued' | 'downloading' | 'stalled' | 'done' | 'failed'
  dodgy?: string
}

type LibraryFile = {
  id: string
  name: string
  size: string
  length: string
  dodgy?: string
  preloaded?: boolean
}

type Tab = 'Search' | 'Monitor' | 'Library'

const TABS: Tab[] = ['Search', 'Monitor', 'Library']

const TYPES = ['Any Type', 'Audio', 'Video', 'Images', 'Documents', 'Programs']

const SUGGESTIONS = [
  'crazy frog',
  'numb linkin park',
  'mr brightside',
  'naruto episode 1',
  'windows xp sounds',
  'funny videos',
]

const MISLABELS = [
  'Moved file — this is 4 minutes of someone breathing',
  'Finished — it is actually the Crazy Frog',
  'Finished — 11 seconds of the song, then static',
  'Finished — someone shouting over the intro',
  'Finished — this is the wrong song entirely',
]

const SPELLINGS = ['', ' (1)', '[www.mp3-free.net]', '_FULL_VERSION', ' - YouTube rip', 'xXx']

const ARTISTS = [
  'Eminem',
  'Fort Minor',
  'Irish Drinking Songs',
  'Juelz Santana',
  'Musical - Rent',
  'Nickelback',
  'OutKast',
  'The Killers',
]

const ALBUMS = [
  "1970 - Those Fabulous '70s",
  'Devils Night (Advance)',
  'Ghettomusick VLS',
  'Madness - Begins',
  'Speakerboxxx',
  'The Massacre',
]

const SPEEDS = ['Modem', 'Cable/DSL', 'T1', 'T3 or higher']

// Already sitting in C:\Documents and Settings\Owner\My Documents\My Music
const PRELOADED: LibraryFile[] = [
  { id: 'p1', name: 'eminem_-_lose_yourself_(1).mp3', size: '4.1 MB', length: '5:26', preloaded: true },
  { id: 'p3', name: 'THE_REAL_SLIM_SHADY_FULL.mp3', size: '2.9 MB', length: '0:31', preloaded: true, dodgy: 'It is 31 seconds of the radio edit' },
  { id: 'p4', name: 'windows_xp_startup.wav', size: '0.4 MB', length: '0:04', preloaded: true },
  { id: 'p5', name: 'nokia ringtone (crazy frog remix).mp3', size: '1.8 MB', length: '2:12', preloaded: true },
]

function seedFrom(text: string) {
  let h = 7
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) % 99991
  return h
}

function buildResults(query: string): Result[] {
  const clean = query.trim() || 'untitled'
  const base = seedFrom(clean)
  const out: Result[] = []
  const count = 14 + (base % 10)
  for (let i = 0; i < count; i++) {
    const n = base + i * 977
    const mislabelled = n % 4 === 0
    const minutes = 2 + (n % 4)
    const seconds = (n * 7) % 60
    const video = n % 7 === 0
    out.push({
      id: `r${i}`,
      name:
        `${clean.replace(/\s+/g, ' ')}${SPELLINGS[n % SPELLINGS.length]}` +
        (n % 3 === 0 ? ' (live)' : ''),
      ext: video ? 'mpg' : n % 11 === 0 ? 'wma' : 'mp3',
      size: `${(2.8 + ((n % 50) / 10)).toFixed(1)} MB`,
      speed: SPEEDS[n % SPEEDS.length],
      bitrate: video ? '' : `${[96, 128, 128, 160, 192][n % 5]}`,
      quality: 1 + (n % 4),
      sources: 1 + (n % 11),
      artist: ARTISTS[n % ARTISTS.length],
      album: ALBUMS[n % ALBUMS.length],
      media: video ? 'Video' : n % 13 === 0 ? 'Programs' : 'Audio',
      dodgy: mislabelled ? MISLABELS[n % MISLABELS.length] : undefined,
    })
    void minutes
    void seconds
  }
  return out
}

function kb(n: number) {
  return `${(n / 1024).toFixed(1)} KB`
}

function mb(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/* --- the little drawings along the bottom of the window --- */

function DownloadGlyph() {
  return (
    <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden>
      <path d="M13 3h6v13h7L16 28 6 16h7z" fill="#9a9a9a" />
    </svg>
  )
}

function BrowseGlyph() {
  return (
    <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden>
      <rect x="5" y="4" width="22" height="24" rx="2" fill="#bdbdbd" />
      <rect x="8" y="7" width="16" height="18" fill="#e8e8e8" />
      <circle cx="16" cy="13" r="4" fill="#9a9a9a" />
      <path d="M9 24c1.6-4 4.2-6 7-6s5.4 2 7 6z" fill="#9a9a9a" />
    </svg>
  )
}

function StopGlyph() {
  return (
    <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden>
      <circle cx="16" cy="16" r="13" fill="#d13b32" />
      <circle cx="16" cy="16" r="13" fill="none" stroke="#9b241d" strokeWidth="1.5" />
      <path
        d="M10 10l12 12M22 10L10 22"
        stroke="#fff"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

function JunkGlyph() {
  return (
    <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden>
      <path d="M9 9h14l-1.6 19H10.6z" fill="#b8b8b8" />
      <path d="M12 12v13M16 12v13M20 12v13" stroke="#8e8e8e" strokeWidth="1.3" />
      <rect x="7" y="6" width="18" height="3" rx="1" fill="#9a9a9a" />
      <rect x="13" y="3" width="6" height="3" rx="1" fill="#9a9a9a" />
    </svg>
  )
}

function SignalBars() {
  return (
    <svg viewBox="0 0 22 14" width="22" height="14" aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={i * 5.4}
          y={12 - (i + 1) * 2.8}
          width="3.6"
          height={(i + 1) * 2.8}
          fill="#2f7d1f"
        />
      ))}
    </svg>
  )
}

function GlobeGlyph() {
  return (
    <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden>
      <circle cx="8" cy="8" r="7" fill="#7fb2e0" stroke="#3c6d9c" />
      <path d="M1 8h14M8 1c3 3 3 11 0 14M8 1C5 4 5 12 8 15" fill="none" stroke="#3c6d9c" />
      <path d="M3 4c3 1.4 7 1.4 10 0M3 12c3-1.4 7-1.4 10 0" fill="none" stroke="#3c6d9c" />
    </svg>
  )
}

/* One of the collapsible yellow-headed boxes down the left. */
function FilterBox({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)
  return (
    <section className={`lw-filter${open ? '' : ' shut'}`}>
      <header>
        <button
          className="lw-filter-refresh"
          onClick={() => setOpen(true)}
          title="Refresh"
          aria-label={`Refresh ${title}`}
        />
        <span>{title}</span>
        <button
          className="lw-filter-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label={`${open ? 'Collapse' : 'Expand'} ${title}`}
        />
      </header>
      {open ? <div className="lw-filter-body scroll">{children}</div> : null}
    </section>
  )
}

export function LimeWire() {
  const [tab, setTab] = useState<Tab>('Search')
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [type, setType] = useState('Any Type')
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<Result[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [downloads, setDownloads] = useState<Download[]>([])
  const [library, setLibrary] = useState<LibraryFile[]>(PRELOADED)
  const [libSelected, setLibSelected] = useState<string | null>(null)
  const [playing, setPlaying] = useState<string | null>(null)
  const [media, setMedia] = useState<string | null>(null)
  const [artist, setArtist] = useState<string | null>(null)
  const [menu, setMenu] = useState<string | null>(null)
  const announced = useRef<Set<string>>(new Set())

  const search = () => {
    const q = query.trim()
    if (!q) return
    setSearching(true)
    setResults([])
    setSubmitted(q)
    setMedia(null)
    setArtist(null)
    setSelected(null)
    // Results trickled in over a modem, a few at a time.
    window.setTimeout(() => {
      setResults(buildResults(q))
      setSearching(false)
    }, 1400)
  }

  const backToSearch = () => {
    setSubmitted('')
    setResults([])
    setSearching(false)
    setSelected(null)
  }

  const startDownload = (result: Result) => {
    if (downloads.some((d) => d.id === result.id)) return
    play('click')
    setDownloads((list) => [
      ...list,
      {
        id: result.id,
        name: `${result.name}.${result.ext}`,
        bytes: 0,
        total: parseFloat(result.size) * 1024 * 1024,
        speed: 1200 + Math.random() * 4200,
        state: 'queued',
        dodgy: result.dodgy,
      },
    ])
  }

  // Downloads crawl along at dial-up speed, stall now and then, and
  // occasionally turn out to be something else entirely.
  useEffect(() => {
    if (!downloads.some((d) => d.state !== 'done' && d.state !== 'failed')) return
    const timer = window.setInterval(() => {
      setDownloads((list) =>
        list.map((d) => {
          if (d.state === 'done' || d.state === 'failed') return d
          if (d.state === 'queued') return { ...d, state: 'downloading' }
          const roll = Math.random()
          if (d.state === 'downloading' && roll < 0.08) return { ...d, state: 'stalled' }
          if (d.state === 'stalled') {
            return roll < 0.45 ? { ...d, state: 'downloading' } : d
          }
          const bytes = d.bytes + d.total * (0.012 + Math.random() * 0.03)
          if (bytes >= d.total) {
            if (!announced.current.has(d.id)) {
              announced.current.add(d.id)
              play(d.dodgy ? 'error' : 'online')
            }
            return { ...d, bytes: d.total, state: 'done' }
          }
          return { ...d, bytes, speed: 900 + Math.random() * 5200 }
        })
      )
    }, 600)
    return () => window.clearInterval(timer)
  }, [downloads])

  // Anything that finishes lands in the shared folder, misnamed or not.
  useEffect(() => {
    const finished = downloads.filter((d) => d.state === 'done')
    if (finished.length === 0) return
    setLibrary((list) => {
      const have = new Set(list.map((f) => f.id))
      const added = finished
        .filter((d) => !have.has(`d${d.id}`))
        .map<LibraryFile>((d) => ({
          id: `d${d.id}`,
          name: d.name,
          size: mb(d.total),
          length: d.dodgy ? '0:11' : '3:48',
          dodgy: d.dodgy,
        }))
      return added.length ? [...list, ...added] : list
    })
  }, [downloads])

  const active = downloads.filter((d) => d.state !== 'done' && d.state !== 'failed').length
  const hint = useMemo(() => SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)], [])

  const openFile = (file: LibraryFile) => {
    play(file.dodgy ? 'error' : 'click')
    setPlaying(
      file.dodgy
        ? `Windows Media Player: ${file.name} — ${file.dodgy}.`
        : `Windows Media Player is opening ${file.name}...`
    )
  }

  const shown = results.filter(
    (r) => (!media || r.media === media) && (!artist || r.artist === artist)
  )
  const counts = {
    Audio: results.filter((r) => r.media === 'Audio').length,
    Video: results.filter((r) => r.media === 'Video').length,
    Programs: results.filter((r) => r.media === 'Programs').length,
  }
  const artistsHere = Array.from(new Set(results.map((r) => r.artist))).sort()
  const albumsHere = Array.from(new Set(results.map((r) => r.album))).sort()
  const chosen = results.find((r) => r.id === selected) ?? null
  const libraryTotal = library.reduce((sum, f) => sum + (parseFloat(f.size) || 0), 0)
  const searched = Boolean(submitted) || searching

  const MENUS: Record<string, string[]> = {
    File: ['Connect', 'Disconnect', 'Open Magnet or Torrent...', 'Recent Downloads', 'Exit'],
    View: ['Show/Hide', 'Icon Bar', 'Refresh', 'Status Bar'],
    Navigation: ['Switch to Search', 'Switch to Monitor', 'Switch to Library'],
    Resources: ['LimeWire Store', 'Free Legal Music', 'Donate'],
    Tools: ['Options...', 'Wizard...', 'Statistics'],
    Help: ['Using LimeWire', 'FAQ', 'Forum', 'About LimeWire...'],
  }

  return (
    <div className="lw" onClick={() => setMenu(null)}>
      <nav className="lw-menubar">
        {Object.keys(MENUS).map((name) => (
          <span key={name} className="lw-menu-wrap">
            <button
              className={menu === name ? 'open' : ''}
              onClick={(e) => {
                e.stopPropagation()
                setMenu(menu === name ? null : name)
              }}
              onMouseEnter={() => menu && setMenu(name)}
            >
              {name}
            </button>
            {menu === name ? (
              <ul className="lw-menu-drop" onClick={(e) => e.stopPropagation()}>
                {MENUS[name].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => {
                        setMenu(null)
                        if (item.startsWith('Switch to')) setTab(item.slice(10) as Tab)
                      }}
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </span>
        ))}
      </nav>

      <div className="lw-tabrow">
        {TABS.map((t) => (
          <button
            key={t}
            className={`lw-tab${t === tab ? ' active' : ''}`}
            onClick={() => setTab(t)}
          >
            <span className={`lw-tabicon ${t.toLowerCase()}`} aria-hidden />
            {t}
          </button>
        ))}
        <img className="lw-brand" src={asset("logos/limewire.png")} alt="LimeWire" />
      </div>

      {tab === 'Search' ? (
        <div className="lw-main">
          <div className="lw-left">
            {searched ? (
              <>
                <p className="lw-leftlabel">Filter Results:</p>
                <FilterBox title="Media">
                  <ul className="lw-medialist">
                    <li>
                      <button
                        className={media === null ? 'on' : ''}
                        onClick={() => setMedia(null)}
                      >
                        All ({Object.values(counts).filter(Boolean).length})
                      </button>
                    </li>
                    {(['Audio', 'Programs', 'Video'] as const).map((m) =>
                      counts[m] ? (
                        <li key={m}>
                          <button
                            className={media === m ? 'on' : ''}
                            onClick={() => setMedia(media === m ? null : m)}
                          >
                            <span className={`lw-mediaicon ${m.toLowerCase()}`} aria-hidden />
                            {m}
                          </button>
                        </li>
                      ) : null
                    )}
                  </ul>
                </FilterBox>

                <FilterBox title="Artist">
                  <ul className="lw-plainlist">
                    {artistsHere.map((a) => (
                      <li key={a}>
                        <button
                          className={artist === a ? 'on' : ''}
                          onClick={() => setArtist(artist === a ? null : a)}
                        >
                          {a}
                        </button>
                      </li>
                    ))}
                  </ul>
                </FilterBox>

                <FilterBox title="Album">
                  <ul className="lw-plainlist">
                    <li>
                      <button>All ({albumsHere.length})</button>
                    </li>
                    {albumsHere.map((a) => (
                      <li key={a}>
                        <button>{a}</button>
                      </li>
                    ))}
                  </ul>
                </FilterBox>

                <div className="lw-leftfoot">
                  <button className="lw-backbtn" onClick={backToSearch}>
                    Back To Search
                  </button>
                  <div className="lw-sponsor">+magnetmix.com+</div>
                </div>
              </>
            ) : (
              <>
                <p className="lw-leftlabel">Search for:</p>
                <div className="lw-searchpanel">
                  <input
                    className="lw-input"
                    value={query}
                    placeholder={hint}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && search()}
                    aria-label="Search for"
                  />
                  <label htmlFor="lw-t">Type:</label>
                  <select
                    id="lw-t"
                    className="lw-input"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    {TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <button
                    className="lw-searchbtn"
                    onClick={search}
                    disabled={!query.trim()}
                  >
                    Search
                  </button>
                </div>
                <div className="lw-leftfoot">
                  <div className="lw-sponsor">+magnetmix.com+</div>
                </div>
              </>
            )}
          </div>

          <div className="lw-right">
            <div className="lw-restabs">
              {submitted || searching ? (
                <span className="lw-restab">
                  <button
                    className="lw-restab-x"
                    onClick={backToSearch}
                    aria-label="Close this search"
                  />
                  <b>{submitted}</b> <i>({shown.length})</i>
                </span>
              ) : null}
            </div>

            <div className="lw-grid scroll">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 62 }}>Q...</th>
                    <th style={{ width: 34 }}>...</th>
                    <th style={{ width: 26 }}>...</th>
                    <th style={{ width: 22 }} className="lw-qmark">
                      ?
                    </th>
                    <th>Name</th>
                    <th style={{ width: 34 }}>...</th>
                    <th style={{ width: 60 }}>Size</th>
                    <th style={{ width: 70 }}>Sp...</th>
                    <th style={{ width: 34 }}>Bi...</th>
                  </tr>
                </thead>
                <tbody>
                  {searching ? (
                    <tr>
                      <td colSpan={9} className="lw-empty">
                        Searching the network...
                      </td>
                    </tr>
                  ) : !submitted ? (
                    <tr>
                      <td colSpan={9} className="lw-empty">
                        Type something in the box on the left and press Search.
                      </td>
                    </tr>
                  ) : shown.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="lw-empty">
                        No results match that filter.
                      </td>
                    </tr>
                  ) : (
                    shown.map((r) => (
                      <tr
                        key={r.id}
                        className={selected === r.id ? 'selected' : ''}
                        onClick={() => setSelected(r.id)}
                        onDoubleClick={() => startDownload(r)}
                        title={`${r.name}.${r.ext}`}
                      >
                        <td>
                          <span className="lw-stars" aria-label={`${r.quality} of 4`}>
                            {[0, 1, 2, 3].map((i) => (
                              <span key={i} className={i < r.quality ? 'on' : ''}>
                                ★
                              </span>
                            ))}
                          </span>
                        </td>
                        <td className="num">{r.sources > 1 ? r.sources : ''}</td>
                        <td />
                        <td>
                          <span className={`lw-filetype ${r.media.toLowerCase()}`} aria-hidden />
                        </td>
                        <td className="lw-name">{r.name}</td>
                        <td className="dim">{r.ext}</td>
                        <td className="num">{r.size}</td>
                        <td className="dim">{r.speed}</td>
                        <td className="num">{r.bitrate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {downloads.length ? (
              <div className="lw-transfers">
                <header>Downloads ({active} active)</header>
                <div className="lw-dl-list scroll">
                  {downloads.map((d) => {
                    const pct = Math.min(100, (d.bytes / d.total) * 100)
                    const remaining = Math.max(0, (d.total - d.bytes) / d.speed)
                    const status =
                      d.state === 'done'
                        ? d.dodgy ?? 'Finished'
                        : d.state === 'stalled'
                          ? 'Stalled — waiting for sources'
                          : d.state === 'queued'
                            ? 'Looking for sources...'
                            : `${kb(d.speed)}/s — ${
                                remaining > 3600
                                  ? `${Math.round(remaining / 3600)} hr left`
                                  : `${Math.max(1, Math.round(remaining / 60))} min left`
                              }`
                    return (
                      <div className="lw-dl" key={d.id}>
                        <span className="name" title={d.name}>
                          {d.name}
                        </span>
                        <span className="lw-bar">
                          <i style={{ width: `${pct}%` }} />
                        </span>
                        <span
                          className={`status${
                            d.state === 'done' ? (d.dodgy ? ' bad' : ' done') : ''
                          }`}
                        >
                          {status}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}

            <div className="lw-actions">
              <button
                disabled={!chosen}
                onClick={() => chosen && startDownload(chosen)}
                className={chosen ? 'live' : ''}
              >
                <DownloadGlyph />
                Download
              </button>
              <button disabled={!chosen} className={chosen ? 'live' : ''}>
                <BrowseGlyph />
                Browse Host
              </button>
              <button
                className={searching ? 'live' : ''}
                disabled={!searching}
                onClick={() => setSearching(false)}
              >
                <StopGlyph />
                Stop Search
              </button>
              <button disabled={!chosen} className={chosen ? 'live' : ''}>
                <JunkGlyph />
                Junk
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'Library' ? (
        <div className="lw-main">
          <div className="lw-left">
            <p className="lw-leftlabel">My Shared Files:</p>
            <FilterBox title="Folders">
              <ul className="lw-plainlist">
                <li>
                  <button className="on">My Music ({library.length})</button>
                </li>
                <li>
                  <button>My Documents (1)</button>
                </li>
                <li>
                  <button>Incomplete (0)</button>
                </li>
                <li>
                  <button>Saved Files</button>
                </li>
              </ul>
            </FilterBox>
            <div className="lw-leftfoot">
              <div className="lw-path">
                C:\Documents and Settings\
                <br />
                Owner\My Documents\My Music
              </div>
              <div className="lw-sponsor">+magnetmix.com+</div>
            </div>
          </div>

          <div className="lw-right">
            <div className="lw-restabs">
              <span className="lw-restab">
                <b>My Music</b> <i>({library.length})</i>
              </span>
            </div>
            <div className="lw-grid scroll">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 22 }} className="lw-qmark">
                      ?
                    </th>
                    <th>Name</th>
                    <th style={{ width: 62 }}>Size</th>
                    <th style={{ width: 54 }}>Length</th>
                    <th style={{ width: 220 }}>What it turned out to be</th>
                  </tr>
                </thead>
                <tbody>
                  {library.map((f) => (
                    <tr
                      key={f.id}
                      className={libSelected === f.id ? 'selected' : ''}
                      onClick={() => setLibSelected(f.id)}
                      onDoubleClick={() => openFile(f)}
                      title="Double-click to play"
                    >
                      <td>
                        <span className="lw-filetype audio" aria-hidden />
                      </td>
                      <td className="lw-name">{f.name}</td>
                      <td className="num">{f.size}</td>
                      <td className="num">{f.length}</td>
                      <td className={f.dodgy ? 'lw-bad' : 'dim'}>
                        {f.dodgy
                          ? f.dodgy
                          : f.preloaded
                            ? 'Fine, as far as anyone knows'
                            : 'The actual song'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="lw-transfers">
              <header>
                {library.length} files shared &nbsp;·&nbsp; {libraryTotal.toFixed(1)} MB
              </header>
              <div className="lw-dl-list lw-note">
                {playing ?? 'Double-click a file to open it in Windows Media Player.'}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {tab === 'Monitor' ? (
        <div className="lw-main">
          <div className="lw-left">
            <p className="lw-leftlabel">Connection:</p>
            <FilterBox title="Hosts">
              <ul className="lw-plainlist">
                <li>
                  <button className="on">81.104.22.7 — Modem</button>
                </li>
                <li>
                  <button>24.19.88.140 — Cable</button>
                </li>
                <li>
                  <button>195.42.6.19 — T1</button>
                </li>
                <li>
                  <button>68.37.201.3 — Modem</button>
                </li>
              </ul>
            </FilterBox>
            <div className="lw-leftfoot">
              <div className="lw-sponsor">+magnetmix.com+</div>
            </div>
          </div>

          <div className="lw-right">
            <div className="lw-restabs">
              <span className="lw-restab">
                <b>Uploads</b> <i>(2)</i>
              </span>
            </div>
            <div className="lw-grid scroll">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 22 }} className="lw-qmark">
                      ?
                    </th>
                    <th>Name</th>
                    <th style={{ width: 110 }}>To</th>
                    <th style={{ width: 150 }}>Progress</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span className="lw-filetype audio" aria-hidden />
                    </td>
                    <td className="lw-name">windows_xp_startup.wav</td>
                    <td className="dim">81.104.22.7</td>
                    <td>
                      <span className="lw-bar">
                        <i style={{ width: '64%' }} />
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span className="lw-filetype audio" aria-hidden />
                    </td>
                    <td className="lw-name">nokia ringtone (crazy frog remix).mp3</td>
                    <td className="dim">24.19.88.140</td>
                    <td>
                      <span className="lw-bar">
                        <i style={{ width: '12%' }} />
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="lw-transfers">
              <header>Upload slots: 2 of 3 in use</header>
              <div className="lw-dl-list lw-note">
                Someone in another country is taking your music very slowly.
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="lw-statusbar">
        <SignalBars />
        <GlobeGlyph />
        <span className="lw-shared">{library.length}</span>
        <a className="lw-pro">Purchase LimeWire PRO to help us make downloads faster.</a>
        <span className="lw-transport">
          <button aria-label="Previous">◄◄</button>
          <button aria-label="Play">►</button>
          <button aria-label="Pause">❚❚</button>
          <button aria-label="Stop">■</button>
          <button aria-label="Next">►►</button>
        </span>
        <span className="lw-playerbtn">LimeWire Media Player</span>
      </div>
    </div>
  )
}
