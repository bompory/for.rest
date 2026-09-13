import { collection, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase'
import { useFirestoreDoc, useFirestoreQuery } from '../../hooks/useFirestore'
import { toMonthId } from '../../lib/dateUtils'
import { resolveAchievements } from '../../lib/achievements'
import { BADGE_TIERS } from '../../lib/stamps'
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
  const achievements = student ? resolveAchievements(student, badges) : []

  return (
    <div className="px-5 pt-8 pb-4 flex flex-col gap-4">
      <h1 className="font-round text-xl font-bold text-center">출석 도감</h1>
      <p className="text-sm text-ink/60 text-center -mt-2">
        출석하며 귀여운 동물 친구들을 모아보세요! ({unlocked.size}/{badges.length || 30})
      </p>

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
          const tierMeta = BADGE_TIERS[b.tier] || BADGE_TIERS.common
          return (
            <Card key={b.id} className="flex flex-col items-center gap-1 p-3">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${tierMeta.color}`}>
                {tierMeta.label}
              </span>
              <Creature creatureId={b.id} size={64} locked={!isUnlocked} />
              <span className="text-xs font-semibold">{isUnlocked ? b.name : '???'}</span>
              {isUnlocked ? (
                <span className="text-[10px] text-ink/50 text-center leading-snug">{b.personality}</span>
              ) : (
                <span className="text-[11px] text-ink/60">스탬프 {b.requiredStamps}개</span>
              )}
            </Card>
          )
        })}
      </div>

      <p className="font-round text-lg font-bold text-center mt-2">업적</p>
      <div className="grid grid-cols-3 gap-3">
        {achievements.map((a) => (
          <Card
            key={a.id}
            className={`flex flex-col items-center gap-1 p-3 ${a.unlocked ? '' : 'opacity-40 grayscale'}`}
          >
            <span className="text-3xl">{a.icon}</span>
            <span className="text-xs font-semibold text-center">{a.label}</span>
            <span className="text-[10px] text-ink/50 text-center">{a.description}</span>
          </Card>
        ))}
      </div>
    </div>
  )
}
