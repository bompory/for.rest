export const CREATURE_SPECIES = [
  'rabbit', 'fox', 'bear', 'cat', 'dog', 'squirrel',
  'panda', 'owl', 'penguin', 'otter', 'hedgehog', 'deer',
]

/** 기본 배지 카탈로그 (설정에서 조정 가능하도록 Firestore에 저장, 이 값은 시드/초기화용) */
export function defaultBadgeCatalog() {
  return CREATURE_SPECIES.map((speciesKey, i) => ({
    id: speciesKey,
    speciesKey,
    order: i,
    requiredStamps: (i + 1) * 3, // 3, 6, 9 ... 36
  }))
}

export function computeEarnedStamps({ attendanceOnTime, hasAnswer }) {
  let stamps = 0
  if (attendanceOnTime) stamps += 1
  if (hasAnswer) stamps += 1
  return stamps
}

/** 새 totalStamps 기준으로 새로 해금된 배지 id 목록 반환 */
export function resolveNewlyUnlocked(totalStamps, alreadyUnlocked, badgeCatalog) {
  const unlockedSet = new Set(alreadyUnlocked || [])
  const newly = []
  for (const badge of badgeCatalog) {
    if (!unlockedSet.has(badge.id) && totalStamps >= badge.requiredStamps) {
      newly.push(badge.id)
    }
  }
  return newly
}
