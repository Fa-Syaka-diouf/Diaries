import { useEffect, useState } from 'react'

/** Design canvas of one page, in CSS pixels (ISO A-series ratio 1 : √2). */
export const PAGE_W = 520
export const PAGE_H = 736
export const RATIO = PAGE_H / PAGE_W

export type BookMode = 'spread' | 'single' | 'reflow'

export type BookLayout = {
  mode: BookMode
  /** Rendered size of ONE page. */
  pageW: number
  pageH: number
  /** Scale applied to the 520 × 736 design canvas (1 in reflow mode). */
  scale: number
  viewportW: number
  viewportH: number
  isTouch: boolean
}

const TOOLBAR_DESKTOP = 64
const TOOLBAR_MOBILE = 60

function viewport() {
  const vv = window.visualViewport
  return { w: Math.round(vv?.width ?? window.innerWidth), h: Math.round(vv?.height ?? window.innerHeight) }
}

export function computeLayout(w: number, h: number, zoom: number, isTouch: boolean): BookLayout {
  const compact = w < 640
  const toolbar = compact ? TOOLBAR_MOBILE : TOOLBAR_DESKTOP
  const padX = compact ? 8 : w < 1100 ? 28 : 48
  const padY = compact ? 8 : 24
  const availW = w - padX * 2
  const availH = h - toolbar - padY * 2

  // Two-page spread: the cover is shown alone, then pages side by side.
  const spreadH = Math.min(availH, (availW / 2) * RATIO)
  const spreadScale = spreadH / RATIO / PAGE_W
  if (w >= 900 && spreadScale >= 0.7) {
    const pageH = Math.floor(spreadH * zoom)
    const pageW = Math.floor(pageH / RATIO)
    return { mode: 'spread', pageW, pageH, scale: pageW / PAGE_W, viewportW: w, viewportH: h, isTouch }
  }

  // One designed page at a time (tablet portrait, small laptops).
  const singleH = Math.min(availH, availW * RATIO)
  const singleScale = singleH / RATIO / PAGE_W
  if (singleScale >= 0.86) {
    const pageH = Math.floor(singleH * zoom)
    const pageW = Math.floor(pageH / RATIO)
    return { mode: 'single', pageW, pageH, scale: pageW / PAGE_W, viewportW: w, viewportH: h, isTouch }
  }

  // Phones: the page fills the screen and its content reflows at a readable size.
  return {
    mode: 'reflow',
    pageW: Math.floor(availW),
    pageH: Math.floor(availH),
    scale: 1,
    viewportW: w,
    viewportH: h,
    isTouch,
  }
}

export function useBookLayout(zoom: number): BookLayout {
  const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  const [layout, setLayout] = useState(() => {
    const { w, h } = viewport()
    return computeLayout(w, h, zoom, isTouch)
  })

  useEffect(() => {
    let timer = 0
    const update = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        const { w, h } = viewport()
        setLayout((prev) => {
          const next = computeLayout(w, h, zoom, isTouch)
          return prev.mode === next.mode && prev.pageW === next.pageW && prev.pageH === next.pageH ? prev : next
        })
      }, 180)
    }
    update()
    window.addEventListener('resize', update)
    window.visualViewport?.addEventListener('resize', update)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('resize', update)
    }
  }, [zoom, isTouch])

  return layout
}
