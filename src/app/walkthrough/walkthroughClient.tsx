"use client";

import Link from "next/link";
import Image from 'next/image';
import styles from './walkthrough.module.css';
import OnboardingSlider from "@/components/OnboardingSlider";


const WalkthroughClient = () => {
    return (    
        <div className={styles["walkthrough-layout"]}>
            <div className={styles["ehyo-logo"]}>
                Ehyo
            </div>
            <OnboardingSlider />
            
            <Link href="/main" className={styles["get-started"]}>
                Get Started
            </Link>
        </div>
    )
}

export default WalkthroughClient;