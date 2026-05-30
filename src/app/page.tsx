"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Preferences } from "@capacitor/preferences";

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        const checkOnboarding = async () => {
            const { value } = await Preferences.get({
                key: "onboardingCompleted",
            });

            if (value === "true") {
                router.replace("/main");
            } else {
                router.replace("/walkthrough");
            }
        };

        checkOnboarding();
    }, [router]);

    return null;
}