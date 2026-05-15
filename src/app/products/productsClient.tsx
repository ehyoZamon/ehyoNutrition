"use client";

import Link from "next/link";
import Image from 'next/image';
import styles from './products.module.css';
import OnboardingSlider from "@/components/OnboardingSlider";


const ProductsClient = () => {
    return (    
        <div className={styles["main-layout"]}>
            <div className={styles["search-container"]}>
                <Image
                    src="/products/search.svg"
                    alt={"search-icon"}
                    width={16}
                    height={16}
                    className={styles["search-icon"]}
                />
                <input type="text" placeholder="Search recipes, articles, people..." className={styles['search-input']}/>
            </div>
            
            <div className={styles["content"]}>
                <div className={styles["product"]}>
                    <div className={styles["product-img-container"]}>
                        <Image
                            src="/products/peas.png"
                            alt={"peas"}
                            width={48}
                            height={48}
                        />
                    </div>
                    <div className={styles["product-details"]}>
                        <div className={styles["product-name"]}>
                            Green Fresh Peas
                        </div>
                        <div className={styles["product-category"]}>
                            food/vegetables
                        </div>
                        <div className={styles["product-calories"]}>
                            Calories: 134
                        </div>
                    </div>
                    <div className={styles["put-to-favorite"]}>
                        <Image
                            src="/products/heart.svg"
                            alt={"heart"}
                            width={27}
                            height={27}
                        />
                    </div>
                </div>

                <div className={styles["product"]}>
                    <div className={styles["product-img-container"]}>
                        <Image
                            src="/products/egg.png"
                            alt={"eggs"}
                            width={48}
                            height={48}
                        />
                    </div>
                    <div className={styles["product-details"]}>
                        <div className={styles["product-name"]}>
                            Egg
                        </div>
                        <div className={styles["product-category"]}>
                            food/eggs and diary
                        </div>
                        <div className={styles["product-calories"]}>
                            Calories: 72
                        </div>
                    </div>
                    <div className={styles["put-to-favorite"]}>
                        <Image
                            src="/products/heart-filled.svg"
                            alt={"heart-filled"}
                            width={27}
                            height={27}
                        />
                    </div>
                </div>

                <div className={styles["product"]}>
                    <div className={styles["product-img-container"]}>
                        <Image
                            src="/products/arugula.png"
                            alt={"arugula"}
                            width={48}
                            height={48}
                        />
                    </div>
                    <div className={styles["product-details"]}>
                        <div className={styles["product-name"]}>
                            Arugula
                        </div>
                        <div className={styles["product-category"]}>
                            food/vegetables
                        </div>
                        <div className={styles["product-calories"]}>
                            Calories: 5
                        </div>
                    </div>
                    <div className={styles["put-to-favorite"]}>
                        <Image
                            src="/products/heart.svg"
                            alt={"heart"}
                            width={27}
                            height={27}
                        />
                    </div>
                </div>

                <div className={styles["product"]}>
                    <div className={styles["product-img-container"]}>
                        <Image
                            src="/products/bok-choy.png"
                            alt={"bok-choy"}
                            width={48}
                            height={48}
                        />
                    </div>
                    <div className={styles["product-details"]}>
                        <div className={styles["product-name"]}>
                            Bok-choy
                        </div>
                        <div className={styles["product-category"]}>
                            food/vegetables
                        </div>
                        <div className={styles["product-calories"]}>
                            Calories: 15
                        </div>
                    </div>
                    <div className={styles["put-to-favorite"]}>
                        <Image
                            src="/products/heart.svg"
                            alt={"heart"}
                            width={27}
                            height={27}
                        />
                    </div>
                </div>

                <div className={styles["product"]}>
                    <div className={styles["product-img-container"]}>
                        <Image
                            src="/products/apple.png"
                            alt={"apple"}
                            width={48}
                            height={48}
                        />
                    </div>
                    <div className={styles["product-details"]}>
                        <div className={styles["product-name"]}>
                            Apple
                        </div>
                        <div className={styles["product-category"]}>
                            food/fruits
                        </div>
                        <div className={styles["product-calories"]}>
                            Calories: 20
                        </div>
                    </div>
                    <div className={styles["put-to-favorite"]}>
                        <Image
                            src="/products/heart-filled.svg"
                            alt={"heart-filled"}
                            width={27}
                            height={27}
                        />
                    </div>
                </div>

                <div className={styles["product"]}>
                    <div className={styles["product-img-container"]}>
                        <Image
                            src="/products/peas.png"
                            alt={"peas"}
                            width={48}
                            height={48}
                        />
                    </div>
                    <div className={styles["product-details"]}>
                        <div className={styles["product-name"]}>
                            Green Fresh Peas
                        </div>
                        <div className={styles["product-category"]}>
                            food/vegetables
                        </div>
                        <div className={styles["product-calories"]}>
                            Calories: 134
                        </div>
                    </div>
                    <div className={styles["put-to-favorite"]}>
                        <Image
                            src="/products/heart.svg"
                            alt={"heart"}
                            width={27}
                            height={27}
                        />
                    </div>
                </div>

                <div className={styles["product"]}>
                    <div className={styles["product-img-container"]}>
                        <Image
                            src="/products/egg.png"
                            alt={"eggs"}
                            width={48}
                            height={48}
                        />
                    </div>
                    <div className={styles["product-details"]}>
                        <div className={styles["product-name"]}>
                            Egg
                        </div>
                        <div className={styles["product-category"]}>
                            food/eggs and diary
                        </div>
                        <div className={styles["product-calories"]}>
                            Calories: 72
                        </div>
                    </div>
                    <div className={styles["put-to-favorite"]}>
                        <Image
                            src="/products/heart-filled.svg"
                            alt={"heart-filled"}
                            width={27}
                            height={27}
                        />
                    </div>
                </div>

                <div className={styles["product"]}>
                    <div className={styles["product-img-container"]}>
                        <Image
                            src="/products/arugula.png"
                            alt={"arugula"}
                            width={48}
                            height={48}
                        />
                    </div>
                    <div className={styles["product-details"]}>
                        <div className={styles["product-name"]}>
                            Arugula
                        </div>
                        <div className={styles["product-category"]}>
                            food/vegetables
                        </div>
                        <div className={styles["product-calories"]}>
                            Calories: 5
                        </div>
                    </div>
                    <div className={styles["put-to-favorite"]}>
                        <Image
                            src="/products/heart.svg"
                            alt={"heart"}
                            width={27}
                            height={27}
                        />
                    </div>
                </div>

                <div className={styles["product"]}>
                    <div className={styles["product-img-container"]}>
                        <Image
                            src="/products/bok-choy.png"
                            alt={"bok-choy"}
                            width={48}
                            height={48}
                        />
                    </div>
                    <div className={styles["product-details"]}>
                        <div className={styles["product-name"]}>
                            Bok-choy
                        </div>
                        <div className={styles["product-category"]}>
                            food/vegetables
                        </div>
                        <div className={styles["product-calories"]}>
                            Calories: 15
                        </div>
                    </div>
                    <div className={styles["put-to-favorite"]}>
                        <Image
                            src="/products/heart.svg"
                            alt={"heart"}
                            width={27}
                            height={27}
                        />
                    </div>
                </div>

                <div className={styles["product"]}>
                    <div className={styles["product-img-container"]}>
                        <Image
                            src="/products/apple.png"
                            alt={"apple"}
                            width={48}
                            height={48}
                        />
                    </div>
                    <div className={styles["product-details"]}>
                        <div className={styles["product-name"]}>
                            Apple
                        </div>
                        <div className={styles["product-category"]}>
                            food/fruits
                        </div>
                        <div className={styles["product-calories"]}>
                            Calories: 20
                        </div>
                    </div>
                    <div className={styles["put-to-favorite"]}>
                        <Image
                            src="/products/heart-filled.svg"
                            alt={"heart-filled"}
                            width={27}
                            height={27}
                        />
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

export default ProductsClient;