import { useMemo, useState, type ReactNode } from 'react'
import {
  HotmailIcon,
  LimeWireIcon,
  PaintIcon,
  IeIcon,
  MsnShortcutIcon,
  NotepadIcon,
  RecycleBinIcon,
} from '../Icons'
import { useDispatch, useStore, type WindowKind } from '../../state/store'

type Shortcut = {
  id: string
  label: string
  icon: ReactNode
  open: WindowKind | 'messenger-or-signin'
  /** For 'explorer' shortcuts, which folder to show. */
  folder?: string
  /** What Arrange Icons By sorts on: a size in KB, a kind, a date. */
  size: number
  type: string
  modified: number
}

const SHORTCUTS: Shortcut[] = [
  { id: 'bin', label: 'Recycle Bin', icon: <RecycleBinIcon />, open: 'recycle-bin' , size: 0, type: 'System Folder', modified: 20050101 },
  { id: 'msn', label: 'MSN Messenger', icon: <MsnShortcutIcon />, open: 'messenger-or-signin' , size: 2, type: 'Shortcut', modified: 20050714 },
  { id: 'ie', label: 'Internet Explorer', icon: <IeIcon />, open: 'ie' , size: 1, type: 'Shortcut', modified: 20050101 },
  { id: 'limewire', label: 'LimeWire', icon: <LimeWireIcon />, open: 'limewire' , size: 3, type: 'Shortcut', modified: 20050802 },
  { id: 'paint', label: 'Paint', icon: <PaintIcon />, open: 'paint' , size: 340, type: 'Application', modified: 20050101 },
  { id: 'hotmail', label: 'Hotmail', icon: <HotmailIcon />, open: 'hotmail' , size: 2, type: 'Shortcut', modified: 20050714 },
  { id: 'readme', label: 'readme.txt', icon: <NotepadIcon />, open: 'notepad' , size: 1, type: 'Text Document', modified: 20050915 },
]

export function DesktopIcons() {
  const { signedIn, settings, refreshes } = useStore()
  const dispatch = useDispatch()
  const [selected, setSelected] = useState<string | null>(null)

  const open = (sc: Shortcut) => {
    const kind: WindowKind =
      sc.open === 'messenger-or-signin' ? (signedIn ? 'messenger' : 'signin') : sc.open
    dispatch({ type: 'open-window', kind, folder: sc.folder, title: sc.folder ? sc.label : undefined })
  }

  // Arrange Icons By. The Recycle Bin stayed first whatever you picked.
  const sorted = useMemo(() => {
    const [bin, ...rest] = SHORTCUTS
    const by = settings.iconSort
    const order = [...rest].sort((a, b) =>
      by === 'name'
        ? a.label.localeCompare(b.label)
        : by === 'size'
          ? a.size - b.size || a.label.localeCompare(b.label)
          : by === 'type'
            ? a.type.localeCompare(b.type) || a.label.localeCompare(b.label)
            : a.modified - b.modified || a.label.localeCompare(b.label)
    )
    return [bin, ...order]
  }, [settings.iconSort])

  return (
    <div className="desktop-icons" key={refreshes}>
      {sorted.map((sc) => (
        <button
          key={sc.id}
          className={`desktop-icon${selected === sc.id ? ' selected' : ''}`}
          onClick={() => setSelected(sc.id)}
          onDoubleClick={() => open(sc)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') open(sc)
          }}
          title={`${sc.label} (double-click to open)`}
        >
          {sc.icon}
          <span>{sc.label}</span>
        </button>
      ))}
    </div>
  )
}
