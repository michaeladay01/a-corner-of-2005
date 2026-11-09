import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useDispatch } from '../../state/store'

/** The classic Paint palette: 28 colours over two rows. */
const PALETTE = [
  '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080',
  '#808040', '#004040', '#0080ff', '#004080', '#8000ff', '#804000',
  '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff',
  '#ffff80', '#00ff80', '#80ffff', '#8080ff', '#ff0080', '#ff8040',
]

type Tool =
  | 'free-select' | 'select' | 'eraser' | 'fill'
  | 'pick' | 'zoom' | 'pencil' | 'brush'
  | 'airbrush' | 'text' | 'line' | 'curve'
  | 'rect' | 'polygon' | 'ellipse' | 'round-rect'

const TOOLS: { id: Tool; title: string; icon: ReactNode }[] = [
  { id: 'free-select', title: 'Free-Form Select', icon: (
    <path d="M3 9 C5 3 9 2 12 4 C15 6 14 11 10 13 C6 15 3 13 3 9 Z" fill="none" stroke="#000" strokeDasharray="2 1.6" />
  ) },
  { id: 'select', title: 'Select', icon: (
    <rect x="2.5" y="3.5" width="11" height="9" fill="none" stroke="#000" strokeDasharray="2 1.6" />
  ) },
  { id: 'eraser', title: 'Eraser', icon: (
    <>
      <path d="M4 11 L9 4 L14 7 L9 14 Z" fill="#fff" stroke="#000" />
      <path d="M2 14 h7" stroke="#000" />
    </>
  ) },
  { id: 'fill', title: 'Fill With Colour', icon: (
    <>
      <path d="M4 8 L9 3 L14 8 L9 13 Z" fill="#b0b0c8" stroke="#000" />
      <path d="M13 10 q2 2 0 3.4 q-2-1.4 0-3.4Z" fill="#000" />
    </>
  ) },
  { id: 'pick', title: 'Pick Colour', icon: (
    <>
      <path d="M10 3 l3 3 l-6 6 l-3-3Z" fill="#9aa" stroke="#000" />
      <path d="M4 12 L2.5 14.5 L5 13Z" fill="#000" />
    </>
  ) },
  { id: 'zoom', title: 'Magnifier', icon: (
    <>
      <circle cx="7" cy="7" r="4" fill="#dff" stroke="#000" />
      <path d="M10 10 l4 4" stroke="#000" strokeWidth="1.6" />
    </>
  ) },
  { id: 'pencil', title: 'Pencil', icon: (
    <>
      <path d="M11 2.6 l2.4 2.4 l-7.6 7.6 l-2.4 -2.4Z" fill="#ffd86a" stroke="#000" />
      <path d="M3.4 10.2 L2.6 13.4 L5.8 12.6Z" fill="#000" />
    </>
  ) },
  { id: 'brush', title: 'Brush', icon: (
    <>
      <path d="M10 2.6 l3.4 3.4 l-5 5 l-3.4-3.4Z" fill="#c8a06a" stroke="#000" />
      <path d="M5 7.6 L2.6 13.4 L8.4 11Z" fill="#555" stroke="#000" />
    </>
  ) },
  { id: 'airbrush', title: 'Airbrush', icon: (
    <>
      <rect x="7" y="6" width="6" height="4" fill="#b0b0c8" stroke="#000" />
      <circle cx="4" cy="5" r="0.8" fill="#000" /><circle cx="3" cy="8" r="0.7" fill="#000" />
      <circle cx="5" cy="10" r="0.6" fill="#000" /><circle cx="2" cy="11" r="0.6" fill="#000" />
      <circle cx="5.6" cy="7" r="0.6" fill="#000" />
    </>
  ) },
  { id: 'text', title: 'Text', icon: (
    <text x="8" y="13" fontSize="13" fontFamily="Times New Roman, serif" fontWeight="bold" textAnchor="middle" fill="#000">A</text>
  ) },
  { id: 'line', title: 'Line', icon: <path d="M3 13 L13 3" stroke="#000" strokeWidth="1.4" /> },
  { id: 'curve', title: 'Curve', icon: <path d="M3 13 C5 3 11 3 13 11" fill="none" stroke="#000" strokeWidth="1.4" /> },
  { id: 'rect', title: 'Rectangle', icon: <rect x="2.5" y="4.5" width="11" height="7" fill="none" stroke="#000" strokeWidth="1.3" /> },
  { id: 'polygon', title: 'Polygon', icon: <path d="M3 10 L6 3 L13 5 L11 13 Z" fill="none" stroke="#000" strokeWidth="1.3" /> },
  { id: 'ellipse', title: 'Ellipse', icon: <ellipse cx="8" cy="8" rx="5.5" ry="4" fill="none" stroke="#000" strokeWidth="1.3" /> },
  { id: 'round-rect', title: 'Rounded Rectangle', icon: <rect x="2.5" y="4.5" width="11" height="7" rx="2.4" fill="none" stroke="#000" strokeWidth="1.3" /> },
]

const SHAPES: Tool[] = ['line', 'rect', 'ellipse', 'round-rect', 'polygon', 'curve']
const SIZE_TOOLS: Tool[] = ['pencil', 'brush', 'eraser', 'line', 'curve', 'airbrush']

const W0 = 560
const H0 = 400

export function Paint({ windowId }: { windowId: string }) {
  const dispatch = useDispatch()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dims, setDims] = useState({ w: W0, h: H0 })
  const W = dims.w
  const H = dims.h
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState<Tool>('pencil')
  const [primary, setPrimary] = useState('#000000')
  const [secondary, setSecondary] = useState('#ffffff')
  const [size, setSize] = useState(2)
  const [menu, setMenu] = useState<string | null>(null)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const [status, setStatus] = useState('For Help, click Help Topics on the Help Menu.')
  const [zoom, setZoom] = useState(1)
  const [showTools, setShowTools] = useState(true)
  const [showColours, setShowColours] = useState(true)
  const [showStatus, setShowStatus] = useState(true)
  const [dialog, setDialog] = useState<string | null>(null)
  const [size2, setSize2] = useState({ w: W0, h: H0 })
  const [skew, setSkew] = useState({ sx: 100, sy: 100, hx: 0, hy: 0 })
  const fileRef = useRef<HTMLInputElement>(null)

  const drawing = useRef(false)
  const start = useRef({ x: 0, y: 0 })
  const last = useRef({ x: 0, y: 0 })
  const colour = useRef(primary)
  const undo = useRef<ImageData[]>([])

  const ctx = () => canvasRef.current!.getContext('2d', { willReadFrequently: true })!
  const octx = () => overlayRef.current!.getContext('2d')!

  // A fresh white canvas, as Paint always opened with.
  useEffect(() => {
    const c = ctx()
    c.fillStyle = '#ffffff'
    c.fillRect(0, 0, W, H)
  }, [])

  const snapshot = () => {
    undo.current.push(ctx().getImageData(0, 0, W, H))
    if (undo.current.length > 12) undo.current.shift()
  }

  const stepBack = () => {
    const prev = undo.current.pop()
    if (!prev) return
    ctx().putImageData(prev, 0, 0)
  }

  const clearAll = () => {
    snapshot()
    const c = ctx()
    c.fillStyle = '#ffffff'
    c.fillRect(0, 0, W, H)
  }

  const coords = (e: React.PointerEvent) => {
    const r = canvasRef.current!.getBoundingClientRect()
    return {
      x: Math.round(((e.clientX - r.left) / r.width) * W),
      y: Math.round(((e.clientY - r.top) / r.height) * H),
    }
  }

  const hexAt = (x: number, y: number) => {
    const d = ctx().getImageData(x, y, 1, 1).data
    return '#' + [d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, '0')).join('')
  }

  /** Scanline flood fill, the paint-pot tool. */
  const floodFill = (x: number, y: number, hex: string) => {
    const c = ctx()
    const img = c.getImageData(0, 0, W, H)
    const d = img.data
    const at = (px: number, py: number) => (py * W + px) * 4
    const t = at(x, y)
    const target = [d[t], d[t + 1], d[t + 2], d[t + 3]]
    const fill = [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
      255,
    ]
    if (target.every((v, i) => v === fill[i])) return
    const matches = (i: number) =>
      Math.abs(d[i] - target[0]) < 12 &&
      Math.abs(d[i + 1] - target[1]) < 12 &&
      Math.abs(d[i + 2] - target[2]) < 12
    const stack = [[x, y]]
    while (stack.length) {
      const [sx, sy] = stack.pop()!
      let px = sx
      while (px >= 0 && matches(at(px, sy))) px--
      px++
      let up = false
      let down = false
      while (px < W && matches(at(px, sy))) {
        const i = at(px, sy)
        d[i] = fill[0]; d[i + 1] = fill[1]; d[i + 2] = fill[2]; d[i + 3] = 255
        if (sy > 0) {
          const m = matches(at(px, sy - 1))
          if (m && !up) { stack.push([px, sy - 1]); up = true } else if (!m) up = false
        }
        if (sy < H - 1) {
          const m = matches(at(px, sy + 1))
          if (m && !down) { stack.push([px, sy + 1]); down = true } else if (!m) down = false
        }
        px++
      }
    }
    c.putImageData(img, 0, 0)
  }

  const strokeDot = (x: number, y: number, hex: string) => {
    const c = ctx()
    c.fillStyle = hex
    if (tool === 'pencil') c.fillRect(x, y, 1, 1)
    else c.fillRect(x - (size >> 1), y - (size >> 1), size, size)
  }

  const spray = (x: number, y: number, hex: string) => {
    const c = ctx()
    c.fillStyle = hex
    const r = size * 3
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2
      const d = Math.random() * r
      c.fillRect(Math.round(x + Math.cos(a) * d), Math.round(y + Math.sin(a) * d), 1, 1)
    }
  }

  const onDown = (e: React.PointerEvent) => {
    if (menu) { setMenu(null); return }
    const { x, y } = coords(e)
    const hex = e.button === 2 ? secondary : primary
    colour.current = hex

    if (tool === 'pick') {
      const picked = hexAt(x, y)
      if (e.button === 2) setSecondary(picked)
      else setPrimary(picked)
      setStatus(`Picked ${picked}`)
      return
    }

    e.currentTarget.setPointerCapture(e.pointerId)
    drawing.current = true
    start.current = { x, y }
    last.current = { x, y }
    snapshot()

    if (tool === 'fill') {
      floodFill(x, y, hex)
      drawing.current = false
      return
    }
    if (tool === 'pencil' || tool === 'brush') strokeDot(x, y, hex)
    if (tool === 'eraser') strokeDot(x, y, secondary)
    if (tool === 'airbrush') spray(x, y, hex)
  }

  const onMove = (e: React.PointerEvent) => {
    const { x, y } = coords(e)
    setPos({ x, y })
    if (!drawing.current) return

    const c = ctx()
    const hex = tool === 'eraser' ? secondary : colour.current

    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
      c.strokeStyle = hex
      c.lineWidth = tool === 'pencil' ? 1 : size
      c.lineCap = tool === 'pencil' ? 'butt' : 'round'
      c.beginPath()
      c.moveTo(last.current.x + 0.5, last.current.y + 0.5)
      c.lineTo(x + 0.5, y + 0.5)
      c.stroke()
      last.current = { x, y }
      return
    }

    if (tool === 'airbrush') {
      spray(x, y, hex)
      return
    }

    if (SHAPES.includes(tool) || tool === 'select' || tool === 'free-select') {
      // Preview on the overlay so the canvas itself is untouched until release.
      const o = octx()
      o.clearRect(0, 0, W, H)
      o.strokeStyle = tool === 'select' || tool === 'free-select' ? '#000' : colour.current
      o.lineWidth = tool === 'select' || tool === 'free-select' ? 1 : size
      o.setLineDash(tool === 'select' || tool === 'free-select' ? [3, 2] : [])
      drawShape(o, start.current, { x, y })
    }
  }

  const drawShape = (
    c: CanvasRenderingContext2D,
    a: { x: number; y: number },
    b: { x: number; y: number }
  ) => {
    const x = Math.min(a.x, b.x)
    const y = Math.min(a.y, b.y)
    const w = Math.abs(b.x - a.x)
    const h = Math.abs(b.y - a.y)
    c.beginPath()
    switch (tool) {
      case 'line':
      case 'curve':
        c.moveTo(a.x + 0.5, a.y + 0.5)
        c.lineTo(b.x + 0.5, b.y + 0.5)
        break
      case 'rect':
      case 'select':
      case 'free-select':
      case 'polygon':
        c.rect(x + 0.5, y + 0.5, w, h)
        break
      case 'round-rect': {
        const r = Math.min(12, w / 2, h / 2)
        c.moveTo(x + r, y)
        c.arcTo(x + w, y, x + w, y + h, r)
        c.arcTo(x + w, y + h, x, y + h, r)
        c.arcTo(x, y + h, x, y, r)
        c.arcTo(x, y, x + w, y, r)
        c.closePath()
        break
      }
      case 'ellipse':
        c.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2)
        break
      default:
        break
    }
    c.stroke()
  }

  const onUp = (e: React.PointerEvent) => {
    if (!drawing.current) return
    drawing.current = false
    const { x, y } = coords(e)
    octx().clearRect(0, 0, W, H)
    if (SHAPES.includes(tool)) {
      const c = ctx()
      c.strokeStyle = colour.current
      c.lineWidth = size
      c.setLineDash([])
      drawShape(c, start.current, { x, y })
    }
  }


  /* ---------- Things the menus actually do ---------- */

  const redo = useRef<ImageData[]>([])
  const clip = useRef<ImageData | null>(null)

  const stepForward = () => {
    const next = redo.current.pop()
    if (!next) return
    undo.current.push(ctx().getImageData(0, 0, W, H))
    ctx().putImageData(next, 0, 0)
  }

  /** Re-paint the canvas from an image, resizing it if asked. */
  const replace = (
    paint: (c: CanvasRenderingContext2D) => void,
    next?: { w: number; h: number }
  ) => {
    const before = ctx().getImageData(0, 0, W, H)
    undo.current.push(before)
    redo.current = []
    if (next) setDims(next)
    // The canvas element resizes on the next paint, so defer the drawing.
    requestAnimationFrame(() => {
      const c = ctx()
      c.save()
      c.fillStyle = '#ffffff'
      c.fillRect(0, 0, next?.w ?? W, next?.h ?? H)
      paint(c)
      c.restore()
    })
  }

  const snapshotFor = (fn: (c: CanvasRenderingContext2D) => void) => {
    snapshot()
    redo.current = []
    fn(ctx())
  }

  const openFile = () => fileRef.current?.click()

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const img = new Image()
    img.onload = () => {
      replace((c) => c.drawImage(img, 0, 0), { w: img.width, h: img.height })
      setStatus(`Opened ${file.name}`)
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(file)
    e.target.value = ''
  }

  const saveAs = () => {
    const a = document.createElement('a')
    a.download = 'untitled.png'
    a.href = canvasRef.current!.toDataURL('image/png')
    a.click()
    setStatus('Saved as untitled.png')
  }

  const print = () => {
    const data = canvasRef.current!.toDataURL('image/png')
    const win = window.open('', '_blank', 'width=700,height=560')
    if (!win) {
      setStatus('Your browser blocked the print window.')
      return
    }
    win.document.write(
      `<title>untitled - Paint</title><body style="margin:0"><img src="${data}" style="max-width:100%"></body>`
    )
    win.document.close()
    win.focus()
    win.print()
  }

  const copy = () => {
    clip.current = ctx().getImageData(0, 0, W, H)
    setStatus('Copied the image.')
  }

  const cut = () => {
    copy()
    clearAll()
    setStatus('Cut the image.')
  }

  const paste = () => {
    if (!clip.current) {
      setStatus('There is nothing to paste.')
      return
    }
    snapshotFor((c) => c.putImageData(clip.current!, 0, 0))
    setStatus('Pasted.')
  }

  /** Flip, mirror or turn the picture. */
  const transform = (kind: 'h' | 'v' | 'r90' | 'r180' | 'r270') => {
    const src = document.createElement('canvas')
    src.width = W
    src.height = H
    src.getContext('2d')!.drawImage(canvasRef.current!, 0, 0)
    const turned = kind === 'r90' || kind === 'r270'
    const next = turned ? { w: H, h: W } : { w: W, h: H }
    replace((c) => {
      if (kind === 'h') {
        c.translate(W, 0)
        c.scale(-1, 1)
      } else if (kind === 'v') {
        c.translate(0, H)
        c.scale(1, -1)
      } else if (kind === 'r180') {
        c.translate(W, H)
        c.rotate(Math.PI)
      } else if (kind === 'r90') {
        c.translate(H, 0)
        c.rotate(Math.PI / 2)
      } else {
        c.translate(0, W)
        c.rotate(-Math.PI / 2)
      }
      c.drawImage(src, 0, 0)
    }, next)
    setDialog(null)
  }

  const applySkew = () => {
    const src = document.createElement('canvas')
    src.width = W
    src.height = H
    src.getContext('2d')!.drawImage(canvasRef.current!, 0, 0)
    const w = Math.max(1, Math.round((W * skew.sx) / 100))
    const h = Math.max(1, Math.round((H * skew.sy) / 100))
    replace((c) => {
      c.transform(1, Math.tan((skew.hy * Math.PI) / 180), Math.tan((skew.hx * Math.PI) / 180), 1, 0, 0)
      c.drawImage(src, 0, 0, w, h)
    }, { w, h })
    setDialog(null)
  }

  const applyAttributes = () => {
    const src = document.createElement('canvas')
    src.width = W
    src.height = H
    src.getContext('2d')!.drawImage(canvasRef.current!, 0, 0)
    replace((c) => c.drawImage(src, 0, 0), {
      w: Math.max(1, Math.min(2000, size2.w)),
      h: Math.max(1, Math.min(2000, size2.h)),
    })
    setDialog(null)
  }

  const menuItems: Record<string, { label: string; run?: () => void }[]> = {
    File: [
      { label: 'New', run: () => { clearAll(); redo.current = [] } },
      { label: 'Open...', run: openFile },
      { label: 'Save', run: saveAs },
      { label: 'Save As...', run: saveAs },
      { label: 'Print...', run: print },
      { label: 'Exit', run: () => dispatch({ type: 'close-window', id: windowId }) },
    ],
    Edit: [
      { label: 'Undo', run: stepBack },
      { label: 'Repeat', run: stepForward },
      { label: 'Cut', run: cut },
      { label: 'Copy', run: copy },
      { label: 'Paste', run: paste },
    ],
    View: [
      { label: 'Tool Box', run: () => setShowTools((v) => !v) },
      { label: 'Color Box', run: () => setShowColours((v) => !v) },
      { label: 'Status Bar', run: () => setShowStatus((v) => !v) },
      { label: 'Zoom', run: () => setZoom((z) => (z >= 4 ? 1 : z * 2)) },
    ],
    Image: [
      { label: 'Flip/Rotate...', run: () => setDialog('flip') },
      { label: 'Stretch/Skew...', run: () => { setSkew({ sx: 100, sy: 100, hx: 0, hy: 0 }); setDialog('skew') } },
      {
        label: 'Invert Colors',
        run: () =>
          snapshotFor((c) => {
            const img = c.getImageData(0, 0, W, H)
            for (let i = 0; i < img.data.length; i += 4) {
              img.data[i] = 255 - img.data[i]
              img.data[i + 1] = 255 - img.data[i + 1]
              img.data[i + 2] = 255 - img.data[i + 2]
            }
            c.putImageData(img, 0, 0)
          }),
      },
      { label: 'Attributes...', run: () => { setSize2({ w: W, h: H }); setDialog('attributes') } },
      { label: 'Clear Image', run: () => { clearAll(); redo.current = [] } },
    ],
    Colors: [{ label: 'Edit Colors...', run: () => setDialog('colours') }],
    Help: [
      { label: 'Help Topics', run: () => setDialog('help') },
      { label: 'About Paint', run: () => setDialog('about') },
    ],
  }

  return (
    <div className="pt" onClick={() => menu && setMenu(null)} onContextMenu={(e) => e.preventDefault()}>
      <div className="pt-menubar">
        {Object.keys(menuItems).map((m) => (
          <button
            key={m}
            className={menu === m ? 'open' : ''}
            onClick={(e) => { e.stopPropagation(); setMenu(menu === m ? null : m) }}
          >
            <u>{m[0]}</u>{m.slice(1)}
          </button>
        ))}
        {menu ? (
          <div
            className="pt-menu"
            style={{ left: Object.keys(menuItems).indexOf(menu) * 52 + 2 }}
            onClick={(e) => e.stopPropagation()}
          >
            {menuItems[menu].map((it) => (
              <button
                key={it.label}
                onClick={() => {
                  it.run?.()
                  setMenu(null)
                  if (!it.run) setStatus('For Help, click Help Topics on the Help Menu.')
                }}
              >
                {it.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="pt-body">
        {showTools ? (
        <div className="pt-toolbox">
          <div className="pt-tools">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                className={tool === t.id ? 'on' : ''}
                title={t.title}
                onClick={() => { setTool(t.id); setStatus(t.title) }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16">{t.icon}</svg>
              </button>
            ))}
          </div>
          <div className="pt-options">
            {SIZE_TOOLS.includes(tool) ? (
              [1, 2, 4, 6, 10].map((s) => (
                <button
                  key={s}
                  className={size === s ? 'on' : ''}
                  onClick={() => { setSize(s) }}
                  title={`${s} pixels`}
                >
                  <span style={{ width: s + 2, height: s + 2, background: '#000', borderRadius: tool === 'pencil' ? 0 : '50%' }} />
                </button>
              ))
            ) : null}
          </div>
        </div>
        ) : null}

        <div className="pt-canvas-area">
          <div className="pt-canvas-wrap" style={{ width: W * zoom, height: H * zoom }}>
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              className="pt-canvas"
              style={{ width: W * zoom, height: H * zoom }}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerLeave={() => setPos(null)}
            />
            <canvas
              ref={overlayRef}
              width={W}
              height={H}
              className="pt-overlay"
              style={{ width: W * zoom, height: H * zoom }}
            />
          </div>
        </div>
      </div>

      {showColours ? (
      <div className="pt-colourbox">
        <div className="pt-current">
          <span className="pt-primary" style={{ background: primary }} />
          <span className="pt-secondary" style={{ background: secondary }} />
        </div>
        <div className="pt-palette">
          {PALETTE.map((hex) => (
            <button
              key={hex}
              style={{ background: hex }}
              title={`${hex} — right-click for background`}
              onClick={() => { setPrimary(hex) }}
              onContextMenu={(e) => { e.preventDefault(); setSecondary(hex) }}
            />
          ))}
        </div>
      </div>
      ) : null}

      {showStatus ? (
      <div className="pt-status">
        <span>{status}</span>
        <span className="pt-coords">{pos ? `${pos.x},${pos.y}` : ''}</span>
        <span className="pt-coords">{zoom > 1 ? `${zoom}x` : ''}</span>
        <span className="pt-coords">{`${W} x ${H}`}</span>
      </div>
      ) : null}

      {/* Open... needs a real file picker, kept out of the way. */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={onFile}
      />

      {dialog ? (
        <div className="pt-dialog-back" onClick={() => setDialog(null)}>
          <div className="pt-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="pt-dialog-bar">
              {dialog === 'flip'
                ? 'Flip and Rotate'
                : dialog === 'skew'
                  ? 'Stretch and Skew'
                  : dialog === 'attributes'
                    ? 'Attributes'
                    : dialog === 'colours'
                      ? 'Edit Colors'
                      : dialog === 'about'
                        ? 'About Paint'
                        : 'Help Topics'}
              <button onClick={() => setDialog(null)}>×</button>
            </div>

            <div className="pt-dialog-body">
              {dialog === 'flip' ? (
                <>
                  <button className="xp-button" onClick={() => transform('h')}>
                    Flip horizontal
                  </button>
                  <button className="xp-button" onClick={() => transform('v')}>
                    Flip vertical
                  </button>
                  <button className="xp-button" onClick={() => transform('r90')}>
                    Rotate by 90°
                  </button>
                  <button className="xp-button" onClick={() => transform('r180')}>
                    Rotate by 180°
                  </button>
                  <button className="xp-button" onClick={() => transform('r270')}>
                    Rotate by 270°
                  </button>
                </>
              ) : null}

              {dialog === 'skew' ? (
                <>
                  <strong>Stretch</strong>
                  <label>
                    Horizontal
                    <input
                      type="number"
                      className="xp-input"
                      value={skew.sx}
                      onChange={(e) => setSkew((v) => ({ ...v, sx: Number(e.target.value) }))}
                    />
                    %
                  </label>
                  <label>
                    Vertical
                    <input
                      type="number"
                      className="xp-input"
                      value={skew.sy}
                      onChange={(e) => setSkew((v) => ({ ...v, sy: Number(e.target.value) }))}
                    />
                    %
                  </label>
                  <strong>Skew</strong>
                  <label>
                    Horizontal
                    <input
                      type="number"
                      className="xp-input"
                      value={skew.hx}
                      onChange={(e) => setSkew((v) => ({ ...v, hx: Number(e.target.value) }))}
                    />
                    °
                  </label>
                  <label>
                    Vertical
                    <input
                      type="number"
                      className="xp-input"
                      value={skew.hy}
                      onChange={(e) => setSkew((v) => ({ ...v, hy: Number(e.target.value) }))}
                    />
                    °
                  </label>
                  <div className="pt-dialog-actions">
                    <button className="xp-button default" onClick={applySkew}>
                      OK
                    </button>
                    <button className="xp-button" onClick={() => setDialog(null)}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : null}

              {dialog === 'attributes' ? (
                <>
                  <label>
                    Width
                    <input
                      type="number"
                      className="xp-input"
                      value={size2.w}
                      onChange={(e) => setSize2((v) => ({ ...v, w: Number(e.target.value) }))}
                    />
                  </label>
                  <label>
                    Height
                    <input
                      type="number"
                      className="xp-input"
                      value={size2.h}
                      onChange={(e) => setSize2((v) => ({ ...v, h: Number(e.target.value) }))}
                    />
                  </label>
                  <div className="pt-dialog-actions">
                    <button className="xp-button default" onClick={applyAttributes}>
                      OK
                    </button>
                    <button className="xp-button" onClick={() => setDialog(null)}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : null}

              {dialog === 'colours' ? (
                <>
                  <label>
                    Foreground
                    <input
                      type="color"
                      value={primary}
                      onChange={(e) => setPrimary(e.target.value)}
                    />
                  </label>
                  <label>
                    Background
                    <input
                      type="color"
                      value={secondary}
                      onChange={(e) => setSecondary(e.target.value)}
                    />
                  </label>
                  <div className="pt-dialog-actions">
                    <button className="xp-button default" onClick={() => setDialog(null)}>
                      OK
                    </button>
                  </div>
                </>
              ) : null}

              {dialog === 'about' ? (
                <>
                  <p>
                    <strong>Microsoft Paint</strong>
                    <br />
                    Version 5.1 (Build 2600)
                  </p>
                  <p>Draw something. There is nowhere to save it but your own computer.</p>
                  <div className="pt-dialog-actions">
                    <button className="xp-button default" onClick={() => setDialog(null)}>
                      OK
                    </button>
                  </div>
                </>
              ) : null}

              {dialog === 'help' ? (
                <>
                  <p>Pick a tool from the box on the left, then drag on the canvas.</p>
                  <p>
                    Left-click a colour for the foreground, right-click one for the background.
                    The paint pot fills an area, and the eyedropper picks a colour up off the
                    canvas.
                  </p>
                  <div className="pt-dialog-actions">
                    <button className="xp-button default" onClick={() => setDialog(null)}>
                      OK
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
