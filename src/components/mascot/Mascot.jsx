import { motion } from 'framer-motion'

// 표정별 눈/입 path. 몸통(고양이 마스코트 "코코")은 고정, 표정만 교체.
const FACES = {
  happy: {
    eyes: <><path d="M42 58 Q47 50 52 58" stroke="#5B4A3F" strokeWidth="3.5" fill="none" strokeLinecap="round" /><path d="M68 58 Q73 50 78 58" stroke="#5B4A3F" strokeWidth="3.5" fill="none" strokeLinecap="round" /></>,
    mouth: <path d="M50 72 Q60 82 70 72" stroke="#5B4A3F" strokeWidth="3.5" fill="none" strokeLinecap="round" />,
    cheeks: true,
  },
  excited: {
    eyes: <><circle cx="47" cy="56" r="4.5" fill="#5B4A3F" /><circle cx="73" cy="56" r="4.5" fill="#5B4A3F" /></>,
    mouth: <path d="M48 70 Q60 88 72 70 Q60 78 48 70" fill="#5B4A3F" />,
    cheeks: true,
  },
  worried: {
    eyes: <><circle cx="47" cy="58" r="4" fill="#5B4A3F" /><circle cx="73" cy="58" r="4" fill="#5B4A3F" /></>,
    mouth: <path d="M51 76 Q60 70 69 76" stroke="#5B4A3F" strokeWidth="3.5" fill="none" strokeLinecap="round" />,
    cheeks: false,
    brows: <><path d="M40 50 L52 54" stroke="#5B4A3F" strokeWidth="2.5" strokeLinecap="round" /><path d="M80 50 L68 54" stroke="#5B4A3F" strokeWidth="2.5" strokeLinecap="round" /></>,
  },
  sad: {
    eyes: <><path d="M43 60 Q47 56 51 60" stroke="#5B4A3F" strokeWidth="3" fill="none" strokeLinecap="round" /><path d="M69 60 Q73 56 77 60" stroke="#5B4A3F" strokeWidth="3" fill="none" strokeLinecap="round" /></>,
    mouth: <path d="M51 78 Q60 72 69 78" stroke="#5B4A3F" strokeWidth="3.5" fill="none" strokeLinecap="round" />,
    cheeks: false,
  },
  neutral: {
    eyes: <><circle cx="47" cy="58" r="4" fill="#5B4A3F" /><circle cx="73" cy="58" r="4" fill="#5B4A3F" /></>,
    mouth: <path d="M52 74 Q60 76 68 74" stroke="#5B4A3F" strokeWidth="3" fill="none" strokeLinecap="round" />,
    cheeks: true,
  },
  sleepy: {
    eyes: <><path d="M42 58 L52 58" stroke="#5B4A3F" strokeWidth="3.5" strokeLinecap="round" /><path d="M68 58 L78 58" stroke="#5B4A3F" strokeWidth="3.5" strokeLinecap="round" /></>,
    mouth: <ellipse cx="60" cy="75" rx="4" ry="5" fill="#5B4A3F" />,
    cheeks: false,
  },
}

export default function Mascot({ mood = 'happy', size = 140, bounce = false, className = '' }) {
  const face = FACES[mood] || FACES.happy

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      animate={bounce ? { y: [0, -10, 0] } : { y: 0 }}
      transition={bounce ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' } : {}}
    >
      {/* 귀 (세모 고양이 귀 + 안쪽 분홍) */}
      <path d="M30 36 L18 6 L46 24 Z" fill="#F5DDBB" stroke="#D9A467" strokeWidth="2" strokeLinejoin="round" />
      <path d="M32 30 L25 12 L42 22 Z" fill="#F7C7A3" />
      <path d="M90 36 L102 6 L74 24 Z" fill="#F5DDBB" stroke="#D9A467" strokeWidth="2" strokeLinejoin="round" />
      <path d="M88 30 L95 12 L78 22 Z" fill="#F7C7A3" />
      {/* 몸통(머리) */}
      <circle cx="60" cy="62" r="42" fill="#FBEEDA" stroke="#D9A467" strokeWidth="2.5" />
      {/* 수염 */}
      <g stroke="#D9A467" strokeWidth="2" strokeLinecap="round">
        <path d="M24 62 L4 57" />
        <path d="M24 68 L2 68" />
        <path d="M24 74 L4 79" />
        <path d="M96 62 L116 57" />
        <path d="M96 68 L118 68" />
        <path d="M96 74 L116 79" />
      </g>
      {/* 볼터치 */}
      {face.cheeks && (
        <>
          <circle cx="38" cy="68" r="6" fill="#F7C7A3" opacity="0.7" />
          <circle cx="82" cy="68" r="6" fill="#F7C7A3" opacity="0.7" />
        </>
      )}
      {face.brows}
      {face.eyes}
      {face.mouth}
      {/* 코 */}
      <path d="M57 64 L63 64 L60 68 Z" fill="#D9A467" />
    </motion.svg>
  )
}

export function moodFromEmojiKey(emojiKey) {
  const map = { joy: 'excited', good: 'happy', okay: 'neutral', down: 'sad', hard: 'sad' }
  return map[emojiKey] || 'neutral'
}
