import { collection, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase'
import { useFirestoreDoc, useFirestoreQuery } from '../../hooks/useFirestore'
import { toMonthId } from '../../lib/dateUtils'
import Card from '../../components/ui/Card'
import Creature from '../../components/creatures/CreatureSvgs'

export default function CollectionPage({ session }) {
  const { classId, studentId } = session
  const { data: student } = useFirestoreDoc(['classes', classId, 'students', studentId])
  const { items: badges } = useFirestoreQuery(
    () => query(collection(db, 'classes', classId, 'badges'), orderBy('order')),
    [classId],
  )
  const { data: garden } = useFirestoreDoc(['classes', classId, 'garden', toMonthId(new Date())])

  const unlocked = new Set(student?.unlockedBadgeIds || [])
  const flowerCount = garden?.flowerDates?.length || 0

  return (
    <div className="px-5 pt-8 pb-4 flex flex-col gap-4">
      <h1 className="font-round text-xl font-bold text-center">도감</h1>

      <Card className="flex flex-col items-center gap-2">
        <p className="text-sm font-semibold">우리 반 공동 정원</p>
        <p className="text-3xl">{'🌸'.repeat(Math.min(flowerCount, 10)) || '🌱'}</p>
        <p className="text-xs text-ink/60">이번 달 전원 정시등교 {flowerCount}일째</p>
      </Card>

      <Card>
        <p className="text-sm font-semibold mb-1">내 스탬프</p>
        <p className="text-2xl font-round text-sage-dark">{student?.totalStamps || 0}개</p>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        {badges.map((b) => {
          const isUnlocked = unlocked.has(b.id)
          return (
            <Card key={b.id} className="flex flex-col items-center gap-1 p-3">
              <Creature species={b.speciesKey} size={64} locked={!isUnlocked} />
              <span className="text-[11px] text-ink/60">
                {isUnlocked ? '해금 완료' : `스탬프 ${b.requiredStamps}개`}
              </span>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
