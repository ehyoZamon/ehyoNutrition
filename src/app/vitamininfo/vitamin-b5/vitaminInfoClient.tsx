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
                        <h1 className={styles["vitamin-name"]}>Vitamin B5 (Pantothenic Acid)</h1>
                        <div className={styles["vitamin-category"]}>Nutrients/vitamins</div>

                        <div style={{background: 'none'}} className={styles["vitamin-description"]}>
                            Vitamin B5, widely known as Pantothenic Acid, is a water-soluble nutrient essential for all forms of life. Its name is derived from the Greek word "pantothen," meaning "from everywhere," which perfectly reflects its widespread presence in almost all plant and animal foods. Because it is water-soluble, it cannot be heavily stored in the body, requiring consistent dietary intake.
                        </div>

                        <div style={{background: '#fbf2d8'}} className={`${styles["key-functions"]} ${styles["vitamin-section"]}`}>
                            <h3>Key Functions</h3>
                            Pantothenic acid is primarily used by the body to synthesize **Coenzyme A (CoA)**, a critical molecule that participates in numerous vital metabolic and cellular operations:
                            <ul>
                                <li><b>Metabolism and Energy Release:</b> It plays a master role in cellular respiration, actively helping convert dietary carbohydrates, fats, and proteins into glucose and ATP energy.</li>
                                <li><b>Fatty Acid and Cholesterol Synthesis:</b> Coenzyme A is directly required for the production of healthy fatty acids, cholesterol, and vital sphingolipids (fats critical for cell membranes).</li>
                                <li><b>Hormone and Neurotransmitter Production:</b> Vitamin B5 is essential for the adrenal glands to synthesize steroid hormones (such as cortisol) and helps synthesize acetylcholine, an important brain neurotransmitter.</li>
                                <li><b>Hemoglobin and Red Blood Cell Support:</b> It contributes to the complex biological synthesis of heme, the oxygen-carrying component of red blood cells.</li>
                            </ul>
                        </div>

                        <div style={{background: "none"}} className={`${styles["top-food-sources"]} ${styles["vitamin-section"]}`}>
                            <h3>Top Food Sources</h3>
                            While Vitamin B5 is found in most foods, it is highly sensitive to intense heat, processing, and canning, which can destroy up to 30–50% of its content. Whole, unprocessed foods yield the highest amounts.
                            <div className={styles["food-sources-container"]}>
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
                                        src={"/products/shiitake-mushrooms.png"}
                                        alt={"shiitake-mushrooms"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Shiitake Mushrooms</div>
                                </div>
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/avocado.png"}
                                        alt={"avocado"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Avocado</div>
                                </div>
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/sunflower-seeds.png"}
                                        alt={"sunflower-seeds"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Sunflower Seeds</div>
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
                            </div>

                            <ul>
                                <li><b>Organ Meats:</b> Beef liver and kidneys contain the highest natural concentrations of pantothenic acid.</li>
                                <li><b>Mushrooms:</b> Shiitake and white button mushrooms are exceptional plant-based sources.</li>
                                <li><b>Avocados & Seeds:</b> One whole avocado provides roughly 2 mg of B5. Sunflower seeds also offer exceptionally dense amounts.</li>
                                <li><b>Poultry & Seafood:</b> Chicken breast, turkey, salmon, and trout are prominent dietary sources.</li>
                                <li><b>Dairy & Whole Grains:</b> Whole milk, yogurt, eggs, brown rice, and whole oats provide stable quantities for daily meals.</li>
                            </ul>

                        </div>

                        <div style={{background: '#fbf0d9'}} className={`${styles["nutrients-and-microelements"]} ${styles["vitamin-section"]}`}>
                            <h3>Recommended Daily Intake (RDI)</h3>
                            Dietary recommendations for Vitamin B5 are established as **Adequate Intake (AI)** guidelines and measured in Milligrams (mg).
                            <b>Adults</b>
                            <ul>
                                <li>Men & Women (19+ years): 5 mg / day</li>
                                <li>Pregnant Women: 6 mg / day</li>
                                <li>Lactating Women: 7 mg / day — Increased dosage accounts for the significant amount of Vitamin B5 secreted into human breast milk.</li>
                            </ul>
                            <b>Children</b>
                            <ul>
                                <li>Infants (0–6 months): 1.7 mg / day</li>
                                <li>Infants (7–12 months): 1.8 mg / day</li>
                                <li>Toddlers (1–3 years): 2 mg / day</li>
                                <li>Children (4–8 years): 3 mg / day</li>
                                <li>Children (9–13 years): 4 mg / day</li>
                                <li>Adolescents (14–18 years): 5 mg / day</li>
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
                                    Because pantothenic acid is found so ubiquitously across normal diets, an isolated natural deficiency is extraordinarily rare. It has historically been observed only during severe clinical malnutrition or experimental studies.
                                    <br></br><br></br>
                                    <b>Key Deficiency Symptoms</b>
                                    <ul>
                                        <li><b>Burning Feet Syndrome:</b> The most classic sign of B5 deficiency, characterized by painful paresthesia, burning sensations, numbness, and shooting pains in the feet and toes.</li>
                                        <li><b>Neurological Disturbances:</b> Marked irritability, restlessness, sleep disorders (insomnia), and chronic mental fatigue due to compromised acetylcholine production.</li>
                                        <li><b>Gastrointestinal Distress:</b> Recurrent nausea, vomiting, abdominal cramps, and generalized digestive discomfort.</li>
                                        <li><b>Muscle Cramps:</b> Impaired neuromuscular coordination and muscle spasms.</li>
                                    </ul>
                                </div>
                                )}

                                {/* Отображаем контент Передозировки, если активен таб 'overdose' */}
                                {activeTab === 'overdose' && (
                                <div className={`${styles["ts-tab"]} ${styles["overdose-symptoms-content"]}`}>
                                    Vitamin B5 is universally recognized as highly safe and non-toxic. Since it is water-soluble, any excess concentration circulating in the bloodstream is easily processed by the kidneys and flushed out through urine.
                                    <ul>
                                        <li>Tolerable Upper Intake Level (UL): There is <b>no established Upper Limit</b> for Vitamin B5. No significant adverse events or toxic symptoms have been reported in individuals consuming high amounts from food or large oral doses.</li>
                                    </ul>
                                    
                                    <b>Potential Minor Side Effects</b>
                                    Even when consuming exceptionally massive megadoses (ranging from 10,000 mg to 20,000 mg per day), the body remains mostly unaffected. The only documented mild side effects of such excessive oral supplement loading are temporary **mild diarrhea** and generalized **gastrointestinal distress**, which occur because unabsorbed quantities draw water into the large intestine. These minor symptoms resolve entirely upon reducing or stopping the supplement.
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