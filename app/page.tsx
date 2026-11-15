"use client";

import { useState } from "react";
import { Star, MapPin, Mail, User, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { SERVICE_STATUSES, rankGroupsFor, type ServiceStatus } from "@/lib/membership";

type FormState = "idle" | "loading" | "success" | "error";

const inputClass =
  "w-full py-3 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30 focus:border-[#1a3a6b] transition-all disabled:bg-gray-50 disabled:cursor-not-allowed";

function Required() {
  return <span className="text-[#c8102e]">*</span>;
}

export default function Home() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | "">("");
  const [rank, setRank] = useState("");
  const [station, setStation] = useState("");
  const [email, setEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const loading = formState === "loading";
  const rankGroups = serviceStatus ? rankGroupsFor(serviceStatus) : [];
  // 군 복무 경험이 없는 민간인은 계급·복무지역 입력 없음
  const isCivilian = serviceStatus === "민간인";

  const selectStatus = (next: ServiceStatus) => {
    if (next === serviceStatus) return;
    setServiceStatus(next);
    // 복무상태마다 선택 가능한 비군인 항목이 다르므로, 새 목록에 없는 계급이면 초기화
    const stillValid = rankGroupsFor(next).some((g) => g.ranks.some((r) => r.value === rank));
    if (!stillValid) setRank("");
    if (next === "민간인") setStation("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!serviceStatus) {
      setErrorMsg("Please select your service status. / 복무상태를 선택해 주세요.");
      setFormState("error");
      return;
    }

    setFormState("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastName,
          firstName,
          serviceStatus,
          rank,
          station,
          email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed. / 가입 처리 중 오류가 발생했습니다.");
      }

      setFormState("success");
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "An unknown error occurred. / 알 수 없는 오류가 발생했습니다."
      );
      setFormState("error");
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-kva flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-700/5 rounded-full blur-3xl" />
      </div>

      {/* 메인 컨테이너 */}
      <div className="relative w-full max-w-md">
        {/* 상단 헤더 영역 */}
        <div className="text-center mb-6 sm:mb-8">
          {/* KDVA 배지 */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#c8102e] text-white text-xs sm:text-sm font-bold px-4 sm:px-5 py-2 rounded-full mb-4 sm:mb-6 shadow-lg shadow-red-900/30">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 fill-white" />
            <span>KDVA Membership / 주한미군전우회 회원 가입</span>
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 fill-white" />
          </div>

          {/* 무료 가입 강조 배지 */}
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-bold px-4 py-1.5 rounded-full border border-white/20">
              <span className="text-yellow-300">✦</span>
              <span>Free to Join / 무료 가입</span>
              <span className="text-yellow-300">✦</span>
            </div>
          </div>
        </div>

        {/* 폼 카드 */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-black/30 overflow-hidden">
          {/* 카드 상단 컬러 바 */}
          <div className="h-1.5 bg-gradient-to-r from-[#c8102e] via-[#1a3a6b] to-[#c8102e]" />

          <div className="p-5 sm:p-8">
            {formState === "success" ? (
              /* 성공 상태 */
              <div className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">Registration Complete!</h2>
                <h2 className="text-sm font-semibold text-gray-500 mb-3">가입이 완료되었습니다!</h2>
                <p className="text-gray-700 text-base mb-1">
                  Welcome,{" "}
                  <span className="font-semibold text-[#1a3a6b]">
                    {`${firstName} ${lastName}`.trim()}
                  </span>
                  ! You are now a KDVA member.
                </p>
                <p className="text-gray-500 text-sm">
                  <span className="font-semibold text-[#1a3a6b]">{`${lastName} ${firstName}`.trim()}</span>
                  님, KDVA 회원이 되신 것을 환영합니다.
                </p>
              </div>
            ) : (
              /* 폼 상태 */
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 이름 필드 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Name / 이름 <Required />
                    <span className="text-gray-400 font-normal text-xs ml-1">
                      (First &amp; last name required / 성과 이름 모두 입력)
                    </span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First / 이름"
                        required
                        autoComplete="given-name"
                        aria-label="First name / 이름"
                        disabled={loading}
                        className={`${inputClass} pl-10 pr-3`}
                      />
                    </div>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last / 성"
                      required
                      autoComplete="family-name"
                      aria-label="Last name / 성"
                      disabled={loading}
                      className={`${inputClass} px-4`}
                    />
                  </div>
                </div>

                {/* 복무상태 필드 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Service Status / 복무상태 <Required />
                  </label>
                  <div
                    role="radiogroup"
                    aria-label="Service Status / 복무상태"
                    aria-required="true"
                    className="grid grid-cols-3 gap-2 sm:gap-3"
                  >
                    {SERVICE_STATUSES.map((s) => {
                      const selected = serviceStatus === s.value;
                      return (
                        <button
                          key={s.value}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => selectStatus(s.value)}
                          disabled={loading}
                          className={`px-1.5 sm:px-3 py-2.5 rounded-xl border text-center transition-all focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/30 disabled:opacity-50 disabled:cursor-not-allowed ${
                            selected
                              ? "border-[#1a3a6b] bg-[#1a3a6b]/5 text-[#1a3a6b]"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          <span className="block text-xs sm:text-sm font-semibold leading-tight">{s.en}</span>
                          <span className="block text-xs text-gray-400">{s.ko}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {isCivilian && (
                  <p className="-mt-3 text-xs text-gray-400">
                    For those who have not served in the military. / 군 복무 경험이 없는 분
                  </p>
                )}

                {/* 계급 필드 (군 미복무 민간인은 해당 없음) */}
                {!isCivilian && (
                <div>
                  <label htmlFor="rank" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Rank / 계급 <Required />
                  </label>
                  <select
                    id="rank"
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    required
                    disabled={loading || !serviceStatus}
                    className={`${inputClass} px-4 bg-white`}
                  >
                    <option value="">
                      {serviceStatus
                        ? "Select Rank / 계급 선택"
                        : "Select status first / 복무상태 먼저 선택"}
                    </option>
                    {rankGroups.map((g) => (
                      <optgroup key={g.en} label={`${g.en} (${g.ko})`}>
                        {g.ranks.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.en} / {r.ko}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {serviceStatus === "예비역" && (
                    <p className="text-xs text-gray-400 mt-1.5">
                      Veterans may choose &quot;Civilian (Civ)&quot; instead of a rank. / 예비역은 계급 대신
                      &quot;민간인(Civ)&quot;을 선택할 수 있습니다.
                    </p>
                  )}
                </div>
                )}

                {/* 복무지역 필드 (군 미복무 민간인은 해당 없음) */}
                {!isCivilian && (
                <div>
                  <label htmlFor="station" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Unit Location / 복무지역
                    <span className="text-gray-400 font-normal text-xs ml-1">(Optional / 선택사항)</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="station"
                      type="text"
                      value={station}
                      onChange={(e) => setStation(e.target.value)}
                      placeholder="e.g. Yongsan, Humphreys, Casey"
                      disabled={loading}
                      className={`${inputClass} pl-10 pr-4`}
                    />
                  </div>
                </div>
                )}

                {/* 이메일 필드 */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Email / 이메일 <Required />
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required
                      autoComplete="email"
                      disabled={loading}
                      className={`${inputClass} pl-10 pr-4`}
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
                  disabled={loading}
                  className="w-full bg-[#c8102e] hover:bg-[#a00d24] active:bg-[#8a0b1e] text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-red-900/20 hover:shadow-red-900/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing... / 처리 중...</span>
                    </>
                  ) : (
                    <span>Join Now (가입하기)</span>
                  )}
                </button>

                <p className="text-center text-xs text-gray-400 pt-1">
                  Your personal information will only be used for membership management.
                  <br />
                  가입 시 개인정보는 회원 관리 목적으로만 사용됩니다.
                </p>
              </form>
            )}
          </div>

          {/* 카드 하단 */}
          <div className="px-5 sm:px-8 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-center text-xs text-gray-400">
              © {new Date().getFullYear()} Korea Defense Veterans Association (KDVA). All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
