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
