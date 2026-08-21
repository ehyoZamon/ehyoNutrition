import type { Metadata } from "next";
import { Signika, Nunito, Inter } from "next/font/google";
import LanguageProvider from "@/components/LanguageProvider"; // Импортируем наш провайдер
import "./globals.css";
import DBProvider from './providers/DBProvider';

const signika = Signika({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-signika", 
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-nunito", 
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-inter",   
});

export const metadata: Metadata = {
  title: "Ehyo Nutrition App",
  description: "Ehyo - nutrition app",
  keywords: ["nutrition app", "ehyo", "nutritions", "healthy food"],
  authors: [{ name: "Ehyo Team" }],
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1, user-scalable=no",
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
        url: "/images/m-logo-400.png",
        alt: "Ehyo Logo",
      },
    ],
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/images/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Тег <html> изначально получает дефолтный язык en, но LanguageProvider обновит его динамически
    <html lang="en" className={`${signika.variable} ${nunito.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body>
        
        {/* Оборачиваем все дочерние страницы в мультиязычный контекст */}
        <DBProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </DBProvider>
      </body>
    </html>
  );
}