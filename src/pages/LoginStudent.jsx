import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import { auth, db } from '../firebase'
import { useStudentSession } from '../hooks/useStudentSession'
import SpringButton from '../components/ui/SpringButton'
import Card from '../components/ui/Card'
import Mascot from '../components/mascot/Mascot'

const STEPS = { CODE: 'code', NAME: 'name', PIN: 'pin' }

export default function LoginStudent() {
  const [step, setStep] = useState(STEPS.CODE)
  const [classCode, setClassCode] = useState('')
  const [classId, setClassId] = useState(null)
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { login } = useStudentSession()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Firestore 보안규칙이 인증된 사용자만 읽기를 허용하므로, 학급코드 조회 전에 먼저 익명 인증을 걸어둔다.
  useEffect(() => {
    if (!auth.currentUser) {
      signInAnonymously(auth).catch(() => {})
    }
  }, [])

  async function lookupClass(rawCode) {
    setError('')
    setBusy(true)
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth)
      }
      const code = rawCode.trim().toUpperCase()
      if (!code) return
      const q = query(collection(db, 'classes'), where('classCode', '==', code))
      const snap = await getDocs(q)
      if (snap.empty) {
        setError('학급코드를 다시 확인해주세요.')
        return
      }
      const classDoc = snap.docs[0]
      const studentsSnap = await getDocs(
        query(
          collection(db, 'classes', classDoc.id, 'students'),
          where('isActive', '==', true),
          orderBy('order'),
        ),
      )
      setClassId(classDoc.id)
      setStudents(studentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setStep(STEPS.NAME)
    } catch (err) {
      setError(
        err?.code === 'auth/admin-restricted-operation'
          ? '선생님께 알려주세요: Firebase 콘솔에서 익명 로그인이 아직 켜져 있지 않아요.'
          : '학급을 찾는 중 문제가 생겼어요.',
      )
    } finally {
      setBusy(false)
    }
  }

  // QR코드로 들어온 경우 (?code=XXXXX) 학급코드를 자동으로 채우고 바로 조회한다.
  useEffect(() => {
    const codeFromQr = searchParams.get('code')
    if (codeFromQr) {
      setClassCode(codeFromQr)
      lookupClass(codeFromQr)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleCodeSubmit(e) {
    e.preventDefault()
    lookupClass(classCode)
  }

  function handleSelectStudent(student) {
    setSelectedStudent(student)
    setPin('')
    setError('')
    setStep(STEPS.PIN)
  }

  async function handlePinSubmit(e) {
    e.preventDefault()
    setError('')
    if (pin !== selectedStudent.pin) {
      setError('PIN이 맞지 않아요. 다시 입력해줄래?')
      return
    }
    setBusy(true)
    try {
      await login({
        classId,
        classCode: classCode.trim().toUpperCase(),
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
      })
      navigate('/app')
    } catch {
      setError('로그인 중 문제가 생겼어요. 다시 시도해줄래?')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6">
      <Mascot mood="happy" size={100} />
      <Card className="w-full max-w-sm">
        {step === STEPS.CODE && (
          <form onSubmit={handleCodeSubmit} className="flex flex-col gap-3">
            <h1 className="font-round text-lg font-bold text-center mb-1">학급코드를 입력해줘</h1>
            <input
              autoFocus
              required
              placeholder="예: AB12C"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value)}
              className="rounded-xl2 border border-sage-light px-4 py-3 bg-white/70 outline-none focus:border-sage text-center tracking-widest font-round text-lg uppercase"
            />
            {error && <p className="text-warmOrange text-sm text-center">{error}</p>}
            <SpringButton type="submit" fullWidth disabled={busy}>
              다음
            </SpringButton>
          </form>
        )}

        {step === STEPS.NAME && (
          <div className="flex flex-col gap-3">
            <h1 className="font-round text-lg font-bold text-center mb-1">내 이름을 골라줘</h1>
            <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto scrollbar-none">
              {students.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectStudent(s)}
                  className="rounded-xl2 bg-sky-light border border-sky-dark/30 py-3 text-sm font-body hover:bg-sky transition-colors"
                >
                  {s.name}
                </button>
              ))}
            </div>
            <button className="text-xs text-ink/60 underline mt-1" onClick={() => setStep(STEPS.CODE)}>
              학급코드 다시 입력
            </button>
          </div>
        )}

        {step === STEPS.PIN && selectedStudent && (
          <form onSubmit={handlePinSubmit} className="flex flex-col gap-3">
            <h1 className="font-round text-lg font-bold text-center mb-1">
              {selectedStudent.name}, PIN 4자리를 입력해줘
            </h1>
            <input
              autoFocus
              required
              type="password"
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="rounded-xl2 border border-sage-light px-4 py-3 bg-white/70 outline-none focus:border-sage text-center tracking-[0.5em] font-round text-2xl"
            />
            {error && <p className="text-warmOrange text-sm text-center">{error}</p>}
            <SpringButton type="submit" fullWidth disabled={busy || pin.length !== 4}>
              체크인 화면으로
            </SpringButton>
            <button type="button" className="text-xs text-ink/60 underline" onClick={() => setStep(STEPS.NAME)}>
              다른 이름 선택
            </button>
          </form>
        )}
      </Card>
      {step === STEPS.CODE && (
        <button
          type="button"
          className="text-xs text-ink/60 underline"
          onClick={() => navigate('/login/teacher')}
        >
          선생님이신가요? 교사 로그인으로 이동
        </button>
      )}
    </div>
  )
}
