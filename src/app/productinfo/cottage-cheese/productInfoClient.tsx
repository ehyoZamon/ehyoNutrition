"use client";

import Link from "next/link";
import Image from 'next/image';
import styles from './productInfo.module.css';

const ProductInfoClient = () => {
    return (    
        <div className={styles["main-layout"]}>
            
            <div className={styles["content"]}>
                <div className={styles["product-img-container"]}>
                    <Image
                        src="/productinfo/cottage-cheese-with-strawberries.png"
                        alt={"cottage-cheese"}
                        width={600}
                        height={472}
                        className={styles["product-img"]}
                    />
                </div>
                <div className={styles["content-text"]}>
                    <h1 className={styles["product-name"]}>Cottage Cheese 9%</h1>
                    <div className={styles["product-category"]}>Milk products</div>

                    <div style={{background: '#fbf2d8'}} className={styles["product-description"]}>
                        Cottage cheese is a cultured dairy product rich in protein and calcium. It is perfect for a healthy breakfast...
                    </div>

                    <div className={`${styles["macro-nutrients"]} ${styles["product-section"]}`}>
                        <h3>Macro Nutrients (per 100g)</h3>
                        <div style={{ background: '#15837c' }} className={`${styles['macro-nutrient']} ${styles['subelem']}`}>
                          Protein: 18g
                        </div>

                        <div style={{ background: '#f5722c' }} className={`${styles['macro-nutrient']} ${styles['subelem']}`}>
                          Fat: 9g
                        </div>

                        <div style={{ background: '#e4a910' }} className={`${styles['macro-nutrient']} ${styles['subelem']}`}>
                          Carbs: 3g
                        </div>
                    </div>

                    <div style={{background: '#fbf0d9'}} className={`${styles["nutrients-and-microelements"]} ${styles["product-section"]}`}>
                        <h3>Nutrients and microelements</h3>
                        <div style={{ background: '#15837c' }} className={`${styles['macro-nutrient']} ${styles['subelem']}`}>
                          Vitamin B<sub>12</sub>
                        </div>

                        <div style={{ background: '#1a96cd' }} className={`${styles['macro-nutrient']} ${styles['subelem']}`}>
                          Calcium
                        </div>

                        <div style={{ background: '#f5722c' }} className={`${styles['macro-nutrient']} ${styles['subelem']}`}>
                          Phosphorus
                        </div>
                        
                        <div style={{ background: '#e4a910' }} className={`${styles['macro-nutrient']} ${styles['subelem']}`}>
                          Vitamin D
                        </div>
                        
                        <div style={{ background: '#66ab63' }} className={`${styles['macro-nutrient']} ${styles['subelem']}`}>
                          Vitamin A
                        </div>
                    </div>

                    <div style={{background: '#fbf2d8'}} className={`${styles["health-benefits"]} ${styles["product-section"]}`}>
                        <h3>Health Benefits</h3>
                        <ul>
                            <li>Strengthens bones</li>
                            <li>Supports muscle growth</li>
                            <li>Boosts metabolism</li>
                        </ul>
                    </div>

                    <div style={{background: '#fff2f0'}} className={`${styles["precautions"]} ${styles["product-section"]}`}>
                        <h3>Precautions</h3>
                        <ul>
                            <li>Lactose intolerance</li>
                        </ul>
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

                <Link className={styles["nav-link"]} href="#">
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