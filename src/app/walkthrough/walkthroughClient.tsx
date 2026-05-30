"use client";

import Link from "next/link";
import styles from './walkthrough.module.css';
import OnboardingSlider from "@/components/OnboardingSlider";

const WalkthroughClient = () => {
    const handleGetStarted = () => {
        // Устанавливаем куку
        document.cookie = "hasSeenWalkthrough=true; path=/; max-age=31536000; SameSite=Lax";
        console.log("Cookie set!"); // Для отладки в Android WebView
    };

    return (        
        <div className={styles["walkthrough-layout"]}>
            <div className={styles["ehyo-logo"]}>
                Ehyo
            </div>
            <OnboardingSlider />
            
            {/* Добавляем onClick */}
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