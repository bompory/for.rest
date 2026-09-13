import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { doc, setDoc } from 'firebase/firestore'
import { db, storage } from '../firebase'

export const MASCOT_SLOTS = [
  { key: 'stickerOnTime', field: 'stickerOnTimeUrl', label: '정상출석 스티커' },
  { key: 'stickerLate', field: 'stickerLateUrl', label: '지각 스티커' },
  { key: 'stickerAnswer', field: 'stickerAnswerUrl', label: '질문 답변 완료 스티커' },
]

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

/** 교사가 스티커 이미지를 업로드하면 Storage에 저장하고, 그 다운로드 URL을 학급 문서에 반영한다. */
export async function uploadMascotImage(classId, slotKey, file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 업로드할 수 있어요.')
  }
  if (file.size > MAX_SIZE) {
    throw new Error('이미지 용량은 5MB 이하로 올려주세요.')
  }
  const ext = file.name.split('.').pop() || 'png'
  const path = `classes/${classId}/mascot/${slotKey}.${ext}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)

  const slot = MASCOT_SLOTS.find((s) => s.key === slotKey)
  await setDoc(doc(db, 'classes', classId), { [slot.field]: url }, { merge: true })
  return url
}

/** 기본(번들에 포함된) 이미지로 되돌린다. */
export async function resetMascotImage(classId, slotKey) {
  const slot = MASCOT_SLOTS.find((s) => s.key === slotKey)
  await setDoc(doc(db, 'classes', classId), { [slot.field]: null }, { merge: true })
  // 스토리지에 남은 파일은 지우되, 실패해도(이미 없거나 등) 무시한다.
  for (const ext of ['png', 'jpg', 'jpeg', 'webp', 'gif']) {
    try {
      await deleteObject(ref(storage, `classes/${classId}/mascot/${slotKey}.${ext}`))
    } catch {
      // 해당 확장자 파일이 없으면 무시
    }
  }
}
