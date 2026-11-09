import { useState } from 'react'
import { LogoImg } from '../Icons'

/* The Apple Store as it looked in 2005: the brushed-metal tab bar, the big
   pink iPod mini banner, rows of product shots with "from $499" prices, and
   two columns of grey-headed boxes down either side. */

const TABS = ['Store', 'iPod + iTunes', '.Mac', 'QuickTime', 'Support', 'Mac OS X']

const SUB = ['Your Account', 'View Cart', 'Saved Carts', 'Order Status', 'Help']

const SIDE: { head: string; items: string[] }[] = [
  { head: 'iPod', items: ['iPod', 'iPod mini', 'iPod photo', 'iPod shuffle', 'iPod U2'] },
  {
    head: 'iPod Accessories',
    items: [
      'Armbands',
      'Cables & Docks',
      'Car Audio',
      'Cases',
      'Extras',
      'Headphones',
      'Power',
      'Speakers',
    ],
  },
  {
    head: 'Macintosh',
    items: [
      'eMac',
      'iBook',
      'iMac',
      'Mac mini',
      'Power Mac G5',
      'PowerBook',
      'Xserve G5',
      'Xserve RAID',
    ],
  },
  {
    head: 'Mac Accessories',
    items: [
      'Mac Top Sellers',
      'AirPort & Wireless',
      'AppleCare & Services',
      'Audio & Speakers',
      'Digital Cameras & Video',
      'Displays',
      'iSight',
      'Memory',
      'Mice & Keyboards',
      'Portable Gear',
      'Printers',
      'Software',
      'Storage',
      'More Accessories...',
    ],
  },
  { head: 'Gift Center', items: ['iPod gift sets', 'iTunes Music Cards'] },
]

const RIGHT: { head: string; items: string[] }[] = [
  {
    head: 'More Stores',
    items: ['Education', 'Business', 'Government', 'International'],
  },
  {
    head: 'Top Sellers',
    items: [
      'iPod mini',
      'iPod shuffle',
      'iPod 20GB',
      'iTunes Gift Certificate',
      'iTunes Music Store Card',
      'iPod FireWire Cable',
      'iPod Power Adapter',
      'AppleCare for iPod',
      'iPod shuffle Arm Band',
      'iPod photo',
    ],
  },
  {
    head: 'New to the Store',
    items: [
      'iPod photo',
      'iPod mini',
      'Logitech Rumblepad 2',
      'Mini Pilot Wireless Mouse',
      'EyeTV 500 HDTV DVR',
    ],
  },
  {
    head: 'Buying Guides',
    items: ['iLife ’05', 'Take Pictures', 'Hear Music', 'Create Music', 'Make Movies'],
  },
]

const PORTABLES = [
  { size: '12-inch', family: 'iBook' },
  { size: '14-inch', family: 'iBook' },
  { size: '12-inch', family: 'PowerBook' },
  { size: '15-inch', family: 'PowerBook' },
  { size: '17-inch', family: 'PowerBook' },
]

const DESKTOPS = [
  { name: 'Mac mini', price: 'from $499', art: 'mini' },
  { name: 'eMac', price: 'from $799', art: 'emac' },
  { name: 'iMac', price: 'from $1299', art: 'imac' },
  { name: 'Power Mac', price: 'from $1499', art: 'tower' },
]

const IPODS = [
  { name: 'iPod shuffle', price: 'from $99', art: 'shuffle' },
  { name: 'iPod mini', price: 'from $199', art: 'mini' },
  { name: 'iPod', price: 'just $299', art: 'white' },
  { name: 'iPod U2', price: 'just $349', art: 'u2' },
  { name: 'iPod photo', price: 'from $349', art: 'photo' },
]

const SOFTWARE = [
  { name: 'iLife ’05', tint: '#5aa83a' },
  { name: 'iWork ’05', tint: '#e8b820' },
  { name: 'Final Cut Express HD', tint: '#2a2a2a' },
  { name: 'Jam Pack Series', tint: '#c8b89a' },
  { name: 'Mac OS X Panther', tint: '#1a1a1a' },
]

/* The Aqua desktop picture, which was on every screen Apple ever printed. */
function Screen({ w, h }: { w: number; h: number }) {
  return (
    <span className="ap-screen" style={{ width: w, height: h }}>
      <span className="ap-aqua" />
    </span>
  )
}

function Laptop({ size, wide }: { size: string; wide: boolean }) {
  return (
    <figure className="ap-laptop">
      <figcaption className="ap-inch">{size}</figcaption>
      <span className="ap-lid" style={{ width: wide ? 104 : 86 }}>
        <Screen w={wide ? 92 : 74} h={wide ? 58 : 48} />
      </span>
      <span className="ap-base" style={{ width: wide ? 116 : 96 }} />
    </figure>
  )
}

function Desktop({ art }: { art: string }) {
  if (art === 'mini') {
    return (
      <span className="ap-macmini">
        <i />
      </span>
    )
  }
  if (art === 'emac') {
    return (
      <span className="ap-emac">
        <Screen w={62} h={48} />
      </span>
    )
  }
  if (art === 'imac') {
    return (
      <span className="ap-imac">
        <Screen w={78} h={56} />
        <i />
        <u />
      </span>
    )
  }
  return (
    <span className="ap-tower">
      <i />
    </span>
  )
}

function Ipod({ art }: { art: string }) {
  if (art === 'shuffle') return <span className="ap-ipod ap-shuffle" />
  if (art === 'mini') {
    return (
      <span className="ap-minis">
        {['#b8c4d0', '#d8d0a8', '#c8a8c8', '#a8c8b0'].map((c) => (
          <span key={c} className="ap-ipod ap-ipodmini" style={{ background: c }}>
            <b />
            <i />
          </span>
        ))}
      </span>
    )
  }
  return (
    <span className={`ap-ipod ap-full${art === 'u2' ? ' u2' : ''}`}>
      <b />
      <i />
    </span>
  )
}

export function Apple() {
  const [tab, setTab] = useState('Store')
  const [search, setSearch] = useState('')
  const [note, setNote] = useState<string | null>(null)
  const [cart, setCart] = useState<string[]>([])

  const add = (name: string, price: string) => {
    setCart((c) => [...c, name])
    setNote(`${name} ${price} added to your cart.`)
  }

  return (
    <div className="ap">
      {/* The brushed-metal tab strip, with the Apple itself on the left. */}
      <div className="ap-tabs">
        <button
          className={`ap-tab ap-apple${tab === 'apple' ? ' on' : ''}`}
          onClick={() => setTab('apple')}
          title="Apple"
        >
          <LogoImg name="apple" size={20} height={23}>
            <svg width="20" height="23" viewBox="0 0 100 118" xmlns="http://www.w3.org/2000/svg">
              {/* The leaf, tilted right off the top of the apple. */}
              <path d="M62.5 0 C73 1.5 80.5 8 82 18 C71.5 17 63 10.5 61 0.5 z"
                fill="#1a1a1a" transform="rotate(14 62 9)" />
              {/* The body, with the bite out of the right-hand side. */}
              <path d="M82 40.5 C74 45 69 53 69 63 C69 74.5 76 82 85 85.5 C83.5 90 81.5 94.5 78.5 99 C74.5 105 70 112 63 112 C56.5 112 54 108 46.5 108 C39 108 36 112 30 112 C23.5 112 18.5 105 14.5 99 C6 86.5 2 69 8 56.5 C12.5 47 21 41 30 41 C37 41 42.5 45.5 47.5 45.5 C52 45.5 58.5 40.5 67 40.5 C71 40.5 77.5 41.5 82 40.5 z"
                fill="#1a1a1a" />
            </svg>
          </LogoImg>
        </button>
        {TABS.map((t) => (
          <button
            key={t}
            className={`ap-tab${tab === t ? ' on' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="ap-subnav">
        {SUB.map((s) => (
          <a
            key={s}
            onClick={() =>
              setNote(
                s === 'View Cart'
                  ? cart.length
                    ? `Your cart: ${cart.join(', ')}.`
                    : 'Your cart is empty.'
                  : ''
              )
            }
          >
            {s}
          </a>
        ))}
      </div>

      {note ? (
        <div className="ap-note">
          {note}
          <button onClick={() => setNote(null)}>close</button>
        </div>
      ) : null}

      <div className="ap-body scroll">
        {/* Left column */}
        <aside className="ap-left">
          <h1>Apple Store</h1>
          <div className="ap-search">
            <input
              value={search}
              placeholder="Search"
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' &&
                setNote(search.trim() ? `Your search returned no results.` : 'Please enter a search term.')
              }
            />
            <button
              className="ap-mag"
              onClick={() =>
                setNote(search.trim() ? `Your search returned no results.` : 'Please enter a search term.')
              }
              title="Search"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
                <circle cx="6" cy="6" r="4.4" fill="#cfe4f6" stroke="#4a6a8a" strokeWidth="1.5" />
                <path d="M9.4 9.4 L13.4 13.4" stroke="#4a6a8a" strokeWidth="2.2"
                  strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {SIDE.map((group) => (
            <nav key={group.head} className="ap-group">
              <h2>{group.head}</h2>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>
                    <a onClick={() => {}}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="ap-promo">
            <strong>Read all about it.</strong>
            <span className="ap-news">EXTRA EXTRA</span>
            <p>Get your Apple Store eNews right here.</p>
          </div>

          <div className="ap-promo">
            <strong>Education Discounts</strong>
            <span className="ap-ipod ap-full tiny">
              <b />
              <i />
            </span>
            <p>Use your student discount on a new iPod or iPod mini.</p>
          </div>
        </aside>

        {/* Middle column */}
        <main className="ap-mid">
          {/* The pink iPod mini banner. */}
          <div className="ap-hero">
            <span className="ap-hero-pod">
              <span className="ap-pod-screen">
                <b>iPod mini</b>
                <i className="on">Music</i>
                <i>Extras</i>
                <i>Settings</i>
                <i>Shuffle Songs</i>
                <i>Backlight</i>
              </span>
              <span className="ap-wheel">
                <em>MENU</em>
                <u />
              </span>
            </span>
            <div className="ap-hero-copy">
              <h2>
                iPod <span>mini</span>
              </h2>
              <p>
                Introducing a new 6GB model.
                <br />
                Up to eighteen hour battery life.
                <br />
                And a great new starting price.
              </p>
              <p className="ap-prices">
                4GB 1,000 songs $199
                <br />
                6GB 1,500 songs $249
              </p>
              <p className="ap-pcmac">PC + Mac</p>
              <button className="ap-ship" onClick={() => add('iPod mini 4GB', '$199')}>
                Free Shipping. Order Now <span className="ap-arrow" />
              </button>
            </div>
          </div>

          <h3 className="ap-sec">Portables</h3>
          <div className="ap-row ap-portables">
            {PORTABLES.map((p, i) => (
              <Laptop key={i} size={p.size} wide={p.family === 'PowerBook'} />
            ))}
          </div>
          <div className="ap-row ap-portable-labels">
            <span>
              <b>iBook</b> from $999
            </span>
            <span>
              <b>PowerBook</b> from $1499
            </span>
          </div>

          <h3 className="ap-sec">Desktops</h3>
          <div className="ap-row">
            {DESKTOPS.map((d) => (
              <figure key={d.name} className="ap-product">
                <Desktop art={d.art} />
                <figcaption>
                  <button onClick={() => add(d.name, d.price)}>{d.name}</button>
                  <span>{d.price}</span>
                </figcaption>
              </figure>
            ))}
          </div>

          {/* The silhouette banner, which was everywhere that year. */}
          <div className="ap-ipodstore">
            <header>
              iPod Store
              <span className="ap-silhouette" aria-hidden />
            </header>
            <div className="ap-row">
              {IPODS.map((p) => (
                <figure key={p.name} className="ap-product">
                  <Ipod art={p.art} />
                  <figcaption>
                    <button onClick={() => add(p.name, p.price)}>{p.name}</button>
                    <span>{p.price}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>

          <h3 className="ap-sec">Essentials</h3>
          <div className="ap-row ap-essentials">
            <figure className="ap-product">
              <span className="ap-keyboard" />
              <figcaption>
                <button onClick={() => add('Mice & Keyboards', '')}>Mice &amp; Keyboards</button>
              </figcaption>
            </figure>
            <figure className="ap-product">
              <span className="ap-dotmac" />
              <figcaption>
                <button onClick={() => add('.Mac', '')}>.Mac</button>
              </figcaption>
            </figure>
            <figure className="ap-product">
              <span className="ap-airport" />
              <figcaption>
                <button onClick={() => add('AirPort Express', '')}>Wireless</button>
              </figcaption>
            </figure>
            <figure className="ap-product">
              <span className="ap-display">
                <Screen w={92} h={58} />
                <i />
              </span>
              <figcaption>
                <button onClick={() => add('Cinema Display', 'from $999')}>Displays</button>
                <span>from $999</span>
              </figcaption>
            </figure>
          </div>
          <p className="ap-more">
            <a onClick={() => {}}>
              More Mac Accessories &gt;
            </a>
          </p>

          <h3 className="ap-sec">Apple Software</h3>
          <div className="ap-row">
            {SOFTWARE.map((sw) => (
              <figure key={sw.name} className="ap-product">
                <span className="ap-box" style={{ background: sw.tint }}>
                  <b>{sw.name.split(' ')[0]}</b>
                </span>
                <figcaption>
                  <button onClick={() => add(sw.name, '')}>{sw.name}</button>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="ap-more">
            <a onClick={() => {}}>
              More Apple Software &gt;
            </a>
          </p>

          <div className="ap-deals">
            <div>
              <h4>Studio MX</h4>
              <p>Save $600 when you buy a Power Mac or PowerBook</p>
            </div>
            <div>
              <h4>Microsoft Office 2004</h4>
              <span className="ap-officeboxes">
                <i style={{ background: '#d8d0bc' }} />
                <i style={{ background: '#e8c84a' }} />
                <i style={{ background: '#2a2a2a' }} />
              </span>
            </div>
            <div>
              <h4>Print out Cash in.</h4>
              <p>Buy a Mac and get an Epson C86 free after mail-in rebate.</p>
            </div>
          </div>

          <div className="ap-worldwide">
            <p>Visit other Apple stores around the world:</p>
            <select
              defaultValue=""
              onChange={(e) => setNote(e.target.value ? `Connecting to the ${e.target.value} store...` : '')}
            >
              <option value="">Choose...</option>
              {['United Kingdom', 'Ireland', 'France', 'Germany', 'Japan', 'Australia'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <footer className="ap-foot">
            <p>
              You can also order from The Apple Store by calling 1-800-MY-APPLE.
              <br />
              (1-800-692-7753)
            </p>
            <p>
              <a>Sales and Refunds</a> | <a>Terms of Use</a> | <a>Privacy Policy</a> |{' '}
              <a>Contact Us</a>
            </p>
            <p>Copyright &copy; 2005 Apple Computer, Inc. All rights reserved.</p>
          </footer>
        </main>

        {/* Right column */}
        <aside className="ap-right">
          <div className="ap-welcome">
            <h2>Welcome</h2>
            <p>
              <a onClick={() => {}}>
                Sign in or create your own personal account
              </a>
            </p>
            <p>
              <a onClick={() => {}}>
                Sign up for 1-Click
              </a>
            </p>
            <hr />
            <p className="ap-order">Order online or call</p>
            <p className="ap-phone">1-800-MY-APPLE</p>
            <p className="ap-phone2">(1-800-692-7753)</p>
          </div>

          {RIGHT.map((group) => (
            <nav key={group.head} className="ap-group">
              <h2>{group.head}</h2>
              <ul>
                {group.items.map((item) => (
                  <li key={item}>
                    <a onClick={() => {}}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="ap-promo">
            <strong>
              Looking for a great deal?
            </strong>
            <span className="ap-save">SAVE</span>
            <p>
              Get Special Deals on Sale products featuring the PowerBook G4 1.33GHz 12&quot; with
              SuperDrive for only $1,499.
            </p>
          </div>

          <div className="ap-promo">
            <strong>Our Price Matching Policy.</strong>
            <p>Click here or call 800-MY-APPLE to learn more.</p>
          </div>

          <div className="ap-promo">
            <strong>90 days same-as-cash financing</strong>
            <p>
              <a onClick={() => {}}>
                Apply now
              </a>{' '}
              for the Apple Credit Account
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
