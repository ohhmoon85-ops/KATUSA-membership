-- ═══════════════════════════════════════════════════
-- KVA 회원 모집 앱 - Supabase 테이블 스키마
-- Supabase Dashboard → SQL Editor에서 실행하세요
-- ═══════════════════════════════════════════════════

-- members 테이블 생성
CREATE TABLE IF NOT EXISTS members (
  id         BIGSERIAL PRIMARY KEY,
  name       VARCHAR(50)  NOT NULL,
  station    VARCHAR(100),
  email      VARCHAR(200) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 이메일 인덱스 (중복 확인 쿼리 최적화)
CREATE INDEX IF NOT EXISTS idx_members_email ON members (email);

-- 날짜 인덱스 (일일 보고서 쿼리 최적화)
CREATE INDEX IF NOT EXISTS idx_members_created_at ON members (created_at);

-- Row Level Security 활성화
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- 정책: 일반 유저(anon key)는 INSERT만 가능
CREATE POLICY "Allow public insert"
  ON members FOR INSERT
  TO anon
  WITH CHECK (true);

-- 정책: Service Role은 모든 작업 가능 (기본 허용)
-- (Supabase에서 service_role은 RLS를 우회하므로 별도 정책 불필요)

-- 테이블 코멘트
COMMENT ON TABLE members IS 'KVA 카투사 연합회 회원 가입 명단';
COMMENT ON COLUMN members.name IS '회원 이름 (한글)';
COMMENT ON COLUMN members.station IS '복무지역 (선택)';
COMMENT ON COLUMN members.email IS '이메일 주소 (고유)';
COMMENT ON COLUMN members.created_at IS '가입 일시 (UTC)';
