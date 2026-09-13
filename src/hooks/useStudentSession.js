import { useCallback, useEffect, useState } from 'react'
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

export function useStudentSession() {
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

  return { session, authReady, login, logout }
}
