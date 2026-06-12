"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Preferences } from "@capacitor/preferences";

import styles from "./walkthrough.module.css";
import OnboardingSlider from "@/components/OnboardingSlider";

const WalkthroughClient = () => {
    const router = useRouter();

    useEffect(() => {
        const checkOnboarding = async () => {
            const { value } = await Preferences.get({
                key: "onboardingCompleted",
            });

            if (value === "true") {
                router.replace("/main");
            }
        };

        checkOnboarding();
    }, [router]);

    const handleGetStarted = async () => {
        await Preferences.set({
            key: "onboardingCompleted",
            value: "true",
        });
    };

    return (
        <div className={styles["walkthrough-layout"]}>
            <div className={styles["ehyo-logo"]}>
                Ehyo
            </div>

            <OnboardingSlider />

            <Link
                prefetch={false}
                href="/main"
                className={styles["get-started"]}
                onClick={handleGetStarted}
            >
                Get Started
            </Link>
        </div>
    );
};

export default WalkthroughClient;