import { useEffect, useMemo, useRef, useState } from 'react'
import { Butterfly, ConvTool, Tool, WinkArt } from '../Icons'
import { EmoticonPanel } from './EmoticonPanel'
import { MessageText } from './MessageText'
import { pictureSrc } from '../../data/pictures'
import { BACKGROUNDS, backgroundCss } from '../../data/backgrounds'
import type { Message } from '../../data/types'
import { play } from '../../lib/sounds'
import { askAgent, checkAgent, agentReady, type Turn } from '../../lib/agent'
import { DEFAULT_FONT, useDispatch, useStore, type Font } from '../../state/store'

const FONTS = ['Comic Sans MS', 'Tahoma', 'Trebuchet MS', 'Courier New', 'Impact', 'Georgia']
const COLORS = [
  '#000080',
  '#000000',
  '#d4007a',
  '#c00000',
  '#007a2f',
  '#6a00c0',
  '#e07000',
  '#007a9a',
]
const WINKS = ['Kiss', 'Sheep', 'Anvil', 'Cheeky']

function time(at: number) {
  const d = new Date(at)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function stamp(at: number) {
  const d = new Date(at)
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} at ${time(at)}`
}

/* 6.2 wrote the sender on its own line as "Name says:", with the message
   indented underneath. No timestamp against each line — the time of the last
   one lived in the status bar instead. */
function Line({ message, meName, themName }: { message: Message; meName: string; themName: string }) {
  if (message.kind === 'nudge') {
    return (
      <div className="msg nudge-line">
        <strong>Nudge sent.</strong> You have just sent a nudge!
      </div>
    )
  }
  if (message.kind === 'wink') {
    return <div className="msg wink-line">{message.text}</div>
  }
  if (message.kind === 'system') {
    return <div className="msg system">{message.text}</div>
  }
  const mine = message.from === 'me'
  const font = message.font ?? DEFAULT_FONT
  return (
    <div className="msg">
      <div className="who">{mine ? meName : themName} says:</div>
      <div
        className="body"
        style={{
          fontFamily: `${font.family}, Tahoma, sans-serif`,
          color: font.color,
          fontWeight: font.bold ? 'bold' : 'normal',
          fontStyle: font.italic ? 'italic' : 'normal',
        }}
      >
        <MessageText text={message.text} />
      </div>
    </div>
  )
}

export function Conversation({ contactId, windowId }: { contactId: string; windowId: string }) {
  const state = useStore()
  const dispatch = useDispatch()
  const contact = state.contacts.find((c) => c.id === contactId)
  const conv = state.conversations[contactId]
  const [draft, setDraft] = useState('')
  const [font, setFont] = useState<Font>(state.me.font)
  const [emoAt, setEmoAt] = useState<{ x: number; y: number } | null>(null)
  const [fontOpen, setFontOpen] = useState(false)
  const [winkOpen, setWinkOpen] = useState(false)
  const [bgOpen, setBgOpen] = useState(false)
  const [background, setBackground] = useState('snow')
  const transcriptRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)
  const lastCount = useRef(conv?.messages.length ?? 0)

  const messages = useMemo(() => conv?.messages ?? [], [conv?.messages])

  useEffect(() => {
    const el = transcriptRef.current
    if (el) el.scrollTop = el.scrollHeight
    if (messages.length > lastCount.current) {
      const latest = messages[messages.length - 1]
      if (latest.from !== 'me' && latest.kind === 'text') play('message')
    }
    lastCount.current = messages.length
  }, [messages])

  useEffect(() => {
    dispatch({ type: 'mark-read', contactId })
  }, [dispatch, contactId, messages.length])

  useEffect(() => {
    void checkAgent()
  }, [])

  /* When the last thing said was mine and a live contact is on the other end,
     go and get their reply. The id guard stops a second request going out for
     the same message if this effect re-runs. */
  const asked = useRef<string | null>(null)
  useEffect(() => {
    if (!agentReady() || !contact) return
    const last = messages[messages.length - 1]
    if (!last || last.from !== 'me' || last.kind !== 'text') return
    if (contact.presence === 'offline') return
    if (asked.current === last.id) return
    asked.current = last.id

    let cancelled = false
    const history: Turn[] = messages
      .filter((m) => m.kind === 'text' && (m.from === 'me' || m.from === 'them'))
      .map((m) => ({ from: m.from as 'me' | 'them', text: m.text }))

    askAgent(contactId, history, state.me.name, {
      name: contact.name,
      email: contact.email,
      psm: contact.psm,
      music: contact.music,
    }).then((lines) => {
      if (cancelled) return
      dispatch({
        type: 'agent-reply',
        contactId,
        lines: lines ?? ['sorry my internets being weird'],
      })
    })

    return () => {
      cancelled = true
    }
  }, [messages, contact, contactId, dispatch, state.me.name])

  const send = () => {
    const text = draft.trim()
    if (!text) return
    dispatch({ type: 'send-message', contactId, text, font })
    dispatch({ type: 'set-profile', patch: { font } })
    play('send')
    setDraft('')
    inputRef.current?.focus()
  }

  const insert = (snippet: string) => {
    const el = inputRef.current
    if (!el) {
      setDraft((d) => d + snippet)
      return
    }
    const start = el.selectionStart ?? draft.length
    const end = el.selectionEnd ?? draft.length
    const next = draft.slice(0, start) + snippet + draft.slice(end)
    setDraft(next)
    requestAnimationFrame(() => {
      el.focus()
      el.selectionStart = el.selectionEnd = start + snippet.length
    })
  }

  const nudge = () => {
    dispatch({ type: 'send-nudge', contactId })
    play('nudge')
  }

  const wink = (kind: string) => {
    dispatch({ type: 'send-wink', contactId, wink: kind })
    setWinkOpen(false)
    play('message')
  }

  const shaking = state.settings.nudgeShake && (conv?.shake ?? 0) > 0

  useEffect(() => {
    if (!conv?.shake) return
    const t = window.setTimeout(() => dispatch({ type: 'clear-shake', contactId }), 800)
    return () => window.clearTimeout(t)
  }, [conv?.shake, dispatch, contactId])

  const status = useMemo(() => {
    if (!contact) return ''
    if (conv?.typing) return `${contact.name} is writing a message...`
    if (contact.presence === 'offline')
      return `${contact.name} appears offline and will receive your messages when they sign in.`
    const last = [...messages].reverse().find((m) => m.from === 'them')
    if (!last) return 'Never give out your password in an instant message conversation.'
    return `Last message received on ${stamp(last.at)}.`
  }, [contact, conv?.typing, messages])

  if (!contact) return null

  return (
    <div
      className={`conversation${shaking ? ' shake' : ''}`}
      style={{ background: backgroundCss(background) }}
    >
      <div className="messenger-menu conv-menu">
        {['File', 'Edit', 'Actions', 'Tools', 'Help'].map((label) => (
          <button
            key={label}
            onClick={() => {
              if (label === 'Actions') setWinkOpen((o) => !o)
              if (label === 'Tools') dispatch({ type: 'open-window', kind: 'options' })
              if (label === 'File') dispatch({ type: 'close-window', id: windowId })
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* The five big buttons, with the curved tab and the msn butterfly
          tucked into the right-hand end of the strip. */}
      <div className="conv-toolbar">
        <button className="conv-tb" onClick={() => dispatch({ type: 'open-window', kind: 'messenger' })}>
          <ConvTool.Invite />
          <span>
            <u>I</u>nvite
          </span>
        </button>
        <button className="conv-tb" onClick={() => play('error')}>
          <ConvTool.Files />
          <span>
            S<u>e</u>nd Files
          </span>
        </button>
        <button className="conv-tb" onClick={() => play('error')}>
          <ConvTool.Webcam />
          <span>
            <u>W</u>ebcam
          </span>
        </button>
        <button className="conv-tb" onClick={() => play('error')}>
          <ConvTool.Audio />
          <span>
            <u>A</u>udio
          </span>
        </button>
        <button className="conv-tb" onClick={() => dispatch({ type: 'open-window', kind: 'minesweeper' })}>
          <ConvTool.Activities />
          <span>
            Start Applicat<u>i</u>ons
          </span>
        </button>

        <div className="conv-tab">
          <button className="conv-tab-btn" onClick={nudge} title="Send a nudge">
            <span className="conv-tab-caret" />
          </button>
          <button className="conv-tab-btn" onClick={() => play('error')} title="Block this contact">
            <Tool.Block />
          </button>
        </div>

        <span className="conv-msn" aria-hidden>
          msn
          <Butterfly size={13} />
        </span>
      </div>

      <div className="conv-main">
        <div className="conv-left">
          {/* "Para: Guilherme Pita" — the recipient bar above the transcript. */}
          <div className="conv-to">
            <span>
              To: <strong>{<MessageText text={contact.name} />}</strong>
            </span>
            <ConvTool.SmallCam />
          </div>

          <div className="transcript scroll" ref={transcriptRef}>
            {messages.map((m) => (
              <Line key={m.id} message={m} meName={state.me.name} themName={contact.name} />
            ))}
          </div>

          {/* A Font | smiley | Backgrounds — all 6.2 put here. */}
          <div className="conv-format">
            <button className={`fmt-btn${fontOpen ? ' on' : ''}`} onClick={() => setFontOpen((o) => !o)}>
              <span className="fmt-a">A</span>
              <span className="fmt-label">
                <u>F</u>ont
              </span>
            </button>
            <button
              className="fmt-btn"
              onClick={(e) => {
                const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
                setEmoAt({ x: r.left, y: r.top - 150 })
              }}
            >
              <Tool.Emoticon />
              <span className="fmt-caret" />
            </button>
            <span className="fmt-sep" />
            <button className={`fmt-btn${bgOpen ? ' on' : ''}`} onClick={() => setBgOpen((o) => !o)}>
              <ConvTool.Background />
              <span className="fmt-label">
                <u>B</u>ackgrounds
              </span>
              <span className="fmt-caret" />
            </button>
          </div>

          {fontOpen ? (
            <div className="conv-strip">
              <select
                className="xp-input"
                value={font.family}
                onChange={(e) => setFont((f) => ({ ...f, family: e.target.value }))}
                style={{ height: 19 }}
              >
                {FONTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <button
                className={`tool-button${font.bold ? ' on' : ''}`}
                onClick={() => setFont((f) => ({ ...f, bold: !f.bold }))}
                title="Bold"
              >
                <Tool.Bold />
              </button>
              <button
                className={`tool-button${font.italic ? ' on' : ''}`}
                onClick={() => setFont((f) => ({ ...f, italic: !f.italic }))}
                title="Italic"
              >
                <Tool.Italic />
              </button>
              {COLORS.map((c) => (
                <button
                  key={c}
                  className="tool-button"
                  style={{
                    width: 17,
                    height: 17,
                    padding: 0,
                    background: c,
                    border: font.color === c ? '2px solid #15507f' : '1px solid #7f9db9',
                  }}
                  onClick={() => setFont((f) => ({ ...f, color: c }))}
                  title={c}
                />
              ))}
            </div>
          ) : null}

          {bgOpen ? (
            <div className="conv-strip">
              {BACKGROUNDS.map((b) => (
                <button
                  key={b.id}
                  className={`bg-swatch${background === b.id ? ' on' : ''}`}
                  style={{ background: b.css }}
                  title={b.name}
                  onClick={() => {
                    setBackground(b.id)
                    setBgOpen(false)
                  }}
                />
              ))}
            </div>
          ) : null}

          {winkOpen ? (
            <div className="conv-strip">
              <button className="tool-button" onClick={nudge}>
                <Tool.Nudge />
                Nudge
              </button>
              {WINKS.map((w) => (
                <button key={w} className="tool-button" onClick={() => wink(w)}>
                  <Tool.Wink />
                  {w}
                </button>
              ))}
            </div>
          ) : null}

          <div className="conv-compose">
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              style={{
                fontFamily: `${font.family}, Tahoma, sans-serif`,
                color: font.color,
                fontWeight: font.bold ? 'bold' : 'normal',
                fontStyle: font.italic ? 'italic' : 'normal',
              }}
              aria-label={`Message to ${contact.name}`}
            />
            <button className="conv-send" onClick={send} disabled={!draft.trim()}>
              <u>S</u>end
            </button>
          </div>

          <div className="conv-status">{status}</div>
        </div>

        {/* Two display pictures stacked down the right, each in its own white
            frame with the little tab on its outer edge. */}
        <div className="conv-right">
          <div className="conv-dp">
            <img src={pictureSrc(contact.picture, contact.name)} alt="" />
            <span className="dp-tab" aria-hidden />
          </div>
          <div className="conv-dp me">
            <img src={pictureSrc(state.me.picture, state.me.name)} alt="" />
            <span className="dp-tab" aria-hidden />
          </div>
        </div>
      </div>

      {emoAt ? (
        <EmoticonPanel
          at={emoAt}
          onPick={(e) => {
            insert(e.code)
            setEmoAt(null)
          }}
          onClose={() => setEmoAt(null)}
        />
      ) : null}

      {conv?.wink ? <WinkOverlay kind={conv.wink.kind} contactId={contactId} /> : null}
    </div>
  )
}

function WinkOverlay({ kind, contactId }: { kind: string; contactId: string }) {
  const dispatch = useDispatch()
  useEffect(() => {
    const t = window.setTimeout(() => dispatch({ type: 'clear-wink', contactId }), 2600)
    return () => window.clearTimeout(t)
  }, [dispatch, contactId])
  return (
    <div className="wink-overlay">
      <div className="wink-art">
        <WinkArt kind={kind} />
        {kind}!
      </div>
    </div>
  )
}
