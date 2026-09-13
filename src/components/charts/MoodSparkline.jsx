// 외부 차트 라이브러리 없이 직접 그린 기분 추이 스파크라인. data: number[1-5] | null (미체크는 null로 끊어짐)
export default function MoodSparkline({ data, height = 80, color = '#7FA377' }) {
  const width = 280
  const padding = 12
  const valid = data.filter((v) => v != null)
  if (valid.length === 0) {
    return <p className="text-xs text-ink/40 text-center py-4">아직 표시할 기록이 없어요.</p>
  }

  const stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0
  const toY = (v) => height - padding - ((v - 1) / 4) * (height - padding * 2)

  const segments = []
  let current = []
  data.forEach((v, i) => {
    if (v == null) {
      if (current.length) segments.push(current)
      current = []
    } else {
      current.push([padding + i * stepX, toY(v)])
    }
  })
  if (current.length) segments.push(current)

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} height={height}>
      {[1, 2, 3, 4, 5].map((v) => (
        <line
          key={v}
          x1={padding}
          x2={width - padding}
          y1={toY(v)}
          y2={toY(v)}
          stroke="#E8DFCF"
          strokeWidth="1"
        />
      ))}
      {segments.map((seg, si) => (
        <g key={si}>
          <polyline
            points={seg.map((p) => p.join(',')).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {seg.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3.5" fill={color} />
          ))}
        </g>
      ))}
    </svg>
  )
}
