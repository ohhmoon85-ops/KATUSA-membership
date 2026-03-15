"use client";

import { useState } from "react";
import { Star, MapPin, Mail, User, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type FormState = "idle" | "loading" | "success" | "error";

export default function Home() {
  const [name, setName] = useState("");
  const [rank, setRank] = useState("");
  const [station, setStation] = useState("");
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rank, station, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "가입 처리 중 오류가 발생했습니다.");
      }

      setFormState("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      setFormState("error");
    }
  };

  const handleReset = () => {
    setName("");
    setRank("");
    setStation("");
    setEmail("");
    setFormState("idle");
    setErrorMsg("");
  };

  return (
    <main className="min-h-screen bg-gradient-kva flex flex-col items-center justify-center p-4 py-12">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-700/5 rounded-full blur-3xl" />
      </div>

      {/* 메인 컨테이너 */}
      <div className="relative w-full max-w-md">
        {/* 상단 헤더 영역 */}
        <div className="text-center mb-8">
          {/* KVA 배지 */}
          <div className="inline-flex items-center gap-2 bg-[#c8102e] text-white text-sm font-bold px-5 py-2 rounded-full mb-6 shadow-lg shadow-red-900/30">
            <Star className="w-4 h-4 fill-white" />
            <span>주한미군전우회 회원 가입 / KDVA Membership</span>
            <Star className="w-4 h-4 fill-white" />
          </div>

          {/* 메인 타이틀 */}
          <h1 className="text-white text-2xl font-bold leading-tight mb-2">
            한미동맹에 당신의 한 표를
            <br />
            더하십시오
          </h1>
          <p className="text-blue-300 text-sm font-medium tracking-widest">
            Add Your Vote to the ROK-US Alliance
          </p>
        </div>

        {/* 폼 카드 */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-black/30 overflow-hidden">
          {/* 카드 상단 컬러 바 */}
          <div className="h-1.5 bg-gradient-to-r from-[#c8102e] via-[#1a3a6b] to-[#c8102e]" />

          <div className="p-8">
            {formState === "success" ? (
              /* 성공 상태 */
              <div className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  가입이 완료되었습니다!
                </h2>
                <h2 className="text-sm font-semibold text-gray-500 mb-3">
                  Registration Complete!
                </h2>
                <p className="text-gray-700 text-base mb-1">
                  <span className="font-semibold text-[#1a3a6b]">{name}</span>님, KDVA 회원이 되신 것을 환영합니다.
                </p>
                <p className="text-gray-500 text-sm">
                  Welcome, <span className="font-semibold text-[#1a3a6b]">{name}</span>! You are now a KDVA member.
                </p>
              </div>
            ) : (
              /* 폼 상태 */
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 이름 필드 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    이름 (한글) / Name <span className="text-[#c8102e]">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="홍길동"
                      required
                      disabled={formState === "loading"}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30 focus:border-[#1a3a6b] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* 계급 필드 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    계급 / Rank
                    <span className="text-gray-400 font-normal text-xs ml-1">(선택사항 / Optional)</span>
                  </label>
                  <select
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    disabled={formState === "loading"}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30 focus:border-[#1a3a6b] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed bg-white"
                  >
                    <option value="">-- 계급 선택 / Select Rank --</option>
                    <optgroup label="병 (Enlisted)">
                      <option value="이병 (Private)">이병 / Private (PVT)</option>
                      <option value="일병 (PFC)">일병 / Private First Class (PFC)</option>
                      <option value="상병 (Corporal)">상병 / Corporal (CPL)</option>
                      <option value="병장 (Sergeant)">병장 / Sergeant (SGT)</option>
                    </optgroup>
                    <optgroup label="부사관 (NCO)">
                      <option value="하사 (Staff Sergeant)">하사 / Staff Sergeant (SSG)</option>
                      <option value="중사 (Sergeant First Class)">중사 / Sergeant First Class (SFC)</option>
                      <option value="상사 (Master Sergeant)">상사 / Master Sergeant (MSG)</option>
                      <option value="원사 (Sergeant Major)">원사 / Sergeant Major (SGM)</option>
                    </optgroup>
                    <optgroup label="장교 (Officer)">
                      <option value="소위 (2nd Lieutenant)">소위 / 2nd Lieutenant (2LT)</option>
                      <option value="중위 (1st Lieutenant)">중위 / 1st Lieutenant (1LT)</option>
                      <option value="대위 (Captain)">대위 / Captain (CPT)</option>
                      <option value="소령 (Major)">소령 / Major (MAJ)</option>
                      <option value="중령 (Lieutenant Colonel)">중령 / Lieutenant Colonel (LTC)</option>
                      <option value="대령 (Colonel)">대령 / Colonel (COL)</option>
                      <option value="준장 (Brigadier General)">준장 / Brigadier General (BG)</option>
                      <option value="소장 (Major General)">소장 / Major General (MG)</option>
                      <option value="중장 (Lieutenant General)">중장 / Lieutenant General (LTG)</option>
                      <option value="대장 (General)">대장 / General (GEN)</option>
                    </optgroup>
                  </select>
                </div>

                {/* 복무지역 필드 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    복무지역 / Unit Location
                    <span className="text-gray-400 font-normal text-xs ml-1">(선택사항 / Optional)</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={station}
                      onChange={(e) => setStation(e.target.value)}
                      placeholder="예: 용산, 평택, 의정부 등"
                      disabled={formState === "loading"}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30 focus:border-[#1a3a6b] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* 이메일 필드 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    이메일 (Email) <span className="text-[#c8102e]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                      disabled={formState === "loading"}
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30 focus:border-[#1a3a6b] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* 에러 메시지 */}
                {formState === "error" && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-red-600 text-sm">{errorMsg}</p>
                  </div>
                )}

                {/* 제출 버튼 */}
                <button
                  type="submit"
                  disabled={formState === "loading"}
                  className="w-full bg-[#c8102e] hover:bg-[#a00d24] active:bg-[#8a0b1e] text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-red-900/20 hover:shadow-red-900/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {formState === "loading" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>처리 중...</span>
                    </>
                  ) : (
                    <span>가입하기 (Join Now)</span>
                  )}
                </button>

                <p className="text-center text-xs text-gray-400 pt-1">
                  가입 시 개인정보는 회원 관리 목적으로만 사용됩니다.
                  <br />
                  Your personal information will only be used for membership management.
                </p>
              </form>
            )}
          </div>

          {/* 카드 하단 */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-center text-xs text-gray-400">
              © {new Date().getFullYear()} Korea Defense Veterans Association (KDVA). All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
