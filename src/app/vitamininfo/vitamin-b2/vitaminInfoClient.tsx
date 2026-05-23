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
                        <h1 className={styles["vitamin-name"]}>Vitamin B2 (Riboflavin)</h1>
                        <div className={styles["vitamin-category"]}>Nutrients/vitamins</div>

                        <div style={{background: 'none'}} className={styles["vitamin-description"]}>
                            Vitamin B2, universally known as Riboflavin, is a essential water-soluble vitamin that plays a foundational role in human health. It cannot be synthesized or significantly stored by the body, meaning any excess is naturally flushed out through urine (often giving it a signature bright yellow-neon hue). A consistent daily intake through your diet is necessary to keep your cellular metabolisms running effectively.
                        </div>

                        <div style={{background: '#fbf2d8'}} className={`${styles["key-functions"]} ${styles["vitamin-section"]}`}>
                            <h3>Key Functions</h3>
                            Riboflavin works at the core cellular level, serving as a critical component of key coenzymes responsible for energy production and body maintenance:
                            <ul>
                                <li><b>Energy Production & Metabolism:</b> It acts as a mandatory builder for coenzymes (FAD and FMN) that help convert proteins, fats, and carbohydrates from your food into usable energy (ATP) for your entire body.</li>
                                <li><b>Antioxidant & Cellular Protection:</b> Vitamin B2 helps recycle glutathione, which is one of the body’s most important internal antioxidants, shielding your cells from everyday oxidative damage.</li>
                                <li><b>Skin, Eye, and Tissue Maintenance:</b> It plays a vital role in maintaining the normal health of your skin, mucous membranes, cornea, and nervous system, while aiding tissue repair.</li>
                                <li><b>Conversion of Other B Vitamins:</b> Riboflavin is required to convert Vitamin B6 and Folate (B9) into their active forms so the body can actively utilize them.</li>
                            </ul>
                        </div>

                        <div style={{background: "none"}} className={`${styles["top-food-sources"]} ${styles["vitamin-section"]}`}>
                            <h3>Top Food Sources</h3>
                            Riboflavin is found naturally in a wide spectrum of animal and plant-based foods, though it is highly sensitive to light and can be easily destroyed by improper storage.
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
                                        src={"/products/milk.png"}
                                        alt={"milk"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Milk & Dairy</div>
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
                                        src={"/products/almond.png"}
                                        alt={"almond"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Almonds</div>
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
                                <li><b>Organ Meats:</b> Beef liver and kidneys offer exceptionally high natural concentrations.</li>
                                <li><b>Dairy Products & Eggs:</b> Whole milk, yogurt, cheeses, and eggs are primary, highly bioavailable daily sources.</li>
                                <li><b>Green Leafy Vegetables:</b> Spinach, asparagus, and broccoli provide solid vegetable-based doses.</li>
                                <li><b>Nuts and Seeds:</b> Almonds and sunflower seeds are packed with natural riboflavin.</li>
                                <li><b>Fortified Grains:</b> Many commercial breakfast cereals, breads, and pastas are enriched with Vitamin B2 to prevent population-wide deficiencies.</li>
                            </ul>

                        </div>

                        <div style={{background: '#fbf0d9'}} className={`${styles["nutrients-and-microelements"]} ${styles["vitamin-section"]}`}>
                            <h3>Recommended Daily Intake (RDI)</h3>
                            Dietary recommendations for Vitamin B2 are measured in Milligrams (mg).
                            <b>Adults</b>
                            <ul>
                                <li>Men (19+ years): 1.3 mg / day</li>
                                <li>Women (19+ years): 1.1 mg / day</li>
                                <li>Pregnant Women: 1.4 mg / day</li>
                                <li>Lactating Women: 1.6 mg / day — Increased intake is vital to properly maintain the nutritional quality of breast milk.</li>
                            </ul>
                            <b>Children</b>
                            <ul>
                                <li>Infants (0–6 months): 0.3 mg / day</li>
                                <li>Infants (7–12 months): 0.4 mg / day</li>
                                <li>Toddlers (1–3 years): 0.5 mg / day</li>
                                <li>Children (4–8 years): 0.6 mg / day</li>
                                <li>Children (9–13 years): 0.9 mg / day</li>
                                <li>Adolescents (14–18 years): 1.3 mg / day for boys, 1.0 mg / day for girls</li>
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
                                    A clinical lack of Vitamin B2 triggers a specific deficiency medical condition known as <b>Ariboflavinosis</b>. Because riboflavin supports tissue repair and energy synthesis, its absence primarily manifests as prominent lesions, cracks, and inflammation on the skin and mucosal surfaces.
                                    <br></br><br></br>
                                    <b>Major Physical Symptoms</b>
                                    <ul>
                                        <li><b>Angular Cheilitis:</b> Painful cracking, split sores, and deep fissures at the outer corners of the mouth.</li>
                                        <li><b>Glossitis and Stomatitis:</b> A swollen, sore, bright red or magenta-colored tongue, alongside general inflammation of the inner mouth lining.</li>
                                        <li><b>Seborrheic Dermatitis:</b> Scaly, greasy, itchy skin eruptions, particularly affecting the scrotum, vulva, or the skin around the nose and eyelids.</li>
                                        <li><b>Ocular Issues:</b> Bloodshot, watery eyes that are highly sensitive to light (photophobia), paired with blurred vision.</li>
                                        <li><b>Anemia:</b> Long-term deficiency can impair iron absorption and utilization, leading to constant physical fatigue and weakness.</li>
                                    </ul>
                                </div>
                                )}

                                {/* Отображаем контент Передозировки, если активен таб 'overdose' */}
                                {activeTab === 'overdose' && (
                                <div className={`${styles["ts-tab"]} ${styles["overdose-symptoms-content"]}`}>
                                    Because Vitamin B2 is entirely water-soluble, it has an exemplary safety and toxicity profile. The human gastrointestinal tract naturally limits how much riboflavin it can absorb from a single meal or supplement dose, and your kidneys actively filter out any excess through your urine.
                                    <ul>
                                        <li>Tolerable Upper Intake Level (UL): There is <b>no established Upper Limit</b> for Vitamin B2. No toxic side effects or adverse health events have been documented from consuming massive amounts through food or high-dose oral supplements.</li>
                                    </ul>
                                    
                                    <b>The Neon Urine Effect</b>
                                    The only noticeable consequence of high Vitamin B2 intake is a dramatic change in urine color to a vibrant, glowing <b>neon yellow-orange</b>. This is completely harmless and is simply a visual sign of your body successfully processing and shedding the excess, unabsorbed vitamin.
                                    <br></br>
                                    <b>Potential Minor Side Effects</b>
                                    Even at mega-therapeutic doses (such as 400 mg daily used clinically to help prevent migraines), digestive upset or mild diarrhea are extremely rare and typically disappear as soon as the excess supplementation is discontinued.
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