import { useEffect, useRef } from 'react'
import { play } from '../../lib/sounds'

/** Just the Windows load: the logo, the bar, and away. */
const LOADING_MS = 2200

export function BootSequence({ onFinish }: { onFinish: () => void }) {
  const finished = useRef(false)

  const finish = () => {
    if (finished.current) return
    finished.current = true
    onFinish()
  }

  useEffect(() => {
    // The chime only plays if the visitor has already interacted with the page.
    play('startup')
    const t = window.setTimeout(finish, LOADING_MS)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div className="boot">
      <div className="boot-xp">
        <div className="boot-logo">
          <svg width="86" height="86" viewBox="0 0 86 86" xmlns="http://www.w3.org/2000/svg">
            <g transform="rotate(-12 43 43)">
              <path d="M8 14 Q24 6 40 11 L38 38 Q22 33 7 40Z" fill="#f04a3a" />
              <path d="M44 12 Q62 8 78 16 L76 42 Q60 35 42 39Z" fill="#6cc24a" />
              <path d="M7 44 Q22 37 38 42 L36 70 Q20 64 6 71Z" fill="#3a8ddc" />
              <path d="M42 43 Q60 39 76 46 L74 74 Q58 67 40 71Z" fill="#ffc11e" />
            </g>
          </svg>
          <div className="word">
            Microsoft<small>WINDOWS</small>
            <em>xp</em>
          </div>
        </div>
        <div className="boot-progress">
          <i />
        </div>
        <div className="boot-footer">Copyright © Microsoft Corporation</div>
      </div>

      <button className="skip-boot" onClick={finish}>
        Skip startup
      </button>
    </div>
  )
}
