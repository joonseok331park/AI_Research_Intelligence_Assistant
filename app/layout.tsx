import type { Metadata } from "next";
import type { CSSProperties } from "react";
import {
  Inter,
  Inter_Tight,
  Lora,
  Noto_Serif_KR,
  Open_Sans,
  Oswald,
} from "next/font/google";
import { PRODUCT_CONFIG } from "@/src/config/product";
import "./globals.css";
import "./aria-themes.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  weight: ["400", "500", "600"],
  display: "swap",
});
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ["400", "500", "700"],
  display: "swap",
});
const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["400", "500"],
  display: "swap",
});
const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});
const notoSerifKr = Noto_Serif_KR({
  weight: ["500", "700"],
  variable: "--font-noto-serif-kr",
  preload: false,
  display: "swap",
});

const fontVariables = [
  inter.variable,
  interTight.variable,
  lora.variable,
  oswald.variable,
  openSans.variable,
  notoSerifKr.variable,
].join(" ");

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: `${PRODUCT_CONFIG.name} — 근거가 연결된 랩 프로토콜`,
    template: `%s · ${PRODUCT_CONFIG.name}`,
  },
  description: PRODUCT_CONFIG.description,
  icons: {
    icon: [{ url: PRODUCT_CONFIG.logoSrc, type: "image/png" }],
    shortcut: PRODUCT_CONFIG.logoSrc,
    apple: PRODUCT_CONFIG.logoSrc,
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: PRODUCT_CONFIG.fullName,
    title: `${PRODUCT_CONFIG.name} — 근거가 연결된 랩 프로토콜`,
    description: PRODUCT_CONFIG.description,
    images: [
      {
        url: PRODUCT_CONFIG.socialImageSrc,
        width: 1265,
        height: 720,
        alt: "ARIA — AI Research Intelligence Assistant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${PRODUCT_CONFIG.name} — 근거가 연결된 랩 프로토콜`,
    description: PRODUCT_CONFIG.description,
    images: [PRODUCT_CONFIG.socialImageSrc],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={fontVariables} lang="ko">
      <body
        style={
          {
            "--aria-logo-url": `url("${PRODUCT_CONFIG.logoSrc}")`,
          } as CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
