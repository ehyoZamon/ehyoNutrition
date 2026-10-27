"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { hideSplash } from "@/lib/splash";

export default function SplashGate() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname && pathname !== "/") hideSplash();
  }, [pathname]);
  return null;
}