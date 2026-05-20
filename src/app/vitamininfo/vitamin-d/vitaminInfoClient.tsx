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
                        <h1 className={styles["vitamin-name"]}>Vitamin D (Calciferol)</h1>
                        <div className={styles["vitamin-category"]}>Nutrients/vitamins</div>

                        <div style={{background: 'none'}} className={styles["vitamin-description"]}>
                            Vitamin D is unique because it is a fat-soluble nutrient that actually functions as a pro-hormone in the body. Unlike other vitamins, your body can synthesize it entirely on its own when ultraviolet B (UVB) rays from sunlight hit your skin. Because it is fat-soluble, excess amounts are stored in your liver and fatty tissues for future use rather than being immediately excreted.
                            <div className={`${styles["vitamin-section"]}`}>
                                <ul>
                                    <li><b>Vitamin D2:</b> Ergocalciferol (plant-derived)</li>
                                    <li><b>Vitamin D3:</b> Cholecalciferol (animal-derived and synthesized by human skin)</li>
                                </ul>
                            </div>
                        </div>

                        <div style={{background: '#fbf2d8'}} className={`${styles["key-functions"]} ${styles["vitamin-section"]}`}>
                            <h3>Key Functions</h3>
                            Vitamin D is a biological master key that regulates more than 200 genes. Its most crucial roles include:
                            <ul>
                                <li><b>Calcium and Phosphorus Absorption:</b> It directly signals your intestines to absorb calcium from your food. Without enough Vitamin D, your body can only absorb about 10–15% of dietary calcium.</li>
                                <li><b>Bone and Tooth Mineralization:</b> It works alongside calcium to build dense, strong bone structures and enamel, preventing bones from becoming brittle, thin, or misshapen.</li>
                                <li><b>Immune Regulation:</b> It enhances the pathogen-fighting effects of monocytes and macrophages (white blood cells) and decreases inflammation.</li>
                                <li><b>Neuromuscular Function:</b> It plays a quiet but critical role in carrying messages between your brain and your muscles, ensuring proper muscle contraction and balance.</li>
                            </ul>
                        </div>

                        <div style={{background: "none"}} className={`${styles["top-food-sources"]} ${styles["vitamin-section"]}`}>
                            <h3>Top Food Sources</h3>
                            <div className={styles["food-sources-container"]}>
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/cod-liver-oil.png"}
                                        alt={"cod-liver-oil"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Cod Liver Oil</div>
                                </div>
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/fish.png"}
                                        alt={"fish"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Fatty Fish</div>
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

                            <ul>
                                <li><b>Cod Liver Oil:</b> The absolute richest natural source (1 tbsp contains roughly 1,360 IU).</li>
                                <li><b>Fatty Fish:</b> Salmon, mackerel, trout, and sardines. A 3-ounce serving of cooked wild salmon can provide around 500–700 IU.</li>
                                <li><b>UV-Exposed Mushrooms:</b> Certain mushrooms (like Portobello or White Button) treated with UV light can synthesize high amounts of Vitamin D2.</li>
                                <li><b>Egg Yolks:</b> Provide a modest amount (roughly 40 IU per large yolk), mostly concentrated in the fat.</li>
                                <li><b>Fortified Foods:</b> Cow's milk, plant-based milk alternatives (soy, almond, oat), orange juice, and breakfast cereals are heavily fortified with Vitamin D to help meet public health needs.</li>
                            </ul>
                            
                            <b>Absorption Note:</b> Because Vitamin D is fat-soluble, consuming your dietary sources or supplements alongside a meal that contains healthy fats (like avocado, olive oil, nuts, or eggs) significantly enhances its absorption rate in your gut.
                        </div>

                        <div style={{background: '#fbf0d9'}} className={`${styles["nutrients-and-microelements"]} ${styles["vitamin-section"]}`}>
                            <h3>Recommended Daily Intake (RDI)</h3>
                            Intake recommendations are usually listed in either International Units (IU) or Micrograms (μg).<br></br>
                            <b>Adults</b>
                            <ul>
                                <li>Adults (19–70 years): 600 IU (15μg) / day</li>
                                <li>Seniors (71+ years): 800 IU (20μg) / day — Higher intake is required to offset the skin's reduced capacity to synthesize the vitamin with age.</li>
                                <li>Pregnant & Lactating Women: 600 IU (15μg) / day</li>
                            </ul>
                            <b>Children</b>
                            <ul>
                                <li>Infants (0–12 months): 400 IU (10μg) / day — Breast milk is notoriously low in Vitamin D, so pediatricians routinely recommend standard drops for breastfed infants.</li>
                                <li>Children & Adolescents (1–18 years): 600 IU (15μg) / day</li>
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
                                    A deficiency occurs when low intake is paired with minimal sunlight exposure (due to northern latitudes, heavy sunscreen use, spending daytime indoors, or high melanin levels which block UVB rays).
                                    <br></br>
                                   <b>Early & Subtle Signs:</b>
                                    <ul>
                                        <li>Chronic fatigue and generalized low energy.</li>
                                        <li>Frequent infections, colds, or slow-healing wounds.</li>
                                        <li>Vague bone pain (particularly in the shins, thighs, or lower back) and muscle weakness.</li>
                                        <li>Mood shifts or a higher susceptibility to seasonal depression.</li>
                                    </ul>
                                    <b>Severe, Long-Term Pathologies</b>
                                    <ul>
                                        <li>Rickets (Children): A disease where the bone tissue fails to properly mineralize. This results in soft, malleable bones, leading to skeletal deformities like bowed legs, knocked knees, and a projected breastbone.</li>
                                        <li>Osteomalacia (Adults): The adult equivalent of rickets. It features a severe softening of the bones, causing intense bone aching and an drastically increased risk of fractures.</li>
                                        <li>Osteoporosis: Long-term depletion accelerates bone density loss, leading to fragile bones prone to breaks from minor falls.</li>
                                    </ul>
                                </div>
                                )}

                                {/* Отображаем контент Передозировки, если активен таб 'overdose' */}
                                {activeTab === 'overdose' && (
                                <div className={`${styles["ts-tab"]} ${styles["overdose-symptoms-content"]}`}>
                                    Vitamin D toxicity is almost exclusively caused by taking excessive high-dose commercial supplements over an extended period. It is physically impossible to overdose on Vitamin D from sunlight exposure (the skin self-regulates and destroys excess production) or from a standard whole-food diet.
                                    <ul>
                                        <li><b>Tolerable Upper Intake Level (UL):</b> 4,000 IU / day for anyone over 9 years old.</li>
                                    </ul>
                                    
                                    The main danger of a Vitamin D overdose is hypercalcemia—an over-accumulation of calcium in your blood caused by excessive gut absorption and bone resorption.
                                    <ul>
                                        <li>Short-Term Toxic Symptoms: Nausea, vomiting, frequent urination, excessive thirst, severe abdominal pain, constipation, and muscle weakness.</li>
                                        <li>Severe, Long-Term Damage: The excess calcium circulating in the blood begins to deposit into soft tissues. This can lead to the calcification of arteries, severe heart arrhythmias, and the formation of painful calcium kidney stones or permanent kidney damage.</li>
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