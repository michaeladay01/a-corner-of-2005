import type { WindowKind } from '../state/store'

/* Reading the URL so the desktop can be dropped into a page already showing
   one thing — the blog embeds it this way, a frame per application.

   None of this changes anything when the parameters are absent, which is how
   the desktop is normally opened. */

export type EmbedPlan = {
  /** Whether any embed parameter was given at all. */
  active: boolean
  /** The window to open on arrival. */
  open?: WindowKind
  /** For a conversation, who it is with. */
  contactId?: string
  /** Sign in first, for anything behind the Messenger sign-in. */
  signIn: boolean
  /** Hide the desktop icons and the taskbar, leaving just the window. */
  bare: boolean
  /** Size the window to the frame rather than its usual dimensions. */
  fit: boolean
  /** Skip the Windows boot screen. */
  skipBoot: boolean
}

/* Friendly names for the things worth linking to, so a URL reads as what it
   shows rather than as an internal window kind. */
const ALIASES: Record<string, { kind: WindowKind; contactId?: string; signIn?: boolean }> = {
  // The sign-in screen first: the e-mail, the password, the status dropdown.
  // Signing in opens the contact list, and a contact opens a conversation —
  // the whole way in, rather than dropped at the end of it.
  msn: { kind: 'signin' },
  signin: { kind: 'signin' },
  messenger: { kind: 'messenger', signIn: true },
  chat: { kind: 'conversation', contactId: 'kez', signIn: true },
  games: { kind: 'addictinggames' },
  addictinggames: { kind: 'addictinggames' },
  limewire: { kind: 'limewire' },
  youtube: { kind: 'youtube' },
  ebay: { kind: 'ebay' },
  hotmail: { kind: 'hotmail' },
  paint: { kind: 'paint' },
  ie: { kind: 'ie' },
  explorer: { kind: 'explorer' },
  minesweeper: { kind: 'minesweeper' },
  solitaire: { kind: 'solitaire' },
  yahoo: { kind: 'yahoo' },
  desktop: { kind: 'messenger' },
}

const OFF = new Set(['0', 'false', 'no', 'off'])

export function readEmbedPlan(search = typeof window === 'undefined' ? '' : window.location.search): EmbedPlan {
  const params = new URLSearchParams(search)
  const wanted = (params.get('open') ?? '').trim().toLowerCase()
  const embedded = params.has('embed') || params.has('open')

  const blank: EmbedPlan = {
    active: embedded,
    signIn: false,
    bare: false,
    fit: false,
    skipBoot: false,
  }
  if (!embedded) return blank

  const plan: EmbedPlan = {
    ...blank,
    bare: params.get('chrome') === 'off',
    fit: !OFF.has((params.get('fit') ?? '').toLowerCase()),
    // An embed never sits through the boot screen unless it asks to.
    skipBoot: params.get('boot') !== 'show',
  }

  // 'desktop' asks for the desktop itself, with nothing opened on top of it.
  if (wanted === 'desktop' || wanted === '') return plan

  const match = ALIASES[wanted]
  if (!match) return plan

  return {
    ...plan,
    open: match.kind,
    contactId: match.contactId,
    signIn: Boolean(match.signIn),
  }
}
