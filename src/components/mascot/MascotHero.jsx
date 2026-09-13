import { motion } from 'framer-motion'
import mascotMain from '../../assets/mascot-main.png'

/** 로그인/랜딩 화면에 쓰는 통통 튀는 메인 마스코트 이미지 */
export default function MascotHero({ size = 140, className = '' }) {
  return (
    <motion.img
      src={mascotMain}
      alt="조회조회 마스코트"
      style={{ width: size, height: size }}
      className={`object-contain ${className}`}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}
