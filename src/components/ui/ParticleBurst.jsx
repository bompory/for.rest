import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SHAPES = ['leaf', 'star']
const COLORS = ['#A8C9A1', '#F7C7A3', '#AFD8E8', '#F2994A']

function Leaf({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20">
      <path d="M10 2 C16 4 18 10 10 18 C2 10 4 4 10 2 Z" fill={color} />
    </svg>
  )
}

function Star({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <path
        d="M8 0 L9.6 5.8 L16 6.1 L11 9.9 L12.9 16 L8 12.4 L3.1 16 L5 9.9 L0 6.1 L6.4 5.8 Z"
        fill={color}
      />
    </svg>
  )
}

export default function ParticleBurst({ active, big = false }) {
  const particles = useMemo(() => {
    const count = big ? 26 : 14
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      angle: (Math.PI * 2 * i) / count + Math.random() * 0.5,
      distance: 80 + Math.random() * (big ? 160 : 90),
      rotate: Math.random() * 360,
      delay: Math.random() * 0.15,
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      <AnimatePresence>
        {active &&
          particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute"
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
              animate={{
                x: Math.cos(p.angle) * p.distance,
                y: Math.sin(p.angle) * p.distance,
                opacity: 0,
                scale: 1,
                rotate: p.rotate,
              }}
              transition={{ duration: 0.9, delay: p.delay, ease: 'easeOut' }}
            >
              {p.shape === 'leaf' ? <Leaf color={p.color} /> : <Star color={p.color} />}
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  )
}
