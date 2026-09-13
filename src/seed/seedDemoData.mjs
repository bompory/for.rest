// 데모용 더미데이터 생성 스크립트 (firebase-admin 사용, Node에서 직접 실행)
// 교사 로그인이 구글 로그인이라 Admin SDK로 임의의 교사 계정을 만들 수 없습니다.
// 그래서 먼저 앱에서 실제로 구글 로그인을 한 번 한 뒤, 그 UID를 이 스크립트에 넘겨줍니다.
//
//   1) Firebase 콘솔 > 프로젝트 설정 > 서비스 계정 > "새 비공개 키 생성"으로 JSON 다운로드
//   2) 프로젝트 루트에 serviceAccountKey.json 으로 저장 (.gitignore에 이미 포함됨)
//   3) npm run dev로 앱을 열어 "교사로 로그인"에서 구글 로그인을 한 번 완료
//      (학급 문서가 자동 생성됨)
//   4) Firebase 콘솔 > Authentication > Users 탭에서 방금 로그인한 계정의 UID 복사
//   5) SEED_CLASS_ID=<복사한 UID> npm run seed
//
// 실행하면 그 교사 계정의 학급에 학생 23명, 최근 30일(주말 제외 평일)치 체크인 기록을
// 만들어줍니다. 로그인 후 화면에서 바로 확인해보세요.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import admin from 'firebase-admin'
import { defaultQuestionBank } from './questions.js'
import { DEMO_STUDENT_NAMES } from './names.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const serviceAccountPath = join(__dirname, '..', '..', 'serviceAccountKey.json')

let serviceAccount
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))
} catch {
  console.error(
    `serviceAccountKey.json을 찾을 수 없어요.\n` +
      `Firebase 콘솔 > 프로젝트 설정 > 서비스 계정 > "새 비공개 키 생성"으로 받은 파일을\n` +
      `${serviceAccountPath} 경로에 저장해주세요.`,
  )
  process.exit(1)
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const auth = admin.auth()
const db = admin.firestore()
const { Timestamp, FieldValue } = admin.firestore

const CLASS_CODE = 'DEMO1'
const LATE_THRESHOLD = '08:40'
const CREATURE_SPECIES = [
  'rabbit', 'fox', 'bear', 'cat', 'dog', 'squirrel',
  'panda', 'owl', 'penguin', 'otter', 'hedgehog', 'deer',
]

const FILLER_SENTENCES = [
  '오늘은 날씨가 맑아서 기분이 좋았다. 학교 오는 길에 새 소리를 들었다.',
  '어제 친구랑 놀이터에서 축구를 했는데 진짜 재밌었다. 다음에도 또 하고 싶다.',
  '요즘 잠을 좀 늦게 자서 피곤하지만 그래도 학교는 즐겁다.',
  '아침에 늦잠을 잤는데 엄마가 깨워줘서 겨우 나왔다. 조금 서둘렀다.',
  '주말에 가족이랑 나들이 갔던 게 생각나서 기분이 좋아졌다.',
  '오늘 급식 메뉴가 마음에 들어서 아침부터 기대됐다.',
]

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick(arr) {
  return arr[randomInt(0, arr.length - 1)]
}

function fourDigitPin(seed) {
  return String(1000 + (seed * 137) % 9000).padStart(4, '0').slice(0, 4)
}

function toDateId(date) {
  return date.toISOString().slice(0, 10)
}

function isWeekend(date) {
  const day = date.getUTCDay()
  return day === 0 || day === 6
}

function buildAnswer(targetLength) {
  if (targetLength <= 0) return null
  let text = pick(FILLER_SENTENCES)
  while (text.length < targetLength) text += ' ' + pick(FILLER_SENTENCES)
  return text.slice(0, targetLength)
}

function defaultBadgeCatalog() {
  return CREATURE_SPECIES.map((speciesKey, i) => ({
    id: speciesKey,
    speciesKey,
    order: i,
    requiredStamps: (i + 1) * 3,
  }))
}

async function main() {
  const classId = process.argv[2] || process.env.SEED_CLASS_ID
  if (!classId) {
    console.error(
      '교사 계정의 UID가 필요해요.\n' +
        '1) npm run dev로 앱을 열어 "교사로 로그인"에서 구글 로그인을 한 번 완료하세요.\n' +
        '2) Firebase 콘솔 > Authentication > Users 탭에서 그 계정의 UID를 복사하세요.\n' +
        '3) SEED_CLASS_ID=<복사한 UID> npm run seed 로 다시 실행하세요.',
    )
    process.exit(1)
  }

  let teacherUser
  try {
    teacherUser = await auth.getUser(classId)
  } catch {
    console.error(
      `해당 UID(${classId})의 Firebase Auth 계정을 찾을 수 없어요. ` +
        '앱에서 구글 로그인을 먼저 한 번 완료했는지 확인해주세요.',
    )
    process.exit(1)
  }
  console.log(`대상 교사 계정: ${teacherUser.email} (uid=${classId})`)

  const classRef = db.collection('classes').doc(classId)
  const existingClassSnap = await classRef.get()
  const classCode = existingClassSnap.data()?.classCode || CLASS_CODE

  console.log(`학급 문서 작성 중... (classId=${classId})`)
  await classRef.set(
    {
      name: existingClassSnap.data()?.name || '조회조회 데모반',
      classCode,
      teacherUid: classId,
      todayEntryCode: String(randomInt(1000, 9999)),
      todayEntryCodeDate: toDateId(new Date()),
      createdAt: existingClassSnap.data()?.createdAt || FieldValue.serverTimestamp(),
    },
    { merge: true },
  )

  const settings = {
    lateThresholdTime: LATE_THRESHOLD,
    lateActionRules: [
      { count: 1, action: '교실 청소' },
      { count: 3, action: '좋은 글 필사' },
      { count: 5, action: '삶에 대한 글쓰기' },
    ],
    recoveryEnabled: true,
    recoveryStreakDays: 5,
    recoveryDeductCount: 1,
    excludeWeekends: true,
    holidays: [],
    questionMode: 'auto',
    questionAutoIndex: 0,
  }
  await classRef.collection('settings').doc('config').set(settings, { merge: true })

  console.log('기본 질문 100개 작성 중...')
  const questions = defaultQuestionBank()
  const questionBatch = db.batch()
  const questionIds = []
  questions.forEach((text, i) => {
    const id = `q${i + 1}`
    questionIds.push(id)
    questionBatch.set(classRef.collection('questions').doc(id), {
      text,
      order: i,
      isDefault: true,
      isActive: true,
    })
  })
  await questionBatch.commit()

  console.log('도감 배지 카탈로그 작성 중...')
  const badges = defaultBadgeCatalog()
  const badgeBatch = db.batch()
  badges.forEach((b) => badgeBatch.set(classRef.collection('badges').doc(b.id), b))
  await badgeBatch.commit()

  console.log('학생 23명 생성 중...')
  const students = DEMO_STUDENT_NAMES.map((name, i) => ({
    id: `s${i + 1}`,
    name,
    pin: fourDigitPin(i + 1),
    order: i,
  }))
  const INCREASING_LATE_ID = students[0].id // '하늘'
  const SHRINKING_ANSWER_ID = students[1].id // '보라'

  const studentBatch = db.batch()
  students.forEach((s) => {
    studentBatch.set(classRef.collection('students').doc(s.id), {
      name: s.name,
      pin: s.pin,
      order: s.order,
      isActive: true,
      totalStamps: 0,
      lateCountTotal: 0,
      onTimeStreak: 0,
      last7LateFlags: [],
      last7AnswerLengths: [],
      unlockedBadgeIds: [],
      createdAt: FieldValue.serverTimestamp(),
    })
  })
  await studentBatch.commit()

  console.log('최근 30일 체크인 기록 생성 중 (평일만)...')
  const today = new Date()
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  const schoolDays = []
  for (let i = 29; i >= 1; i--) {
    const d = new Date(todayUtc)
    d.setUTCDate(d.getUTCDate() - i)
    if (!isWeekend(d)) schoolDays.push(d)
  }

  // 학생별 누적 상태 (트랜잭션 없이 순차 계산 후 최종 상태를 한 번에 저장)
  const rollup = {}
  students.forEach((s) => {
    rollup[s.id] = {
      totalStamps: 0,
      lateCountTotal: 0,
      onTimeStreak: 0,
      last7LateFlags: [],
      last7AnswerLengths: [],
      unlockedBadgeIds: [],
    }
  })

  const gardenByMonth = {} // monthId -> Set(dateId)
  let checkinBatch = db.batch()
  let opsInBatch = 0

  async function flushBatchIfNeeded() {
    opsInBatch++
    if (opsInBatch >= 400) {
      await checkinBatch.commit()
      checkinBatch = db.batch()
      opsInBatch = 0
    }
  }

  for (let dayIdx = 0; dayIdx < schoolDays.length; dayIdx++) {
    const date = schoolDays[dayIdx]
    const dateId = toDateId(date)
    const progress = dayIdx / Math.max(1, schoolDays.length - 1) // 0(과거) → 1(오늘)
    const onTimeStudentIds = new Set()

    for (const s of students) {
      const r = rollup[s.id]

      // 상태 결정
      let status
      if (s.id === INCREASING_LATE_ID) {
        const lateChance = 0.1 + progress * 0.65 // 갈수록 지각 확률 증가
        status = Math.random() < lateChance ? 'late' : 'onTime'
      } else {
        const roll = Math.random()
        if (roll < 0.06) status = pick(['sick', 'fieldTrip'])
        else if (roll < 0.18) status = 'late'
        else status = 'onTime'
      }

      // 답변 길이 결정
      let answerLength
      if (s.id === SHRINKING_ANSWER_ID) {
        answerLength = Math.round(90 - progress * 75) // 90자 → 15자
      } else {
        answerLength = Math.random() < 0.15 ? 0 : randomInt(20, 70)
      }
      const answered = answerLength > 0 && Math.random() > 0.05
      const answer = answered ? buildAnswer(answerLength) : null

      const moodPool = ['joy', 'good', 'okay', 'down', 'hard']
      const mood = status === 'unchecked' ? null : pick(moodPool)

      // 체크 시각 (지각 기준 08:40 근처로 분산)
      const hour = status === 'late' ? randomInt(8, 9) : 7
      const minute = status === 'late' ? randomInt(41, 59) : randomInt(10, 39)
      const checkedAt = new Date(Date.UTC(
        date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
        hour - 9, minute, // UTC 저장 (KST -9시간)
      ))

      const isLate = status === 'late'
      const isExcluded = status === 'sick' || status === 'fieldTrip' || status === 'earlyLeave'
      const isOnTime = status === 'onTime'

      if (isOnTime) onTimeStudentIds.add(s.id)

      if (isLate) {
        r.lateCountTotal += 1
        r.onTimeStreak = 0
      } else if (isOnTime) {
        r.onTimeStreak += 1
        if (settings.recoveryEnabled && r.onTimeStreak >= settings.recoveryStreakDays) {
          r.lateCountTotal = Math.max(0, r.lateCountTotal - settings.recoveryDeductCount)
          r.onTimeStreak = 0
        }
      } else if (!isExcluded) {
        r.onTimeStreak = 0
      }

      r.last7LateFlags = [...r.last7LateFlags, isLate].slice(-7)
      r.last7AnswerLengths = [...r.last7AnswerLengths, answer ? answer.length : 0].slice(-7)

      const attendanceStamp = isOnTime
      const answerStamp = !!answer
      r.totalStamps += (attendanceStamp ? 1 : 0) + (answerStamp ? 1 : 0)

      const badgeCatalog = badges
      const newlyUnlocked = badgeCatalog
        .filter((b) => !r.unlockedBadgeIds.includes(b.id) && r.totalStamps >= b.requiredStamps)
        .map((b) => b.id)
      r.unlockedBadgeIds = [...r.unlockedBadgeIds, ...newlyUnlocked]

      const questionId = questionIds[dayIdx % questionIds.length]

      checkinBatch.set(classRef.collection('checkins').doc(`${dateId}_${s.id}`), {
        studentId: s.id,
        date: dateId,
        status,
        checkedAt: status === 'unchecked' ? null : Timestamp.fromDate(checkedAt),
        checkedBy: 'self',
        mood,
        answer,
        answerUpdatedAt: answer ? Timestamp.fromDate(checkedAt) : null,
        questionId,
        rollupApplied: true,
        stamps: { attendance: attendanceStamp, answer: answerStamp },
      })
      await flushBatchIfNeeded()
    }

    if (onTimeStudentIds.size === students.length) {
      const monthId = dateId.slice(0, 7)
      if (!gardenByMonth[monthId]) gardenByMonth[monthId] = new Set()
      gardenByMonth[monthId].add(dateId)
    }
  }

  await checkinBatch.commit()

  console.log('학생 누적 지표(스탬프/지각/도감) 반영 중...')
  const finalizeBatch = db.batch()
  students.forEach((s) => {
    const r = rollup[s.id]
    finalizeBatch.set(
      classRef.collection('students').doc(s.id),
      {
        totalStamps: r.totalStamps,
        lateCountTotal: r.lateCountTotal,
        onTimeStreak: r.onTimeStreak,
        last7LateFlags: r.last7LateFlags,
        last7AnswerLengths: r.last7AnswerLengths,
        unlockedBadgeIds: r.unlockedBadgeIds,
      },
      { merge: true },
    )
  })
  await finalizeBatch.commit()

  console.log('학급 공동 정원 반영 중...')
  const gardenBatch = db.batch()
  Object.entries(gardenByMonth).forEach(([monthId, dateSet]) => {
    gardenBatch.set(
      classRef.collection('garden').doc(monthId),
      { flowerDates: FieldValue.arrayUnion(...dateSet) },
      { merge: true },
    )
  })
  if (Object.keys(gardenByMonth).length > 0) await gardenBatch.commit()

  console.log('\n완료!')
  console.log('──────────────────────────────')
  console.log(`교사 로그인: 구글 계정 ${teacherUser.email} (이미 로그인해두신 그대로 사용)`)
  console.log(`학급코드(학생용): ${classCode}`)
  console.log(`학생 이름/PIN 예시: ${students[0].name} / ${students[0].pin}`)
  console.log(`  → 지각이 점점 느는 학생: ${students[0].name}`)
  console.log(`  → 답변이 점점 짧아지는 학생: ${students[1].name}`)
  console.log('──────────────────────────────')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
