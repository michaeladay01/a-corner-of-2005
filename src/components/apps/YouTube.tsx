import { useState } from 'react'
import { YouTubeChrome, TAB_FOR, type Page } from './YouTubeChrome'
import { MostViewed, Categories, Channels, Join, About } from './YouTubePages'
import { YouTubeWatch, type Video } from './YouTubeWatch'
import { asset } from '../../lib/asset'

/* YouTube's front page in 2006: a row of Director Videos, the big Featured
   Videos list down the middle, and the sign-up and news boxes on the right. */

export const FEATURED: Video[] = [
  {
    id: 'thousandmiles',
    title: 'vanessa carlton - a thousand miles',
    added: 'June 24, 2005',
    by: 'x_piano_girl_x',
    views: 55719,
    comments: 9,
    art: 'band',
    runtime: '04:27',
    category: 'Music',
    tags: ['vanessa', 'carlton', 'piano', 'music', 'video', '2005'],
    ratings: 382,
    stars: 3.5,
    description:
      'taped this off the music channel ages ago and finally got it onto the computer. ' +
      'quality isnt great sorry. best song ever tho.',
  },
  {
    id: 'ponde',
    title: 'rihanna - pon de replay',
    added: 'August 9, 2005',
    by: 'sumrsmash05',
    views: 487213,
    comments: 9,
    art: 'band',
    runtime: '03:37',
    category: 'Music',
    tags: ['rihanna', 'pon', 'de', 'replay', 'music', 'video'],
    ratings: 2611,
    stars: 4.5,
    description:
      'this has been on the music channel every half hour for about a month and i still ' +
      'put it on. internet version so the quality is a bit rough.',
  },
  {
    id: 'crazyfrog',
    title: 'crazy frog - the annoying thing (original)',
    added: 'May 24, 2005',
    by: 'deputytigerfang',
    views: 36602,
    comments: 5,
    art: 'house',
    runtime: '00:37',
    category: 'Entertainment',
    tags: ['crazy', 'frog', 'annoying', 'thing', 'ringtone'],
    ratings: 283,
    stars: 4.5,
    description:
      'the original one before it was a ringtone on every advert. my brother had this as ' +
      'his msn display picture for about a year.',
  },
  {
    id: 'afv',
    title: 'americas funniest home videos (AFV)',
    added: 'May 18, 2005',
    by: 'zubazpants',
    views: 19740,
    comments: 5,
    art: 'face',
    runtime: '01:50',
    category: 'Comedy',
    tags: ['afv', 'funny', 'home', 'videos', 'tv'],
    ratings: 141,
    stars: 4,
    description:
      'taped this off the telly on sunday. the intro is the best bit of the whole show, ' +
      'dont @ me. sorry about the tracking lines near the end.',
  },
  {
    id: 'idol',
    title: 'american idol - worlds worst auditions 2005',
    added: 'July 2, 2005',
    by: 'tv_taper_82',
    views: 128417,
    comments: 5,
    art: 'face',
    runtime: '00:31',
    category: 'Entertainment',
    tags: ['american', 'idol', 'auditions', 'tv', '2005', 'funny'],
    ratings: 914,
    stars: 4,
    description:
      'the intro bit where they show all the bad ones. i have watched this more times than ' +
      'i have watched most actual films.',
  },
  {
    id: 'matt',
    title: 'where the hell is matt',
    added: 'June 2, 2005',
    by: 'placeboing',
    views: 214905,
    comments: 9,
    art: 'band',
    runtime: '02:45',
    category: 'Travel & Places',
    tags: ['matt', 'dancing', 'travel', 'world', '2005'],
    ratings: 1402,
    stars: 5,
    description:
      'bloke travels round the world doing the same daft dance everywhere he goes. ive ' +
      'sent this to about nine people already. stick with it til the end.',
  },
  {
    id: 'zoo',
    title: 'Me at the zoo',
    added: 'April 23, 2005',
    by: 'jawed',
    views: 3352646,
    comments: 9,
    art: 'contest',
    runtime: '00:19',
    category: 'Travel & Places',
    tags: ['zoo', 'elephants', 'first', 'video'],
    ratings: 3029,
    stars: 4.5,
    description:
      'the first video ever put on this site. its 19 seconds of a bloke standing in front ' +
      'of the elephants. dont know why i keep watching it.',
  },
]

/* The Director Videos strip. All four have files behind them, so each opens
   and plays. */
const TOYSOLDIERS: Video = {
  id: 'toysoldiers',
  title: 'eminem - like toy soldiers',
  added: 'January 17, 2005',
  by: 'shadyfan_01',
  views: 1204773,
  comments: 9,
  art: 'band',
  runtime: '05:23',
  category: 'Music',
  tags: ['eminem', 'toy', 'soldiers', 'music', 'video', '2005'],
  ratings: 6821,
  stars: 5,
  description:
    'took about forty minutes to download this on the family computer and it was worth ' +
    'every minute. do not let my mum see the file.',
}

const BEAUTIFUL: Video = {
  id: 'beautiful',
  title: 'james blunt - youre beautiful',
  added: 'May 30, 2005',
  by: 'quietmornings',
  views: 663891,
  comments: 9,
  art: 'band',
  runtime: '03:22',
  category: 'Music',
  tags: ['james', 'blunt', 'beautiful', 'music', 'video', '2005'],
  ratings: 2974,
  stars: 4,
  description:
    'my sister plays this on repeat and i have given up complaining about it. ' +
    'genuinely a good video tho, wait for the end.',
}

const SNOWBOARD: Video = {
  id: 'snowboard',
  title: 'My Snowboarding Skillz',
  added: 'February 19, 2005',
  by: 'burton_lad',
  views: 41208,
  comments: 5,
  art: 'house',
  runtime: '00:10',
  category: 'Sports',
  tags: ['snowboarding', 'snow', 'winter', 'fail', 'skillz'],
  ratings: 318,
  stars: 4,
  description:
    'ten seconds of me absolutely nailing it and then not nailing it. my mate filmed ' +
    'it on his phone so the quality is shocking.',
}

const DIRECTOR_VIDEO: Video = {
  id: 'hollaback',
  title: 'gwen stefani - hollaback girl',
  added: 'April 5, 2005',
  by: 'hollaback_x',
  views: 892440,
  comments: 9,
  art: 'band',
  runtime: '03:30',
  category: 'Music',
  tags: ['gwen', 'stefani', 'hollaback', 'girl', 'music', 'video'],
  ratings: 4188,
  stars: 4.5,
  description:
    'this is on the radio about forty times a day and i am still not sick of it. the ' +
    'marching band bit is the best part.',
}

const DIRECTORS: { id: string; title: string; runtime: string; by: string; play?: Video }[] = [
  {
    id: DIRECTOR_VIDEO.id,
    title: DIRECTOR_VIDEO.title,
    runtime: DIRECTOR_VIDEO.runtime,
    by: DIRECTOR_VIDEO.by,
    play: DIRECTOR_VIDEO,
  },
  {
    id: SNOWBOARD.id,
    title: SNOWBOARD.title,
    runtime: SNOWBOARD.runtime,
    by: SNOWBOARD.by,
    play: SNOWBOARD,
  },
  {
    id: BEAUTIFUL.id,
    title: BEAUTIFUL.title,
    runtime: BEAUTIFUL.runtime,
    by: BEAUTIFUL.by,
    play: BEAUTIFUL,
  },
  {
    id: TOYSOLDIERS.id,
    title: TOYSOLDIERS.title,
    runtime: TOYSOLDIERS.runtime,
    by: TOYSOLDIERS.by,
    play: TOYSOLDIERS,
  },
]

/* The order the front page lists them in. Anything not named here falls to
   the end, keeping its own order. */
const ORDER = ['crazyfrog', 'ponde', 'afv', 'zoo', 'hollaback']

const rank = (id: string) => {
  const i = ORDER.indexOf(id)
  return i === -1 ? ORDER.length : i
}

const FEED: Video[] = [...FEATURED, DIRECTOR_VIDEO].sort((a, b) => rank(a.id) - rank(b.id))

const WHATS_NEW = [
  {
    head: 'Musicians',
    body: 'Are you a musician? Signup for our new musician account or login to convert your existing account.',
  },
  { head: "We're Hiring!", body: 'Sys Admins, Web Developers and Engineers apply within.' },
]

const CHANNELS = ['Comedians', 'Directors', 'Gurus', 'Musicians', 'Partners', 'Sponsors']

function Stars({ value }: { value: number }) {
  return (
    <span className="yh-stars">
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, value - (n - 1)))
        return (
          <span key={n} className="yh-star">
            <i className="off">★</i>
            <i className="on" style={{ width: `${fill * 100}%` }}>
              ★
            </i>
          </span>
        )
      })}
    </span>
  )
}

/* A thumbnail pulled out of the video, with the runtime badged on it. */
function Thumb({ slot, runtime, big }: { slot: string; runtime: string; big?: boolean }) {
  const [missing, setMissing] = useState(false)
  return (
    <span className={`yh-thumb${big ? ' big' : ''}`}>
      {missing ? (
        <span className="yh-blank" />
      ) : (
        <img src={asset(`youtube/${slot}-thumb.jpg`)} alt="" onError={() => setMissing(true)} />
      )}
      <span className="yh-dur">{runtime}</span>
    </span>
  )
}

export function YouTube() {
  const [search, setSearch] = useState('')
  const [note, setNote] = useState<string | null>(null)
  const [watching, setWatching] = useState<Video | null>(null)
  const [page, setPage] = useState<Page>('home')
  const [sub, setSub] = useState('Most Viewed')
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')

  if (watching) {
    return (
      <YouTubeWatch
        video={watching}
        others={FEED.filter((v) => v.id !== watching.id)}
        onOpen={setWatching}
        onHome={() => { setWatching(null); setPage('home') }}
        onNav={(p) => {
          setWatching(null)
          setPage(p)
          // Each tab has its own default sub-link.
          if (p === 'videos') setSub('Most Viewed')
          if (p === 'channels') setSub('Most Subscribed Channels')
        }}
      />
    )
  }

  const doSearch = () =>
    setNote(
      search.trim()
        ? `Your search for ${search.trim()} did not match any videos.`
        : 'Please enter a search term.'
    )

  return (
    <div className="yh">
      <YouTubeChrome
        active={TAB_FOR[page]}
        onNav={(p) => {
          setWatching(null)
          setPage(p)
          // Each tab has its own default sub-link.
          if (p === 'videos') setSub('Most Viewed')
          if (p === 'channels') setSub('Most Subscribed Channels')
        }}
        sub={sub}
        onSub={setSub}
        search={search}
        setSearch={setSearch}
        onSearch={doSearch}
      />

      {note ? (
        <div className="yh-note">
          {note}
          <button onClick={() => setNote(null)}>close</button>
        </div>
      ) : null}

      {/* The other tabs are whole pages of their own; Home keeps the feed. */}
      {page === 'videos' ? <MostViewed sub={sub} /> : null}
      {page === 'categories' ? <Categories /> : null}
      {page === 'channels' ? <Channels sub={sub} /> : null}
      {page === 'join' ? <Join /> : null}
      {page === 'about' ? <About /> : null}
      {page === 'groups' || page === 'upload' ? (
        <section className="yp-box">
          <header>
            <h2>{page === 'groups' ? 'Groups' : 'Upload Your Videos'}</h2>
          </header>
          <p className="yp-empty">
            {page === 'groups'
              ? 'You are not a member of any groups yet.'
              : 'Choose a video file from your computer to begin uploading.'}
          </p>
        </section>
      ) : null}

      {page !== 'home' ? (
        <footer className="yh-foot">
          <p>
            <a>Advertise With Us</a> | <a>About Us</a> | <a>Help Center</a> | <a>Safety Tips</a> |{' '}
            <a>Developers</a> | <a>Terms of Use</a> | <a>Privacy Policy</a> | <a>Jobs</a>
          </p>
          <p>
            Copyright &copy; 2006 YouTube, Inc. <span className="yh-rss">RSS</span>
          </p>
        </footer>
      ) : null}

      <div className="yh-cols" hidden={page !== 'home'}>
        <div className="yh-main">
          <h2 className="yh-dirhead">Director Videos</h2>
          <ul className="yh-dirs">
            {DIRECTORS.map((d) => (
              <li key={d.id}>
                <button onClick={() => d.play && setWatching(d.play)}>
                  <Thumb slot={d.id} runtime={d.runtime} />
                </button>
                <a
                  onClick={() => d.play && setWatching(d.play)}
                  dangerouslySetInnerHTML={{ __html: d.title }}
                />
                <b>{d.runtime}</b>
                <i>From: {d.by}</i>
              </li>
            ))}
          </ul>

          <section className="yh-featured">
            <header>
              <h2>Featured Videos</h2>
              <a onClick={() => setNote('There are no more videos to show.')}>See More Videos</a>
            </header>

            <ul>
              {FEED.map((v) => (
                <li key={v.id}>
                  <button className="yh-featthumb" onClick={() => setWatching(v)}>
                    <Thumb slot={v.id} runtime={v.runtime} big />
                  </button>

                  <div className="yh-feattext">
                    <a className="yh-feattitle" onClick={() => setWatching(v)}>
                      {v.title}
                    </a>
                    <b className="yh-featrun">{v.runtime}</b>
                    <p>{v.description}</p>
                    <p className="yh-featags">
                      <span>Tags:</span>{' '}
                      {(v.tags ?? []).map((t) => (
                        <a key={t}>{t}</a>
                      ))}
                    </p>
                    <p className="yh-featmeta">
                      Added: {v.added} &nbsp;&nbsp; in Category: <a>{v.category}</a>
                    </p>
                    <p className="yh-featmeta">
                      From: <a>{v.by}</a>
                    </p>
                    <p className="yh-featmeta">Views: {v.views.toLocaleString()}</p>
                    <p className="yh-featrate">
                      <Stars value={v.stars ?? 4} />
                      <span>{(v.ratings ?? 0).toLocaleString()} ratings</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="yh-side">
          <section className="yh-box">
            <header>Broadcast Yourself on YouTube</header>
            <div className="yh-promo">
              <p>
                <a>Watch</a> Instantly find and watch millions of fast streaming videos.
              </p>
              <p>
                <a>Upload</a> Quickly upload and tag videos in almost any video format.
              </p>
              <p>
                <a>Share</a> Easily share your videos with family, friends, or co-workers.
              </p>
              <hr />
              <h3>Member Login</h3>
              <label>
                User Name:
                <input value={user} onChange={(e) => setUser(e.target.value)} />
              </label>
              <label>
                Password:
                <input
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                />
              </label>
              <div className="yh-loginrow">
                <button
                  onClick={() =>
                    setNote(
                      user.trim()
                        ? 'That user name and password do not match.'
                        : 'Please enter a user name.'
                    )
                  }
                >
                  Login
                </button>
                <a>Sign Up</a>
              </div>
              <p className="yh-forgot">
                Forgot: <a>Username</a> | <a>Password</a>
              </p>
            </div>
          </section>

          <section className="yh-box">
            <header>What&rsquo;s New at YouTube</header>
            <div className="yh-news">
              {WHATS_NEW.map((n) => (
                <div key={n.head}>
                  <a className="yh-newshead">{n.head}</a>
                  <p>{n.body}</p>
                </div>
              ))}
              <p className="yh-newslinks">
                <a>Explore YouTube</a>
                <a>Read our Blog</a>
              </p>
            </div>
          </section>

          <div className="yh-advert">
            <b>Enter the Make Your Own Promo Contest!</b>
          </div>

          <section className="yh-box">
            <header>Active Channels</header>
            <div className="yh-channels">
              {CHANNELS.map((c) => (
                <a key={c}>{c}</a>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <footer className="yh-foot">
        <p>
          <a>Advertise With Us</a> | <a>About Us</a> | <a>Help Center</a> | <a>Safety Tips</a> |{' '}
          <a>Developers</a> | <a>Terms of Use</a> | <a>Privacy Policy</a> | <a>Jobs</a>
        </p>
        <p>
          Copyright &copy; 2006 YouTube, Inc. <span className="yh-rss">RSS</span>
        </p>
      </footer>
    </div>
  )
}
