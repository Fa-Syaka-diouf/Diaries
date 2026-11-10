import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { PageNavigation } from './PageNavigation'
import { PageThumbnails } from './PageThumbnails'

type Tab = 'contents' | 'thumbnails'
type Props = {
  open: Tab | null
  onClose: () => void
  onTab: (t: Tab) => void
  current: number[]
  onSelect: (index: number) => void
}

export function NavigationPanel({ open, onClose, onTab, current, onSelect }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const select = (i: number) => {
    onSelect(i)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="panel-scrim" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside
            className="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Book navigation"
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -24, opacity: 0 }}
            transition={{ type: 'tween', duration: 0.22 }}
          >
            <header className="panel-head">
              <div className="panel-tabs" role="tablist">
                <button role="tab" type="button" aria-selected={open === 'contents'} className={open === 'contents' ? 'is-active' : ''} onClick={() => onTab('contents')}>
                  Contents
                </button>
                <button role="tab" type="button" aria-selected={open === 'thumbnails'} className={open === 'thumbnails' ? 'is-active' : ''} onClick={() => onTab('thumbnails')}>
                  Pages
                </button>
              </div>
              <button ref={closeRef} type="button" className="tb-btn" onClick={onClose} aria-label="Close navigation">
                <X size={18} />
              </button>
            </header>
            <div className="panel-body">
              {open === 'contents' ? <PageNavigation current={current} onSelect={select} /> : <PageThumbnails current={current} onSelect={select} />}
            </div>
            <p className="panel-foot">
              Keyboard: ← → turn pages · Home / End · F full screen
            </p>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
