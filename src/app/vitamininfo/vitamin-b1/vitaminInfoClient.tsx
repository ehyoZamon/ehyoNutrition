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
                        <h1 className={styles["vitamin-name"]}>Vitamin B1 (Thiamine)</h1>
                        <div className={styles["vitamin-category"]}>Nutrients/vitamins</div>

                        <div style={{background: 'none'}} className={styles["vitamin-description"]}>
                            Vitamin B1 is a water-soluble vitamin and was the very first B vitamin to be discovered by scientists, earning it the number "1." Because it is water-soluble, your body cannot store large amounts of it. Any excess is quickly washed out in your urine, meaning you need a steady, daily supply from your diet to keep your body's cellular engines running smoothly.
                        </div>

                        <div style={{background: '#fbf2d8'}} className={`${styles["key-functions"]} ${styles["vitamin-section"]}`}>
                            <h3>Key Functions</h3>
                            Thiamine works as an essential spark plug in your cells, primarily focusing on energy production and your nervous system:
                            <ul>
                                <li><b>Converting Food into Energy:</b> It acts as an indispensable coenzyme that helps your body break down carbohydrates and branched-chain amino acids (proteins) into adenosine triphosphate (ATP), which is the primary energy currency every single cell in your body uses.</li>
                                <li><b>Nerve and Brain Function:</b> Your brain is the most energy-demanding organ in your body. Vitamin B1 ensures a steady supply of glucose to brain cells and is critical for creating acetylcholine, a major neurotransmitter that allows your brain to send messages to your muscles and organs.</li>
                                <li><b>Heart Muscle Support:</b> Because the heart requires constant cellular energy to pump blood, thiamine is vital for maintaining proper cardiac muscle tone and regular pumping rhythms.</li>
                            </ul>
                        </div>

                        <div style={{background: "none"}} className={`${styles["top-food-sources"]} ${styles["vitamin-section"]}`}>
                            <h3>Top Food Sources</h3>
                            Thiamine is present in a wide variety of whole foods, though heavy food processing (like refining whole grains into white flour) can strip it away. Consequently, many countries fortify basic food products.
                            <div className={styles["food-sources-container"]}>
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/black-beans.png"}
                                        alt={"black-beans"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Black beans</div>
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
                                        src={"/products/soybean.png"}
                                        alt={"soybean"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Soybeans</div>
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
                                        src={"/products/flax-seed.png"}
                                        alt={"flax-seed"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Flaxseeds</div>
                                </div>
                                
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/macadamia-nut.png"}
                                        alt={"macadamia-nut"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Macadamia Nuts</div>
                                </div>
                            </div>

                            <ul>
                                <li><b>Legumes:</b> Black beans, lentils, navy beans, and soybeans pack a massive plant-based dose.</li>
                                <li><b>Seeds & Nuts:</b> Sunflower seeds, flaxseeds, and macadamia nuts are exceptionally high.</li>
                                <li><b>Whole Grains:</b> Brown rice, whole wheat bread, oats, and quinoa retain their natural thiamine-rich outer bran layers.</li>
                                <li><b>Fortified and Enriched Foods:</b> White rice, breakfast cereals, and white flour are heavily enriched with thiamine to prevent widespread nutritional deficiencies.</li>
                                <li><b>Nutritional Yeast:</b> A favorite among vegetarians and vegans, providing an intense concentration of the entire B-vitamin complex.</li>
                            </ul>

                        </div>

                        <div style={{background: '#fbf0d9'}} className={`${styles["nutrients-and-microelements"]} ${styles["vitamin-section"]}`}>
                            <h3>Recommended Daily Intake (RDI)</h3>
                            Dietary recommendations for Vitamin B1 are measured in Milligrams (mg).
                            <b>Adults</b>
                            <ul>
                                <li>Men (19+ years): 1.2 mg / day</li>
                                <li>Women (19+ years): 1.1 mg / day</li>
                                <li>Pregnant Women: 1.4 mg / day</li>
                                <li>Lactating Women: 1.4 mg / day — Extra thiamine is required to support the metabolic demands of milk production.</li>
                            </ul>
                            <b>Children</b>
                            <ul>
                                <li>Infants (0–6 months): 0.2 mg / day</li>
                                <li>Infants (7–12 months): 0.3 mg / day</li>
                                <li>Toddlers (1–3 years): 0.5 mg / day</li>
                                <li>Children (4–8 years): 0.6 mg / day</li>
                                <li>Children (9–13 years): 0.9 mg / day</li>
                                <li>Adolescents (14–18 years): 1.2 mg / day for boys, 1.0 mg / day for girls</li>
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
                                    A severe, prolonged lack of Vitamin B1 stops your cells from producing energy properly, directly impacting your cardiovascular and nervous systems. This deficiency leads to a well-known historical disease called Beriberi, as well as neurological syndromes.
                                    <br></br>
                                    <b>Early Warning Signs</b>
                                    <ul>
                                        <li>Unexplained loss of appetite, indigestion, or sudden weight loss.</li>
                                        <li>Short-term memory issues, confusion, and extreme irritability.</li>
                                        <li>General muscle weakness, particularly in the legs, and a feeling of heavy fatigue.</li>
                                    </ul>
                                    <b>Advanced Diseases</b>
                                    <ul>
                                        <li>Dry Beriberi: This form targets the nervous system. It causes severe muscle wasting, a loss of knee/ankle reflexes, and peripheral neuropathy—characterized by a burning, tingling numbness that starts in the toes and feet.</li>
                                        <li>Wet Beriberi: This form targets the cardiovascular system. The heart struggles to pump effectively, leading to a fast heart rate, severe shortness of breath during light activity, and fluid buildup that causes heavily swollen legs and ankles. Left untreated, it can cause congestive heart failure.</li>
                                        <li>Wernicke-Korsakoff Syndrome: A severe brain disorder most commonly seen in cases of chronic alcoholism (as alcohol severely blocks thiamine absorption in the gut). Symptoms include deep mental confusion, complete loss of muscle coordination (ataxia), involuntary eye movements, and severe, permanent memory gaps.</li>
                                    </ul>
                                </div>
                                )}

                                {/* Отображаем контент Передозировки, если активен таб 'overdose' */}
                                {activeTab === 'overdose' && (
                                <div className={`${styles["ts-tab"]} ${styles["overdose-symptoms-content"]}`}>
                                    Because Vitamin B1 is water-soluble, it has an incredibly high safety profile. Your digestive tract naturally limits how much thiamine it can absorb at one time, and your kidneys are highly efficient at flushing out any excess through your urine.
                                    <ul>
                                        <li>Tolerable Upper Intake Level (UL): There is no established Upper Limit for Vitamin B1. No toxic or adverse health effects have been recorded from consuming high amounts through whole foods or high-dose oral supplements.</li>
                                    </ul>
                                    
                                    <b>Potential Minor Side Effects</b>
                                    Even at massive therapeutic doses (such as 100 mg to 500 mg used to treat severe deficiency under medical supervision), oral toxicity is practically unheard of. On rare occasions, if someone receives exceptionally high doses via an intravenous (IV) medical injection, they might experience a mild skin rash, temporary nausea, or localized irritation at the injection site, but these symptoms are rare and resolve quickly.
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