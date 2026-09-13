import { useNavigate } from 'react-router-dom'

/** 로그인 화면 어디서든 교사/학생을 헷갈리지 않게 항상 보이는 큰 탭 */
export default function AuthRoleTabs({ active }) {
  const navigate = useNavigate()

  return (
    <div className="w-full max-w-sm grid grid-cols-2 gap-2 bg-white/60 rounded-xl2 p-1.5">
      <button
        type="button"
        onClick={() => navigate('/login/teacher')}
        className={[
          'py-3 rounded-xl2 font-round font-semibold text-sm transition-colors',
          active === 'teacher' ? 'bg-sage text-white shadow-soft' : 'text-ink/50',
        ].join(' ')}
      >
        교사 로그인
      </button>
      <button
        type="button"
        onClick={() => navigate('/login/student')}
        className={[
          'py-3 rounded-xl2 font-round font-semibold text-sm transition-colors',
          active === 'student' ? 'bg-sage text-white shadow-soft' : 'text-ink/50',
        ].join(' ')}
      >
        학생 로그인
      </button>
    </div>
  )
}
