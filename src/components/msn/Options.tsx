import { play } from '../../lib/sounds'
import { useDispatch, useStore } from '../../state/store'

const WALLPAPERS = [
  { id: 'bliss', label: 'Bliss' },
  { id: 'azul', label: 'Azul' },
  { id: 'fruit', label: 'Fruity' },
  { id: 'moon', label: 'Moon Flower' },
  { id: 'teal', label: 'Plain (teal)' },
]

export function Options({ windowId }: { windowId: string }) {
  const { settings } = useStore()
  const dispatch = useDispatch()
  const set = (patch: Partial<typeof settings>) => dispatch({ type: 'set-setting', patch })

  return (
    <div className="pane">
      <div className="pane-title">Options</div>

      <fieldset className="group-box">
        <legend>Sounds and effects</legend>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <label className="check-row">
            <input
              type="checkbox"
              checked={!settings.muted}
              onChange={(e) => {
                set({ muted: !e.target.checked })
                if (e.target.checked) play('message')
              }}
            />
            Play sounds (sign in, new message, nudge, contacts coming online)
          </label>
          <label className="check-row">
            <input
              type="checkbox"
              checked={settings.nudgeShake}
              onChange={(e) => set({ nudgeShake: e.target.checked })}
            />
            Let nudges shake the conversation window
          </label>
          <label className="check-row">
            <input
              type="checkbox"
              checked={settings.skipBoot}
              onChange={(e) => set({ skipBoot: e.target.checked })}
            />
            Skip the Windows startup sequence next time
          </label>
        </div>
      </fieldset>

      <fieldset className="group-box">
        <legend>Contact list</legend>
        <label className="check-row">
          <input
            type="checkbox"
            checked={settings.groupByGroups}
            onChange={(e) => set({ groupByGroups: e.target.checked })}
          />
          Sort contacts into groups
        </label>
      </fieldset>

      <fieldset className="group-box">
        <legend>Desktop background</legend>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {WALLPAPERS.map((w) => (
            <button
              key={w.id}
              className="xp-button"
              style={{
                minWidth: 0,
                borderColor: settings.wallpaper === w.id ? '#2a5faf' : undefined,
                fontWeight: settings.wallpaper === w.id ? 'bold' : 'normal',
              }}
              onClick={() => {
                set({ wallpaper: w.id })
              }}
            >
              {w.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="pane-actions">
        <button
          className="xp-button default"
          onClick={() => dispatch({ type: 'close-window', id: windowId })}
        >
          OK
        </button>
      </div>
    </div>
  )
}
