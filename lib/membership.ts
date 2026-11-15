// 가입 폼(클라이언트)과 가입 API(서버)가 함께 쓰는 복무상태·계급 정의

export type ServiceStatus = "예비역" | "현역" | "민간인";

export const SERVICE_STATUSES: { value: ServiceStatus; en: string; ko: string }[] = [
  { value: "예비역", en: "Veteran / Reserve", ko: "예비역" },
  { value: "현역", en: "Active Duty", ko: "현역" },
  { value: "민간인", en: "Civilian", ko: "민간인" },
];

export const isServiceStatus = (v: unknown): v is ServiceStatus =>
  SERVICE_STATUSES.some((s) => s.value === v);

// 군 복무 경험이 없는 민간인 가입자의 계급 저장값 (계급 선택 없음)
export const CIVILIAN_NO_SERVICE = "민간인 (Civilian)";

export type RankOption = { value: string; en: string; ko: string };
export type RankGroup = { en: string; ko: string; ranks: RankOption[] };

// value는 DB에 저장되는 형식이므로 기존 데이터와 맞추기 위해 변경하지 않는다.
export const MILITARY_RANK_GROUPS: RankGroup[] = [
  {
    en: "Enlisted",
    ko: "병",
    ranks: [
      { value: "이병 (Private)", en: "Private (PVT)", ko: "이병" },
      { value: "일병 (PFC)", en: "Private First Class (PFC)", ko: "일병" },
      { value: "상병 (Corporal)", en: "Corporal (CPL)", ko: "상병" },
      { value: "병장 (Sergeant)", en: "Sergeant (SGT)", ko: "병장" },
    ],
  },
  {
    en: "NCO",
    ko: "부사관",
    ranks: [
      { value: "하사 (Staff Sergeant)", en: "Staff Sergeant (SSG)", ko: "하사" },
      { value: "중사 (Sergeant First Class)", en: "Sergeant First Class (SFC)", ko: "중사" },
      { value: "상사 (Master Sergeant)", en: "Master Sergeant (MSG)", ko: "상사" },
      { value: "원사 (Sergeant Major)", en: "Sergeant Major (SGM)", ko: "원사" },
    ],
  },
  {
    en: "Warrant Officer",
    ko: "준사관",
    ranks: [{ value: "준위 (Warrant Officer)", en: "Warrant Officer (WO)", ko: "준위" }],
  },
  {
    en: "Officer",
    ko: "장교",
    ranks: [
      { value: "소위 (2nd Lieutenant)", en: "2nd Lieutenant (2LT)", ko: "소위" },
      { value: "중위 (1st Lieutenant)", en: "1st Lieutenant (1LT)", ko: "중위" },
      { value: "대위 (Captain)", en: "Captain (CPT)", ko: "대위" },
      { value: "소령 (Major)", en: "Major (MAJ)", ko: "소령" },
      { value: "중령 (Lieutenant Colonel)", en: "Lieutenant Colonel (LTC)", ko: "중령" },
      { value: "대령 (Colonel)", en: "Colonel (COL)", ko: "대령" },
      { value: "준장 (Brigadier General)", en: "Brigadier General (BG)", ko: "준장" },
      { value: "소장 (Major General)", en: "Major General (MG)", ko: "소장" },
      { value: "중장 (Lieutenant General)", en: "Lieutenant General (LTG)", ko: "중장" },
      { value: "대장 (General)", en: "General (GEN)", ko: "대장" },
    ],
  },
];

// 예비역 중 계급 대신 민간인(Civ)으로 표기하길 원하는 경우
export const VETERAN_CIV: RankOption = { value: "민간인 (Civ)", en: "Civilian (Civ)", ko: "민간인" };
// 현역 범주의 비군인 (군무원)
export const ACTIVE_CIVILIAN: RankOption = {
  value: "군무원 (Army Civilian Employee)",
  en: "Army Civilian Employee",
  ko: "군무원",
};

/** 복무상태별로 선택 가능한 계급 그룹 (민간인은 계급 없음) */
export function rankGroupsFor(status: ServiceStatus): RankGroup[] {
  if (status === "민간인") return [];
  const nonMilitary = status === "예비역" ? VETERAN_CIV : ACTIVE_CIVILIAN;
  return [...MILITARY_RANK_GROUPS, { en: "Non-Military", ko: "비군인", ranks: [nonMilitary] }];
}

const MILITARY_RANK_VALUES = new Set(
  MILITARY_RANK_GROUPS.flatMap((g) => g.ranks.map((r) => r.value))
);

/**
 * 복무상태 + 계급을 DB 저장용 문자열로 조립한다. 허용되지 않는 조합이면 null.
 *  - 예비역 + 군 계급 → "예비역 병장 (Sergeant, Ret.)"
 *  - 현역   + 군 계급 → "현역 병장 (Sergeant)"
 *  - 예비역 + Civ     → "예비역 민간인 (Civ)"
 *  - 현역   + 군무원  → "군무원 (Army Civilian Employee)"
 *  - 민간인 (군 미복무) → "민간인 (Civilian)"  (계급 입력 무시)
 */
export function composeRank(status: unknown, rank: unknown): string | null {
  if (!isServiceStatus(status)) return null;
  if (status === "민간인") return CIVILIAN_NO_SERVICE;
  if (typeof rank !== "string") return null;

  if (MILITARY_RANK_VALUES.has(rank)) {
    const rankText = status === "예비역" ? rank.replace(/\)$/, ", Ret.)") : rank;
    return `${status} ${rankText}`;
  }
  if (status === "예비역" && rank === VETERAN_CIV.value) return `예비역 ${VETERAN_CIV.value}`;
  if (status === "현역" && rank === ACTIVE_CIVILIAN.value) return ACTIVE_CIVILIAN.value;
  return null;
}

// ── 거주지 (Current Residence) ─────────────────────────────────
// value는 DB(members.country)에 저장되는 값
export type CountryCode = "US" | "KR" | "OTHER";

export const COUNTRIES: { code: CountryCode; value: string; en: string; ko: string }[] = [
  { code: "US", value: "미국", en: "United States", ko: "미국" },
  { code: "KR", value: "대한민국", en: "South Korea", ko: "대한민국" },
  { code: "OTHER", value: "", en: "Other", ko: "기타" },
];

// 미국 50개 주 + DC + 미군 관련 주요 해외영토. DB(members.state)에는 "California (CA)" 형태로 저장
export const US_STATES: { name: string; abbr: string }[] = [
  { name: "Alabama", abbr: "AL" }, { name: "Alaska", abbr: "AK" },
  { name: "Arizona", abbr: "AZ" }, { name: "Arkansas", abbr: "AR" },
  { name: "California", abbr: "CA" }, { name: "Colorado", abbr: "CO" },
  { name: "Connecticut", abbr: "CT" }, { name: "Delaware", abbr: "DE" },
  { name: "District of Columbia", abbr: "DC" }, { name: "Florida", abbr: "FL" },
  { name: "Georgia", abbr: "GA" }, { name: "Hawaii", abbr: "HI" },
  { name: "Idaho", abbr: "ID" }, { name: "Illinois", abbr: "IL" },
  { name: "Indiana", abbr: "IN" }, { name: "Iowa", abbr: "IA" },
  { name: "Kansas", abbr: "KS" }, { name: "Kentucky", abbr: "KY" },
  { name: "Louisiana", abbr: "LA" }, { name: "Maine", abbr: "ME" },
  { name: "Maryland", abbr: "MD" }, { name: "Massachusetts", abbr: "MA" },
  { name: "Michigan", abbr: "MI" }, { name: "Minnesota", abbr: "MN" },
  { name: "Mississippi", abbr: "MS" }, { name: "Missouri", abbr: "MO" },
  { name: "Montana", abbr: "MT" }, { name: "Nebraska", abbr: "NE" },
  { name: "Nevada", abbr: "NV" }, { name: "New Hampshire", abbr: "NH" },
  { name: "New Jersey", abbr: "NJ" }, { name: "New Mexico", abbr: "NM" },
  { name: "New York", abbr: "NY" }, { name: "North Carolina", abbr: "NC" },
  { name: "North Dakota", abbr: "ND" }, { name: "Ohio", abbr: "OH" },
  { name: "Oklahoma", abbr: "OK" }, { name: "Oregon", abbr: "OR" },
  { name: "Pennsylvania", abbr: "PA" }, { name: "Rhode Island", abbr: "RI" },
  { name: "South Carolina", abbr: "SC" }, { name: "South Dakota", abbr: "SD" },
  { name: "Tennessee", abbr: "TN" }, { name: "Texas", abbr: "TX" },
  { name: "Utah", abbr: "UT" }, { name: "Vermont", abbr: "VT" },
  { name: "Virginia", abbr: "VA" }, { name: "Washington", abbr: "WA" },
  { name: "West Virginia", abbr: "WV" }, { name: "Wisconsin", abbr: "WI" },
  { name: "Wyoming", abbr: "WY" },
  { name: "Guam", abbr: "GU" }, { name: "Puerto Rico", abbr: "PR" },
];

export const usStateLabel = (s: { name: string; abbr: string }) => `${s.name} (${s.abbr})`;
const US_STATE_LABELS = new Set(US_STATES.map(usStateLabel));

/**
 * 거주지를 검증해 DB 저장값으로 변환한다. 잘못된 입력이면 error 메시지를 돌려준다.
 *  - US    → { country: "미국", state: "California (CA)" }  (주 필수)
 *  - KR    → { country: "대한민국", state: null }
 *  - OTHER → { country: <직접 입력한 국가명>, state: null }
 */
export function composeResidence(
  countryCode: unknown,
  state: unknown,
  otherCountry: unknown
): { country: string; state: string | null } | { error: string } {
  if (countryCode === "US") {
    if (typeof state !== "string" || !US_STATE_LABELS.has(state)) {
      return { error: "Please select your state. / 거주 주(State)를 선택해 주세요." };
    }
    return { country: "미국", state };
  }
  if (countryCode === "KR") return { country: "대한민국", state: null };
  if (countryCode === "OTHER") {
    const name = typeof otherCountry === "string" ? otherCountry.trim().slice(0, 50) : "";
    if (!name) return { error: "Please enter your country. / 거주 국가를 입력해 주세요." };
    return { country: name, state: null };
  }
  return { error: "Please select where you currently live. / 현재 거주지를 선택해 주세요." };
}
