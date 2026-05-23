"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import styles from "../vitaminInfo.module.css";

const VitaminInfoClient = () => {
    const [activeTab, setActiveTab] = useState('deficiency');
    return (    
        <div className={styles["main-layout"]}>
            <div className={styles["content-section"]}>
                <div className={styles["content"]}>
                    <div className={styles["vitamin-img-container"]}>
                        <Link href="/vitamins" className={styles["backlink"]}>
                            <Image src="/back.svg"
                            alt={"back"}
                            width={20}
                            height={20}
                            />
                        </Link>
                        <Image
                            src="/vitamininfo/nutrients.png"
                            alt={"nutrients"}
                            width={600}
                            height={472}
                            className={styles["vitamin-img"]}
                        />
                    </div>
                    <div className={styles["content-text"]}>
                        <h1 className={styles["vitamin-name"]}>Vitamin K</h1>
                        <div className={styles["vitamin-category"]}>Nutrients/vitamins</div>

                        <div style={{background: 'none'}} className={styles["vitamin-description"]}>
                            <ul>
                                <li>Vitamin K1 (Phylloquinone): Found primarily in plant foods, especially green leafy vegetables.</li>
                                <li>Vitamin K2 (Vitamin K2): Found in fermented foods, animal products, and synthesized by beneficial bacteria in the human gut.</li>
                            </ul>
                            Vitamin K is a fat-soluble nutrient best known as the body's internal "coagulation captain." The "K" actually comes from the German word Koagulation, which reflects its primary job. Because it is fat-soluble, it requires dietary fats to be absorbed properly and is stored in small amounts in liver and fatty tissues, though the body recycles it efficiently to maintain healthy levels.
                        </div>

                        <div style={{background: '#fbf2d8'}} className={`${styles["key-functions"]} ${styles["vitamin-section"]}`}>
                            <h3>Key Functions</h3>
                            Vitamin K works behind the scenes to keep your circulatory and skeletal systems structurally sound:
                            <ul>
                                <li><b>Blood Clotting (Coagulation):</b> It acts as an indispensable trigger for the liver to produce several critical proteins (clotting factors) that allow your blood to clot when you get a cut, preventing you from bleeding excessively.</li>
                                <li><b>Bone Health & Mineralization:</b> While Calcium builds the bone and Vitamin D absorbs it, Vitamin K acts as the traffic controller. It activates a protein called osteocalcin, which binds calcium directly to the bone matrix, keeping bones dense and strong.</li>
                                <li><b>Cardiovascular Protection:</b> It activates the Matrix Gla Protein (MGP), which helps prevent calcium from depositing inside the walls of your arteries. By keeping calcium out of your blood vessels, it helps prevent arterial hardening.</li>
                            </ul>
                        </div>

                        <div style={{background: "none"}} className={`${styles["top-food-sources"]} ${styles["vitamin-section"]}`}>
                            <h3>Top Food Sources</h3>
                            <div className={styles["food-sources-container"]}>
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/kale.png"}
                                        alt={"kale"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Kale</div>
                                </div>
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/spinach.png"}
                                        alt={"spinach"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Spinach</div>
                                </div>
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/collard.png"}
                                        alt={"collard-greens"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Collard Greens</div>
                                </div>

                                
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/swiss-chard.png"}
                                        alt={"swiss-chard"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Swiss chard</div>
                                </div>
                                
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/turnip.png"}
                                        alt={"turnip"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Turnip</div>
                                </div>
                                
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/brussels-sprouts.png"}
                                        alt={"brussels-sprouts"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Brussels Sprouts</div>
                                </div>
                                
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/cabbage.png"}
                                        alt={"cabbage"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Cabbage</div>
                                </div>
                                
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/natto.png"}
                                        alt={"natto"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Natto</div>
                                </div>
                                
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/yogurt.png"}
                                        alt={"yogurt"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Yogurt</div>
                                </div>

                                
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/liver.png"}
                                        alt={"liver"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Beef Liver</div>
                                </div>

                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/chicken.png"}
                                        alt={"chicken"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Chicken</div>
                                </div>
                                
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/egg.png"}
                                        alt={"egg"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Eggs</div>
                                </div>
                            </div>

                            Vitamin K1 is highly concentrated in green vegetables, while K2 is found in fermented foods and high-quality animal fats.
                            <ul>
                                <li><b>Dark Green Leafy Vegetables:</b> Kale, spinach, collard greens, Swiss chard, and turnip greens. Just a half-cup of cooked kale delivers over 400% of your daily requirement.</li>
                                <li><b>Cruciferous Vegetables:</b> Broccoli, Brussels sprouts, and cabbage.</li>
                                <li><b>Natto:</b> A traditional Japanese fermented soybean dish that is the absolute richest known dietary source of Vitamin K2.</li>
                                <li><b>Fermented Cheeses & Yogurt:</b> Certain aged cheeses contain moderate amounts of Vitamin K2 due to bacterial synthesis.</li>
                                <li><b>Animal Products:</b> Beef liver, chicken, and egg yolks provide direct, highly absorbable Vitamin K2.</li>
                            </ul>

                        </div>

                        <div style={{background: '#fbf0d9'}} className={`${styles["nutrients-and-microelements"]} ${styles["vitamin-section"]}`}>
                            <h3>Recommended Daily Intake (RDI)</h3>
                            Because your body is highly efficient at recycling Vitamin K, the dietary guidelines—referred to as Adequate Intake (AI)—are relatively small and measured in micrograms (μg).
                            <br></br>
                            <br></br>
                            <b>Adults</b>
                            <ul>
                                <li>Men (19+ years): 120 μg / day</li>
                                <li>Women (19+ years): 90 μg / day</li>
                                <li>Pregnant & Lactating Women: 90 μg / day</li>
                            </ul>
                            <b>Children</b>
                            <ul>
                                <li>Infants (0–6 months): 2.0 μg / day</li>
                                <li>Infants (7–12 months): 2.5 μg / day</li>
                                <li>Toddlers (1–3 years): 30 μg / day</li>
                                <li>Children (4–8 years): 55 μg / day</li>
                                <li>Children (9–13 years): 60 μg / day</li>
                                <li>Adolescents (14–18 years): 75 μg / day</li>
                            </ul>
                        </div>

                        <div style={{ background: '#fff2f0' }} className={`${styles["tabs-and-symptoms-section"]} ${styles["vitamin-section"]}`}>
                            
                            {/* Шапка табов */}
                            <div className={styles["tabs-and-symptoms"]}>
                                <div 
                                onClick={() => setActiveTab('deficiency')}
                                className={`${styles["tab"]} ${activeTab === 'deficiency' ? styles["active"] : ''}`}
                                >
                                Deficiency Symptoms
                                </div>
                                <div 
                                onClick={() => setActiveTab('overdose')}
                                className={`${styles["tab"]} ${activeTab === 'overdose' ? styles["active"] : ''}`}
                                >
                                Overdose
                                </div>
                            </div>

                            {/* Контент табов */}
                            <div className={styles["tabs-and-symptoms-content"]}>
                                
                                {/* Отображаем контент Дефицита, если активен таб 'deficiency' */}
                                {activeTab === 'deficiency' && (
                                <div className={`${styles["ts-tab"]} ${styles["deficiency-symptoms-content"]}`}>
                                    A severe Vitamin K deficiency is uncommon in healthy adults because it is widely available in everyday vegetables and generated by gut bacteria. However, it can occur in individuals with severe fat malabsorption disorders or those taking long-term broad-spectrum antibiotics that wipe out healthy gut microbes.
                                    <br></br>
                                    <br></br>
                                    <b>Major Symptoms</b>
                                    
                                    <ul>
                                        <li><b>Excessive Bleeding (Hemorrhage):</b> Because blood cannot clot effectively, minor cuts bleed for a long time, and nosebleeds become frequent and difficult to stop.</li>
                                        <li><b>Easy Bruising:</b> Large, dark bruises form from very minor bumps, and tiny red or purple blood spots (petechiae) may appear under the skin.</li>
                                        <li><b>Bleeding in the Digestive Tract:</b> Can manifest as blood in the stool (making it look black or tarry) or blood in the urine.</li>
                                        <li><b>Reduced Bone Density:</b> Over time, a lack of Vitamin K leaves bones fragile, increasing the long-term risk of developing osteoporosis and suffering fractures.</li>
                                    </ul>

                                    Important Public Health Note: Newborn infants are born with virtually no Vitamin K stored in their bodies, and breast milk contains very little. Because their gut bacteria haven't developed enough to produce it yet, babies are at a high risk for a rare but life-threatening bleeding condition called Vitamin K Deficiency Bleeding (VKDB). To prevent this, healthcare providers worldwide routinely give newborns a single, safe Vitamin K injection immediately after birth.
                                </div>
                                )}

                                {/* Отображаем контент Передозировки, если активен таб 'overdose' */}
                                {activeTab === 'overdose' && (
                                <div className={`${styles["ts-tab"]} ${styles["overdose-symptoms-content"]}`}>
                                    Natural forms of Vitamin K (K1 from plants and K2 from your diet/gut bacteria) have an incredibly clean safety record.
                                    <ul>
                                        <li><b>Tolerable Upper Intake Level (UL):</b> There is no established Upper Limit for Vitamin K. The body naturally processes, utilizes, or safely excretes excess amounts without triggering toxic reactions.</li>
                                    </ul>
                                    
                                    <b>Critical Medication Interactions</b>
                                    While natural Vitamin K won't cause a toxic overdose, it poses a significant hazard if you take specific medications:
                                    <ul>
                                        <li><b>Blood Thinners (e.g., Warfarin / Coumadin):</b> These medications work by actively blocking Vitamin K to prevent dangerous blood clots. If you suddenly consume a massive amount of Vitamin K (like eating giant bowls of spinach every single day), you can completely counteract your medication, drastically increasing your risk of a blood clot or stroke.</li>
                                        <li><b>The Solution:</b> If you take these medications, you do not need to cut out green vegetables entirely. Instead, the goal is to keep your Vitamin K intake consistent day-to-day so your doctor can calibrate your medication dosage accurately.</li>
                                    </ul>
                                </div>
                                )}

                            </div>
                            </div>

                        
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

                <Link className={styles["nav-link"]} href="/products">
                    <Image
                        src="/main/products.svg"
                        alt={'products'}
                        width={48}
                        height={48}
                    />
                </Link>
                
                <Link className={styles["nav-link"]} href="#">
                    <Image
                        src="/main/antioxidant-green.svg"
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

export default VitaminInfoClient;