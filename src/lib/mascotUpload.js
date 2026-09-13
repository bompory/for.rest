import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

export const MASCOT_SLOTS = [
  { key: 'stickerOnTime', field: 'stickerOnTimeUrl', label: '정상출석 스티커' },
  { key: 'stickerLate', field: 'stickerLateUrl', label: '지각 스티커' },
  { key: 'stickerAnswer', field: 'stickerAnswerUrl', label: '질문 답변 완료 스티커' },
]

// Firebase Storage(결제 계정 필요) 없이 쓰기 위해, 이미지를 브라우저에서 작게 리사이즈해
// data URL(base64) 문자열로 Firestore 문서 필드에 직접 저장한다. Firestore 문서 하나의
// 최대 크기가 약 1MB라서, 슬롯 3개를 합쳐도 여유 있도록 슬롯당 150KB로 제한한다.
const MAX_DIMENSION = 220
const JPEG_QUALITY = 0.75
const MAX_DATA_URL_SIZE = 150 * 1024

function resizeImageToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('이미지를 읽는 중 문제가 생겼어요.'))
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = () => reject(new Error('이미지를 여는 중 문제가 생겼어요.'))
      img.onload = () => {
        let { width, height } = img
        if (width > height && width > MAX_DIMENSION) {
          height = Math.round((height * MAX_DIMENSION) / width)
          width = MAX_DIMENSION
        } else if (height >= width && height > MAX_DIMENSION) {
          width = Math.round((width * MAX_DIMENSION) / height)
          height = MAX_DIMENSION
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

/** 교사가 스티커 이미지를 업로드하면 브라우저에서 압축해 학급 문서에 바로 저장한다. */
export async function uploadMascotImage(classId, slotKey, file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 업로드할 수 있어요.')
  }
  const dataUrl = await resizeImageToDataUrl(file)
  if (dataUrl.length > MAX_DATA_URL_SIZE) {
    throw new Error('이미지를 더 압축했는데도 너무 커요. 더 단순한 사진으로 시도해줄래요?')
  }
  const slot = MASCOT_SLOTS.find((s) => s.key === slotKey)
  await setDoc(doc(db, 'classes', classId), { [slot.field]: dataUrl }, { merge: true })
  return dataUrl
}

/** 기본(번들에 포함된) 이미지로 되돌린다. */
export async function resetMascotImage(classId, slotKey) {
  const slot = MASCOT_SLOTS.find((s) => s.key === slotKey)
  await setDoc(doc(db, 'classes', classId), { [slot.field]: null }, { merge: true })
}
