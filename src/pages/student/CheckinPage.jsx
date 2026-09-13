import { useEffect, useMemo, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { useFirestoreDoc } from '../../hooks/useFirestore'
import { submitSelfCheckin } from '../../lib/attendance'
import { ensureDailyQuestion, finalizeCheckin } from '../../lib/checkinFlow'
import { checkAndUpdateGarden } from '../../lib/garden'
import { toDateId } from '../../lib/dateUtils'
import { pickMessage } from '../../lib/messages'
import Mascot, { moodFromEmojiKey } from '../../components/mascot/Mascot'
import MascotGreeting from '../../components/mascot/MascotGreeting'
import Card from '../../components/ui/Card'
import SpringButton from '../../components/ui/SpringButton'
import Modal from '../../components/ui/Modal'
import EmojiPicker from '../../components/ui/EmojiPicker'
import ParticleBurst from '../../components/ui/ParticleBurst'

export default function CheckinPage({ session }) {
  const { classId, studentId, studentName } = session
  const dateId = useMemo(() => toDateId(new Date()), [])

  const { data: classDoc } = useFirestoreDoc(['classes', classId])
  const { data: settings } = useFirestoreDoc(['classes', classId, 'settings', 'config'])
  const { data: student } = useFirestoreDoc(['classes', classId, 'students', studentId])
  const { data: checkin } = useFirestoreDoc(['classes', classId, 'checkins', `${dateId}_${studentId}`])

  const [codeModalOpen, setCodeModalOpen] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState('')
  const [busy, setBusy] = useState(false)

  const [mood, setMood] = useState(null)
  const [answer, setAnswer] = useState('')
  const [question, setQuestion] = useState(null)
  const [greetingMsg, setGreetingMsg] = useState('')
  const [burst, setBurst] = useState(false)
  const [unlockedCelebration, setUnlockedCelebration] = useState(null)

  useEffect(() => {
    if (checkin?.mood) setMood(checkin.mood)
    if (checkin?.answer) setAnswer(checkin.answer)
  }, [checkin?.id])

  useEffect(() => {
    let cancelled = false
    async function loadQuestion() {
      const daily = await ensureDailyQuestion(classId, dateId)
      const qId = checkin?.questionId || daily?.questionId
      if (!qId) return
      const qSnap = await getDoc(doc(db, 'classes', classId, 'questions', qId))
      if (!cancelled && qSnap.exists()) setQuestion({ id: qSnap.id, ...qSnap.data() })
    }
    loadQuestion()
    return () => {
      cancelled = true
    }
  }, [classId, dateId, checkin?.questionId])

  useEffect(() => {
    if (!checkin) {
      setGreetingMsg(pickMessage('onTime', studentName))
    } else if (checkin.status === 'late') {
      setGreetingMsg(pickMessage('late', studentName))
    } else if (checkin.status === 'onTime') {
      const streak = student?.onTimeStreak || 0
      if (streak >= 5) setGreetingMsg(pickMessage('streak5', studentName))
      else if (streak >= 3) setGreetingMsg(pickMessage('streak3', studentName))
      else setGreetingMsg(pickMessage('onTime', studentName))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkin?.status])

  const isChecked = checkin && checkin.status && checkin.status !== 'unchecked'
  const isFinalized = !!checkin?.rollupApplied

  async function handleCheckinClick() {
    setCodeInput('')
    setCodeError('')
    setCodeModalOpen(true)
  }

  async function handleCodeSubmit(e) {
    e.preventDefault()
    setCodeError('')
    if (!classDoc?.todayEntryCode) {
      setCodeError('아직 선생님이 입실코드를 열지 않았어요.')
      return
    }
    if (classDoc.todayEntryCodeDate !== dateId) {
      setCodeError('오늘의 입실코드가 아직 갱신되지 않았어요. 선생님께 확인해줘.')
      return
    }
    if (codeInput !== classDoc.todayEntryCode) {
      setCodeError('코드가 맞지 않아요. 다시 확인해줘.')
      return
    }
    setBusy(true)
    try {
      const result = await submitSelfCheckin({
        classId,
        studentId,
        lateThresholdTime: settings?.lateThresholdTime || '08:40',
      })
      setCodeModalOpen(false)
      setGreetingMsg(pickMessage(result.status === 'late' ? 'late' : 'onTime', studentName))
      checkAndUpdateGarden(classId, result.dateId).catch(() => {})
    } catch {
      setCodeError('체크인 중 문제가 생겼어요. 다시 시도해줘.')
    } finally {
      setBusy(false)
    }
  }

  async function handleComplete(skipAnswer) {
    if (!mood) return
    setBusy(true)
    try {
      const { newlyUnlocked } = await finalizeCheckin({
        classId,
        studentId,
        dateId,
        mood,
        answer: skipAnswer ? null : answer,
        questionId: question?.id,
        questionText: question?.text,
      })
      setBurst(true)
      setTimeout(() => setBurst(false), 1200)
      if (newlyUnlocked?.length) {
        setUnlockedCelebration(newlyUnlocked)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="px-5 pt-8 flex flex-col items-center gap-6 relative">
      <ParticleBurst active={burst} big />
      <MascotGreeting
        mood={checkin ? moodFromEmojiKey(mood || (checkin.status === 'late' ? 'okay' : 'good')) : 'happy'}
        message={greetingMsg}
      />

      {!isChecked && (
        <SpringButton variant="peach" onClick={handleCheckinClick} className="text-lg px-10 py-4">
          등교했어요
        </SpringButton>
      )}

      {isChecked && !isFinalized && (
        <Card className="w-full max-w-sm flex flex-col gap-4">
          <p className="text-center text-sm text-ink/70">
            {checkin.status === 'late' ? '조금 늦었지만 체크인 완료!' : '오늘도 정시 체크인 완료!'}
          </p>
          <div>
            <p className="text-sm font-semibold mb-2">오늘 기분은 어때?</p>
            <EmojiPicker value={mood} onChange={setMood} />
          </div>
          {question && (
            <div>
              <p className="text-sm font-semibold mb-2">{question.text}</p>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={3}
                placeholder="2~3줄로 편하게 적어줘 (안 써도 괜찮아)"
                className="w-full rounded-xl2 border border-sage-light px-3 py-2 bg-white/70 outline-none focus:border-sage resize-none text-sm"
              />
            </div>
          )}
          <div className="flex gap-2">
            <SpringButton variant="outline" className="flex-1" onClick={() => handleComplete(true)} disabled={!mood || busy}>
              답변 건너뛰기
            </SpringButton>
            <SpringButton variant="sage" className="flex-1" onClick={() => handleComplete(false)} disabled={!mood || busy}>
              완료!
            </SpringButton>
          </div>
        </Card>
      )}

      {isFinalized && (
        <Card className="w-full max-w-sm flex flex-col gap-3">
          <p className="text-center text-sm font-semibold text-sage-dark">오늘 체크인 다 했어요 🌿</p>
          <div className="flex justify-center">
            <EmojiPicker value={mood} onChange={setMood} />
          </div>
          {question && (
            <div>
              <p className="text-sm font-semibold mb-2">{question.text}</p>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={3}
                placeholder="오늘 안에는 답변을 수정할 수 있어"
                className="w-full rounded-xl2 border border-sage-light px-3 py-2 bg-white/70 outline-none focus:border-sage resize-none text-sm"
              />
            </div>
          )}
          <SpringButton
            variant="sky"
            onClick={() =>
              finalizeCheckin({ classId, studentId, dateId, mood, answer, questionId: question?.id, questionText: question?.text })
            }
            disabled={busy}
          >
            수정 저장
          </SpringButton>
        </Card>
      )}

      <Modal open={codeModalOpen} onClose={() => setCodeModalOpen(false)} title="오늘의 입실코드를 입력해줘">
        <form onSubmit={handleCodeSubmit} className="flex flex-col gap-3">
          <p className="text-xs text-ink/60">선생님 화면(교실 TV)에 뜬 4자리 숫자를 봐줘.</p>
          <input
            autoFocus
            inputMode="numeric"
            maxLength={4}
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="rounded-xl2 border border-sage-light px-4 py-3 bg-white/70 outline-none focus:border-sage text-center tracking-[0.5em] font-round text-2xl"
          />
          {codeError && <p className="text-warmOrange text-sm text-center">{codeError}</p>}
          <SpringButton type="submit" disabled={busy || codeInput.length !== 4}>
            확인
          </SpringButton>
        </form>
      </Modal>

      <Modal open={!!unlockedCelebration} onClose={() => setUnlockedCelebration(null)} title="도감 등록!">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <ParticleBurst active={!!unlockedCelebration} big />
          <Mascot mood="excited" size={100} bounce />
          <p className="font-body">{pickMessage('badgeUnlock', studentName)}</p>
          <SpringButton onClick={() => setUnlockedCelebration(null)}>도감에서 보기</SpringButton>
        </div>
      </Modal>
    </div>
  )
}
