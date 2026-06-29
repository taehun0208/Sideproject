# 개발 시작 및 배포 가이드

## 로컬 개발 시작

### 1. 환경 변수 설정

`.env.local` 파일 생성:

```bash
cp .env.local.example .env.local
```

그 후 Supabase 프로젝트 정보 입력:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. 개발 서버 시작

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

### 3. 로그인 및 테스트

1. 미용사 계정으로 로그인 (Supabase에서 생성한 계정)
2. Admin 대시보드 확인
3. 고객 검색/등록/시술 기록 테스트
4. QR 코드로 손님 페이지 접속 확인

---

## 배포 (Vercel)

### 1. GitHub 저장소 연결

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/coupon.git
git push -u origin main
```

### 2. Vercel 배포

1. [Vercel](https://vercel.com) 접속
2. GitHub 로그인 후 저장소 연결
3. 환경 변수 설정:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy 클릭

### 3. 배포 후 확인

- 프로덕션 URL에서 로그인 테스트
- 손님 공개 페이지 QR 코드 생성 및 접속 테스트

---

## 프로젝트 구조

```
coupon/
├── app/
│   ├── admin/
│   │   ├── page.tsx               ← 대시보드
│   │   ├── customers/
│   │   │   ├── page.tsx           ← 고객 검색/목록
│   │   │   ├── new/page.tsx       ← 신규 고객 등록
│   │   │   └── [id]/page.tsx      ← 고객 상세 (시술 기록)
│   │   └── layout.tsx             ← 인증 가드
│   │
│   ├── c/
│   │   └── [token]/page.tsx       ← 손님 공개 페이지
│   │
│   ├── login/page.tsx             ← 로그인
│   ├── layout.tsx
│   ├── page.tsx                   ← 홈 (admin으로 리디렉트)
│   └── globals.css
│
├── components/
│   └── ui/                        ← shadcn/ui 컴포넌트
│
├── lib/
│   ├── supabase.ts                ← Supabase 클라이언트
│   ├── coupon.ts                  ← 시술 기록 & 쿠폰 로직
│   ├── token.ts                   ← 토큰 생성 & 조회
│   └── utils.ts
│
├── types/
│   └── index.ts                   ← TypeScript 타입 정의
│
├── docs/
│   ├── architecture.md            ← 아키텍처
│   ├── design-guide.md            ← 디자인 가이드
│   ├── supabase-setup.md          ← Supabase 설정
│   └── roadmap.md                 ← 개발 로드맵
│
├── .env.local.example
├── components.json                ← shadcn/ui 설정
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 주요 파일 설명

### `lib/supabase.ts`
Supabase 클라이언트 생성 및 내보내기

### `lib/coupon.ts`
- `recordTreatment()`: 시술 기록 추가 + 쿠폰 자동 발급
- `checkAndIssueCoupon()`: 5회 도달 시 쿠폰 발급 로직

### `lib/token.ts`
- `generateCustomerToken()`: 손님 공개 링크 토큰 생성
- `getCustomerByToken()`: 토큰으로 고객 정보 조회

### `types/index.ts`
모든 TypeScript 타입 및 상수 정의

---

## 개발 중 자주 쓸 명령어

```bash
# 개발 서버 시작
npm run dev

# 빌드
npm run build

# 프로덕션 시뮬레이션
npm run start

# 린트 확인
npm run lint

# 타입 체크
npx tsc --noEmit

# 의존성 업데이트
npm update
```

---

## 문제 해결

### Supabase 연결 오류
- `.env.local` 파일의 URL과 키가 정확한지 확인
- Supabase 대시보드에서 키 재발급 시도

### 로그인 실패
- Supabase Authentication 활성화 확인
- 테스트 계정이 실제로 생성되었는지 확인
- 브라우저 개발자 도구에서 콘솔 에러 확인

### RLS 정책 오류
- Supabase 대시보드 → Authentication → Policies에서 정책 확인
- 정책이 올바르게 생성되었는지 재확인

### QR 코드 생성 오류
- `qrcode.react` 라이브러리 설치 확인
- 토큰이 정확히 생성되었는지 DB에서 확인

---

## 성능 최적화 (향후)

- 이미지 최적화 (next/image 활용)
- API 라우트 캐싱
- 데이터베이스 쿼리 최적화 (인덱스 활용)
- 번들 크기 분석 및 최적화

---

## 보안 사항 (향후)

- CSRF 토큰 추가
- Rate limiting 추가
- 입력값 검증 강화
- SQL injection 방지 (Supabase 자동 처리)
