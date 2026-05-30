"use client";

import Link from "next/link";
import styles from './walkthrough.module.css';
import OnboardingSlider from "@/components/OnboardingSlider";

const WalkthroughClient = () => {
    const handleGetStarted = () => {
        // Устанавливаем куку, которая живет 365 дней
        document.cookie = "hasSeenWalkthrough=true; path=/; max-age=31536000";
    };

    return (        
        <div className={styles["walkthrough-layout"]}>
            {/* ... ваш код ... */}
            <Link 
                href="/main" 
                className={styles["get-started"]}
                onClick={handleGetStarted}
            >
                Get Started
            </Link>
        </div>
    )
}

export default WalkthroughClient;