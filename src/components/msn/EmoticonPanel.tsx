import { useEffect, useRef, useState } from 'react'
import { EMOTICONS, type Emoticon } from '../../data/emoticons'

type Props = {
  at: { x: number; y: number }
  onPick: (e: Emoticon) => void
  onClose: () => void
}

export function EmoticonPanel({ at, onPick, onClose }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [hover, setHover] = useState<Emoticon | null>(null)

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

  const x = Math.min(at.x, window.innerWidth - 244)
  const y = Math.min(at.y, window.innerHeight - 160)

  return (
    <div className="emoticon-panel" style={{ left: x, top: y }} ref={ref}>
      <div className="grid">
        {EMOTICONS.map((e) => (
          <button
            key={e.code}
            onClick={() => onPick(e)}
            onMouseEnter={() => setHover(e)}
            onMouseLeave={() => setHover(null)}
            title={`${e.name}  ${e.code}`}
          >
            <img src={e.src} alt={e.code} width={19} height={19} />
          </button>
        ))}
      </div>
      <div className="caption">
        {hover ? `${hover.name}  —  ${hover.code}` : 'Pick an emoticon'}
      </div>
    </div>
  )
}
