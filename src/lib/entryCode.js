import { doc, runTransaction } from 'firebase/firestore'
import { db } from '../firebase'
import { toDateId } from './dateUtils'

function randomEntryCode() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

/** 교사 대시보드가 열릴 때, 오늘 날짜로 코드가 아직 회전 안 됐으면 새로 발급 */
export async function ensureTodayEntryCode(classId) {
  const ref = doc(db, 'classes', classId)
  const today = toDateId(new Date())
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    const data = snap.data() || {}
    if (data.todayEntryCodeDate === today && data.todayEntryCode) {
      return { code: data.todayEntryCode, date: today }
    }
    const code = randomEntryCode()
    tx.set(ref, { todayEntryCode: code, todayEntryCodeDate: today }, { merge: true })
    return { code, date: today }
  })
}
