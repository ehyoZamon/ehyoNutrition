import type { Metadata } from "next";
import { Signika, Nunito, Inter } from "next/font/google";
import "./globals.css";

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

const inter=Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-inter",   
})

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
    url: "https://ehyo.com", // замени на свой домен
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
    <html className={`${signika.variable} ${nunito.variable} ${inter.variable}`} suppressHydrationWarning>
      {/* Next.js сам вставит сюда head на основе объекта metadata выше */}
      <head>
        <meta name="color-scheme" content="light dark" />
      </head>
      <body>
          <div className="main-layout">
            <div className="wrapper">
                {children}
            </div>
          </div>
      </body>
    </html>
  );
}

