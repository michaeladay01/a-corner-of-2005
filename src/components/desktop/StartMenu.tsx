import { useEffect, useRef, useState } from 'react'
import {
  Butterfly,
  FolderIcon,
  IeIcon,
  LimeWireIcon,
  EbayIcon,
  PaintIcon,
  MailIcon,
  MineIcon,
  SolitaireIcon,
  MyComputerIcon,
  NotepadIcon,
  VolumeIcon,
} from '../Icons'
import { pictureSrc } from '../../data/pictures'
import { play } from '../../lib/sounds'
import { useDispatch, useStore, type WindowKind } from '../../state/store'

export function StartMenu() {
  const state = useStore()
  const dispatch = useDispatch()
  const ref = useRef<HTMLDivElement | null>(null)
  const [progs, setProgs] = useState(false)
  const [sub, setSub] = useState<null | 'access' | 'games'>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (ref.current?.contains(target)) return
      if (target.closest('.start-button')) return
      dispatch({ type: 'start-menu', open: false })
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch({ type: 'start-menu', open: false })
    }
    window.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [dispatch])

  const open = (kind: WindowKind) => {
    dispatch({ type: 'open-window', kind })
  }

  /* My Documents, My Pictures and the rest all open the same Explorer window
     pointed at a different folder, the way they actually did. */
  const openFolder = (folder: string, title: string) => {
    dispatch({ type: 'open-window', kind: 'explorer', folder, title })
  }

  return (
    <div className="start-menu" ref={ref}>
      <div className="start-header">
        <img src={pictureSrc(state.me.picture, state.me.name)} alt="" />
        {state.signedIn ? state.me.name.replace(/[^\w ♥!'-]/g, '').trim() || 'User' : 'User'}
      </div>
      <div className="start-body">
        <div className="start-left">
          <button className="start-item" onClick={() => open('ie')}>
            <IeIcon size={24} />
            <span>
              <strong>Internet</strong>
              <small>Internet Explorer</small>
            </span>
          </button>
          <button className="start-item" onClick={() => open('hotmail')}>
            <MailIcon size={24} />
            <span>
              <strong>E-mail</strong>
              <small>MSN Hotmail</small>
            </span>
          </button>
          <div className="start-sep" />
          <button
            className="start-item"
            onClick={() => open(state.signedIn ? 'messenger' : 'signin')}
          >
            <Butterfly size={24} />
            <span>
              <strong>MSN Messenger 7.0</strong>
            </span>
          </button>
          <button className="start-item" onClick={() => open('limewire')}>
            <LimeWireIcon size={24} />
            <span>
              <strong>LimeWire</strong>
              <small>Do not unplug the phone line</small>
            </span>
          </button>
          <button className="start-item" onClick={() => open('ebay')}>
            <EbayIcon size={24} />
            <span>
              <strong>eBay</strong>
              <small>Do not bid on anything</small>
            </span>
          </button>
          <button className="start-item" onClick={() => open('paint')}>
            <PaintIcon size={24} />
            <span>
              <strong>Paint</strong>
              <small>Draw something and save it nowhere</small>
            </span>
          </button>
          <button className="start-item" onClick={() => open('notepad')}>
            <NotepadIcon size={24} />
            <span>
              <strong>Notepad</strong>
            </span>
          </button>
          <button className="start-item" onClick={() => open('solitaire')}>
            <SolitaireIcon size={24} />
            <span>
              <strong>Solitaire</strong>
              <small>The cards cascade when you win</small>
            </span>
          </button>
          <button className="start-item" onClick={() => open('minesweeper')}>
            <MineIcon size={24} />
            <span>
              <strong>Minesweeper</strong>
              <small>Still nobody reads the rules</small>
            </span>
          </button>
          <button className="start-item" onClick={() => open('history')}>
            <FolderIcon size={24} />
            <span>
              <strong>Message History</strong>
            </span>
          </button>
          <div className="start-allprogs">
            <button
              className={`start-item${progs ? ' on' : ''}`}
              onPointerEnter={() => setProgs(true)}
              onClick={() => setProgs((p) => !p)}
            >
              <span>
                <strong>All Programs</strong>
              </span>
              <span className="start-allprogs-arrow" aria-hidden />
            </button>

            {progs ? (
              <div className="start-flyout" onPointerLeave={() => setSub(null)}>
                <button
                  className={`ctx-item submenu${sub === 'access' ? ' on' : ''}`}
                  onPointerEnter={() => setSub('access')}
                >
                  <FolderIcon size={16} />
                  Accessories
                  <span className="ctx-arrow">▸</span>
                  {sub === 'access' ? (
                    <div className="ctx ctx-sub">
                      <button className="ctx-item" onClick={() => open('notepad')}>
                        <NotepadIcon size={16} />
                        Notepad
                      </button>
                      <button className="ctx-item" onClick={() => open('paint')}>
                        <PaintIcon size={16} />
                        Paint
                      </button>
                    </div>
                  ) : null}
                </button>

                {/* Where the games actually lived. */}
                <button
                  className={`ctx-item submenu${sub === 'games' ? ' on' : ''}`}
                  onPointerEnter={() => setSub('games')}
                >
                  <FolderIcon size={16} />
                  Games
                  <span className="ctx-arrow">▸</span>
                  {sub === 'games' ? (
                    <div className="ctx ctx-sub">
                      <button className="ctx-item" disabled>
                        FreeCell
                      </button>
                      <button className="ctx-item" disabled>
                        Hearts
                      </button>
                      <button className="ctx-item" onClick={() => open('minesweeper')}>
                        <MineIcon size={16} />
                        Minesweeper
                      </button>
                      <button className="ctx-item" onClick={() => open('solitaire')}>
                        <SolitaireIcon size={16} />
                        Solitaire
                      </button>
                      <button className="ctx-item" disabled>
                        Spider Solitaire
                      </button>
                    </div>
                  ) : null}
                </button>

                <div className="ctx-sep" />

                <button className="ctx-item" onPointerEnter={() => setSub(null)} onClick={() => open('ie')}>
                  <IeIcon size={16} />
                  Internet Explorer
                </button>
                <button className="ctx-item" onPointerEnter={() => setSub(null)} onClick={() => open('limewire')}>
                  <LimeWireIcon size={16} />
                  LimeWire
                </button>
                <button
                  className="ctx-item"
                  onPointerEnter={() => setSub(null)}
                  onClick={() => open(state.signedIn ? 'messenger' : 'signin')}
                >
                  <Butterfly size={16} />
                  MSN Messenger 7.0
                </button>
                <button className="ctx-item" disabled>
                  Windows Media Player
                </button>
              </div>
            ) : null}
          </div>
        </div>
        <div className="start-right">
          <button className="start-item" onClick={() => openFolder('documents', 'My Documents')}>
            <FolderIcon size={20} />
            <span>My Documents</span>
          </button>
          <button className="start-item has-sub" onClick={() => openFolder('documents', 'My Documents')}>
            <FolderIcon size={20} />
            <span>My Recent Documents</span>
            <span className="start-sub-arrow" aria-hidden />
          </button>
          <button className="start-item" onClick={() => openFolder('pictures', 'My Pictures')}>
            <FolderIcon size={20} />
            <span>My Pictures</span>
          </button>
          <button className="start-item" onClick={() => openFolder('music', 'My Music')}>
            <FolderIcon size={20} />
            <span>My Music</span>
          </button>
          <button className="start-item" onClick={() => openFolder('computer', 'My Computer')}>
            <MyComputerIcon size={20} />
            <span>My Computer</span>
          </button>
          <div className="start-sep" />
          <button className="start-item" onClick={() => open('options')}>
            <VolumeIcon size={20} muted={state.settings.muted} />
            <span>Control Panel</span>
          </button>
          <button className="start-item" onClick={() => open('profile')}>
            <Butterfly size={20} />
            <span>Printers and Faxes</span>
          </button>
          <div className="start-sep" />
          <button className="start-item" onClick={() => open('notepad')}>
            <NotepadIcon size={20} />
            <span>Help and Support</span>
          </button>
          <button className="start-item" onClick={() => openFolder('documents', 'My Documents')}>
            <FolderIcon size={20} />
            <span>Search</span>
          </button>
          <button className="start-item" onClick={() => open('ie')}>
            <IeIcon size={20} />
            <span>Run...</span>
          </button>
        </div>
      </div>
      <div className="start-footer">
        <button
          onClick={() => {
            play('signout')
            dispatch({ type: 'sign-out' })
            dispatch({ type: 'start-menu', open: false })
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="8.4" fill="#f0a030" stroke="#b06a00" />
            <path d="M10 5 v6" stroke="#fff" strokeWidth="2.2" />
          </svg>
          Log Off
        </button>
        <button
          onClick={() => {
            play('signout')
            window.location.reload()
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="10" r="8.4" fill="#d44a2a" stroke="#8a2a10" />
            <path d="M10 4.6 v6" stroke="#fff" strokeWidth="2.2" />
            <path d="M6 6.4 a6 6 0 1 0 8 0" stroke="#fff" strokeWidth="1.8" fill="none" />
          </svg>
          Turn Off Computer
        </button>
      </div>
    </div>
  )
}
