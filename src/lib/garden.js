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

// 학급 인원 1명이 "한 판"(정시 등교 STAMPS_PER_STAGE회) 채우는 걸 기준으로 한 단계 성장한다고 본다.
// 나중에 실제 성장 단계(새싹→꽃→나무)를 붙일 때 이 숫자만 조정하면 된다.
export const STAMPS_PER_STAGE_PER_STUDENT = 5

/** 공동 스탬프 개수와 학급 인원수로 "다음 성장까지 몇 개 남았는지" 계산한다. */
export function computeGardenStage(gardenStamps = 0, classSize = 1) {
  const size = Math.max(1, classSize || 1)
  const stageThreshold = size * STAMPS_PER_STAGE_PER_STUDENT
  const stage = Math.floor(gardenStamps / stageThreshold)
  const progress = gardenStamps % stageThreshold
  const remaining = stageThreshold - progress
  return { stage, stageThreshold, progress, remaining }
}
