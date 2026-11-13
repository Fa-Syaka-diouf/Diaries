import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

/**
 * A QR code generated in the browser from a real URL. Without a URL it shows
 * an honest empty box, never a fake code.
 */
export function QR({ url, label, size = 84 }: { url: string; label: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    if (!url) return
    QRCode.toDataURL(url, { margin: 1, width: 320, color: { dark: '#071b33', light: '#ffffff' }, errorCorrectionLevel: 'M' })
      .then(setSrc)
      .catch(() => setSrc(null))
  }, [url])
  const ready = Boolean(url && src)
  return (
    <div className={`qr-code${ready ? '' : ' is-empty'}`} style={{ width: size, height: size }}>
      {ready ? <img src={src!} alt={`QR code: ${label}`} /> : <span>{url ? '' : 'Soon'}</span>}
    </div>
  )
}
