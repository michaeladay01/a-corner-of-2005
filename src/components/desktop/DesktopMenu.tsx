import { useEffect, useRef, useState } from 'react'
import { play } from '../../lib/sounds'
import { useDispatch, useStore, type IconSort } from '../../state/store'

/* The menu you got by right-clicking the desktop. Most of XP's entries were
   greyed out most of the time, which is half of what made it feel like the
   real thing — so the dead ones are here too, dead. */

export type MenuAt = { x: number; y: number }

const ARRANGE: { id: IconSort; label: string }[] = [
  { id: 'name', label: 'Name' },
  { id: 'size', label: 'Size' },
  { id: 'type', label: 'Type' },
  { id: 'modified', label: 'Modified' },
]

export function DesktopMenu({ at, onClose }: { at: MenuAt; onClose: () => void }) {
  const { settings } = useStore()
  const dispatch = useDispatch()
  const [open, setOpen] = useState<null | 'arrange' | 'new'>(null)
  const root = useRef<HTMLDivElement>(null)
  const [place, setPlace] = useState<MenuAt>(at)

  // Keep the whole menu on screen, the way a real one flipped at the edges.
  useEffect(() => {
    const el = root.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setPlace({
      x: Math.min(at.x, window.innerWidth - r.width - 4),
      y: Math.min(at.y, window.innerHeight - r.height - 34),
    })
  }, [at])

  useEffect(() => {
    const away = () => onClose()
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('pointerdown', away)
    window.addEventListener('keydown', esc)
    return () => {
      window.removeEventListener('pointerdown', away)
      window.removeEventListener('keydown', esc)
    }
  }, [onClose])

  const choose = (fn: () => void) => () => {
    fn()
    onClose()
  }

  return (
    <div
      ref={root}
      className="ctx"
      style={{ left: place.x, top: place.y }}
      onPointerDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <button
        className={`ctx-item submenu${open === 'arrange' ? ' on' : ''}`}
        onPointerEnter={() => setOpen('arrange')}
      >
        Arrange Icons By
        <span className="ctx-arrow">▸</span>
        {open === 'arrange' ? (
          <div className="ctx ctx-sub">
            {ARRANGE.map((a) => (
              <button
                key={a.id}
                className="ctx-item"
                onClick={choose(() => {
                  dispatch({ type: 'set-setting', patch: { iconSort: a.id } })
                  play('click')
                })}
              >
                <span className="ctx-tick">{settings.iconSort === a.id ? '•' : ''}</span>
                {a.label}
              </button>
            ))}
            <div className="ctx-sep" />
            <button className="ctx-item" disabled>
              <span className="ctx-tick" />
              Show in Groups
            </button>
            <button className="ctx-item" disabled>
              <span className="ctx-tick" />
              Auto Arrange
            </button>
            <button className="ctx-item" disabled>
              <span className="ctx-tick" />
              Align to Grid
            </button>
          </div>
        ) : null}
      </button>

      <button
        className="ctx-item"
        onPointerEnter={() => setOpen(null)}
        onClick={choose(() => {
          // Refresh never did anything either. It just felt like it did.
          dispatch({ type: 'refresh-desktop' })
          play('click')
        })}
      >
        Refresh
      </button>

      <div className="ctx-sep" />

      <button className="ctx-item" disabled>
        Paste
      </button>
      <button className="ctx-item" disabled>
        Paste Shortcut
      </button>

      <div className="ctx-sep" />

      <button
        className={`ctx-item submenu${open === 'new' ? ' on' : ''}`}
        onPointerEnter={() => setOpen('new')}
      >
        New
        <span className="ctx-arrow">▸</span>
        {open === 'new' ? (
          <div className="ctx ctx-sub">
            <button className="ctx-item" disabled>
              Folder
            </button>
            <button className="ctx-item" disabled>
              Shortcut
            </button>
            <div className="ctx-sep" />
            <button
              className="ctx-item"
              onClick={choose(() => dispatch({ type: 'open-window', kind: 'notepad' }))}
            >
              Text Document
            </button>
          </div>
        ) : null}
      </button>

      <div className="ctx-sep" />

      <button
        className="ctx-item"
        onPointerEnter={() => setOpen(null)}
        onClick={choose(() => dispatch({ type: 'open-window', kind: 'display' }))}
      >
        Properties
      </button>
    </div>
  )
}
