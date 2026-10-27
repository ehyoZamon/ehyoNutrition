"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Preferences } from "@capacitor/preferences";

import styles from "./walkthrough.module.css";
import OnboardingSlider from "@/components/OnboardingSlider";

const WalkthroughClient = () => {
    const router = useRouter();

    // Запоминаем только то, что слайды уже показаны.
    // Сам онбординг считается пройденным ТОЛЬКО когда сохранён профиль
    // (проверяется на главной через hasCompletedPersonalInfo).
    const handleGetStarted = async (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        try {
            await Preferences.set({ key: "walkthroughSeen", value: "true" });
        } catch (error) {
            console.error("Failed to save walkthroughSeen:", error);
        }
        router.push("/onboardingInfo");
    };

    return (
        <div className={styles["walkthrough-layout"]}>
            <div className={styles["ehyo-logo"]}>
                Ehyo
            </div>

            <OnboardingSlider />

            <Link
                prefetch={false}
                href="/onboardingInfo"
                className={styles["get-started"]}
                onClick={handleGetStarted}
            >
                Get Started
            </Link>
        </div>
    );
};

export default WalkthroughClient;