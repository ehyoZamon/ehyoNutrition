"use client";

import Link from "next/link";
import Image from 'next/image';
import { useTranslations } from 'next-intl'; // Импортируем хук для переводов
import styles from './main.module.css';
import OnboardingSlider from "@/components/OnboardingSlider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const MainClient = () => {
    // Подключаем блок настроек "Main" из наших JSON файлов
    const t = useTranslations('Main');

    return (    
        <div className={styles["main-layout"]}>
            <LanguageSwitcher />
            <div className={styles["welcome"]}>
                {/* t('hello') автоматически вернет "Hello!" или "Привет!" */}
                <h2>{t('hello')}</h2>
                <p>{t('subtitle')}</p>
            </div>
            
            <div className={styles["content"]}>
                <div className={styles["articles"]}>
                    <div className={styles["article-content"]}>
                        <div className={styles["article-label"]}>
                            {t('articleLabel')}
                        </div>
                        <div className={styles["article-name"]}>
                            {t('articleTitle')}
                        </div>
                        <button className={styles["read-now-button"]}>
                            {t('readNow')} 
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

                <Link href="/vitamins" className={styles["explore-vitamins"]}>
                    {t('exploreVitamins')} 
                    <Image 
                        src="/main/arrow-right-purple.svg" 
                        alt={"arrow-purple"}
                        width={42}
                        height={36} 
                    />
                </Link>

                <div className={styles["choose-your-favorites"]}>
                    <h3>{t('chooseFavorites')}</h3>
                    <div className={styles["favorites-list"]}>
                        <div className={`${styles["favorite"]} ${styles["fruits"]}`}>
                            <Image
                                src="/main/strawberry.svg"
                                alt={"strawberry"}
                                height={48}
                                width={32}
                            />
                            {t('fruits')}
                        </div>

                        <div className={`${styles["favorite"]} ${styles["vegetables"]}`}>
                            <Image
                                src="/main/vegetables.svg"
                                alt={"vegetables"}
                                height={48}
                                width={50}
                            />
                            {t('vegetables')}
                        </div>

                        <div className={`${styles["favorite"]} ${styles["snack"]}`}>
                            <Image
                                src="/main/snack.svg"
                                alt={"snack"}
                                height={48}
                                width={48}
                            />
                            {t('snack')}
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles["navigation"]}>
                <Link className={styles["nav-link"]} href="/main">
                    <Image
                        src="/main/home-green.svg"
                        alt={'home'}
                        width={48}
                        height={48}
                    />
                </Link>

                <Link className={styles["nav-link"]} href="/products">
                    <Image
                        src="/main/products.svg"
                        alt={'products'}
                        width={48}
                        height={48}
                    />
                </Link>
                
                <Link className={styles["nav-link"]} href="/vitamins">
                    <Image
                        src="/main/antioxidant.svg"
                        alt={'antioxidant'}
                        width={48}
                        height={48}
                    />
                </Link>
                
                <Link className={styles["nav-link"]} href="/favorites">
                    <Image
                        src="/main/heart.svg"
                        alt={'heart'}
                        width={48}
                        height={48}
                    />
                </Link>
            </div>
        </div>
    );
};

export default MainClient;