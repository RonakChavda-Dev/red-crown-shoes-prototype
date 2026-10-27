import type { Metadata, Viewport } from "next";
import { Anton, Geist, Geist_Mono } from "next/font/google";
import { ViewTransition } from "react";
import { MotionConfig } from "motion/react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/toaster";
import { RevealObserver } from "@/components/reveal-observer";
import { LoadingScreen } from "@/components/loading-screen";
import { ViewTransitionGuard } from "@/components/view-transition-guard";
import { pageMetadata, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/seo";
import "./globals.css";

const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"], display: "swap" });
const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...pageMetadata({
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    absoluteTitle: true,
    description:
      "Red Crown is a fictional footwear label: a concept storefront with an interactive 3D shoe, a collection and a live shoe customizer.",
    path: "/",
  }),
  title: { default: `${SITE_NAME} — ${SITE_TAGLINE}`, template: `%s · ${SITE_NAME}` },
  applicationName: SITE_NAME,
  keywords: ["concept footwear", "3D shoe", "shoe customizer", "sneaker design", "design prototype", "Red Crown"],
  category: "design",
  formatDetection: { telephone: false, email: false, address: false },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
};

export const viewport: Viewport = { themeColor: "#080808", colorScheme: "dark" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${anton.variable} ${geist.variable} ${geistMono.variable}`}>
      <body className="flex min-h-dvh flex-col" suppressHydrationWarning>
        <LoadingScreen />
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
        <ViewTransitionGuard />
      </body>
    </html>
  );
}
