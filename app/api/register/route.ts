import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { composeRank, isServiceStatus } from "@/lib/membership";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      lastName,
      firstName,
      serviceStatus,
      rank,
      station,
      email,
    } = body;

    // ── 입력 검증 ──────────────────────────────────────────────
    const cleanLastName =
      typeof lastName === "string" ? lastName.trim() : "";
    const cleanFirstName =
      typeof firstName === "string" ? firstName.trim() : "";

    if (!cleanLastName || !cleanFirstName) {
      return NextResponse.json(
        { error: "Please enter both your first and last name. / 성과 이름을 모두 입력해 주세요." },
        { status: 400 }
      );
    }

    // 복무상태·계급은 필수. 허용된 조합만 서버에서 조립해 저장한다.
    if (!isServiceStatus(serviceStatus)) {
      return NextResponse.json(
        { error: "Please select your service status. / 복무상태를 선택해 주세요." },
        { status: 400 }
      );
    }

    const cleanRank = composeRank(serviceStatus, rank);
    if (!cleanRank) {
      return NextResponse.json(
        { error: "Please select your rank. / 계급을 선택해 주세요." },
        { status: 400 }
      );
    }

    // 복무지역은 선택사항 (미입력 시 null). 군 미복무 민간인은 해당 없음
    const cleanStation =
      serviceStatus !== "민간인" && typeof station === "string" && station.trim()
        ? station.trim().slice(0, 100)
        : null;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Please enter your email. / 이메일을 입력해 주세요." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address. / 올바른 이메일 형식을 입력해 주세요." },
        { status: 400 }
      );
    }

    const cleanName = `${cleanLastName} ${cleanFirstName}`.slice(0, 50);
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
        { error: "This email is already registered. / 이미 가입된 이메일입니다." },
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
        { error: "Failed to save your registration. Please try again shortly. / 데이터 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Registration complete. / 가입이 완료되었습니다." },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register API error:", err);
    return NextResponse.json(
      { error: "Server error. / 서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
