import { useState } from 'react'
import { PresenceIcon } from '../Icons'
import { MessageText } from './MessageText'
import { useStore } from '../../state/store'

export function History() {
  const state = useStore()
  const withHistory = state.contacts.filter(
    (c) =>
      (state.conversations[c.id]?.messages.length ?? 0) > 0 ||
      (state.archived[c.id]?.length ?? 0) > 0
  )
  const [selected, setSelected] = useState(withHistory[0]?.id ?? '')
  const contact = state.contacts.find((c) => c.id === selected)
  const messages = state.conversations[selected]?.messages ?? state.archived[selected] ?? []

  return (
    <div className="history-list">
      <div className="history-names scroll">
        {withHistory.length === 0 ? (
          <div style={{ padding: 8, color: '#6a7a88' }}>No conversations yet.</div>
        ) : null}
        {withHistory.map((c) => (
          <button
            key={c.id}
            className={selected === c.id ? 'active' : ''}
            onClick={() => setSelected(c.id)}
          >
            <PresenceIcon presence={c.presence} size={14} className="" />
            <span
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {c.name}
            </span>
          </button>
        ))}
      </div>
      <div className="history-view scroll">
        {contact ? (
          <>
            <div style={{ fontWeight: 'bold', color: '#15507f', marginBottom: 6 }}>
              Conversation with {contact.name} ({contact.email})
            </div>
            {messages.map((m) => (
              <div key={m.id} className={`msg${m.kind === 'text' ? '' : ' system'}`}>
                {m.kind === 'text' ? (
                  <>
                    <span className="who">
                      {m.from === 'me' ? state.me.name : contact.name}:{' '}
                    </span>
                    <MessageText text={m.text} />
                  </>
                ) : (
                  m.text
                )}
              </div>
            ))}
          </>
        ) : (
          <div style={{ color: '#6a7a88' }}>
            Start a conversation and it will be archived here.
          </div>
        )}
      </div>
    </div>
  )
}
