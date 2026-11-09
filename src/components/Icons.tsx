import { useState, type ReactNode } from 'react'
import type { Presence } from '../data/types'
import { asset } from '../lib/asset'

type P = { size?: number; className?: string }

const s = (size = 16) => ({ width: size, height: size, viewBox: '0 0 16 16' })

/* ---------- MSN presence ---------- */

function Buddy({ body, badge }: { body: string; badge?: string }) {
  return (
    <>
      <circle cx="8" cy="4.6" r="3.1" fill={body} stroke="rgba(0,0,0,.35)" strokeWidth=".7" />
      <path
        d="M2.4 15 C2.4 10.6 5 8.6 8 8.6 S13.6 10.6 13.6 15Z"
        fill={body}
        stroke="rgba(0,0,0,.35)"
        strokeWidth=".7"
      />
      <path d="M5.6 3.2 a3 3 0 0 1 2.6-1.4" stroke="#fff" strokeWidth=".9" fill="none" opacity=".75" />
      {badge}
    </>
  )
}

/**
 * Drop-in logo override. If a file exists at public/logos/<name>.png the app
 * uses it; otherwise it falls back to the drawing below it. Nothing is bundled
 * with the project — you supply the file.
 */
export function LogoImg({
  name,
  size,
  height,
  children,
}: {
  name: string
  size: number
  /** For wordmarks and other non-square logos. Defaults to a square. */
  height?: number
  children: ReactNode
}) {
  const [failed, setFailed] = useState(false)
  if (failed) return <>{children}</>
  return (
    <img
      src={asset(`logos/${name}.png`)}
      width={size}
      height={height ?? size}
      alt=""
      style={{ display: 'block', objectFit: 'contain' }}
      onError={() => setFailed(true)}
    />
  )
}

export function PresenceIcon({ presence, size = 16, className }: P & { presence: Presence }) {
  const common = { ...s(size), className: className ?? 'presence-icon', xmlns: 'http://www.w3.org/2000/svg' }
  switch (presence) {
    case 'online':
      return (
        <svg {...common}>
          <Buddy body="#5ac23f" />
        </svg>
      )
    case 'busy':
      return (
        <svg {...common}>
          <Buddy body="#e0402a" />
          <circle cx="11.8" cy="11.8" r="4" fill="#fff" stroke="#9a1000" strokeWidth=".8" />
          <rect x="9.4" y="11.1" width="4.8" height="1.6" rx=".6" fill="#d41a00" />
        </svg>
      )
    case 'away':
      return (
        <svg {...common}>
          <Buddy body="#e8b11e" />
          <circle cx="11.8" cy="11.8" r="4" fill="#fff" stroke="#8a6500" strokeWidth=".8" />
          <path d="M11.8 9.4 v2.6 h2" stroke="#8a6500" strokeWidth="1.1" fill="none" />
        </svg>
      )
    case 'brb':
      return (
        <svg {...common}>
          <Buddy body="#e8b11e" />
          <circle cx="11.8" cy="11.8" r="4" fill="#fff" stroke="#8a6500" strokeWidth=".8" />
          <path d="M9.9 11.8 h3.8 M12.2 10.3 l1.5 1.5 -1.5 1.5" stroke="#8a6500" strokeWidth="1" fill="none" />
        </svg>
      )
    case 'lunch':
      return (
        <svg {...common}>
          <Buddy body="#e8b11e" />
          <circle cx="11.8" cy="11.8" r="4" fill="#fff" stroke="#8a6500" strokeWidth=".8" />
          <path d="M10.4 9.6 v4.4 M11.4 9.6 v4.4 M13.4 9.6 c.9 1 .6 3.2 -.6 4.4" stroke="#8a6500" strokeWidth=".9" fill="none" />
        </svg>
      )
    case 'phone':
      return (
        <svg {...common}>
          <Buddy body="#e8b11e" />
          <circle cx="11.8" cy="11.8" r="4" fill="#fff" stroke="#8a6500" strokeWidth=".8" />
          <path d="M10 9.9 l1.3-.2 .6 1.4 -.7 .5 a3 3 0 0 0 1.6 1.6 l.5-.7 1.4 .6 -.2 1.3 a.7 .7 0 0 1 -.8 .6 c-2-.4-3.8-2.2-4.2-4.2 a.7 .7 0 0 1 .5-.9Z" fill="#8a6500" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <Buddy body="#b4b4b4" />
        </svg>
      )
  }
}

/* ---------- Branding ---------- */

export function Butterfly({ size = 16, className }: P) {
  return (
    <LogoImg name="msn" size={size}>
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bf-top" x1="0.15" y1="0" x2="0.75" y2="1">
          <stop offset="0" stopColor="#bdeaff" />
          <stop offset="0.35" stopColor="#5cb8ef" />
          <stop offset="0.75" stopColor="#1f7fc9" />
          <stop offset="1" stopColor="#0e5490" />
        </linearGradient>
        <linearGradient id="bf-bot" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#6ec4f2" />
          <stop offset="0.6" stopColor="#1b76c0" />
          <stop offset="1" stopColor="#0b4a82" />
        </linearGradient>
      </defs>

      <g stroke="#0a4574" strokeWidth="1.5" strokeLinejoin="round">
        {/* left pair */}
        <g>
          <path d="M31 31 C29 14 20 4 11 5 C2 6 1 18 5 24 C10 31 21 33 31 33 Z" fill="url(#bf-top)" />
          <path d="M31 35 C25 36 14 38 11 45 C8 52 15 58 21 55 C27 52 30 44 31 37 Z" fill="url(#bf-bot)" />
        </g>
        {/* right pair, mirrored */}
        <g transform="translate(64,0) scale(-1,1)">
          <path d="M31 31 C29 14 20 4 11 5 C2 6 1 18 5 24 C10 31 21 33 31 33 Z" fill="url(#bf-top)" />
          <path d="M31 35 C25 36 14 38 11 45 C8 52 15 58 21 55 C27 52 30 44 31 37 Z" fill="url(#bf-bot)" />
        </g>
      </g>

      {/* body */}
      <ellipse cx="32" cy="34" rx="2.6" ry="13" fill="#0c4a7d" />
      <ellipse cx="32" cy="29" rx="1.1" ry="7" fill="#5ab0e6" opacity="0.7" />

      {/* gloss on the upper wings */}
      <path d="M22 12 C15 8 7 11 6 18" stroke="#eaf8ff" strokeWidth="2.6" fill="none"
        strokeLinecap="round" opacity="0.75" />
      <path d="M42 12 C49 8 57 11 58 18" stroke="#eaf8ff" strokeWidth="2.6" fill="none"
        strokeLinecap="round" opacity="0.45" />
    </svg>
      </LogoImg>
  )
}

export function StartFlag({ size = 19 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 19 19" className="start-flag" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(-8 9.5 9.5)">
        <path d="M2 4 h7.2 v6 H2Z" fill="#f04a3a" />
        <path d="M9.6 4 h7.2 v6 H9.6Z" fill="#6cc24a" />
        <path d="M2 10.4 h7.2 v6 H2Z" fill="#3a8ddc" />
        <path d="M9.6 10.4 h7.2 v6 H9.6Z" fill="#ffc11e" />
      </g>
    </svg>
  )
}

/* ---------- Window buttons ---------- */

export const Glyph = {
  Minimize: () => (
    <svg {...s(9)} viewBox="0 0 9 9" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="6" width="7" height="2" fill="#fff" />
    </svg>
  ),
  Maximize: () => (
    <svg {...s(9)} viewBox="0 0 9 9" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="7" height="7" fill="none" stroke="#fff" strokeWidth="1.6" />
    </svg>
  ),
  Close: () => (
    <svg {...s(9)} viewBox="0 0 9 9" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.4 1.4 L7.6 7.6 M7.6 1.4 L1.4 7.6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  ChevronDown: ({ open = true }: { open?: boolean }) => (
    <svg className="chev" width="9" height="9" viewBox="0 0 9 9" xmlns="http://www.w3.org/2000/svg">
      {open ? (
        <path d="M1 3 L4.5 6.6 L8 3" fill="none" stroke="#15507f" strokeWidth="1.6" />
      ) : (
        <path d="M3 1 L6.6 4.5 L3 8" fill="none" stroke="#15507f" strokeWidth="1.6" />
      )}
    </svg>
  ),
  Caret: () => (
    <svg width="7" height="5" viewBox="0 0 7 5" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0 L3.5 5 L7 0Z" fill="#2c5878" />
    </svg>
  ),
}

/* ---------- Desktop / shell icons ---------- */

export function MsnShortcutIcon({ size = 34 }: P) {
  return <Butterfly size={size} />
}

export function IeIcon({ size = 34 }: P) {
  return (
    <LogoImg name="ie" size={size}>
    <svg width={size} height={size} viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
      <circle cx="17" cy="17" r="10.5" fill="#1d7ec8" />
      <circle cx="17" cy="17" r="10.5" fill="none" stroke="#0d5b99" />
      <path d="M8 19 q9 5 18 0" stroke="#bfe6ff" strokeWidth="1.4" fill="none" />
      <path
        d="M4 20 C8 29 26 31 31 22 C27 25 10 25 4 20Z"
        fill="#f5c20a"
        stroke="#b88a00"
        strokeWidth=".8"
      />
      <path d="M17 6.6 v20.8" stroke="#bfe6ff" strokeWidth="1" opacity=".7" />
    </svg>
      </LogoImg>
  )
}

export function RecycleBinIcon({ size = 34, full = true }: P & { full?: boolean }) {
  return (
    <LogoImg name="recyclebin" size={size}>
    <svg width={size} height={size} viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 11 h16 l-1.6 18 a2 2 0 0 1 -2 1.8 H12.6 a2 2 0 0 1 -2-1.8Z" fill="#b9c4cf" stroke="#5a6a78" />
      <path d="M9 11 h16" stroke="#5a6a78" />
      <ellipse cx="17" cy="11" rx="8" ry="2.4" fill="#d6dee6" stroke="#5a6a78" />
      {full && (
        <>
          <path d="M12 9 l3-5 h5 l3 5Z" fill="#8fd0f4" opacity=".9" />
          <path d="M13.6 14 l1 13 M17 14 v13 M20.4 14 l-1 13" stroke="#8a97a4" strokeWidth=".9" />
        </>
      )}
    </svg>
      </LogoImg>
  )
}

export function MyComputerIcon({ size = 34 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="6" width="26" height="18" rx="1.6" fill="#d8dde4" stroke="#6a7584" />
      <rect x="6" y="8" width="22" height="13" fill="#1d5fa8" />
      <path d="M6 8 h22 v6 q-11 3 -22 0Z" fill="#3f86cf" />
      <path d="M12 24 h10 l1.6 4 H10.4Z" fill="#c2c9d2" stroke="#6a7584" />
      <rect x="8" y="28" width="18" height="2.4" rx="1.2" fill="#aeb6c0" stroke="#6a7584" />
    </svg>
  )
}

export function FolderIcon({ size = 34 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9 h10 l2.4 3 H31 v16 a2 2 0 0 1 -2 2 H5 a2 2 0 0 1 -2 -2Z" fill="#f5c74c" stroke="#b78a1a" />
      <path d="M3 13 h28" stroke="#fff" opacity=".5" />
    </svg>
  )
}

export function NotepadIcon({ size = 34 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 3 h14 l6 6 v22 H7Z" fill="#fff" stroke="#6a7584" />
      <path d="M21 3 v6 h6" fill="#dfe6ee" stroke="#6a7584" />
      <path d="M10 14 h14 M10 18 h14 M10 22 h10" stroke="#8a97a4" />
    </svg>
  )
}

export function MineIcon({ size = 34 }: P) {
  const spikes = [0, 45, 90, 135, 180, 225, 270, 315]
  return (
    <LogoImg name="minesweeper" size={size}>
    <svg {...s(size)} viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="mine-ball" cx="0.36" cy="0.3" r="0.78">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.22" stopColor="#c9ccee" />
          <stop offset="0.62" stopColor="#5a5fb4" />
          <stop offset="1" stopColor="#2b2d72" />
        </radialGradient>
        <radialGradient id="mine-spike" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#b9bce6" />
          <stop offset="0.6" stopColor="#4e52a6" />
          <stop offset="1" stopColor="#2b2d72" />
        </radialGradient>
      </defs>
      {spikes.map((a) => {
        const r = (a * Math.PI) / 180
        const x = 17 + Math.cos(r) * 13
        const y = 17 + Math.sin(r) * 13
        return (
          <g key={a}>
            <line
              x1={17 + Math.cos(r) * 7}
              y1={17 + Math.sin(r) * 7}
              x2={x}
              y2={y}
              stroke="url(#mine-spike)"
              strokeWidth="4.4"
              strokeLinecap="round"
            />
            <circle cx={x} cy={y} r="2.6" fill="url(#mine-spike)" />
          </g>
        )
      })}
      <circle cx="17" cy="17" r="10" fill="url(#mine-ball)" />
    </svg>
      </LogoImg>
  )
}

export function MailIcon({ size = 16 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="3.6" width="14" height="9" rx="1" fill="#fff" stroke="#5a7aa0" />
      <path d="M1 4 L8 9.4 L15 4" fill="none" stroke="#5a7aa0" />
    </svg>
  )
}

export function VolumeIcon({ size = 16, muted = false }: P & { muted?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 6 h2.6 L8 3 v10 L4.6 10 H2Z" fill="#fff" stroke="#0b3a66" strokeWidth=".8" />
      {muted ? (
        <path d="M10 5.4 L14 10.6 M14 5.4 L10 10.6" stroke="#d42020" strokeWidth="1.6" strokeLinecap="round" />
      ) : (
        <>
          <path d="M10 5.6 a3.4 3.4 0 0 1 0 4.8" stroke="#fff" strokeWidth="1.2" fill="none" />
          <path d="M12 4 a6 6 0 0 1 0 8" stroke="#fff" strokeWidth="1.2" fill="none" />
        </>
      )}
    </svg>
  )
}

export function NetworkIcon({ size = 16 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.4" y="3" width="7" height="5" rx=".6" fill="#d8dde4" stroke="#44546a" />
      <rect x="7.6" y="8.4" width="7" height="5" rx=".6" fill="#d8dde4" stroke="#44546a" />
      <path d="M5 8 v3 h5" stroke="#44546a" fill="none" />
      <circle cx="13.6" cy="3.4" r="1.6" fill="#5ac23f" />
    </svg>
  )
}

/* ---------- Conversation tools ---------- */

export const Tool = {
  Emoticon: () => (
    <svg {...s(15)} xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="6.6" fill="#ffd93b" stroke="#9a7500" />
      <circle cx="5.8" cy="6.4" r="1" fill="#3a2a00" />
      <circle cx="10.2" cy="6.4" r="1" fill="#3a2a00" />
      <path d="M5 9.6 q3 2.8 6 0" stroke="#3a2a00" strokeWidth="1.1" fill="none" strokeLinecap="round" />
    </svg>
  ),
  Font: () => (
    <svg {...s(15)} xmlns="http://www.w3.org/2000/svg">
      <text x="1" y="13" fontFamily="Times New Roman, serif" fontSize="14" fontWeight="bold" fill="#15507f">
        A
      </text>
      <rect x="9.6" y="10.4" width="5.4" height="3.4" fill="#d42020" stroke="#8a1414" strokeWidth=".6" />
    </svg>
  ),
  Nudge: () => (
    <svg {...s(15)} xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="3.4" width="8" height="9.2" rx="1" fill="#fff" stroke="#15507f" />
      <path d="M1 5.4 l1.6 2.6 L1 10.6" stroke="#e07000" strokeWidth="1.3" fill="none" />
      <path d="M15 5.4 l-1.6 2.6 L15 10.6" stroke="#e07000" strokeWidth="1.3" fill="none" />
    </svg>
  ),
  Wink: () => (
    <svg {...s(15)} xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="6.6" fill="#ffd93b" stroke="#9a7500" />
      <path d="M4.4 6.4 h2.4" stroke="#3a2a00" strokeWidth="1.2" />
      <circle cx="10.2" cy="6.4" r="1" fill="#3a2a00" />
      <path d="M5 9.6 q3 2.8 6 0" stroke="#3a2a00" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <path d="M12.6 2.4 l1 1 M14 1 l.6 .6" stroke="#e07000" strokeWidth="1.2" />
    </svg>
  ),
  Invite: () => (
    <svg {...s(15)} xmlns="http://www.w3.org/2000/svg">
      <circle cx="6" cy="5.4" r="2.6" fill="#5ac23f" stroke="#2a7a1a" strokeWidth=".7" />
      <path d="M1.4 14 C1.4 10.4 3.6 9 6 9 s4.6 1.4 4.6 5Z" fill="#5ac23f" stroke="#2a7a1a" strokeWidth=".7" />
      <path d="M12.4 6 v5 M9.9 8.5 h5" stroke="#15507f" strokeWidth="1.5" />
    </svg>
  ),
  Files: () => (
    <svg {...s(15)} xmlns="http://www.w3.org/2000/svg">
      <path d="M3.4 1.6 h6 l3.2 3.2 V14 H3.4Z" fill="#fff" stroke="#6a7584" />
      <path d="M9.4 1.6 v3.2 h3.2" fill="#dfe6ee" stroke="#6a7584" />
    </svg>
  ),
  Block: () => (
    <svg {...s(15)} xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="6.4" fill="#fff" stroke="#d42020" strokeWidth="1.6" />
      <path d="M3.8 12.2 L12.2 3.8" stroke="#d42020" strokeWidth="1.6" />
    </svg>
  ),
  Bold: () => (
    <svg {...s(15)} xmlns="http://www.w3.org/2000/svg">
      <text x="3" y="12" fontFamily="Times New Roman, serif" fontSize="13" fontWeight="bold" fill="#15507f">
        B
      </text>
    </svg>
  ),
  Italic: () => (
    <svg {...s(15)} xmlns="http://www.w3.org/2000/svg">
      <text x="4" y="12" fontFamily="Times New Roman, serif" fontSize="13" fontStyle="italic" fill="#15507f">
        I
      </text>
    </svg>
  ),
  History: () => (
    <svg {...s(15)} xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="8" r="6.4" fill="#fff" stroke="#15507f" />
      <path d="M8 4.4 V8 h3" stroke="#15507f" strokeWidth="1.4" fill="none" />
    </svg>
  ),
  Today: () => (
    <svg {...s(16)} xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="2.5" width="13" height="11" rx="1" fill="#fff" stroke="#15507f" />
      <rect x="1.5" y="2.5" width="13" height="3" fill="#2f7fd0" stroke="#15507f" />
      <path d="M3.5 8h5M3.5 10h7M3.5 12h4" stroke="#6e92ad" strokeWidth="1.1" />
    </svg>
  ),
  Dice: () => (
    <svg {...s(16)} xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="12" height="12" rx="2.2" fill="#fff" stroke="#15507f" />
      <circle cx="5.6" cy="5.6" r="1.3" fill="#15507f" />
      <circle cx="10.4" cy="10.4" r="1.3" fill="#15507f" />
      <circle cx="8" cy="8" r="1.3" fill="#15507f" />
    </svg>
  ),
  Note: () => (
    <svg {...s(16)} xmlns="http://www.w3.org/2000/svg">
      <path d="M6.2 11.6V3.6l6-1.3v7.9" fill="none" stroke="#15507f" strokeWidth="1.4" />
      <ellipse cx="4.6" cy="11.8" rx="2.4" ry="1.9" fill="#2f7fd0" stroke="#15507f" />
      <ellipse cx="10.6" cy="10.4" rx="2.4" ry="1.9" fill="#2f7fd0" stroke="#15507f" />
    </svg>
  ),
}

export function WinkArt({ kind }: { kind: string }) {
  switch (kind) {
    case 'Kiss':
      return (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 86 L16 50 a19 19 0 0 1 34-12 a19 19 0 0 1 34 12Z" fill="#e3005f" stroke="#8a0038" strokeWidth="2" />
          <path d="M34 42 a9 9 0 0 1 10-6" stroke="#fff" strokeWidth="3" fill="none" opacity=".7" />
        </svg>
      )
    case 'Sheep':
      return (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="50" cy="56" rx="30" ry="22" fill="#fdfdfd" stroke="#b8b8b8" strokeWidth="2" />
          <circle cx="30" cy="42" r="10" fill="#fdfdfd" stroke="#b8b8b8" strokeWidth="2" />
          <circle cx="70" cy="44" r="12" fill="#fdfdfd" stroke="#b8b8b8" strokeWidth="2" />
          <ellipse cx="50" cy="40" rx="13" ry="11" fill="#3a3a3a" />
          <circle cx="45" cy="38" r="2.4" fill="#fff" />
          <circle cx="55" cy="38" r="2.4" fill="#fff" />
          <path d="M36 76 v10 M64 76 v10" stroke="#3a3a3a" strokeWidth="4" />
        </svg>
      )
    case 'Anvil':
      return (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 40 h60 l-8 14 H28Z" fill="#555" stroke="#222" strokeWidth="2" />
          <path d="M40 54 h20 v16 h10 v8 H30 v-8 h10Z" fill="#666" stroke="#222" strokeWidth="2" />
          <path d="M26 30 l6 8 M74 30 l-6 8 M50 24 v10" stroke="#e07000" strokeWidth="3" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="34" fill="#ffd93b" stroke="#9a7500" strokeWidth="2" />
          <path d="M30 40 h12" stroke="#3a2a00" strokeWidth="4" />
          <circle cx="62" cy="40" r="4" fill="#3a2a00" />
          <path d="M30 60 q20 18 40 0" stroke="#3a2a00" strokeWidth="4" fill="none" strokeLinecap="round" />
        </svg>
      )
  }
}

export function LimeWireIcon({ size = 34 }: P) {
  const wedges = [0, 45, 90, 135, 180, 225, 270, 315]
  return (
    /* The lime on its own: the full logo is a wordmark, and squeezed into a
       square icon it comes out as an unreadable strip. */
    <LogoImg name="limewire-mark" size={size}>
    <svg {...s(size)} viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="lw-rind" cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#b6e85a" />
          <stop offset="0.55" stopColor="#6fb62a" />
          <stop offset="1" stopColor="#2f6a0c" />
        </radialGradient>
        <radialGradient id="lw-flesh" cx="0.4" cy="0.32" r="0.78">
          <stop offset="0" stopColor="#f2ffd2" />
          <stop offset="0.6" stopColor="#c6e88a" />
          <stop offset="1" stopColor="#8cc63f" />
        </radialGradient>
      </defs>

      {/* rind */}
      <circle cx="17" cy="18" r="13.2" fill="url(#lw-rind)" stroke="#27590a" strokeWidth="1" />
      {/* pith */}
      <circle cx="17" cy="18" r="10.6" fill="#eaf7cd" />
      {/* flesh */}
      <circle cx="17" cy="18" r="9.8" fill="url(#lw-flesh)" />
      {/* segment dividers */}
      <g stroke="#f4ffe0" strokeWidth="1.3" strokeLinecap="round">
        {wedges.map((a) => {
          const r = (a * Math.PI) / 180
          return (
            <line
              key={a}
              x1={17 + Math.cos(r) * 1.2}
              y1={18 + Math.sin(r) * 1.2}
              x2={17 + Math.cos(r) * 9.6}
              y2={18 + Math.sin(r) * 9.6}
            />
          )
        })}
      </g>
      <circle cx="17" cy="18" r="1.7" fill="#f4ffe0" />

      {/* specular highlight on the rind */}
      <ellipse cx="11.4" cy="11.6" rx="3.6" ry="2.4" fill="#fff" opacity="0.4"
        transform="rotate(-38 11.4 11.6)" />
    </svg>
      </LogoImg>
  )
}
export function EbayIcon({ size = 34 }: P) {
  return (
    <LogoImg name="ebay" size={size}>
    <svg {...s(size)} viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="5" width="30" height="24" rx="2" fill="#fff" stroke="#8a8a8a" />
      <rect x="2" y="21" width="30" height="8" fill="#ffcc00" stroke="#8a8a8a" />
      <g fontFamily="Arial, Helvetica, sans-serif" fontSize="12" fontWeight="bold" fontStyle="italic">
        <text x="4" y="18" fill="#e53238">e</text>
        <text x="11" y="18" fill="#0064d2">b</text>
        <text x="18" y="18" fill="#f5af02">a</text>
        <text x="25" y="18" fill="#86b817">Y</text>
      </g>
    </svg>
      </LogoImg>
  )
}

export function PaintIcon({ size = 34 }: P) {
  return (
    <LogoImg name="paint" size={size}>
      <svg {...s(size)} viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="28" height="22" rx="1.5" fill="#fff" stroke="#6a6a6a" />
        <path d="M5 21 l6-7 4 4 5-6 9 9 v3 H5Z" fill="#9cc96a" />
        <circle cx="11" cy="10" r="2.6" fill="#ffd54a" />
        <path d="M22 24 l7-11 c1.4-2.2 4.2-0.4 2.8 1.8 l-7 11Z" fill="#c8a06a" stroke="#6a4a22" strokeWidth="0.9" />
        <path d="M22 24 l-3.4 5.6 6-2.2Z" fill="#8a8a9a" stroke="#4a4a5a" strokeWidth="0.9" />
      </svg>
    </LogoImg>
  )
}

/* ---------- Conversation toolbar (Messenger 6.2) ----------
   The big 32px icons that sat above their labels: Invite, Send Files,
   Webcam, Audio and Start Activities. Drawn rather than shipped as PNGs. */

const buddy = (x: number, y: number, scale = 1) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <circle cx="7" cy="5.5" r="4.4" fill="#4e9b44" />
    <path d="M0.6 19 C0.6 12.5 4 10.4 7 10.4 C10 10.4 13.4 12.5 13.4 19 z" fill="#4e9b44" />
  </g>
)

export const ConvTool = {
  Invite: () => (
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      {buddy(2, 8, 1.05)}
      <g>
        <path d="M15 3 h14 a1.6 1.6 0 0 1 1.6 1.6 v6.6 a1.6 1.6 0 0 1 -1.6 1.6 H21 l-3.4 3 v-3 H15 a1.6 1.6 0 0 1 -1.6 -1.6 V4.6 A1.6 1.6 0 0 1 15 3 z"
          fill="#fff" stroke="#6d8fb5" />
        <circle cx="18" cy="8" r="1.1" fill="#6d8fb5" />
        <circle cx="22" cy="8" r="1.1" fill="#6d8fb5" />
        <circle cx="26" cy="8" r="1.1" fill="#6d8fb5" />
      </g>
    </svg>
  ),

  Files: () => (
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="7" width="20" height="16" rx="1.5" fill="#fff" stroke="#8aa0bb" />
      <rect x="5.5" y="9.5" width="15" height="11" fill="#bcd9f2" />
      <circle cx="10" cy="13.5" r="1.9" fill="#ffd34d" />
      <path d="M5.5 20.5 L11 14.5 L15 18.5 L17.5 16 L20.5 20.5 z" fill="#5aa05a" />
      <rect x="12" y="14" width="18" height="14" rx="1.5" fill="#fff" stroke="#8aa0bb" />
      <rect x="14.5" y="16.5" width="13" height="9" fill="#dce9f6" />
      <path d="M14.5 25.5 L19 20 L22.5 23.5 L25 21 L27.5 25.5 z" fill="#8ab4e0" />
    </svg>
  ),

  Webcam: () => (
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="16" cy="27" rx="9" ry="2.6" fill="#b8c6d6" />
      <path d="M16 20 v5" stroke="#8aa0bb" strokeWidth="2.4" />
      <circle cx="16" cy="13" r="9.4" fill="#e8eef6" stroke="#7f98b8" />
      <circle cx="16" cy="13" r="6" fill="#2b4f7e" />
      <circle cx="16" cy="13" r="3.4" fill="#0f2a4d" />
      <circle cx="13.9" cy="10.9" r="1.5" fill="#cfe4ff" opacity="0.9" />
    </svg>
  ),

  Audio: () => (
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="3" width="8" height="15" rx="4" fill="#9aa8ba" stroke="#67798f" />
      <rect x="13.6" y="5" width="4.8" height="11" rx="2.4" fill="#c9d4e2" />

      <path d="M8.5 15 a7.5 7.5 0 0 0 15 0" fill="none" stroke="#4a6a92" strokeWidth="2.2" />
      <path d="M16 22.5 v4" stroke="#4a6a92" strokeWidth="2.2" />
      <path d="M11.5 27 h9" stroke="#4a6a92" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  ),

  Activities: () => (
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="6" width="21" height="16" rx="1.6" fill="#fff" stroke="#8aa0bb" />
      <rect x="5" y="8.5" width="16" height="11" fill="#9ec9ef" />
      <path d="M5 19.5 L10 13 L14 17 L17 14 L21 19.5 z" fill="#5aa05a" />
      <circle cx="9" cy="11.5" r="1.7" fill="#ffd34d" />
      <g transform="translate(17,13)">
        <circle cx="7" cy="7" r="6.8" fill="#f3f6fa" stroke="#7f98b8" />
        <path d="M7 1.4 a5.6 5.6 0 0 1 0 11.2 z" fill="#2b4f7e" />
        <circle cx="7" cy="4.2" r="1.3" fill="#2b4f7e" />
        <circle cx="7" cy="9.8" r="1.3" fill="#f3f6fa" />
      </g>
    </svg>
  ),

  /* The little webcam that sat at the right of the "To:" bar. */
  SmallCam: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="8" cy="13.6" rx="4.6" ry="1.4" fill="#b8c6d6" />
      <path d="M8 9.6 v3" stroke="#8aa0bb" strokeWidth="1.5" />
      <circle cx="8" cy="6.2" r="4.8" fill="#e8eef6" stroke="#7f98b8" />
      <circle cx="8" cy="6.2" r="2.9" fill="#2b4f7e" />
      <circle cx="7" cy="5.2" r="0.9" fill="#cfe4ff" />
    </svg>
  ),

  /* "Planos de Fundo" — the backgrounds picker. */
  Background: () => (
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="2.5" width="14" height="11" rx="1" fill="#fff" stroke="#8aa0bb" />
      <rect x="2.5" y="4" width="11" height="8" fill="#bcd9f2" />
      <circle cx="5.5" cy="6.6" r="1.3" fill="#ffd34d" />
      <path d="M2.5 12 L6 7.8 L8.6 10.4 L10.4 8.6 L13.5 12 z" fill="#5aa05a" />
    </svg>
  ),
}

/* ---------- Internet Explorer 6 toolbar ----------
   The row of big colour icons XP shipped: nav arrows, stop, refresh, home,
   then Search and Favorites with labels, then the unlabelled block. */

export const IeTool = {
  Stop: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="9" fill="#d23b2a" stroke="#8e1f12" />
      <path d="M7.4 7.4 L14.6 14.6 M14.6 7.4 L7.4 14.6" stroke="#fff" strokeWidth="2.6"
        strokeLinecap="round" />
    </svg>
  ),

  Refresh: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 8 A8 8 0 1 0 18.6 13.4" fill="none" stroke="#2e8b36" strokeWidth="3" />
      <path d="M18.4 3.4 L19 8.6 L13.8 8 z" fill="#2e8b36" />
    </svg>
  ),

  Home: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 11 L11 3 L20 11 z" fill="#d8a23a" stroke="#9a6d16" />
      <rect x="5" y="11" width="12" height="8" fill="#f0d79a" stroke="#9a6d16" />
      <rect x="9" y="14" width="4" height="5" fill="#7a5a2a" />
    </svg>
  ),

  Search: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <circle cx="9" cy="9" r="6" fill="#dcecff" stroke="#2a63c0" strokeWidth="2" />
      <path d="M13.4 13.4 L19.5 19.5" stroke="#2a63c0" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  ),

  Favorites: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 2 L13.6 8 L20 8.7 L15.2 13 L16.6 19.4 L11 16 L5.4 19.4 L6.8 13 L2 8.7 L8.4 8 z"
        fill="#ffcf3a" stroke="#c89a10" />
    </svg>
  ),

  /* The green swirl: History and Media lived behind it. */
  History: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="8.6" fill="#4aa64a" stroke="#1f6b26" />
      <path d="M11 5.6 A5.4 5.4 0 1 1 5.8 12.4" fill="none" stroke="#fff" strokeWidth="2.2" />
      <path d="M8.4 3.6 L11.6 5.8 L8.2 8 z" fill="#fff" />
    </svg>
  ),

  Mail: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <rect x="1.5" y="5" width="19" height="13" rx="1" fill="#f3f6fa" stroke="#6d8fb5" />
      <path d="M1.5 5.6 L11 12.6 L20.5 5.6" fill="none" stroke="#6d8fb5" strokeWidth="1.6" />
      <path d="M1.5 17.4 L8 11.4 M20.5 17.4 L14 11.4" stroke="#b7c7da" />
    </svg>
  ),

  Print: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="2.5" width="12" height="6" fill="#fff" stroke="#7f98b8" />
      <rect x="2" y="8.5" width="18" height="7.5" rx="1.4" fill="#c3cedc" stroke="#6b7f96" />
      <rect x="5.5" y="13" width="11" height="6.5" fill="#fff" stroke="#7f98b8" />
      <circle cx="17.4" cy="11" r="1.1" fill="#4aa64a" />
    </svg>
  ),

  Edit: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="4" width="13" height="15" fill="#fff" stroke="#7f98b8" />
      <path d="M5 7.5 h8 M5 10.5 h8 M5 13.5 h5" stroke="#9fb3c8" />
      <path d="M12.5 15.5 L18.5 9.2 L20.5 11.2 L14.4 17.4 L11.6 18.4 z" fill="#f0c04a"
        stroke="#9a6d16" />
    </svg>
  ),

  Discuss: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 2.5 L6 16 L9.4 12.8 L11.6 18 L14 16.8 L11.8 11.9 L16.4 11.6 z" fill="#fff"
        stroke="#3a4d63" strokeWidth="1.3" />
    </svg>
  ),

  Messenger: () => (
    <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7.5" cy="7" r="3.6" fill="#4e9b44" />
      <path d="M1.6 19 C1.6 13 4.4 11 7.5 11 C10.6 11 13.4 13 13.4 19 z" fill="#4e9b44" />
      <circle cx="15.4" cy="8.4" r="3" fill="#2a7fc0" />
      <path d="M10.6 19 C10.6 14 12.9 12.2 15.4 12.2 C17.9 12.2 20.4 14 20.4 19 z" fill="#2a7fc0" />
    </svg>
  ),

  /* The Windows flag at the right-hand end of the menu bar. */
  Flag: () => (
    <svg width="24" height="20" viewBox="0 0 24 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 4.2 L10.4 2.4 V9 H2 z" fill="#e8544a" />
      <path d="M11.8 2.1 L22 0 V9 H11.8 z" fill="#6ab04a" />
      <path d="M2 10.4 H10.4 V17 L2 15.2 z" fill="#3a8fd8" />
      <path d="M11.8 10.4 H22 V19.4 L11.8 17.3 z" fill="#f0b429" />
    </svg>
  ),
}


/** The desktop shortcut for the Apple Store. */
export const AppleIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="44" height="44" rx="8" fill="#f2f2f2" stroke="#b8b8b8" />
    <path d="M28 12.6 C29.6 10.8 30.6 8.4 30.3 7.2 C28.4 7.4 26.2 8.6 24.9 10.4 C23.7 12 22.6 14.4 22.9 16.6 C25 16.8 26.7 14.5 28 12.6 z"
      fill="#5a5a5a" />
    <path d="M36 32.4 C35.2 34.5 34.6 35.4 33.4 37.1 C31.7 39.7 29.3 42 26.6 42 C24.1 42 23.4 40.4 20 40.4 C16.6 40.4 15.9 42 13.3 42 C10.6 42 8.1 39.5 6.4 36.9 C3.4 32.3 3.1 26.1 5.2 22.6 C6.7 20.1 9.4 18.5 11.9 18.5 C14.5 18.5 16.1 19.9 18 19.9 C19.8 19.9 20.9 18.5 23.9 18.5 C26.2 18.5 28.6 19.7 30.3 21.9 C24.8 24.9 25.7 32.6 31.2 34.7 C30.2 36.6 36 30.5 36 32.4 z"
      fill="#5a5a5a" transform="translate(1,-1) scale(0.95)" />
  </svg>
)

/** The desktop shortcut for YouTube: the real wordmark, scaled down. */
export const YouTubeIcon = ({ size = 32 }: { size?: number }) => (
  <LogoImg name="youtube" size={size} height={size * 0.4}>
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="12" width="44" height="26" rx="7" fill="#e8201a" />
      <path d="M20 20 L32 25 L20 30 z" fill="#fff" />
    </svg>
  </LogoImg>
)

/** The desktop shortcut for Yahoo!, using the real wordmark. */
export const YahooIcon = ({ size = 32 }: { size?: number }) => (
  <LogoImg name="yahoo" size={size} height={size * 0.3}>
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <text x="24" y="32" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="bold"
        fontSize="17" fill="#e8001c">Y!</text>
    </svg>
  </LogoImg>
)

/** The desktop shortcut for AddictingGames, using the real wordmark. */
export const AddictingGamesIcon = ({ size = 32 }: { size?: number }) => (
  <LogoImg name="addictinggames" size={size} height={size * 0.5}>
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="10" width="44" height="28" rx="5" fill="#899aba" stroke="#3a4a6a" />
      <text x="24" y="30" textAnchor="middle" fontFamily="'Comic Sans MS', sans-serif"
        fontWeight="bold" fontSize="17" fill="#fff">AG</text>
    </svg>
  </LogoImg>
)

/** The shortcut for Solitaire: the ace of spades over two fanned cards. */
export function SolitaireIcon({ size = 34 }: P) {
  return (
    <LogoImg name="solitaire" size={size}>
      <svg {...s(size)} viewBox="0 0 34 34" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#7a7a7a" strokeWidth="0.8">
          <rect x="3" y="8" width="16" height="22" rx="2.4" fill="#eef2f8" transform="rotate(-14 11 19)" />
          <rect x="7" y="7" width="16" height="22" rx="2.4" fill="#f7f9fc" transform="rotate(-6 15 18)" />
          <rect x="13" y="5" width="17" height="23" rx="2.4" fill="#ffffff" />
        </g>
        <text x="15.4" y="13" fontFamily="Tahoma, sans-serif" fontSize="6" fontWeight="bold" fill="#1a1a1a">A</text>
        <path d="M21.6 13.4c2.4 2 4.1 3.3 4.1 5a2.1 2.1 0 0 1-3.4 1.6l.5 2.2h-2.4l.5-2.2a2.1 2.1 0 0 1-3.4-1.6c0-1.7 1.7-3 4.1-5Z" fill="#1a1a1a" />
      </svg>
    </LogoImg>
  )
}
