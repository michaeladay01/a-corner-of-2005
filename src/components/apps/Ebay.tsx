import { useEffect, useMemo, useRef, useState } from 'react'
import { play } from '../../lib/sounds'
import { LogoImg } from '../Icons'

/**
 * A recreation of the eBay homepage as it looked in 2005: the numbered
 * Find / Register / Buy panels, the yellow marketplace banner, star bullets and
 * a footer stuffed with country links. The listings are invented.
 */

type Listing = {
  id: string
  title: string
  price: number
  bids: number
  endsIn: number // seconds
  postage: number
  seller: string
  feedback: number
  category: string
  buyItNow?: number
  condition: string
  blurb: string
}

const CATEGORIES = [
  'All Categories',
  'Consumer Electronics',
  'Mobile Phones',
  'Video Games',
  'Music',
  'Collectables',
  'Clothes & Accessories',
]

const SELLERS = [
  ['steve_1986', 412],
  ['bargain**bazaar', 2184],
  ['n0rthern_deals', 97],
  ['tracys_attic', 1536],
  ['mint_condition_uk', 8891],
  ['dazza_sells', 3],
] as const

const CONDITIONS = ['Used', 'Used', 'New', 'New other (see details)', 'For parts or not working']

const BLURBS = [
  'Collection preferred but will post. CASH ON COLLECTION ONLY.',
  'Was my sons, barely used, selling as he never plays it.',
  'Any questions please ask. Smoke free home. Pet free home.',
  'Box has some wear but item itself is perfect. See photos.',
  'NO TIME WASTERS. Postage is £4.99 recorded delivery.',
  'Bought from Argos last year, receipt long gone sorry.',
]

const CATALOGUE: { title: string; category: string; price: number; bin?: number }[] = [
  { title: 'SONY WALKMAN CD PLAYER + ANTI SKIP *WORKING*', category: 'Consumer Electronics', price: 4.2 },
  { title: 'Nokia 3310 MOBILE PHONE UNLOCKED retro brick', category: 'Mobile Phones', price: 12.5, bin: 19.99 },
  { title: 'Motorola RAZR V3 PINK ** IMMACULATE **', category: 'Mobile Phones', price: 41, bin: 65 },
  { title: 'iPod Mini 4GB Silver - NO CHARGER', category: 'Consumer Electronics', price: 36 },
  { title: 'Nintendo GameCube + 2 pads + Mario Kart', category: 'Video Games', price: 28.5 },
  { title: 'XBOX LIVE 12 MONTH SUBSCRIPTION CARD', category: 'Video Games', price: 22, bin: 29.99 },
  { title: 'PSP 1000 + 1GB memory stick + case', category: 'Video Games', price: 71 },
  { title: 'Job lot 48 CD SINGLES 90s 00s chart indie', category: 'Music', price: 6.5 },
  { title: 'NOW Thats What I Call Music 59 - 2 x CD', category: 'Music', price: 1.04 },
  { title: 'Rare POG / Tazo collection 200+ in tube', category: 'Collectables', price: 9.99 },
  { title: 'Beanie Baby RETIRED with tag protector', category: 'Collectables', price: 3.2, bin: 8 },
  { title: 'Von Dutch trucker cap PINK genuine', category: 'Clothes & Accessories', price: 15.5 },
  { title: 'Juicy Couture velour tracksuit size 10', category: 'Clothes & Accessories', price: 24 },
  { title: 'Burberry style scarf check NEW', category: 'Clothes & Accessories', price: 7.5, bin: 12 },
  { title: 'Minidisc player Sharp + 10 discs', category: 'Consumer Electronics', price: 14 },
  { title: 'Tamagotchi Connexion v2 WORKING', category: 'Collectables', price: 11, bin: 18 },
]

const FEATURED = [
  'SAMURAI SWORD DISPLAY STAND -- NO SWORD',
  '3.9 ACRES WOODED PARCEL, ROAD ACCESS',
  'Warehouse Find! OLD UNOPENED FOOTBALL STICKER BOXES',
  '0001: CARRIAGE CLOCK circa 1891, height 4 in',
  '1999 RIDE ON MOWER 1128 HOURS 48"',
  'SONY VAIO PCG P4 2.4GHz LAPTOP NOTEBOOK',
]

const COUNTRIES = [
  'Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada', 'China', 'France',
  'Germany', 'Hong Kong', 'India', 'Ireland', 'Italy', 'Korea', 'Malaysia', 'Mexico',
  'Netherlands', 'New Zealand', 'Philippines', 'Poland', 'Singapore', 'Spain', 'Sweden',
  'Switzerland', 'Taiwan', 'United Kingdom',
]

function hash(text: string) {
  let h = 11
  for (const c of text) h = (h * 33 + c.charCodeAt(0)) % 99991
  return h
}

function buildListings(): Listing[] {
  return CATALOGUE.map((c, i) => {
    const n = hash(c.title) + i * 131
    const [seller, feedback] = SELLERS[n % SELLERS.length]
    return {
      id: `l${i}`,
      title: c.title,
      category: c.category,
      price: c.price,
      bids: n % 23,
      // Everything ends at an awkward hour of the night.
      endsIn: 300 + (n % 5) * 3600 + (n % 47) * 60,
      postage: [2.5, 3.5, 4.99, 5.99, 0][n % 5],
      seller,
      feedback,
      condition: CONDITIONS[n % CONDITIONS.length],
      blurb: BLURBS[n % BLURBS.length],
      buyItNow: c.bin,
    }
  })
}

function money(n: number) {
  return `£${n.toFixed(2)}`
}

function countdown(seconds: number) {
  if (seconds <= 0) return 'Ended'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (d) return `${d}d ${h}h`
  if (h) return `${h}h ${m}m`
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

export function Ebay() {
  const [page, setPage] = useState<'home' | 'results' | 'item'>('home')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [listings, setListings] = useState<Listing[]>(() => buildListings())
  const [openId, setOpenId] = useState<string | null>(null)
  const [watching, setWatching] = useState<Set<string>>(new Set())
  const [bid, setBid] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [signedIn, setSignedIn] = useState(false)
  const [now, setNow] = useState(Date.now())
  const outbid = useRef<Set<string>>(new Set())

  // Clocks everywhere, all counting down.
  useEffect(() => {
    const t = window.setInterval(() => {
      setNow(Date.now())
      setListings((list) => list.map((l) => ({ ...l, endsIn: Math.max(0, l.endsIn - 1) })))
    }, 1000)
    return () => window.clearInterval(t)
  }, [])

  // Somebody always comes in over the top of you with nine seconds left.
  useEffect(() => {
    const t = window.setInterval(() => {
      setListings((list) =>
        list.map((l) => {
          if (l.endsIn <= 0 || Math.random() > 0.12) return l
          const bumped = { ...l, price: Math.round((l.price * 1.08 + 0.5) * 100) / 100, bids: l.bids + 1 }
          if (outbid.current.has(l.id)) {
            setNotice(`You have been outbid on ${l.title.slice(0, 40)}...`)
          }
          return bumped
        })
      )
    }, 7000)
    return () => window.clearInterval(t)
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return listings.filter((l) => {
      const inCat = category === CATEGORIES[0] || l.category === category
      const match = !q || l.title.toLowerCase().includes(q)
      return inCat && match
    })
  }, [listings, query, category])

  const item = listings.find((l) => l.id === openId) ?? null

  const search = () => {
    setPage('results')
  }

  const open = (l: Listing) => {
    setOpenId(l.id)
    setBid((l.price + 0.5).toFixed(2))
    setPage('item')
  }

  const placeBid = () => {
    if (!item) return
    const amount = Number(bid)
    if (!signedIn) {
      play('error')
      setNotice('You must be registered to bid or buy. Registration is fast, easy and free.')
      return
    }
    if (!Number.isFinite(amount) || amount <= item.price) {
      play('error')
      setNotice(`Your bid must be at least ${money(item.price + 0.5)}.`)
      return
    }
    outbid.current.add(item.id)
    setListings((list) =>
      list.map((l) => (l.id === item.id ? { ...l, price: amount, bids: l.bids + 1 } : l))
    )
    setNotice(`You are the highest bidder on this item at ${money(amount)}.`)
  }

  const toggleWatch = (id: string) => {
    setWatching((w) => {
      const next = new Set(w)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const stamp = new Date(now).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <div className="bz">
      <div className="bz-head">
        <button className="bz-logo" onClick={() => { setPage('home') }}>
          {/* Same file as the desktop icon, falling back to the lettering. */}
          <LogoImg name="ebay" size={112} height={50}>
            <span className="bz-logo-text">
              <span className="l-e">e</span>
              <span className="l-b">b</span>
              <span className="l-a">a</span>
              <span className="l-y">Y</span>
              <i>®</i>
            </span>
          </LogoImg>
        </button>

        <div className="bz-head-mid">
          <div className="bz-head-links">
            <a onClick={() => setPage('home')}>home</a> | <a>pay</a> |{' '}
            <a onClick={() => { setSignedIn(true); setNotice('Registration complete. Welcome to eBay.') }}>
              register
            </a>{' '}
            | <a>services</a> | <a>site map</a>
          </div>
          <div className="bz-tabs">
            {['Buy', 'Sell', 'My eBay', 'Community', 'Help'].map((t) => (
              <button
                key={t}
                onClick={() => {
                  if (t === 'Buy') setPage('results')
                  else setNotice('')
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="bz-hello">
            Hello!{' '}
            <a onClick={() => { setSignedIn(!signedIn); setNotice(signedIn ? 'You have signed out.' : 'You are signed in as player_uk.') }}>
              Sign {signedIn ? 'out' : 'in'}
            </a>
            .
          </div>
        </div>

        <div className="bz-head-search">
          <div>
            <input
              value={query}
              placeholder="Start new search"
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
            />
            <button onClick={search}>Search</button>
          </div>
          <a onClick={search}>Advanced Search</a>
          <div className="bz-badges" aria-hidden>
            <span className="bz-java">
              Java<sup>&trade;</sup>
              <em>TECHNOLOGY</em>
            </span>
            <span className="bz-sun">
              <i>POWERED BY</i>
              <b>&#9670; Sun</b>
            </span>
          </div>
        </div>
      </div>

      <div className="bz-banner">
        <span className="bz-slogan">The World&rsquo;s Online Marketplace&reg;</span>
        <span className="bz-banner-mid">
          Already registered? <a onClick={() => { setSignedIn(true); setNotice('You are signed in as player_uk.') }}>Click here</a>
        </span>
        <span className="bz-help">? Live Help</span>
      </div>

      {notice ? (
        <div className="bz-notice">
          {notice}
          <button onClick={() => setNotice(null)}>close</button>
        </div>
      ) : null}

      <div className="bz-body scroll">
        {page === 'home' ? (
          <>
            <div className="bz-steps">
              <section className="bz-step">
                <header>
                  <b>1</b> Find
                </header>
                <div>
                  <p className="bz-label">What are you looking for?</p>
                  <p>
                    <input value={query} onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && search()} />{' '}
                    <button onClick={search}>Search</button>
                  </p>
                  <p className="bz-label">Browse for an item</p>
                  <p>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                      {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </p>
                  <p>
                    <button onClick={search}>Go</button>
                  </p>
                  <p className="bz-specialty">
                    Specialty Sites: <a>eBay Motors</a> | <a>eBay Stores</a>
                  </p>
                  <p className="bz-howto">
                    <span className="bz-speaker" /> <a>How to Search</a>
                  </p>
                </div>
              </section>

              <section className="bz-step">
                <header>
                  <b>2</b> Register
                </header>
                <div className="bz-centre">
                  <p>
                    <strong>It&rsquo;s fast, easy, and free.</strong>
                    <br />
                    You must register to bid or buy.
                  </p>
                  <button
                    className="bz-register"
                    onClick={() => {
                      setSignedIn(true)
                      setNotice('Registration complete. Welcome to eBay.')
                    }}
                  >
                    REGISTER
                  </button>
                  <p className="bz-howto">
                    <span className="bz-speaker" /> <a>How to Register</a>
                  </p>
                </div>
              </section>

              <section className="bz-step">
                <header>
                  <b>3</b> Buy
                </header>
                <div>
                  <p>
                    <strong>Buy it Now.</strong>
                    <br />
                    You won&rsquo;t have to wait for the auction to end &ndash; purchase your item
                    instantly.
                  </p>
                  <p>
                    <strong>Place a Bid</strong>.
                    <br />
                    Enter the maximum amount you want to spend; eBay bids for you, up to your
                    limit. Pay with <span className="bz-paypal" />
                    <sup>&reg;</sup> the fast, easy and secure way to pay.
                  </p>
                  <p className="bz-howto">
                    <span className="bz-speaker" /> <a>How to Bid and Buy</a>
                  </p>
                </div>
              </section>
            </div>

            <div className="bz-lower">
              <section className="bz-box bz-global">
                <header>
                  <span className="bz-grip" /> Global Sites
                </header>
                <div>
                  <p>Shop around the world</p>
                  <p>
                    <select>
                      <option>Select One...</option>
                      {COUNTRIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>{' '}
                    <button onClick={() => { setNotice('Connecting to that eBay site...') }}>Go</button>
                  </p>
                  <p>
                    Learn about <a>Global Trade</a>
                  </p>
                </div>
              </section>

              <section className="bz-box bz-featured">
                <header>
                  <span className="bz-grip" /> Featured Items
                  <a className="bz-learn">Learn how</a>
                </header>
                <ul>
                  {FEATURED.map((f) => (
                    <li key={f}>
                      <span className="bz-star">★</span>
                      <a onClick={() => { setQuery(''); setPage('results') }}>{f}</a>
                    </li>
                  ))}
                </ul>
                <div className="bz-seeall">
                  <a onClick={() => setPage('results')}>See all featured items...</a>
                </div>
              </section>
            </div>
          </>
        ) : null}

        {page === 'results' ? (
          <div className="bz-results">
            <h2>
              {query ? `${query} ` : 'All items '}
              <span>({results.length} items found)</span>
            </h2>
            <div className="bz-filters">
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <input value={query} placeholder="Refine search" onChange={(e) => setQuery(e.target.value)} />
              <button onClick={search}>Search</button>
            </div>
            <table className="bz-table">
              <thead>
                <tr>
                  <th className="bz-pic">&nbsp;</th>
                  <th>Item Title</th>
                  <th style={{ width: 74 }}>Price</th>
                  <th style={{ width: 46 }}>Bids</th>
                  <th style={{ width: 92 }}>Time Left</th>
                </tr>
              </thead>
              <tbody>
                {results.map((l) => (
                  <tr key={l.id}>
                    <td className="bz-pic">
                      <span className="bz-thumb" />
                    </td>
                    <td>
                      <a onClick={() => open(l)}>{l.title}</a>
                      {l.buyItNow ? <span className="bz-bin">Buy it Now</span> : null}
                      <div className="bz-sub">
                        {l.condition} &middot; P&amp;P {l.postage ? money(l.postage) : 'FREE'}
                      </div>
                    </td>
                    <td className="bz-price">{money(l.price)}</td>
                    <td>{l.bids}</td>
                    <td className={l.endsIn < 3600 ? 'bz-ending' : ''}>{countdown(l.endsIn)}</td>
                  </tr>
                ))}
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 12 }}>
                      0 items found for <strong>{query}</strong>. Try broadening your search.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        ) : null}

        {page === 'item' && item ? (
          <div className="bz-item">
            <div className="bz-crumbs">
              <a onClick={() => setPage('results')}>Back to list of items</a>
              {' | '}
              <a onClick={() => setPage('home')}>Home</a>
            </div>
            <h2>{item.title}</h2>
            <div className="bz-item-cols">
              <div className="bz-item-pic">
                <span className="bz-thumb bz-thumb-big" />
                <div className="bz-enlarge">Enlarge picture</div>
              </div>

              <div className="bz-item-bid">
                <table>
                  <tbody>
                    <tr>
                      <th>Current bid:</th>
                      <td className="bz-price">{money(item.price)}</td>
                    </tr>
                    {item.buyItNow ? (
                      <tr>
                        <th>Buy it Now:</th>
                        <td>
                          {money(item.buyItNow)}{' '}
                          <button
                            onClick={() => {
                              if (!signedIn) {
                                play('error')
                                setNotice('You must be registered to bid or buy.')
                                return
                              }
                              setNotice(`You bought ${item.title.slice(0, 40)}... for ${money(item.buyItNow!)}.`)
                            }}
                          >
                            Buy it Now
                          </button>
                        </td>
                      </tr>
                    ) : null}
                    <tr>
                      <th>Time left:</th>
                      <td className={item.endsIn < 3600 ? 'bz-ending' : ''}>
                        {countdown(item.endsIn)}
                      </td>
                    </tr>
                    <tr>
                      <th>Bids:</th>
                      <td>
                        {item.bids} <a>bid history</a>
                      </td>
                    </tr>
                    <tr>
                      <th>Postage:</th>
                      <td>{item.postage ? money(item.postage) : 'FREE'}</td>
                    </tr>
                    <tr>
                      <th>Condition:</th>
                      <td>{item.condition}</td>
                    </tr>
                    <tr>
                      <th>Seller:</th>
                      <td>
                        <a>{item.seller}</a> ({item.feedback}) <span className="bz-star">★</span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="bz-bidbox">
                  <label>
                    Your maximum bid: £
                    <input value={bid} onChange={(e) => setBid(e.target.value)} />
                  </label>
                  <button className="bz-placebid" onClick={placeBid}>
                    Place Bid &gt;
                  </button>
                  <button onClick={() => toggleWatch(item.id)}>
                    {watching.has(item.id) ? 'Watching ✓' : 'Watch this item'}
                  </button>
                  <p className="bz-small">
                    eBay automatically bids on your behalf up to your maximum.
                  </p>
                </div>
              </div>
            </div>

            <section className="bz-box">
              <header>
                <span className="bz-grip" /> Description
              </header>
              <div className="bz-desc">
                <p>{item.blurb}</p>
                <p>
                  Payment: PayPal, cheque or postal order. Items posted within 3 working days of
                  cleared payment. Happy bidding!!
                </p>
              </div>
            </section>
          </div>
        ) : null}
      </div>

      <div className="bz-footer">
        <div className="bz-countries">
          {COUNTRIES.map((c, i) => (
            <span key={c}>
              <a>{c}</a>
              {i < COUNTRIES.length - 1 ? ' | ' : ''}
            </span>
          ))}
        </div>
        <div className="bz-footlinks">
          <a>Feedback Forum</a> | <a>eBay Toolbar</a> | <a>Downloads</a> |{' '}
          <a>Gift Certificates</a> | <a>Jobs</a> | <a>Affiliates</a> | <a>Developers</a>
        </div>
        <div className="bz-footlinks">
          <a>About eBay</a> | <a>Announcements</a> | <a>Security Centre</a> | <a>Policies</a> |{' '}
          <a>Site Map</a> | <a>Help</a>
        </div>
        <p className="bz-copy">
          Copyright &copy; 1995&ndash;2005 eBay Inc. All Rights Reserved. Designated trademarks and
          brands are the property of their respective owners. Use of this Web site constitutes
          acceptance of the eBay User Agreement and Privacy Policy.
        </p>
        <p className="bz-time">
          <a>eBay official time</a> &ndash; Page last updated: {stamp}
        </p>
      </div>
    </div>
  )
}
