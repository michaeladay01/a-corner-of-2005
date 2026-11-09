import { useEffect, useRef, useState } from 'react'
import { LogoImg, Butterfly, PresenceIcon } from '../Icons'
import { STATUS_LABEL } from '../../data/statuses'
import { StatusMenu } from './StatusMenu'
import { pictureSrc } from '../../data/pictures'
import type { Presence } from '../../data/types'
import { play } from '../../lib/sounds'
import { useDispatch, useStore } from '../../state/store'

const SAMPLE_PSM = [
  'nothing left to say ¬_¬',
  '*~ dont txt me im skint ~*',
  'bored.com',
  'listening to: Linkin Park ♪',
  'MSN is being so slow 2nite',
]

/* Addresses the combo box remembered for you, the way it always had three
   old accounts in it that you could never work out how to delete. */
const REMEMBERED = [
  'michaela_x0x@hotmail.com',
  'xXx_mystery_user_xXx@hotmail.co.uk',
  'bored.of.this@msn.com',
]

/* The real sign-in screen asked for an e-mail address, not a display name —
   your name came down with your account. We take it from the address. */
function nameFromEmail(address: string) {
  const local = address.split('@')[0] || ''
  const cleaned = local.replace(/[._-]+/g, ' ').replace(/\d+/g, '').trim()
  if (!cleaned) return 'xXx_mystery_user_xXx'
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase())
}

export function SignIn({ windowId }: { windowId: string }) {
  const { me } = useStore()
  const dispatch = useDispatch()
  const [email, setEmail] = useState(
    me.email === 'your_name_here@hotmail.com' ? '' : me.email
  )
  const [password, setPassword] = useState('')
  const [presence, setPresence] = useState<Presence>('online')
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)
  const [dropped, setDropped] = useState(false)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const emailRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  const signIn = () => {
    const address = email.trim() || 'your_name_here@hotmail.com'
    const displayName = me.name !== 'Me' ? me.name : nameFromEmail(address)
    setBusy(true)
    setDropped(false)
    setStatus('Signing in to .NET Messenger Service...')
    window.setTimeout(() => setStatus('Checking your contact list...'), 700)
    window.setTimeout(() => {
      dispatch({ type: 'sign-in', name: displayName, email: address, presence })
      if (!me.psm) {
        dispatch({
          type: 'set-profile',
          patch: { psm: SAMPLE_PSM[Math.floor(Math.random() * SAMPLE_PSM.length)] },
        })
      }
      play('signin')
    }, 1500)
  }

  return (
    <div className="signin">
      <div className="messenger-menu">
        {['File', 'Contacts', 'Actions', 'Tools', 'Help'].map((label) => (
          <button key={label} disabled={busy}>
            {label}
          </button>
        ))}
      </div>

      <div className="signin-brand">
        <span className="signin-brand-mark">⌃</span>
        <span className="signin-brand-msn">msn</span>
        <span className="signin-brand-fly">
          <Butterfly size={13} />
        </span>
        <span className="signin-brand-word">Messenger</span>
      </div>

      <div className="signin-main">
        <div className="signin-dp">
          <LogoImg name="msn" size={104}>
            <img src={pictureSrc(me.picture, 'you')} alt="" />
          </LogoImg>
        </div>

        <div className="signin-field">
          <label htmlFor={`${windowId}-email`}>E-mail address:</label>
          <div className="signin-combo">
            <input
              id={`${windowId}-email`}
              ref={emailRef}
              className="xp-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && signIn()}
              disabled={busy}
            />
            <button
              className="signin-combo-btn"
              disabled={busy}
              title="Addresses you have used on this computer"
              onClick={() => setDropped((d) => !d)}
            >
              <span className="signin-caret" />
            </button>
            {dropped ? (
              <ul className="signin-drop">
                {REMEMBERED.map((a) => (
                  <li key={a}>
                    <button
                      onClick={() => {
                        setEmail(a)
                        setDropped(false)
                      }}
                    >
                      {a}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="signin-field">
          <label htmlFor={`${windowId}-password`}>Password:</label>
          <input
            id={`${windowId}-password`}
            className="xp-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && signIn()}
            disabled={busy}
          />
        </div>

        <div className="signin-statusrow">
          <span>Status:</span>
          <button
            className="signin-status-btn"
            disabled={busy}
            onClick={(e) => {
              const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
              setMenu({ x: r.left, y: r.bottom })
            }}
          >
            <PresenceIcon presence={presence} size={13} />
            {STATUS_LABEL[presence]}
            <span className="signin-caret" />
          </button>
        </div>

        <div className="signin-checks">
          <label>
            <input type="checkbox" defaultChecked disabled={busy} /> Remember Me
          </label>
          <label>
            <input type="checkbox" disabled={busy} /> Remember my Password
          </label>
          <label>
            <input type="checkbox" disabled={busy} /> Sign me in automatically
          </label>
        </div>

        <div className="signin-status">{status}</div>

        <div className="signin-actions">
          <button className="xp-button default" onClick={signIn} disabled={busy}>
            <u>S</u>ign In
          </button>
        </div>

        <div className="signin-links">
          <span className="signin-link forgot">Forgot your password?</span>
          <span className="signin-link status">Service Status</span>
          <span className="signin-link newacct">Get a new account</span>
        </div>
      </div>

      <div className="signin-passport">
        <span className="passport-mark" />
        Microsoft Passport Network
      </div>

      {menu ? (
        <StatusMenu
          at={menu}
          onPick={(p) => {
            setPresence(p)
            setMenu(null)
          }}
          onClose={() => setMenu(null)}
        />
      ) : null}
    </div>
  )
}
