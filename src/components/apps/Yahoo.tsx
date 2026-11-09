import { useState } from 'react'
import { LogoImg } from '../Icons'
import { asset } from '../../lib/asset'

/* Yahoo!'s front page in 2005: a portal rather than a search engine, with
   every service it owned crammed into three columns.

   Every photograph is a named blank — drop a file into public/yahoo/<slot>.jpg
   and it appears in place of the grey box. */

function Photo({ slot, label, w, h }: { slot: string; label?: string; w: number; h: number }) {
  const [failed, setFailed] = useState(false)
  return (
    <span className="y-photo" style={{ width: w, height: h }}>
      {failed ? (
        <span className="y-photo-blank" data-slot={slot}>
          {slot}
        </span>
      ) : (
        <img src={asset(`yahoo/${slot}.jpg`)} alt={label ?? slot} onError={() => setFailed(true)} />
      )}
    </span>
  )
}

const TOP_LEFT = [
  { id: 'finance', label: 'Finance' },
  { id: 'music', label: 'Music' },
  { id: 'travel', label: 'Travel' },
]

const TOP_RIGHT = [
  { id: 'mail', label: 'Mail' },
  { id: 'my', label: 'My Yahoo!' },
  { id: 'messenger', label: 'Messenger' },
]

/* The four-column block of services under the mail bar. */
const SERVICES = [
  ['Autos', 'Chat', 'Finance', 'Games', 'GeoCities', 'Groups', 'Health'],
  ['Horoscopes', 'HotJobs', 'Kids', 'Mail', 'Maps', 'Messenger', 'Mobile'],
  ['Movies', 'Music', 'My Yahoo!', 'News', 'People Search', 'Personals', 'Photos'],
  ['Real Estate', 'Shopping', 'Sports', 'Travel', 'TV', 'Yellow Pages'],
]

const NEWS = [
  'U.K. police: Terrorists still pose threat',
  'Saddam grilled about 1991 Shiite crackdown',
  'Officials: Bush plans to install Bolton',
  'Hispanics new target of hate groups',
  'Arctic depths teeming with life, say explorers',
  'Video game industry eyeing record year',
  "Bob Hope's remains moved to new garden",
]

const DIRECTORY = [
  ['Arts', 'Business', 'Computers'],
  ['Culture', 'Education', 'Entertainment'],
  ['Health', 'News', 'Recreation'],
  ['Reference', 'Regional', 'Science'],
]

const MORE_SERVICES = [
  ['360°', 'Auctions'],
  ['Calendar', 'Classifieds'],
  ['Education', 'Greetings'],
  ['Members', 'Pets'],
]

export function Yahoo() {
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState('on the Web')
  const [city, setCity] = useState('')
  const [note, setNote] = useState<string | null>(null)

  const search = () =>
    setNote(
      query.trim()
        ? `We did not find results for ${query.trim()}.`
        : 'Please enter a search term.'
    )

  /* A link with nowhere to go just doesn't go anywhere, the way a dead link
     on the real page did. Nothing announces itself. */
  const nope = (_what: string) => () => {}

  return (
    <div className="y">
      {/* The icon bar with the logo in the middle. */}
      <header className="y-top">
        <div className="y-top-side">
          {TOP_LEFT.map((t) => (
            <button key={t.id} className="y-svc" onClick={nope(t.label)}>
              <span className={`y-svc-icon y-ic-${t.id}`} />
              {t.label}
            </button>
          ))}
        </div>

        <LogoImg name="yahoo" size={252} height={56}>
          <span className="y-wordmark">YAHOO!</span>
        </LogoImg>

        <div className="y-top-side">
          {TOP_RIGHT.map((t) => (
            <button key={t.id} className="y-svc" onClick={nope(t.label)}>
              <span className={`y-svc-icon y-ic-${t.id}`} />
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {note ? (
        <div className="y-note">
          {note}
          <button onClick={() => setNote(null)}>close</button>
        </div>
      ) : null}

      <div className="y-body scroll">
        {/* The blue search bar. */}
        <div className="y-searchbar">
          <label htmlFor="y-q">Search for:</label>
          <input
            id="y-q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
          />
          <select value={scope} onChange={(e) => setScope(e.target.value)}>
            <option>on the Web</option>
            <option>Images</option>
            <option>Directory</option>
            <option>News</option>
            <option>Products</option>
          </select>
          <button onClick={search}>Yahoo! Search</button>
          <span className="y-search-links">
            <a onClick={nope('Advanced search')}>&bull; Advanced</a>
            <a onClick={nope('My Web')}>
              &bull; My Web <i>BETA</i>
            </a>
          </span>
        </div>

        <p className="y-popular">
          <b>Yahoo! Search</b> - Popular terms:{' '}
          {['Danica Patrick', 'Big Brother 6', 'Airline Tickets', 'Maria Sharapova'].map(
            (t, i, all) => (
              <span key={t}>
                <a onClick={() => { setQuery(t); search() }}>{t}</a>
                {i < all.length - 1 ? ', ' : ''}
              </span>
            )
          )}
        </p>

        <div className="y-cols">
          {/* ---------------- Left column ---------------- */}
          <div className="y-main">
            <div className="y-mailbar">
              <span className="y-envelope" aria-hidden />
              <span>
                Check your mail status: <a onClick={nope('Sign in')}>Sign In</a>
              </span>
              <span className="y-mail-right">
                Free mail: <a onClick={nope('Sign up')}>Sign Up</a>
              </span>
            </div>

            <div className="y-services">
              {SERVICES.map((col, i) => (
                <ul key={i}>
                  {col.map((item) => (
                    <li key={item}>
                      <a onClick={nope(item)}>{item}</a>
                    </li>
                  ))}
                  {i === 3 ? (
                    <li>
                      <a className="y-strong" onClick={nope('All Y! Services')}>
                        All Y! Services...
                      </a>
                    </li>
                  ) : null}
                </ul>
              ))}
            </div>

            {/* Yahoo! Movies, in its yellow film-strip box. */}
            <section className="y-movies">
              <header>
                <h2>Yahoo! Movies</h2>
                <span>
                  <a onClick={nope('Showtimes')}>Showtimes &amp; Tickets</a> |{' '}
                  <a onClick={nope('Trailers')}>Trailers</a>
                </span>
              </header>
              <div className="y-movies-body">
                <figure className="y-reel">
                  <Photo slot="movie-stealth" label="Stealth" w={118} h={118} />
                  <figcaption>Stealth</figcaption>
                </figure>
                <div className="y-movies-mid">
                  <strong>Now in Theaters:</strong>
                  {['Must Love Dogs', 'Sky High', 'Stealth', 'Chocolate Factory'].map((m) => (
                    <a key={m} onClick={nope(m)}>
                      {m}
                    </a>
                  ))}
                  <a className="y-strong" onClick={nope('Also in Theaters')}>
                    &raquo; Also in Theaters
                  </a>
                </div>
                <figure className="y-reel">
                  <Photo slot="movie-dogs" label="Must Love Dogs" w={140} h={118} />
                  <figcaption>Must Love Dogs</figcaption>
                </figure>
              </div>
              <footer>
                <b>Now on Yahoo! Movies:</b>{' '}
                <a onClick={nope('Recommendations')}>
                  Get personalized movie recommendations
                </a>
              </footer>
            </section>

            {/* The two small boxes side by side. */}
            <div className="y-pair">
              <section className="y-box">
                <header>
                  <h2>Yahoo! Small Business</h2>
                </header>
                <div className="y-twocol">
                  {['Web Hosting', 'Sell Online', 'Domain Names', 'Search Marketing'].map((l) => (
                    <a key={l} onClick={nope(l)}>
                      {l}
                    </a>
                  ))}
                </div>
              </section>
              <section className="y-box">
                <header>
                  <h2>Yahoo! Featured</h2>
                </header>
                <div className="y-twocol">
                  {['SBC Yahoo! DSL', 'Downloads', 'Weekend Plans', 'HotJobs'].map((l) => (
                    <a key={l} onClick={nope(l)}>
                      {l}
                    </a>
                  ))}
                </div>
              </section>
            </div>

            <section className="y-box">
              <header>
                <h2>Entertainment</h2>
                <a onClick={nope('Entertainment')}>&raquo; More Entertainment</a>
              </header>
              <div className="y-story">
                <figure>
                  <Photo slot="ent-blondes" label="Stars Gone Blonde" w={110} h={82} />
                  <figcaption>Stars Gone Blonde</figcaption>
                </figure>
                <ul>
                  <li>
                    <a onClick={nope('Photo gallery')}>
                      Photo gallery: Hollywood&rsquo;s new blonde obsession
                    </a>
                  </li>
                  <li>
                    <a onClick={nope('Julia Roberts')}>Julia Roberts to make her Broadway debut</a>
                  </li>
                  <li>
                    <a onClick={nope('Simple Life')}>
                      Fox renews &lsquo;Simple Life&rsquo; with feuding Hilton, Richie
                    </a>
                  </li>
                  <li>
                    <a onClick={nope('TV Picks')}>Today&rsquo;s TV Picks</a> -{' '}
                    <a onClick={nope('Comics')}>Comics</a> -{' '}
                    <a onClick={nope('Horoscopes')}>Daily Horoscopes</a>
                  </li>
                </ul>
              </div>
            </section>

            <section className="y-box">
              <header>
                <h2>
                  Buzz Log <span className="y-light">- What the world is searching for</span>
                </h2>
                <a onClick={nope('Buzz')}>&raquo; More Buzz</a>
              </header>
              <div className="y-story">
                <figure>
                  <Photo slot="buzz-magician" label="Master Magician?" w={110} h={82} />
                  <figcaption>Master Magician?</figcaption>
                </figure>
                <div>
                  <p>
                    It&rsquo;s no illusion -- Criss Angel&rsquo;s &lsquo;Mindfreak&rsquo; is one of
                    the reality buzz hits of summer. <a onClick={nope('Buzz')}>More...</a>
                  </p>
                  <strong>Popular Reality Show Searches</strong>
                  <ol className="y-buzzlist">
                    {[
                      'Criss Angel: Mindfreak',
                      'Laguna Beach',
                      'Rock Star: INXS',
                      'Big Brother 6',
                    ].map((t, i) => (
                      <li key={t}>
                        <span>{i + 1}.</span>
                        <a onClick={() => { setQuery(t); search() }}>{t}</a>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </section>

            <section className="y-box">
              <header>
                <h2>Yahoo! Web Directory</h2>
                <a onClick={nope('Web Directory')}>&raquo; More Yahoo! Web Directory</a>
              </header>
              <div className="y-services">
                {DIRECTORY.map((col, i) => (
                  <ul key={i}>
                    {col.map((item) => (
                      <li key={item}>
                        <a onClick={nope(item)}>{item}</a>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </section>

            <section className="y-box">
              <header>
                <h2>More Yahoo! Services</h2>
                <a onClick={nope('Services')}>&raquo; More Yahoo! Services</a>
              </header>
              <div className="y-services">
                {MORE_SERVICES.map((col, i) => (
                  <ul key={i}>
                    {col.map((item) => (
                      <li key={item}>
                        <a onClick={nope(item)}>
                          {item}
                          {item === '360°' ? <i className="y-beta">BETA</i> : null}
                        </a>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </section>
          </div>

          {/* ---------------- Right column ---------------- */}
          <div className="y-side">
            <section className="y-shopping">
              <header>
                <h2>Yahoo! Shopping - Top Product Searches</h2>
              </header>
              <div>
                <span className="y-phone" aria-hidden />
                <p>
                  {['Cell Phones', 'Harry Potter', 'iPods', 'Photo Albums', 'Digital Cameras', 'PDAs'].map(
                    (t, i, all) => (
                      <span key={t}>
                        <a onClick={() => { setQuery(t); search() }}>{t}</a>
                        {i < all.length - 1 ? ', ' : ''}
                      </span>
                    )
                  )}
                </p>
              </div>
            </section>

            <section className="y-purple">
              <header>
                <h2>In the News</h2>
                <span className="y-undefined">undefined</span>
              </header>
              <div>
                <ul className="y-newslist">
                  {NEWS.map((n) => (
                    <li key={n}>
                      <a onClick={nope('News')}>{n}</a>
                    </li>
                  ))}
                  <li className="y-sportsrow">
                    {['MLB', 'NBA', 'NFL', 'NHL', 'Tennis', 'Soccer'].map((s, i, all) => (
                      <span key={s}>
                        <a onClick={nope(s)}>{s}</a>
                        {i < all.length - 1 ? ' · ' : ''}
                      </span>
                    ))}
                  </li>
                </ul>
                <hr />
                <p className="y-strong">
                  {['News', 'Popular', 'Sports', 'Stocks'].map((s, i, all) => (
                    <span key={s}>
                      <a onClick={nope(s)}>{s}</a>
                      {i < all.length - 1 ? ' · ' : ''}
                    </span>
                  ))}
                </p>
              </div>
            </section>

            <section className="y-purple">
              <header>
                <h2>Weather and Traffic</h2>
              </header>
              <div>
                <p>Enter City or U.S. Zip Code</p>
                <div className="y-weather">
                  <span className="y-weather-icon" aria-hidden />
                  <input value={city} onChange={(e) => setCity(e.target.value)} />
                  <button onClick={() =>
                    setNote(
                      city.trim()
                        ? `Sorry, we have no forecast for ${city.trim()} right now.`
                        : 'Please enter a city or ZIP code.'
                    )
                  }>
                    Go
                  </button>
                </div>
                <label className="y-save">
                  <input type="checkbox" defaultChecked /> Save location on this page
                </label>
              </div>
            </section>

            <section className="y-purple">
              <header>
                <h2>Marketplace</h2>
              </header>
              <div>
                <div className="y-market">
                  <Photo slot="market-camera" label="Digital camera" w={86} h={70} />
                  <p>
                    <a onClick={nope('Shopping')}>Yahoo! Shopping - Digital cameras</a> Shop for the
                    latest digital cameras - Research, compare, and buy at low prices.
                  </p>
                </div>
                <hr />
                <p>
                  <a onClick={nope('Home Theater')}>Home Theater and television buying advice</a> -
                  From Yahoo! Shopping and PC World.
                </p>
                <hr />
                <p>
                  <a onClick={nope('Merchant Solutions')}>Yahoo! Merchant Solutions</a> - Start
                  selling online today. Save $50.
                </p>
                <hr />
                <p>
                  <a onClick={nope('SBC Yahoo! DSL')}>SBC Yahoo! DSL</a> - Free activation and
                  installation. Only $26.95/mo for a year.
                </p>
              </div>
            </section>

            <section className="y-purple">
              <header>
                <h2>Yahoo! International</h2>
              </header>
              <div>
                <div className="y-intl">
                  {['Argentina', 'Italy', 'U.S. in Spanish', 'Mexico', 'Spain', 'Brazil'].map((c) => (
                    <a key={c} onClick={nope(c)}>
                      {c}
                    </a>
                  ))}
                </div>
                <p className="y-strong">
                  <a onClick={nope('International sites')}>&raquo; See all Y! international sites</a>
                </p>
              </div>
            </section>
          </div>
        </div>

        <footer className="y-foot">
          <div>
            <p>
              <a onClick={nope('Suggest a Site')}>How to Suggest a Site</a> |{' '}
              <a onClick={nope('Company Info')}>Company Info</a> |{' '}
              <a onClick={nope('Privacy Policy')}>Privacy Policy</a> |{' '}
              <a onClick={nope('Terms of Service')}>Terms of Service</a> |{' '}
              <a onClick={nope('Jobs')}>Jobs</a> |{' '}
              <a onClick={nope('Advertise With Us')}>Advertise With Us</a> |{' '}
              <a onClick={nope('Help')}>Help</a>
            </p>
            <p className="y-copy">
              Copyright &copy; 2005 Yahoo! Inc. All rights reserved.{' '}
              <a onClick={nope('Copyright/IP Policy')}>Copyright/IP Policy</a>.
            </p>
          </div>
          <span className="y-amex">
            <i>American Express</i>
            <b>BROADWAY</b>
          </span>
        </footer>
      </div>
    </div>
  )
}
