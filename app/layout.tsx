import type { Metadata } from "next";
import { Prompt, Outfit } from "next/font/google";
import Link from "next/link";
import ClientLayout from "./components/ClientLayout";
import "./globals.css";

const prompt = Prompt({
  variable: "--font-geist-sans", // Overriding Next.js default var for simplicity
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "สัปดาห์วิทยาศาสตร์ โรงเรียนวัชรวิทยา",
  description: "กิจกรรมสัปดาห์วิทยาศาสตร์ โรงเรียนวัชรวิทยา ร่วมแข่งขันและส่งผลงานออนไลน์",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${prompt.variable} ${outfit.variable} h-full antialiased`}
    >
      <head>
        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet' />
      </head>
      <body className="min-h-full flex flex-col font-sans text-dark overflow-x-hidden bg-[#f8fafc]">
        <div className="flex flex-col min-h-screen overflow-x-hidden w-full max-w-[100vw] relative">
          <ClientLayout>
            {children}
          </ClientLayout>
        </div>
      </body>
    </html>
  );
}
