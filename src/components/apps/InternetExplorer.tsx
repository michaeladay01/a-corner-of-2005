import { useEffect, useRef, useState } from 'react'
import { IeIcon, LogoImg, IeTool } from '../Icons'
import { Ebay } from './Ebay'
import { YouTube } from './YouTube'
import { Yahoo } from './Yahoo'
import { Apple } from './Apple'
import { AddictingGames } from './AddictingGames'
import { play } from '../../lib/sounds'
import { useDispatch } from '../../state/store'

type Page = {
  url: string
  title: string
  render: (go: (url: string) => void, openHotmail: () => void) => React.ReactNode
}

const HOME = 'http://www.google.co.uk/'
const ABOUT = 'http://www.google.co.uk/about.html'

/* The sites in the Favorites menu. Each renders straight into the browser's
   viewport, so Back, Forward and the address bar work across all of them. */
export const FAVOURITES: { url: string; title: string }[] = [
  { url: 'http://www.ebay.co.uk/', title: 'eBay' },
  { url: 'http://www.youtube.com/', title: 'YouTube' },
  { url: 'http://www.yahoo.com/', title: 'Yahoo!' },
  { url: 'http://www.apple.com/store/', title: 'Apple Store' },
  { url: 'http://www.addictinggames.com/', title: 'AddictingGames' },
]

const PAGES: Page[] = [
  { url: 'http://www.ebay.co.uk/', title: 'eBay', render: () => <Ebay /> },
  { url: 'http://www.youtube.com/', title: 'YouTube', render: () => <YouTube /> },
  { url: 'http://www.yahoo.com/', title: 'Yahoo!', render: () => <Yahoo /> },
  { url: 'http://www.apple.com/store/', title: 'Apple Store', render: () => <Apple /> },
  {
    url: 'http://www.addictinggames.com/',
    title: 'AddictingGames',
    render: () => <AddictingGames />,
  },
  {
    url: ABOUT,
    title: 'About Google',
    render: (go, openHotmail) => (
      <div className="gg">
        <div className="gg-top">
          <span className="gg-about">About</span>
          <LogoImg name="google" size={176} height={58}>
            <span className="gg-logo">
              <b className="c1">G</b><b className="c2">o</b><b className="c3">o</b>
              <b className="c1">g</b><b className="c4">l</b><b className="c3">e</b>
              <sup>&trade;</sup>
            </span>
          </LogoImg>
          <span className="gg-search">
            <input defaultValue="" />
            <button onClick={() => go('http://search.msn.co.uk/')}>Search our site</button>
          </span>
        </div>

        <div className="gg-body">
          <div className="gg-side">
            <div className="gg-promo gg-blue">
              <h4>Google Desktop Search for Enterprise</h4>
              <span className="gg-promo-art gg-art-swirl" />
              <p>Find your email, files <a>and more</a>.</p>
            </div>
            <div className="gg-promo gg-green">
              <h4>What&rsquo;s up with Google?</h4>
              <span className="gg-promo-art gg-art-blog" />
              <p>Check our <a>Google Blog</a>.</p>
            </div>
            <div className="gg-promo gg-blue">
              <h4>Google Code</h4>
              <span className="gg-promo-art gg-art-code" />
              <p>Check out Google&rsquo;s open source <a>projects &amp; APIs</a>.</p>
            </div>
            <div className="gg-promo gg-red">
              <h4>Google Mobile</h4>
              <span className="gg-promo-art gg-art-phone" />
              <p>Looking for a restaurant? Find it with your <a>phone</a>.</p>
            </div>
            <div className="gg-promo gg-green">
              <h4>My Search History</h4>
              <span className="gg-promo-art gg-art-glass" />
              <p>Access and manage your <a>Google search history</a>.</p>
            </div>
          </div>

          <div className="gg-cols">
            <section>
              <header className="gg-h-blue">Our Search</header>
              <ul>
                <li><a onClick={() => go('http://search.msn.co.uk/')}>Help and How to Search</a>
                  <span>Basics, Advanced Features, FAQs...</span></li>
                <li><a onClick={() => go('http://search.msn.co.uk/')}>Google Web Search Features</a>
                  <span>Translation, I&rsquo;m Feeling Lucky, Cached...</span></li>
                <li><a>Google Services &amp; Tools</a>
                  <span>Toolbar, Google Web APIs, Buttons...</span></li>
                <li><a>Google Labs</a>
                  <span>Ideas, Demos, Experiments...</span></li>
              </ul>
            </section>

            <section>
              <header className="gg-h-gold">For Site Owners</header>
              <ul>
                <li><a>Advertising</a><span>AdWords, AdSense...</span></li>
                <li><a>Business Solutions</a>
                  <span>Google Search Appliance, Google Mini, WebSearch...</span></li>
                <li><a>Webmaster Info</a><span>Guidelines, Ranking questions...</span></li>
                <li><a>Submitting your Site</a><span>How Google adds URLs...</span></li>
              </ul>
            </section>

            <section>
              <header className="gg-h-green">Our Company</header>
              <ul>
                <li><a>Press Center</a><span>Articles, Releases, Zeitgeist...</span></li>
                <li><a>Jobs at Google</a><span>Openings, Perks, Culture...</span></li>
                <li><a>Corporate Info</a>
                  <span>Management, Addresses, Investor Relations...</span></li>
              </ul>
            </section>

            <section>
              <header className="gg-h-red">More Google</header>
              <ul>
                <li><a onClick={() => go('http://video.google.com/')}>Google Video</a>
                  <span>Search and watch video from across the web...</span></li>
                <li><a onClick={openHotmail}>Contact Us</a><span>FAQs, Feedback, Newsletter...</span></li>
                <li><a>The Google Store</a><span>Pens, Shirts, Lava lamps...</span></li>
                <li><a>Logos and Photos</a><span>Logos, Googlers at work and play...</span></li>
              </ul>
            </section>
          </div>
        </div>

        <div className="gg-footer">
          &copy;2005 Google &nbsp;<a>Privacy Policy</a> - <a>Terms of Service</a>
        </div>
      </div>
    ),
  },
  {
    url: 'http://www.google.co.uk/',
    title: 'Google',
    render: (go) => (
      <div className="gh">
        <div className="gh-logo">
          <LogoImg name="google" size={276} height={97}>
            <span className="gg-logo gh-wordmark">
              <b className="c1">G</b><b className="c2">o</b><b className="c3">o</b>
              <b className="c1">g</b><b className="c4">l</b><b className="c3">e</b>
              <sup>&trade;</sup>
            </span>
          </LogoImg>
        </div>

        {/* Web was bold because you were already on it. */}
        <nav className="gh-tabs">
          <b>Web</b>
          <a>Images</a>
          <a>Groups</a>
          <a>News</a>
          <a>Froogle</a>
          <a>Local</a>
          <a className="gh-more">more &raquo;</a>
        </nav>

        <div className="gh-searchrow">
          <input className="gh-input" aria-label="Search" />
          <span className="gh-links">
            <a>Advanced Search</a>
            <a>Preferences</a>
            <a>Language Tools</a>
          </span>
        </div>

        <div className="gh-buttons">
          <button onClick={() => go('http://search.msn.co.uk/')}>Google Search</button>
          <button onClick={() => go('http://video.google.com/')}>I&rsquo;m Feeling Lucky</button>
        </div>

        <p className="gh-foot">
          <a>Advertising Programs</a> - <a onClick={() => go(ABOUT)}>About Google</a>
        </p>
        <p className="gh-copy">&copy;2005 Google - Searching 8,058,044,651 web pages</p>
      </div>
    ),
  },
  {
    url: 'http://video.google.com/',
    title: 'Google Video',
    render: (go) => (
      <div className="gv">
        {/* The wordmark with "Video" tucked under it and BETA alongside —
            everything Google shipped in 2005 was beta for years. */}
        <div className="gv-logo">
          <LogoImg name="google" size={260} height={86}>
            <span className="gg-logo gv-wordmark">
              <b className="c1">G</b><b className="c2">o</b><b className="c3">o</b>
              <b className="c1">g</b><b className="c4">l</b><b className="c3">e</b>
              <sup>&trade;</sup>
            </span>
          </LogoImg>
          <span className="gv-sub">Video</span>
          <span className="gv-beta">BETA</span>
        </div>

        <div className="gv-searchrow">
          <input className="gv-input" aria-label="Search video" />
          <button className="gv-btn" onClick={() => go('http://video.google.com/results')}>
            Search Video
          </button>
          <span className="gv-prefs">
            <a>Preferences</a>
            <a>Google Video Help</a>
          </span>
        </div>

        <div className="gv-radios">
          Search:
          <label>
            <input type="radio" name="gv-scope" defaultChecked /> playable video
          </label>
          <label>
            <input type="radio" name="gv-scope" /> all video
          </label>
        </div>

        <p className="gv-new">
          <span>New!</span> <a>Install the Google Video Viewer</a>
        </p>

        {/* Three thumbnails that were never related to each other. */}
        <div className="gv-thumbs">
          <figure>
            <span className="gv-thumb gv-slide">
              <b>Managing Startup</b>
              <i /><i /><i /><i /><i />
            </span>
            <figcaption>
              <a>Developing Win Apps w/ Visual Studio.NET Level 1</a>
            </figcaption>
          </figure>
          <figure>
            <span className="gv-thumb gv-shop">
              <b className="gv-gap">GAP</b>
              <span className="gv-person gv-p1" />
              <span className="gv-person gv-p2" />
            </span>
            <figcaption>
              <a>Stacy_and_Chad</a>
            </figcaption>
          </figure>
          <figure>
            <span className="gv-thumb gv-track">
              <span className="gv-car gv-car1" />
              <span className="gv-car gv-car2" />
              <span className="gv-barrier" />
            </span>
            <figcaption>
              <a>accordVSprelude2</a>
            </figcaption>
          </figure>
        </div>

        <p className="gv-more">
          <a>similarly random videos &raquo;</a>
        </p>

        <p className="gv-footer">
          <a>Google Labs</a> - <a>Discuss</a> - <a>Terms of use</a> -{' '}
          <a>About Google Video</a> - <a>Submit your video</a>
        </p>
        <p className="gv-copy">&copy;2005 Google</p>
      </div>
    ),
  },
  {
    url: 'http://www.msn.co.uk/',
    title: 'MSN.co.uk',
    render: (go, openHotmail) => (
      <div className="ie-msn">
        <div className="ie-msn-bar">
          <span className="ie-msn-logo">msn</span>
          <button onClick={openHotmail}>Hotmail</button>
          <button onClick={() => go('http://search.msn.co.uk/')}>Search</button>
          <button onClick={() => go('http://www.msn.co.uk/messenger/')}>Messenger</button>
          <button onClick={() => go('http://www.geocities.com/x/')}>Web Directory</button>
        </div>
        <div className="ie-msn-cols">
          <div>
            <h3>Today</h3>
            <ul>
              <li>Weather: cloudy, 11°C, and it will stay that way</li>
              <li>Phone of the week: the one that flips</li>
              <li>Quiz: which Neopet are you?</li>
              <li>Download Messenger 7.5 — now with winks</li>
            </ul>
          </div>
          <div>
            <h3>Entertainment</h3>
            <ul>
              <li>Chart rundown: four songs you cannot escape</li>
              <li>Ringtone offers from 3 p/min</li>
              <li>Horoscopes</li>
            </ul>
          </div>
          <div className="ie-msn-ad">
            <strong>YOU ARE THE 1,000,000th VISITOR</strong>
            <p>Click here to claim your prize</p>
            <button onClick={() => go('http://free-prize-claim.biz/win/')}>CLAIM NOW</button>
          </div>
        </div>
      </div>
    ),
  },
  {
    url: 'http://search.msn.co.uk/',
    title: 'MSN Search',
    render: (go) => (
      <div className="ie-page">
        <h2>MSN Search</h2>
        <p>
          <input className="xp-input" defaultValue="how to make msn display picture" style={{ width: 280 }} />{' '}
          <button className="xp-button">Search</button>
        </p>
        <ol className="ie-results">
          <li>
            <a onClick={() => go('http://www.geocities.com/x/')}>MSN Tricks &amp; Tips ~*~ MY SITE ~*~</a>
            <div>Under construction. Best viewed at 800x600. Sign my guestbook!!</div>
          </li>
          <li>
            <a onClick={() => go('http://www.geocities.com/x/')}>FREE MSN NAMES ♥ cool symbols ♥</a>
            <div>░▒▓ copy and paste these into ur name ▓▒░</div>
          </li>
          <li>
            <a onClick={() => go('http://free-prize-claim.biz/win/')}>Download 5000 EMOTICONS FREE</a>
            <div>No spyware (there is spyware)</div>
          </li>
        </ol>
      </div>
    ),
  },
  {
    url: 'http://www.msn.co.uk/messenger/',
    title: 'MSN Messenger',
    render: () => (
      <div className="ie-page">
        <h2>MSN Messenger 7.5</h2>
        <p>Winks. Nudges. Dynamic display pictures. Shared folders.</p>
        <ul>
          <li>Tell your friends what you are listening to</li>
          <li>Send a wink that takes over their whole window</li>
          <li>Handwriting — if you have a tablet, which you do not</li>
        </ul>
        <p>
          <button className="xp-button">Download now (12.1 MB)</button> — about 40 minutes
        </p>
      </div>
    ),
  },
  {
    url: 'http://www.geocities.com/x/',
    title: '~*~ WeLcOmE 2 My SiTe ~*~',
    render: () => (
      <div className="ie-geocities">
        <div className="ie-marquee">
          <span>░▒▓ WELCOME 2 MY HOMEPAGE ▓▒░ BEST VIEWED IN 800x600 ░▒▓</span>
        </div>
        <h1>~*~ aBoUt Me ~*~</h1>
        <p>hey!!! this is my site i made it myself soz if its rubbish lol</p>
        <p>
          <b>fave band:</b> u already know
          <br />
          <b>fave colour:</b> black (and pink)
        </p>
        <hr />
        <p>
          <a>SIGN MY GUESTBOOK</a> | <a>LINKS</a> | <a>MY PETZ</a>
        </p>
        <p className="ie-counter">visitors: 0 0 0 1 4 2</p>
        <p style={{ fontSize: 10 }}>This page is UNDER CONSTRUCTION 🚧</p>
      </div>
    ),
  },
  {
    url: 'http://free-prize-claim.biz/win/',
    title: 'CONGRATULATIONS',
    render: (go) => (
      <div className="ie-page ie-scam">
        <h2>⚠ CONGRATULATIONS ⚠</h2>
        <p>You are today's lucky visitor. A free iPod is waiting for you.</p>
        <p>Simply install our toolbar to continue.</p>
        <p>
          <button className="xp-button" onClick={() => go(HOME)}>
            No thanks
          </button>{' '}
          <button className="xp-button" onClick={() => go(HOME)}>
            No thanks
          </button>{' '}
          <button className="xp-button" onClick={() => go(HOME)}>
            Yes (also no)
          </button>
        </p>
        <p style={{ fontSize: 10, color: '#777' }}>
          Nothing is installed. This is a museum piece.
        </p>
      </div>
    ),
  },
]

function findPage(url: string) {
  return PAGES.find((p) => p.url === url)
}

/* An embed can open the browser on one of the favourites rather than the
   home page: ?open=ie&site=youtube. The name is matched against the title in
   the Favorites list, so the URL reads the way the menu does. */
function startPage(): string {
  if (typeof window === 'undefined') return HOME
  const want = new URLSearchParams(window.location.search).get('site')
  if (!want) return HOME
  const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '')
  const match = FAVOURITES.find((f) => slug(f.title) === slug(want))
  return match ? match.url : HOME
}

export function InternetExplorer({ windowId }: { windowId?: string }) {
  const dispatch = useDispatch()
  const [start] = useState(startPage)
  const [history, setHistory] = useState<string[]>([start])
  const [index, setIndex] = useState(0)
  const [address, setAddress] = useState(start)
  const [loading, setLoading] = useState(false)
  // Open on arrival: the sites behind this browser are the point of the
  // thing, and a closed menu hides every one of them.
  const [favsOpen, setFavsOpen] = useState(true)
  // The menu hangs off the button, which moves as the toolbar does — its
  // labels only appear once the window is wide enough — so its position is
  // measured rather than assumed.
  const favBtn = useRef<HTMLButtonElement>(null)
  const [favsAt, setFavsAt] = useState<{ left: number; top: number } | null>(null)

  useEffect(() => {
    if (!favsOpen) return
    const place = () => {
      const b = favBtn.current
      if (!b) return
      setFavsAt({ left: b.offsetLeft, top: b.offsetTop + b.offsetHeight })
    }
    place()
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [favsOpen])

  const current = history[index]
  const page = findPage(current)

  // The title bar follows the page, the way a browser's does.
  useEffect(() => {
    if (!windowId) return
    dispatch({
      type: 'rename-window',
      id: windowId,
      title: `${page?.title ?? current} - Microsoft Internet Explorer`,
    })
  }, [windowId, page, current, dispatch])

  const go = (url: string) => {
    // "Start Navigation" — the one click XP really did make in IE.
    play('click')
    setLoading(true)
    window.setTimeout(() => {
      setHistory((h) => [...h.slice(0, index + 1), url])
      setIndex((i) => i + 1)
      setAddress(url)
      setLoading(false)
    }, 650)
  }

  const back = () => {
    if (index === 0) return
    setIndex(index - 1)
    setAddress(history[index - 1])
  }

  const forward = () => {
    if (index >= history.length - 1) return
    setIndex(index + 1)
    setAddress(history[index + 1])
  }

  const openHotmail = () => dispatch({ type: 'open-window', kind: 'hotmail' })

  return (
    <div className="ie">
      <div className="ie-menu">
        {['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help'].map((m) => (
          <span key={m}>{m}</span>
        ))}
        <span className="ie-flag" aria-hidden>
          <IeTool.Flag />
        </span>
      </div>

      {/* XP's toolbar: nav arrows with their drop-down carets, then stop,
          refresh and home, then the two labelled buttons, then the block of
          unlabelled ones nobody ever pressed. */}
      <div className="ie-toolbar">
        <button className="ie-tb" onClick={back} disabled={index === 0} title="Back">
          <span className="xp-nav back" aria-hidden />
          <span className="ie-tb-label">Back</span>
        </button>
        <button className="ie-tb caret" disabled={index === 0} title="Recent pages">
          <span className="xp-caret" />
        </button>
        <button
          className="ie-tb"
          onClick={forward}
          disabled={index >= history.length - 1}
          title="Forward"
        >
          <span className="xp-nav fwd" aria-hidden />
        </button>
        <button className="ie-tb caret" disabled={index >= history.length - 1} title="Recent pages">
          <span className="xp-caret" />
        </button>
        <button className="ie-tb" onClick={() => setLoading(false)} title="Stop">
          <IeTool.Stop />
        </button>
        <button className="ie-tb" onClick={() => go(current)} title="Refresh">
          <IeTool.Refresh />
        </button>
        <button className="ie-tb" onClick={() => go(HOME)} title="Home">
          <IeTool.Home />
        </button>
        <span className="ie-tb-sep" />
        <button className="ie-tb" onClick={() => go('http://www.google.co.uk/')} title="Search">
          <IeTool.Search />
          <span className="ie-tb-label">Search</span>
        </button>
        <button
          ref={favBtn}
          className={`ie-tb${favsOpen ? ' on' : ''}`}
          onClick={() => setFavsOpen((o) => !o)}
          title="Favorites"
        >
          <IeTool.Favorites />
          <span className="ie-tb-label">Favorites</span>
        </button>
        <button className="ie-tb" title="History">
          <IeTool.History />
        </button>
        <span className="ie-tb-sep" />
        <button className="ie-tb" onClick={openHotmail} title="Mail">
          <IeTool.Mail />
        </button>
        <button className="ie-tb caret" title="Mail options">
          <span className="xp-caret" />
        </button>
        <button className="ie-tb" title="Print">
          <IeTool.Print />
        </button>
        <button
          className="ie-tb"
          title="Edit"
          onClick={() => dispatch({ type: 'open-window', kind: 'notepad' })}
        >
          <IeTool.Edit />
        </button>
        <button className="ie-tb" title="Discuss">
          <IeTool.Discuss />
        </button>
        <button
          className="ie-tb"
          title="Messenger"
          onClick={() => dispatch({ type: 'open-window', kind: 'messenger' })}
        >
          <IeTool.Messenger />
        </button>
      </div>

      <div className="ie-address">
        <label htmlFor="ie-url">Address</label>
        <div className="ie-url-wrap">
          <span className="ie-url-icon" aria-hidden>
            <IeIcon size={14} />
          </span>
          <input
            id="ie-url"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return
              go(address.trim())
            }}
          />
          <button className="ie-url-caret" title="Recent addresses">
            <span className="xp-caret" />
          </button>
        </div>
        <button className="ie-go" onClick={() => go(address.trim())}>
          <span className="xp-go-arrow" aria-hidden />
          Go
        </button>
        <span className="ie-links">
          Links <span className="ie-chevs">&raquo;</span>
        </span>
      </div>

      {/* The Links bar: the handful of sites kept a click away. */}
      <div className="ie-linksbar">
        <span className="ie-linksbar-label">Links</span>
        {FAVOURITES.map((f) => (
          <button key={f.url} onClick={() => go(f.url)}>
            <IeIcon size={13} />
            {f.title}
          </button>
        ))}
      </div>

      {favsOpen ? (
        <>
          <div className="ie-favs-backdrop" onClick={() => setFavsOpen(false)} />
          <div
            className="ie-favs"
            style={favsAt ? { left: favsAt.left, top: favsAt.top } : undefined}
          >
            <header>Favorites</header>
            <button onClick={() => { go(HOME); setFavsOpen(false) }}>
              <IeIcon size={14} />
              Google
            </button>
            <div className="ie-favs-sep" />
            {FAVOURITES.map((f) => (
              <button key={f.url} onClick={() => { go(f.url); setFavsOpen(false) }}>
                <IeIcon size={14} />
                {f.title}
              </button>
            ))}
          </div>
        </>
      ) : null}

      <div className={`ie-view scroll${page && FAVOURITES.some((f) => f.url === page.url) ? ' site' : ''}`}>
        {loading ? (
          <div className="ie-page" style={{ color: '#555' }}>
            Opening page {current}...
          </div>
        ) : page ? (
          page.render(go, openHotmail)
        ) : (
          <div className="ie-page">
            <h2>The page cannot be displayed</h2>
            <p>
              The page you are looking for is currently unavailable. The Web site might be
              experiencing technical difficulties, or you may need to adjust your browser settings.
            </p>
            <hr />
            <p style={{ fontSize: 11 }}>
              Please try the following:
              <br />• Click the Refresh button, or try again later.
              <br />• If you typed the page address in the Address bar, make sure that it is spelled
              correctly.
              <br />• Somebody probably picked up the phone.
            </p>
            <p style={{ fontSize: 11, color: '#777' }}>
              Cannot find server or DNS Error — Internet Explorer
            </p>
          </div>
        )}
      </div>

      <div className="ie-status">
        <IeIcon size={13} />
        {loading ? 'Opening page...' : 'Done'}
        <span style={{ marginLeft: 'auto' }}>Internet</span>
      </div>
    </div>
  )
}
