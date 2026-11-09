import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { BootSequence } from './components/boot/BootSequence'
import { DesktopIcons } from './components/desktop/DesktopIcons'
import { DesktopMenu, type MenuAt } from './components/desktop/DesktopMenu'
import { StartMenu } from './components/desktop/StartMenu'
import { Taskbar, windowIcon } from './components/desktop/Taskbar'
import { Toasts } from './components/desktop/Toasts'
import { Window } from './components/window/Window'
import { ContactList } from './components/msn/ContactList'
import { Conversation } from './components/msn/Conversation'
import { DisplayPicturePicker } from './components/msn/DisplayPicturePicker'
import { History } from './components/msn/History'
import { Options } from './components/msn/Options'
import { Profile } from './components/msn/Profile'
import { SignIn } from './components/msn/SignIn'
import { Hotmail } from './components/apps/Hotmail'
import { LimeWire } from './components/apps/LimeWire'
import { InternetExplorer } from './components/apps/InternetExplorer'
import { Ebay } from './components/apps/Ebay'
import { Paint } from './components/apps/Paint'
import { Minesweeper } from './components/apps/Minesweeper'
import { Solitaire } from './components/apps/Solitaire'
import { DisplayProperties } from './components/desktop/DisplayProperties'
import { Notepad } from './components/apps/Notepad'
import { RecycleBin } from './components/apps/RecycleBin'
import { Explorer } from './components/apps/Explorer'
import { Apple } from './components/apps/Apple'
import { YouTube } from './components/apps/YouTube'
import { Yahoo } from './components/apps/Yahoo'
import { AddictingGames } from './components/apps/AddictingGames'
import { play } from './lib/sounds'
import { useDispatch, useStore, type WindowState } from './state/store'
import { readEmbedPlan, type EmbedPlan } from './lib/embed'

function WindowContent({ win }: { win: WindowState }) {
  switch (win.kind) {
    case 'signin':
      return <SignIn windowId={win.id} />
    case 'messenger':
      return <ContactList />
    case 'conversation':
      return win.contactId ? (
        <Conversation contactId={win.contactId} windowId={win.id} />
      ) : null
    case 'hotmail':
      return <Hotmail />
    case 'minesweeper':
      return <Minesweeper />
    case 'limewire':
      return <LimeWire />
    case 'ie':
      return <InternetExplorer windowId={win.id} />
    case 'ebay':
      return <Ebay />
    case 'paint':
      return <Paint windowId={win.id} />
    case 'solitaire':
      return <Solitaire />
    case 'display':
      return <DisplayProperties windowId={win.id} />
    case 'notepad':
      return <Notepad />
    case 'recycle-bin':
      return <RecycleBin />
    case 'explorer':
      return <Explorer folder={win.folder} windowId={win.id} />
    case 'apple':
      return <Apple />
    case 'youtube':
      return <YouTube />
    case 'yahoo':
      return <Yahoo />
    case 'addictinggames':
      return <AddictingGames />
    case 'profile':
      return <Profile windowId={win.id} />
    case 'display-picture':
      return <DisplayPicturePicker windowId={win.id} />
    case 'options':
      return <Options windowId={win.id} />
    case 'history':
      return <History />
  }
}

/* When the page is embedded, open what the URL asked for and size it to the
   frame. Runs once; with no embed parameters it does nothing at all. */
function useEmbedPlan(plan: EmbedPlan) {
  const state = useStore()
  const dispatch = useDispatch()
  const opened = useRef(false)
  const placed = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!plan.active || opened.current) return
    opened.current = true
    if (plan.skipBoot) dispatch({ type: 'boot-finished' })
    if (plan.signIn && !state.signedIn) {
      dispatch({
        type: 'sign-in',
        name: state.me.name,
        email: state.me.email,
        presence: 'online',
      })
    }
    if (plan.open) {
      dispatch({ type: 'open-window', kind: plan.open, contactId: plan.contactId })
    }
  }, [plan, dispatch, state.signedIn, state.me.name, state.me.email])

  /* Make every window fit the frame it has been given, once each.
     A resizable application fills it. One with a fixed size — the sign-in
     panel, Minesweeper — keeps its proportions and sits in the middle, since
     stretching those is how an embed starts looking like a mistake. Windows
     that open later, such as a conversation someone starts, are brought
     inside the frame the same way rather than hanging off the edge. */
  // Laid out before the paint, not after: a window is created at a default
  // position worked out for a full screen, and correcting that in a plain
  // effect means it is drawn once over at the left and then slides across.
  useLayoutEffect(() => {
    if (!plan.active || !plan.fit) return
    const pad = plan.bare ? 0 : 8
    const chrome = plan.bare ? 0 : 30
    const roomW = Math.max(240, window.innerWidth - pad * 2)
    const roomH = Math.max(200, window.innerHeight - pad * 2 - chrome)

    for (const win of state.windows) {
      if (placed.current.has(win.id)) continue
      placed.current.add(win.id)

      const fills = win.resizable !== false && win.kind === plan.open
      const w = fills ? roomW : Math.min(win.w, roomW)
      const h = fills ? roomH : Math.min(win.h, roomH)
      if (w !== win.w || h !== win.h) {
        dispatch({ type: 'resize-window', id: win.id, w, h })
      }
      dispatch({
        type: 'move-window',
        id: win.id,
        x: pad + Math.max(0, Math.round((roomW - w) / 2)),
        y: pad + Math.max(0, Math.round((roomH - h) / 2)),
      })
    }
  }, [plan, state.windows, dispatch])
}

function Desktop({ plan }: { plan: EmbedPlan }) {
  // Where the desktop menu was asked for, or null when it is not up.
  const [menuAt, setMenuAt] = useState<MenuAt | null>(null)
  const state = useStore()
  const dispatch = useDispatch()
  const announced = useRef<Set<string>>(new Set())

  useEmbedPlan(plan)

  // A message from a contact with no window open starts a new conversation,
  // just as it used to — window, alert and all.
  useEffect(() => {
    for (const [contactId, conv] of Object.entries(state.conversations)) {
      if (conv.unread === 0) continue
      const hasWindow = state.windows.some(
        (w) => w.kind === 'conversation' && w.contactId === contactId
      )
      const last = conv.messages[conv.messages.length - 1]
      if (!last || last.from === 'me') continue
      const key = `${contactId}:${last.id}`
      if (announced.current.has(key)) continue
      announced.current.add(key)
      const contact = state.contacts.find((c) => c.id === contactId)
      if (!contact) continue
      if (!hasWindow) {
        dispatch({ type: 'open-window', kind: 'conversation', contactId })
      }
      dispatch({
        type: 'toast',
        toast: {
          kind: 'message',
          title: contact.name,
          text: last.text.slice(0, 90),
          contactId,
          picture: contact.picture,
        },
      })
      play('message')
    }
  }, [state.conversations, state.windows, state.contacts, dispatch])

  // A gentle pointer towards the shortcut on the first visit.
  useEffect(() => {
    if (state.signedIn || plan.active) return
    const t = window.setTimeout(() => {
      dispatch({
        type: 'toast',
        toast: {
          kind: 'online',
          title: 'MSN Messenger 7.0',
          text: 'Double-click the Messenger shortcut on the desktop to sign in.',
        },
      })
    }, 1200)
    return () => window.clearTimeout(t)
  }, [dispatch, state.signedIn, plan.active])

  return (
    <div className={`desktop${plan.bare ? ' desktop-bare' : ''}`}>
      <div
        className={`desktop-surface wall-${state.settings.wallpaper}`}
        onMouseDown={() => state.startMenuOpen && dispatch({ type: 'start-menu', open: false })}
        onContextMenu={(e) => {
          // Only the desktop itself: a right-click inside a window belongs to
          // whatever is in that window.
          const target = e.target as HTMLElement
          if (target.closest('.window') || target.closest('.desktop-icon')) return
          e.preventDefault()
          setMenuAt({ x: e.clientX, y: e.clientY })
        }}
      >
        {plan.bare ? null : <DesktopIcons />}

        {state.windows.map((win) => (
          <Window
            key={win.id}
            win={win}
            focused={state.focused === win.id}
            icon={windowIcon(win.kind, 16)}
          >
            <WindowContent win={win} />
          </Window>
        ))}

        <Toasts />

        {menuAt ? <DesktopMenu at={menuAt} onClose={() => setMenuAt(null)} /> : null}
      </div>

      {state.startMenuOpen ? <StartMenu /> : null}
      {plan.bare ? null : <Taskbar />}
    </div>
  )
}

export default function App() {
  const state = useStore()
  const dispatch = useDispatch()
  const plan = useMemo(() => readEmbedPlan(), [])

  if (state.phase === 'boot' && !plan.skipBoot) {
    return <BootSequence onFinish={() => dispatch({ type: 'boot-finished' })} />
  }
  return <Desktop plan={plan} />
}
