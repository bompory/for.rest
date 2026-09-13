import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'
import { useStudentSession } from '../../hooks/useStudentSession'
import Modal from '../../components/ui/Modal'
import SpringButton from '../../components/ui/SpringButton'
import { pickMessage } from '../../lib/messages'
import LegalFooter from '../../components/legal/LegalFooter'

const TABS = [
  { to: 'checkin', label: '체크인', icon: '🏠' },
  { to: 'records', label: '내 기록', icon: '📔' },
  { to: 'collection', label: '도감', icon: '🐾' },
  { to: 'garden', label: '정원', icon: '🌱' },
]

export default function StudentShell({ session }) {
  const [sosOpen, setSosOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const { logout } = useStudentSession()
  const navigate = useNavigate()

  function handleSwitchStudent() {
    if (!window.confirm(`${session.studentName}(으)로 로그인 중이에요. 로그아웃하고 다른 이름으로 들어갈까요?`)) return
    logout()
    navigate('/login/student')
  }

  async function submitHelpRequest() {
    setBusy(true)
    try {
      await addDoc(collection(db, 'classes', session.classId, 'helpRequests'), {
        studentId: session.studentId,
        studentName: session.studentName,
        reason: reason.trim() || null,
        status: 'pending',
        createdAt: serverTimestamp(),
      })
      setSent(true)
    } finally {
      setBusy(false)
    }
  }

  function closeSos() {
    setSosOpen(false)
    setTimeout(() => {
      setSent(false)
      setReason('')
    }, 300)
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <div className="flex justify-between items-center px-4 pt-3 text-xs text-ink/50">
        <span>{session.studentName}로 로그인됨</span>
        <button className="underline" onClick={handleSwitchStudent}>
          내가 아니에요 (로그아웃)
        </button>
      </div>
      <div className="flex-1 overflow-y-auto pb-24">
        <Outlet />
        <LegalFooter />
      </div>

      <button
        onClick={() => setSosOpen(true)}
        className="fixed right-4 bottom-24 z-30 w-14 h-14 rounded-full bg-warmOrange text-white text-2xl shadow-soft flex items-center justify-center active:scale-90 transition-transform"
        aria-label="상담 요청"
      >
        🆘
      </button>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-sage-light flex justify-around py-2 z-20">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              [
                'flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl2 text-xs font-body',
                isActive ? 'text-sage-dark font-semibold' : 'text-ink/50',
              ].join(' ')
            }
          >
            <span className="text-xl">{tab.icon}</span>
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Modal open={sosOpen} onClose={closeSos} title={sent ? undefined : '무슨 일인지 안 써도 돼'}>
        {!sent ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-ink/70">
              선생님한테 알려줄게. 이유는 안 적어도 괜찮아 — 적고 싶으면 적어줘.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="(선택) 무슨 일인지 적어줘"
              rows={3}
              className="rounded-xl2 border border-sage-light px-3 py-2 bg-white/70 outline-none focus:border-sage resize-none"
            />
            <SpringButton variant="orange" fullWidth onClick={submitHelpRequest} disabled={busy}>
              선생님께 알리기
            </SpringButton>
            <button className="text-xs text-ink/60 underline" onClick={closeSos}>
              그냥 닫기
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center py-2">
            <span className="text-3xl">🌱</span>
            <p className="font-body text-ink">{pickMessage('helpAck')}</p>
            <SpringButton fullWidth onClick={closeSos}>
              닫기
            </SpringButton>
          </div>
        )}
      </Modal>
    </div>
  )
}
