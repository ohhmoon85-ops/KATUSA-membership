import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "카투사 연합회(KVA) 회원 모집",
  description:
    "한미동맹에 당신의 한 표를 더하십시오. 카투사 연합회(KVA) 회원에 가입하세요.",
  openGraph: {
    title: "카투사 연합회(KVA) 회원 모집",
    description: "Add Your Vote to the ROK-US Alliance",
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
