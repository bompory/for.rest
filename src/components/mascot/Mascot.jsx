import { motion } from 'framer-motion'

// 표정별 눈/입 path. 몸통(턱시도 고양이 마스코트 "코코", 앞발을 번쩍 든 포즈)은 고정, 표정만 교체.
const INK = '#3A342E'
const EYE_GREEN = '#6FAE4F'

const FACES = {
  happy: {
    eyes: <><path d="M62 78 Q67 71 72 78" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" /><path d="M88 78 Q93 71 98 78" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" /></>,
    mouth: <path d="M70 100 Q80 108 90 100" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />,
    cheeks: true,
  },
  excited: {
    eyes: <>
      <ellipse cx="67" cy="79" rx="4.5" ry="6" fill={EYE_GREEN} /><circle cx="67" cy="80" r="2" fill={INK} />
      <ellipse cx="93" cy="79" rx="4.5" ry="6" fill={EYE_GREEN} /><circle cx="93" cy="80" r="2" fill={INK} />
    </>,
    mouth: <path d="M68 99 Q80 114 92 99 Q80 106 68 99" fill={INK} />,
    cheeks: true,
  },
  worried: {
    eyes: <>
      <ellipse cx="67" cy="80" rx="4" ry="5" fill={EYE_GREEN} /><circle cx="67" cy="81" r="1.8" fill={INK} />
      <ellipse cx="93" cy="80" rx="4" ry="5" fill={EYE_GREEN} /><circle cx="93" cy="81" r="1.8" fill={INK} />
    </>,
    mouth: <path d="M71 103 Q80 98 89 103" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />,
    cheeks: false,
    brows: <><path d="M58 71 L70 75" stroke={INK} strokeWidth="2.5" strokeLinecap="round" /><path d="M102 71 L90 75" stroke={INK} strokeWidth="2.5" strokeLinecap="round" /></>,
  },
  sad: {
    eyes: <><path d="M63 81 Q67 77 71 81" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" /><path d="M89 81 Q93 77 97 81" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" /></>,
    mouth: <path d="M71 105 Q80 99 89 105" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />,
    cheeks: false,
  },
  neutral: {
    eyes: <>
      <ellipse cx="67" cy="80" rx="4" ry="5" fill={EYE_GREEN} /><circle cx="67" cy="81" r="1.8" fill={INK} />
      <ellipse cx="93" cy="80" rx="4" ry="5" fill={EYE_GREEN} /><circle cx="93" cy="81" r="1.8" fill={INK} />
    </>,
    mouth: <path d="M72 101 Q80 103 88 101" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />,
    cheeks: true,
  },
  sleepy: {
    eyes: <><path d="M62 80 L72 80" stroke={INK} strokeWidth="3" strokeLinecap="round" /><path d="M88 80 L98 80" stroke={INK} strokeWidth="3" strokeLinecap="round" /></>,
    mouth: <ellipse cx="80" cy="101" rx="3.5" ry="4.5" fill={INK} />,
    cheeks: false,
  },
}

export default function Mascot({ mood = 'happy', size = 140, bounce = false, className = '' }) {
  const face = FACES[mood] || FACES.happy

  return (
    <motion.svg
      width={size}
      height={(size * 170) / 160}
      viewBox="0 0 160 170"
      className={className}
      animate={bounce ? { y: [0, -10, 0] } : { y: 0 }}
      transition={bounce ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' } : {}}
    >
      {/* 몸통(어깨) */}
      <ellipse cx="80" cy="140" rx="46" ry="24" fill="#FDFBF7" stroke={INK} strokeWidth="3" />

      {/* 왼팔(번쩍 든 앞발) */}
      <path d="M60 132 Q22 122 16 62" stroke={INK} strokeWidth="21" fill="none" strokeLinecap="round" />
      <path d="M60 132 Q22 122 16 62" stroke="#FDFBF7" strokeWidth="15" fill="none" strokeLinecap="round" />
      <circle cx="16" cy="58" r="16" fill="#FDFBF7" stroke={INK} strokeWidth="3" />
      <ellipse cx="9" cy="53" rx="3" ry="4" fill="#F7C7A3" />
      <ellipse cx="16" cy="49" rx="3" ry="4" fill="#F7C7A3" />
      <ellipse cx="23" cy="53" rx="3" ry="4" fill="#F7C7A3" />

      {/* 오른팔(번쩍 든 앞발) */}
      <path d="M100 132 Q138 122 144 62" stroke={INK} strokeWidth="21" fill="none" strokeLinecap="round" />
      <path d="M100 132 Q138 122 144 62" stroke="#FDFBF7" strokeWidth="15" fill="none" strokeLinecap="round" />
      <circle cx="144" cy="58" r="16" fill="#FDFBF7" stroke={INK} strokeWidth="3" />
      <ellipse cx="137" cy="53" rx="3" ry="4" fill="#F7C7A3" />
      <ellipse cx="144" cy="49" rx="3" ry="4" fill="#F7C7A3" />
      <ellipse cx="151" cy="53" rx="3" ry="4" fill="#F7C7A3" />

      {/* 귀 */}
      <path d="M50 58 L35 20 L67 42 Z" fill={INK} />
      <path d="M110 58 L125 20 L93 42 Z" fill={INK} />

      {/* 머리(검정 바탕) */}
      <circle cx="80" cy="85" r="42" fill={INK} />
      {/* 흰 얼굴 무늬 */}
      <path d="M80 54 C102 54 114 76 109 98 C104 119 56 119 51 98 C46 76 58 54 80 54 Z" fill="#FDFBF7" />

      {/* 수염 */}
      <g stroke={INK} strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
        <path d="M52 88 L26 83" />
        <path d="M52 94 L24 94" />
        <path d="M108 88 L134 83" />
        <path d="M108 94 L136 94" />
      </g>

      {/* 볼터치 */}
      {face.cheeks && (
        <>
          <circle cx="58" cy="93" r="6" fill="#F7C7A3" opacity="0.7" />
          <circle cx="102" cy="93" r="6" fill="#F7C7A3" opacity="0.7" />
        </>
      )}
      {face.brows}
      {face.eyes}
      {/* 코 */}
      <path d="M77 90 L83 90 L80 94 Z" fill="#F7C7A3" />
      {face.mouth}
    </motion.svg>
  )
}

export function moodFromEmojiKey(emojiKey) {
  const map = { joy: 'excited', good: 'happy', okay: 'neutral', down: 'sad', hard: 'sad' }
  return map[emojiKey] || 'neutral'
}
