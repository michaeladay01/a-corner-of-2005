import { useRef, useState } from 'react'
import { DISPLAY_PICTURES, letterPicture, pictureSrc } from '../../data/pictures'
import { play } from '../../lib/sounds'
import { useDispatch, useStore } from '../../state/store'

export function DisplayPicturePicker({ windowId }: { windowId: string }) {
  const { me } = useStore()
  const dispatch = useDispatch()
  const [picked, setPicked] = useState(me.picture)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [error, setError] = useState('')

  const onFile = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('That file is not a picture.')
      play('error')
      return
    }
    if (file.size > 1_500_000) {
      setError('Pick something under 1.5 MB — this is a 56k connection, after all.')
      play('error')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setPicked(String(reader.result))
      setError('')
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="pane">
      <div className="pane-title">My Display Picture</div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div className="signin-dp">
          <img src={pictureSrc(picked, me.name)} alt="Selected display picture" />
        </div>
        <div style={{ color: '#2c5878', lineHeight: 1.5 }}>
          Choose a picture, or browse for one of your own.
          <br />
          Everyone in your contact list can see this.
        </div>
      </div>

      <fieldset className="group-box">
        <legend>Pictures</legend>
        <div className="dp-grid">
          <button
            className={picked === 'letters' ? 'selected' : ''}
            onClick={() => setPicked('letters')}
            title="Your initials"
          >
            <img src={letterPicture(me.name)} alt="" />
          </button>
          {DISPLAY_PICTURES.map((p) => (
            <button
              key={p.id}
              className={picked === p.id ? 'selected' : ''}
              onClick={() => setPicked(p.id)}
              title={p.label}
            >
              <img src={p.src} alt={p.label} />
            </button>
          ))}
          {picked.startsWith('data:image') ? (
            <button className="selected" title="Your picture">
              <img src={picked} alt="" />
            </button>
          ) : null}
        </div>
      </fieldset>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="xp-button" onClick={() => fileRef.current?.click()}>
          Browse...
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <span style={{ color: '#a02000' }}>{error}</span>
      </div>

      <div className="pane-actions">
        <button
          className="xp-button default"
          onClick={() => {
            dispatch({ type: 'set-profile', patch: { picture: picked } })
            dispatch({ type: 'close-window', id: windowId })
          }}
        >
          OK
        </button>
        <button
          className="xp-button"
          onClick={() => dispatch({ type: 'close-window', id: windowId })}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
