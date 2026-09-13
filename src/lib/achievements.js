// 도감의 "업적" 목록. 학생 문서의 누적 통계만으로 판정하는 순수 함수라서
// 새 컬렉션/스키마 변경 없이도 동작한다 (attendance.js/checkinFlow.js에서 채우는
// totalOnTimeDays, totalAnswers, bestOnTimeStreak, recoveryCount, unlockedBadgeIds 사용).
export const ACHIEVEMENTS = [
  {
    id: 'first_checkin',
    icon: '👣',
    label: '첫 발걸음',
    description: '처음으로 정시 등교했어요',
    isUnlocked: (s) => (s.totalOnTimeDays || 0) >= 1,
  },
  {
    id: 'streak_3',
    icon: '🔥',
    label: '리듬 탔어요',
    description: '3일 연속 정시 등교',
    isUnlocked: (s) => (s.bestOnTimeStreak || 0) >= 3,
  },
  {
    id: 'streak_5',
    icon: '🌟',
    label: '아침형 인간',
    description: '5일 연속 정시 등교',
    isUnlocked: (s) => (s.bestOnTimeStreak || 0) >= 5,
  },
  {
    id: 'ontime_20',
    icon: '🏅',
    label: '개근왕',
    description: '누적 정시 등교 20일',
    isUnlocked: (s) => (s.totalOnTimeDays || 0) >= 20,
  },
  {
    id: 'first_answer',
    icon: '✏️',
    label: '첫 이야기',
    description: '처음으로 1일1질문에 답했어요',
    isUnlocked: (s) => (s.totalAnswers || 0) >= 1,
  },
  {
    id: 'answers_10',
    icon: '📖',
    label: '이야기꾼',
    description: '1일1질문 10번 작성',
    isUnlocked: (s) => (s.totalAnswers || 0) >= 10,
  },
  {
    id: 'answers_30',
    icon: '🖋️',
    label: '글쓰기 장인',
    description: '1일1질문 30번 작성',
    isUnlocked: (s) => (s.totalAnswers || 0) >= 30,
  },
  {
    id: 'recovery',
    icon: '🔁',
    label: '다시 일어나기',
    description: '연속 정시등교로 지각 횟수를 회복한 적이 있어요',
    isUnlocked: (s) => (s.recoveryCount || 0) >= 1,
  },
  {
    id: 'collection_master',
    icon: '🏆',
    label: '도감 마스터',
    description: '모든 캐릭터를 도감에 등록했어요',
    isUnlocked: (s, badgeCatalog) =>
      badgeCatalog.length > 0 && (s.unlockedBadgeIds || []).length >= badgeCatalog.length,
  },
]

export function resolveAchievements(student, badgeCatalog = []) {
  return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: a.isUnlocked(student, badgeCatalog) }))
}
