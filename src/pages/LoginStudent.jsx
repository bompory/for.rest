import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import { auth, db } from '../firebase'
import { useStudentSession } from '../hooks/useStudentSession'
import SpringButton from '../components/ui/SpringButton'
import Card from '../components/ui/Card'
import Mascot from '../components/mascot/Mascot'
import AuthRoleTabs from '../components/auth/AuthRoleTabs'

const STEPS = { CODE: 'code', NAME: 'name', PIN: 'pin' }

export default function LoginStudent() {
  const [step, setStep] = useState(STEPS.CODE)
  const [classCode, setClassCode] = useState('')
  const [classId, setClassId] = useState(null)
  const [nameInput, setNameInput] = useState('')
  const [matchedStudent, setMatchedStudent] = useState(null) // null = 처음 등록하는 학생
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
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
      setClassId(snap.docs[0].id)
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

  async function handleNameSubmit(e) {
    e.preventDefault()
    const name = nameInput.trim()
    if (!name) return
    setError('')
    setBusy(true)
    try {
      const snap = await getDocs(
        query(
          collection(db, 'classes', classId, 'students'),
          where('name', '==', name),
          where('isActive', '==', true),
        ),
      )
      if (snap.size > 1) {
        setError('같은 이름을 쓰는 학생이 여러 명이에요. 선생님께 확인해줘.')
        return
      }
      setMatchedStudent(snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() })
      setPin('')
      setPinConfirm('')
      setStep(STEPS.PIN)
    } catch {
      setError('이름을 확인하는 중 문제가 생겼어요.')
    } finally {
      setBusy(false)
    }
  }

  async function handlePinSubmit(e) {
    e.preventDefault()
    setError('')

    if (matchedStudent) {
      // 기존 학생: PIN 대조
      if (pin !== matchedStudent.pin) {
        setError('PIN이 맞지 않아요. 다시 입력해줄래?')
        return
      }
      setBusy(true)
      try {
        await login({
          classId,
          classCode: classCode.trim().toUpperCase(),
          studentId: matchedStudent.id,
          studentName: matchedStudent.name,
        })
        navigate('/app')
      } catch {
        setError('로그인 중 문제가 생겼어요. 다시 시도해줄래?')
      } finally {
        setBusy(false)
      }
      return
    }

    // 처음 등록하는 학생: 새 PIN 설정
    if (pin !== pinConfirm) {
      setError('PIN이 서로 달라요. 두 칸에 같은 숫자를 입력해줘.')
      return
    }
    setBusy(true)
    try {
      const name = nameInput.trim()
      const existing = await getDocs(collection(db, 'classes', classId, 'students'))
      const alreadyTaken = existing.docs.some(
        (d) => d.data().name === name && d.data().isActive !== false,
      )
      if (alreadyTaken) {
        setError('방금 다른 친구가 같은 이름으로 등록했나봐. 이름을 다르게 적어줘.')
        setStep(STEPS.NAME)
        return
      }
      const newDoc = await addDoc(collection(db, 'classes', classId, 'students'), {
        name,
        pin,
        order: existing.size,
        isActive: true,
        totalStamps: 0,
        lateCountTotal: 0,
        onTimeStreak: 0,
        last7LateFlags: [],
        last7AnswerLengths: [],
        unlockedBadgeIds: [],
      })
      await login({
        classId,
        classCode: classCode.trim().toUpperCase(),
        studentId: newDoc.id,
        studentName: name,
      })
      navigate('/app')
    } catch {
      setError('등록 중 문제가 생겼어요. 다시 시도해줄래?')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6">
      <h1 className="font-round text-2xl font-bold text-sage-dark">조회조회</h1>
      <AuthRoleTabs active="student" />
      <Mascot mood="happy" size={100} />
      <Card className="w-full max-w-sm">
        {step === STEPS.CODE && (
          <form onSubmit={handleCodeSubmit} className="flex flex-col gap-3">
            <h2 className="font-round text-lg font-bold text-center mb-1">학급코드를 입력해줘</h2>
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
          <form onSubmit={handleNameSubmit} className="flex flex-col gap-3">
            <h2 className="font-round text-lg font-bold text-center mb-1">내 이름을 입력해줘</h2>
            <p className="text-xs text-ink/50 text-center">
              처음이면 이름이 자동으로 등록되고, 이미 등록했으면 그대로 로그인돼요.
            </p>
            <input
              autoFocus
              required
              placeholder="이름"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="rounded-xl2 border border-sage-light px-4 py-3 bg-white/70 outline-none focus:border-sage text-center font-round text-lg"
            />
            {error && <p className="text-warmOrange text-sm text-center">{error}</p>}
            <SpringButton type="submit" fullWidth disabled={busy || !nameInput.trim()}>
              다음
            </SpringButton>
            <button type="button" className="text-xs text-ink/60 underline mt-1" onClick={() => setStep(STEPS.CODE)}>
              학급코드 다시 입력
            </button>
          </form>
        )}

        {step === STEPS.PIN && (
          <form onSubmit={handlePinSubmit} className="flex flex-col gap-3">
            {matchedStudent ? (
              <>
                <h2 className="font-round text-lg font-bold text-center mb-1">
                  {matchedStudent.name}, PIN 4자리를 입력해줘
                </h2>
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
              </>
            ) : (
              <>
                <h2 className="font-round text-lg font-bold text-center mb-1">
                  {nameInput.trim()}, 처음이구나! PIN 4자리를 정해줘
                </h2>
                <p className="text-xs text-ink/50 text-center">
                  다음에 들어올 때도 이 PIN을 써야 하니 잊지 않게 잘 기억해줘.
                </p>
                <input
                  autoFocus
                  required
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  placeholder="PIN 4자리"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="rounded-xl2 border border-sage-light px-4 py-3 bg-white/70 outline-none focus:border-sage text-center tracking-[0.5em] font-round text-2xl"
                />
                <input
                  required
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  placeholder="PIN 확인"
                  value={pinConfirm}
                  onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="rounded-xl2 border border-sage-light px-4 py-3 bg-white/70 outline-none focus:border-sage text-center tracking-[0.5em] font-round text-2xl"
                />
              </>
            )}
            {error && <p className="text-warmOrange text-sm text-center">{error}</p>}
            <SpringButton
              type="submit"
              fullWidth
              disabled={
                busy ||
                pin.length !== 4 ||
                (!matchedStudent && pinConfirm.length !== 4)
              }
            >
              체크인 화면으로
            </SpringButton>
            <button type="button" className="text-xs text-ink/60 underline" onClick={() => setStep(STEPS.NAME)}>
              이름 다시 입력
            </button>
          </form>
        )}
      </Card>
    </div>
  )
}
