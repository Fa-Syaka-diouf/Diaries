import logo from '../../assets/images/ne-ar-logo.webp'

/**
 * The back board of the book. It is part of the physical object, not one of
 * the five designed pages, so it carries no page number.
 */
export function BackCover() {
  return (
    <div className="pg back-cover">
      <span className="back-logo">
        <img src={logo} alt="" />
      </span>
      <p className="back-title">Three places, three questions</p>
      <p className="back-sub">NE-AR · Naturalists Explorer – Augmented Reality</p>
      <p className="back-note">A NASA Space Apps Challenge project</p>
    </div>
  )
}
