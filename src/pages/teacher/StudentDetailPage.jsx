import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../../firebase'
import { useFirestoreDoc, useFirestoreQuery } from '../../hooks/useFirestore'
import { matchActionRule } from '../../lib/attendance'
import { formatKoreanDate, toTimeLabel } from '../../lib/dateUtils'
import { MOODS } from '../../lib/messages'
import Card from '../../components/ui/Card'
import SpringButton from '../../components/ui/SpringButton'
import MoodSparkline from '../../components/charts/MoodSparkline'

const STATUS_LABEL = {
  onTime: '정시', late: '지각', sick: '병결', fieldTrip: '체험학습', earlyLeave: '조퇴', unchecked: '미체크',
}

export default function StudentDetailPage({ teacher }) {
  const classId = teacher.uid
  const { studentId } = useParams()
  const navigate = useNavigate()

  const { data: student } = useFirestoreDoc(['classes', classId, 'students', studentId])
  const { data: settings } = useFirestoreDoc(['classes', classId, 'settings', 'config'])
  const { items: checkins } = useFirestoreQuery(
    () =>
      query(
        collection(db, 'classes', classId, 'checkins'),
        where('studentId', '==', studentId),
        orderBy('date', 'desc'),
        limit(30),
      ),
    [classId, studentId],
  )
  const { items: notes } = useFirestoreQuery(
    () => query(collection(db, 'classes', classId, 'students', studentId, 'notes'), orderBy('createdAt', 'desc')),
    [classId, studentId],
  )

  const [noteText, setNoteText] = useState('')

  const sparkData = useMemo(
    () => [...checkins].reverse().map((c) => MOODS.find((m) => m.key === c.mood)?.value || null),
    [checkins],
  )

  const currentRule = student
    ? matchActionRule(student.lateCountTotal || 0, settings?.lateActionRules || [])
    : null

  async function addNote() {
    if (!noteText.trim()) return
    await addDoc(collection(db, 'classes', classId, 'students', studentId, 'notes'), {
      text: noteText.trim(),
      createdAt: serverTimestamp(),
    })
    setNoteText('')
  }

  async function removeNote(noteId) {
    await deleteDoc(doc(db, 'classes', classId, 'students', studentId, 'notes', noteId))
  }

  if (!student) return null

  return (
    <div className="min-h-screen px-5 py-6 max-w-2xl mx-auto flex flex-col gap-4">
      <button className="text-sm text-ink/60 underline self-start" onClick={() => navigate('/teacher')}>
        ← 대시보드로
      </button>
      <h1 className="font-round text-2xl font-bold">{student.name}</h1>

      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center">
          <p className="text-xs text-ink/60">누적 지각</p>
          <p className="text-2xl font-round font-bold text-warmOrange">{student.lateCountTotal || 0}회</p>
          {currentRule && <p className="text-xs mt-1">현재 조치: {currentRule.action}</p>}
        </Card>
        <Card className="text-center">
          <p className="text-xs text-ink/60">연속 정시등교</p>
          <p className="text-2xl font-round font-bold text-sage-dark">{student.onTimeStreak || 0}일</p>
        </Card>
      </div>

      <Card>
        <p className="text-sm font-semibold mb-2">기분 추이</p>
        <MoodSparkline data={sparkData} />
      </Card>

      <Card>
        <p className="text-sm font-semibold mb-2">교사 메모 (학생에게 안 보임)</p>
        <div className="flex gap-2 mb-3">
          <input
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="메모 입력"
            className="flex-1 rounded-xl2 border border-sage-light px-3 py-2 bg-white/70 outline-none focus:border-sage text-sm"
          />
          <SpringButton onClick={addNote} className="px-4 py-2 text-sm">
            추가
          </SpringButton>
        </div>
        <div className="flex flex-col gap-2">
          {notes.map((n) => (
            <div key={n.id} className="flex items-start justify-between bg-cream rounded-xl2 px-3 py-2 text-sm">
              <span>{n.text}</span>
              <button className="text-xs text-ink/40 underline ml-2" onClick={() => removeNote(n.id)}>
                삭제
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <p className="text-sm font-semibold mb-2">타임라인</p>
        <div className="flex flex-col gap-3">
          {checkins.map((c) => (
            <CheckinTimelineRow key={c.id} classId={classId} checkin={c} />
          ))}
          {checkins.length === 0 && <p className="text-sm text-ink/50">기록이 없어요.</p>}
        </div>
      </Card>
    </div>
  )
}

function CheckinTimelineRow({ classId, checkin: c }) {
  const [replyDraft, setReplyDraft] = useState(c.teacherReply || '')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  async function saveReply() {
    setSaving(true)
    try {
      await updateDoc(doc(db, 'classes', classId, 'checkins', c.id), {
        teacherReply: replyDraft.trim() || null,
        teacherReplyAt: serverTimestamp(),
      })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border-b border-sage-light/50 pb-3 last:border-0">
      <div className="flex justify-between text-sm">
        <span className="font-semibold">{formatKoreanDate(c.date)}</span>
        <span className="text-ink/60">
          {STATUS_LABEL[c.status]} · {c.checkedAt ? toTimeLabel(c.checkedAt) : '-'}
        </span>
      </div>
      {c.questionText && <p className="text-xs text-ink/50 mt-1">{c.questionText}</p>}
      {c.answer && <p className="text-sm text-ink/80 mt-0.5">{c.answer}</p>}

      {!c.answer && !c.questionText ? null : editing ? (
        <div className="flex gap-2 mt-2">
          <input
            autoFocus
            value={replyDraft}
            onChange={(e) => setReplyDraft(e.target.value)}
            placeholder="학생에게 남길 답장"
            className="flex-1 rounded-xl2 border border-sage-light px-3 py-1.5 bg-white/70 outline-none focus:border-sage text-sm"
          />
          <SpringButton onClick={saveReply} disabled={saving} className="text-xs px-3 py-1.5">
            저장
          </SpringButton>
        </div>
      ) : c.teacherReply ? (
        <button
          className="mt-2 flex items-start gap-1.5 bg-peach-light/60 rounded-xl2 px-3 py-2 w-full text-left"
          onClick={() => setEditing(true)}
        >
          <span className="text-sm">🐱</span>
          <span className="text-sm text-ink/80 flex-1">{c.teacherReply}</span>
        </button>
      ) : (
        <button className="text-xs text-sage-dark underline mt-2" onClick={() => setEditing(true)}>
          답장 남기기
        </button>
      )}

      {c.studentReply && (
        <div className="mt-1.5 flex items-start gap-1.5 bg-sky-light/60 rounded-xl2 px-3 py-2">
          <span className="text-sm">💬</span>
          <span className="text-sm text-ink/80 flex-1">{c.studentReply}</span>
        </div>
      )}
    </div>
  )
}
