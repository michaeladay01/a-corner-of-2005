import { useCallback, useRef } from 'react'

type Point = { x: number; y: number }

/** Pointer-driven dragging that keeps a window at least partly on screen. */
export function useDrag(position: Point, onMove: (p: Point) => void, onStart?: () => void) {
  const origin = useRef<{ px: number; py: number; x: number; y: number } | null>(null)

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      const target = e.target as HTMLElement
      if (target.closest('button, input, select, a, [data-no-drag]')) return
      onStart?.()
      origin.current = { px: e.clientX, py: e.clientY, x: position.x, y: position.y }
      const el = e.currentTarget as HTMLElement
      el.setPointerCapture(e.pointerId)

      const move = (ev: PointerEvent) => {
        const o = origin.current
        if (!o) return
        const x = o.x + (ev.clientX - o.px)
        const y = o.y + (ev.clientY - o.py)
        onMove({
          x: Math.max(-200, Math.min(window.innerWidth - 80, x)),
          y: Math.max(0, Math.min(window.innerHeight - 60, y)),
        })
      }
      const up = () => {
        origin.current = null
        el.releasePointerCapture?.(e.pointerId)
        window.removeEventListener('pointermove', move)
        window.removeEventListener('pointerup', up)
      }
      window.addEventListener('pointermove', move)
      window.addEventListener('pointerup', up)
    },
    [position.x, position.y, onMove, onStart]
  )

  return { onPointerDown }
}
