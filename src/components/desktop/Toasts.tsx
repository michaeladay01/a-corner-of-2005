import { useEffect } from 'react'
import { PresenceIcon } from '../Icons'
import { pictureSrc } from '../../data/pictures'
import { useDispatch, useStore, type Toast } from '../../state/store'

function ToastCard({ toast }: { toast: Toast }) {
  const dispatch = useDispatch()
  const { contacts } = useStore()
  const contact = contacts.find((c) => c.id === toast.contactId)

  useEffect(() => {
    const t = window.setTimeout(() => dispatch({ type: 'dismiss-toast', id: toast.id }), 6500)
    return () => window.clearTimeout(t)
  }, [dispatch, toast.id])

  const heading =
    toast.kind === 'message'
      ? 'New message'
      : toast.kind === 'email'
        ? 'MSN Hotmail'
        : 'MSN Messenger'

  return (
    <div
      className="toast"
      onClick={() => {
        if (toast.contactId) {
          dispatch({ type: 'open-window', kind: 'conversation', contactId: toast.contactId })
          dispatch({ type: 'mark-read', contactId: toast.contactId })
        } else if (toast.kind === 'email') {
          dispatch({ type: 'open-window', kind: 'hotmail' })
        }
        dispatch({ type: 'dismiss-toast', id: toast.id })
      }}
    >
      <div className="toast-head">
        <span>{heading}</span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            dispatch({ type: 'dismiss-toast', id: toast.id })
          }}
          aria-label="Dismiss"
        >
          {/* Drawn rather than typed: the × glyph's ink sits left of its own
              advance width, so inside a 15px square it never looks centred. */}
          <svg viewBox="0 0 8 8" width="7" height="7" aria-hidden>
            <path
              d="M1 1 L7 7 M7 1 L1 7"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <div className="toast-body">
        {toast.picture ? (
          <img src={pictureSrc(toast.picture, toast.title)} alt="" />
        ) : (
          <PresenceIcon presence="online" size={34} />
        )}
        <div className="text">
          <strong>{toast.title}</strong>
          {toast.text}
          {contact ? <a> </a> : null}
        </div>
      </div>
    </div>
  )
}

export function Toasts() {
  const { toasts } = useStore()
  return (
    <div className="toast-stack">
      {toasts.slice(-4).map((t) => (
        <ToastCard key={t.id} toast={t} />
      ))}
    </div>
  )
}
