import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, station, email } = body;

    // ── 입력 검증 ──────────────────────────────────────────────
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "이름을 입력해 주세요." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "이메일을 입력해 주세요." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "올바른 이메일 형식을 입력해 주세요." },
        { status: 400 }
      );
    }

    const cleanName = name.trim().slice(0, 50);
    const cleanStation = station
      ? String(station).trim().slice(0, 100)
      : null;
    const cleanEmail = email.trim().toLowerCase().slice(0, 200);

    // ── Supabase 저장 ───────────────────────────────────────────
    const supabaseAdmin = createAdminClient();

    // 이메일 중복 확인
    const { data: existing } = await supabaseAdmin
      .from("members")
      .select("id")
      .eq("email", cleanEmail)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "이미 가입된 이메일입니다." },
        { status: 409 }
      );
    }

    // 새 회원 저장
    const { error: insertError } = await supabaseAdmin
      .from("members")
      .insert([
        {
          name: cleanName,
          station: cleanStation,
          email: cleanEmail,
        },
      ]);

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json(
        { error: "데이터 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "가입이 완료되었습니다." },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register API error:", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
