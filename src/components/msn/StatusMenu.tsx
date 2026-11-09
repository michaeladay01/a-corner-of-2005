import { useEffect, useRef } from 'react'
import { PresenceIcon } from '../Icons'
import { STATUS_LABEL, STATUS_ORDER } from '../../data/statuses'
import type { Presence } from '../../data/types'

type Props = {
  at: { x: number; y: number }
  onPick: (p: Presence) => void
  onClose: () => void
  extra?: { label: string; onClick: () => void }[]
}

export function StatusMenu({ at, onPick, onClose, extra }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const x = Math.min(at.x, window.innerWidth - 180)
  const y = Math.min(at.y, window.innerHeight - 220)

  return (
    <div className="menu-pop" style={{ left: x, top: y }} ref={ref} role="menu">
      {STATUS_ORDER.map((p) => (
        <button key={p} onClick={() => onPick(p)} role="menuitem">
          <PresenceIcon presence={p} size={15} className="" />
          {STATUS_LABEL[p]}
        </button>
      ))}
      {extra?.length ? <hr /> : null}
      {extra?.map((item) => (
        <button key={item.label} onClick={item.onClick} role="menuitem">
          <span style={{ width: 15 }} />
          {item.label}
        </button>
      ))}
    </div>
  )
}
