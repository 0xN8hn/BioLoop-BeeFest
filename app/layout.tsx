/** BioLoop app shell — Manrope for the landing narrative, Geist variables retained for existing product views. */
import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "BioLoop — Dari Sisa Makanan, Jadi Sumber Daya",
  description: "BioLoop menghubungkan bisnis makanan dengan mitra pengolah Black Soldier Fly untuk mengarahkan sisa organik dari dapur.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
