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
                        <h1 className={styles["vitamin-name"]}>Vitamin B3 (Niacin)</h1>
                        <div className={styles["vitamin-category"]}>Nutrients/vitamins</div>

                        <div style={{background: 'none'}} className={styles["vitamin-description"]}>
                            Vitamin B3, commonly known as Niacin or Nicotinic Acid, is an essential water-soluble nutrient. The body can store it only in very limited amounts, making a consistent daily intake from your diet vital. Uniquely among B vitamins, the liver can actually synthesize a small portion of Niacin internally from the essential amino acid tryptophan, which is found in protein-rich foods.
                        </div>

                        <div style={{background: '#fbf2d8'}} className={`${styles["key-functions"]} ${styles["vitamin-section"]}`}>
                            <h3>Key Functions</h3>
                            Niacin functions as a component of two vital coenzymes (NAD and NADP) that are indispensable for more than 400 biochemical reactions in the human body:
                            <ul>
                                <li><b>Cellular Energy Production:</b> It plays a foundational role in cellular respiration, helping your body convert dietary proteins, fats, and carbohydrates into glucose and usable ATP energy.</li>
                                <li><b>DNA Repair and Genomic Stability:</b> Vitamin B3 acts as a key helper in repairing damaged DNA molecules and regulates cellular responses to stress.</li>
                                <li><b>Cholesterol Optimization:</b> In high therapeutic doses, Niacin helps improve blood lipid profiles by effectively lowering LDL ("bad") cholesterol and triglycerides while raising HDL ("good") cholesterol.</li>
                                <li><b>Nervous and Skin Health:</b> It is vital for maintaining healthy nerve signaling across the brain and central nervous system, as well as preserving the moisture barrier of the skin.</li>
                            </ul>
                        </div>

                        <div style={{background: "none"}} className={`${styles["top-food-sources"]} ${styles["vitamin-section"]}`}>
                            <h3>Top Food Sources</h3>
                            Niacin is exceptionally stable during cooking and food processing compared to other B vitamins. It is highly abundant in animal proteins and selectively found in grains and legumes.
                            <div className={styles["food-sources-container"]}>
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
                                        src={"/products/tuna.png"}
                                        alt={"tuna"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Tuna Fish</div>
                                </div>
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/beef.png"}
                                        alt={"beef"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Lean Beef</div>
                                </div>
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/peanut.png"}
                                        alt={"peanut"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Peanuts</div>
                                </div>

                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/brown-rice.png"}
                                        alt={"brown-rice"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Brown Rice</div>
                                </div>
                                
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/mushroom.png"}
                                        alt={"mushroom"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Mushrooms</div>
                                </div>
                            </div>

                            <ul>
                                <li><b>Poultry & Seafood:</b> Chicken, turkey, tuna, and salmon are incredibly dense natural sources of highly absorbable niacin.</li>
                                <li><b>Meat Products:</b> Lean beef, pork, and animal liver deliver high amounts per serving.</li>
                                <li><b>Legumes & Nuts:</b> Peanuts are an excellent plant-based source (one ounce provides around 4 mg). Lentils and green peas also offer moderate amounts.</li>
                                <li><b>Whole Grains:</b> Brown rice and whole wheat contain natural niacin, although it is less bioavailable unless fortified.</li>
                                <li><b>Fortified Foods:</b> Enriched breakfast cereals and flours frequently contain added Vitamin B3 to guarantee adequate population levels.</li>
                            </ul>

                        </div>

                        <div style={{background: '#fbf0d9'}} className={`${styles["nutrients-and-microelements"]} ${styles["vitamin-section"]}`}>
                            <h3>Recommended Daily Intake (RDI)</h3>
                            Dietary recommendations for Vitamin B3 are standardly measured in <b>Niacin Equivalents (NE)</b> in Milligrams (mg), taking into account the conversion of tryptophan.
                            <b>Adults</b>
                            <ul>
                                <li>Men (19+ years): 16 mg NE / day</li>
                                <li>Women (19+ years): 14 mg NE / day</li>
                                <li>Pregnant Women: 18 mg NE / day</li>
                                <li>Lactating Women: 17 mg NE / day — Higher intake satisfies the direct metabolic demands of breast milk synthesis.</li>
                            </ul>
                            <b>Children</b>
                            <ul>
                                <li>Infants (0–6 months): 2 mg NE / day</li>
                                <li>Infants (7–12 months): 4 mg NE / day</li>
                                <li>Toddlers (1–3 years): 6 mg NE / day</li>
                                <li>Children (4–8 years): 8 mg NE / day</li>
                                <li>Children (9–13 years): 12 mg NE / day</li>
                                <li>Adolescents (14–18 years): 16 mg NE / day for boys, 14 mg NE / day for girls</li>
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
                                    A severe, prolonged lack of Vitamin B3 results in a classic systemic disease known as <b>Pellagra</b>. It traditionally develops in populations where corn is the primary staple food without proper processing. Pellagra is characterized by the classic "4 Ds":
                                    <br></br><br></br>
                                    <b>The Classic 4 Ds of Pellagra</b>
                                    <ul>
                                        <li><b>Dermatitis:</b> Severe, symmetric, dark-scaly skin rashes that look like severe sunburns. They typically manifest around the neck (known as Casal's necklace) and on the back of the hands and feet.</li>
                                        <li><b>Diarrhea:</b> Chronic inflammation of the entire digestive tract lining, leading to severe abdominal cramping, indigestion, and persistent diarrhea.</li>
                                        <li><b>Dementia:</b> Central nervous system decline causing profound fatigue, deep depression, confusion, paranoia, and memory loss.</li>
                                        <li><b>Death:</b> If left completely untreated by medical professionals, severe Pellagra is fatal.</li>
                                    </ul>
                                </div>
                                )}

                                {/* Отображаем контент Передозировки, если активен таб 'overdose' */}
                                {activeTab === 'overdose' && (
                                <div className={`${styles["ts-tab"]} ${styles["overdose-symptoms-content"]}`}>
                                    While consuming naturally occurring Niacin in regular food will not cause issues, high-dose commercial supplements can lead to adverse events.
                                    <ul>
                                        <li>Tolerable Upper Intake Level (UL): The established Upper Limit is <b>35 mg / day</b> for adults to prevent uncomfortable side effects.</li>
                                    </ul>
                                    
                                    <b>The Niacin Flush Effect</b>
                                    Taking doses above 30–50 mg of nicotinic acid supplements typically triggers a classic **Niacin Flush**. This causes the small capillaries in the skin to dilate, leading to an intense, temporary redness, warmth, and burning or itching sensation across the face, neck, and chest. It is usually harmless and subsides in 1–2 hours.
                                    <br></br><br></br>
                                    <b>Severe Toxicity Risks</b>
                                    Consuming massive doses (typically 1,000 mg to 3,000 mg per day under improper clinical management) can lead to serious conditions:
                                    <ul>
                                        <li>Hepatotoxicity (severe liver damage or elevated liver enzymes).</li>
                                        <li>Severe gastrointestinal ulcers, nausea, and vomiting.</li>
                                        <li>Impaired glucose tolerance and elevated blood sugar levels.</li>
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