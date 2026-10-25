import type { Metadata, Viewport } from "next";
import { Anton, Geist, Geist_Mono } from "next/font/google";
import { ViewTransition } from "react";
import { MotionConfig } from "motion/react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/toaster";
import { RevealObserver } from "@/components/reveal-observer";
import "./globals.css";

const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"], display: "swap" });
const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Red Tape — Concept footwear", template: "%s · Red Tape" },
  description:
    "Red Tape is a fictional footwear label: a concept storefront with an interactive 3D shoe, a collection and a live shoe customizer.",
  applicationName: "Red Tape",
  openGraph: {
    title: "Red Tape — Concept footwear",
    description: "A fictional footwear label and design prototype. Nothing here is for sale.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#080808", colorScheme: "dark" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${anton.variable} ${geist.variable} ${geistMono.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <MotionConfig reducedMotion="user">
          <SiteHeader />
          <ViewTransition default="none" update="page">
            <main id="main" tabIndex={-1} className="flex-1 outline-none">
              {children}
            </main>
          </ViewTransition>
          <SiteFooter />
          <Toaster />
        </MotionConfig>
        <RevealObserver />
      </body>
    </html>
  );
}
