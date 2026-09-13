import { motion } from 'framer-motion'
import Mascot from './Mascot'

export default function MascotGreeting({ mood = 'happy', message, size = 110, imageSrc }) {
  return (
    <div className="flex flex-col items-center text-center gap-2">
      {imageSrc ? (
        <motion.img
          src={imageSrc}
          alt="마스코트"
          style={{ width: size, height: size }}
          className="object-contain"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : (
        <Mascot mood={mood} size={size} bounce />
      )}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 rounded-xl2 px-4 py-2 shadow-softer max-w-xs text-sm font-body text-ink"
        >
          {message}
        </motion.div>
      )}
    </div>
  )
}
