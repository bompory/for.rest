// 도감용 캐릭터 12종. 전부 인라인 SVG로 직접 그림 (외부 이미지 파일 사용 안 함).
// 공통 몸통(둥근 블롭) + 종별 귀/무늬/꼬리로 구분한다.

const FACE = (
  <>
    <circle cx="42" cy="58" r="4" fill="#5B4A3F" />
    <circle cx="58" cy="58" r="4" fill="#5B4A3F" />
    <path d="M46 68 Q50 72 54 68" stroke="#5B4A3F" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  </>
)

function Body({ fill, stroke }) {
  return <circle cx="50" cy="55" r="34" fill={fill} stroke={stroke} strokeWidth="2.5" />
}

const SPECIES = {
  rabbit: ({ face }) => (
    <>
      <path d="M32 20 Q26 -6 40 10 Q40 26 32 20 Z" fill="#FBEAE0" stroke="#E8B9A6" strokeWidth="2" />
      <path d="M68 20 Q74 -6 60 10 Q60 26 68 20 Z" fill="#FBEAE0" stroke="#E8B9A6" strokeWidth="2" />
      <Body fill="#FDF3EC" stroke="#E8B9A6" />
      <ellipse cx="50" cy="66" rx="8" ry="6" fill="#F7C7A3" opacity="0.6" />
      {face}
    </>
  ),
  fox: ({ face }) => (
    <>
      <path d="M28 26 L38 4 L46 24 Z" fill="#F2994A" />
      <path d="M72 26 L62 4 L54 24 Z" fill="#F2994A" />
      <Body fill="#F7B57A" stroke="#D97F3A" />
      <path d="M50 50 Q62 55 58 72 Q50 80 42 72 Q38 55 50 50 Z" fill="#FDF8F0" />
      {face}
    </>
  ),
  bear: ({ face }) => (
    <>
      <circle cx="28" cy="24" r="10" fill="#B98A5E" />
      <circle cx="72" cy="24" r="10" fill="#B98A5E" />
      <Body fill="#C9996B" stroke="#9C6F45" />
      <ellipse cx="50" cy="62" rx="12" ry="9" fill="#EFDDC8" />
      {face}
    </>
  ),
  cat: ({ face }) => (
    <>
      <path d="M30 24 L24 4 L42 18 Z" fill="#C9C2D9" />
      <path d="M70 24 L76 4 L58 18 Z" fill="#C9C2D9" />
      <Body fill="#D9D3E8" stroke="#A79FC0" />
      <path d="M20 58 L34 56 M20 64 L34 62 M66 56 L80 58 M66 62 L80 64" stroke="#A79FC0" strokeWidth="1.5" />
      {face}
    </>
  ),
  dog: ({ face }) => (
    <>
      <ellipse cx="26" cy="34" rx="10" ry="16" fill="#E3C09A" transform="rotate(-15 26 34)" />
      <ellipse cx="74" cy="34" rx="10" ry="16" fill="#E3C09A" transform="rotate(15 74 34)" />
      <Body fill="#EFD5B0" stroke="#C79F6E" />
      <ellipse cx="50" cy="64" rx="10" ry="7" fill="#FBEFDD" />
      {face}
    </>
  ),
  squirrel: ({ face }) => (
    <>
      <path d="M78 30 Q100 20 92 50 Q86 66 70 58 Q78 44 78 30 Z" fill="#C97B4A" />
      <circle cx="34" cy="26" r="7" fill="#C97B4A" />
      <circle cx="60" cy="22" r="7" fill="#C97B4A" />
      <Body fill="#D99060" stroke="#A85E33" />
      {face}
    </>
  ),
  panda: ({ face }) => (
    <>
      <circle cx="26" cy="24" r="11" fill="#3A342E" />
      <circle cx="74" cy="24" r="11" fill="#3A342E" />
      <Body fill="#FDFDFB" stroke="#D8D4CC" />
      <ellipse cx="40" cy="58" rx="8" ry="10" fill="#3A342E" opacity="0.85" />
      <ellipse cx="60" cy="58" rx="8" ry="10" fill="#3A342E" opacity="0.85" />
      <circle cx="40" cy="58" r="3.5" fill="#fff" />
      <circle cx="60" cy="58" r="3.5" fill="#fff" />
      <path d="M46 70 Q50 73 54 70" stroke="#5B4A3F" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </>
  ),
  owl: ({ face }) => (
    <>
      <path d="M38 22 L34 6 L46 18 Z" fill="#B08A5A" />
      <path d="M62 22 L66 6 L54 18 Z" fill="#B08A5A" />
      <Body fill="#C7A374" stroke="#96754A" />
      <circle cx="42" cy="56" r="10" fill="#FDF8F0" />
      <circle cx="58" cy="56" r="10" fill="#FDF8F0" />
      <circle cx="42" cy="56" r="4" fill="#5B4A3F" />
      <circle cx="58" cy="56" r="4" fill="#5B4A3F" />
      <path d="M50 62 L46 68 L54 68 Z" fill="#F2994A" />
    </>
  ),
  penguin: ({ face }) => (
    <>
      <Body fill="#3A342E" stroke="#221E1A" />
      <ellipse cx="50" cy="60" rx="20" ry="24" fill="#FDFDFB" />
      <path d="M45 58 L50 66 L55 58 Z" fill="#F2994A" />
      <circle cx="43" cy="52" r="3.5" fill="#5B4A3F" />
      <circle cx="57" cy="52" r="3.5" fill="#5B4A3F" />
    </>
  ),
  otter: ({ face }) => (
    <>
      <circle cx="30" cy="30" r="8" fill="#8A6B4A" />
      <circle cx="70" cy="30" r="8" fill="#8A6B4A" />
      <Body fill="#A8825A" stroke="#7A5C3C" />
      <ellipse cx="50" cy="62" rx="14" ry="11" fill="#EAD9BE" />
      {face}
    </>
  ),
  hedgehog: ({ face }) => (
    <>
      <path
        d="M20 40 L26 20 L34 38 L40 16 L48 36 L54 14 L60 36 L68 18 L74 38 L80 40 Q70 30 50 30 Q30 30 20 40 Z"
        fill="#9C7A52"
      />
      <ellipse cx="50" cy="60" rx="26" ry="26" fill="#EFDDC8" stroke="#C7A374" strokeWidth="2" />
      {face}
    </>
  ),
  deer: ({ face }) => (
    <>
      <path d="M34 22 Q26 6 20 14 M34 22 Q30 8 36 6" stroke="#8A6B4A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M66 22 Q74 6 80 14 M66 22 Q70 8 64 6" stroke="#8A6B4A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <Body fill="#D3A876" stroke="#A87A4A" />
      <ellipse cx="50" cy="66" rx="10" ry="7" fill="#FBEFDD" />
      <ellipse cx="34" cy="46" rx="4" ry="6" fill="#FBEFDD" opacity="0.7" />
      <ellipse cx="66" cy="46" rx="4" ry="6" fill="#FBEFDD" opacity="0.7" />
      {face}
    </>
  ),
}

export const CREATURE_LIST = Object.keys(SPECIES)

export default function Creature({ species = 'rabbit', size = 80, locked = false, className = '' }) {
  const render = SPECIES[species] || SPECIES.rabbit
  return (
    <svg width={size} height={size} viewBox="0 0 100 90" className={className}>
      <g style={locked ? { filter: 'grayscale(1)', opacity: 0.22 } : {}}>
        {render({ face: FACE })}
      </g>
    </svg>
  )
}
