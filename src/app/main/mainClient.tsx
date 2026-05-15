"use client";

import Link from "next/link";
import Image from 'next/image';
import styles from './main.module.css';
import OnboardingSlider from "@/components/OnboardingSlider";


const MainClient = () => {
    return (    
        <div className={styles["main-layout"]}>
            <div className={styles["welcome"]}>
                <h2>Hello!</h2>
                <p>Find, track and eat heathy food.</p>
            </div>
            
            <div className={styles["content"]}>
                <div className={styles["articles"]}>
                    <div className={styles["article-content"]}>
                        <div className={styles["article-label"]}>
                            Article
                        </div>
                        <div className={styles["article-name"]}>
                            The pros and cons of fast food.
                        </div>
                        <button className={styles["read-now-button"]}>
                            Read Now 
                            <Image
                                src="/main/arrow-right.svg" 
                                alt={"arrow-right"}  
                                width={12}
                                height={12}                  
                            />
                        </button>
                    </div>
                    <div className={styles["article-banner"]}>
                        <Image
                            src="/main/burger.svg" 
                            alt={"burger"}  
                            width={111}
                            height={120}                  
                        />
                    </div>
                </div>

                <Link href="#" className={styles["explore-vitamins"]}>
                    Explore Vitamins 
                    <Image 
                        src="/main/arrow-right-purple.svg" 
                        alt={"arrow-purple"}
                        width={42}
                        height={36} 
                    />
                </Link>

                <div className={styles["choose-your-favorites"]}>
                    <h3>Choose Your Favorites</h3>
                    <div className={styles["favorites-list"]}>
                        <div className={`${styles["favorite"]} ${styles["fruits"]}`}>
                            <Image
                                src="/main/strawberry.svg"
                                alt={"strawberry"}
                                height={48}
                                width={32}
                            />
                            Fruits
                        </div>

                        <div className={`${styles["favorite"]} ${styles["vegetables"]}`}>
                            <Image
                                src="/main/vegetables.svg"
                                alt={"vegetables"}
                                height={48}
                                width={50}
                            />
                            Vegetables
                        </div>

                        <div className={`${styles["favorite"]} ${styles["snack"]}`}>
                            <Image
                                src="/main/snack.svg"
                                alt={"snack"}
                                height={48}
                                width={48}
                            />
                            Snack
                        </div>
                    </div>
                </div>
            </div>

            

            <div className={styles["navigation"]}>
                <Link className={styles["nav-link"]} href="#">
                    <Image
                        src="/main/home-green.svg"
                        alt={'home'}
                        width={48}
                        height={48}
                    />
                </Link>

                <Link className={styles["nav-link"]} href="#">
                    <Image
                        src="/main/products.svg"
                        alt={'products'}
                        width={48}
                        height={48}
                    />
                </Link>
                
                <Link className={styles["nav-link"]} href="#">
                    <Image
                        src="/main/antioxidant.svg"
                        alt={'antioxidant'}
                        width={48}
                        height={48}
                    />
                </Link>

                
                <Link className={styles["nav-link"]} href="#">
                    <Image
                        src="/main/heart.svg"
                        alt={'heart'}
                        width={48}
                        height={48}
                    />
                </Link>
            </div>
        </div>
    )
}

export default MainClient;