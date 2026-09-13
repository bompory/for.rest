import { useMemo, useState } from 'react'
import { collection, limit, orderBy, query, where } from 'firebase/firestore'
import { db } from '../../firebase'
import { useFirestoreQuery } from '../../hooks/useFirestore'
import { MOODS } from '../../lib/messages'
import { formatKoreanDate, toDateId } from '../../lib/dateUtils'
import { finalizeCheckin, replyToTeacher } from '../../lib/checkinFlow'
import Card from '../../components/ui/Card'
import SpringButton from '../../components/ui/SpringButton'
import MoodSparkline from '../../components/charts/MoodSparkline'

const STATUS_LABEL = {
  onTime: { text: '정시', color: 'text-sage-dark' },
  late: { text: '지각', color: 'text-warmOrange' },
  sick: { text: '병결', color: 'text-sky-dark' },
  fieldTrip: { text: '체험학습', color: 'text-sky-dark' },
  earlyLeave: { text: '조퇴', color: 'text-sky-dark' },
  unchecked: { text: '미체크', color: 'text-ink/40' },
}

function moodEmoji(key) {
  return MOODS.find((m) => m.key === key)?.emoji || '—'
}

export default function MyRecordsPage({ session }) {
  const { classId, studentId, studentName } = session
  const todayDateId = useMemo(() => toDateId(new Date()), [])

  const { items: checkins, loading } = useFirestoreQuery(
    () =>
      query(
        collection(db, 'classes', classId, 'checkins'),
        where('studentId', '==', studentId),
        orderBy('date', 'desc'),
        limit(30),
      ),
    [classId, studentId],
  )

  const sparkData = useMemo(
    () =>
      [...checkins]
        .reverse()
        .map((c) => MOODS.find((m) => m.key === c.mood)?.value || null),
    [checkins],
  )

  return (
    <div className="px-5 pt-8 pb-4 flex flex-col gap-4">
      <h1 className="font-round text-xl font-bold text-center">{studentName}의 기록</h1>

      <Card>
        <p className="text-sm font-semibold mb-2">기분 추이</p>
        <MoodSparkline data={sparkData} />
      </Card>

      {loading && <p className="text-center text-sm text-ink/50">불러오는 중...</p>}

      <div className="flex flex-col gap-3">
        {checkins.map((c) => (
          <RecordCard
            key={c.id}
            classId={classId}
            studentId={studentId}
            checkin={c}
            isToday={c.date === todayDateId}
          />
        ))}
        {!loading && checkins.length === 0 && (
          <p className="text-center text-sm text-ink/50 mt-6">아직 기록이 없어요. 오늘 첫 체크인을 해볼까?</p>
        )}
      </div>
    </div>
  )
}

function RecordCard({ classId, studentId, checkin: c, isToday }) {
  const [editing, setEditing] = useState(false)
  const [answerDraft, setAnswerDraft] = useState(c.answer || '')
  const [saving, setSaving] = useState(false)

  const [replying, setReplying] = useState(false)
  const [replyDraft, setReplyDraft] = useState(c.studentReply || '')
  const [sendingReply, setSendingReply] = useState(false)

  async function saveAnswer() {
    setSaving(true)
    try {
      await finalizeCheckin({
        classId,
        studentId,
        dateId: c.date,
        mood: c.mood,
        answer: answerDraft,
        questionId: c.questionId,
        questionText: c.questionText,
      })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  async function sendReply() {
    setSendingReply(true)
    try {
      await replyToTeacher({ classId, studentId, dateId: c.date, text: replyDraft })
      setReplying(false)
    } finally {
      setSendingReply(false)
    }
  }

  return (
    <Card className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{formatKoreanDate(c.date)}</span>
        <span className={`text-xs font-semibold ${STATUS_LABEL[c.status]?.color}`}>
          {STATUS_LABEL[c.status]?.text}
        </span>
      </div>
      <div className="flex items-start gap-2 text-sm">
        <span className="text-xl">{moodEmoji(c.mood)}</span>
        <div className="flex-1 flex flex-col gap-1">
          {c.questionText && <p className="text-xs text-ink/50">{c.questionText}</p>}
          {editing ? (
            <textarea
              autoFocus
              value={answerDraft}
              onChange={(e) => setAnswerDraft(e.target.value)}
              rows={3}
              className="w-full rounded-xl2 border border-sage-light px-3 py-2 bg-white/70 outline-none focus:border-sage resize-none text-sm"
            />
          ) : (
            c.answer && <p className="text-ink/80">{c.answer}</p>
          )}
        </div>
      </div>

      {isToday && (
        <div className="flex justify-end">
          {editing ? (
            <div className="flex gap-2">
              <button className="text-xs text-ink/50 underline" onClick={() => setEditing(false)}>
                취소
              </button>
              <SpringButton onClick={saveAnswer} disabled={saving} className="text-xs px-3 py-1.5">
                저장
              </SpringButton>
            </div>
          ) : (
            <button className="text-xs text-sage-dark underline" onClick={() => setEditing(true)}>
              오늘 답변 수정
            </button>
          )}
        </div>
      )}

      {c.teacherReply && (
        <div className="flex items-start gap-1.5 bg-peach-light/60 rounded-xl2 px-3 py-2 mt-1">
          <span className="text-sm">🐱</span>
          <p className="text-sm text-ink/80 flex-1">{c.teacherReply}</p>
        </div>
      )}

      {c.teacherReply && (
        <div className="mt-1">
          {c.studentReply && !replying ? (
            <button
              className="flex items-start gap-1.5 bg-sky-light/60 rounded-xl2 px-3 py-2 w-full text-left"
              onClick={() => {
                setReplyDraft(c.studentReply)
                setReplying(true)
              }}
            >
              <span className="text-sm">💬</span>
              <span className="text-sm text-ink/80 flex-1">{c.studentReply}</span>
            </button>
          ) : replying ? (
            <div className="flex gap-2">
              <input
                autoFocus
                value={replyDraft}
                onChange={(e) => setReplyDraft(e.target.value)}
                placeholder="선생님께 답장하기"
                className="flex-1 rounded-xl2 border border-sky-dark/30 px-3 py-1.5 bg-white/70 outline-none focus:border-sky text-sm"
              />
              <SpringButton onClick={sendReply} disabled={sendingReply} className="text-xs px-3 py-1.5">
                보내기
              </SpringButton>
            </div>
          ) : (
            <button className="text-xs text-sky-dark underline" onClick={() => setReplying(true)}>
              답장 보내기
            </button>
          )}
        </div>
      )}
    </Card>
  )
}
