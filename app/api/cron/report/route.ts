import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { Resend } from "resend";
import * as XLSX from "xlsx";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // ── Cron 인증 (Vercel이 자동으로 주입하는 헤더 또는 시크릿 검증) ──
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabaseAdmin = createAdminClient();

    // ── 어제 날짜 범위 계산 (UTC 기준) ─────────────────────────
    const now = new Date();
    const yesterdayStart = new Date(now);
    yesterdayStart.setUTCDate(now.getUTCDate() - 1);
    yesterdayStart.setUTCHours(0, 0, 0, 0);

    const yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setUTCHours(23, 59, 59, 999);

    const dateLabel = yesterdayStart.toLocaleDateString("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    // ── Supabase에서 전날 가입 회원 조회 ────────────────────────
    const { data: members, error: fetchError } = await supabaseAdmin
      .from("members")
      .select("id, name, station, email, created_at")
      .gte("created_at", yesterdayStart.toISOString())
      .lte("created_at", yesterdayEnd.toISOString())
      .order("created_at", { ascending: true });

    if (fetchError) {
      console.error("Supabase fetch error:", fetchError);
      return NextResponse.json(
        { error: "데이터 조회 실패" },
        { status: 500 }
      );
    }

    const memberCount = members?.length ?? 0;

    // ── 엑셀 파일 생성 ──────────────────────────────────────────
    const worksheetData = [
      // 헤더 행
      ["No", "이름", "복무지역", "이메일", "가입 일시"],
      // 데이터 행
      ...(members ?? []).map((m, idx) => [
        idx + 1,
        m.name,
        m.station ?? "미입력",
        m.email,
        new Date(m.created_at).toLocaleString("ko-KR", {
          timeZone: "Asia/Seoul",
        }),
      ]),
    ];

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // 열 너비 설정
    worksheet["!cols"] = [
      { wch: 6 },   // No
      { wch: 12 },  // 이름
      { wch: 14 },  // 복무지역
      { wch: 30 },  // 이메일
      { wch: 22 },  // 가입 일시
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "신규 회원");

    // Buffer로 변환
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });
    const base64Excel = Buffer.from(excelBuffer).toString("base64");

    // ── Resend로 이메일 발송 ─────────────────────────────────────
    const resend = new Resend(process.env.RESEND_API_KEY);
    const toEmail = process.env.REPORT_TO_EMAIL ?? "ohhmoon85@gmail.com";
    const fileName = `KVA_신규회원_${dateLabel.replace(/\./g, "").replace(/\s/g, "")}.xlsx`;

    const emailBody =
      memberCount > 0
        ? `
          <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 600px;">
            <h2 style="color: #1a3a6b;">📊 KVA 일일 신규 회원 보고서</h2>
            <p style="color: #555;">보고 기준일: <strong>${dateLabel}</strong></p>
            <div style="background: #f0f4ff; border-left: 4px solid #1a3a6b; padding: 16px; border-radius: 4px; margin: 16px 0;">
              <p style="margin: 0; font-size: 18px; color: #1a3a6b;">
                전날 신규 가입: <strong>${memberCount}명</strong>
              </p>
            </div>
            <p style="color: #777; font-size: 14px;">
              첨부된 엑셀 파일에서 전체 명단을 확인하실 수 있습니다.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            <p style="color: #aaa; font-size: 12px;">
              KATUSA Veterans Association (KVA) 자동 발송 메일입니다.
            </p>
          </div>
        `
        : `
          <div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; max-width: 600px;">
            <h2 style="color: #1a3a6b;">📊 KVA 일일 신규 회원 보고서</h2>
            <p style="color: #555;">보고 기준일: <strong>${dateLabel}</strong></p>
            <div style="background: #f9f9f9; border-left: 4px solid #ccc; padding: 16px; border-radius: 4px; margin: 16px 0;">
              <p style="margin: 0; color: #888;">전날 신규 가입 회원이 없습니다.</p>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            <p style="color: #aaa; font-size: 12px;">
              KATUSA Veterans Association (KVA) 자동 발송 메일입니다.
            </p>
          </div>
        `;

    const { error: emailError } = await resend.emails.send({
      from: "KVA 보고서 <onboarding@resend.dev>",
      to: [toEmail],
      subject: `[KVA] ${dateLabel} 신규 회원 보고서 (${memberCount}명)`,
      html: emailBody,
      attachments:
        memberCount > 0
          ? [
              {
                filename: fileName,
                content: base64Excel,
              },
            ]
          : [],
    });

    if (emailError) {
      console.error("Resend email error:", emailError);
      return NextResponse.json(
        { error: "이메일 발송 실패", detail: emailError },
        { status: 500 }
      );
    }

    console.log(
      `[CRON] 보고서 발송 완료: ${dateLabel}, 신규 회원 ${memberCount}명`
    );

    return NextResponse.json({
      success: true,
      date: dateLabel,
      memberCount,
      sentTo: toEmail,
    });
  } catch (err) {
    console.error("Cron report error:", err);
    return NextResponse.json(
      { error: "보고서 생성 실패" },
      { status: 500 }
    );
  }
}
