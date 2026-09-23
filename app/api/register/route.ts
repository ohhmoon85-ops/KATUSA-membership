import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

const SERVICE_STATUSES = ["현역", "예비역"];
const CIVILIAN_RANK_PREFIXES = ["민간인", "군무원"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lastName, firstName, serviceStatus, rank, station, email } = body;

    // ── 입력 검증 ──────────────────────────────────────────────
    const cleanLastName =
      typeof lastName === "string" ? lastName.trim() : "";
    const cleanFirstName =
      typeof firstName === "string" ? firstName.trim() : "";

    if (!cleanLastName || !cleanFirstName) {
      return NextResponse.json(
        { error: "성과 이름을 모두 입력해 주세요. / Please enter both your first and last name." },
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

    const cleanName = `${cleanLastName} ${cleanFirstName}`.slice(0, 50);
    // 계급은 "복무상태 + 계급" 형태로 합쳐 저장한다.
    // (값은 클라이언트가 보낸 문자열을 그대로 쓰지 않고 서버에서 조립)
    const rawRank = rank ? String(rank).trim() : "";
    const cleanStatus = SERVICE_STATUSES.includes(serviceStatus)
      ? (serviceStatus as string)
      : null;
    // 민간인·군무원은 현역/예비역 구분이 없으므로 접두어를 붙이지 않는다.
    const isCivilianRank = CIVILIAN_RANK_PREFIXES.some((prefix) =>
      rawRank.startsWith(prefix)
    );

    let cleanRank: string | null = null;
    if (rawRank) {
      if (cleanStatus && !isCivilianRank) {
        const englishSuffixed =
          cleanStatus === "예비역" ? rawRank.replace(/\)$/, ", Ret.)") : rawRank;
        cleanRank = `${cleanStatus} ${englishSuffixed}`.slice(0, 50);
      } else {
        cleanRank = rawRank.slice(0, 50);
      }
    }
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
          rank: cleanRank,
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
