# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) → New Project
2. 프로젝트 이름, DB 비밀번호 설정 후 생성
3. 프로젝트 생성까지 약 1~2분 대기

---

## 2. 환경변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

**위치:** Supabase 대시보드 → Settings → API

> `SUPABASE_SERVICE_ROLE_KEY`는 클라이언트에 노출되지 않음. 서버 사이드 전용.

---

## 3. 테이블 생성 SQL

Supabase 대시보드 → **SQL Editor** → 아래 SQL을 **전체 복사 후 한 번에 실행**

```sql
-- =============================================
-- 1. 테이블 생성
-- =============================================

CREATE TABLE customers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       VARCHAR(255) NOT NULL,
  phone      VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_phone   ON customers(phone);
CREATE INDEX idx_customers_name    ON customers(name);

CREATE TABLE treatments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id    UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  treatment_type VARCHAR(50) NOT NULL,
  treated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_treatments_customer_id    ON treatments(customer_id);
CREATE INDEX idx_treatments_treatment_type ON treatments(treatment_type);

CREATE TABLE coupons (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id    UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  treatment_type VARCHAR(50) NOT NULL,
  status         VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'used')),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  used_at        TIMESTAMPTZ
);

CREATE INDEX idx_coupons_customer_id ON coupons(customer_id);
CREATE INDEX idx_coupons_status      ON coupons(status);

CREATE TABLE tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
  token       VARCHAR(255) NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tokens_token ON tokens(token);

-- =============================================
-- 2. RLS 활성화
-- =============================================

ALTER TABLE customers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tokens     ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. Customers 정책
--    - 미용사(로그인 사용자): 자신의 고객 CRUD
--    - 손님(비로그인): tokens 테이블에 연결된 고객만 읽기
-- =============================================

CREATE POLICY "stylist: select own customers" ON customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "stylist: insert own customers" ON customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "stylist: update own customers" ON customers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "stylist: delete own customers" ON customers
  FOR DELETE USING (auth.uid() = user_id);

-- 손님 공개 페이지: token으로 연결된 고객만 읽기 허용
CREATE POLICY "public: read customer via token" ON customers
  FOR SELECT USING (
    id IN (SELECT customer_id FROM tokens)
  );

-- =============================================
-- 4. Treatments 정책
-- =============================================

CREATE POLICY "stylist: select treatments" ON treatments
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

CREATE POLICY "stylist: insert treatments" ON treatments
  FOR INSERT WITH CHECK (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

-- 손님 공개 페이지: token으로 연결된 고객의 시술 기록 읽기
CREATE POLICY "public: read treatments via token" ON treatments
  FOR SELECT USING (
    customer_id IN (SELECT customer_id FROM tokens)
  );

-- =============================================
-- 5. Coupons 정책
-- =============================================

CREATE POLICY "stylist: select coupons" ON coupons
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

-- 자동 쿠폰 발급: 로그인 사용자가 자신의 고객 쿠폰 생성
CREATE POLICY "stylist: insert coupons" ON coupons
  FOR INSERT WITH CHECK (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

CREATE POLICY "stylist: update coupons" ON coupons
  FOR UPDATE USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

-- 손님 공개 페이지: token으로 연결된 고객의 쿠폰 읽기
CREATE POLICY "public: read coupons via token" ON coupons
  FOR SELECT USING (
    customer_id IN (SELECT customer_id FROM tokens)
  );

-- =============================================
-- 6. Tokens 정책
-- =============================================

-- 누구나 token으로 조회 가능 (손님 공개 페이지용)
CREATE POLICY "public: read tokens" ON tokens
  FOR SELECT USING (true);

-- 미용사만 자신의 고객 토큰 생성
CREATE POLICY "stylist: insert tokens" ON tokens
  FOR INSERT WITH CHECK (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );
```

---

## 4. Authentication 설정

1. 대시보드 → **Authentication** → **Providers**
2. **Email** 항목 확인 — "Enable Email Provider" ON 상태인지 확인
3. (선택) **Confirm email** 체크 해제 → 이메일 인증 없이 바로 로그인 가능

---

## 5. 테스트 미용사 계정 생성

1. 대시보드 → **Authentication** → **Users**
2. **Add user** → **Create new user** 클릭
3. 이메일/비밀번호 입력 후 생성
4. 앱에서 해당 계정으로 로그인

---

## 6. (선택) 테스트 데이터

SQL Editor에서 아래 실행. `'your-user-id'`는 위에서 생성한 계정의 UUID로 교체.

```sql
-- user id 확인 방법: Authentication > Users > 해당 계정 클릭
INSERT INTO customers (user_id, name, phone)
VALUES
  ('your-user-id', '김민지', '010-1234-5678'),
  ('your-user-id', '이수현', '010-9876-5432');
```

---

## 7. 초기화 (재설정 시)

```sql
DROP TABLE IF EXISTS tokens    CASCADE;
DROP TABLE IF EXISTS coupons   CASCADE;
DROP TABLE IF EXISTS treatments CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
```

---

## 체크리스트

- [ ] `.env.local` 파일 생성 완료
- [ ] SQL 전체 실행 완료 (테이블 + RLS 정책)
- [ ] Authentication → Email Provider 활성화 확인
- [ ] 테스트 미용사 계정 생성
- [ ] `npm run dev` 후 로그인 테스트
