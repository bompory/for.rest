import Card from '../../components/ui/Card'

/**
 * 우리 반 정원 — 1단계: 탭과 화면만. 성장/업적/보상 로직은 다음 단계에서 추가한다.
 * 지금은 항상 "아직 아무것도 없는 빈 정원" 모습만 보여준다.
 */
export default function GardenPage() {
  return (
    <div className="px-5 pt-8 pb-4 flex flex-col gap-4">
      <h1 className="font-round text-xl font-bold text-center">우리 반 정원</h1>
      <p className="text-sm text-ink/60 text-center -mt-2">우리 모두의 출석으로 정원을 키워요!</p>

      <Card className="flex items-center justify-center p-4">
        <EmptyGarden />
      </Card>
    </div>
  )
}

function EmptyGarden() {
  return (
    <svg viewBox="0 0 320 220" className="w-full max-w-sm h-auto">
      {/* 하늘 */}
      <rect x="0" y="0" width="320" height="150" rx="20" fill="#DCEFF6" />
      {/* 해 */}
      <circle cx="264" cy="46" r="22" fill="#FBE0C6" />
      <circle cx="264" cy="46" r="14" fill="#F2994A" opacity="0.5" />
      {/* 구름 */}
      <g fill="#FFFFFF" opacity="0.8">
        <ellipse cx="70" cy="45" rx="26" ry="12" />
        <ellipse cx="92" cy="40" rx="18" ry="10" />
        <ellipse cx="50" cy="40" rx="16" ry="9" />
      </g>
      {/* 흙밭(아직 아무것도 안 자란 빈 정원) */}
      <rect x="0" y="140" width="320" height="80" rx="20" fill="#D7E8D3" />
      <path
        d="M0 150 Q80 165 160 150 T320 150 V220 H0 Z"
        fill="#C9996B"
        opacity="0.55"
      />
      {/* 흙 질감 점들 */}
      <g fill="#9C6F45" opacity="0.5">
        <circle cx="60" cy="185" r="3" />
        <circle cx="110" cy="200" r="2.5" />
        <circle cx="160" cy="180" r="3" />
        <circle cx="210" cy="198" r="2.5" />
        <circle cx="255" cy="182" r="3" />
        <circle cx="30" cy="205" r="2" />
        <circle cx="285" cy="205" r="2.5" />
      </g>
      {/* 작은 팻말 (아직 심은 게 없어요) */}
      <g>
        <line x1="160" y1="160" x2="160" y2="130" stroke="#9C6F45" strokeWidth="3" strokeLinecap="round" />
        <rect x="128" y="108" width="64" height="26" rx="8" fill="#FDFBF7" stroke="#D9A467" strokeWidth="2" />
        <text x="160" y="125" textAnchor="middle" fontSize="12" fill="#5B4A3F">
          아직 비어있어요
        </text>
      </g>
    </svg>
  )
}
