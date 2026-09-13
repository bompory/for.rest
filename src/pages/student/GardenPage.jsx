import { useEffect, useState } from 'react'
import { useFirestoreDoc } from '../../hooks/useFirestore'
import { computeGardenProgress, GARDEN_STAGES } from '../../lib/garden'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import ParticleBurst from '../../components/ui/ParticleBurst'
import stickerAnswer from '../../assets/sticker-answer.png'

/**
 * 우리 반 정원 — 학급 공동 스탬프(gardenStamps)가 쌓일수록 8단계로 자라나는 정원.
 * 단계가 올라가도 화면 전체가 바뀌지 않도록, 이전 단계에서 그려진 요소들은 그대로 두고
 * 새 단계의 요소만 추가로 겹쳐 그린다(SceneLayers의 각 조건부 블록 참고).
 */
export default function GardenPage({ session }) {
  const { classId } = session
  const { data: classDoc } = useFirestoreDoc(['classes', classId])

  const gardenStamps = classDoc?.gardenStamps || 0
  const targetStamps = classDoc?.gardenTargetStamps
  const { stageIndex, stage, nextThreshold, remaining, target } = computeGardenProgress(
    gardenStamps,
    targetStamps,
  )
  const isComplete = stageIndex === GARDEN_STAGES.length - 1

  const [celebrating, setCelebrating] = useState(false)

  useEffect(() => {
    if (!classId || classDoc == null) return
    const storageKey = `johoe.gardenSeenStage.${classId}`
    const seenRaw = localStorage.getItem(storageKey)

    if (seenRaw === null) {
      // 처음 방문 시엔 지금까지 쌓인 단계를 축하하지 않고 조용히 기준선만 저장한다.
      localStorage.setItem(storageKey, String(stageIndex))
      return
    }

    const seen = Number(seenRaw)
    if (stageIndex > seen) {
      setCelebrating(true)
      localStorage.setItem(storageKey, String(stageIndex))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, classDoc, stageIndex])

  return (
    <div className="px-5 pt-8 pb-4 flex flex-col gap-4">
      <h1 className="font-round text-xl font-bold text-center">우리 반 정원</h1>
      <p className="text-sm text-ink/60 text-center -mt-2">우리 모두의 출석으로 정원을 키워요!</p>

      <Card className="flex items-center justify-center p-4">
        <GardenScene stageIndex={stageIndex} />
      </Card>

      <Card className="flex flex-col items-center gap-1">
        <p className="text-xs text-ink/50">우리 반 공동 스탬프</p>
        <p className="text-3xl font-round font-bold text-sage-dark">{gardenStamps}개</p>
        <p className="text-xs text-ink/60 mt-1">
          지금 단계: <span className="font-semibold text-sage-dark">{stage.label}</span>
        </p>
        {isComplete ? (
          <p className="text-[11px] text-warmOrange mt-1 font-semibold">정원을 완성했어요! 🎉</p>
        ) : (
          <p className="text-[11px] text-ink/50 mt-1">
            다음 성장까지 <span className="font-semibold text-warmOrange">{remaining}개</span> 남았어요
            ({gardenStamps}/{nextThreshold}, 목표 {target}개)
          </p>
        )}
      </Card>

      <Modal open={celebrating} onClose={() => setCelebrating(false)}>
        <div className="relative flex flex-col items-center gap-3 py-2">
          <ParticleBurst active={celebrating} big />
          <img src={stickerAnswer} alt="" className="w-28 h-28 object-contain" />
          <p className="font-round text-lg font-bold text-center text-sage-dark">
            우리 반 정원이 자랐어요!
          </p>
          <p className="text-sm text-ink/60 text-center">
            이제 정원에 &apos;{stage.label}&apos;(이)가 생겼어요.
          </p>
          <button
            className="text-sm text-ink/50 underline mt-1"
            onClick={() => setCelebrating(false)}
          >
            정원 보러가기
          </button>
        </div>
      </Modal>
    </div>
  )
}

function GardenScene({ stageIndex }) {
  const has = (key) => stageIndex >= GARDEN_STAGES.findIndex((s) => s.key === key)

  return (
    <svg viewBox="0 0 320 220" className="w-full max-w-sm h-auto">
      {/* 하늘 (항상 표시) */}
      <rect x="0" y="0" width="320" height="150" rx="20" fill="#DCEFF6" />
      <circle cx="264" cy="46" r="22" fill="#FBE0C6" />
      <circle cx="264" cy="46" r="14" fill="#F2994A" opacity="0.5" />
      <g fill="#FFFFFF" opacity="0.8">
        <ellipse cx="70" cy="45" rx="26" ry="12" />
        <ellipse cx="92" cy="40" rx="18" ry="10" />
        <ellipse cx="50" cy="40" rx="16" ry="9" />
      </g>

      {/* 완성 단계: 무지개 (다른 요소 뒤에 먼저 그려서 가려지지 않게) */}
      {has('complete') && (
        <path
          d="M20 150 A140 140 0 0 1 300 150"
          fill="none"
          stroke="url(#rainbow)"
          strokeWidth="8"
          opacity="0.55"
        />
      )}
      <defs>
        <linearGradient id="rainbow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F2994A" />
          <stop offset="50%" stopColor="#A8C9A1" />
          <stop offset="100%" stopColor="#AFD8E8" />
        </linearGradient>
      </defs>

      {/* 흙밭 (항상 표시) */}
      <rect x="0" y="140" width="320" height="80" rx="20" fill="#D7E8D3" />
      <path d="M0 150 Q80 165 160 150 T320 150 V220 H0 Z" fill="#C9996B" opacity="0.55" />
      <g fill="#9C6F45" opacity="0.5">
        <circle cx="60" cy="185" r="3" />
        <circle cx="110" cy="200" r="2.5" />
        <circle cx="160" cy="180" r="3" />
        <circle cx="210" cy="198" r="2.5" />
        <circle cx="255" cy="182" r="3" />
        <circle cx="30" cy="205" r="2" />
        <circle cx="285" cy="205" r="2.5" />
      </g>

      {/* 나무 (10%) — 뒤쪽에 먼저 그려서 꽃/새싹에 가려지지 않게 */}
      {has('tree1') && (
        <g>
          <rect x="242" y="150" width="8" height="30" rx="3" fill="#9C6F45" />
          <circle cx="246" cy="142" r="20" fill="#A8C9A1" />
          <circle cx="234" cy="150" r="14" fill="#BBDCB4" />
          <circle cx="258" cy="150" r="14" fill="#BBDCB4" />
        </g>
      )}

      {/* 연못 (70%) */}
      {has('pond') && (
        <g>
          <ellipse cx="60" cy="196" rx="38" ry="16" fill="#AFD8E8" />
          <ellipse cx="60" cy="196" rx="38" ry="16" fill="#FFFFFF" opacity="0.15" />
          <ellipse cx="48" cy="192" rx="10" ry="4" fill="#FFFFFF" opacity="0.5" />
        </g>
      )}

      {/* 풍성해진 꽃밭/무성한 정원 (20%, 35%) — 배경 덤불 */}
      {has('flowers2') && (
        <g>
          <circle cx="105" cy="188" r="10" fill="#BBDCB4" />
          <circle cx="205" cy="192" r="9" fill="#BBDCB4" />
        </g>
      )}
      {has('lush') && (
        <g>
          <circle cx="145" cy="182" r="8" fill="#A8C9A1" />
          <circle cx="190" cy="178" r="7" fill="#A8C9A1" />
          <circle cx="80" cy="178" r="7" fill="#A8C9A1" />
        </g>
      )}

      {/* 새싹 (0%, 기본 상태) */}
      {has('sprout') && (
        <g>
          <path d="M160 190 Q160 170 160 160" stroke="#7FAF6E" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M160 172 Q150 165 146 156" stroke="#7FAF6E" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M160 178 Q170 170 174 160" stroke="#7FAF6E" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      )}

      {/* 꽃 한 송이 (5%) */}
      {has('flower1') && <Flower x={160} y={155} color="#F2994A" />}

      {/* 꽃이 더 많아짐 (20%) */}
      {has('flowers2') && (
        <>
          <Flower x={112} y={182} color="#F7C7A3" scale={0.85} />
          <Flower x={200} y={185} color="#AFD8E8" scale={0.8} />
        </>
      )}

      {/* 무성한 정원 (35%) — 꽃 더 추가 */}
      {has('lush') && (
        <>
          <Flower x={85} y={172} color="#F2994A" scale={0.7} />
          <Flower x={190} y={168} color="#F7C7A3" scale={0.75} />
        </>
      )}

      {/* 나비와 새 (50%) */}
      {has('wildlife') && (
        <g>
          <g transform="translate(120,110)">
            <path d="M0 0 C-8 -8 -8 4 0 6 C8 4 8 -8 0 0 Z" fill="#F2994A" opacity="0.85" />
            <path d="M0 0 C8 -8 8 4 0 6 C-8 4 -8 -8 0 0 Z" fill="#F7C7A3" opacity="0.85" transform="scale(-1,1)" />
            <circle cx="0" cy="0" r="1.5" fill="#5B4A3F" />
          </g>
          <g transform="translate(225,95)">
            <ellipse cx="0" cy="0" rx="9" ry="7" fill="#A8C9A1" />
            <circle cx="8" cy="-3" r="4" fill="#A8C9A1" />
            <path d="M12 -4 L18 -2 L12 0 Z" fill="#F2994A" />
            <circle cx="9" cy="-4" r="0.8" fill="#5B4A3F" />
          </g>
        </g>
      )}

      {/* 완성된 정원 (100%) — 화환 장식 + 마무리 꽃 */}
      {has('complete') && (
        <>
          <Flower x={140} y={195} color="#AFD8E8" scale={0.6} />
          <Flower x={235} y={172} color="#F2994A" scale={0.6} />
          <g fill="#F7C7A3" opacity="0.9">
            <polygon points="30,32 40,32 35,44" />
            <polygon points="45,28 55,28 50,40" />
            <polygon points="60,32 70,32 65,44" />
          </g>
          <line x1="30" y1="32" x2="70" y2="32" stroke="#D9A467" strokeWidth="2" />
        </>
      )}
    </svg>
  )
}

function Flower({ x, y, color, scale = 1 }) {
  return (
    <g transform={`translate(${x},${y}) scale(${scale})`}>
      <line x1="0" y1="0" x2="0" y2="18" stroke="#7FAF6E" strokeWidth="2.5" strokeLinecap="round" />
      <g>
        <circle cx="0" cy="-10" r="5" fill={color} />
        <circle cx="-7" cy="-4" r="5" fill={color} />
        <circle cx="7" cy="-4" r="5" fill={color} />
        <circle cx="-4" cy="-16" r="5" fill={color} />
        <circle cx="4" cy="-16" r="5" fill={color} />
        <circle cx="0" cy="-9" r="4" fill="#FDE9C8" />
      </g>
    </g>
  )
}
