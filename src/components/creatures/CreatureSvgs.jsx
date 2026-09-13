// 출석 도감 캐릭터 30종. 전부 인라인 SVG로 직접 그림 (외부 이미지 파일 사용 안 함).
// 공통 몸통(둥근 블롭) + 종별 귀/무늬/꼬리 "베이스 모양" 20종에, 색상표(palette)와
// 작은 소품(accessory)을 조합해 30개의 서로 다른 캐릭터를 만든다.
// (예: 고양이 베이스 하나로 고등어냥/치즈냥/묘르/삼색냥/검은고양이/노란고양이까지 표현)

function Face(color = '#5B4A3F', sleepy = false) {
  if (sleepy) {
    return (
      <>
        <path d="M38 58 Q42 54 46 58" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M54 58 Q58 54 62 58" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d="M46 68 Q50 70 54 68" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </>
    )
  }
  return (
    <>
      <circle cx="42" cy="58" r="4" fill={color} />
      <circle cx="58" cy="58" r="4" fill={color} />
      <path d="M46 68 Q50 72 54 68" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </>
  )
}

function Body({ fill, stroke }) {
  return <circle cx="50" cy="55" r="34" fill={fill} stroke={stroke} strokeWidth="2.5" />
}

// ---- 작은 소품(악세서리) ----
function Carrot() {
  return (
    <g transform="translate(64,66)">
      <path d="M0 0 L11 0 L5.5 15 Z" fill="#F2994A" />
      <path d="M3 -2 L2 -9 M5.5 -2 L5.5 -10 M8 -2 L9 -9" stroke="#7FAF6E" strokeWidth="2" strokeLinecap="round" />
    </g>
  )
}
function StarAccessory() {
  return (
    <g transform="translate(66,64)">
      <path
        d="M6 0 L7.8 4.4 L12.6 4.6 L8.8 7.6 L10.2 12 L6 9.4 L1.8 12 L3.2 7.6 L-0.6 4.6 L4.2 4.4 Z"
        fill="#FBE0C6"
        stroke="#F2994A"
        strokeWidth="1"
      />
    </g>
  )
}
function LeafAccessory() {
  return (
    <g transform="translate(48,16)">
      <path d="M0 0 C6 -6 12 0 6 8 C0 6 -3 3 0 0 Z" fill="#8FCB7E" />
    </g>
  )
}
function CloverAccessory() {
  return (
    <g transform="translate(66,70)">
      <circle cx="-3" cy="-3" r="4" fill="#8FCB7E" />
      <circle cx="3" cy="-3" r="4" fill="#8FCB7E" />
      <circle cx="-3" cy="3" r="4" fill="#8FCB7E" />
      <circle cx="3" cy="3" r="4" fill="#8FCB7E" />
      <line x1="0" y1="6" x2="0" y2="14" stroke="#7FAF6E" strokeWidth="2" strokeLinecap="round" />
    </g>
  )
}
function BubbleTeaAccessory() {
  return (
    <g transform="translate(58,58)">
      <rect x="-6" y="0" width="12" height="16" rx="2" fill="#D9B48F" stroke="#9C6F45" strokeWidth="1.5" />
      <circle cx="-2" cy="10" r="1.5" fill="#5B4A3F" />
      <circle cx="2" cy="6" r="1.5" fill="#5B4A3F" />
      <line x1="0" y1="-6" x2="0" y2="0" stroke="#9C6F45" strokeWidth="2" />
    </g>
  )
}
function QuestionAccessory() {
  return (
    <text x="68" y="30" fontSize="16" fontWeight="700" fill="#A79FC0">
      ?
    </text>
  )
}
function ZzzAccessory() {
  return (
    <text x="66" y="26" fontSize="14" fontWeight="700" fill="#B7A6D9" fontStyle="italic">
      Z
    </text>
  )
}
function HatAccessory() {
  return (
    <g>
      <path d="M32 20 Q50 2 68 20 Q68 30 50 27 Q32 30 32 20 Z" fill="#4A7FB5" />
      <circle cx="42" cy="26" r="6" fill="#FDFDFB" stroke="#5B4A3F" strokeWidth="1.5" />
      <circle cx="58" cy="26" r="6" fill="#FDFDFB" stroke="#5B4A3F" strokeWidth="1.5" />
      <line x1="48" y1="26" x2="52" y2="26" stroke="#5B4A3F" strokeWidth="1.5" />
    </g>
  )
}

const ACCESSORIES = {
  carrot: Carrot,
  star: StarAccessory,
  leaf: LeafAccessory,
  clover: CloverAccessory,
  bubbletea: BubbleTeaAccessory,
  question: QuestionAccessory,
  zzz: ZzzAccessory,
  hat: HatAccessory,
}

// ---- 베이스 모양 20종 (색상표/소품으로 재조합해 30종을 만든다) ----
const SHAPES = {
  cat: ({ face, palette = {}, accessory }) => {
    const {
      earFill = '#3A342E',
      bodyFill = '#FDFDFB',
      bodyStroke = '#D8D4CC',
      pattern = 'bicolor',
      patchFill = '#3A342E',
      belly = false,
    } = palette
    return (
      <>
        <path d="M30 24 L24 4 L42 18 Z" fill={earFill} />
        <path d="M70 24 L76 4 L58 18 Z" fill={earFill} />
        <Body fill={bodyFill} stroke={bodyStroke} />
        {pattern === 'bicolor' && (
          <path d="M20 40 Q30 20 50 26 Q40 46 26 52 Q18 48 20 40 Z" fill={patchFill} />
        )}
        {pattern === 'tabby' && (
          <g stroke={patchFill} strokeWidth="2.5" opacity="0.7" strokeLinecap="round">
            <path d="M34 26 L30 40" />
            <path d="M44 22 L42 38" />
            <path d="M56 22 L58 38" />
            <path d="M66 26 L70 40" />
          </g>
        )}
        {pattern === 'calico' && (
          <>
            <path d="M20 40 Q28 22 44 28 Q36 44 24 50 Z" fill="#F2994A" opacity="0.85" />
            <path d="M80 40 Q72 22 60 30 Q66 44 76 48 Z" fill="#3A342E" opacity="0.85" />
          </>
        )}
        {pattern === 'mystery' && <ellipse cx="38" cy="48" rx="10" ry="12" fill={patchFill} opacity="0.9" />}
        {belly && <ellipse cx="50" cy="66" rx="11" ry="8" fill="#FBEFDD" opacity="0.85" />}
        <path
          d="M20 58 L34 56 M20 64 L34 62 M66 56 L80 58 M66 62 L80 64"
          stroke={bodyStroke}
          strokeWidth="1.5"
        />
        {face}
        {accessory}
      </>
    )
  },
  rabbit: ({ face, palette = {}, accessory }) => {
    const {
      earFill = '#FBEAE0',
      earStroke = '#E8B9A6',
      bodyFill = '#FDF3EC',
      bodyStroke = '#E8B9A6',
      cheekFill = '#F7C7A3',
    } = palette
    return (
      <>
        <path d="M32 20 Q26 -6 40 10 Q40 26 32 20 Z" fill={earFill} stroke={earStroke} strokeWidth="2" />
        <path d="M68 20 Q74 -6 60 10 Q60 26 68 20 Z" fill={earFill} stroke={earStroke} strokeWidth="2" />
        <Body fill={bodyFill} stroke={bodyStroke} />
        <ellipse cx="50" cy="66" rx="8" ry="6" fill={cheekFill} opacity="0.6" />
        {face}
        {accessory}
      </>
    )
  },
  bear: ({ face, palette = {}, accessory }) => {
    const { earFill = '#B98A5E', bodyFill = '#C9996B', bodyStroke = '#9C6F45', muzzleFill = '#EFDDC8' } = palette
    return (
      <>
        <circle cx="28" cy="24" r="10" fill={earFill} />
        <circle cx="72" cy="24" r="10" fill={earFill} />
        <Body fill={bodyFill} stroke={bodyStroke} />
        <ellipse cx="50" cy="62" rx="12" ry="9" fill={muzzleFill} />
        {face}
        {accessory}
      </>
    )
  },
  dog: ({ face }) => (
    <>
      <ellipse cx="26" cy="34" rx="10" ry="16" fill="#E3C09A" transform="rotate(-15 26 34)" />
      <ellipse cx="74" cy="34" rx="10" ry="16" fill="#E3C09A" transform="rotate(15 74 34)" />
      <Body fill="#EFD5B0" stroke="#C79F6E" />
      <ellipse cx="50" cy="64" rx="10" ry="7" fill="#FBEFDD" />
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
  penguin: ({ palette = {}, accessory }) => {
    const { bodyFill = '#6FB3D9', bodyStroke = '#4A8CB0', frontFill = '#FDFDFB', beakFill = '#F2994A' } = palette
    return (
      <>
        <Body fill={bodyFill} stroke={bodyStroke} />
        <ellipse cx="50" cy="60" rx="20" ry="24" fill={frontFill} />
        <path d="M45 58 L50 66 L55 58 Z" fill={beakFill} />
        <circle cx="43" cy="52" r="3.5" fill="#5B4A3F" />
        <circle cx="57" cy="52" r="3.5" fill="#5B4A3F" />
        {accessory}
      </>
    )
  },
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
  chick: ({ face }) => (
    <>
      <Body fill="#FCE38A" stroke="#F0C443" />
      <path d="M30 34 Q24 24 36 26" stroke="#F0C443" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M70 34 Q76 24 64 26" stroke="#F0C443" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M45 60 L55 60 L50 68 Z" fill="#F2994A" />
      <circle cx="42" cy="56" r="3.5" fill="#5B4A3F" />
      <circle cx="58" cy="56" r="3.5" fill="#5B4A3F" />
    </>
  ),
  sheep: ({ face }) => (
    <>
      <g fill="#FDFDFB" stroke="#E8E4DA" strokeWidth="1.5">
        <circle cx="26" cy="34" r="12" />
        <circle cx="34" cy="20" r="11" />
        <circle cx="50" cy="16" r="12" />
        <circle cx="66" cy="20" r="11" />
        <circle cx="74" cy="34" r="12" />
      </g>
      <Body fill="#F4EFE4" stroke="#D9CFC0" />
      <ellipse cx="50" cy="64" rx="13" ry="10" fill="#FBEFDD" />
      {face}
    </>
  ),
  frog: () => (
    <>
      <circle cx="34" cy="30" r="9" fill="#8FCB7E" />
      <circle cx="66" cy="30" r="9" fill="#8FCB7E" />
      <circle cx="34" cy="30" r="4" fill="#3A342E" />
      <circle cx="66" cy="30" r="4" fill="#3A342E" />
      <Body fill="#A6DB93" stroke="#7CB369" />
      <ellipse cx="50" cy="66" rx="14" ry="8" fill="#D9F0CE" />
      <path d="M42 68 Q50 74 58 68" stroke="#5B4A3F" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </>
  ),
  tiger: ({ face }) => (
    <>
      <circle cx="26" cy="26" r="9" fill="#F2994A" />
      <circle cx="74" cy="26" r="9" fill="#F2994A" />
      <Body fill="#F7B357" stroke="#D97F1F" />
      <path
        d="M30 34 L24 28 M36 30 L32 22 M50 28 L50 20 M64 30 L68 22 M70 34 L76 28"
        stroke="#3A342E"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="50" cy="64" rx="12" ry="8" fill="#FDF3E4" />
      {face}
    </>
  ),
  pig: () => (
    <>
      <ellipse cx="28" cy="28" rx="8" ry="10" fill="#F7C7CE" transform="rotate(-20 28 28)" />
      <ellipse cx="72" cy="28" rx="8" ry="10" fill="#F7C7CE" transform="rotate(20 72 28)" />
      <Body fill="#FBDCE2" stroke="#EFA9B8" />
      <ellipse cx="50" cy="62" rx="13" ry="9" fill="#F7B8C6" />
      <circle cx="45" cy="62" r="2" fill="#B5677A" />
      <circle cx="55" cy="62" r="2" fill="#B5677A" />
      <circle cx="42" cy="54" r="4" fill="#5B4A3F" />
      <circle cx="58" cy="54" r="4" fill="#5B4A3F" />
    </>
  ),
  koala: ({ face }) => (
    <>
      <circle cx="20" cy="40" r="16" fill="#AFC9D6" />
      <circle cx="80" cy="40" r="16" fill="#AFC9D6" />
      <circle cx="20" cy="40" r="9" fill="#7FA0B0" />
      <circle cx="80" cy="40" r="9" fill="#7FA0B0" />
      <Body fill="#C7DCE4" stroke="#95B4C0" />
      <ellipse cx="50" cy="62" rx="12" ry="9" fill="#3A342E" opacity="0.75" />
      {face}
    </>
  ),
  hamster: ({ face }) => (
    <>
      <circle cx="26" cy="30" r="10" fill="#EFDDC8" />
      <circle cx="74" cy="30" r="10" fill="#EFDDC8" />
      <Body fill="#F4E3C8" stroke="#D9BE93" />
      <ellipse cx="38" cy="64" rx="9" ry="7" fill="#FBF2E0" />
      <ellipse cx="62" cy="64" rx="9" ry="7" fill="#FBF2E0" />
      {face}
    </>
  ),
  wolf: ({ face }) => (
    <>
      <path d="M26 26 L18 4 L38 20 Z" fill="#8A93A6" />
      <path d="M74 26 L82 4 L62 20 Z" fill="#8A93A6" />
      <Body fill="#9AA3B4" stroke="#6E7688" />
      <path d="M50 48 Q64 52 60 72 Q50 80 40 72 Q36 52 50 48 Z" fill="#EFF1F4" />
      {face}
    </>
  ),
  duck: () => (
    <>
      <Body fill="#FDFDFB" stroke="#E8E4DA" />
      <path d="M50 56 Q66 54 66 62 Q66 68 50 66 Z" fill="#F2994A" />
      <circle cx="42" cy="52" r="3.5" fill="#5B4A3F" />
    </>
  ),
  elephant: ({ face }) => (
    <>
      <ellipse cx="18" cy="46" rx="12" ry="18" fill="#AFC9E0" />
      <ellipse cx="82" cy="46" rx="12" ry="18" fill="#AFC9E0" />
      <Body fill="#C3D9EA" stroke="#95B7D1" />
      <path d="M50 66 Q46 84 40 86" stroke="#95B7D1" strokeWidth="6" fill="none" strokeLinecap="round" />
      {face}
    </>
  ),
  alpaca: ({ face }) => (
    <>
      <path d="M40 16 Q50 -4 60 16 L58 30 L42 30 Z" fill="#F4EFE4" stroke="#D9CFC0" strokeWidth="2" />
      <circle cx="30" cy="30" r="7" fill="#F4EFE4" />
      <circle cx="70" cy="30" r="7" fill="#F4EFE4" />
      <Body fill="#F7F2E8" stroke="#D9CFC0" />
      <ellipse cx="50" cy="64" rx="11" ry="8" fill="#FBF6EC" />
      {face}
    </>
  ),
}

// ---- 캐릭터 30종 정의 (베이스 모양 + 색상표 + 소품) ----
export const CREATURE_DEFS = {
  cat: { shape: 'cat', accessory: null },
  rabbit: { shape: 'rabbit', accessory: 'carrot' },
  bear: { shape: 'bear', accessory: 'clover' },
  chick: { shape: 'chick' },
  penguin: { shape: 'penguin' },
  dog: { shape: 'dog' },
  fox: { shape: 'fox' },
  cat_mackerel: {
    shape: 'cat',
    palette: { earFill: '#9AA3B0', bodyFill: '#E4E7EC', bodyStroke: '#AEB6C2', pattern: 'tabby', patchFill: '#8B93A6' },
  },
  sheep: { shape: 'sheep' },
  frog: { shape: 'frog' },
  squirrel: { shape: 'squirrel' },
  penguin_navy: { shape: 'penguin', palette: { bodyFill: '#2B3A55', bodyStroke: '#1B2740' } },
  panda: { shape: 'panda' },
  cat_cheese: {
    shape: 'cat',
    palette: { earFill: '#B7A6D9', bodyFill: '#E6DCF2', bodyStroke: '#C7B6E0', pattern: 'solid', faceColor: '#7A6A96' },
    sleepy: true,
    accessory: 'zzz',
  },
  cat_mystery: {
    shape: 'cat',
    palette: { earFill: '#3A342E', bodyFill: '#FDFDFB', bodyStroke: '#D8D4CC', pattern: 'mystery', patchFill: '#3A342E' },
    accessory: 'question',
  },
  tiger: { shape: 'tiger' },
  pig: { shape: 'pig' },
  koala: { shape: 'koala' },
  penguin_hat: { shape: 'penguin', accessory: 'hat' },
  hamster: { shape: 'hamster' },
  wolf: { shape: 'wolf' },
  cat_calico: {
    shape: 'cat',
    palette: { earFill: '#D9A467', bodyFill: '#FDFBF7', bodyStroke: '#E8D9C0', pattern: 'calico' },
  },
  bear_bubbletea: {
    shape: 'bear',
    palette: { earFill: '#D9B48F', bodyFill: '#E9C9A0', bodyStroke: '#BB8F63' },
    accessory: 'bubbletea',
  },
  duck: { shape: 'duck' },
  deer: { shape: 'deer' },
  cat_black: {
    shape: 'cat',
    palette: {
      earFill: '#2A2622',
      bodyFill: '#3A342E',
      bodyStroke: '#221E1A',
      pattern: 'solid',
      belly: true,
      faceColor: '#FDFDFB',
    },
  },
  elephant: { shape: 'elephant' },
  rabbit_star: {
    shape: 'rabbit',
    palette: { earFill: '#FBD8E3', earStroke: '#EFAFC7', bodyFill: '#FDEAF1', bodyStroke: '#EFAFC7', cheekFill: '#F7A3C0' },
    accessory: 'star',
  },
  alpaca: { shape: 'alpaca' },
  cat_yellow: {
    shape: 'cat',
    palette: { earFill: '#F0C443', bodyFill: '#FCE9B0', bodyStroke: '#E8C96A', pattern: 'solid' },
    accessory: 'leaf',
  },
}

export const CREATURE_IDS = Object.keys(CREATURE_DEFS)

export default function Creature({ creatureId = 'rabbit', size = 80, locked = false, className = '' }) {
  const def = CREATURE_DEFS[creatureId] || CREATURE_DEFS.rabbit
  const render = SHAPES[def.shape] || SHAPES.rabbit
  const palette = def.palette || {}
  const face = Face(palette.faceColor, !!def.sleepy)
  const AccessoryComp = def.accessory ? ACCESSORIES[def.accessory] : null

  return (
    <svg width={size} height={size} viewBox="0 0 100 90" className={className}>
      <g style={locked ? { filter: 'brightness(0)', opacity: 0.22 } : {}}>
        {render({ face, palette, accessory: AccessoryComp ? <AccessoryComp /> : null })}
      </g>
    </svg>
  )
}
