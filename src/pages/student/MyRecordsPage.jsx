import { useMemo } from 'react'
import { collection, limit, orderBy, query, where } from 'firebase/firestore'
import { db } from '../../firebase'
import { useFirestoreQuery } from '../../hooks/useFirestore'
import { MOODS } from '../../lib/messages'
import { formatKoreanDate } from '../../lib/dateUtils'
import Card from '../../components/ui/Card'
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
          <Card key={c.id} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">{formatKoreanDate(c.date)}</span>
              <span className={`text-xs font-semibold ${STATUS_LABEL[c.status]?.color}`}>
                {STATUS_LABEL[c.status]?.text}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-xl">{moodEmoji(c.mood)}</span>
              {c.answer && <p className="text-ink/80 flex-1">{c.answer}</p>}
            </div>
          </Card>
        ))}
        {!loading && checkins.length === 0 && (
          <p className="text-center text-sm text-ink/50 mt-6">아직 기록이 없어요. 오늘 첫 체크인을 해볼까?</p>
        )}
      </div>
    </div>
  )
}
