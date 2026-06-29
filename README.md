# Hair Stamp MVP

**미용사를 위한 시술 기록 및 고객 쿠폰 관리 시스템**

## 주요 특징

✅ **미용사 대시보드** - 고객 검색, 시술 기록, 쿠폰 발급 관리  
✅ **손님 공개 페이지** - 로그인 없이 링크/QR로 스탬프와 쿠폰 확인  
✅ **자동 쿠폰 발급** - 시술 5회 도달 시 자동으로 무료 쿠폰 발급  
✅ **다중 스탬프 관리** - 시술 종류별로 독립적으로 스탬프 관리  
✅ **터치 친화 UI** - 태블릿/모바일 환경에 최적화된 빠른 입력  

## 기술 스택

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Deployment**: Vercel
- **Real-time**: Supabase Realtime (확장 용도)

## 빠른 시작

### 1. 환경 설정

```bash
# 환경 변수 파일 생성
cp .env.local.example .env.local
```

`.env.local` 파일에 Supabase 정보 입력:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. 의존성 설치 및 개발 서버 시작

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 → 자동으로 `/admin`으로 이동

### 3. Supabase DB 설정

[Supabase 설정 가이드](docs/supabase-setup.md)를 참고하여 테이블 생성 및 RLS 정책 설정

### 4. 로그인 및 테스트

- Supabase 대시보드에서 테스트 미용사 계정 생성
- 이메일/비밀번호로 로그인
- 고객 등록 → 시술 기록 → 공개 링크 확인

## 주요 페이지

| 경로 | 설명 | 접근 |
|------|------|------|
| `/` | 홈 (admin으로 리디렉트) | 누구나 |
| `/login` | 미용사 로그인 | 누구나 |
| `/admin` | 대시보드 (통계) | 로그인한 미용사 |
| `/admin/customers` | 고객 검색/목록 | 로그인한 미용사 |
| `/admin/customers/new` | 신규 고객 등록 | 로그인한 미용사 |
| `/admin/customers/[id]` | 고객 상세 (시술 기록/쿠폰) | 로그인한 미용사 |
| `/c/[token]` | 손님 공개 페이지 | 토큰 소유자 |

## 데이터 흐름

### 미용사 흐름
```
1. 로그인 (/login)
2. 대시보드 확인 (/admin)
3. 손님 검색/등록 (/admin/customers)
4. 시술 기록 추가 (/admin/customers/[id])
5. 자동으로 쿠폰 발급 (5회 도달 시)
6. 손님에게 공개 링크 전달
```

### 손님 흐름
```
1. 미용사로부터 링크/QR 받기
2. 손님 공개 페이지 접속 (/c/[token])
3. 본인의 스탬프 진행률 확인
4. 보유 쿠폰 확인 및 사용
```

## 프로젝트 구조

```
coupon/
├── app/
│   ├── admin/                    # 미용사 전용
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── customers/
│   ├── c/                        # 손님 공개
│   │   └── [token]/page.tsx
│   ├── login/page.tsx
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   └── ui/                       # shadcn/ui 컴포넌트
├── lib/
│   ├── supabase.ts               # Supabase 클라이언트
│   ├── coupon.ts                 # 시술/쿠폰 로직
│   └── token.ts                  # 토큰 생성 및 조회
├── types/
│   └── index.ts
├── docs/
│   ├── architecture.md           # 아키텍처 설계
│   ├── design-guide.md           # 디자인 가이드
│   ├── supabase-setup.md         # Supabase 설정
│   ├── development.md            # 개발 가이드
│   └── roadmap.md                # 개발 로드맵
├── .env.local.example
├── components.json
├── package.json
└── tsconfig.json
```

## 핵심 파일

- **`lib/coupon.ts`**: 시술 기록 + 자동 쿠폰 발급 로직
- **`lib/token.ts`**: 손님 공개 링크 토큰 생성/조회
- **`app/admin/customers/[id]/page.tsx`**: 3초 컷 시술 버튼 UI
- **`app/c/[token]/page.tsx`**: 손님용 스탬프/쿠폰 조회

## 배포

### Vercel 배포 (권장)

1. GitHub에 저장소 푸시
2. Vercel 대시보드에서 저장소 연결
3. 환경 변수 설정
4. Deploy 클릭

[배포 상세 가이드](docs/development.md#배포-vercel)

## 설정 및 커스터마이징

### 시술 종류 변경
`types/index.ts`의 `TREATMENT_TYPES` 수정

### 쿠폰 기준 변경
`types/index.ts`의 `COUPON_THRESHOLD` 수정

### 디자인 커스터마이징
`globals.css` 또는 Tailwind 설정 수정

## 개발 중 자주 쓸 명령어

```bash
# 개발 서버
npm run dev

# 빌드
npm run build

# 프로덕션 실행
npm start

# 린트 체크
npm run lint
```

## 확인 사항

- ✅ Next.js 14 + TypeScript 설정 완료
- ✅ shadcn/ui 초기화 (Dark 테마)
- ✅ 모든 페이지 구현 완료
- ✅ 시술 기록 + 쿠폰 자동 발급 로직 구현
- ✅ Supabase 연동 코드 작성
- ✅ 프로덕션 빌드 성공

## 다음 단계

1. **[Supabase 설정](docs/supabase-setup.md)** - DB 테이블 생성 및 RLS 정책
2. **로컬 테스트** - `npm run dev`로 기능 확인
3. **GitHub 푸시** - 저장소에 코드 업로드
4. **Vercel 배포** - 프로덕션 환경 구성

## 문서

- [아키텍처](docs/architecture.md) - 전체 설계 및 DB 스키마
- [디자인 가이드](docs/design-guide.md) - UI/UX 참고 자료 및 구성
- [Supabase 설정](docs/supabase-setup.md) - DB 테이블 및 RLS 정책
- [개발 가이드](docs/development.md) - 로컬 개발 및 배포
- [로드맵](docs/roadmap.md) - 3주 개발 계획
