import { useEffect, useRef, useState } from 'react'
import { YouTubeChrome, type Page } from './YouTubeChrome'
import { asset } from '../../lib/asset'

/* The watch page as YouTube had it in 2006: the player with its red scrubber,
   the star rating and view count beneath, the Share / Favorite / Add to
   Playlists / Flag row, and the info panel and Related Videos down the right. */

export type Video = {
  id: string
  title: string
  added: string
  by: string
  views: number
  comments: number
  art: string
  runtime: string
  description: string
  category?: string
  tags?: string[]
  ratings?: number
  stars?: number
}

type Comment = { by: string; when: string; text: string }

/* Invented commenters, in the register of the time. */
const COMMENTS: Comment[] = [
  { by: 'xXcrazyfrogXx', when: '2 days ago', text: 'first!!!' },
  { by: 'dazza_1990', when: '3 days ago', text: 'haha quality. sending this to everyone' },
  {
    by: 'sk8rboi2k5',
    when: '5 days ago',
    text: 'how do u get a video on here? ive tried like 4 times and it never works',
  },
  { by: 'emmaaa_xo', when: '1 week ago', text: 'omg i watched this like 9 times' },
  { by: 'nobody_important', when: '2 weeks ago', text: 'this is so random but i love it' },
]

function clock(t: number) {
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

/* Five stars that can show a half. */
function Stars({ value }: { value: number }) {
  return (
    <span className="yw-stars" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, value - (n - 1)))
        return (
          <span key={n} className="yw-star">
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

/* The player bar: play, a red groove with a round handle, the time, then
   volume, widescreen and fullscreen. */
function Player({ slot, title }: { slot: string; title: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [at, setAt] = useState(0)
  const [len, setLen] = useState(0)
  const [muted, setMuted] = useState(false)
  const [wide, setWide] = useState(false)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    const v = ref.current
    if (v) v.muted = muted
  }, [muted])

  const toggle = () => {
    const v = ref.current
    if (!v || missing) return
    if (v.paused) {
      void v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  const scrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = ref.current
    if (!v || !len) return
    const r = e.currentTarget.getBoundingClientRect()
    v.currentTime = ((e.clientX - r.left) / r.width) * len
  }

  const pct = len ? (at / len) * 100 : 0

  return (
    <div className={`yw-player${wide ? ' wide' : ''}`}>
      <div className="yw-screen" onClick={toggle}>
        <video
          ref={ref}
          src={asset(`youtube/${slot}.mp4`)}
          onError={() => setMissing(true)}
          onLoadedMetadata={(e) => setLen(e.currentTarget.duration)}
          onTimeUpdate={(e) => setAt(e.currentTarget.currentTime)}
          onEnded={() => setPlaying(false)}
          playsInline
        />
        {missing ? (
          <span className="yw-missing">
            <b>Loading...</b>
            <i>{slot}.mp4</i>
          </span>
        ) : null}
      </div>

      <div className="yw-bar">
        <button className="yw-ctl" onClick={toggle} title={playing ? 'Pause' : 'Play'}>
          {playing ? <span className="yw-pause" /> : <span className="yw-play" />}
        </button>

        <div className="yw-groove" onClick={scrub}>
          <div className="yw-played" style={{ width: `${pct}%` }} />
          <div className="yw-handle" style={{ left: `${pct}%` }} />
        </div>

        <span className="yw-time">
          {clock(at)} / {len ? clock(len) : '0:00'}
        </span>

        <button
          className={`yw-ctl${muted ? ' off' : ''}`}
          onClick={() => setMuted((m) => !m)}
          title={muted ? 'Unmute' : 'Mute'}
          aria-label={`${muted ? 'Unmute' : 'Mute'} ${title}`}
        >
          <span className="yw-speaker" />
        </button>
        <button
          className="yw-ctl"
          onClick={() => setWide((w) => !w)}
          title="Widescreen"
          aria-label="Widescreen"
        >
          <span className="yw-widescreen" />
        </button>
        <button className="yw-ctl" title="Full screen" aria-label="Full screen">
          <span className="yw-fullscreen" />
        </button>
      </div>
    </div>
  )
}

export function YouTubeWatch({
  video,
  others,
  onOpen,
  onHome,
  onNav,
}: {
  video: Video
  others: Video[]
  onOpen: (v: Video) => void
  onHome: () => void
  onNav?: (p: Page) => void
}) {
  const [search, setSearch] = useState('')
  const [note, setNote] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [posted, setPosted] = useState<Comment[]>([])
  const [stats, setStats] = useState(false)

  const total = video.comments + posted.length
  const url = `http://www.youtube.com/watch?v=${video.id}MtlZjXpU`
  const embed = `<object width="425" height="350"><param name="mo`

  return (
    <div className="yw">
      <YouTubeChrome
        active="Videos"
        onNav={(p) => (p === 'home' ? onHome() : onNav?.(p))}
        search={search}
        setSearch={setSearch}
        onSearch={() =>
          setNote(
            search.trim()
              ? `Your search for ${search.trim()} did not match any videos.`
              : 'Please enter a search term.'
          )
        }
      />

      {note ? (
        <div className="yw-note">
          {note}
          <button onClick={() => setNote(null)}>close</button>
        </div>
      ) : null}

      <h1 className="yw-title">{video.title}</h1>

      <div className="yw-cols">
        <div className="yw-left">
          <Player slot={video.id} title={video.title} />

          <div className="yw-ratingrow">
            <span className="yw-ratingleft">
              <Stars value={video.stars ?? 4.5} />
              <b>{(video.ratings ?? 3029).toLocaleString()} ratings</b>
            </span>
            <span className="yw-views">Views: {video.views.toLocaleString()}</span>
          </div>

          <ul className="yw-acts">
            <li>
              <span className="yw-ic share" aria-hidden />
              <a>Share</a>
            </li>
            <li>
              <span className="yw-ic heart" aria-hidden />
              <a>Favorite</a>
            </li>
            <li>
              <span className="yw-ic playlist" aria-hidden />
              <a>Add to Playlists</a>
            </li>
            <li>
              <span className="yw-ic flag" aria-hidden />
              <a>Flag</a>
            </li>
          </ul>

          <button className="yw-stats" onClick={() => setStats((s) => !s)}>
            <span className={`yw-tri${stats ? ' open' : ''}`} aria-hidden />
            Statistics &amp; Data
          </button>
          {stats ? (
            <div className="yw-statsbody">
              <p>
                First referenced from a bulletin board on {video.added}. Most viewers are in the
                United Kingdom.
              </p>
            </div>
          ) : null}

          <div className="yw-respheader">
            <h2>Responses ({total})</h2>
            <a>see all &raquo;</a>
          </div>

          <div className="yw-postbox">
            <textarea
              value={comment}
              placeholder="Post a text comment"
              maxLength={400}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              onClick={() => {
                if (!comment.trim()) return
                setPosted((p) => [
                  { by: 'michaela_x0x', when: 'just now', text: comment.trim() },
                  ...p,
                ])
                setComment('')
              }}
            >
              Post Comment
            </button>
          </div>

          <ul className="yw-comments">
            {[...posted, ...COMMENTS].map((c, i) => (
              <li key={`${c.by}-${i}`}>
                <span className="yw-who">
                  <a>{c.by}</a> <i>({c.when})</i>
                </span>
                <p>{c.text}</p>
              </li>
            ))}
          </ul>
        </div>

        <aside className="yw-side">
          {/* The uploader panel with its yellow Subscribe button. */}
          <div className="yw-about">
            <button className="yw-avatar" onClick={() => {}} title={video.by}>
              <img src={asset(`youtube/${video.id}-thumb.jpg`)} alt="" />
            </button>
            <div className="yw-aboutmid">
              <p>
                From: <a>{video.by}</a>
              </p>
              <p>
                Added: <b>{video.added}</b>
              </p>
              <p>
                (<a>More Info</a>)
              </p>
            </div>
            <button className="yw-subscribe">Subscribe</button>
          </div>

          <table className="yw-fields">
            <tbody>
              <tr>
                <th>Category:</th>
                <td>
                  <a>{video.category ?? 'Music'}</a>
                </td>
              </tr>
              <tr>
                <th>Tags:</th>
                <td className="yw-tags">
                  {(video.tags ?? ['video', '2005', video.by]).map((t, i, all) => (
                    <span key={t}>
                      <a>{t}</a>
                      {i < all.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </td>
              </tr>
              <tr>
                <th>URL:</th>
                <td>
                  <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} />
                </td>
              </tr>
              <tr>
                <th>Embed:</th>
                <td>
                  <input readOnly value={embed} onFocus={(e) => e.currentTarget.select()} />
                </td>
              </tr>
            </tbody>
          </table>

          <div className="yw-descblock">
            <b>Description:</b>
            <p>{video.description}</p>
          </div>

          <section className="yw-related">
            <header>
              <b>Related Videos</b>
              <a>see all &raquo;</a>
            </header>
            <ul>
              {others.map((v) => (
                <li key={v.id}>
                  <button className="yw-relthumb" onClick={() => onOpen(v)}>
                    <img src={asset(`youtube/${v.id}-thumb.jpg`)} alt="" />
                    <span className="yw-dur">{v.runtime}</span>
                  </button>
                  <span className="yw-reltext">
                    <a onClick={() => onOpen(v)}>{v.title}</a>
                    <i>by {v.by}</i>
                    <i>{v.views.toLocaleString()} views</i>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )
}
