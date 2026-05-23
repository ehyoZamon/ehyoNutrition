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
                        <h1 className={styles["vitamin-name"]}>Vitamin B7 (Biotin)</h1>
                        <div className={styles["vitamin-category"]}>Nutrients/vitamins</div>

                        <div style={{background: 'none'}} className={styles["vitamin-description"]}>
                            Vitamin B7, universally known as Biotin (and historically referred to as Vitamin H), is a vital water-soluble nutrient. Because it is water-soluble, your body cannot store it in significant amounts and readily excretes any excess. Biotin is highly celebrated for its beauty-enhancing properties, but its primary biological role is keeping your fundamental metabolic cellular engines active and efficient.
                        </div>

                        <div style={{background: '#fbf2d8'}} className={`${styles["key-functions"]} ${styles["vitamin-section"]}`}>
                            <h3>Key Functions</h3>
                            Biotin acts as an essential coenzyme for a group of enzymes called carboxylases, which are deeply involved in crucial metabolic processes throughout the body:
                            <ul>
                                <li><b>Macronutrient Metabolism:</b> It is fundamentally required to break down carbohydrates, dietary fats, and proteins from your food, converting them into usable glucose and ATP energy.</li>
                                <li><b>Keratin Production (Hair, Skin & Nails):</b> Biotin supports the synthesis of keratin, the basic structural protein that makes up your hair, skin, and nails, helping maintain their strength and integrity.</li>
                                <li><b>Fatty Acid Synthesis:</b> It activates the chemical pathways necessary to produce healthy fatty acids, which actively nourish skin cells and preserve the skin's natural moisture barrier.</li>
                                <li><b>Nervous System & Brain Support:</b> It contributes to normal psychological functions and nervous system health by aiding neurotransmitter synthesis and glucose management.</li>
                            </ul>
                        </div>

                        <div style={{background: "none"}} className={`${styles["top-food-sources"]} ${styles["vitamin-section"]}`}>
                            <h3>Top Food Sources</h3>
                            Biotin is found in a wide variety of foods, though usually in relatively small amounts. It is relatively stable during normal cooking, but high-heat processing can decrease its availability.
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
                                        src={"/products/salmon.png"}
                                        alt={"salmon"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Salmon</div>
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
                                        src={"/products/sweet-potato.png"}
                                        alt={"sweet-potato"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Sweet Potatoes</div>
                                </div>
                                
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/almond.png"}
                                        alt={"almond"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Almonds</div>
                                </div>
                            </div>

                            <ul>
                                <li><b>Organ Meats:</b> Beef liver and kidneys contain the highest natural concentrations of biotin.</li>
                                <li><b>Eggs:</b> Cooked egg yolks are exceptionally rich sources of highly bioavailable biotin.</li>
                                <li><b>Seafood:</b> Salmon, tuna, and sardines provide excellent healthy fats alongside natural B7.</li>
                                <li><b>Nuts and Seeds:</b> Almonds, walnuts, peanuts, and sunflower seeds are outstanding plant-based choices.</li>
                                <li><b>Vegetables:</b> Sweet potatoes, spinach, broccoli, and avocados offer highly accessible doses for daily meals.</li>
                            </ul>

                        </div>

                        <div style={{background: '#fbf0d9'}} className={`${styles["nutrients-and-microelements"]} ${styles["vitamin-section"]}`}>
                            <h3>Recommended Daily Intake (RDI)</h3>
                            Dietary recommendations for Vitamin B7 are established as **Adequate Intake (AI)** guidelines and measured in **Micrograms (µg)**.
                            <b>Adults</b>
                            <ul>
                                <li>Men & Women (19+ years): 30 µg / day</li>
                                <li>Pregnant Women: 30 µg / day</li>
                                <li>Lactating Women: 35 µg / day — Higher intake satisfies the direct nutritional transport required for breast milk production.</li>
                            </ul>
                            <b>Children</b>
                            <ul>
                                <li>Infants (0–6 months): 5 µg / day</li>
                                <li>Infants (7–12 months): 6 µg / day</li>
                                <li>Toddlers (1–3 years): 8 µg / day</li>
                                <li>Children (4–8 years): 12 µg / day</li>
                                <li>Children (9–13 years): 20 µg / day</li>
                                <li>Adolescents (14–18 years): 25 µg / day</li>
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
                                    A natural dietary biotin deficiency is extremely rare because it is widely available in foods and synthesized by beneficial gut bacteria. However, it can occur in individuals with prolonged total parental nutrition, heavy alcohol abuse, genetic conditions, or those who consume excessive raw egg whites over months.
                                    <br></br><br></br>
                                    <b>The Raw Egg White Hazard:</b> Raw egg whites contain a protein called **avidin**, which binds tightly to biotin in the digestive tract, completely blocking its absorption. Cooking the egg white neutralizes avidin safely.
                                    <br></br><br></br>
                                    <b>Major Deficiency Symptoms</b>
                                    <ul>
                                        <li><b>Hair Thinning and Loss:</b> Progressive thinning of hair that can lead to alopecia, often accompanied by a loss of natural hair color.</li>
                                        <li><b>Brittle Nails:</b> Nails that split, crack, or chip very easily under light pressure.</li>
                                        <li><b>Red, Scaly Rashes:</b> A distinct, dry, scaly skin rash that typically manifests around the eyes, nose, mouth, and perineal area.</li>
                                        <li><b>Neurological Distortions:</b> Chronic depression, extreme lethargy, hallucinations, and a burning or tingling sensation (paresthesia) in the hands and feet.</li>
                                    </ul>
                                </div>
                                )}

                                {/* Отображаем контент Передозировки, если активен таб 'overdose' */}
                                {activeTab === 'overdose' && (
                                <div className={`${styles["ts-tab"]} ${styles["overdose-symptoms-content"]}`}>
                                    Vitamin B7 has an exemplary safety record. Because it is completely water-soluble, your body easily processes and eliminates any excessive amounts through your urine.
                                    <ul>
                                        <li>Tolerable Upper Intake Level (UL): There is <b>no established Upper Limit</b> for Vitamin B7. No toxic health effects or adverse events have been reported from high dietary intake or large oral doses of supplements.</li>
                                    </ul>
                                    
                                    <b>The Real Hazard: Lab Test Interference</b>
                                    While mega-doses of Biotin (e.g., 5,000 µg to 10,000 µg commonly found in beauty supplements) will not cause physiological toxicity, they present a significant medical risk by **interfering with clinical blood tests**. 
                                    <br></br><br></br>
                                    High biotin levels in your blood sample can cause false results in:
                                    <ul>
                                        <li>Thyroid hormone tests (falsely mimicking Graves' disease).</li>
                                        <li>Troponin tests (a critical biomarker used to diagnose heart attacks, potentially leading to a dangerous missed diagnosis).</li>
                                    </ul>
                                    <br></br>
                                    <b>Safety Recommendation:</b> It is highly recommended to stop taking high-dose biotin supplements at least 48 to 72 hours before undergoing any diagnostic blood work, and always inform your healthcare professional about your supplement routine.
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