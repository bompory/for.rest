import { motion } from 'framer-motion'
import { MOODS } from '../../lib/messages'

export default function EmojiPicker({ value, onChange }) {
  return (
    <div className="flex justify-between gap-2">
      {MOODS.map((mood) => (
        <motion.button
          key={mood.key}
          type="button"
          onClick={() => onChange(mood.key)}
          whileTap={{ scale: 0.85 }}
          animate={{ scale: value === mood.key ? 1.15 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className={[
            'flex-1 aspect-square rounded-xl2 flex flex-col items-center justify-center gap-1 text-2xl',
            'border-2',
            value === mood.key ? 'bg-peach-light border-peach-dark' : 'bg-white/60 border-transparent',
          ].join(' ')}
          aria-label={mood.label}
        >
          <span>{mood.emoji}</span>
        </motion.button>
      ))}
    </div>
  )
}
