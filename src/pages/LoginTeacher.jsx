import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'
import SpringButton from '../components/ui/SpringButton'
import Card from '../components/ui/Card'
import MascotHero from '../components/mascot/MascotHero'
import AuthRoleTabs from '../components/auth/AuthRoleTabs'
import AppTitle from '../components/ui/AppTitle'
import Watermark from '../components/ui/Watermark'
import LegalFooter from '../components/legal/LegalFooter'
import { defaultQuestionBank } from '../seed/questions'
import { defaultBadgeCatalog } from '../lib/stamps'

const googleProvider = new GoogleAuthProvider()

function randomClassCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

async function ensureClassDoc(uid) {
  const ref = doc(db, 'classes', uid)
  const snap = await getDoc(ref)
  if (snap.exists()) return

  await setDoc(ref, {
    name: '우리 반',
    classCode: randomClassCode(),
    teacherUid: uid,
    todayEntryCode: null,
    todayEntryCodeDate: null,
    createdAt: serverTimestamp(),
  })

  await setDoc(doc(db, 'classes', uid, 'settings', 'config'), {
    lateThresholdTime: '08:40',
    lateActionRules: [
      { count: 1, action: '교실 청소' },
      { count: 3, action: '좋은 글 필사' },
      { count: 5, action: '삶에 대한 글쓰기' },
    ],
    recoveryEnabled: true,
    recoveryStreakDays: 5,
    recoveryDeductCount: 1,
    excludeWeekends: true,
    holidays: [],
    questionMode: 'auto',
  })

  const questions = defaultQuestionBank()
  await Promise.all(
    questions.map((q, i) =>
      setDoc(doc(db, 'classes', uid, 'questions', `q${i + 1}`), {
        text: q,
        order: i,
        isDefault: true,
        isActive: true,
      }),
    ),
  )

  const badges = defaultBadgeCatalog()
  await Promise.all(
    badges.map((b) => setDoc(doc(db, 'classes', uid, 'badges', b.id), b)),
  )
}

export default function LoginTeacher() {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  async function handleGoogleLogin() {
    setError('')
    setBusy(true)
    try {
      const cred = await signInWithPopup(auth, googleProvider)
      await ensureClassDoc(cred.user.uid)
      navigate('/teacher')
    } catch (err) {
      setError(errorMessage(err.code))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6">
      <AppTitle size="text-2xl" />
      <AuthRoleTabs active="teacher" />
      <MascotHero size={100} />
      <Card className="w-full max-w-sm flex flex-col items-center gap-4">
        <h2 className="font-round text-xl font-bold text-center">교사 로그인</h2>
        <p className="text-sm text-ink/60 text-center">
          구글 계정으로 로그인하면 처음 한 번, 학급과 기본 설정이 자동으로 만들어져요.
        </p>
        <SpringButton fullWidth onClick={handleGoogleLogin} disabled={busy} className="flex items-center justify-center gap-2">
          <GoogleIcon />
          구글로 로그인
        </SpringButton>
        {error && <p className="text-warmOrange text-sm">{error}</p>}
      </Card>
      <LegalFooter />
      <Watermark />
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  )
}

function errorMessage(code) {
  const map = {
    'auth/popup-closed-by-user': '로그인 창을 닫으셨어요. 다시 시도해주세요.',
    'auth/popup-blocked': '팝업이 차단됐어요. 브라우저 설정을 확인해주세요.',
    'auth/cancelled-popup-request': '로그인 진행 중이에요. 잠시만 기다려주세요.',
  }
  return map[code] || '로그인 중 문제가 생겼어요. 다시 시도해주세요.'
}
