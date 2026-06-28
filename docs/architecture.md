# Architecture

## 사용자 흐름

### 미용사 (최소 100명 이상)

- `/admin/login` - 로그인
- `/admin` - 대시보드
- `/admin/customers` - 손님 검색/목록 (이름, 전화번호)
- `/admin/customers/new` - 신규 손님 등록
- `/admin/customers/[id]` - 손님 상세 (의료 차트 스타일) + 시술 버튼 탭

### 손님

- `/c/[token]` - 공개 뷰, 로그인 없음, URL로 접근
- 스탬프 보드 + 보유 쿠폰 확인 (QR 코드로 제시)

## DB 테이블 스키마

### `users`
- id (UUID, Primary)
- email (String)
- created_at (Timestamp)

### `customers`
- id (UUID, Primary)
- user_id (FK → users)
- name (String)
- phone (String)
- created_at (Timestamp)
- updated_at (Timestamp)

### `treatments`
- id (UUID, Primary)
- customer_id (FK → customers)
- treatment_type (String: 다운펌/염색/클리닉/커트)
- treated_at (Timestamp)
- count (Integer) ← 시술별 누적 횟수

### `coupons`
- id (UUID, Primary)
- customer_id (FK → customers)
- treatment_type (String) ← 시술별로 다르게 책정
- status (Enum: active/used)
- created_at (Timestamp)
- used_at (Timestamp, nullable)

### `tokens`
- id (UUID, Primary)
- customer_id (FK → customers)
- token (String, unique)
- created_at (Timestamp)

## 핵심 로직

- 미용사가 시술 버튼 탭 → `treatments` 레코드 생성
- 고객별 **시술 종류별** 누적 횟수 계산
- 특정 시술이 5회 도달 → `coupons` 자동 생성 (status=active)
- `/c/[token]`에서 손님별 스탬프 진행률 + 보유 쿠폰 조회
- 미용사가 쿠폰 "사용 처리" → `status=used`, `used_at` 기록
- 손님이 QR 스캔하면 쿠폰 상태 실시간 반영

## 초기 시술 목록

- 다운펌 (5회마다 무료 1회)
- 염색 (5회마다 무료 1회)
- 클리닉 (5회마다 무료 1회)
- 커트 (5회마다 무료 1회)

*추후 미용사 피드백에 따라 추가/수정*

## 기술 선택 이유

- Next.js App Router: 서버 컴포넌트로 DB 조회, 클라이언트 컴포넌트는 최소화
- Supabase: Auth, RLS, Postgres, 실시간 확장성
- Tailwind + shadcn/ui: 빠른 터치 UI 구성 (2030 남성 타겟 힙한 감성)
- Vercel: Next.js 배포 최적화

## 디자인 가이드라인

### 전체 톤앤매너
- **테마:** Dark 모드 기본
- **포인트 컬러:** 형광 연두 (#00FF66) 또는 일렉트릭 블루
- **감성:** 의료 차트의 전문성 + 2030 남성이 선호하는 테크 미니멀리즘

### 미용사 페이지 (`/admin/customers/[id]`)
- **상단:** 의료 차트처럼 이름, 전화번호, 최근 방문일, 특이사항을 Grid로 정리
- **중앙:** 큰 대시보드 버튼 형태의 시술 탭 `[다운펌] [염색] [클리닉] [커트]`
- **하단:** 타임라인 로그 리스트 (예: "2026.06.29 - 다운펌 (4회차)")

### 손님 공개 페이지 (`/c/[token]`)
- **상단:** 디지털 가젯 느낌의 프로그레스 바 또는 격자형 칩 애니메이션 (아날로그 스탬프 X)
- **하단:** 영수증/바코드 티켓 감성의 쿠폰 카드. 미용사가 사용 처리하면 실시간으로 'USED' 도장 표시

### 참고 사이트
1. **shadcn/ui Blocks** (ui.shadcn.com/blocks) - 대시보드 뼈대
2. **v0.dev** - AI 기반 Tailwind UI 생성 (검색: "Medical style customer dashboard", "coupon stamp board")
3. **Mobbin** - 실제 앱 UI 레퍼런스 (토스, 애플카드, 피트니스 앱)
4. **Godly Website** - 트렌디한 웹 비주얼 톤앤매너
