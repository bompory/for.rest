import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, orderBy, query, updateDoc, doc, serverTimestamp, where } from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { auth, db } from '../../firebase'
import { useFirestoreDoc, useFirestoreQuery } from '../../hooks/useFirestore'
import { ensureTodayEntryCode } from '../../lib/entryCode'
import { teacherSetCheckin, detectWatchFlags } from '../../lib/attendance'
import { toDateId, formatKoreanDate } from '../../lib/dateUtils'
import { MOODS } from '../../lib/messages'
import Card from '../../components/ui/Card'
import SpringButton from '../../components/ui/SpringButton'
import Modal from '../../components/ui/Modal'
import Mascot from '../../components/mascot/Mascot'
import JoinQrCode from '../../components/ui/JoinQrCode'
import LegalFooter from '../../components/legal/LegalFooter'
import Watermark from '../../components/ui/Watermark'

const STATUS_OPTIONS = [
  { value: 'onTime', label: '정상' },
  { value: 'late', label: '지각' },
  { value: 'sick', label: '병결' },
  { value: 'fieldTrip', label: '체험학습' },
  { value: 'earlyLeave', label: '조퇴' },
]

const STATUS_META = {
  onTime: { label: '정시', className: 'bg-sage-light text-sage-dark' },
  late: { label: '지각', className: 'bg-peach-light text-warmOrange' },
  sick: { label: '병결', className: 'bg-sky-light text-sky-dark' },
  fieldTrip: { label: '체험학습', className: 'bg-sky-light text-sky-dark' },
  earlyLeave: { label: '조퇴', className: 'bg-sky-light text-sky-dark' },
  unchecked: { label: '미체크', className: 'bg-ink/10 text-ink/50' },
}

export default function TeacherDashboard({ teacher }) {
  const classId = teacher.uid
  const dateId = useMemo(() => toDateId(new Date()), [])
  const navigate = useNavigate()

  const { data: classDoc } = useFirestoreDoc(['classes', classId])
  const { items: students } = useFirestoreQuery(
    () => query(collection(db, 'classes', classId, 'students'), where('isActive', '==', true), orderBy('order')),
    [classId],
  )
  const { items: checkins } = useFirestoreQuery(
    () => query(collection(db, 'classes', classId, 'checkins'), where('date', '==', dateId)),
    [classId, dateId],
  )
  const { items: helpRequests } = useFirestoreQuery(
    () => query(collection(db, 'classes', classId, 'helpRequests'), where('status', '==', 'pending'), orderBy('createdAt')),
    [classId],
  )

  const [fullscreen, setFullscreen] = useState(false)
  const [statusModalStudent, setStatusModalStudent] = useState(null)

  useEffect(() => {
    ensureTodayEntryCode(classId).catch(() => {})
  }, [classId])

  const checkinByStudent = useMemo(() => {
    const map = {}
    checkins.forEach((c) => {
      map[c.studentId] = c
    })
    return map
  }, [checkins])

  const summary = useMemo(() => {
    let onTime = 0, late = 0, unchecked = 0, other = 0
    students.forEach((s) => {
      const c = checkinByStudent[s.id]
      if (!c || c.status === 'unchecked') unchecked++
      else if (c.status === 'onTime') onTime++
      else if (c.status === 'late') late++
      else other++
    })
    return { onTime, late, unchecked, other, total: students.length }
  }, [students, checkinByStudent])

  const watchList = useMemo(
    () =>
      students
        .map((s) => ({ student: s, flags: detectWatchFlags(s) }))
        .filter((x) => x.flags.length > 0),
    [students],
  )

  async function acknowledgeHelp(reqId) {
    await updateDoc(doc(db, 'classes', classId, 'helpRequests', reqId), {
      status: 'seen',
      seenAt: serverTimestamp(),
    })
  }

  async function handleSetStatus(studentId, status) {
    await teacherSetCheckin({ classId, studentId, dateId, status })
    setStatusModalStudent(null)
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.()
      setFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setFullscreen(false)
    }
  }

  return (
    <div className="min-h-screen px-5 py-6 max-w-2xl mx-auto flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="font-round text-lg font-bold">{classDoc?.name || '조회조회'} 교사 대시보드</h1>
        <div className="flex gap-2">
          <button className="text-xs text-ink/60 underline" onClick={() => navigate('/teacher/settings')}>
            설정
          </button>
          <button className="text-xs text-ink/60 underline" onClick={() => signOut(auth)}>
            로그아웃
          </button>
        </div>
      </div>

      <Card className={fullscreen ? 'flex flex-col items-center gap-2 py-10' : 'flex flex-col items-center gap-2'}>
        <p className="text-sm text-ink/60">{formatKoreanDate(dateId)} · 오늘의 입실코드</p>
        <p className={fullscreen ? 'font-round text-9xl tracking-[0.3em] text-sage-dark' : 'font-round text-6xl tracking-[0.3em] text-sage-dark'}>
          {classDoc?.todayEntryCode || '----'}
        </p>
        <p className="text-xs text-ink/50">학급코드: {classDoc?.classCode}</p>
        {classDoc?.classCode && (
          <div className="flex flex-col items-center gap-1 mt-1">
            <JoinQrCode
              value={`${window.location.origin}/login/student?code=${classDoc.classCode}`}
              size={fullscreen ? 220 : 140}
            />
            <p className="text-[11px] text-ink/50">QR을 찍으면 학급코드가 자동으로 입력돼요</p>
          </div>
        )}
        <SpringButton variant="outline" onClick={toggleFullscreen}>
          {fullscreen ? '전체화면 종료' : '교실 TV 전체화면'}
        </SpringButton>
      </Card>

      {helpRequests.length > 0 && (
        <Card className="border-warmOrange border-2">
          <p className="font-round font-bold text-warmOrange mb-2">🆘 상담 요청</p>
          <div className="flex flex-col gap-2">
            {helpRequests.map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-peach-light rounded-xl2 px-3 py-2">
                <div>
                  <p className="font-semibold text-sm">{r.studentName}</p>
                  {r.reason && <p className="text-xs text-ink/70">{r.reason}</p>}
                </div>
                <SpringButton variant="orange" onClick={() => acknowledgeHelp(r.id)} className="text-xs px-3 py-1.5">
                  확인함
                </SpringButton>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-4 gap-2 text-center">
        <SummaryTile label="정시" value={summary.onTime} tone="bg-sage-light text-sage-dark" />
        <SummaryTile label="지각" value={summary.late} tone="bg-peach-light text-warmOrange" />
        <SummaryTile label="기타" value={summary.other} tone="bg-sky-light text-sky-dark" />
        <SummaryTile label="미체크" value={summary.unchecked} tone="bg-ink/10 text-ink/50" />
      </div>

      {watchList.length > 0 && (
        <Card>
          <p className="font-round font-bold mb-2">신경 쓸 학생</p>
          <div className="flex flex-col gap-2">
            {watchList.map(({ student, flags }) => (
              <button
                key={student.id}
                onClick={() => navigate(`/teacher/student/${student.id}`)}
                className="text-left bg-peach-light/50 rounded-xl2 px-3 py-2"
              >
                <p className="font-semibold text-sm">{student.name}</p>
                {flags.map((f) => (
                  <p key={f.type} className="text-xs text-ink/60">{f.label}</p>
                ))}
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <p className="font-round font-bold mb-3">오늘 현황</p>
        <div className="flex flex-col gap-2">
          {students.map((s) => {
            const c = checkinByStudent[s.id]
            const status = c?.status || 'unchecked'
            const moodEmoji = MOODS.find((m) => m.key === c?.mood)?.emoji
            return (
              <div key={s.id} className="flex items-center justify-between gap-2">
                <button
                  className="flex-1 text-left flex items-center gap-2"
                  onClick={() => navigate(`/teacher/student/${s.id}`)}
                >
                  <span className="text-sm font-body">{s.name}</span>
                  {moodEmoji && <span>{moodEmoji}</span>}
                </button>
                <span className={`text-xs px-2 py-1 rounded-lg ${STATUS_META[status].className}`}>
                  {STATUS_META[status].label}
                </span>
                <button
                  className="text-xs text-ink/50 underline"
                  onClick={() => setStatusModalStudent(s)}
                >
                  변경
                </button>
              </div>
            )
          })}
        </div>
      </Card>

      <Modal
        open={!!statusModalStudent}
        onClose={() => setStatusModalStudent(null)}
        title={statusModalStudent ? `${statusModalStudent.name} 출결 상태` : ''}
      >
        <div className="grid grid-cols-2 gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <SpringButton
              key={opt.value}
              variant="outline"
              onClick={() => handleSetStatus(statusModalStudent.id, opt.value)}
            >
              {opt.label}
            </SpringButton>
          ))}
        </div>
      </Modal>

      <div className="flex justify-center opacity-60">
        <Mascot mood="neutral" size={50} />
      </div>
      <LegalFooter />
      <Watermark />
    </div>
  )
}

function SummaryTile({ label, value, tone }) {
  return (
    <div className={`rounded-xl2 py-3 ${tone}`}>
      <p className="text-xl font-round font-bold">{value}</p>
      <p className="text-[11px]">{label}</p>
    </div>
  )
}
