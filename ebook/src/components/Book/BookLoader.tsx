type Props = { done: boolean }

/** Opening animation shown while fonts, the cover image and the flip engine load. */
export function BookLoader({ done }: Props) {
  return (
    <div className={`loader${done ? ' is-done' : ''}`} role="status" aria-live="polite" aria-hidden={done}>
      <div className="loader-book" aria-hidden>
        <span className="loader-leaf" />
        <span className="loader-leaf" />
        <span className="loader-leaf" />
      </div>
      <p className="loader-title">NE-AR · Three places, three questions</p>
      <p className="loader-sub">{done ? 'Ready' : 'Opening the book…'}</p>
    </div>
  )
}
