import { Navigate, useNavigate } from 'react-router-dom'
import SpringButton from '../components/ui/SpringButton'
import AppTitle from '../components/ui/AppTitle'
import MascotHero from '../components/mascot/MascotHero'
import LegalFooter from '../components/legal/LegalFooter'

export default function RoleGate({ teacher, session }) {
  const navigate = useNavigate()
  if (teacher) return <Navigate to="/teacher" replace />
  if (session) return <Navigate to="/app" replace />

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-6 text-center">
      <MascotHero size={144} />
      <div>
        <AppTitle size="text-3xl" />
        <p className="mt-2 text-sm text-ink/70 max-w-xs">
          아침에 모이는 조회(朝會)에서, 아이의 하루를 비춰보는 조회(照會)로.
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <SpringButton variant="sage" fullWidth onClick={() => navigate('/login/student')}>
          학생으로 시작하기
        </SpringButton>
        <SpringButton variant="outline" fullWidth onClick={() => navigate('/login/teacher')}>
          교사로 로그인
        </SpringButton>
      </div>
      <LegalFooter />
    </div>
  )
}
