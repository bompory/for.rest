import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../../firebase'
import { useFirestoreDoc, useFirestoreQuery } from '../../hooks/useFirestore'
import Card from '../../components/ui/Card'
import SpringButton from '../../components/ui/SpringButton'

const TABS = ['학급 정보', '지각 규칙', '수업일', '질문 관리', '학생 명단']

export default function SettingsPage({ teacher }) {
  const classId = teacher.uid
  const navigate = useNavigate()
  const [tab, setTab] = useState(TABS[0])
  const { data: classDoc } = useFirestoreDoc(['classes', classId])
  const { data: settings } = useFirestoreDoc(['classes', classId, 'settings', 'config'])

  function patchSettings(patch) {
    return setDoc(doc(db, 'classes', classId, 'settings', 'config'), patch, { merge: true })
  }

  function patchClass(patch) {
    return setDoc(doc(db, 'classes', classId), patch, { merge: true })
  }

  return (
    <div className="min-h-screen px-5 py-6 max-w-2xl mx-auto flex flex-col gap-4">
      <button className="text-sm text-ink/60 underline self-start" onClick={() => navigate('/teacher')}>
        ← 대시보드로
      </button>
      <h1 className="font-round text-2xl font-bold">설정</h1>

      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={[
              'px-4 py-2 rounded-xl2 text-sm whitespace-nowrap',
              tab === t ? 'bg-sage text-white' : 'bg-white/70 text-ink/60',
            ].join(' ')}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === '학급 정보' &&
        (!classDoc ? (
          <p className="text-sm text-ink/50">불러오는 중...</p>
        ) : (
          <ClassInfoTab classDoc={classDoc} patchClass={patchClass} />
        ))}

      {tab !== '학급 정보' &&
        (!settings ? (
          <p className="text-sm text-ink/50">불러오는 중...</p>
        ) : (
          <>
            {tab === '지각 규칙' && <LateRulesTab settings={settings} patchSettings={patchSettings} />}
            {tab === '수업일' && <SchoolDaysTab settings={settings} patchSettings={patchSettings} />}
            {tab === '질문 관리' && <QuestionsTab classId={classId} settings={settings} patchSettings={patchSettings} />}
            {tab === '학생 명단' && <StudentsTab classId={classId} />}
          </>
        ))}
    </div>
  )
}

function ClassInfoTab({ classDoc, patchClass }) {
  const [name, setName] = useState(classDoc.name || '')
  const [saved, setSaved] = useState(false)

  async function save() {
    if (!name.trim()) return
    await patchClass({ name: name.trim() })
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <p className="text-sm font-semibold mb-2">학급 이름</p>
        <p className="text-xs text-ink/50 mb-3">예: "3학년 2반" — 대시보드 상단과 학생 화면에 표시돼요.</p>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 3학년 2반"
            className="flex-1 rounded-xl2 border border-sage-light px-3 py-2 bg-white/70 outline-none focus:border-sage text-sm"
          />
          <SpringButton onClick={save} className="text-sm px-4 py-2">
            저장
          </SpringButton>
        </div>
        {saved && <p className="text-xs text-sage-dark mt-2">저장했어요!</p>}
      </Card>

      <Card>
        <p className="text-sm font-semibold mb-1">학급코드 (학생 로그인용)</p>
        <p className="font-round text-2xl text-sage-dark tracking-widest">{classDoc.classCode}</p>
        <p className="text-xs text-ink/50 mt-2">
          학생들이 로그인할 때 이 코드를 입력하거나, 교사 대시보드의 QR코드를 스캔하면 자동으로 입력돼요.
        </p>
      </Card>
    </div>
  )
}

function LateRulesTab({ settings, patchSettings }) {
  const [threshold, setThreshold] = useState(settings.lateThresholdTime || '08:40')
  const [rules, setRules] = useState(settings.lateActionRules || [])
  const [newCount, setNewCount] = useState('')
  const [newAction, setNewAction] = useState('')

  function updateRule(idx, field, value) {
    const next = rules.map((r, i) => (i === idx ? { ...r, [field]: value } : r))
    setRules(next)
  }

  function addRule() {
    if (!newCount || !newAction.trim()) return
    const next = [...rules, { count: Number(newCount), action: newAction.trim() }].sort(
      (a, b) => a.count - b.count,
    )
    setRules(next)
    setNewCount('')
    setNewAction('')
  }

  function removeRule(idx) {
    setRules(rules.filter((_, i) => i !== idx))
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <p className="text-sm font-semibold mb-2">지각 기준 시각</p>
        <div className="flex gap-2 items-center">
          <input
            type="time"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="rounded-xl2 border border-sage-light px-3 py-2 bg-white/70"
          />
          <SpringButton onClick={() => patchSettings({ lateThresholdTime: threshold })} className="text-sm px-4 py-2">
            저장
          </SpringButton>
        </div>
      </Card>

      <Card>
        <p className="text-sm font-semibold mb-2">지각 누적 조치 규칙</p>
        <div className="flex flex-col gap-2 mb-3">
          {rules.map((r, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="number"
                value={r.count}
                onChange={(e) => updateRule(i, 'count', Number(e.target.value))}
                className="w-16 rounded-xl2 border border-sage-light px-2 py-1 text-sm"
              />
              <span className="text-xs text-ink/50">회 →</span>
              <input
                value={r.action}
                onChange={(e) => updateRule(i, 'action', e.target.value)}
                className="flex-1 rounded-xl2 border border-sage-light px-2 py-1 text-sm"
              />
              <button className="text-xs text-ink/40 underline" onClick={() => removeRule(i)}>
                삭제
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 items-center mb-3">
          <input
            type="number"
            placeholder="횟수"
            value={newCount}
            onChange={(e) => setNewCount(e.target.value)}
            className="w-16 rounded-xl2 border border-sage-light px-2 py-1 text-sm"
          />
          <input
            placeholder="조치 내용"
            value={newAction}
            onChange={(e) => setNewAction(e.target.value)}
            className="flex-1 rounded-xl2 border border-sage-light px-2 py-1 text-sm"
          />
          <button className="text-xs text-sage-dark underline" onClick={addRule}>
            추가
          </button>
        </div>
        <SpringButton onClick={() => patchSettings({ lateActionRules: rules })} className="text-sm px-4 py-2">
          규칙 저장
        </SpringButton>
      </Card>

      <Card>
        <p className="text-sm font-semibold mb-2">회복 규칙</p>
        <label className="flex items-center gap-2 text-sm mb-2">
          <input
            type="checkbox"
            checked={!!settings.recoveryEnabled}
            onChange={(e) => patchSettings({ recoveryEnabled: e.target.checked })}
          />
          연속 정시등교 시 지각 카운트 차감 활성화
        </label>
        <div className="flex gap-3 items-center text-sm">
          <span>연속</span>
          <input
            type="number"
            defaultValue={settings.recoveryStreakDays || 5}
            onBlur={(e) => patchSettings({ recoveryStreakDays: Number(e.target.value) })}
            className="w-16 rounded-xl2 border border-sage-light px-2 py-1"
          />
          <span>일마다</span>
          <input
            type="number"
            defaultValue={settings.recoveryDeductCount || 1}
            onBlur={(e) => patchSettings({ recoveryDeductCount: Number(e.target.value) })}
            className="w-16 rounded-xl2 border border-sage-light px-2 py-1"
          />
          <span>회 차감</span>
        </div>
      </Card>
    </div>
  )
}

function SchoolDaysTab({ settings, patchSettings }) {
  const [holiday, setHoliday] = useState('')
  const holidays = settings.holidays || []

  function addHoliday() {
    if (!holiday) return
    patchSettings({ holidays: [...holidays, holiday].sort() })
    setHoliday('')
  }

  function removeHoliday(d) {
    patchSettings({ holidays: holidays.filter((h) => h !== d) })
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.excludeWeekends !== false}
            onChange={(e) => patchSettings({ excludeWeekends: e.target.checked })}
          />
          주말은 자동으로 수업일에서 제외
        </label>
      </Card>
      <Card>
        <p className="text-sm font-semibold mb-2">휴업일 (방학·시험기간 등)</p>
        <div className="flex gap-2 mb-3">
          <input
            type="date"
            value={holiday}
            onChange={(e) => setHoliday(e.target.value)}
            className="rounded-xl2 border border-sage-light px-3 py-2 text-sm"
          />
          <button className="text-sm text-sage-dark underline" onClick={addHoliday}>
            추가
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {holidays.map((h) => (
            <span key={h} className="bg-sky-light rounded-xl2 px-3 py-1 text-xs flex items-center gap-2">
              {h}
              <button className="text-ink/50" onClick={() => removeHoliday(h)}>
                ✕
              </button>
            </span>
          ))}
        </div>
      </Card>
    </div>
  )
}

function QuestionsTab({ classId, settings, patchSettings }) {
  const { items: questions } = useFirestoreQuery(
    () => query(collection(db, 'classes', classId, 'questions'), orderBy('order')),
    [classId],
  )
  const [newQ, setNewQ] = useState('')

  async function addQuestion() {
    if (!newQ.trim()) return
    await addDoc(collection(db, 'classes', classId, 'questions'), {
      text: newQ.trim(),
      order: questions.length,
      isDefault: false,
      isActive: true,
    })
    setNewQ('')
  }

  async function toggleActive(q) {
    await updateDoc(doc(db, 'classes', classId, 'questions', q.id), { isActive: !q.isActive })
  }

  async function removeQuestion(q) {
    await deleteDoc(doc(db, 'classes', classId, 'questions', q.id))
  }

  async function move(q, dir) {
    const idx = questions.findIndex((x) => x.id === q.id)
    const swapIdx = idx + dir
    if (swapIdx < 0 || swapIdx >= questions.length) return
    const other = questions[swapIdx]
    await Promise.all([
      updateDoc(doc(db, 'classes', classId, 'questions', q.id), { order: other.order }),
      updateDoc(doc(db, 'classes', classId, 'questions', other.id), { order: q.order }),
    ])
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <p className="text-sm font-semibold mb-2">오늘의 질문 방식</p>
        <div className="flex gap-2">
          <SpringButton
            variant={settings.questionMode !== 'manual' ? 'sage' : 'outline'}
            className="text-sm px-4 py-2"
            onClick={() => patchSettings({ questionMode: 'auto' })}
          >
            자동 진행
          </SpringButton>
          <SpringButton
            variant={settings.questionMode === 'manual' ? 'sage' : 'outline'}
            className="text-sm px-4 py-2"
            onClick={() => patchSettings({ questionMode: 'manual' })}
          >
            교사가 직접 선택
          </SpringButton>
        </div>
      </Card>

      <Card>
        <p className="text-sm font-semibold mb-2">질문 추가</p>
        <div className="flex gap-2">
          <input
            value={newQ}
            onChange={(e) => setNewQ(e.target.value)}
            placeholder="새 질문 입력"
            className="flex-1 rounded-xl2 border border-sage-light px-3 py-2 text-sm"
          />
          <button className="text-sm text-sage-dark underline" onClick={addQuestion}>
            추가
          </button>
        </div>
      </Card>

      <Card className="max-h-96 overflow-y-auto">
        <p className="text-sm font-semibold mb-2">질문 목록 ({questions.length}개)</p>
        <div className="flex flex-col gap-2">
          {questions.map((q) => (
            <div key={q.id} className="flex items-center gap-2 text-sm border-b border-sage-light/40 pb-2">
              <span className={q.isActive ? '' : 'line-through text-ink/30'}>{q.text}</span>
              <div className="ml-auto flex gap-1 items-center shrink-0">
                <button className="text-xs" onClick={() => move(q, -1)}>↑</button>
                <button className="text-xs" onClick={() => move(q, 1)}>↓</button>
                <button className="text-xs underline" onClick={() => toggleActive(q)}>
                  {q.isActive ? '숨기기' : '보이기'}
                </button>
                <button className="text-xs text-warmOrange underline" onClick={() => removeQuestion(q)}>
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function StudentsTab({ classId }) {
  const { items: students } = useFirestoreQuery(
    () => query(collection(db, 'classes', classId, 'students'), orderBy('order')),
    [classId],
  )
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')

  async function addStudent() {
    if (!name.trim() || pin.length !== 4) return
    await addDoc(collection(db, 'classes', classId, 'students'), {
      name: name.trim(),
      pin,
      order: students.length,
      isActive: true,
      totalStamps: 0,
      lateCountTotal: 0,
      onTimeStreak: 0,
      last7LateFlags: [],
      last7AnswerLengths: [],
      unlockedBadgeIds: [],
    })
    setName('')
    setPin('')
  }

  async function toggleActive(s) {
    await updateDoc(doc(db, 'classes', classId, 'students', s.id), { isActive: !s.isActive })
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <p className="text-sm font-semibold mb-2">학생 추가</p>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름(가명)"
            className="flex-1 rounded-xl2 border border-sage-light px-3 py-2 text-sm"
          />
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="PIN 4자리"
            className="w-24 rounded-xl2 border border-sage-light px-3 py-2 text-sm"
          />
          <button className="text-sm text-sage-dark underline" onClick={addStudent}>
            추가
          </button>
        </div>
      </Card>

      <Card>
        <p className="text-sm font-semibold mb-2">학생 명단 ({students.length}명)</p>
        <div className="flex flex-col gap-2">
          {students.map((s) => (
            <div key={s.id} className="flex items-center justify-between text-sm border-b border-sage-light/40 pb-2">
              <span className={s.isActive ? '' : 'line-through text-ink/30'}>{s.name}</span>
              <button className="text-xs underline" onClick={() => toggleActive(s)}>
                {s.isActive ? '비활성(전학)' : '다시 활성화'}
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
