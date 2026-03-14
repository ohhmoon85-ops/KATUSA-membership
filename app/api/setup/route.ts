import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  // 시크릿 키로 보호 (아무나 호출 못 하게)
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await pool.query(`
      -- members 테이블 생성 (이미 있으면 무시)
      CREATE TABLE IF NOT EXISTS members (
        id         BIGSERIAL    PRIMARY KEY,
        name       VARCHAR(50)  NOT NULL,
        station    VARCHAR(100),
        email      VARCHAR(200) NOT NULL UNIQUE,
        created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      );

      -- 인덱스 생성
      CREATE INDEX IF NOT EXISTS idx_members_email      ON members (email);
      CREATE INDEX IF NOT EXISTS idx_members_created_at ON members (created_at);

      -- Row Level Security
      ALTER TABLE members ENABLE ROW LEVEL SECURITY;

      -- anon 유저는 INSERT만 허용 (중복 정책 무시)
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE tablename = 'members' AND policyname = 'Allow public insert'
        ) THEN
          EXECUTE 'CREATE POLICY "Allow public insert" ON members FOR INSERT TO anon WITH CHECK (true)';
        END IF;
      END $$;
    `);

    return NextResponse.json({
      success: true,
      message: "테이블이 성공적으로 생성되었습니다.",
    });
  } catch (err) {
    console.error("Setup error:", err);
    return NextResponse.json(
      { error: "테이블 생성 실패", detail: String(err) },
      { status: 500 }
    );
  } finally {
    await pool.end();
  }
}
