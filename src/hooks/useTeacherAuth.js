import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'

export function useTeacherAuth() {
  const [user, setUser] = useState(undefined) // undefined = 로딩중, null = 미로그인

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      // 학생은 익명 인증을 쓰므로, 이메일이 있는 계정만 "교사"로 취급
      setUser(u && u.email ? u : null)
    })
  }, [])

  return { teacher: user, loading: user === undefined }
}
