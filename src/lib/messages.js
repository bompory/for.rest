// 상황별 멘트 풀. 동물의 숲 주민 톤 — 다정하고 장난스럽게. 지각도 혼내지 않고 궁금해하는 톤.
const POOLS = {
  onTime: (name) => [
    `${name}이 오늘도 일찍 왔네, 고생했다-!`,
    `오늘도 즐거운 날이 펼쳐질 것 같아~`,
    `${name} 왔구나! 오늘 하루도 잘 부탁해!`,
    `정시 등교 성공! 스탬프 하나 챙겨가~`,
    `일찍 온 ${name}한테 아침 인사 한 스푼!`,
    `좋아 좋아, 딱 맞춰 왔네!`,
  ],
  late: (name) => [
    `오늘은 조금 늦었구나. 무슨 일 있었어?`,
    `${name}, 괜찮아? 늦잠 잤어도 이렇게 온 게 어디야.`,
    `조금 늦었지만 와줘서 고마워!`,
    `무슨 일 있었는지 궁금하네. 나중에 얘기해줄래?`,
    `오늘 아침 바빴나봐~ 다음엔 살짝 더 서둘러볼까?`,
  ],
  streak3: (name) => [
    `${name}, 3일 연속이야! 리듬 탔는걸-!`,
    `사흘째 일찍 오다니, 대단한걸!`,
  ],
  streak5: (name) => [
    `와, 벌써 5일째 일찍 왔어! 대단한걸-!`,
    `${name} 완전 아침형 인간 되어가는 중!`,
    `5일 연속 정시 등교, 박수 짝짝짝!`,
  ],
  comeback: (name) => [
    `${name}, 오랜만이야! 보고 싶었잖아~`,
    `다시 만나서 반가워! 그동안 잘 지냈어?`,
  ],
  badgeUnlock: (name) => [
    `우와! 새로운 친구가 도감에 등록됐어!`,
    `${name} 덕분에 새 캐릭터가 나타났어!`,
    `짜잔! 도감이 한 칸 더 채워졌어!`,
  ],
  moodLow: (name) => [
    `${name}, 오늘 기분이 조금 가라앉아 보이네. 괜찮아?`,
    `힘든 날도 있는 거지. 옆에 있을게.`,
  ],
  helpAck: () => [
    `선생님이 확인했어.`,
  ],
  gardenFlower: () => [
    `오늘 모두가 정시 등교! 꽃이 한 송이 피었어~`,
    `학급 정원에 꽃이 새로 피었어요!`,
  ],
  answerSkip: (name) => [
    `오늘은 패스! 다음에 얘기해줘도 괜찮아~`,
    `${name}, 마음 내킬 때 다시 써도 돼.`,
  ],
}

export function pickMessage(situation, name = '') {
  const pool = POOLS[situation]
  if (!pool) return ''
  const options = pool(name)
  return options[Math.floor(Math.random() * options.length)]
}

export const MOODS = [
  { key: 'joy', emoji: '😄', label: '신나요', value: 5 },
  { key: 'good', emoji: '🙂', label: '좋아요', value: 4 },
  { key: 'okay', emoji: '😐', label: '보통이에요', value: 3 },
  { key: 'down', emoji: '😔', label: '시무룩해요', value: 2 },
  { key: 'hard', emoji: '😢', label: '힘들어요', value: 1 },
]
