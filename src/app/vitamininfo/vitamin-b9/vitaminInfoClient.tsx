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
                        <h1 className={styles["vitamin-name"]}>Vitamin B9 (Folate / Folic Acid)</h1>
                        <div className={styles["vitamin-category"]}>Nutrients/vitamins</div>

                        <div style={{background: 'none'}} className={styles["vitamin-description"]}>
                            Vitamin B9 is a vital water-soluble nutrient that exists in two main forms: Folate, which occurs naturally in whole foods, and Folic Acid, a highly stable synthetic form used in supplements and fortified grains. Because it is water-soluble, your body cannot store significant reserves of it, making a daily dietary supply absolutely non-negotiable for fundamental cellular replication and development.
                        </div>

                        <div style={{background: '#fbf2d8'}} className={`${styles["key-functions"]} ${styles["vitamin-section"]}`}>
                            <h3>Key Functions</h3>
                            Vitamin B9 works as a core driver of cellular life, acting as a mandatory coenzyme in the synthesis of genetic material and cellular division:
                            <ul>
                                <li><b>DNA Synthesis and Cell Division:</b> It is fundamentally required to produce and repair DNA and RNA, making it the most critical nutrient during periods of rapid tissue growth, such as fetal development, childhood, and adolescence.</li>
                                <li><b>Red Blood Cell Production:</b> Vitamin B9 works in close coordination with Vitamin B12 to stimulate the bone marrow to produce healthy, properly shaped red blood cells that transport oxygen.</li>
                                <li><b>Fetal Fetal Neural Tube Prevention:</b> Adequate maternal intake during early pregnancy is proven to prevent major congenital structural birth defects of the brain and spine (Neural Tube Defects).</li>
                                <li><b>Cardiovascular Health:</b> It helps convert and break down homocysteine—an amino acid that, in high concentrations, is heavily linked to arterial damage and an increased risk of heart disease.</li>
                            </ul>
                        </div>

                        <div style={{background: "none"}} className={`${styles["top-food-sources"]} ${styles["vitamin-section"]}`}>
                            <h3>Top Food Sources</h3>
                            Natural folates are highly sensitive to high culinary heat and water, meaning heavy boiling or prolonged cooking can destroy up to 50–70% of the nutrient. Fresh or lightly cooked whole plant foods offer the best concentration.
                            <div className={styles["food-sources-container"]}>
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
                                        src={"/products/lentils.png"}
                                        alt={"lentils"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Lentils</div>
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
                                        src={"/products/orange.png"}
                                        alt={"orange"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Oranges</div>
                                </div>
                            </div>

                            <ul>
                                <li><b>Dark Green Leafy Vegetables:</b> Spinach, kale, romaine lettuce, and turnip greens are exceptionally rich natural sources (the name folate comes from "folium", meaning leaf).</li>
                                <li><b>Legumes:</b> Lentils, chickpeas, black-eyed peas, and kidney beans are incredibly dense plant sources of folate.</li>
                                <li><b>Organ Meats:</b> Beef liver provides an incredibly high concentrated dose of bioavailable B9.</li>
                                <li><b>Cruciferous Vegetables & Fruits:</b> Asparagus, broccoli, Brussels sprouts, avocados, and citrus fruits like oranges contain high natural amounts.</li>
                                <li><b>Fortified Grains:</b> Because of public health mandates in many countries, white flours, enriched breads, pastas, and rice are heavily fortified with folic acid.</li>
                            </ul>

                        </div>

                        <div style={{background: '#fbf0d9'}} className={`${styles["nutrients-and-microelements"]} ${styles["vitamin-section"]}`}>
                            <h3>Recommended Daily Intake (RDI)</h3>
                            Dietary recommendations for Vitamin B9 are measured in **Dietary Folate Equivalents (DFEs)** in Micrograms (µg), reflecting that folic acid from supplements is absorbed significantly better than natural food folate.
                            <b>Adults</b>
                            <ul>
                                <li>Men & Women (19+ years): 400 µg DFE / day</li>
                                <li>Pregnant Women: 600 µg DFE / day — Critical baseline required to prevent fetal developmental abnormalities.</li>
                                <li>Lactating Women: 500 µg DFE / day — Extra intake fulfills nutritional excretion through maternal milk.</li>
                            </ul>
                            <b>Children</b>
                            <ul>
                                <li>Infants (0–6 months): 65 µg DFE / day</li>
                                <li>Infants (7–12 months): 80 µg DFE / day</li>
                                <li>Toddlers (1–3 years): 150 µg DFE / day</li>
                                <li>Children (4–8 years): 200 µg DFE / day</li>
                                <li>Children (9–13 years): 300 µg DFE / day</li>
                                <li>Adolescents (14–18 years): 400 µg DFE / day</li>
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
                                    A deficiency in Vitamin B9 severely puts a halt to proper cellular reproduction, manifesting quickly in rapidly growing tissues like blood cells, mucosal linings, and developing fetuses.
                                    <br></br><br></br>
                                    <b>Major Deficiency Symptoms</b>
                                    <ul>
                                        <li><b>Megaloblastic Anemia:</b> The bone marrow produces abnormally large, structurally malformed, and immature red blood cells that cannot carry oxygen efficiently, resulting in extreme weakness, chronic fatigue, and shortness of breath.</li>
                                        <li><b>Neural Tube Defects (NTDs):</b> If a maternal deficiency occurs during the first few weeks of pregnancy, it can cause devastating birth defects, such as Spina Bifida (incomplete closing of the spine) or Anencephaly (severe underdevelopment of the brain).</li>
                                        <li><b>Gastrointestinal & Mucosal Soreness:</b> A classic painful, swollen, smooth-looking red tongue (glossitis), along with painful ulcers inside the mouth and chronic diarrhea due to impaired intestinal lining repair.</li>
                                        <li><b>Neurological Disturbances:</b> Deep irritability, cognitive confusion, clinical depression, and difficulties with memory focus.</li>
                                    </ul>
                                </div>
                                )}

                                {/* Отображаем контент Передозировки, если активен таб 'overdose' */}
                                {activeTab === 'overdose' && (
                                <div className={`${styles["ts-tab"]} ${styles["overdose-symptoms-content"]}`}>
                                    Consuming natural folate from food sources carries zero toxicity risks. However, excessive intake of synthetic **Folic Acid** through high-dose medical supplements can present distinct clinical hazards.
                                    <ul>
                                        <li>Tolerable Upper Intake Level (UL): The established Upper Limit for synthetic folic acid in adults is **1,000 µg / day**.</li>
                                    </ul>
                                    
                                    <b>The Primary Hazard: Masking Vitamin B12 Deficiency</b>
                                    The most dangerous risk of excessive folic acid loading is that it can fully resolve the blood symptoms (megaloblastic anemia) caused by a hidden **Vitamin B12 deficiency**, completely **masking** it from standard laboratory blood tests. 
                                    <br></br><br></br>
                                    If the B12 deficiency goes unnoticed and uncorrected because the anemia is artificially hidden, the underlying neurological destruction caused by lack of B12 will continue to progress silently, eventually leading to irreversible nerve damage and cognitive decline.
                                    <br></br><br></br>
                                    <b>Other Risks</b>
                                    Some clinical studies suggest that extreme, chronic over-supplementation of folic acid might accelerate the growth of pre-existing pre-cancerous lesions or interact unfavorably with specific anti-seizure medications.
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