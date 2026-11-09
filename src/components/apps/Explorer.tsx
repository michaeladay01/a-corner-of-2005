import { useEffect, useState, type ReactNode } from 'react'
import { FOLDERS, TASK_LINKS, TASK_TITLE, type Entry } from '../../data/folders'
import { useDispatch, useStore } from '../../state/store'

/* Windows Explorer as it looked in XP: the blue task pane down the left with
   its collapsible panels, the toolbar, the address bar, and the files on a
   white field to the right. */

function Chevron({ open }: { open: boolean }) {
  return (
    <span className={`xp-chev${open ? '' : ' closed'}`} aria-hidden>
      <svg width="9" height="9" viewBox="0 0 9 9" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 5.4 L4.5 2 L8 5.4" fill="none" stroke="#2a4b8d" strokeWidth="1.6" />
        <path d="M1 7.6 L4.5 4.2 L8 7.6" fill="none" stroke="#2a4b8d" strokeWidth="1.6" />
      </svg>
    </span>
  )
}

/* One collapsible blue panel. */
function Panel({
  title,
  children,
  startOpen = true,
}: {
  title: string
  children: ReactNode
  startOpen?: boolean
}) {
  const [open, setOpen] = useState(startOpen)
  return (
    <div className={`xp-panel${open ? '' : ' collapsed'}`}>
      <button className="xp-panel-head" onClick={() => setOpen((o) => !o)}>
        <span>{title}</span>
        <Chevron open={open} />
      </button>
      {open ? <div className="xp-panel-body">{children}</div> : null}
    </div>
  )
}

/* The folder icon: a manila folder, with a small badge for the special ones. */
function FolderGlyph({ badge, size = 48 }: { badge?: 'music' | 'picture'; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 12 h14 l4 4 h24 a2 2 0 0 1 2 2 v20 a2 2 0 0 1 -2 2 H3 a2 2 0 0 1 -2 -2 V14 a2 2 0 0 1 2 -2 z"
        fill="#f8d57e"
        stroke="#c48e22"
      />
      <path
        d="M7 20 h38 a2 2 0 0 1 2 2.3 l-2.6 16 a2 2 0 0 1 -2 1.7 H3.6 a2 2 0 0 1 -2 -2.3 l2.6 -16 a2 2 0 0 1 2 -1.7 z"
        fill="#ffe9a8"
        stroke="#c48e22"
      />
      {badge === 'music' ? (
        <g transform="translate(24,6)">
          <circle cx="4" cy="12" r="3" fill="#2a63c0" />
          <path d="M7 12 V3 l6 -1.6 V10" fill="none" stroke="#2a63c0" strokeWidth="2" />
          <circle cx="13" cy="10" r="3" fill="#2a63c0" />
        </g>
      ) : null}
      {badge === 'picture' ? (
        <g transform="translate(25,5)">
          <rect x="0" y="0" width="17" height="13" rx="1" fill="#fff" stroke="#6a86a8" />
          <circle cx="4.5" cy="4" r="1.8" fill="#f0c040" />
          <path d="M1.5 12 L6 6.5 L9.5 10 L12 7.5 L15.5 12 z" fill="#4a9a4a" />
        </g>
      ) : null}
    </svg>
  )
}

function EntryGlyph({ entry, size = 48 }: { entry: Entry; size?: number }) {
  if (entry.kind === 'folder') {
    const badge =
      entry.name.includes('Music') ? 'music' : entry.name.includes('Picture') ? 'picture' : undefined
    return <FolderGlyph badge={badge} size={size} />
  }
  if (entry.kind === 'drive') {
    const cd = entry.name.startsWith('CD')
    const floppy = entry.name.startsWith('3')
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        {cd ? (
          <>
            <circle cx="24" cy="24" r="16" fill="#dfe8f2" stroke="#8aa0bb" />
            <circle cx="24" cy="24" r="4.5" fill="#fff" stroke="#8aa0bb" />
            <path d="M14 14 A14 14 0 0 1 34 14" fill="none" stroke="#9fc4e8" strokeWidth="3" />
          </>
        ) : floppy ? (
          <>
            <rect x="9" y="9" width="30" height="30" rx="2" fill="#4a4f58" stroke="#2c3038" />
            <rect x="15" y="9" width="18" height="12" fill="#d8dce2" />
            <rect x="26" y="11" width="5" height="8" fill="#6a7079" />
            <rect x="14" y="26" width="20" height="13" rx="1" fill="#eceff3" />
          </>
        ) : (
          <>
            <rect x="6" y="16" width="36" height="17" rx="2" fill="#e4eaf2" stroke="#8aa0bb" />
            <rect x="6" y="28" width="36" height="5" fill="#c9d6e6" />
            <circle cx="37" cy="30.5" r="1.4" fill="#4a9a4a" />
          </>
        )}
      </svg>
    )
  }
  if (entry.kind === 'image') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="9" width="36" height="30" rx="1.5" fill="#fff" stroke="#8aa0bb" />
        <rect x="9" y="12" width="30" height="24" fill="#bcd9f2" />
        <circle cx="17" cy="19" r="3.2" fill="#ffd34d" />
        <path d="M9 36 L20 22 L27 30 L32 24 L39 36 z" fill="#5aa05a" />
      </svg>
    )
  }
  if (entry.kind === 'audio') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 7 h18 l8 8 v26 a2 2 0 0 1 -2 2 H11 a2 2 0 0 1 -2 -2 V9 a2 2 0 0 1 2 -2 z"
          fill="#fff" stroke="#8aa0bb" />
        <path d="M29 7 v8 h8" fill="#e7eef7" stroke="#8aa0bb" />
        <g transform="translate(15,20)">
          <circle cx="3.5" cy="12" r="3.3" fill="#2a63c0" />
          <path d="M6.8 12 V2.6 L15 1 V10.4" fill="none" stroke="#2a63c0" strokeWidth="2.2" />
          <circle cx="11.7" cy="10.4" r="3.3" fill="#2a63c0" />
        </g>
      </svg>
    )
  }
  // A Word document, which is what everything in My Documents was.
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 6 h18 l8 8 v28 a2 2 0 0 1 -2 2 H11 a2 2 0 0 1 -2 -2 V8 a2 2 0 0 1 2 -2 z"
        fill="#fff" stroke="#8aa0bb" />
      <path d="M29 6 v8 h8" fill="#e7eef7" stroke="#8aa0bb" />
      <rect x="9" y="26" width="22" height="14" rx="1.5" fill="#2a56b8" />
      <text x="20" y="37" textAnchor="middle" fill="#fff" fontSize="11" fontFamily="Georgia, serif">
        W
      </text>
    </svg>
  )
}

export function Explorer({
  folder: folderId,
  windowId,
}: {
  folder?: string
  windowId: string
}) {
  const [current, setCurrent] = useState(folderId ?? 'documents')
  const [selected, setSelected] = useState<string | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [ahead, setAhead] = useState<string[]>([])
  const state = useStore()
  const dispatch = useDispatch()

  const folder = FOLDERS[current] ?? FOLDERS.documents
  const chosen = folder.entries.find((e) => e.id === selected) ?? null

  // The title bar and taskbar button follow you around the folders.
  useEffect(() => {
    dispatch({ type: 'rename-window', id: windowId, title: folder.name })
  }, [dispatch, windowId, folder.name])

  const goTo = (id: string) => {
    if (!FOLDERS[id]) return
    setHistory((h) => [...h, current])
    setAhead([])
    setSelected(null)
    setCurrent(id)
  }

  const back = () => {
    setHistory((h) => {
      if (!h.length) return h
      const prev = h[h.length - 1]
      setAhead((f) => [current, ...f])
      setSelected(null)
      setCurrent(prev)
      return h.slice(0, -1)
    })
  }

  const forward = () => {
    setAhead((f) => {
      if (!f.length) return f
      setHistory((h) => [...h, current])
      setSelected(null)
      setCurrent(f[0])
      return f.slice(1)
    })
  }

  const up = () => folder.parent && goTo(folder.parent)

  const openEntry = (entry: Entry) => {
    if (entry.kind === 'folder' && entry.to) {
      goTo(entry.to)
      return
    }
    if (entry.kind === 'audio') {
      dispatch({ type: 'open-window', kind: 'limewire' })
      return
    }
    if (entry.kind === 'image') {
      dispatch({ type: 'open-window', kind: 'paint' })
      return
    }
    if (entry.kind === 'text') {
      dispatch({ type: 'open-window', kind: 'notepad' })
      return
    }
  }

  return (
    <div className="explorer">
      <div className="xp-menubar">
        {['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help'].map((m) => (
          <button key={m}>{m}</button>
        ))}
        <span className="xp-menu-flag" aria-hidden>
          <svg width="22" height="18" viewBox="0 0 22 18" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="9" height="7.5" fill="#e8544a" />
            <rect x="11.5" y="1" width="9" height="7.5" fill="#6ab04a" />
            <rect x="1" y="9.5" width="9" height="7.5" fill="#3a8fd8" />
            <rect x="11.5" y="9.5" width="9" height="7.5" fill="#f0b429" />
          </svg>
        </span>
      </div>

      <div className="xp-toolbar">
        <button className="xp-tb" onClick={back} disabled={!history.length}>
          <span className="xp-nav back" aria-hidden />
          Back
        </button>
        <button className="xp-tb icon" onClick={forward} disabled={!ahead.length} title="Forward">
          <span className="xp-nav fwd" aria-hidden />
        </button>
        <button className="xp-tb icon" onClick={up} disabled={!folder.parent} title="Up">
          <svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 8 h7 l2.5 2.5 H19 v8.5 H3 z" fill="#f3cf72" stroke="#b98b22" />
            <path d="M12 9 l4.5 -5 l4.5 5 h-2.6 v4 h-3.8 v-4 z" fill="#4a9a4a" stroke="#2d6b2d" />
          </svg>
        </button>
        <span className="xp-tb-sep" />
        <button className="xp-tb" title="Search">
          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8.5" cy="8.5" r="5.5" fill="#dcecff" stroke="#2a63c0" strokeWidth="1.8" />
            <path d="M12.6 12.6 L18 18" stroke="#2a63c0" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          Search
        </button>
        <button className="xp-tb" title="Folders">
          <FolderGlyph size={20} />
          Folders
        </button>
        <span className="xp-tb-sep" />
        <button className="xp-tb icon" title="Views">
          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="7" height="7" fill="#5a8fd0" stroke="#2a4b8d" />
            <rect x="11" y="2" width="7" height="7" fill="#9ec4ea" stroke="#2a4b8d" />
            <rect x="2" y="11" width="7" height="7" fill="#9ec4ea" stroke="#2a4b8d" />
            <rect x="11" y="11" width="7" height="7" fill="#5a8fd0" stroke="#2a4b8d" />
          </svg>
          <span className="xp-caret" />
        </button>
      </div>

      <div className="xp-address">
        <span className="xp-address-label">Address</span>
        <div className="xp-address-field">
          <FolderGlyph size={16} />
          <span>{folder.name}</span>
          <span className="xp-caret down" />
        </div>
        <button className="xp-go">
          <span className="xp-go-arrow" aria-hidden />
          Go
        </button>
      </div>

      <div className="xp-body">
        <div className="xp-tasks scroll">
          <Panel title={TASK_TITLE[folder.tasks]}>
            <ul className="xp-links">
              {TASK_LINKS[folder.tasks].map((link) => (
                <li key={link}>
                  <span className="xp-link-icon" aria-hidden>
                    <FolderGlyph size={16} />
                  </span>
                  <button>{link}</button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Other Places">
            <ul className="xp-links">
              {[
                { label: 'Desktop', to: null },
                { label: 'Shared Documents', to: 'shared' },
                { label: 'My Computer', to: 'computer' },
                { label: 'My Network Places', to: null },
              ].map((place) => (
                <li key={place.label}>
                  <span className="xp-link-icon" aria-hidden>
                    <FolderGlyph size={16} />
                  </span>
                  <button onClick={() => place.to && goTo(place.to)}>{place.label}</button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Details" startOpen={false}>
            <div className="xp-details">
              <strong>{chosen ? chosen.name : folder.name}</strong>
              <span>{chosen ? (chosen.detail ?? 'File') : 'File Folder'}</span>
              {chosen?.size ? <span>Size: {chosen.size}</span> : null}
              {!chosen ? <span>{folder.entries.length} objects</span> : null}
            </div>
          </Panel>
        </div>

        <div
          className="xp-files scroll"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null)
          }}
        >
          {folder.entries.map((entry) => (
            <button
              key={entry.id}
              className={`xp-file${selected === entry.id ? ' selected' : ''}`}
              onClick={() => setSelected(entry.id)}
              onDoubleClick={() => openEntry(entry)}
              title={entry.name}
            >
              <EntryGlyph entry={entry} />
              <span>{entry.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="xp-statusbar">
        <span>
          {chosen ? '1 object selected' : `${folder.entries.length} objects`}
          {chosen?.size ? `   ${chosen.size}` : ''}
        </span>
        <span className="xp-status-right">
          {folder.tasks === 'system' ? 'My Computer' : state.me.name}
        </span>
      </div>
    </div>
  )
}
