"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Preferences } from "@capacitor/preferences";
import { hasCompletedPersonalInfo } from "@/lib/userProfile";

// Если проверка не уложилась в это время — отправляем на онбординг:
// onboardingInfo сам перепроверит профиль и при необходимости уйдёт на /food-diary.
const DECISION_TIMEOUT_MS = 4000;
const FALLBACK_ROUTE = "/onboardingInfo";

async function decideRoute(): Promise<string> {
    // 1) Профиль заполнен полностью (имя, пол, дата рождения, вес, рост) -> в приложение
    try {
        if (await hasCompletedPersonalInfo()) {
            return "/food-diary";
        }
    } catch (error) {
        console.error("hasCompletedPersonalInfo failed:", error);
    }

    // 2) Профиль НЕ заполнен. Если слайды walkthrough уже показывали —
    //    сразу ведём на ввод данных, иначе показываем walkthrough.
    try {
        const [seen, legacy] = await Promise.all([
            Preferences.get({ key: "walkthroughSeen" }),
            // старый флаг: раньше ставился при нажатии "Get Started"
            Preferences.get({ key: "onboardingCompleted" }),
        ]);
        if (seen.value === "true" || legacy.value === "true") {
            return "/onboardingInfo";
        }
    } catch (error) {
        console.error("Preferences read failed:", error);
    }

    return "/walkthrough";
}

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const target = await Promise.race([
                decideRoute(),
                new Promise<string>((resolve) =>
                    setTimeout(() => resolve(FALLBACK_ROUTE), DECISION_TIMEOUT_MS)
                ),
            ]);
            if (!cancelled) router.replace(target);
        })();

        return () => {
            cancelled = true;
        };
    }, [router]);

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "var(--app-bg, #ffffff)",
            }}
        />
    );
}