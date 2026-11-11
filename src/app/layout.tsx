import type { Metadata, Viewport } from "next";
// Шрифты берутся из npm-пакетов и собираются локально: сборка не ходит
// на fonts.googleapis.com / fonts.gstatic.com и работает офлайн
import LanguageProvider from "@/components/LanguageProvider";
import "./globals.css";
import DBProvider from './providers/DBProvider';
import NativeInit from "@/components/NativeInit";
import SystemBarOverlays from "@/components/SystemBarOverlays";
import AddFoodProvider from "@/components/food-diary/addFoodProvider";
import SplashGate from "@/components/SplashGate";
import BackButtonHandler from "@/components/BackButtonHandler";
import PageTransitionProvider from "@/components/pageTransition/PageTransition";
import PagePrefetcher from "@/components/pageTransition/PagePrefetcher";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { Signika, Inter } from "next/font/google";
import WaterReminderSync from "@/components/WaterReminderSync";

const signika = Signika({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-signika",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-inter",
});

// width=device-width вместо width=375: фиксированная ширина заставляла WebView
// масштабировать страницу и пересчитывать layout при фокусе на input.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Ehyo Nutrition App",
  description: "Ehyo - nutrition app",
  keywords: ["nutrition app", "ehyo", "nutritions", "healthy food"],
  authors: [{ name: "Ehyo Team" }],
  robots: "index, follow",
  other: {
    copyright: "© 2026 Ehyo",
  },
  openGraph: {
    title: "Ehyo Nutrition App",
    description: "Nutrition App - planning healthy food ",
    url: "https://ehyo.com",
    siteName: "Ehyo",
    images: [
      {
        url: "/android-chrome-192x192.png",
        alt: "Ehyo Logo",
      },
    ],
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body>
        <NativeInit />
        <BackButtonHandler />
        <SystemBarOverlays />
        <DBProvider>
          <LanguageProvider>
            <AddFoodProvider>
              <SplashGate />
              <PagePrefetcher />
              <AnalyticsTracker />
              <WaterReminderSync />
              <PageTransitionProvider>{children}</PageTransitionProvider>
            </AddFoodProvider>
          </LanguageProvider>
        </DBProvider>
      </body>
    </html>
  );
}