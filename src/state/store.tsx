import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type Dispatch,
  type ReactNode,
} from 'react'
import { CONTACTS, PRESENCE_EVENTS } from '../data/contacts'
import { SCRIPTS, replyFor, nudgeReplyFor, winkReplyFor } from '../data/scripts'
import type { Contact, Conversation, Message, Presence } from '../data/types'
import { play, setMuted } from '../lib/sounds'
import { agentReady } from '../lib/agent'
import { load, save } from '../lib/storage'

export type WindowKind =
  | 'signin'
  | 'messenger'
  | 'conversation'
  | 'hotmail'
  | 'minesweeper'
  | 'profile'
  | 'history'
  | 'display-picture'
  | 'options'
  | 'recycle-bin'
  | 'solitaire'
  | 'display'
  | 'notepad'
  | 'limewire'
  | 'ie'
  | 'ebay'
  | 'paint'
  | 'explorer'
  | 'apple'
  | 'youtube'
  | 'yahoo'
  | 'addictinggames'

export type WindowState = {
  id: string
  kind: WindowKind
  title: string
  x: number
  y: number
  w: number
  h: number
  z: number
  minimized: boolean
  contactId?: string
  /** Which folder an 'explorer' window is showing. */
  folder?: string
  resizable?: boolean
  /** How far the resize grip may be taken, per window. */
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
}

export type Toast = {
  id: string
  kind: 'online' | 'offline' | 'message' | 'email'
  title: string
  text: string
  contactId?: string
  picture?: string
}

export type Font = { family: string; color: string; bold: boolean; italic: boolean }

export type Settings = {
  muted: boolean
  nudgeShake: boolean
  skipBoot: boolean
  wallpaper: string
  /** How the desktop icons are ordered: Arrange Icons By. */
  iconSort: IconSort
  showOfflineGroup: boolean
  groupByGroups: boolean
}

export type IconSort = 'name' | 'size' | 'type' | 'modified'

export type Me = {
  name: string
  email: string
  psm: string
  picture: string
  presence: Presence
  font: Font
  music: string
  about: string
}

export type Phase = 'boot' | 'desktop'

type ConversationState = Conversation & {
  replyIndex: number
  pending: { text: string; at: number }[]
  shake: number
  wink: { id: string; kind: string } | null
}

export type State = {
  phase: Phase
  signedIn: boolean
  me: Me
  contacts: Contact[]
  conversations: Record<string, ConversationState>
  windows: WindowState[]
  focused: string | null
  zTop: number
  toasts: Toast[]
  settings: Settings
  startMenuOpen: boolean
  /** Bumped by Refresh; the desktop icons repaint when it changes. */
  refreshes: number
  startedAt: number
  archived: Record<string, Message[]>
}

export type Action =
  | { type: 'boot-finished' }
  | { type: 'sign-in'; name: string; email: string; presence: Presence }
  | { type: 'sign-out' }
  | { type: 'open-window'; kind: WindowKind; contactId?: string; folder?: string; title?: string }
  | { type: 'rename-window'; id: string; title: string }
  | { type: 'close-window'; id: string }
  | { type: 'focus-window'; id: string }
  | { type: 'minimize-window'; id: string }
  | { type: 'restore-window'; id: string }
  | { type: 'move-window'; id: string; x: number; y: number }
  | { type: 'resize-window'; id: string; w: number; h: number }
  | { type: 'set-presence'; presence: Presence }
  | { type: 'set-profile'; patch: Partial<Me> }
  | { type: 'set-setting'; patch: Partial<Settings> }
  | { type: 'refresh-desktop' }
  | { type: 'send-message'; contactId: string; text: string; font: Font }
  | { type: 'send-nudge'; contactId: string }
  | { type: 'send-wink'; contactId: string; wink: string }
  | { type: 'receive-message'; contactId: string; text: string; kind?: Message['kind'] }
  | { type: 'agent-reply'; contactId: string; lines: string[] }
  | { type: 'flush-pending'; now: number }
  | { type: 'contact-presence'; contactId: string; presence: Presence }
  | { type: 'mark-read'; contactId: string }
  | { type: 'toast'; toast: Omit<Toast, 'id'> }
  | { type: 'dismiss-toast'; id: string }
  | { type: 'start-menu'; open: boolean }
  | { type: 'clear-shake'; contactId: string }
  | { type: 'clear-wink'; contactId: string }

let seq = 0
const uid = (p = 'id') => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`

export const DEFAULT_FONT: Font = {
  family: 'Comic Sans MS',
  color: '#000080',
  bold: false,
  italic: false,
}

const DEFAULT_SETTINGS: Settings = {
  muted: false,
  nudgeShake: true,
  skipBoot: false,
  wallpaper: 'bliss',
  iconSort: 'name',
  showOfflineGroup: true,
  groupByGroups: true,
}

function windowSize(kind: WindowKind): { w: number; h: number; resizable: boolean } {
  switch (kind) {
    case 'signin':
      return { w: 392, h: 620, resizable: false }
    case 'messenger':
      return { w: 330, h: 580, resizable: true }
    case 'conversation':
      return { w: 640, h: 520, resizable: true }
    case 'hotmail':
      return { w: 720, h: 520, resizable: true }
    case 'minesweeper':
      return { w: 516, h: 372, resizable: false }
    case 'profile':
      return { w: 430, h: 470, resizable: false }
    case 'history':
      return { w: 560, h: 420, resizable: true }
    case 'display-picture':
      return { w: 420, h: 400, resizable: false }
    case 'options':
      return { w: 420, h: 360, resizable: false }
    case 'recycle-bin':
      return { w: 440, h: 300, resizable: true }
    case 'solitaire':
      return { w: 684, h: 520, resizable: true }
    case 'display':
      return { w: 428, h: 486, resizable: false }
    case 'notepad':
      return { w: 600, h: 420, resizable: true }
    case 'limewire':
      return { w: 748, h: 560, resizable: true }
    case 'ie':
      // Wide enough for the four Director Videos to sit on one row with the
      // sidebar beside them, which is how the 2006 front page was laid out.
      return { w: 920, h: 690, resizable: true }
    case 'ebay':
      return { w: 860, h: 620, resizable: true }
    case 'paint':
      return { w: 700, h: 580, resizable: true }
    case 'explorer':
      return { w: 700, h: 500, resizable: true }
    case 'apple':
      return { w: 900, h: 640, resizable: true }
    case 'youtube':
      return { w: 920, h: 690, resizable: true }
    case 'yahoo':
      return { w: 940, h: 660, resizable: true }
    case 'addictinggames':
      return { w: 960, h: 680, resizable: true }
  }
}

/**
 * How far a window may be dragged by its grip. Pages built for a 2005 screen
 * fall apart below a certain width — the sidebar lands on the content, the
 * thumbnail strip wraps — and look stretched well past one, so each window
 * gets a floor and a ceiling rather than "anything from 240px to the screen".
 */
function windowLimits(kind: WindowKind): {
  minW: number
  minH: number
  maxW: number
  maxH: number
} {
  switch (kind) {
    // The websites: a real page width either side of how they open.
    // The browser: below 900 the Director row loses a thumbnail to the next
    // line, so that is the floor rather than a general one.
    case 'ie':
    case 'youtube':
      return { minW: 900, minH: 560, maxW: 1180, maxH: 900 }

    case 'ebay':
    case 'apple':
    case 'yahoo':
    case 'addictinggames':
    case 'hotmail':
      return { minW: 720, minH: 500, maxW: 1180, maxH: 900 }

    case 'limewire':
      return { minW: 700, minH: 480, maxW: 1100, maxH: 860 }

    // The contact list was always a narrow column.
    case 'messenger':
      return { minW: 280, minH: 420, maxW: 420, maxH: 980 }

    case 'conversation':
      return { minW: 520, minH: 420, maxW: 900, maxH: 860 }

    case 'paint':
    case 'explorer':
      return { minW: 480, minH: 360, maxW: 1100, maxH: 860 }

    // Seven columns of cards have a width they cannot go under.
    case 'solitaire':
      return { minW: 660, minH: 460, maxW: 1000, maxH: 820 }

    default:
      return { minW: 360, minH: 260, maxW: 900, maxH: 760 }
  }
}

function windowTitle(kind: WindowKind, contact?: Contact): string {
  switch (kind) {
    case 'signin':
      return 'MSN Messenger'
    case 'messenger':
      return 'MSN Messenger'
    case 'conversation':
      return `${contact?.name ?? 'Conversation'} - Conversation`
    case 'hotmail':
      return 'MSN Hotmail - Inbox - Microsoft Internet Explorer'
    case 'minesweeper':
      return 'Minesweeper'
    case 'profile':
      return 'My Profile'
    case 'history':
      return 'Message History'
    case 'display-picture':
      return 'My Display Picture'
    case 'options':
      return 'Options'
    case 'recycle-bin':
      return 'Recycle Bin'
    case 'solitaire':
      return 'Solitaire'
    case 'display':
      return 'Display Properties'
    case 'notepad':
      return 'readme.txt - Notepad'
    case 'limewire':
      return 'LimeWire: Enabling Open Information Sharing'
    case 'ie':
      return 'About Google - Microsoft Internet Explorer'
    case 'paint':
      return 'untitled - Paint'
    case 'explorer':
      return 'My Documents'
    case 'apple':
      return 'Apple Store - Microsoft Internet Explorer'
    case 'youtube':
      return 'YouTube - Your Digital Video Repository - Microsoft Internet Explorer'
    case 'yahoo':
      return 'Yahoo! - Microsoft Internet Explorer'
    case 'addictinggames':
      return 'AddictingGames.com - Microsoft Internet Explorer'
    case 'ebay':
      return 'eBay - The World\'s Online Marketplace - Microsoft Internet Explorer'
  }
}

function emptyConversation(contactId: string): ConversationState {
  return {
    contactId,
    messages: [],
    queue: 0,
    typing: false,
    unread: 0,
    replyIndex: 0,
    pending: [],
    shake: 0,
    wink: null,
  }
}

function seedConversation(contactId: string): ConversationState {
  const conv = emptyConversation(contactId)
  const history = SCRIPTS[contactId]?.history
  if (history) {
    conv.messages = history.map((h) => ({
      id: uid('m'),
      from: h.from === 'me' ? 'me' : contactId,
      text: h.text,
      at: Date.now() - h.minutesAgo * 60000,
      kind: 'text',
    }))
  }
  return conv
}

function nextPosition(windows: WindowState[], w: number, h: number) {
  const n = windows.length
  const baseX = Math.max(24, Math.round((window.innerWidth - w) / 2) - 120)
  const baseY = Math.max(24, Math.round((window.innerHeight - h) / 2) - 60)
  return {
    x: Math.min(window.innerWidth - 120, baseX + (n % 6) * 26),
    y: Math.min(window.innerHeight - 120, baseY + (n % 6) * 22),
  }
}

export function initialState(): State {
  const settings = { ...DEFAULT_SETTINGS, ...load<Partial<Settings>>('settings', {}) }
  const me = {
    name: 'Me',
    email: 'your_name_here@hotmail.com',
    psm: '',
    picture: 'msn',
    presence: 'online' as Presence,
    font: DEFAULT_FONT,
    music: '',
    about: '',
    ...load<Partial<Me>>('me', {}),
  }
  const conversations: Record<string, ConversationState> = {}
  for (const c of CONTACTS) conversations[c.id] = seedConversation(c.id)
  setMuted(settings.muted)
  return {
    phase: settings.skipBoot ? 'desktop' : 'boot',
    signedIn: false,
    me,
    contacts: CONTACTS.map((c) => ({ ...c })),
    conversations,
    windows: [],
    focused: null,
    zTop: 10,
    toasts: [],
    settings,
    startMenuOpen: false,
    refreshes: 0,
    startedAt: Date.now(),
    archived: {},
  }
}

function openWindow(state: State, action: Extract<Action, { type: 'open-window' }>): State {
  const existing = state.windows.find(
    (w) =>
      w.kind === action.kind &&
      w.contactId === action.contactId &&
      w.folder === action.folder
  )
  const z = state.zTop + 1
  if (existing) {
    return {
      ...state,
      zTop: z,
      focused: existing.id,
      startMenuOpen: false,
      windows: state.windows.map((w) =>
        w.id === existing.id ? { ...w, z, minimized: false } : w
      ),
    }
  }
  const contact = state.contacts.find((c) => c.id === action.contactId)
  const limits = windowLimits(action.kind)
  const base = windowSize(action.kind)
  // Open at the designed size, but never wider than the screen it has to fit.
  const size = {
    ...base,
    w: Math.min(base.w, limits.maxW, Math.max(limits.minW, window.innerWidth - 48)),
    h: Math.min(base.h, limits.maxH, Math.max(limits.minH, window.innerHeight - 90)),
  }
  const pos = nextPosition(state.windows, size.w, size.h)
  const win: WindowState = {
    id: uid(action.kind),
    kind: action.kind,
    title: action.title ?? windowTitle(action.kind, contact),
    ...pos,
    ...size,
    ...limits,
    z,
    minimized: false,
    contactId: action.contactId,
    folder: action.folder,
  }
  // The contact list likes to sit on the right-hand edge, as it always did.
  if (action.kind === 'messenger') {
    win.x = Math.max(24, window.innerWidth - size.w - 34)
    win.y = 40
  }
  return { ...state, windows: [...state.windows, win], focused: win.id, zTop: z, startMenuOpen: false }
}

/** Whether anything is open when the desktop appears. */
const OPEN_ON_ARRIVAL = false

/**
 * Where the two windows sit when you arrive. The browser goes top-left with
 * its Favorites showing, and the note is placed clear of that menu rather
 * than cascading on top of it, which would hide the one thing it is there
 * to advertise.
 */
function arriveLayout(state: State): State {
  const ie = state.windows.find((w) => w.kind === 'ie')
  const note = state.windows.find((w) => w.kind === 'notepad')
  if (!ie || !note) return state

  const screenW = window.innerWidth
  const screenH = window.innerHeight
  const floor = 46 // the taskbar

  // The browser sits right of the icon column, high up, so the Favorites
  // menu hanging off its toolbar is the first thing in view.
  const ieX = Math.max(24, Math.min(Math.round(screenW * 0.26), screenW - ie.w - 16))
  const ieY = Math.max(12, Math.min(28, screenH - ie.h - floor))

  // The note is staggered off the browser: down and to the left, so it covers
  // its bottom corner while leaving the Favorites menu and the title bar in
  // view. Its own bottom is allowed to run under the taskbar, as a window
  // dropped on a desktop would.
  const noteX = Math.max(16, ieX - 220)
  const noteY = Math.max(ieY + 60, Math.min(ieY + 390, screenH - 160))

  return {
    ...state,
    windows: state.windows.map((w) =>
      w.id === ie.id
        ? { ...w, x: ieX, y: ieY }
        : w.id === note.id
          ? { ...w, x: noteX, y: noteY }
          : w
    ),
  }
}

function pushMessage(
  state: State,
  contactId: string,
  message: Message,
  options: { unread?: boolean } = {}
): State {
  const conv = state.conversations[contactId] ?? emptyConversation(contactId)
  return {
    ...state,
    conversations: {
      ...state.conversations,
      [contactId]: {
        ...conv,
        messages: [...conv.messages, message],
        unread: options.unread ? conv.unread + 1 : conv.unread,
      },
    },
  }
}

function scheduleReplies(state: State, contactId: string, lines: string[], from = 900): State {
  const conv = state.conversations[contactId] ?? emptyConversation(contactId)
  let at = Date.now() + from
  const pending = [...conv.pending]
  for (const text of lines) {
    at += 450 + Math.min(2600, text.length * 55)
    pending.push({ text, at })
  }
  return {
    ...state,
    conversations: {
      ...state.conversations,
      [contactId]: { ...conv, pending, typing: true },
    },
  }
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'boot-finished': {
      // Off for now: you arrive at a bare desktop. Set this true to have the
      // browser up with its Favorites showing and readme.txt on top of it.
      if (!OPEN_ON_ARRIVAL) return { ...state, phase: 'desktop' }
      return arriveLayout(
        openWindow(
          openWindow({ ...state, phase: 'desktop' }, { type: 'open-window', kind: 'ie' }),
          { type: 'open-window', kind: 'notepad' }
        )
      )
    }

    case 'sign-in': {
      const me = { ...state.me, name: action.name, email: action.email, presence: action.presence }
      const next: State = { ...state, signedIn: true, me }
      const withoutSignIn = {
        ...next,
        windows: next.windows.filter((w) => w.kind !== 'signin'),
      }
      return openWindow(withoutSignIn, { type: 'open-window', kind: 'messenger' })
    }

    case 'sign-out':
      return {
        ...state,
        signedIn: false,
        windows: state.windows.filter(
          (w) => w.kind !== 'messenger' && w.kind !== 'conversation'
        ),
        toasts: [],
      }

    case 'open-window':
      return openWindow(state, action)

    case 'close-window': {
      const win = state.windows.find((w) => w.id === action.id)
      const archived = { ...state.archived }
      if (win?.kind === 'conversation' && win.contactId) {
        const conv = state.conversations[win.contactId]
        if (conv?.messages.length) archived[win.contactId] = conv.messages
      }
      const windows = state.windows.filter((w) => w.id !== action.id)
      return {
        ...state,
        windows,
        archived,
        focused: windows.length ? windows[windows.length - 1].id : null,
      }
    }

    case 'focus-window': {
      const z = state.zTop + 1
      return {
        ...state,
        zTop: z,
        focused: action.id,
        startMenuOpen: false,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, z, minimized: false } : w
        ),
      }
    }

    case 'minimize-window':
      return {
        ...state,
        focused: state.focused === action.id ? null : state.focused,
        windows: state.windows.map((w) => (w.id === action.id ? { ...w, minimized: true } : w)),
      }

    case 'restore-window': {
      const z = state.zTop + 1
      return {
        ...state,
        zTop: z,
        focused: action.id,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, minimized: false, z } : w
        ),
      }
    }

    case 'move-window':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, x: action.x, y: action.y } : w
        ),
      }

    case 'resize-window':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, w: action.w, h: action.h } : w
        ),
      }

    case 'set-presence':
      return { ...state, me: { ...state.me, presence: action.presence } }

    case 'set-profile':
      return { ...state, me: { ...state.me, ...action.patch } }

    case 'set-setting':
      return { ...state, settings: { ...state.settings, ...action.patch } }

    // Refresh repainted the desktop and nothing else. The count is what the
    // icons watch, so pressing it makes them flicker exactly as they did.
    case 'refresh-desktop':
      return { ...state, refreshes: state.refreshes + 1 }

    case 'send-message': {
      const message: Message = {
        id: uid('m'),
        from: 'me',
        text: action.text,
        at: Date.now(),
        kind: 'text',
        font: action.font,
      }
      let next = pushMessage(state, action.contactId, message)
      const conv = next.conversations[action.contactId]
      const contact = state.contacts.find((c) => c.id === action.contactId)
      if (contact?.presence === 'offline') {
        return pushMessage(next, action.contactId, {
          id: uid('m'),
          from: 'system',
          at: Date.now(),
          kind: 'system',
          text: `${contact.name} did not receive your message because they appear offline.`,
        })
      }
      if (agentReady()) {
        // A real contact is answering. Show the typing line and wait for them
        // rather than playing the next scripted reply over the top.
        next = {
          ...next,
          conversations: {
            ...next.conversations,
            [action.contactId]: { ...next.conversations[action.contactId], typing: true },
          },
        }
      } else {
        const lines = replyFor(action.contactId, conv.replyIndex)
        next = scheduleReplies(next, action.contactId, lines)
      }
      return {
        ...next,
        conversations: {
          ...next.conversations,
          [action.contactId]: {
            ...next.conversations[action.contactId],
            replyIndex: conv.replyIndex + 1,
          },
        },
      }
    }

    case 'send-nudge': {
      const contact = state.contacts.find((c) => c.id === action.contactId)
      let next = pushMessage(state, action.contactId, {
        id: uid('m'),
        from: 'system',
        at: Date.now(),
        kind: 'nudge',
        text: 'You have just sent a nudge!',
      })
      const conv = next.conversations[action.contactId]
      next = {
        ...next,
        conversations: {
          ...next.conversations,
          [action.contactId]: { ...conv, shake: conv.shake + 1 },
        },
      }
      if (contact && contact.presence !== 'offline') {
        next = scheduleReplies(next, action.contactId, nudgeReplyFor(action.contactId), 1400)
      }
      return next
    }

    case 'send-wink': {
      let next = pushMessage(state, action.contactId, {
        id: uid('m'),
        from: 'system',
        at: Date.now(),
        kind: 'wink',
        text: `You have just sent a wink: ${action.wink}`,
      })
      const conv = next.conversations[action.contactId]
      next = {
        ...next,
        conversations: {
          ...next.conversations,
          [action.contactId]: { ...conv, wink: { id: uid('w'), kind: action.wink } },
        },
      }
      const contact = state.contacts.find((c) => c.id === action.contactId)
      if (contact && contact.presence !== 'offline') {
        next = scheduleReplies(next, action.contactId, winkReplyFor(action.contactId), 2600)
      }
      return next
    }

    case 'receive-message': {
      const open = state.windows.some(
        (w) => w.kind === 'conversation' && w.contactId === action.contactId
      )
      const focusedWindow = state.windows.find((w) => w.id === state.focused)
      const isFocused =
        focusedWindow?.kind === 'conversation' && focusedWindow.contactId === action.contactId
      return pushMessage(
        state,
        action.contactId,
        {
          id: uid('m'),
          from: action.contactId,
          text: action.text,
          at: Date.now(),
          kind: action.kind ?? 'text',
        },
        { unread: !open || !isFocused }
      )
    }

    case 'agent-reply':
      // Already waited on the network, so the lines start arriving at once.
      return scheduleReplies(state, action.contactId, action.lines, 150)

    case 'rename-window':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.id ? { ...w, title: action.title } : w
        ),
      }

    case 'flush-pending': {
      let changed = false
      const conversations = { ...state.conversations }
      for (const [id, conv] of Object.entries(state.conversations)) {
        if (!conv.pending.length) continue
        const due = conv.pending.filter((p) => p.at <= action.now)
        if (!due.length) continue
        changed = true
        conversations[id] = {
          ...conv,
          pending: conv.pending.filter((p) => p.at > action.now),
          typing: conv.pending.length > due.length,
        }
      }
      return changed ? { ...state, conversations } : state
    }

    case 'contact-presence': {
      return {
        ...state,
        contacts: state.contacts.map((c) =>
          c.id === action.contactId ? { ...c, presence: action.presence } : c
        ),
      }
    }

    case 'mark-read': {
      const conv = state.conversations[action.contactId]
      if (!conv || conv.unread === 0) return state
      return {
        ...state,
        conversations: { ...state.conversations, [action.contactId]: { ...conv, unread: 0 } },
      }
    }

    case 'toast':
      return { ...state, toasts: [...state.toasts, { ...action.toast, id: uid('t') }] }

    case 'dismiss-toast':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) }

    case 'start-menu':
      return { ...state, startMenuOpen: action.open }

    case 'clear-shake': {
      const conv = state.conversations[action.contactId]
      if (!conv) return state
      return {
        ...state,
        conversations: { ...state.conversations, [action.contactId]: { ...conv, shake: 0 } },
      }
    }

    case 'clear-wink': {
      const conv = state.conversations[action.contactId]
      if (!conv) return state
      return {
        ...state,
        conversations: { ...state.conversations, [action.contactId]: { ...conv, wink: null } },
      }
    }
  }
}

const StateContext = createContext<State | null>(null)
const DispatchContext = createContext<Dispatch<Action> | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const pendingRef = useRef(state.conversations)
  pendingRef.current = state.conversations

  // Persist the bits of the experience that should survive a refresh.
  useEffect(() => save('settings', state.settings), [state.settings])
  useEffect(() => save('me', state.me), [state.me])
  useEffect(() => setMuted(state.settings.muted), [state.settings.muted])

  // Deliver scripted replies as their moment arrives.
  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Date.now()
      let delivered = false
      for (const [id, conv] of Object.entries(pendingRef.current)) {
        for (const p of conv.pending) {
          if (p.at <= now) {
            dispatch({ type: 'receive-message', contactId: id, text: p.text })
            delivered = true
          }
        }
      }
      if (delivered) dispatch({ type: 'flush-pending', now })
    }, 250)
    return () => window.clearInterval(timer)
  }, [])

  // Contacts drifting on and off line while you are signed in.
  const signedIn = state.signedIn
  useEffect(() => {
    if (!signedIn) return
    const timers = PRESENCE_EVENTS.map((event) =>
      window.setTimeout(() => {
        dispatch({ type: 'contact-presence', contactId: event.contactId, presence: event.to })
        const contact = CONTACTS.find((c) => c.id === event.contactId)
        if (!contact) return
        dispatch({
          type: 'toast',
          toast: {
            kind: event.to === 'offline' ? 'offline' : 'online',
            title: contact.name,
            text:
              event.to === 'offline'
                ? `${contact.email}\njust signed out.`
                : `${contact.email}\njust signed in.`,
            contactId: contact.id,
            picture: contact.picture,
          },
        })
        play(event.to === 'offline' ? 'offline' : 'online')
        // Someone coming online who cannot help themselves.
        if (event.to === 'online' && event.contactId === 'nat') {
          window.setTimeout(() => {
            dispatch({ type: 'receive-message', contactId: 'nat', text: 'heyy im back on :)' })
          }, 4200)
        }
      }, event.afterMs)
    )
    return () => timers.forEach(window.clearTimeout)
  }, [signedIn])

  const value = useMemo(() => state, [state])
  return (
    <StateContext.Provider value={value}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  )
}

export function useStore() {
  const state = useContext(StateContext)
  if (!state) throw new Error('useStore must be used inside StoreProvider')
  return state
}

export function useDispatch() {
  const dispatch = useContext(DispatchContext)
  if (!dispatch) throw new Error('useDispatch must be used inside StoreProvider')
  return dispatch
}
