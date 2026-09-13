import { arrayUnion, collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { db } from '../firebase'
import { toMonthId } from './dateUtils'

/** 그날 활성 학생 전원이 정시 등교했으면 학급 공동 정원에 꽃을 추가한다. */
export async function checkAndUpdateGarden(classId, dateId) {
  const studentsSnap = await getDocs(
    query(collection(db, 'classes', classId, 'students'), where('isActive', '==', true)),
  )
  const activeIds = studentsSnap.docs.map((d) => d.id)
  if (activeIds.length === 0) return false

  const checkinsSnap = await getDocs(
    query(collection(db, 'classes', classId, 'checkins'), where('date', '==', dateId)),
  )
  const onTimeIds = new Set(
    checkinsSnap.docs.filter((d) => d.data().status === 'onTime').map((d) => d.data().studentId),
  )

  const allOnTime = activeIds.every((id) => onTimeIds.has(id))
  if (!allOnTime) return false

  const monthId = toMonthId(new Date(`${dateId}T00:00:00+09:00`))
  const gardenRef = doc(db, 'classes', classId, 'garden', monthId)
  const existing = await getDoc(gardenRef)
  if (existing.exists() && (existing.data().flowerDates || []).includes(dateId)) return true

  await setDoc(gardenRef, { flowerDates: arrayUnion(dateId) }, { merge: true })
  return true
}

export const DEFAULT_GARDEN_TARGET = 1000

// 각 단계는 "목표 스탬프 수"의 비율로 정해진다 — 교사가 목표를 바꾸면 단계 기준도 같이 움직인다.
// (기본 목표 1000개 기준: 0 / 50 / 100 / 200 / 350 / 500 / 700 / 1000)
export const GARDEN_STAGES = [
  { percent: 0, key: 'sprout', label: '새싹' },
  { percent: 0.05, key: 'flower1', label: '꽃 한 송이' },
  { percent: 0.1, key: 'tree1', label: '작은 나무' },
  { percent: 0.2, key: 'flowers2', label: '풍성해진 꽃밭' },
  { percent: 0.35, key: 'lush', label: '무성한 정원' },
  { percent: 0.5, key: 'wildlife', label: '나비와 새' },
  { percent: 0.7, key: 'pond', label: '작은 연못' },
  { percent: 1, key: 'complete', label: '완성된 정원' },
]

/** 공동 스탬프 개수와 목표치로 현재 단계 / 다음 단계까지 남은 스탬프를 계산한다. */
export function computeGardenProgress(gardenStamps = 0, targetStamps = DEFAULT_GARDEN_TARGET) {
  const target = Math.max(1, targetStamps || DEFAULT_GARDEN_TARGET)

  let stageIndex = 0
  for (let i = GARDEN_STAGES.length - 1; i >= 0; i--) {
    if (gardenStamps >= GARDEN_STAGES[i].percent * target) {
      stageIndex = i
      break
    }
  }

  const stage = GARDEN_STAGES[stageIndex]
  const nextStage = GARDEN_STAGES[stageIndex + 1] || null
  const nextThreshold = nextStage ? Math.round(nextStage.percent * target) : null
  const remaining = nextThreshold != null ? Math.max(0, nextThreshold - gardenStamps) : 0

  return { stageIndex, stage, nextStage, nextThreshold, remaining, target }
}
