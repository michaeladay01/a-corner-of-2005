import { useState } from 'react'
import { PresenceIcon } from '../Icons'
import { pictureSrc } from '../../data/pictures'
import { STATUS_LABEL, STATUS_ORDER } from '../../data/statuses'
import type { Presence } from '../../data/types'
import { useDispatch, useStore } from '../../state/store'

export function Profile({ windowId }: { windowId: string }) {
  const { me } = useStore()
  const dispatch = useDispatch()
  const [draft, setDraft] = useState(me)

  const apply = () => {
    dispatch({ type: 'set-profile', patch: draft })
    dispatch({ type: 'close-window', id: windowId })
  }

  return (
    <div className="pane">
      <div className="pane-title">My Profile</div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          className="my-dp"
          style={{ width: 76, height: 76 }}
          onClick={() => dispatch({ type: 'open-window', kind: 'display-picture' })}
          title="Change display picture"
        >
          <img src={pictureSrc(me.picture, me.name)} alt="" />
        </button>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="field-row">
            <label htmlFor={`${windowId}-dn`}>Display name:</label>
            <input
              id={`${windowId}-dn`}
              className="xp-input"
              value={draft.name}
              maxLength={60}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            />
          </div>
          <div className="field-row">
            <label htmlFor={`${windowId}-psm`}>Personal message:</label>
            <input
              id={`${windowId}-psm`}
              className="xp-input"
              value={draft.psm}
              maxLength={128}
              placeholder="*~ dramatic lyrics here ~*"
              onChange={(e) => setDraft({ ...draft, psm: e.target.value })}
            />
          </div>
          <div className="field-row">
            <label htmlFor={`${windowId}-st`}>Status:</label>
            <select
              id={`${windowId}-st`}
              className="xp-input"
              value={draft.presence}
              onChange={(e) => setDraft({ ...draft, presence: e.target.value as Presence })}
            >
              {STATUS_ORDER.map((p) => (
                <option key={p} value={p}>
                  {STATUS_LABEL[p]}
                </option>
              ))}
            </select>
            <PresenceIcon presence={draft.presence} />
          </div>
        </div>
      </div>

      <fieldset className="group-box">
        <legend>About me</legend>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="field-row">
            <label htmlFor={`${windowId}-email`}>E-mail:</label>
            <input
              id={`${windowId}-email`}
              className="xp-input"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
            />
          </div>
          <div className="field-row">
            <label htmlFor={`${windowId}-music`}>Favourite music:</label>
            <input
              id={`${windowId}-music`}
              className="xp-input"
              value={draft.music}
              placeholder="Busted, Blink-182, Eminem..."
              onChange={(e) => setDraft({ ...draft, music: e.target.value })}
            />
          </div>
          <div className="field-row" style={{ alignItems: 'flex-start' }}>
            <label htmlFor={`${windowId}-about`}>A bit about me:</label>
            <textarea
              id={`${windowId}-about`}
              className="xp-input"
              style={{ flex: 1, height: 56, resize: 'none', userSelect: 'text' }}
              value={draft.about}
              placeholder="luv ya all, h8 skool, luv musicccc xXx"
              onChange={(e) => setDraft({ ...draft, about: e.target.value })}
            />
          </div>
        </div>
      </fieldset>

      <div className="pane-actions">
        <button className="xp-button default" onClick={apply}>
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
