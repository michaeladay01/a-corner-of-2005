import { useEffect, useState } from 'react'
import {
  Butterfly,
  IeIcon,
  LimeWireIcon,
  EbayIcon,
  PaintIcon,
  MineIcon,
  SolitaireIcon,
  NotepadIcon,
  NetworkIcon,
  StartFlag,
  VolumeIcon,
  FolderIcon,
  MailIcon,
} from '../Icons'
import { play } from '../../lib/sounds'
import { useDispatch, useStore, type WindowKind, type WindowState } from '../../state/store'

function clock(now: Date) {
  const h = now.getHours()
  const m = now.getMinutes().toString().padStart(2, '0')
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${m} ${suffix}`
}

export function windowIcon(kind: WindowKind, size = 15) {
  switch (kind) {
    case 'hotmail':
      return <MailIcon size={size} />
    case 'ie':
      return <IeIcon size={size} />
    case 'ebay':
      return <EbayIcon size={size} />
    case 'paint':
      return <PaintIcon size={size} />
    case 'minesweeper':
      return <MineIcon size={size} />
    case 'solitaire':
      return <SolitaireIcon size={size} />
    case 'notepad':
      return <NotepadIcon size={size} />
    case 'limewire':
      return <LimeWireIcon size={size} />
    case 'recycle-bin':
      return <FolderIcon size={size} />
    case 'explorer':
      return <FolderIcon size={size} />
    /* These are web pages shown in Internet Explorer, so they carry its icon
       rather than the Messenger butterfly. */
    case 'youtube':
    case 'yahoo':
    case 'addictinggames':
    case 'apple':
      return <IeIcon size={size} />
    default:
      return <Butterfly size={size} />
  }
}

export function Taskbar() {
  const state = useStore()
  const dispatch = useDispatch()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 10000)
    return () => window.clearInterval(t)
  }, [])

  const onTaskClick = (win: WindowState) => {
    if (win.minimized) dispatch({ type: 'restore-window', id: win.id })
    else if (state.focused === win.id) dispatch({ type: 'minimize-window', id: win.id })
    else dispatch({ type: 'focus-window', id: win.id })
  }

  const unreadTotal = Object.values(state.conversations).reduce((n, c) => n + c.unread, 0)

  return (
    <div className="taskbar">
      <button
        className={`start-button${state.startMenuOpen ? ' open' : ''}`}
        onClick={() => {
          dispatch({ type: 'start-menu', open: !state.startMenuOpen })
        }}
      >
        <StartFlag />
        start
      </button>

      <div className="quick-launch">
        <button title="Internet Explorer" onClick={() => dispatch({ type: 'open-window', kind: 'ie' })}>
          <IeIcon size={16} />
        </button>
        <button
          title="MSN Messenger"
          onClick={() =>
            dispatch({ type: 'open-window', kind: state.signedIn ? 'messenger' : 'signin' })
          }
        >
          <Butterfly size={16} />
        </button>
        <button title="MSN Hotmail" onClick={() => dispatch({ type: 'open-window', kind: 'hotmail' })}>
          <MailIcon size={16} />
        </button>
      </div>

      <div className="task-buttons">
        {state.windows.map((win) => {
          const conv = win.contactId ? state.conversations[win.contactId] : undefined
          return (
            <button
              key={win.id}
              className={[
                'task-button',
                state.focused === win.id && !win.minimized ? 'active' : '',
                conv && conv.unread > 0 ? 'flashing' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onTaskClick(win)}
              title={win.title}
            >
              {windowIcon(win.kind)}
              <span>{win.title}</span>
            </button>
          )
        })}
      </div>

      <div className="tray">
        <div className="tray-icons">
          <button
            title={state.settings.muted ? 'Sounds are muted' : 'Mute sounds'}
            onClick={() => {
              dispatch({ type: 'set-setting', patch: { muted: !state.settings.muted } })
              if (state.settings.muted) play('message')
            }}
          >
            <VolumeIcon muted={state.settings.muted} />
          </button>
          <button title="Local Area Connection (56.6 Kbps)">
            <NetworkIcon />
          </button>
          <button
            title={
              state.signedIn
                ? `MSN Messenger${unreadTotal ? ` - ${unreadTotal} new message(s)` : ' - signed in'}`
                : 'MSN Messenger - not signed in'
            }
            onClick={() =>
              dispatch({ type: 'open-window', kind: state.signedIn ? 'messenger' : 'signin' })
            }
            style={unreadTotal ? { animation: 'task-flash 1s steps(1) infinite' } : undefined}
          >
            <Butterfly />
          </button>
        </div>
        <div className="tray-clock" title={now.toDateString()}>
          {clock(now)}
        </div>
      </div>
    </div>
  )
}
