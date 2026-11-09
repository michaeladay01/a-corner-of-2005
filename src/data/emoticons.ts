// Classic MSN smileys, drawn with CSS/SVG rather than font emoji.
export type Emoticon = {
  code: string
  alt: string[]
  name: string
  src: string
  animated?: boolean
}

const svg = (body: string, size = 19) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 19 19">${body}</svg>`
  )}`

const face = (inner: string, fill = '#ffd93b') =>
  svg(
    `<defs><radialGradient id="f" cx="35%" cy="30%"><stop offset="0" stop-color="#fff6b0"/><stop offset="1" stop-color="${fill}"/></radialGradient></defs>
     <circle cx="9.5" cy="9.5" r="8.5" fill="url(#f)" stroke="#9a7500"/>${inner}`
  )

const eyes = `<circle cx="6.6" cy="7.6" r="1.1" fill="#3a2a00"/><circle cx="12.4" cy="7.6" r="1.1" fill="#3a2a00"/>`

export const EMOTICONS: Emoticon[] = [
  { code: ':)', alt: [':-)'], name: 'Smile', src: face(`${eyes}<path d="M5.6 11.6 q3.9 3.4 7.8 0" stroke="#3a2a00" stroke-width="1.2" fill="none" stroke-linecap="round"/>`) },
  { code: ':D', alt: [':-D'], name: 'Open-mouthed', src: face(`${eyes}<path d="M5 11 q4.5 5 9 0 z" fill="#5a2a00"/>`) },
  { code: ':(', alt: [':-('], name: 'Sad', src: face(`${eyes}<path d="M5.6 13 q3.9 -3.4 7.8 0" stroke="#3a2a00" stroke-width="1.2" fill="none" stroke-linecap="round"/>`) },
  { code: ';)', alt: [';-)'], name: 'Winking', src: face(`<path d="M5.4 7.6 h2.4" stroke="#3a2a00" stroke-width="1.2"/><circle cx="12.4" cy="7.6" r="1.1" fill="#3a2a00"/><path d="M5.6 11.6 q3.9 3.4 7.8 0" stroke="#3a2a00" stroke-width="1.2" fill="none" stroke-linecap="round"/>`) },
  { code: ':P', alt: [':-P'], name: 'Tongue out', src: face(`${eyes}<path d="M5.6 11.4 q3.9 2.6 7.8 0" stroke="#3a2a00" stroke-width="1.2" fill="none"/><path d="M9 13 q2.6 .6 2.2 3 q-2.6 .4 -3 -2.4Z" fill="#e2566f"/>`) },
  { code: ':O', alt: [':-O'], name: 'Surprised', src: face(`${eyes}<ellipse cx="9.5" cy="12.6" rx="2.1" ry="2.6" fill="#5a2a00"/>`) },
  { code: ':S', alt: [':-S'], name: 'Confused', src: face(`${eyes}<path d="M5.8 12.4 q1.9 -2 3.7 0 q1.9 2 3.7 0" stroke="#3a2a00" stroke-width="1.2" fill="none"/>`) },
  { code: ":'(", alt: [], name: 'Crying', src: face(`${eyes}<path d="M5.6 13 q3.9 -3 7.8 0" stroke="#3a2a00" stroke-width="1.2" fill="none"/><path d="M6.2 9 q-.8 3 .2 5" stroke="#3aa0e0" stroke-width="1.4" fill="none"/>`, '#ffcf2e') },
  { code: '(H)', alt: ['8-)'], name: 'Cool', src: face(`<rect x="3.6" y="6.2" width="12" height="3.2" rx="1.2" fill="#15151c"/><path d="M5.6 12.2 q3.9 3 7.8 0" stroke="#3a2a00" stroke-width="1.2" fill="none"/>`) },
  { code: ':@', alt: [], name: 'Angry', src: face(`<path d="M4.6 6 l3.4 1.6 M14.4 6 l-3.4 1.6" stroke="#6a1000" stroke-width="1.3"/><circle cx="6.8" cy="9" r="1" fill="#3a2a00"/><circle cx="12.2" cy="9" r="1" fill="#3a2a00"/><path d="M6 13.4 h7" stroke="#6a1000" stroke-width="1.4"/>`, '#ff8a3a') },
  { code: '(A)', alt: [], name: 'Angel', src: face(`${eyes}<path d="M5.6 11.6 q3.9 3 7.8 0" stroke="#3a2a00" stroke-width="1.2" fill="none"/><ellipse cx="9.5" cy="2.2" rx="4.4" ry="1.4" fill="none" stroke="#f2d04a" stroke-width="1.2"/>`) },
  { code: '(6)', alt: [], name: 'Devil', src: face(`${eyes}<path d="M5.6 11.6 q3.9 3 7.8 0" stroke="#3a0000" stroke-width="1.2" fill="none"/><path d="M2.6 4 l2.6 2.2 M16.4 4 l-2.6 2.2" stroke="#8a0000" stroke-width="1.6"/>`, '#ef4b3a') },
  { code: '(L)', alt: ['<3'], name: 'Red heart', src: svg(`<path d="M9.5 17 L2 9 a4.2 4.2 0 0 1 7.5-2.6 A4.2 4.2 0 0 1 17 9 Z" fill="#e3005f" stroke="#8a0038"/><path d="M6 7.2 a2 2 0 0 1 2-1.2" stroke="#fff" stroke-width="1" opacity=".7" fill="none"/>`) },
  { code: '(U)', alt: [], name: 'Broken heart', src: svg(`<path d="M9.5 17 L2 9 a4.2 4.2 0 0 1 7.5-2.6 A4.2 4.2 0 0 1 17 9 Z" fill="#e3005f" stroke="#8a0038"/><path d="M9.5 4 l-1.6 4 l2.6 2 l-1.8 4" stroke="#fff" stroke-width="1.4" fill="none"/>`) },
  { code: '(F)', alt: [], name: 'Rose', src: svg(`<path d="M9.5 18 V9" stroke="#2f7a2f" stroke-width="1.4"/><path d="M9.5 13 q-4 -1 -4.6 -3.4 q3.8 -.6 4.6 3.4Z" fill="#2f7a2f"/><circle cx="9.5" cy="6" r="4" fill="#e01f4a"/><circle cx="9.5" cy="6" r="2" fill="#ff6b8a"/>`) },
  { code: '(S)', alt: [], name: 'Sleeping moon', src: svg(`<path d="M12 2 a7.6 7.6 0 1 0 5 12 A8.6 8.6 0 0 1 12 2Z" fill="#f2e07a" stroke="#9a8400"/>`) },
  { code: '(*)', alt: [], name: 'Star', src: svg(`<path d="M9.5 1.5 L11.4 7 L17.4 7 L12.6 10.6 L14.4 16.4 L9.5 12.8 L4.6 16.4 L6.4 10.6 L1.6 7 L7.6 7Z" fill="#ffd400" stroke="#a97400"/>`) },
  { code: '(})', alt: [], name: 'Hug', src: face(`${eyes}<path d="M5.6 11.6 q3.9 3 7.8 0" stroke="#3a2a00" stroke-width="1.2" fill="none"/><path d="M1.6 9 q1 4 4 5 M17.4 9 q-1 4 -4 5" stroke="#9a7500" stroke-width="1.3" fill="none"/>`) },
  { code: '(Y)', alt: [], name: 'Thumbs up', src: svg(`<path d="M6 17 V8 h3 l2-6 q2.4 .4 1.6 3 l-.7 2.2 h3.5 a1.6 1.6 0 0 1 1.5 2 l-1.4 6 a2 2 0 0 1 -1.9 1.8Z" fill="#ffd93b" stroke="#9a7500"/><rect x="1.6" y="8" width="4" height="9" rx="1" fill="#f2c21e" stroke="#9a7500"/>`) },
  { code: '(C)', alt: [], name: 'Coffee cup', src: svg(`<path d="M2.6 5 h11 v6 a4 4 0 0 1 -4 4 H6.6 a4 4 0 0 1 -4 -4Z" fill="#fff" stroke="#6a6a7a"/><path d="M13.6 6.4 h2.4 a2 2 0 0 1 0 4 h-2.4" fill="none" stroke="#6a6a7a"/><path d="M3.6 6.6 h9 v2 h-9Z" fill="#6a3a10"/>`) },
  { code: '(T)', alt: [], name: 'Telephone', src: svg(`<path d="M3 3 l3.6-.6 1.6 4 -2 1.4 a8 8 0 0 0 4.4 4.4 l1.4-2 4 1.6 -.6 3.6 a2 2 0 0 1 -2.2 1.6 C8 16.4 2.6 11 1.4 5.2 A2 2 0 0 1 3 3Z" fill="#2a2a34" stroke="#101018"/>`) },
  { code: '(I)', alt: [], name: 'Lightbulb', src: svg(`<circle cx="9.5" cy="7.6" r="5.2" fill="#fff07a" stroke="#9a8400"/><rect x="7.4" y="12.4" width="4.2" height="4" rx="1" fill="#b0b0bc" stroke="#70707c"/>`) },
  { code: '(E)', alt: [], name: 'Envelope', src: svg(`<rect x="1.6" y="4.4" width="15.8" height="10.2" rx="1" fill="#fff" stroke="#5a7aa0"/><path d="M1.6 4.8 L9.5 10.6 L17.4 4.8" fill="none" stroke="#5a7aa0"/>`) },
  { code: '(M)', alt: [], name: 'MSN butterfly', src: svg(`<path d="M9.5 4 C6 -0.4 1 2.6 2.6 7.6 C3.6 11 7 13 9.5 15 C12 13 15.4 11 16.4 7.6 C18 2.6 13 -0.4 9.5 4Z" fill="#2f8fd8" stroke="#13507e"/><path d="M9.5 5.4 C7.4 2.8 4.2 4.6 5.2 7.6" fill="#8fd0f4" opacity=".8"/>`) },
]

const CODE_INDEX = (() => {
  const map = new Map<string, Emoticon>()
  for (const e of EMOTICONS) {
    map.set(e.code, e)
    for (const a of e.alt) map.set(a, e)
  }
  return map
})()

const ALL_CODES = [...CODE_INDEX.keys()].sort((a, b) => b.length - a.length)

export type Token = { type: 'text'; value: string } | { type: 'emoticon'; emoticon: Emoticon }

export function tokenize(text: string): Token[] {
  const out: Token[] = []
  let buf = ''
  let i = 0
  outer: while (i < text.length) {
    const upper = text.slice(i).toUpperCase()
    for (const code of ALL_CODES) {
      if (upper.startsWith(code.toUpperCase())) {
        if (buf) {
          out.push({ type: 'text', value: buf })
          buf = ''
        }
        out.push({ type: 'emoticon', emoticon: CODE_INDEX.get(code)! })
        i += code.length
        continue outer
      }
    }
    buf += text[i]
    i += 1
  }
  if (buf) out.push({ type: 'text', value: buf })
  return out
}
