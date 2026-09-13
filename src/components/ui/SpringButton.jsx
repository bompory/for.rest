import { motion } from 'framer-motion'

const VARIANTS = {
  sage: 'bg-sage text-white',
  peach: 'bg-peach text-ink',
  sky: 'bg-sky text-ink',
  orange: 'bg-warmOrange text-white',
  outline: 'bg-cream text-ink border-2 border-sage',
}

export default function SpringButton({
  children,
  onClick,
  variant = 'sage',
  className = '',
  disabled = false,
  type = 'button',
  fullWidth = false,
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.93 }}
      whileHover={disabled ? {} : { scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      className={[
        'rounded-xl2 px-6 py-3 font-round font-semibold shadow-soft',
        'disabled:opacity-50 disabled:cursor-not-allowed select-none',
        fullWidth ? 'w-full' : '',
        VARIANTS[variant] || VARIANTS.sage,
        className,
      ].join(' ')}
    >
      {children}
    </motion.button>
  )
}
