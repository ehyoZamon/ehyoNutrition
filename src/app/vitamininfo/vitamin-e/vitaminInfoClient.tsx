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
                        <h1 className={styles["vitamin-name"]}>Vitamin E (Alpha-tocopherol)</h1>
                        <div className={styles["vitamin-category"]}>Nutrients/vitamins</div>

                        <div style={{background: 'none'}} className={styles["vitamin-description"]}>
                            <ul>
                                <li>Note: Vitamin E is actually a family of 8 different fat-soluble compounds (4 tocopherols and 4 tocotrienols), but alpha-tocopherol is the only form that meets human dietary requirements.</li>
                            </ul>
                            Vitamin E is a fat-soluble nutrient, meaning your body absorbs it alongside dietary fats and stores the excess in your liver and fatty tissues. Known primarily as the body's premier bodyguard for cell membranes, it acts as a shield to keep your cellular structures intact and healthy.
                        </div>

                        <div style={{background: '#fbf2d8'}} className={`${styles["key-functions"]} ${styles["vitamin-section"]}`}>
                            <h3>Key Functions</h3>
                            Vitamin E works at the microscopic level to keep your systems running smoothly:
                            <ul>
                                <li><b>Primary Antioxidant Protection:</b> It stops the production of reactive oxygen species (ROS) when fat undergoes oxidation. In simple terms, it prevents the fats in your cell membranes from going "rancid" due to pollution, smoke, and normal metabolic waste.</li>
                                <li><b>Immune System Enhancement:</b> It helps maintain the integrity of T-cell membranes, allowing these critical white blood cells to divide properly and communicate effectively to fight off infections.</li>
                                <li><b>Cardiovascular & Blood Vessel Health:</b> It prevents blood platelets from clumping together abnormally and helps widen blood vessels, lowering the risk of unwanted blood clots.</li>
                                <li><b>Skin and Eye Preservation:</b> By shielding lipid structures from oxidative stress, it helps protect the cells in your skin and eyes from UV and environmental damage.</li>
                            </ul>
                        </div>

                        <div style={{background: "none"}} className={`${styles["top-food-sources"]} ${styles["vitamin-section"]}`}>
                            <h3>Top Food Sources</h3>
                            <div className={styles["food-sources-container"]}>
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/wheat-germ-oil.png"}
                                        alt={"wheat-germ-oil"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Wheat Germ Oil</div>
                                </div>
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/sunflower-seeds.png"}
                                        alt={"sunflower-seeds"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Sunflower seeds</div>
                                </div>
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/sunflower-oil.png"}
                                        alt={"sunflower-oil"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Sunflower oil</div>
                                </div>

                                
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/corn.png"}
                                        alt={"corn"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Corn</div>
                                </div>
                                
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/soybean-oil.png"}
                                        alt={"soybean-oil"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Soybean oil</div>
                                </div>
                                
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/avocado.png"}
                                        alt={"avocado"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Avocados</div>
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
                                        src={"/products/broccoli.png"}
                                        alt={"broccoli"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Broccoli</div>
                                </div>
                            </div>

                            Because Vitamin E is fat-soluble, it is found in the highest concentrations in plant oils, nuts, and seeds.
                            <ul>
                                <li><b>Wheat Germ Oil:</b> The single richest source available (1 tablespoon provides roughly 20 mg).</li>
                                <li><b>Seeds & Nuts:</b> Sunflower seeds and almonds are nutritional powerhouses. Just one ounce of dry-roasted sunflower seeds delivers over 7 mg of Vitamin E.</li>
                                <li><b>Plant-Based Oils:</b> Sunflower, safflower, corn, and soybean oils.</li>
                                <li><b>Avocados:</b> A single whole avocado offers around 4 mg of natural, healthy-fat-bound Vitamin E.</li>
                                <li><b>Green Leafy Vegetables:</b> Spinach, Swiss chard, and broccoli provide moderate amounts alongside a host of other vitamins.</li>
                            </ul>

                            <b>The Complex Absorption Factor:</b> Absorbing B12 is a complex, multi-step process. In the stomach, hydrochloric acid releases B12 from protein food structures. Then, a specialized protein secreted by the stomach lining called Intrinsic Factor (IF) must bind to the vitamin. This B12-IF complex travels down to the very end of the small intestine (the ileum), where it can finally be absorbed by the body. A lack of acid or Intrinsic Factor blocks absorption entirely, regardless of how much B12 you eat.    
                        </div>

                        <div style={{background: '#fbf0d9'}} className={`${styles["nutrients-and-microelements"]} ${styles["vitamin-section"]}`}>
                            <h3>Recommended Daily Intake (RDI)</h3>
                           Dietary recommendations for Vitamin E are measured in Milligrams (mg).<br></br>
                            <b>Adults</b>
                            <ul>
                                <li>Men & Women (14+ years): 15 mg / day</li>
                                <li>Pregnant Women: 15 mg / day</li>
                                <li>Lactating Women: 19 mg / day — Increased intake is necessary to support the nutrient content exported into breast milk.</li>
                            </ul>
                            <b>Children</b>
                            <ul>
                                <li>Infants (0–6 months): 4 mg / day</li>
                                <li>Infants (7–12 months): 5 mg / day</li>
                                <li>Toddlers (1–3 years): 6 mg / day</li>
                                <li>Children (4–8 years): 7 mg / day</li>
                                <li>Children (9–13 years): 11 mg / day</li>
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
                                    True Vitamin E deficiency is incredibly rare in healthy individuals. When it does occur, it is almost always caused by diseases that prevent the body from absorbing fat correctly (such as Celiac disease, Cystic Fibrosis, or Crohn's disease).
                                    <br></br>
                                    <br></br>
                                    <b>Major Symptoms</b>
                                    
                                    <ul>
                                        <li><b>Peripheral Neuropathy:</b> Nerve damage in the hands and feet, leading to chronic numbness, tingling, or a "pins and needles" sensation.</li>
                                        <li><b>Ataxia (Loss of Coordination):</b> Impaired nerve transmission causes a lack of control over bodily movements, resulting in difficulty walking or balancing.</li>
                                        <li><b>Skeletal Myopathy:</b> Progressive muscle weakness and pain throughout the body.</li>
                                        <li><b>Hemolytic Anemia:</b> A condition where red blood cells become structurally fragile and rupture easily, leading to low red blood cell counts and fatigue.</li>
                                        <li><b>Retinopathy:</b> Degeneration of the light-sensing cells in the retina, which can impair vision over time.</li>
                                    </ul>
                                </div>
                                )}

                                {/* Отображаем контент Передозировки, если активен таб 'overdose' */}
                                {activeTab === 'overdose' && (
                                <div className={`${styles["ts-tab"]} ${styles["overdose-symptoms-content"]}`}>
                                    It is practically impossible to consume too much Vitamin E from a regular food-based diet. Toxicity is driven almost exclusively by high-dose, long-term use of synthetic supplements.
                                    <ul>
                                        <li><b>Tolerable Upper Intake Level (UL):</b> 1,000 mg / day for adults.</li>
                                    </ul>
                                    
                                    <b>The Primary Risk: Bleeding</b>
                                    The biggest hazard of an overdose is Vitamin E’s ability to interfere with how your blood clots:
                                    <li><b>Inhibition of Vitamin K:</b> High concentrations of Vitamin E actively block Vitamin K from doing its job, which is to help blood clot when you are injured.</li>
                                    <li><b>Increased Hemorrhage Risk:</b> Exceeding the upper intake level increases the risk of severe, uncontrolled bleeding (hemorrhage) or an intracranial stroke, particularly if a person is already taking prescription blood thinners (like aspirin or warfarin).</li>
                                    <li><b>General Side Effects:</b> Nausea, diarrhea, blurred vision, and profound muscle fatigue can occur at highly elevated, toxic doses.</li>
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