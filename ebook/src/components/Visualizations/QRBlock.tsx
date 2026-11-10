import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

/**
 * QR code for the NE-AR app. It is generated only from a real URL supplied at
 * build time (VITE_AR_APP_URL). Without one, an honest "coming soon" area is
 * shown instead of a fake code.
 */
export function QRBlock() {
  const url = (import.meta.env.VITE_AR_APP_URL as string | undefined)?.trim()
  const [src, setSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!url) return
    QRCode.toDataURL(url, { margin: 1, width: 240, color: { dark: '#071b33', light: '#ffffff' }, errorCorrectionLevel: 'M' })
      .then(setSrc)
      .catch(() => setSrc(null))
  }, [url])

  return (
    <div className="qr">
      <div className={`qr-code${src ? '' : ' is-empty'}`}>
        {src ? <img src={src} alt={`QR code linking to ${url}`} /> : <span>QR code</span>}
      </div>
      <div className="qr-text">
        <p className="qr-title">Open NE-AR on your phone</p>
        {url ? (
          <a href={url} className="qr-url">
            {url.replace(/^https?:\/\//, '')}
          </a>
        ) : (
          <p className="qr-url muted">The app link will appear here when the NE-AR app is published.</p>
        )}
      </div>
    </div>
  )
}
