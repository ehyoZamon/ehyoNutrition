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
                        <h1 className={styles["vitamin-name"]}>Vitamin B12 (Cobalamin)</h1>
                        <div className={styles["vitamin-category"]}>Nutrients/vitamins</div>

                        <div style={{background: 'none'}} className={styles["vitamin-description"]}>
                            <ul>
                                <li>Common supplemental forms: Cyanocobalamin (synthetic, stable) and Methylcobalamin (natural, active coenzyme)</li>
                            </ul>
                            Vitamin B12 is a water-soluble vitamin that is structurally the largest and most complex of all vitamins. It is unique because it features a core molecule centered around a single mineral ion: cobalt (hence its scientific name). Unlike plants or animals, Vitamin B12 can only be synthesized by certain bacteria and archaea. Animals acquire it by consuming contaminated food or via their own internal gut bacteria, meaning B12 is found naturally almost exclusively in animal-derived foods.
                        </div>

                        <div style={{background: '#fbf2d8'}} className={`${styles["key-functions"]} ${styles["vitamin-section"]}`}>
                            <h3>Key Functions</h3>
                            Vitamin B12 is essential for cellular metabolism and plays foundational roles in three major systems:
                            <ul>
                                <li><b>Red Blood Cell Formation:</b> It is required for the proper division and maturation of red blood cells. Without it, DNA synthesis stalls, leading to malformed, oversized blood cells that cannot easily exit the bone marrow.</li>
                                <li><b>Neurological Integrity & Myelin Sheath Maintenance:</b> B12 is critical for the production and maintenance of the myelin sheath—the protective insulating layer that wraps around nerves to ensure rapid, efficient electrical signaling.</li>
                                <li><b>DNA and Energy Production:</b> It acts as a coenzyme in the synthesis of DNA during cell division and works closely with folate (Vitamin B9) to convert homocysteine into methionine, an essential pathway for overall cellular metabolism.</li>
                            </ul>
                        </div>

                        <div style={{background: "none"}} className={`${styles["top-food-sources"]} ${styles["vitamin-section"]}`}>
                            <h3>Top Food Sources</h3>
                            <div className={styles["food-sources-container"]}>
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/liver.png"}
                                        alt={"liver"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Beef liver</div>
                                </div>
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/kidney.png"}
                                        alt={"kidney"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Kidney meat</div>
                                </div>
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/shellfish.png"}
                                        alt={"shellfish"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Shellfish</div>
                                </div>
                                
                            </div>

                            <ul>
                                <li><b>Organ Meats:</b> Beef liver and kidneys contain exceptionally high concentrations.</li>
                                <li><b>Shellfish:</b> Clams, oysters, and mussels are incredibly rich sources.</li>
                                <li><b>Seafood & Poultry:</b> Salmon, tuna, sardines, beef, and chicken.</li>
                                <li><b>Dairy & Eggs:</b> Whole milk, Swiss cheese, yogurt, and egg yolks provide moderate amounts.</li>
                                <li><b>Fortified Plant Foods:</b> For vegans and strict vegetarians, fortified foods are vital. These include nutritional yeast, fortified plant milks (oat, soy, almond), and fortified breakfast cereals.</li>
                            </ul>

                            <b>The Complex Absorption Factor:</b> Absorbing B12 is a complex, multi-step process. In the stomach, hydrochloric acid releases B12 from protein food structures. Then, a specialized protein secreted by the stomach lining called Intrinsic Factor (IF) must bind to the vitamin. This B12-IF complex travels down to the very end of the small intestine (the ileum), where it can finally be absorbed by the body. A lack of acid or Intrinsic Factor blocks absorption entirely, regardless of how much B12 you eat.    
                        </div>

                        <div style={{background: '#fbf0d9'}} className={`${styles["nutrients-and-microelements"]} ${styles["vitamin-section"]}`}>
                            <h3>Recommended Daily Intake (RDI)</h3>
                            Because Vitamin B12 is highly potent, the required amounts are tiny and measured in Micrograms<br></br>
                            <b>Adults</b>
                            <ul>
                                <li>Adults (19+ years): 2.4μg / day</li>
                                <li>Pregnant Women: 2.6μg / day</li>
                                <li>Lactating Women: 2.8μg / day</li>
                                <li>Older Adults (50+ years): While the daily dosage requirement is the same, medical guidelines strongly suggest that adults over 50 get their B12 from supplements or fortified foods. This is because older adults frequently produce less stomach acid, making it hard to extract B12 from whole animal proteins, whereas supplemental B12 bypasses this step.</li>
                            </ul>
                            <b>Children</b>
                            <ul>
                                <li>Infants (0–6 months): 0.4μg / day</li>
                                <li>nfants (7–12 months):  0.5μg / day</li>
                                <li>Toddlers (1–3 years): 0.9μg / day</li>
                                <li>Children (4–8 years): 1.2μg / day</li>
                                <li>Children (9–13 years): 1.8μg / day</li>
                                <li>Adolescents (14–18 years): 2.2μg / day</li>
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
                                    Because the human liver can store a 3-to-5-year supply of Vitamin B12, deficiency symptoms develop incredibly slowly and can take years to surface after absorption stops or dietary intake drops.
                                    <br></br>
                                   <b>Hematological Symptoms</b>
                                    <ul>
                                        <li><b>Megaloblastic Anemia:</b> The body produces fewer, abnormally large, and fragile red blood cells. Because these cells are malformed, they cannot carry oxygen efficiently, leading to chronic fatigue, severe weakness, pale skin, a smooth, swollen tongue (glossitis), and shortness of breath.</li>
                                    </ul>
                                    <b>Neurological & Psychological Symptoms (Can become permanent if untreated)</b>
                                    <ul>
                                        <li>Paresthesia: A persistent tingling, "pins and needles," or numbness in the hands and feet caused by the degeneration of the nerve myelin sheaths.</li>
                                        <li>Balance Problems: Difficulty walking, unsteadiness, or a loss of coordination (ataxia), especially in the dark.</li>
                                        <li>Cognitive Decline: Brain fog, memory loss, confusion, and irritability. In severe cases, it can mimic symptoms of dementia.</li>
                                    </ul>
                                </div>
                                )}

                                {/* Отображаем контент Передозировки, если активен таб 'overdose' */}
                                {activeTab === 'overdose' && (
                                <div className={`${styles["ts-tab"]} ${styles["overdose-symptoms-content"]}`}>
                                    Vitamin B12 has an exceptionally low toxicity profile. Because it is water-soluble, the body's digestive tract naturally decreases absorption efficiency as oral doses increase. Any excess circulating in the blood is easily filtered out by the kidneys and flushed out in urine.
                                    <ul>
                                        <li><b>Tolerable Upper Intake Level (UL):</b> There is no established Upper Limit for Vitamin B12 because no adverse health effects have been linked to high intakes from food or mega-dose supplements in healthy individuals.</li>
                                    </ul>
                                    
                                    <b>Potential Mild Reactions</b>
                                    Even at high therapeutic doses (such as 1,000μg to 2,000μg used to treat deficiency), major side effects are non-existent. On rare occasions, individuals receiving high-dose supplemental injections might experience mild, transient side effects like localized skin breakouts (acne-like eruptions), mild diarrhea, or temporary itching, though these are typically reactions to binding agents rather than the vitamin itself.
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