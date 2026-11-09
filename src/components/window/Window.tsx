import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Glyph } from '../Icons'
import { useDrag } from '../../lib/useDrag'
import { useDispatch, type WindowState } from '../../state/store'

type Props = {
  win: WindowState
  focused: boolean
  icon?: ReactNode
  children: ReactNode
  shake?: boolean
  onShakeEnd?: () => void
  overlay?: ReactNode
}

/** The grip stops at the window's own floor and ceiling, and at the screen. */
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(Math.max(min, max), v))
}

export function Window({ win, focused, icon, children, shake, onShakeEnd, overlay }: Props) {
  const dispatch = useDispatch()
  const [state, setState] = useState<'open' | 'closing' | 'minimizing'>('open')
  const bodyRef = useRef<HTMLDivElement | null>(null)

  const move = useCallback(
    (p: { x: number; y: number }) => dispatch({ type: 'move-window', id: win.id, x: p.x, y: p.y }),
    [dispatch, win.id]
  )
  const focus = useCallback(() => dispatch({ type: 'focus-window', id: win.id }), [dispatch, win.id])
  const drag = useDrag({ x: win.x, y: win.y }, move, focus)

  const close = () => {
    setState('closing')
    window.setTimeout(() => dispatch({ type: 'close-window', id: win.id }), 110)
  }

  const minimize = () => {
    setState('minimizing')
    window.setTimeout(() => {
      dispatch({ type: 'minimize-window', id: win.id })
      setState('open')
    }, 140)
  }

  // Resize handle, for windows that had one.
  const startResize = (e: React.PointerEvent) => {
    e.stopPropagation()
    const start = { px: e.clientX, py: e.clientY, w: win.w, h: win.h }
    const onMove = (ev: PointerEvent) => {
      dispatch({
        type: 'resize-window',
        id: win.id,
        w: clamp(
          start.w + (ev.clientX - start.px),
          win.minW ?? 240,
          Math.min(win.maxW ?? 1180, window.innerWidth - win.x)
        ),
        h: clamp(
          start.h + (ev.clientY - start.py),
          win.minH ?? 180,
          Math.min(win.maxH ?? 900, window.innerHeight - win.y)
        ),
      })
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  useEffect(() => {
    if (!shake) return
    const t = window.setTimeout(() => onShakeEnd?.(), 780)
    return () => window.clearTimeout(t)
  }, [shake, onShakeEnd])

  if (win.minimized) return null

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && (win.kind === 'signin' || win.kind === 'options')) close()
  }

  return (
    <div
      className={[
        'window',
        focused ? '' : 'unfocused',
        state === 'closing' ? 'closing' : '',
        state === 'minimizing' ? 'minimizing' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }}
      onPointerDownCapture={focus}
      onKeyDown={onKeyDown}
      role="dialog"
      aria-label={win.title}
    >
      <div className="window-title" {...drag} onDoubleClick={minimize}>
        {icon ? <span className="title-icon">{icon}</span> : null}
        <span className="label">{win.title}</span>
        <span className="title-buttons">
          <button className="title-button" onClick={minimize} title="Minimize" aria-label="Minimize">
            <Glyph.Minimize />
          </button>
          <button
            className="title-button"
            
            title="Maximize"
            aria-label="Maximize"
            disabled={!win.resizable}
          >
            <Glyph.Maximize />
          </button>
          <button className="title-button close" onClick={close} title="Close" aria-label="Close">
            <Glyph.Close />
          </button>
        </span>
      </div>
      <div
        className={`window-body${shake ? ' shaking' : ''}`}
        ref={bodyRef}
        style={{ position: 'relative' }}
      >
        {children}
        {overlay}
      </div>
      {win.resizable ? <div className="window-resize" onPointerDown={startResize} /> : null}
    </div>
  )
}
