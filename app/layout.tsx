import type { Metadata } from "next";
import { Nanum_Myeongjo, Gowun_Dodum } from "next/font/google";
import "./globals.css";

// 디스플레이·한자 = 명조(전통 격조), 본문 = 고운돋움(담백한 고딕).
const myeongjo = Nanum_Myeongjo({
  variable: "--font-myeongjo",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});
const gowun = Gowun_Dodum({
  variable: "--font-gowun",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "사주팔자 — 정밀 만세력",
  description: "생년월일시로 보는 내 사주. 24절기·진태양시 보정으로 정확하게.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${myeongjo.variable} ${gowun.variable} h-full antialiased`}
    >
      <head>
        {/* 라이트 기본 · 저장된 선택이 dark일 때만 적용(FOUC 방지, 깜빡임 없이) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if((localStorage.getItem('theme'))==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
