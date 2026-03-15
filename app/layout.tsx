import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "주한미군전우회(KDVA) 회원 모집",
  description:
    "무료 가입 | 한미동맹에 당신의 한 표를 더하십시오. 주한미군전우회(KDVA) 회원에 지금 바로 무료로 가입하세요.",
  openGraph: {
    title: "주한미군전우회(KDVA) 회원 모집 — 무료 가입",
    description: "Free to Join | Add Your Vote to the ROK-US Alliance",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
