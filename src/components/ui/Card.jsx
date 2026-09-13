export default function Card({ children, className = '', as: As = 'div', ...props }) {
  return (
    <As
      className={[
        'bg-white/80 rounded-xl3 shadow-soft border border-sage-light/60 p-5',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </As>
  )
}
