import { collection, deleteDoc, doc, getDocs, query, where, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * 학생을 완전히 삭제한다: 학생 문서 자체뿐 아니라 그 학생의 체크인 기록(답변·기분·교사 답장
 * 포함), 비공개 메모, 상담 요청까지 함께 지운다. "명단에서만 지워지고 기록은 남는" 예전
 * 동작과 달리, 삭제 요청 시 실제로 관련 개인정보가 전부 제거된다.
 */
export async function deleteStudentCompletely(classId, studentId) {
  const refsToDelete = []

  const checkinsSnap = await getDocs(
    query(collection(db, 'classes', classId, 'checkins'), where('studentId', '==', studentId)),
  )
  refsToDelete.push(...checkinsSnap.docs.map((d) => d.ref))

  const helpRequestsSnap = await getDocs(
    query(collection(db, 'classes', classId, 'helpRequests'), where('studentId', '==', studentId)),
  )
  refsToDelete.push(...helpRequestsSnap.docs.map((d) => d.ref))

  const notesSnap = await getDocs(collection(db, 'classes', classId, 'students', studentId, 'notes'))
  refsToDelete.push(...notesSnap.docs.map((d) => d.ref))

  const studentRef = doc(db, 'classes', classId, 'students', studentId)

  // 배치 하나당 최대 500개 쓰기 제한이 있어 여유 있게 400개씩 나눠서 지운다.
  const CHUNK_SIZE = 400
  for (let i = 0; i < refsToDelete.length; i += CHUNK_SIZE) {
    const batch = writeBatch(db)
    for (const ref of refsToDelete.slice(i, i + CHUNK_SIZE)) {
      batch.delete(ref)
    }
    await batch.commit()
  }

  await deleteDoc(studentRef)
}
