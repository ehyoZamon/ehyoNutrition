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
                        <h1 className={styles["vitamin-name"]}>Vitamin B6 (Pyridoxine)</h1>
                        <div className={styles["vitamin-category"]}>Nutrients/vitamins</div>

                        <div style={{background: 'none'}} className={styles["vitamin-description"]}>
                            Vitamin B6 is a crucial water-soluble nutrient that exists in several chemical forms, with Pyridoxine being the most common in supplements and plant foods. Because it is water-soluble, your body cannot store large reserves of it and regularly excretes any excess. A steady, daily intake from whole foods or supplements is essential to support complex metabolic pathways across your entire system.
                        </div>

                        <div style={{background: '#fbf2d8'}} className={`${styles["key-functions"]} ${styles["vitamin-section"]}`}>
                            <h3>Key Functions</h3>
                            Vitamin B6 acts as an indispensable coenzyme (primarily in its active PLP form) that drives more than 100 enzymatic reactions, mostly focused on protein and nervous system regulation:
                            <ul>
                                <li><b>Protein and Amino Acid Metabolism:</b> It is the primary manager for breaking down and utilizing dietary proteins and amino acids, helping convert them into cellular structures and energy.</li>
                                <li><b>Neurotransmitter Synthesis:</b> B6 is directly required to manufacture critical brain chemicals that regulate mood and sleep, including serotonin, dopamine, gamma-aminobutyric acid (GABA), and melatonin.</li>
                                <li><b>Hemoglobin Production:</b> It plays a foundational role in the synthesis of heme, the vital iron-containing protein inside red blood cells that transports oxygen throughout your body.</li>
                                <li><b>Immune Function and Glycogen Breakdown:</b> It supports immune defense by helping create white blood cells and antibodies, and acts as a key trigger to unlock stored carbohydrates (glycogen) from the liver for rapid energy.</li>
                            </ul>
                        </div>

                        <div style={{background: "none"}} className={`${styles["top-food-sources"]} ${styles["vitamin-section"]}`}>
                            <h3>Top Food Sources</h3>
                            Vitamin B6 is widely available in both animal and plant foods. However, extensive cooking, freezing, or high-heat processing can significantly lower its nutritional availability.
                            <div className={styles["food-sources-container"]}>
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/chickpeas.png"}
                                        alt={"chickpeas"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Chickpeas</div>
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
                                        src={"/products/salmon.png"}
                                        alt={"salmon"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Wild Salmon</div>
                                </div>
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/chicken.png"}
                                        alt={"chicken"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Chicken Breast</div>
                                </div>

                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/banana.png"}
                                        alt={"banana"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Bananas</div>
                                </div>
                                
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/potato.png"}
                                        alt={"potato"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Potatoes</div>
                                </div>
                            </div>

                            <ul>
                                <li><b>Legumes:</b> Chickpeas (garbanzo beans) are an outstanding non-animal source (one cup delivers over 50% of your daily value).</li>
                                <li><b>Organ and Lean Meats:</b> Beef liver, chicken breast, and turkey contain high amounts of bioavailable B6.</li>
                                <li><b>Fish & Seafood:</b> Salmon, tuna, and mackerel are exceptionally rich sources.</li>
                                <li><b>Fruits and Vegetables:</b> Bananas, potatoes, and starchy vegetables are premium plant choices that retain their vitamin content well.</li>
                                <li><b>Fortified Cereals:</b> Many processed grains and breakfast foods are heavily fortified with Pyridoxine to fulfill daily requirements.</li>
                            </ul>

                        </div>

                        <div style={{background: '#fbf0d9'}} className={`${styles["nutrients-and-microelements"]} ${styles["vitamin-section"]}`}>
                            <h3>Recommended Daily Intake (RDI)</h3>
                            Dietary recommendations for Vitamin B6 are standardly measured in Milligrams (mg).
                            <b>Adults</b>
                            <ul>
                                <li>Men (19–50 years): 1.3 mg / day || (51+ years): 1.7 mg / day</li>
                                <li>Women (19–50 years): 1.3 mg / day || (51+ years): 1.5 mg / day</li>
                                <li>Pregnant Women: 1.9 mg / day</li>
                                <li>Lactating Women: 2.0 mg / day — Higher dosage supports the increased nutritional transport required for breast milk.</li>
                            </ul>
                            <b>Children</b>
                            <ul>
                                <li>Infants (0–6 months): 0.1 mg / day</li>
                                <li>Infants (7–12 months): 0.3 mg / day</li>
                                <li>Toddlers (1–3 years): 0.5 mg / day</li>
                                <li>Children (4–8 years): 0.6 mg / day</li>
                                <li>Children (9–13 years): 1.0 mg / day</li>
                                <li>Adolescents (14–18 years): 1.3 mg / day for boys, 1.2 mg / day for girls</li>
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
                                    An isolated clinical deficiency of Vitamin B6 is uncommon, but it regularly occurs alongside low levels of other B-complex vitamins. Severe or long-term deficiency directly damages blood cells, nervous tissues, and skin integrity.
                                    <br></br><br></br>
                                    <b>Major Deficiency Symptoms</b>
                                    <ul>
                                        <li><b>Microcytic Anemia:</b> The body produces abnormally small red blood cells with insufficient hemoglobin, resulting in chronic fatigue, weakness, and pale skin.</li>
                                        <li><b>Neurological Distortions:</b> Marked depression, cognitive confusion, and severe mood changes caused by impaired neurotransmitter production. In extreme cases, it can trigger seizures.</li>
                                        <li><b>Peripheral Neuropathy:</b> Numbness, tingling, or shooting nerve pain in the hands, fingers, and feet.</li>
                                        <li><b>Cheilosis and Glossitis:</b> Painful scaling and deep cracks at the corners of the mouth, paired with an inflamed, swollen tongue.</li>
                                        <li><b>Weakened Immunity:</b> Increased susceptibility to infections and slower recovery times.</li>
                                    </ul>
                                </div>
                                )}

                                {/* Отображаем контент Передозировки, если активен таб 'overdose' */}
                                {activeTab === 'overdose' && (
                                <div className={`${styles["ts-tab"]} ${styles["overdose-symptoms-content"]}`}>
                                    While it is physically impossible to experience an overdose of Vitamin B6 from natural food sources, excessive intake of high-dose Pyridoxine supplements can lead to toxic conditions.
                                    <ul>
                                        <li>Tolerable Upper Intake Level (UL): The established safe Upper Limit for adults is <b>100 mg / day</b>.</li>
                                    </ul>
                                    
                                    <b>The Toxicity Risk: Sensory Neuropathy</b>
                                    Unlike most water-soluble vitamins, taking chronic mega-doses of B6 (typically 1,000 mg to 3,000 mg per day over several months) can actively damage peripheral nerves. This triggers severe **Sensory Neuropathy**, resulting in:
                                    <ul>
                                        <li>Progressive numbness and loss of feeling in the legs and hands.</li>
                                        <li>Difficulty walking or maintaining proper physical balance (ataxia).</li>
                                        <li>Loss of normal reflexes.</li>
                                    </ul>
                                    <br></br>
                                    <b>Important Safety Note:</b> These neurological symptoms are usually reversible once the excessive supplement intake is discontinued under medical observation, but recovery can be slow. Other symptoms include skin lesions, extreme sensitivity to sunlight (photosensitivity), and nausea.
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