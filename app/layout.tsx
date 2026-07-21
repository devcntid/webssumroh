import type { Metadata } from "next";
import { Inter, Ubuntu, Amiri } from "next/font/google";
import "./globals.css";

const fontBody = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const fontHeading = Ubuntu({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-ubuntu",
});

const fontArabic = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic"],
  variable: "--font-amiri",
});

export const metadata: Metadata = {
  title: "SS Umroh | Travel Umroh Terpercaya Berizin Kemenag",
  description:
    "Biro perjalanan ibadah umroh dan haji khusus resmi berizin Kemenag RI (SK PPIU No. U.108/2021).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${fontBody.variable} ${fontHeading.variable} ${fontArabic.variable} antialiased`}
    >
      <head>
        {/* Warm up connections to external origins the browser contacts on
            every page: the logo image host and the WhatsApp CTA target. */}
        <link rel="preconnect" href="https://ssumroh.id" />
        <link rel="dns-prefetch" href="https://ssumroh.id" />
        <link rel="dns-prefetch" href="https://wa.me" />
      </head>
      <body>{children}</body>
    </html>
  );
}
