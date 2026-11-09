import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Butterfly, Glyph, MailIcon, PresenceIcon, Tool } from '../Icons'
import { StatusMenu } from './StatusMenu'
import { MessageText } from './MessageText'
import { GROUPS } from '../../data/contacts'
import { STATUS_LABEL, bucket } from '../../data/statuses'
import { pictureSrc } from '../../data/pictures'
import { EMAILS } from '../../data/emails'
import type { Contact, Presence } from '../../data/types'
import { play } from '../../lib/sounds'
import { useDispatch, useStore, type WindowKind } from '../../state/store'

/* MSN Messenger 7 put a strip of tabs down the left of the contact list,
   linking out to the other MSN services. Everybody wanted them gone. */
const TABS: { id: string; title: string; opens?: WindowKind; icon: ReactNode }[] = [
  { id: 'contacts', title: 'Contacts', icon: <Butterfly size={16} /> },
  { id: 'today', title: 'MSN Today', opens: 'ie', icon: <Tool.Today /> },
  { id: 'games', title: 'Fun & Games', opens: 'minesweeper', icon: <Tool.Dice /> },
  { id: 'music', title: 'MSN Music', opens: 'limewire', icon: <Tool.Note /> },
  { id: 'mail', title: 'Hotmail', opens: 'hotmail', icon: <MailIcon size={16} /> },
]

/* The banner advert that sat above the status bar, cycling as you sat there. */
const BANNERS = [
  { title: 'Get MSN Messenger 7.0', line: 'Now with winks, nudges and dynamic display pictures', art: '★' },
  { title: 'MSN Premium', line: 'No banner adverts. Only £4.99 a month.', art: '✦' },
  { title: 'Ringtones from 3p', line: 'Text TONE to 80808. Terms apply.', art: '♪' },
  { title: 'Play Hexic on MSN Games', line: 'Free to play in your browser', art: '◆' },
]

function ContactRow({ contact }: { contact: Contact }) {
  const { conversations } = useStore()
  const dispatch = useDispatch()
  const conv = conversations[contact.id]
  const unread = conv?.unread ?? 0

  return (
    <button
      className={[
        'contact-row',
        bucket(contact.presence) === 'offline' ? 'offline' : '',
        unread ? 'unread' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onDoubleClick={() => {
        dispatch({ type: 'open-window', kind: 'conversation', contactId: contact.id })
        dispatch({ type: 'mark-read', contactId: contact.id })
      }}
      onClick={(e) => {
        // A single click selects; a double click opens — as it always did.
        if (e.detail > 1) return
      }}
      title={`${contact.name}\n${contact.email}\n${STATUS_LABEL[contact.presence]}${
        contact.psm ? `\n${contact.psm}` : ''
      }\n\nDouble-click to send a message`}
    >
      <PresenceIcon presence={contact.presence} />
      <img className="contact-dp" src={pictureSrc(contact.picture, contact.name)} alt="" />
      <span className="contact-text">
        <span className="contact-name">
          <MessageText text={contact.name} />
        </span>
        {contact.psm ? (
          <span className="contact-psm">
            - <MessageText text={contact.psm} />
          </span>
        ) : null}
      </span>
    </button>
  )
}

export function ContactList() {
  const state = useStore()
  const dispatch = useDispatch()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)
  const [editingPsm, setEditingPsm] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [draftPsm, setDraftPsm] = useState(state.me.psm)
  const [draftName, setDraftName] = useState(state.me.name)
  const [tab, setTab] = useState('contacts')
  const [banner, setBanner] = useState(0)

  // The advert rotated whether you looked at it or not.
  useEffect(() => {
    const timer = window.setInterval(() => setBanner((b) => (b + 1) % BANNERS.length), 9000)
    return () => window.clearInterval(timer)
  }, [])

  const unreadEmails = EMAILS.filter((e) => e.unread && e.folder === 'Inbox').length

  const grouped = useMemo(() => {
    const online = state.contacts.filter((c) => bucket(c.presence) === 'online')
    const offline = state.contacts.filter((c) => bucket(c.presence) === 'offline')
    if (!state.settings.groupByGroups) {
      return [
        { key: 'Online', contacts: online },
        { key: 'Offline', contacts: offline },
      ]
    }
    const groups = GROUPS.map((g) => ({
      key: g,
      contacts: online.filter((c) => c.group === g),
    })).filter((g) => g.contacts.length)
    return [...groups, { key: 'Offline', contacts: offline }]
  }, [state.contacts, state.settings.groupByGroups])

  const toggle = (key: string) =>
    setCollapsed((c) => ({ ...c, [key]: !c[key] }))

  const setPresence = (p: Presence) => {
    dispatch({ type: 'set-presence', presence: p })
    setMenu(null)
  }

  const onlineCount = state.contacts.filter((c) => bucket(c.presence) === 'online').length

  return (
    <div className="messenger">
      <div className="messenger-menu">
        {['File', 'Contacts', 'Actions', 'Tools', 'Help'].map((label) => (
          <button
            key={label}
            onClick={() => {
              if (label === 'Tools') dispatch({ type: 'open-window', kind: 'options' })
              if (label === 'File') dispatch({ type: 'open-window', kind: 'profile' })
              if (label === 'Actions') dispatch({ type: 'open-window', kind: 'history' })
              if (label === 'Contacts') dispatch({ type: 'open-window', kind: 'hotmail' })
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="my-panel">
        <button
          className="my-dp"
          onClick={() => dispatch({ type: 'open-window', kind: 'display-picture' })}
          title="Change my display picture"
        >
          <img src={pictureSrc(state.me.picture, state.me.name)} alt="My display picture" />
          <span className="dp-presence">
            <PresenceIcon presence={state.me.presence} size={14} className="" />
          </span>
        </button>

        <div className="my-info">
          <div className="my-name-row">
            {editingName ? (
              <input
                className="psm-input"
                autoFocus
                value={draftName}
                maxLength={60}
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={() => {
                  dispatch({ type: 'set-profile', patch: { name: draftName.trim() || state.me.name } })
                  setEditingName(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                  if (e.key === 'Escape') {
                    setDraftName(state.me.name)
                    setEditingName(false)
                  }
                }}
              />
            ) : (
              <button
                className="my-name"
                onClick={() => {
                  setDraftName(state.me.name)
                  setEditingName(true)
                }}
                title="Click to change your display name"
              >
                <MessageText text={state.me.name} />
              </button>
            )}
          </div>

          <button
            className="my-status-btn"
            onClick={(e) => {
              const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
              setMenu({ x: r.left, y: r.bottom })
            }}
            title="Change my status"
          >
            ({STATUS_LABEL[state.me.presence]}) <Glyph.Caret />
          </button>

          {editingPsm ? (
            <input
              className="psm-input"
              autoFocus
              value={draftPsm}
              maxLength={128}
              placeholder="Type a personal message"
              onChange={(e) => setDraftPsm(e.target.value)}
              onBlur={() => {
                dispatch({ type: 'set-profile', patch: { psm: draftPsm } })
                setEditingPsm(false)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                if (e.key === 'Escape') {
                  setDraftPsm(state.me.psm)
                  setEditingPsm(false)
                }
              }}
            />
          ) : (
            <button
              className="my-psm"
              onClick={() => {
                setDraftPsm(state.me.psm)
                setEditingPsm(true)
              }}
              title="Click to change your personal message"
            >
              {state.me.psm ? <MessageText text={state.me.psm} /> : '<Type a personal message>'}
            </button>
          )}
        </div>
      </div>

      <div className="messenger-body">
      <div className="msn-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'active' : ''}
            title={t.title}
            onClick={() => {
              setTab(t.id)
              if (t.opens) dispatch({ type: 'open-window', kind: t.opens })
            }}
          >
            {t.icon}
          </button>
        ))}
      </div>

      <div className="messenger-main">
      <div className="msn-toolbar">
        <button
          onClick={() => dispatch({ type: 'open-window', kind: 'hotmail' })}
          title="Go to my e-mail inbox"
        >
          <MailIcon size={15} />
          {unreadEmails ? `(${unreadEmails})` : ''}
        </button>
        <button onClick={() => dispatch({ type: 'open-window', kind: 'profile' })}>
          <Tool.Invite />
          My Profile
        </button>
        <button onClick={() => dispatch({ type: 'open-window', kind: 'history' })}>
          <Tool.History />
          History
        </button>
        <button onClick={() => dispatch({ type: 'open-window', kind: 'minesweeper' })}>
          Games
        </button>
        <button
          className="msn-today"
          onClick={() => dispatch({ type: 'open-window', kind: 'ie' })}
          title="MSN Today"
        >
          MSN Today
        </button>
      </div>

      <div className="contact-list scroll">
        {grouped.map((group) => (
          <div key={group.key}>
            <button className="group-header" onClick={() => toggle(group.key)}>
              <Glyph.ChevronDown open={!collapsed[group.key]} />
              {group.key} ({group.contacts.length})
            </button>
            {!collapsed[group.key] &&
              group.contacts.map((c) => <ContactRow key={c.id} contact={c} />)}
          </div>
        ))}
      </div>

      <button
        className="msn-banner"
        onClick={() => dispatch({ type: 'open-window', kind: 'ie' })}
        title={BANNERS[banner].title}
      >
        <span className="msn-banner-art">{BANNERS[banner].art}</span>
        <span>
          <strong>{BANNERS[banner].title}</strong>
          <em>{BANNERS[banner].line}</em>
        </span>
      </button>

      <div className="list-footer">
        <Butterfly size={14} />
        {onlineCount} online
      </div>
      </div>
      </div>

      {menu ? (
        <StatusMenu
          at={menu}
          onPick={setPresence}
          onClose={() => setMenu(null)}
          extra={[
            {
              label: 'My Display Picture...',
              onClick: () => {
                dispatch({ type: 'open-window', kind: 'display-picture' })
                setMenu(null)
              },
            },
            {
              label: 'Sign Out',
              onClick: () => {
                play('signout')
                dispatch({ type: 'sign-out' })
                setMenu(null)
              },
            },
          ]}
        />
      ) : null}
    </div>
  )
}
