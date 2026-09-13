import { doc, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'

export const BADGE_TIERS = {
  common: { label: '일반', color: 'bg-ink/10 text-ink/60' },
  advanced: { label: '고급', color: 'bg-sage-light text-sage-dark' },
  rare: { label: '희귀', color: 'bg-sky-light text-sky-dark' },
  special: { label: '특별', color: 'bg-peach-light text-warmOrange' },
  legendary: { label: '전설', color: 'bg-warmOrange text-white' },
}

// 출석 도감 캐릭터 30종 — 이름/등급/성격은 학생 개인 스탬프(totalStamps)로만 해금되며
// 우리 반 공동 정원(gardenStamps)과는 완전히 별개로 동작한다.
export const CREATURE_CATALOG = [
  { id: 'cat', name: '고양이', tier: 'common', personality: '언제나 호기심 가득한 우리 반의 마스코트!', requiredStamps: 3 },
  { id: 'rabbit', name: '토끼', tier: 'common', personality: '당근을 좋아하는 순수한 토끼예요.', requiredStamps: 6 },
  { id: 'bear', name: '곰', tier: 'common', personality: '늘 든든하고 다정한 친구!', requiredStamps: 9 },
  { id: 'chick', name: '병아리', tier: 'common', personality: '작지만 에너지가 넘치는 우리 반의 햇살!', requiredStamps: 12 },
  { id: 'penguin', name: '펭귄', tier: 'advanced', personality: '언제나 해맑은 긍정 에너지!', requiredStamps: 34 },
  { id: 'dog', name: '강아지', tier: 'common', personality: '사람을 좋아하는 순둥이 친구!', requiredStamps: 16 },
  { id: 'fox', name: '여우', tier: 'advanced', personality: '똑똑하고 장난기 많은 꼬마 여우!', requiredStamps: 40 },
  { id: 'cat_mackerel', name: '고등어냥', tier: 'advanced', personality: '조용하지만 은근히 다정해요.', requiredStamps: 46 },
  { id: 'sheep', name: '양', tier: 'advanced', personality: '따뜻한 마음을 가진 착한 양!', requiredStamps: 52 },
  { id: 'frog', name: '개구리', tier: 'advanced', personality: '언제나 밝고 행복한 개구리!', requiredStamps: 58 },
  { id: 'squirrel', name: '다람쥐', tier: 'advanced', personality: '맛있는 걸 좋아하는 먹보 다람쥐!', requiredStamps: 64 },
  { id: 'penguin_navy', name: '펭귄(남색)', tier: 'rare', personality: '조금 낯을 가리지만 사랑스러운 펭귄!', requiredStamps: 96 },
  { id: 'panda', name: '판다', tier: 'advanced', personality: '느긋하고 평화로운 판다!', requiredStamps: 70 },
  { id: 'cat_cheese', name: '치즈냥', tier: 'rare', personality: '낮잠을 좋아하는 꿈꾸는 고양이!', requiredStamps: 105 },
  { id: 'cat_mystery', name: '묘르', tier: 'rare', personality: '궁금한 게 많은 호기심 천재!', requiredStamps: 114 },
  { id: 'tiger', name: '호랑이', tier: 'advanced', personality: '용감하고 씩씩한 호랑이!', requiredStamps: 76 },
  { id: 'pig', name: '돼지', tier: 'common', personality: '먹고, 놀고, 행복한 돼지!', requiredStamps: 20 },
  { id: 'koala', name: '코알라', tier: 'rare', personality: '조용하지만 따뜻한 코알라!', requiredStamps: 123 },
  { id: 'penguin_hat', name: '펭귄(모자)', tier: 'special', personality: '모자 쓴 패셔니스타 펭귄!', requiredStamps: 175 },
  { id: 'hamster', name: '햄스터', tier: 'common', personality: '와글와글 귀여운 행복이!', requiredStamps: 24 },
  { id: 'wolf', name: '늑대', tier: 'rare', personality: '조금 까칠하지만 마음은 따뜻해요.', requiredStamps: 132 },
  { id: 'cat_calico', name: '삼색냥', tier: 'advanced', personality: '세 가지 매력을 가진 삼색냥!', requiredStamps: 82 },
  { id: 'bear_bubbletea', name: '곰(버블티)', tier: 'rare', personality: '달달한 버블티가 최고야!', requiredStamps: 141 },
  { id: 'duck', name: '오리', tier: 'common', personality: '언제나 씩씩한 오리!', requiredStamps: 28 },
  { id: 'deer', name: '사슴', tier: 'advanced', personality: '순하고 따뜻한 숲의 친구!', requiredStamps: 88 },
  { id: 'cat_black', name: '검은고양이', tier: 'rare', personality: '겉은 차가워도 속은 따뜻해요.', requiredStamps: 150 },
  { id: 'elephant', name: '코끼리', tier: 'special', personality: '착하고 든든한 우리 반의 지킴이!', requiredStamps: 195 },
  { id: 'rabbit_star', name: '토끼(별)', tier: 'legendary', personality: '별을 좋아하는 행운의 토끼!', requiredStamps: 250 },
  { id: 'alpaca', name: '알파카', tier: 'rare', personality: '느긋하고 귀여운 힐링 알파카!', requiredStamps: 160 },
  { id: 'cat_yellow', name: '노란고양이', tier: 'special', personality: '언제나 밝은 행운의 고양이!', requiredStamps: 215 },
]

// 이전 12종 카탈로그에서 이번 30종 개편으로 빠진 id들 — 남아있으면 도감에 유령 항목으로 보이므로 정리한다.
const LEGACY_BADGE_IDS = ['owl', 'otter', 'hedgehog']

/** 기본 배지 카탈로그 (Firestore에 저장, 이 값은 시드/동기화용) */
export function defaultBadgeCatalog() {
  return CREATURE_CATALOG.map((entry, i) => ({
    ...entry,
    speciesKey: entry.id,
    order: i,
  }))
}

/** 학급의 badges 컬렉션을 최신 30종 카탈로그로 맞춘다 (교사 권한으로만 쓰기 가능). */
export async function ensureBadgeCatalogSynced(classId) {
  const batch = writeBatch(db)
  defaultBadgeCatalog().forEach((entry) => {
    batch.set(doc(db, 'classes', classId, 'badges', entry.id), entry)
  })
  LEGACY_BADGE_IDS.forEach((id) => {
    batch.delete(doc(db, 'classes', classId, 'badges', id))
  })
  await batch.commit()
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
