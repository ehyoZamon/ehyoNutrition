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
                        <h1 className={styles["vitamin-name"]}>Vitamin С (Ascorbic acid)</h1>
                        <div className={styles["vitamin-category"]}>Nutrients/vitamins</div>

                        <div style={{background: 'none'}} className={styles["vitamin-description"]}>
                            Vitamin C is a essential, water-soluble vitamin. Unlike many animals, humans cannot synthesize it internally due to the lack of a specific enzyme (L-gulonolactone oxidase). Because it is water-soluble, your body does not store it in large amounts; any excess is flushed out through urine, meaning you need to consume it regularly through your diet.
                        </div>

                        <div style={{background: '#fbf2d8'}} className={`${styles["key-functions"]} ${styles["vitamin-section"]}`}>
                            <h3>Key Functions</h3>
                            Vitamin C acts as a powerful helper across several major bodily systems:
                            <ul>
                                <li><b>Antioxidant Protection:</b> It neutralizes free radicals—unstable molecules that damage cells and contribute to aging and diseases like cancer or heart disease.</li>
                                <li><b>Collagen Synthesis:</b> It is a mandatory co-factor for building collagen, the primary structural protein that knits together your skin, tendons, ligaments, bones, and blood vessels.</li>
                                <li><b>Immune Support:</b> It stimulates the production and function of white blood cells (like phagocytes and lymphocytes) which hunt down pathogens.</li>
                                <li><b>Iron Absorption:</b> It significantly improves the absorption of non-heme iron (the type of iron found in plant-based foods like spinach and lentils).</li>
                            </ul>
                        </div>

                        <div style={{background: "none"}} className={`${styles["top-food-sources"]} ${styles["vitamin-section"]}`}>
                            <h3>Top Food Sources</h3>
                            <div className={styles["food-sources-container"]}>
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/arecola-cherries.svg"}
                                        alt={"arecola-cherries"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Arecola cherries</div>
                                </div>
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/kakadu-plums.svg"}
                                        alt={"kakadu-plums"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Kakadu plums</div>
                                </div>
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/bell-pepper.png"}
                                        alt={"bell-pepper"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Bell peppers</div>
                                </div>
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/citrus-fruits.png"}
                                        alt={"citrus"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Citrus fruits</div>
                                </div>

                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/kiwi.png"}
                                        alt={"kiwi"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Kiwi</div>
                                </div>

                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/crucifirous-vegetables.png"}
                                        alt={"cruciferous-vegetables"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Cruciferous vegetables.png</div>
                                </div>

                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/strawberry.png"}
                                        alt={"strawberry"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Strawberries</div>
                                </div>

                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/tomatoes.png"}
                                        alt={"tomatoes"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Tomatoes</div>
                                </div>
                            </div>

                            <ul>
                                <li><b>Kakadu Plums & Acerola Cherries:</b> The absolute highest natural concentrations (though rarer to find fresh).</li>
                                <li><b>Red & Yellow Bell Peppers:</b> One medium red pepper provides roughly 150–190 mg of Vitamin C—more than double an orange.</li>
                                <li><b>Citrus Fruits:</b> Oranges, grapefruits, lemons, and limes.</li>
                                <li><b>Kiwi:</b> Two medium kiwis deliver about 130 mg.</li>
                                <li><b>Cruciferous Vegetables:</b> Broccoli, Brussels sprouts, and kale.</li>
                                <li><b>Strawberries & Tomatoes:</b> Excellent, easily accessible everyday sources.</li>
                            </ul>

                            <b>Cooking Tip:</b> Because Vitamin C is highly sensitive to heat and water, cooking methods like boiling can leach up to 50% of the nutrient into the water. To preserve the maximum amount, opt for raw eating, steaming, or microwaving.
                        </div>

                        <div style={{background: '#fbf0d9'}} className={`${styles["nutrients-and-microelements"]} ${styles["vitamin-section"]}`}>
                            <h3>Recommended Daily Intake (RDI)</h3>
                            The standard Recommended Dietary Allowances (RDA) vary distinctly by age and lifestyle factors:<br></br>
                            Adults
                            <ul>
                                <li>Men (19+ years): 90 mg / day</li>
                                <li>Women (19+ years): 75 mg / day</li>
                                <li>Pregnant Women: 85 mg / day</li>
                                <li>Lactating Women: 120 mg / day</li>
                                <li>Smokers: Require an additional 35 mg / day because nicotine and tobacco smoke increase oxidative stress, depleting the body's vitamin stores faster.</li>
                            </ul>
                            Children
                            <ul>
                                <li>Infants (0–12 months): 40–50 mg / day (typically met via breastmilk or formula)</li>
                                <li>Toddlers (1–3 years): 15 mg / day</li>
                                <li>Children (4–8 years): 25 mg / day</li>
                                <li>Children (9–13 years): 45 mg / day</li>
                                <li>Adolescents (14–18 years): 75 mg / day for boys, 65 mg / day for girls</li>
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
                                    A severe lack of Vitamin C over several weeks to months leads to the breakdown of collagen production, culminating in a historical condition known as Scurvy. <br></br>
                                    <br></br>
                                   <b>Early Warning Signs:</b>
                                    <ul>
                                        <li>Persistent, unexplained fatigue and lethargy.</li>
                                        <li>"Corkscrew" hairs on the arms and legs.</li>
                                        <li>Rough, bumpy, or dry skin (keratosis pilaris).</li>
                                    </ul>
                                    <b>Advandced Symptoms (Scurvy):</b>
                                    <ul>
                                        <li>Swollen and Bleeding Gums: The blood vessels lose structural integrity; teeth can eventually loosen and fall out.</li>
                                        <li>Easy Bruising (Petechiae): Small, purple-red spots under the skin where tiny capillaries have ruptured.</li>
                                        <li>Delayed Wound Healing: Old wounds or scars may even split back open because the body cannot generate the collagen required to repair tissue.</li>
                                        <li>Severe Joint Pain: Caused by bleeding inside the joint capsules.</li>
                                    </ul>
                                </div>
                                )}

                                {/* Отображаем контент Передозировки, если активен таб 'overdose' */}
                                {activeTab === 'overdose' && (
                                <div className={`${styles["ts-tab"]} ${styles["overdose-symptoms-content"]}`}>
                                    Because Vitamin C is water-soluble, it has low toxicity risks, and it is almost impossible to overdose via whole foods alone. However, high-dose supplementation can override the digestive tract's absorption capacity.
                                    
                                    <ul>
                                        <li><b>Tolerable Upper Intake Level (UL):</b> 2,000 mg / day for adults. Consuming more than this limit generally triggers gastrointestinal distress.</li>
                                    </ul>
                                    
                                    <b>Symptoms of Excess Intake:</b>
                                    <ul>
                                        <li>Diarrhea and abdominal cramping (caused by unabsorbed vitamin drawing water into the large intestine).</li>
                                        <li>Nausea and heartburn.</li>
                                        <li><b>Kidney Stone Risk:</b> The body metabolizes excess Vitamin C into oxalate, which is excreted via urine. In individuals prone to kidney complications, hyper-dosing supplements can elevate the risk of developing calcium oxalate kidney stones.</li>
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