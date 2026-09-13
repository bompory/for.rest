# 조회조회

아침 출결 체크 10초가 그대로 학생 상담 기록으로 쌓이는 중학교 담임교사용 웹앱.
> 아침에 모이는 조회(朝會)에서, 아이의 하루를 비춰보는 조회(照會)로.

## 1. 준비

```bash
npm install
```

`.env.example`을 복사해 `.env`를 만들고 Firebase 콘솔 > 프로젝트 설정 > 일반 > 내 앱(웹)에서
복사한 값을 채워주세요. (`.env`는 절대 커밋하지 마세요.)

```bash
cp .env.example .env
```

필요한 변수:
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID   (선택)
```

Firebase 콘솔에서 아래 두 가지도 미리 켜두세요:
- Authentication → 로그인 방법 → Google 사용 설정 (교사 로그인용)
- Firestore Database 생성 (테스트 모드 또는 아래 규칙 배포)

## 2. 실행

```bash
npm run dev
```

브라우저에서 `/` 로 접속 → "교사로 로그인"에서 계정을 새로 만들면 학급(설정/기본질문 100개/도감 배지)이
자동으로 생성됩니다. 학생은 "학생으로 시작하기"에서 교사 대시보드에 표시되는 학급코드로 로그인합니다.

## 3. Firestore 보안 규칙 배포 (선택, 권장)

테스트 모드는 30일 후 잠깁니다. 아래 명령으로 이 저장소에 포함된 `firestore.rules`를 배포해두면
그 이후에도 앱이 계속 동작합니다.

```bash
npm install -g firebase-tools   # 처음 한 번만
firebase login
firebase deploy --only firestore:rules,firestore:indexes --project <your-project-id>
```

## 4. 데모 더미데이터 30일치 생성

Admin SDK로 실제 서버에 과거 30일(평일)치 체크인 기록을 만들어줍니다. 교사 로그인이 구글
로그인이라 Admin SDK로 임의의 교사 계정을 만들 수 없어서, 먼저 앱에서 구글 로그인을 한 번 한 뒤
그 계정의 UID를 스크립트에 넘겨주는 방식입니다.

1. Firebase 콘솔 > 프로젝트 설정 > 서비스 계정 → "새 비공개 키 생성" → JSON 다운로드
2. 프로젝트 루트에 `serviceAccountKey.json` 이름으로 저장 (`.gitignore`에 이미 포함되어 커밋되지 않음)
3. `npm run dev`로 앱을 열어 "교사로 로그인"에서 구글 로그인을 한 번 완료 (학급이 자동 생성됨)
4. Firebase 콘솔 > Authentication > Users 탭에서 방금 로그인한 계정의 UID 복사
5. 실행:

```bash
SEED_CLASS_ID=<복사한 UID> npm run seed
```

완료되면 콘솔에 학급코드, 지각이 점점 느는 학생 이름, 답변이 점점 짧아지는 학생 이름이 출력됩니다.
아까 구글로 로그인했던 그 계정으로 다시 들어가면 바로 확인할 수 있습니다.

## 5. 폴더 구조 요약

- `src/lib/` — Firestore와 무관한 순수 로직(날짜 계산, 지각 판정, 스탬프, 멘트) + Firestore 접근 헬퍼
- `src/hooks/` — 인증/실시간 구독 훅
- `src/components/mascot`, `src/components/creatures` — 전부 인라인 SVG (외부 이미지 파일 없음)
- `src/pages/student`, `src/pages/teacher` — 화면
- `src/seed/` — 기본 질문 100개, 데모 학생 가명 23명, 더미데이터 생성 스크립트

Firestore 컬렉션 구조와 설계 배경은 개발 계획 문서(`PROMPT.md` 작성 시 함께 논의한 내용)를 참고하세요.
