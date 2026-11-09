// Nostalgic display pictures, drawn as inline SVG so there are no binary assets.

const wrap = (bg: string, inner: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">${bg}${inner}</svg>`
  )}`

const grad = (id: string, a: string, b: string) =>
  `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="96" height="96" fill="url(#${id})"/>`

export type DisplayPicture = { id: string; label: string; src: string }

export const DISPLAY_PICTURES: DisplayPicture[] = [
  {
    id: 'smiley',
    label: 'Classic Smiley',
    src: wrap(
      grad('g1', '#ffe266', '#f0a800'),
      `<circle cx="48" cy="48" r="30" fill="#ffd93b" stroke="#a97400" stroke-width="2"/>
       <circle cx="38" cy="42" r="4" fill="#4a3000"/><circle cx="58" cy="42" r="4" fill="#4a3000"/>
       <path d="M34 56 q14 14 28 0" stroke="#4a3000" stroke-width="4" fill="none" stroke-linecap="round"/>`
    ),
  },
  {
    id: 'flames',
    label: 'Flames',
    src: wrap(
      grad('g2', '#2b0a00', '#7a1b00'),
      `<path d="M48 84 C20 70 28 50 40 36 C42 48 50 48 50 40 C64 50 74 66 48 84Z" fill="#ff8a00"/>
       <path d="M48 80 C32 70 36 56 44 46 C46 56 52 56 52 50 C62 58 66 70 48 80Z" fill="#ffd400"/>`
    ),
  },
  {
    id: 'heart',
    label: 'Pixel Heart',
    src: wrap(
      grad('g3', '#ffd9ec', '#ff6fae'),
      `<path d="M48 78 L22 52 a16 16 0 0 1 26-18 a16 16 0 0 1 26 18 Z" fill="#e3005f" stroke="#8a0038" stroke-width="2"/>
       <circle cx="38" cy="44" r="5" fill="#fff" opacity=".7"/>`
    ),
  },
  {
    id: 'skull',
    label: 'Skull',
    src: wrap(
      grad('g4', '#4a4a55', '#14141a'),
      `<path d="M48 18 c16 0 24 12 24 26 c0 10-6 12-6 20 c0 8-8 12-18 12 s-18-4-18-12 c0-8-6-10-6-20 c0-14 8-26 24-26Z" fill="#f2f1e8"/>
       <circle cx="39" cy="46" r="7" fill="#1a1a20"/><circle cx="57" cy="46" r="7" fill="#1a1a20"/>
       <path d="M44 60 h8 l-4 8Z" fill="#1a1a20"/>`
    ),
  },
  {
    id: 'cat',
    label: 'Kitten',
    src: wrap(
      grad('g5', '#dff4ff', '#8fd2ff'),
      `<path d="M26 40 L22 22 L40 32Z M70 40 L74 22 L56 32Z" fill="#8a6a52"/>
       <ellipse cx="48" cy="54" rx="26" ry="22" fill="#c89b76"/>
       <circle cx="39" cy="50" r="4" fill="#20160f"/><circle cx="57" cy="50" r="4" fill="#20160f"/>
       <path d="M48 58 l-4 4 M48 58 l4 4" stroke="#20160f" stroke-width="2"/>
       <path d="M20 54 h14 M20 60 h14 M62 54 h14 M62 60 h14" stroke="#fff" stroke-width="2" opacity=".8"/>`
    ),
  },
  {
    id: 'alien',
    label: 'Alien',
    src: wrap(
      grad('g6', '#07211a', '#0b4a33'),
      `<ellipse cx="48" cy="48" rx="24" ry="30" fill="#7dff9e"/>
       <ellipse cx="38" cy="44" rx="7" ry="11" fill="#06220f" transform="rotate(-12 38 44)"/>
       <ellipse cx="58" cy="44" rx="7" ry="11" fill="#06220f" transform="rotate(12 58 44)"/>
       <path d="M42 66 q6 4 12 0" stroke="#06220f" stroke-width="3" fill="none"/>`
    ),
  },
  {
    id: 'guitar',
    label: 'Guitar',
    src: wrap(
      grad('g7', '#1a1430', '#4b2a70'),
      `<rect x="44" y="14" width="8" height="38" fill="#c08b4a"/>
       <ellipse cx="48" cy="64" rx="22" ry="18" fill="#e0a35c"/>
       <circle cx="48" cy="64" r="7" fill="#3a2410"/>
       <rect x="40" y="10" width="16" height="8" rx="2" fill="#8a5c2a"/>`
    ),
  },
  {
    id: 'football',
    label: 'Football',
    src: wrap(
      grad('g8', '#dff7d8', '#5bb24a'),
      `<circle cx="48" cy="48" r="28" fill="#fff" stroke="#333" stroke-width="2"/>
       <path d="M48 30 l10 8 -4 12 h-12 l-4 -12Z" fill="#222"/>
       <path d="M48 20 v10 M24 44 l14 6 M72 44 l-14 6 M34 72 l8 -10 M62 72 l-8 -10" stroke="#222" stroke-width="2"/>`
    ),
  },
  {
    id: 'star',
    label: 'Sparkle Star',
    src: wrap(
      grad('g9', '#fff6c9', '#ffb300'),
      `<path d="M48 16 L57 40 L82 40 L62 55 L70 79 L48 64 L26 79 L34 55 L14 40 L39 40Z" fill="#fff" stroke="#b36b00" stroke-width="2"/>`
    ),
  },
  {
    id: 'eightball',
    label: '8 Ball',
    src: wrap(
      grad('g10', '#2a2a2a', '#000'),
      `<circle cx="48" cy="48" r="28" fill="#111"/>
       <circle cx="48" cy="48" r="13" fill="#fff"/>
       <text x="48" y="55" font-family="Arial" font-size="20" font-weight="bold" text-anchor="middle" fill="#111">8</text>
       <circle cx="38" cy="36" r="6" fill="#fff" opacity=".25"/>`
    ),
  },
  {
    id: 'flower',
    label: 'Daisy',
    src: wrap(
      grad('g11', '#eafbff', '#9fe0c0'),
      `<g fill="#fff" stroke="#c9c9c9">
        <ellipse cx="48" cy="28" rx="8" ry="14"/><ellipse cx="48" cy="68" rx="8" ry="14"/>
        <ellipse cx="28" cy="48" rx="14" ry="8"/><ellipse cx="68" cy="48" rx="14" ry="8"/>
       </g><circle cx="48" cy="48" r="10" fill="#ffd400"/>`
    ),
  },
  {
    id: 'lightning',
    label: 'Lightning',
    src: wrap(
      grad('g12', '#0b1a33', '#1d4e8f'),
      `<path d="M54 12 L30 52 h14 l-8 32 L68 40 H52 Z" fill="#ffe14d" stroke="#8a6b00" stroke-width="2"/>`
    ),
  },
  {
    id: 'cd',
    label: 'Burned CD',
    src: wrap(
      grad('g13', '#d8d8e4', '#8b8ba0'),
      `<circle cx="48" cy="48" r="28" fill="#cfd6e6"/>
       <circle cx="48" cy="48" r="28" fill="none" stroke="#9aa4bb"/>
       <circle cx="48" cy="48" r="18" fill="none" stroke="#b9c2d6" stroke-width="6" opacity=".7"/>
       <circle cx="48" cy="48" r="8" fill="#f2f4fa" stroke="#9aa4bb"/>`
    ),
  },
  {
    id: 'msn',
    label: 'Messenger',
    src: wrap(
      grad('g14', '#e9f6ff', '#9fd0f0'),
      `<path d="M26 32 h44 a6 6 0 0 1 6 6 v22 a6 6 0 0 1 -6 6 H44 l-12 10 v-10 h-6 a6 6 0 0 1 -6 -6 V38 a6 6 0 0 1 6 -6Z" fill="#fff" stroke="#2a6fa8" stroke-width="2"/>
       <circle cx="40" cy="49" r="4" fill="#4aa63c"/><circle cx="52" cy="49" r="4" fill="#4aa63c"/><circle cx="64" cy="49" r="4" fill="#4aa63c"/>`
    ),
  },
]

export function initials(name: string) {
  return name
    .replace(/[^a-zA-Z ]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

const PALETTE = [
  ['#ffd0e0', '#d6457f'],
  ['#d4e8ff', '#2f6fb0'],
  ['#d8f3d0', '#3f8a2f'],
  ['#fff0cf', '#c08400'],
  ['#e8ddff', '#6a3fb0'],
  ['#ffdad0', '#c0452a'],
  ['#d0f4f4', '#1f7f80'],
  ['#e6e6ee', '#4a4a60'],
]

export function letterPicture(name: string): string {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 9973
  const [a, b] = PALETTE[h % PALETTE.length]
  return wrap(
    grad(`l${h}`, a, b),
    `<text x="48" y="62" font-family="Trebuchet MS, Tahoma" font-size="38" font-weight="bold" text-anchor="middle" fill="#ffffff" opacity=".92">${initials(name)}</text>`
  )
}

export function pictureSrc(key: string, name: string): string {
  if (key.startsWith('data:')) return key
  const found = DISPLAY_PICTURES.find((p) => p.id === key)
  return found ? found.src : letterPicture(name)
}
