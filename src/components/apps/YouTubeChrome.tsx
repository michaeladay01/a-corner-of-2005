import { LogoImg } from '../Icons'

/* The header both YouTube pages share from 2006: the wordmark with its
   strapline, the account links, the search box, the rounded blue tabs and
   the grey strip of personal links beneath them. */

export const TABS = ['Home', 'Videos', 'Channels', 'Groups', 'Categories', 'Upload'] as const
export type Tab = (typeof TABS)[number]

const MINE = ['Inbox', 'My Subscriptions', 'My Playlists', 'My Groups', 'My Profile']

export type Page =
  | 'home'
  | 'videos'
  | 'channels'
  | 'groups'
  | 'categories'
  | 'upload'
  | 'join'
  | 'about'

/** Which tab lights up for a given page. */
export const TAB_FOR: Record<Page, Tab | null> = {
  home: 'Home',
  videos: 'Videos',
  channels: 'Channels',
  groups: 'Groups',
  categories: 'Categories',
  upload: 'Upload',
  join: null,
  about: null,
}

const SUBNAV: Partial<Record<Page, string[]>> = {
  videos: [
    'Most Recent',
    'Most Viewed',
    'Top Rated',
    'Most Discussed',
    'Top Favorites',
    'Most Linked',
    'Recently Featured',
    'Worst Rated',
  ],
  channels: ['Most Subscribed Channels', 'Recent Channels', 'Most Viewed Channels'],
}

export function YouTubeChrome({
  active,
  onNav,
  search,
  setSearch,
  onSearch,
  sub,
  onSub,
}: {
  active: Tab | null
  onNav: (p: Page) => void
  search: string
  setSearch: (v: string) => void
  onSearch: () => void
  sub?: string
  onSub?: (s: string) => void
}) {
  const page = (Object.keys(TAB_FOR) as Page[]).find((p) => TAB_FOR[p] === active)
  const subLinks = page ? SUBNAV[page] : undefined
  return (
    <div className="yc">
      <div className="yc-top">
        <button className="yc-brand" onClick={() => onNav('home')} title="YouTube">
          <LogoImg name="youtube" size={212} height={66}>
            <span className="yc-wordmark">
              You<b>Tube</b>
            </span>
          </LogoImg>
          <span className="yc-strap">
            Broadcast Yourself<sup>&trade;</sup>
          </span>
        </button>

        <div className="yc-right">
          <nav className="yc-account">
            <a onClick={() => onNav('join')}>Sign Up</a> |{' '}
            <a onClick={() => onNav('join')}>Log In</a> | <a>Viewing History</a> |{' '}
            <a onClick={() => onNav('about')}>Help</a>
          </nav>
          <div className="yc-search">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearch()}
              aria-label="Search"
            />
            <select defaultValue="Videos">
              <option>Videos</option>
              <option>Channels</option>
              <option>Groups</option>
            </select>
            <button onClick={onSearch}>Search</button>
          </div>
        </div>
      </div>

      <nav className="yc-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={t === active ? 'on' : ''}
            onClick={() => onNav(t.toLowerCase() as Page)}
          >
            {t}
          </button>
        ))}
      </nav>

      <nav className="yc-mine">
        {(subLinks ?? MINE).map((m, i, all) => (
          <span key={m}>
            <a
              className={subLinks && m === sub ? 'on' : ''}
              onClick={() => subLinks && onSub?.(m)}
            >
              {m}
            </a>
            {i < all.length - 1 ? <b>|</b> : null}
          </span>
        ))}
      </nav>
    </div>
  )
}
