import { doc, getDocFromServer, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { isAfterThreshold, toDateId } from './dateUtils'

export const STATUS = {
  ON_TIME: 'onTime',
  LATE: 'late',
  SICK: 'sick',
  FIELD_TRIP: 'fieldTrip',
  EARLY_LEAVE: 'earlyLeave',
  UNCHECKED: 'unchecked',
}

// 지각 누적 카운트에서 제외되는 상태
const LATE_COUNT_EXCLUDED = new Set([STATUS.SICK, STATUS.FIELD_TRIP, STATUS.EARLY_LEAVE])

/**
 * 학생 셀프 체크인: serverTimestamp로 문서를 먼저 쓰고, 서버에서 강제로 재조회해
 * 실제 서버 시각을 확보한 뒤에야 onTime/late를 확정한다. 기기 시계는 어디에서도 사용하지 않는다.
 */
export async function submitSelfCheckin({ classId, studentId, lateThresholdTime }) {
  // dateId는 아직 모르므로, 클라이언트 대략 날짜로 우선 문서를 만들고
  // 서버 재조회 후 실제 날짜가 다르면(자정 근처 등) 문서를 옮겨 쓴다.
  const provisionalDateId = toDateId(new Date())
  const provisionalId = `${provisionalDateId}_${studentId}`
  const provisionalRef = doc(db, 'classes', classId, 'checkins', provisionalId)

  await setDoc(
    provisionalRef,
    {
      studentId,
      checkedAt: serverTimestamp(),
      checkedBy: 'self',
      status: STATUS.UNCHECKED,
    },
    { merge: true },
  )

  const serverSnap = await getDocFromServer(provisionalRef)
  const serverCheckedAt = serverSnap.data().checkedAt
  const realDateId = toDateId(serverCheckedAt)

  const late = isAfterThreshold(serverCheckedAt, lateThresholdTime)
  const status = late ? STATUS.LATE : STATUS.ON_TIME

  if (realDateId === provisionalDateId) {
    await updateDoc(provisionalRef, { date: realDateId, status })
    return { checkinId: provisionalId, dateId: realDateId, status, checkedAt: serverCheckedAt }
  }

  // 자정 근처 edge case: 서버가 확정한 날짜가 달랐다면 올바른 문서로 옮긴다.
  const realId = `${realDateId}_${studentId}`
  const realRef = doc(db, 'classes', classId, 'checkins', realId)
  await setDoc(realRef, {
    studentId,
    date: realDateId,
    checkedAt: serverCheckedAt,
    checkedBy: 'self',
    status,
  })
  return { checkinId: realId, dateId: realDateId, status, checkedAt: serverCheckedAt }
}

/** 교사가 미체크 학생을 대신 체크: 상태를 직접 지정 (serverTimestamp는 여전히 기록만 함) */
export async function teacherSetCheckin({ classId, studentId, dateId, status }) {
  const id = `${dateId}_${studentId}`
  const ref = doc(db, 'classes', classId, 'checkins', id)
  await setDoc(
    ref,
    {
      studentId,
      date: dateId,
      status,
      checkedAt: serverTimestamp(),
      checkedBy: 'teacher',
    },
    { merge: true },
  )
  return id
}

export function isLateCountable(status) {
  return status === STATUS.LATE
}

export function isExcludedFromLateCount(status) {
  return LATE_COUNT_EXCLUDED.has(status)
}

/** 지각 조치 규칙 중 현재 누적 횟수에 해당하는 가장 높은 단계를 찾는다 */
export function matchActionRule(lateCountTotal, lateActionRules = []) {
  const applicable = lateActionRules
    .filter((rule) => rule.count <= lateCountTotal)
    .sort((a, b) => b.count - a.count)
  return applicable[0] || null
}

/**
 * 체크인 하나가 확정된 후 student 문서의 비정규화 필드를 갱신할 값을 계산한다.
 * (호출부에서 runTransaction으로 학생 문서에 반영)
 */
export function computeStudentRollupUpdate(prevStudent, { status, answerLength = 0 }, settings) {
  const excluded = isExcludedFromLateCount(status)
  const late = isLateCountable(status)
  const onTime = status === STATUS.ON_TIME

  let lateCountTotal = prevStudent.lateCountTotal || 0
  let onTimeStreak = prevStudent.onTimeStreak || 0

  if (late) {
    lateCountTotal += 1
    onTimeStreak = 0
  } else if (onTime) {
    onTimeStreak += 1
    if (settings?.recoveryEnabled && onTimeStreak >= (settings.recoveryStreakDays || 5)) {
      lateCountTotal = Math.max(0, lateCountTotal - (settings.recoveryDeductCount || 1))
      onTimeStreak = 0
    }
  } else if (!excluded) {
    onTimeStreak = 0
  }

  const last7LateFlags = [...(prevStudent.last7LateFlags || []), late].slice(-7)
  const last7AnswerLengths = [...(prevStudent.last7AnswerLengths || []), answerLength].slice(-7)

  return { lateCountTotal, onTimeStreak, last7LateFlags, last7AnswerLengths }
}

/**
 * "신경 쓸 학생" 후보 판정. 단정하지 않고 "확인해 보세요" 수준의 플래그만 반환.
 */
export function detectWatchFlags(student) {
  const flags = []
  const lateFlags = student.last7LateFlags || []
  if (lateFlags.length >= 4) {
    const recent = lateFlags.slice(-3)
    const earlier = lateFlags.slice(-6, -3)
    const recentLateCount = recent.filter(Boolean).length
    const earlierLateCount = earlier.filter(Boolean).length
    if (recentLateCount >= 2 && recentLateCount > earlierLateCount) {
      flags.push({ type: 'lateIncrease', label: '최근 지각이 늘었어요. 확인해 보세요.' })
    }
  }

  const lengths = (student.last7AnswerLengths || []).filter((n) => n > 0)
  if (lengths.length >= 4) {
    const recent = lengths.slice(-2)
    const earlier = lengths.slice(0, -2)
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length
    if (earlierAvg > 0 && recentAvg < earlierAvg * 0.5) {
      flags.push({ type: 'shortAnswers', label: '요즘 답변이 짧아졌어요. 확인해 보세요.' })
    }
  }

  return flags
}
