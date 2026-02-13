import type { Metadata } from "next";
import { Press_Start_2P, Inter } from "next/font/google";
import "./globals.css";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-arcade",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://anish-trading-cards.vercel.app"
  ),
  title: "Into the Anish-Verse",
  description:
    "Create your own Anish trading card! AI-generated character portraits in arcade style.",
  openGraph: {
    title: "Into the Anish-Verse",
    description: "Create your own Anish trading card!",
    images: ["/assets/partiful-cover.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${pressStart2P.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
