import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import { computeStudentRollupUpdate } from './attendance'
import { computeEarnedStamps, resolveNewlyUnlocked } from './stamps'

/** 오늘의 질문 문서가 없으면(자동 모드) 순환 방식으로 하나 골라 생성한다. */
export async function ensureDailyQuestion(classId, dateId) {
  const dailyRef = doc(db, 'classes', classId, 'dailyQuestion', dateId)
  const settingsRef = doc(db, 'classes', classId, 'settings', 'config')
  // 순환 인덱스는 settings(교사 전용 쓰기)가 아니라 dailyQuestion 컬렉션 안에 별도로 둔다.
  // 이 함수는 학생 클라이언트에서도 호출되는데, 학생은 settings에 쓸 권한이 없기 때문.
  const autoIndexRef = doc(db, 'classes', classId, 'dailyQuestion', '_autoIndex')

  return runTransaction(db, async (tx) => {
    const dailySnap = await tx.get(dailyRef)
    if (dailySnap.exists()) return dailySnap.data()

    const settingsSnap = await tx.get(settingsRef)
    const settings = settingsSnap.data() || {}
    if (settings.questionMode === 'manual') {
      // 교사가 아직 오늘의 질문을 지정하지 않음
      return null
    }

    const qSnap = await getDocs(
      query(
        collection(db, 'classes', classId, 'questions'),
        where('isActive', '==', true),
        orderBy('order'),
      ),
    )
    const questions = qSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
    if (questions.length === 0) return null

    const autoIndexSnap = await tx.get(autoIndexRef)
    const currentIndex = autoIndexSnap.data()?.value || 0
    const idx = currentIndex % questions.length
    const chosen = questions[idx]

    tx.set(dailyRef, { questionId: chosen.id, mode: 'auto' })
    tx.set(autoIndexRef, { value: idx + 1 })

    return { questionId: chosen.id, mode: 'auto' }
  })
}

/**
 * 기분/답변 제출(또는 건너뛰기). 그날 처음 완료될 때만 스탬프·지각 롤업 필드를 반영하고,
 * 이후 같은 날 수정은 내용만 갱신한다 (중복 적립 방지).
 */
export async function finalizeCheckin({ classId, studentId, dateId, mood, answer, questionId, questionText }) {
  const checkinRef = doc(db, 'classes', classId, 'checkins', `${dateId}_${studentId}`)
  const studentRef = doc(db, 'classes', classId, 'students', studentId)
  const settingsRef = doc(db, 'classes', classId, 'settings', 'config')
  const badgesSnap = await getDocs(collection(db, 'classes', classId, 'badges'))
  const badgeCatalog = badgesSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

  return runTransaction(db, async (tx) => {
    const checkinSnap = await tx.get(checkinRef)
    if (!checkinSnap.exists()) throw new Error('출결 체크가 먼저 필요해요.')
    const checkin = checkinSnap.data()

    const answerText = answer && answer.trim() ? answer.trim() : null

    if (checkin.rollupApplied) {
      tx.update(checkinRef, {
        mood,
        answer: answerText,
        answerUpdatedAt: serverTimestamp(),
        questionId: questionId || checkin.questionId || null,
        questionText: questionText || checkin.questionText || null,
      })
      return { newlyUnlocked: [] }
    }

    const studentSnap = await tx.get(studentRef)
    const student = studentSnap.data() || {}
    const settingsSnap = await tx.get(settingsRef)
    const settings = settingsSnap.data() || {}

    const attendanceStamp = checkin.status === 'onTime'
    const answerStamp = !!answerText
    const earned = computeEarnedStamps({ attendanceOnTime: attendanceStamp, hasAnswer: answerStamp })

    const rollup = computeStudentRollupUpdate(
      student,
      { status: checkin.status, answerLength: answerText ? answerText.length : 0 },
      settings,
    )

    const totalStamps = (student.totalStamps || 0) + earned
    const totalAnswers = (student.totalAnswers || 0) + (answerStamp ? 1 : 0)
    const newlyUnlocked = resolveNewlyUnlocked(totalStamps, student.unlockedBadgeIds, badgeCatalog)
    const unlockedBadgeIds = [...(student.unlockedBadgeIds || []), ...newlyUnlocked]

    tx.set(
      studentRef,
      { ...rollup, totalStamps, totalAnswers, unlockedBadgeIds },
      { merge: true },
    )

    tx.update(checkinRef, {
      mood,
      answer: answerText,
      answerUpdatedAt: serverTimestamp(),
      questionId: questionId || checkin.questionId || null,
      questionText: questionText || checkin.questionText || null,
      rollupApplied: true,
      stamps: { attendance: attendanceStamp, answer: answerStamp },
    })

    return { newlyUnlocked }
  })
}

/** 학생이 교사의 답장에 다시 답장을 남긴다 (날짜 제한 없이 언제든 가능). */
export async function replyToTeacher({ classId, studentId, dateId, text }) {
  const checkinRef = doc(db, 'classes', classId, 'checkins', `${dateId}_${studentId}`)
  await updateDoc(checkinRef, {
    studentReply: text.trim() || null,
    studentReplyAt: serverTimestamp(),
  })
}
