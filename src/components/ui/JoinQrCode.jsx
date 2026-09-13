import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

// qrcode 라이브러리로 브라우저 안에서 직접 SVG를 생성한다 (외부 이미지 요청 없음).
export default function JoinQrCode({ value, size = 160 }) {
  const [svg, setSvg] = useState('')

  useEffect(() => {
    let cancelled = false
    if (!value) {
      setSvg('')
      return
    }
    QRCode.toString(value, { type: 'svg', margin: 1, color: { dark: '#5B4A3F', light: '#FDF8F0' } })
      .then((s) => {
        if (!cancelled) setSvg(s)
      })
      .catch(() => {
        if (!cancelled) setSvg('')
      })
    return () => {
      cancelled = true
    }
  }, [value])

  if (!svg) return null

  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-xl2 overflow-hidden bg-cream p-1 [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
