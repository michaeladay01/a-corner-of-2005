import { useState } from 'react'
import { asset } from '../../lib/asset'

/* The browsing pages that sit behind the Videos, Categories and Channels
   tabs, plus Join and About.

   Every picture is a blank slot. Drop a file into public/youtube/ named after
   the slot shown on the placeholder and it appears in its place. */

export function Slot({ name, className }: { name: string; className?: string }) {
  const [missing, setMissing] = useState(false)
  return (
    <span className={`yp-slot${className ? ` ${className}` : ''}`}>
      {missing ? (
        <span className="yp-blank">{name}</span>
      ) : (
        <img src={asset(`youtube/${name}.jpg`)} alt="" onError={() => setMissing(true)} />
      )}
    </span>
  )
}

function Stars({ value }: { value: number }) {
  return (
    <span className="yp-stars">
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, value - (n - 1)))
        return (
          <span key={n} className="yp-star">
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

/* ---------------- Videos: Most Viewed ---------------- */

type Listing = {
  slot: string
  title: string
  runtime: string
  added: string
  by: string
  views: number
  stars: number
  ratings: number
}

const MOST_VIEWED: Listing[] = [
  { slot: 'mv-1', title: 'school talent show', runtime: '06:00', added: '3 months ago', by: 'benwhoelse', views: 27783328, stars: 4.5, ratings: 31035 },
  { slot: 'mv-2', title: 'theme tune done badly', runtime: '03:14', added: '7 months ago', by: 'twolads', views: 13536776, stars: 4.5, ratings: 39370 },
  { slot: 'mv-3', title: 'opening titles remade at home', runtime: '00:59', added: '4 months ago', by: 'TexMachina', views: 8102305, stars: 4.5, ratings: 12472 },
  { slot: 'mv-4', title: 'the whole thing in eleven minutes', runtime: '11:16', added: '5 months ago', by: 'eggtea', views: 6824675, stars: 4.5, ratings: 10589 },
  { slot: 'mv-5', title: 'hey clip', runtime: '03:25', added: '10 months ago', by: 'tasha', views: 6725421, stars: 3.5, ratings: 21615 },
  { slot: 'mv-6', title: 'comic soccer', runtime: '03:25', added: '4 months ago', by: 'hyjeak61', views: 6424715, stars: 4.5, ratings: 5807 },
  { slot: 'mv-7', title: 'guitar', runtime: '05:20', added: '6 months ago', by: 'guitar90', views: 6156392, stars: 4.5, ratings: 46546 },
  { slot: 'mv-8', title: 'urban ninja', runtime: '03:05', added: '10 months ago', by: 'mrWoot', views: 6152568, stars: 4.5, ratings: 22807 },
  { slot: 'mv-9', title: 'the cat does the thing again', runtime: '01:03', added: '6 months ago', by: 'n4vi3gurlz', views: 6078744, stars: 4.5, ratings: 4534 },
  { slot: 'mv-10', title: 'MY CRAZY COMPUTER BUG', runtime: '00:11', added: '5 months ago', by: 'marklaptop', views: 6070304, stars: 4.5, ratings: 9596 },
  { slot: 'mv-11', title: 'dancing in the kitchen', runtime: '02:12', added: '8 months ago', by: 'kiernanp', views: 5884110, stars: 4, ratings: 7731 },
  { slot: 'mv-12', title: 'keepy uppies on the pitch', runtime: '01:48', added: '9 months ago', by: 'ronnie_10', views: 5610298, stars: 4.5, ratings: 14002 },
  { slot: 'mv-13', title: 'crowd goes mad', runtime: '00:44', added: '7 months ago', by: 'gigbootleg', views: 5402117, stars: 4, ratings: 3318 },
  { slot: 'mv-14', title: 'late night telly from japan', runtime: '03:40', added: '11 months ago', by: 'nightowl22', views: 5214660, stars: 4.5, ratings: 8890 },
  { slot: 'mv-15', title: 'five feet', runtime: '02:58', added: '5 months ago', by: 'stagecrewuk', views: 5102884, stars: 4, ratings: 2641 },
]

export function MostViewed({ sub }: { sub: string }) {
  const [range, setRange] = useState('All Time')
  return (
    <section className="yp-box">
      <header>
        <h2>{sub}</h2>
        <span className="yp-ranges">
          {['Today', 'This Week', 'This Month', 'All Time'].map((r, i, all) => (
            <span key={r}>
              {r === range ? <b>{r}</b> : <a onClick={() => setRange(r)}>{r}</a>}
              {i < all.length - 1 ? ' | ' : ''}
            </span>
          ))}
        </span>
        <span className="yp-count">Videos 1-{MOST_VIEWED.length} of 100</span>
      </header>

      <ul className="yp-grid">
        {MOST_VIEWED.map((v) => (
          <li key={v.slot}>
            <Slot name={v.slot} className="wide" />
            <a className="yp-gtitle">{v.title}</a>
            <b>{v.runtime}</b>
            <i>Added: {v.added}</i>
            <i>
              From: <a>{v.by}</a>
            </i>
            <i>Views: {v.views.toLocaleString()}</i>
            <Stars value={v.stars} />
            <i>{v.ratings.toLocaleString()} ratings</i>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------------- Categories ---------------- */

const CATEGORIES = [
  { slot: 'cat-arts', name: 'Arts & Animation', today: 4542, total: 293658, blurb: 'Fine Arts, Machinima, Anime...', tags: ['song', 'cartoon', 'show', 'cartoons'] },
  { slot: 'cat-autos', name: 'Autos & Vehicles', today: 965, total: 82185, blurb: 'Cars, Racing, Accessorizing...', tags: ['car', 'unpimp', 'crash', 'traffic'] },
  { slot: 'cat-comedy', name: 'Comedy', today: 8447, total: 813605, blurb: 'Bloopers, Pranks, Improv, Silliness...', tags: ['crazy', 'funny', 'song', 'comedy'] },
  { slot: 'cat-ent', name: 'Entertainment', today: 9497, total: 855048, blurb: 'Short Movies, Random Weirdness...', tags: ['dance', 'comedy', 'asian', 'hip'] },
  { slot: 'cat-music', name: 'Music', today: 10668, total: 859686, blurb: 'Singing, Dancing, Indie Bands...', tags: ['music', 'dance', 'video', 'crazy'] },
  { slot: 'cat-news', name: 'News & Blogs', today: 1237, total: 124452, blurb: 'News, Blogs, Local Issues...', tags: ['techno', 'trance', 'report', 'live'] },
  { slot: 'cat-people', name: 'People', today: 5940, total: 518625, blurb: 'Celebrities, Personals, Family Events...', tags: ['song', 'ninja', 'party', 'anna'] },
  { slot: 'cat-pets', name: 'Pets & Animals', today: 1256, total: 98413, blurb: 'Dogs, Cats, Fish, Birds, Bears...', tags: ['cute', 'cat', 'puppy', 'dog'] },
  { slot: 'cat-sci', name: 'Science & Technology', today: 601, total: 83415, blurb: 'Gadgets, Robots, Computers...', tags: ['ito', 'desktop', 'japan', 'urawaza'] },
  { slot: 'cat-sports', name: 'Sports', today: 4486, total: 357766, blurb: 'Extreme, Competitions, Skateboarding...', tags: ['soccer', 'football', 'goals', 'nike'] },
  { slot: 'cat-travel', name: 'Travel & Places', today: 1233, total: 77268, blurb: 'Vacations, Nature, Monuments...', tags: ['machine', '2006', 'cute', 'matt'] },
  { slot: 'cat-games', name: 'Video Games', today: 2718, total: 200958, blurb: 'Demos, Previews, Game Play...', tags: ['game', 'video', 'games', 'mario'] },
]

export function Categories() {
  return (
    <section className="yp-box">
      <header>
        <h2>All Categories</h2>
      </header>
      <ul className="yp-cats">
        {CATEGORIES.map((c) => (
          <li key={c.slot}>
            <div className="yp-cattop">
              <Slot name={c.slot} className="cat" />
              <div>
                <a className="yp-catname">{c.name}</a>
                <i>Today: {c.today.toLocaleString()}</i>
                <i>Total: {c.total.toLocaleString()}</i>
              </div>
            </div>
            <p className="yp-catblurb">{c.blurb}</p>
            <p className="yp-cattags">
              <span>Tags:</span>{' '}
              {c.tags.map((t) => (
                <a key={t}>{t}</a>
              ))}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------------- Channels ---------------- */

const CHANNELS = [
  { slot: 'ch-1', name: 'LisaNova', viewed: 99630, subs: 1218 },
  { slot: 'ch-2', name: 'impytherap', viewed: 16827, subs: 791 },
  { slot: 'ch-3', name: 'halftime5050', viewed: 34461, subs: 690 },
  { slot: 'ch-4', name: 'faithz183', viewed: 34552, subs: 478 },
  { slot: 'ch-5', name: '183club2', viewed: 37929, subs: 418 },
  { slot: 'ch-6', name: 'implementdesign', viewed: 43353, subs: 369 },
  { slot: 'ch-7', name: 'alemania2006', viewed: 18848, subs: 325 },
  { slot: 'ch-8', name: 'zippieALBA', viewed: 33527, subs: 322 },
  { slot: 'ch-9', name: 'thecavaliers', viewed: 39900, subs: 257 },
  { slot: 'ch-10', name: 'hotmovie', viewed: 26574, subs: 250 },
  { slot: 'ch-11', name: 'twogirlstalking', viewed: 58719, subs: 245 },
  { slot: 'ch-12', name: 'Ooolalaa', viewed: 22155, subs: 243 },
  { slot: 'ch-13', name: 'hair2hair', viewed: 56652, subs: 230 },
  { slot: 'ch-14', name: 'thizzellebear', viewed: 3381, subs: 184 },
  { slot: 'ch-15', name: 'mingdaorawks2', viewed: 16064, subs: 176 },
  { slot: 'ch-16', name: 'vontana', viewed: 8385, subs: 175 },
  { slot: 'ch-17', name: 'seanbedlam', viewed: 5849, subs: 158 },
  { slot: 'ch-18', name: 'akaLOWKEYY', viewed: 9440, subs: 158 },
  { slot: 'ch-19', name: 'manyhighways', viewed: 24068, subs: 140 },
  { slot: 'ch-20', name: 'klaussowieso', viewed: 44639, subs: 120 },
]

export function Channels({ sub }: { sub: string }) {
  const [range, setRange] = useState('This Month')
  return (
    <section className="yp-box">
      <header>
        <h2>
          {sub} ({range})
        </h2>
        <span className="yp-ranges">
          {['This Month', '3 Months', 'All Time'].map((r, i, all) => (
            <span key={r}>
              {r === range ? <b>{r}</b> : <a onClick={() => setRange(r)}>{r}</a>}
              {i < all.length - 1 ? ' | ' : ''}
            </span>
          ))}
        </span>
        <span className="yp-count">Channels 1-{CHANNELS.length} of 40</span>
      </header>

      <ul className="yp-grid channels">
        {CHANNELS.map((c) => (
          <li key={c.slot}>
            <Slot name={c.slot} className="square" />
            <a className="yp-gtitle">{c.name}</a>
            <i>Viewed: {c.viewed.toLocaleString()}</i>
            <i>Subscribers: {c.subs.toLocaleString()}</i>
          </li>
        ))}
      </ul>

      <div className="yp-pager">
        Channels Page: <b>1</b> <a>2</a> <a>Next</a>
      </div>
    </section>
  )
}

/* ---------------- Join ---------------- */

export function Join() {
  const [form, setForm] = useState({ email: '', user: '', pass: '', confirm: '', postal: '' })
  const [note, setNote] = useState<string | null>(null)
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="yp-join">
      <h1>Join YouTube</h1>

      <div className="yp-joincols">
        <section className="yp-signup">
          <h2>Sign Up</h2>
          <p>
            Joining YouTube is free and easy. Just fill out the account information below.
            <br />
            <span className="yp-required">(All fields required)</span>
          </p>
          <p className="yp-musician">
            Are you a musician? <a>Sign up</a> for a musician account.{' '}
            <span className="yp-new">NEW</span>
          </p>

          <table className="yp-form">
            <tbody>
              <tr>
                <th>Email Address:</th>
                <td>
                  <input
                    className="wide"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>User Name:</th>
                <td>
                  <input value={form.user} onChange={(e) => set('user', e.target.value)} />
                </td>
              </tr>
              <tr>
                <th>Password:</th>
                <td>
                  <input
                    type="password"
                    value={form.pass}
                    onChange={(e) => set('pass', e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Confirm Password:</th>
                <td>
                  <input
                    type="password"
                    value={form.confirm}
                    onChange={(e) => set('confirm', e.target.value)}
                  />
                </td>
              </tr>
              <tr>
                <th>Country:</th>
                <td>
                  <select className="wide" defaultValue="">
                    <option value="">---</option>
                    <option>United Kingdom</option>
                    <option>United States</option>
                    <option>Canada</option>
                    <option>Australia</option>
                  </select>
                </td>
              </tr>
              <tr>
                <th>Postal Code:</th>
                <td>
                  <input value={form.postal} onChange={(e) => set('postal', e.target.value)} />
                  <small>Required for US, UK &amp; Canada Only</small>
                </td>
              </tr>
              <tr>
                <th>Gender:</th>
                <td className="yp-gender">
                  <label>
                    <input type="radio" name="yp-g" /> Male
                  </label>
                  <label>
                    <input type="radio" name="yp-g" /> Female
                  </label>
                </td>
              </tr>
              <tr>
                <th>Date of Birth:</th>
                <td className="yp-dob">
                  <select defaultValue="">
                    <option value="">---</option>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                  <select defaultValue="">
                    <option value="">---</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                  <select defaultValue="">
                    <option value="">---</option>
                    {Array.from({ length: 40 }, (_, i) => 1990 - i).map((y) => (
                      <option key={y}>{y}</option>
                    ))}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>

          <label className="yp-weekly">
            <input type="checkbox" defaultChecked /> Sign me up for &quot;The Weekly Tube&quot;
            email
          </label>

          <p className="yp-certify">
            - I certify I am over 13 years old.
            <br />- I agree to the <a>terms of use</a> and <a>privacy policy</a>.
          </p>

          <button
            className="yp-btn"
            onClick={() =>
              setNote(
                form.email.trim() && form.user.trim()
                  ? 'That user name is already taken. Please choose another.'
                  : 'Please fill out all of the fields.'
              )
            }
          >
            Sign Up
          </button>

          {note ? <p className="yp-formnote">{note}</p> : null}
        </section>

        <section className="yp-login">
          <h2>Log In</h2>
          <p>Already a Member? Login here.</p>

          <table className="yp-form">
            <tbody>
              <tr>
                <th>User Name:</th>
                <td>
                  <input className="wide" />
                </td>
              </tr>
              <tr>
                <th>Password:</th>
                <td>
                  <input className="wide" type="password" />
                </td>
              </tr>
              <tr>
                <th />
                <td>
                  <button className="yp-btn" onClick={() => setNote('Those details do not match.')}>
                    Log In
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <p className="yp-forgot">
            Forgot: <a>Username</a> | <a>Password</a>
          </p>

          <h2 className="yp-whatis">What Is YouTube?</h2>
          <p>
            YouTube is a way to get your videos to the people who matter to you. With YouTube you
            can:
          </p>
          <ul className="yp-bullets">
            <li>Upload, tag and share your videos worldwide</li>
            <li>Browse thousands of original videos uploaded by community members</li>
            <li>Find, join and create video groups to connect with people with similar interests</li>
            <li>Customize your experience with playlists and subscriptions</li>
            <li>Integrate YouTube with your website using video embeds or APIs</li>
          </ul>
          <p>
            To learn more about our service, please see the <a>Help Center</a>.
          </p>
        </section>
      </div>
    </div>
  )
}

/* ---------------- About ---------------- */

export function About() {
  return (
    <div className="yp-about">
      <div className="yp-aboutmain">
        <h1>About YouTube</h1>
        <p>
          Founded in February 2005, YouTube is a consumer media company for people to watch and
          share original videos worldwide through a Web experience.
        </p>
        <p>
          Everyone can watch videos on YouTube&mdash;both on YouTube.com and across the Internet.
          People can see first-hand accounts of current events, find videos about their hobbies and
          interests, and discover the quirky and unusual. As more people capture special moments on
          video, YouTube is empowering them to become the broadcasters of tomorrow.
        </p>

        <h2>What is YouTube?</h2>
        <p>
          YouTube is a place for people to engage in new ways with video by sharing, commenting on,
          and viewing videos. YouTube originally started as a personal video sharing service, and
          has grown into an entertainment destination with people watching more than 70 million
          videos on the site daily.
        </p>
        <p>With YouTube, people can:</p>
        <ul className="yp-bullets">
          <li>Upload, tag and share videos worldwide</li>
          <li>Browse millions of original videos uploaded by community members</li>
          <li>Find, join and create video groups to connect with people who have similar interests</li>
          <li>Customize the experience by subscribing to member videos, saving favorites, and creating playlists</li>
          <li>Integrate YouTube videos on websites using video embeds or APIs</li>
          <li>
            Make videos public or private&mdash;users can elect to broadcast their videos publicly
            or share them privately with friends and family upon upload
          </li>
        </ul>
        <p>
          YouTube is building a community that is highly motivated to watch and share videos. The
          service is free for everyone. We always encourage our users to <a>contact us</a> with
          thoughts, suggestions, feedback or otherwise random ramblings. Make sure to check out our{' '}
          <a>Blog</a> to keep up to date on all the latest YouTube developments.
        </p>
      </div>

      <aside className="yp-aboutnav">
        <a className="on">About YouTube</a>
        <a>Press Room</a>
        <a>Contact Us</a>
        <a>Jobs at YouTube</a>
        <a>Help Center</a>
      </aside>
    </div>
  )
}
