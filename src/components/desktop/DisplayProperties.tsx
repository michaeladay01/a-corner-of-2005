import { useState } from 'react'
import { useDispatch, useStore } from '../../state/store'

/* Display Properties, open on the Desktop tab — which is the only tab anyone
   ever used it for. The other tabs are here because it looked wrong without
   them, and they say so when you click. */

const WALLPAPERS = [
  { id: 'bliss', label: 'Bliss' },
  { id: 'azul', label: 'Azul' },
  { id: 'fruit', label: 'Fruity' },
  { id: 'moon', label: 'Moon Flower' },
  { id: 'teal', label: 'Plain (teal)' },
]

const TABS = ['Themes', 'Desktop', 'Screen Saver', 'Appearance', 'Settings']

export function DisplayProperties({ windowId }: { windowId: string }) {
  const { settings } = useStore()
  const dispatch = useDispatch()
  const [tab, setTab] = useState('Desktop')
  // What the preview shows: nothing is applied until OK or Apply.
  const [choice, setChoice] = useState(settings.wallpaper)

  const apply = () => dispatch({ type: 'set-setting', patch: { wallpaper: choice } })
  const close = () => dispatch({ type: 'close-window', id: windowId })

  return (
    <div className="disp">
      <div className="disp-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`disp-tab${tab === t ? ' on' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="disp-body">
        {tab === 'Desktop' ? (
          <>
            {/* The little CRT that showed you what you were about to pick. */}
            <div className="disp-monitor">
              <div className={`disp-screen wall-${choice}`} />
              <div className="disp-stand" />
            </div>

            <label className="disp-label">Background:</label>
            <div className="disp-list">
              {[{ id: 'none', label: '(None)' }, ...WALLPAPERS].map((w) => (
                <button
                  key={w.id}
                  className={`disp-row${choice === w.id ? ' on' : ''}`}
                  onClick={() => setChoice(w.id)}
                  onDoubleClick={() => { setChoice(w.id); apply() }}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="disp-empty">
            {tab === 'Screen Saver'
              ? 'Your screen saver settings are managed by someone else on this computer.'
              : `${tab} is not available on this computer.`}
          </p>
        )}
      </div>

      <div className="disp-actions">
        <button className="xp-button default" onClick={() => { apply(); close() }}>
          OK
        </button>
        <button className="xp-button" onClick={close}>
          Cancel
        </button>
        <button className="xp-button" onClick={apply}>
          Apply
        </button>
      </div>
    </div>
  )
}
