import { useEffect, useMemo, useRef, useState } from 'react'
import { Butterfly, MailIcon } from '../Icons'
import { EMAILS, FOLDERS, INCOMING, ME, type Email, type Folder } from '../../data/emails'
import { play } from '../../lib/sounds'
import { forget } from '../../lib/storage'

type View = 'list' | 'read' | 'compose' | 'sending' | 'sent'

type Draft = {
  id?: string
  to: string
  cc: string
  subject: string
  body: string
}

const EMPTY: Draft = { to: '', cc: '', subject: '', body: '' }
const PER_PAGE = 10

function stamp() {
  const d = new Date()
  const p = (n: number) => n.toString().padStart(2, '0')
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return `${days[d.getDay()]} ${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`
}

function quote(email: Email) {
  return (
    `\n\n\n------- Original Message -------\n` +
    `From: ${email.from} <${email.fromAddress}>\n` +
    `Sent: ${email.at}\nSubject: ${email.subject}\n\n` +
    email.body
      .split('\n')
      .map((l) => `> ${l}`)
      .join('\n')
  )
}

export function Hotmail() {
  // The mailbox lives for as long as the window does. Anything written or
  // sent here is gone on a refresh, which is the point: everyone arrives at
  // the same inbox rather than someone else's leftovers.
  const [emails, setEmails] = useState<Email[]>(EMAILS)
  const [folder, setFolder] = useState<Folder>('Inbox')
  const [selected, setSelected] = useState<string | null>(null)
  const [ticked, setTicked] = useState<Set<string>>(new Set())
  const [view, setView] = useState<View>('list')
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [showCc, setShowCc] = useState(false)
  const [page, setPage] = useState(0)
  const [notice, setNotice] = useState<string | null>(null)
  const [moveOpen, setMoveOpen] = useState(false)
  const delivered = useRef(0)

  // Clear the mailbox that older versions persisted.
  useEffect(() => { forget('hotmail') }, [])

  const inFolder = useMemo(
    () => emails.filter((e) => e.folder === folder),
    [emails, folder]
  )
  const unreadIn = (f: Folder) => emails.filter((e) => e.folder === f && e.unread).length
  const unread = unreadIn('Inbox')

  const pages = Math.max(1, Math.ceil(inFolder.length / PER_PAGE))
  const shown = inFolder.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)
  const current = emails.find((e) => e.id === selected) ?? null

  // Mail arrives while you are sitting there, with the Hotmail chime.
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (delivered.current >= INCOMING.length) return
      const next = INCOMING[delivered.current]
      delivered.current += 1
      setEmails((list) =>
        list.some((e) => e.id === next.id)
          ? list
          : [{ ...next, folder: 'Inbox', unread: true, at: stamp() }, ...list]
      )
      setNotice('You have new mail.')
      play('message')
    }, 45000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!notice) return
    const t = window.setTimeout(() => setNotice(null), 4000)
    return () => window.clearTimeout(t)
  }, [notice])

  const goFolder = (f: Folder) => {
    setFolder(f)
    setSelected(null)
    setTicked(new Set())
    setPage(0)
    setView('list')
  }

  const openEmail = (email: Email) => {
    setSelected(email.id)
    setEmails((list) => list.map((e) => (e.id === email.id ? { ...e, unread: false } : e)))
    setView('read')
  }

  const targets = () => (ticked.size ? [...ticked] : selected ? [selected] : [])

  const moveTo = (to: Folder) => {
    const ids = targets()
    if (!ids.length) return
    setEmails((list) => list.map((e) => (ids.includes(e.id) ? { ...e, folder: to } : e)))
    setTicked(new Set())
    setSelected(null)
    setView('list')
    setMoveOpen(false)
    setNotice(`${ids.length} message${ids.length > 1 ? 's' : ''} moved to ${to}.`)
  }

  const remove = () => {
    const ids = targets()
    if (!ids.length) {
      play('error')
      setNotice('Select a message first.')
      return
    }
    if (folder === 'Trash Can') {
      setEmails((list) => list.filter((e) => !ids.includes(e.id)))
      setNotice(`${ids.length} message${ids.length > 1 ? 's' : ''} deleted permanently.`)
    } else {
      setEmails((list) => list.map((e) => (ids.includes(e.id) ? { ...e, folder: 'Trash Can' } : e)))
      setNotice(`${ids.length} message${ids.length > 1 ? 's' : ''} moved to the Trash Can.`)
    }
    setTicked(new Set())
    setSelected(null)
    setView('list')
  }

  const markUnread = () => {
    const ids = targets()
    if (!ids.length) return
    setEmails((list) => list.map((e) => (ids.includes(e.id) ? { ...e, unread: true } : e)))
    setTicked(new Set())
    setSelected(null)
    setView('list')
  }

  const compose = (d: Draft = EMPTY) => {
    setDraft(d)
    setShowCc(Boolean(d.cc))
    setView('compose')
  }

  const reply = (all: boolean) => {
    if (!current) return
    compose({
      to: current.fromAddress,
      cc: all && current.cc ? current.cc : '',
      subject: current.subject.startsWith('re:') ? current.subject : `re: ${current.subject}`,
      body: quote(current),
    })
  }

  const forward = () => {
    if (!current) return
    compose({
      to: '',
      cc: '',
      subject: current.subject.startsWith('fw:') ? current.subject : `fw: ${current.subject}`,
      body: quote(current),
    })
  }

  const saveDraft = () => {
    if (!draft.to && !draft.subject && !draft.body) {
      play('error')
      setNotice('There is nothing to save.')
      return
    }
    const id = draft.id ?? `d${Date.now()}`
    const row: Email = {
      id,
      from: 'Me',
      fromAddress: ME,
      to: draft.to,
      cc: draft.cc,
      subject: draft.subject || '(no subject)',
      at: stamp(),
      unread: false,
      folder: 'Drafts',
      outgoing: true,
      body: draft.body,
    }
    setEmails((list) =>
      list.some((e) => e.id === id) ? list.map((e) => (e.id === id ? row : e)) : [row, ...list]
    )
    setDraft(EMPTY)
    setView('list')
    setFolder('Drafts')
    setNotice('Your message has been saved in Drafts.')
  }

  const send = () => {
    if (!draft.to.trim()) {
      play('error')
      setNotice('Please enter at least one recipient.')
      return
    }
    if (!draft.body.trim()) {
      play('error')
      setNotice('Please write a message before sending.')
      return
    }
    setView('sending')
    // A beat of "Sending..." before it lands, as it always took.
    window.setTimeout(() => {
      const id = `s${Date.now()}`
      setEmails((list) => [
        {
          id,
          from: 'Me',
          fromAddress: ME,
          to: draft.to,
          cc: draft.cc,
          subject: draft.subject || '(no subject)',
          at: stamp(),
          unread: false,
          folder: 'Sent Messages',
          outgoing: true,
          body: draft.body,
        },
        // A draft that is sent stops being a draft.
        ...list.filter((e) => e.id !== draft.id),
      ])
      setDraft(EMPTY)
      play('send')
      setView('sent')
    }, 1400)
  }

  const toggleTick = (id: string) =>
    setTicked((t) => {
      const next = new Set(t)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const allTicked = shown.length > 0 && shown.every((e) => ticked.has(e.id))

  return (
    <div className="hotmail">
      <div className="ie-bar">
        <button
          className="xp-button"
          style={{ minWidth: 0 }}
          onClick={() => { setView('list'); setSelected(null) }}
        >
          Back
        </button>
        <button className="xp-button" style={{ minWidth: 0 }} >
          Forward
        </button>
        <span className="url">
          <MailIcon size={13} />
          &nbsp;http://www.hotmail.msn.com/cgi-bin/hmhome
        </span>
      </div>

      <div className="hotmail-head">
        <div className="logo">
          MSN Hotmail
          <span style={{ fontSize: 10, fontWeight: 'normal', color: '#5a7a96' }}>
            {' '}— {folder} ({unread} unread)
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#5a7a96' }}>
          <Butterfly size={14} /> {ME} &nbsp;·&nbsp; 2 MB of free storage
        </div>
      </div>

      {notice ? (
        <div className="hm-notice">
          <MailIcon size={13} />
          {notice}
          <button onClick={() => setNotice(null)}>close</button>
        </div>
      ) : null}

      <div className="hotmail-body">
        <div className="hotmail-nav">
          <button className="hm-compose" onClick={() => compose()}>
            <MailIcon size={13} />
            New Message
          </button>
          {FOLDERS.map((f) => {
            const n = unreadIn(f)
            const total = emails.filter((e) => e.folder === f).length
            return (
              <button
                key={f}
                className={folder === f ? 'active' : ''}
                onClick={() => goFolder(f)}
              >
                <MailIcon size={13} />
                {f}
                {n ? ` (${n})` : total ? ` [${total}]` : ''}
              </button>
            )
          })}
        </div>

        <div className="mail-list">
          {view === 'compose' ? (
            <div className="hm-compose-pane scroll">
              <div className="hm-compose-bar">
                <button className="xp-button" onClick={send}>Send</button>
                <button className="xp-button" onClick={saveDraft}>Save Draft</button>
                <button
                  className="xp-button"
                  onClick={() => { setDraft(EMPTY); setView('list') }}
                >
                  Cancel
                </button>
              </div>
              <table className="hm-fields">
                <tbody>
                  <tr>
                    <th>To:</th>
                    <td>
                      <input
                        value={draft.to}
                        placeholder="name@hotmail.com"
                        onChange={(e) => setDraft({ ...draft, to: e.target.value })}
                      />
                      {!showCc ? (
                        <button className="hm-link" onClick={() => setShowCc(true)}>
                          Show Cc
                        </button>
                      ) : null}
                    </td>
                  </tr>
                  {showCc ? (
                    <tr>
                      <th>Cc:</th>
                      <td>
                        <input
                          value={draft.cc}
                          onChange={(e) => setDraft({ ...draft, cc: e.target.value })}
                        />
                      </td>
                    </tr>
                  ) : null}
                  <tr>
                    <th>Subject:</th>
                    <td>
                      <input
                        value={draft.subject}
                        onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              <textarea
                className="hm-body"
                value={draft.body}
                placeholder="Type your message here..."
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
              />
              <div className="hm-compose-foot">
                <label>
                  <input type="checkbox" defaultChecked /> Save a copy in Sent Messages
                </label>
                <span>Messages are not actually delivered anywhere.</span>
              </div>
            </div>
          ) : view === 'sending' ? (
            <div className="hm-centre">
              <div className="hm-envelope" />
              <p>Sending your message...</p>
              <div className="hm-progress"><i /></div>
            </div>
          ) : view === 'sent' ? (
            <div className="hm-centre">
              <div className="hm-envelope done" />
              <h3>Your message has been sent.</h3>
              <p>A copy has been saved in Sent Messages.</p>
              <p>
                <button className="xp-button" onClick={() => { goFolder('Inbox') }}>
                  Return to Inbox
                </button>{' '}
                <button className="xp-button" onClick={() => { goFolder('Sent Messages') }}>
                  Go to Sent Messages
                </button>
              </p>
            </div>
          ) : (
            <>
              <div className="hm-toolbar">
                <button onClick={() => compose()}>New</button>
                <button disabled={!current || current.outgoing} onClick={() => reply(false)}>Reply</button>
                <button disabled={!current || current.outgoing} onClick={() => reply(true)}>Reply All</button>
                <button disabled={!current} onClick={forward}>Forward</button>
                <span className="hm-sep" />
                <button onClick={remove}>Delete</button>
                <button onClick={markUnread}>Mark as Unread</button>
                <span className="hm-move">
                  <button onClick={() => setMoveOpen(!moveOpen)}>Put in Folder ▾</button>
                  {moveOpen ? (
                    <div className="hm-move-menu">
                      {FOLDERS.filter((f) => f !== folder).map((f) => (
                        <button key={f} onClick={() => moveTo(f)}>{f}</button>
                      ))}
                    </div>
                  ) : null}
                </span>
              </div>

              <div className="mail-table scroll">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 22 }}>
                        <input
                          type="checkbox"
                          checked={allTicked}
                          onChange={() =>
                            setTicked(allTicked ? new Set() : new Set(shown.map((e) => e.id)))
                          }
                        />
                      </th>
                      <th style={{ width: 150 }}>
                        {folder === 'Sent Messages' || folder === 'Drafts' ? 'To' : 'From'}
                      </th>
                      <th>Subject</th>
                      <th style={{ width: 128 }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ color: '#6a7a88', padding: 10 }}>
                          This folder is empty.
                        </td>
                      </tr>
                    ) : (
                      shown.map((e) => (
                        <tr
                          key={e.id}
                          className={[e.unread ? 'unread' : '', selected === e.id ? 'selected' : '']
                            .filter(Boolean)
                            .join(' ')}
                          onClick={() =>
                            e.folder === 'Drafts'
                              ? compose({
                                  id: e.id, to: e.to ?? '', cc: e.cc ?? '',
                                  subject: e.subject === '(no subject)' ? '' : e.subject,
                                  body: e.body,
                                })
                              : openEmail(e)
                          }
                        >
                          <td onClick={(ev) => ev.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={ticked.has(e.id)}
                              onChange={() => toggleTick(e.id)}
                            />
                          </td>
                          <td>{e.outgoing ? e.to || '(no recipient)' : e.from}</td>
                          <td>{e.subject}</td>
                          <td>{e.at}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {pages > 1 ? (
                <div className="hm-pager">
                  <button disabled={page === 0} onClick={() => { setPage(page - 1) }}>
                    &laquo; Previous
                  </button>
                  <span>Page {page + 1} of {pages}</span>
                  <button disabled={page >= pages - 1} onClick={() => { setPage(page + 1) }}>
                    Next &raquo;
                  </button>
                </div>
              ) : null}

              <div className="mail-reading scroll">
                {current && view === 'read' ? (
                  <>
                    <h4>{current.subject}</h4>
                    <div className="meta">
                      {current.outgoing ? (
                        <>To: {current.to}<br /></>
                      ) : (
                        <>From: {current.from} &lt;{current.fromAddress}&gt;<br /></>
                      )}
                      {current.cc ? <>Cc: {current.cc}<br /></> : null}
                      Sent: {current.at}
                    </div>
                    <pre>{current.body}</pre>
                  </>
                ) : (
                  <div style={{ color: '#6a7a88' }}>
                    Select a message to read it. Tick the boxes to act on several at once.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
