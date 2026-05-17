"use client";

import Link from "next/link";
import Image from 'next/image';
import styles from './productInfo.module.css';

const ProductInfoClient = () => {
    return (    
        <div className={styles["main-layout"]}>
            <div className={styles["product-name"]}>
                <Link href="/products">
                    <Image
                        src="/back.svg"
                        alt={"back"}
                        width={29}
                        height={29}
                        className={styles["back"]}
                    />
                </Link>
                    
                bok choy
                <Image
                    src="/productinfo/leaves.svg"
                    alt={"leaves"}
                    width={42}
                    height={44}
                    className={styles["leaves"]}
                />
            </div>
            
            <div className={styles["content"]}>
                <Image
                    src="/productinfo/boyChokChart.png"
                    alt={"boyChokChart"}
                    width={247}
                    height={203}
                    className={styles["productChart"]}
                />

                <div className={styles["productConsistency"]}>  
                    <div className={styles["productCalories"]}>
                        15 calories
                    </div>
                    <div className={styles["productMass"]}>
                        <div className={styles["productMassElem"]}><div className={styles["dot"]} style={{ backgroundColor: "#ffa500" }}></div>protein 2g</div>
                        <div className={styles["productMassElem"]}><div className={styles["dot"]} style={{ backgroundColor: "#008000" }}></div>total carbohydrate 0.5 g</div>
                        <div className={styles["productMassElem"]}><div className={styles["dot"]} style={{ backgroundColor: "#f00" }}></div>total fat 0.2 g</div>  
                    </div>
                    <div className={styles["vitamins"]}>
                        Vitamin&nbsp;A&nbsp;144%, Vitamin&nbsp;C&nbsp;74%, Calcium&nbsp;12%, Iron&nbsp;10%
                    </div>
                    <div className={styles["comment"]}>
                        <div className={styles["dot"]}></div><p>Percent Daily Values are based on a 2000 calorie diet.</p>
                    </div>
                </div>
            </div>

            

            <div className={styles["navigation"]}>
                <Link className={styles["nav-link"]} href="/main">
                    <Image
                        src="/main/home.svg"
                        alt={'home'}
                        width={48}
                        height={48}
                    />
                </Link>

                <Link className={styles["nav-link"]} href="/#">
                    <Image
                        src="/main/products-green.svg"
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
    )
}

export default ProductInfoClient;