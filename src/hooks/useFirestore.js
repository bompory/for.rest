import { useEffect, useState } from 'react'
import { doc, onSnapshot, query } from 'firebase/firestore'
import { db } from '../firebase'

/** 실시간 문서 구독. pathSegments가 falsy를 포함하면 구독하지 않는다. */
export function useFirestoreDoc(pathSegments) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const ready = pathSegments && pathSegments.every(Boolean)
  const key = ready ? pathSegments.join('/') : null

  useEffect(() => {
    if (!ready) {
      setData(null)
      setLoading(false)
      return
    }
    setLoading(true)
    const ref = doc(db, ...pathSegments)
    const unsub = onSnapshot(ref, (snap) => {
      setData(snap.exists() ? { id: snap.id, ...snap.data() } : null)
      setLoading(false)
    })
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { data, loading }
}

/** 실시간 쿼리 구독. queryFactory()가 null을 리턴하면 구독하지 않는다. */
export function useFirestoreQuery(queryFactory, deps = []) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = queryFactory()
    if (!q) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    const unsub = onSnapshot(query(q), (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { items, loading }
}
