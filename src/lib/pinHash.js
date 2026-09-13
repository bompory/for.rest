// 4자리 PIN을 평문으로 저장하지 않기 위한 단방향 해시. Web Crypto(SubtleCrypto)를 쓰므로
// 브라우저(HTTPS/localhost)에서만 동작한다 — 별도 라이브러리 설치 없이 표준 API만 사용.
// 4자리 숫자라 키 공간 자체는 작지만, 그래도 평문 그대로 저장/노출하지 않는 게 원칙이다.
export async function hashPin(pin) {
  const data = new TextEncoder().encode(pin)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
