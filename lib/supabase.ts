import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 클라이언트 사이드 / 공개 작업용
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 서버 사이드 / 관리자 작업용 (Service Role)
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export type Member = {
  id: number;
  name: string;
  station: string | null;
  email: string;
  created_at: string;
};
