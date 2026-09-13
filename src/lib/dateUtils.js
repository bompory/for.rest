// 기기 타임존 설정과 무관하게 항상 KST(+09:00 고정 오프셋)로 계산한다.
const KST_OFFSET_MS = 9 * 60 * 60 * 1000

/** JS Date 또는 Firestore Timestamp를 받아 KST 기준 {y,m,d,hh,mm} 필드로 분해 */
export function toKstParts(input) {
  const date = input?.toDate ? input.toDate() : input instanceof Date ? input : new Date(input)
  const kstMs = date.getTime() + KST_OFFSET_MS
  const kst = new Date(kstMs)
  return {
    y: kst.getUTCFullYear(),
    m: kst.getUTCMonth() + 1,
    d: kst.getUTCDate(),
    hh: kst.getUTCHours(),
    mm: kst.getUTCMinutes(),
    weekday: kst.getUTCDay(), // 0=일 ... 6=토
  }
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

/** "YYYY-MM-DD" (KST 기준) */
export function toDateId(input) {
  const { y, m, d } = toKstParts(input)
  return `${y}-${pad2(m)}-${pad2(d)}`
}

/** "YYYY-MM" (KST 기준) */
export function toMonthId(input) {
  const { y, m } = toKstParts(input)
  return `${y}-${pad2(m)}`
}

/** "HH:mm" (KST 기준) */
export function toTimeLabel(input) {
  const { hh, mm } = toKstParts(input)
  return `${pad2(hh)}:${pad2(mm)}`
}

/** dateId, thresholdTime("08:40") 두 값을 받아 그 시각을 넘겼는지 비교 */
export function isAfterThreshold(input, thresholdTime) {
  const { hh, mm } = toKstParts(input)
  const [th, tm] = thresholdTime.split(':').map(Number)
  return hh * 60 + mm > th * 60 + tm
}

export function isWeekend(input) {
  const { weekday } = toKstParts(input)
  return weekday === 0 || weekday === 6
}

/** 오늘(서버에서 파생된 시각 기준)부터 거슬러 올라가며 수업일인지 판단 */
export function isSchoolDay(dateId, { excludeWeekends = true, holidays = [] } = {}) {
  if (holidays.includes(dateId)) return false
  if (excludeWeekends) {
    const [y, m, d] = dateId.split('-').map(Number)
    const utcNoon = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
    if (isWeekend(utcNoon)) return false
  }
  return true
}

export function formatKoreanDate(dateId) {
  const [y, m, d] = dateId.split('-').map(Number)
  return `${y}년 ${m}월 ${d}일`
}

export function addDaysToDateId(dateId, delta) {
  const [y, m, d] = dateId.split('-').map(Number)
  const base = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
  base.setUTCDate(base.getUTCDate() + delta)
  return `${base.getUTCFullYear()}-${pad2(base.getUTCMonth() + 1)}-${pad2(base.getUTCDate())}`
}
