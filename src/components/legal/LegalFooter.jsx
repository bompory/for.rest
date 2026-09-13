import { useState } from 'react'
import LegalModal from './LegalModal'
import termsText from '../../../legal/이용약관_초안.md?raw'
import privacyText from '../../../legal/개인정보처리방침_초안.md?raw'

/**
 * 로그인 전/후 화면 공통 하단 표기. 이용약관·개인정보처리방침 팝업 링크와
 * 저작권/책임자 표기를 함께 보여준다. (초안 단계 — [확인 필요] 항목이 남아있는 동안은
 * 실제 서비스에 배포하지 않는다.)
 */
// 초안에 [확인 필요] 플레이스홀더가 남아있는 동안은 실제 사용자 화면에 노출하지 않는다.
// 운영주체/문의처 등 확인이 끝나면 이 스위치를 true로 바꿔서 다시 노출한다.
const READY_TO_SHOW = false

export default function LegalFooter({ className = '' }) {
  const [open, setOpen] = useState(null) // 'terms' | 'privacy' | null

  if (!READY_TO_SHOW) return null

  return (
    <footer className={`text-center text-[11px] text-ink/40 py-4 ${className}`}>
      <div className="flex items-center justify-center gap-2">
        <button className="underline" onClick={() => setOpen('terms')}>
          이용약관
        </button>
        <span>|</span>
        <button className="underline" onClick={() => setOpen('privacy')}>
          개인정보처리방침
        </button>
      </div>
      <p className="mt-1">
        © 2026 조회조회 · 개인정보책임자: [확인 필요] · 문의: [확인 필요]
      </p>

      <LegalModal
        open={open === 'terms'}
        onClose={() => setOpen(null)}
        title="이용약관 (초안)"
        markdown={termsText}
      />
      <LegalModal
        open={open === 'privacy'}
        onClose={() => setOpen(null)}
        title="개인정보처리방침 (초안)"
        markdown={privacyText}
      />
    </footer>
  )
}
