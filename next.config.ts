import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './src/i18n/request.ts' // Путь к файлу, созданному на Шаге 1
);

const nextConfig: NextConfig = {
  output: "export",

  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
  },
};

export default withNextIntl(nextConfig);