import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'

const STORAGE_KEY = 'johoe.studentSession'

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const StudentSessionContext = createContext(null)

// 로그인 화면(자식 컴포넌트)에서 login()을 호출한 결과가 App.jsx 등 다른 곳의
// 라우팅 판단에도 즉시 반영되도록, 세션 상태를 컴포넌트마다 따로 두지 않고
// 이 Provider 하나에서만 관리하고 Context로 공유한다.
export function StudentSessionProvider({ children }) {
  const [session, setSession] = useState(readStored)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setAuthReady(!!u)
    })
  }, [])

  const login = useCallback(async ({ classId, classCode, studentId, studentName }) => {
    if (!auth.currentUser) {
      await signInAnonymously(auth)
    }
    const next = { classId, classCode, studentId, studentName }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setSession(next)
    return next
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setSession(null)
  }, [])

  // 이미 저장된 세션이 있는데 익명 인증이 아직이면 다시 걸어준다 (앱 재설치/스토리지 초기화 등 대비)
  useEffect(() => {
    if (session && !auth.currentUser) {
      signInAnonymously(auth).catch(() => {})
    }
  }, [session])

  const value = useMemo(() => ({ session, authReady, login, logout }), [session, authReady, login, logout])

  return <StudentSessionContext.Provider value={value}>{children}</StudentSessionContext.Provider>
}

export function useStudentSession() {
  const ctx = useContext(StudentSessionContext)
  if (!ctx) {
    throw new Error('useStudentSession은 StudentSessionProvider 안에서만 사용할 수 있어요.')
  }
  return ctx
}
