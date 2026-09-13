import { AnimatePresence, motion } from 'framer-motion'
import { marked } from 'marked'

/**
 * 이용약관/개인정보처리방침처럼 긴 텍스트를 보여주는 팝업.
 * 본문 영역만 스크롤되고(제목/닫기 버튼은 고정), 닫기는 스크롤 여부와 상관없이 항상 가능하다.
 * 본문은 마크다운 초안 파일을 그대로 렌더링한다.
 */
export default function LegalModal({ open, onClose, title, markdown }) {
  const html = marked.parse(markdown, { breaks: true })

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/30 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-cream rounded-xl3 shadow-soft w-full max-w-2xl border border-sage-light flex flex-col max-h-[85vh]"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-sage-light/60 shrink-0">
              <h2 className="font-round text-lg font-bold text-ink">{title}</h2>
              <button
                onClick={onClose}
                aria-label="닫기"
                className="text-ink/50 hover:text-ink text-xl leading-none px-2 py-1"
              >
                ✕
              </button>
            </div>
            <div
              className="legal-content overflow-y-auto px-6 py-4 text-sm text-ink/80 leading-relaxed"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
