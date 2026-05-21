"use client";

import Link from "next/link";
import Image from 'next/image';
import { useState } from 'react';
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
                        <h1 className={styles["vitamin-name"]}>Vitamin A (Retinol)</h1>
                        <div className={styles["vitamin-category"]}>Nutrients/vitamins</div>

                        <div style={{background: 'none'}} className={styles["vitamin-description"]}>
                            Vitamin A is a crucial, fat-soluble nutrient that plays a vital role in maintaining overall health, particularly for your vision, immune system, and skin.
                        </div>

                        <div style={{background: '#fbf2d8'}} className={`${styles["key-functions"]} ${styles["vitamin-section"]}`}>
                            <h3>Key Functions</h3>
                            <ul>
                                <li><b>Vision Support:</b> It is a critical component of rhodopsin, a protein that allows your eyes to see in low-light conditions.</li>
                                <li><b>Skin health</b> It promotes healthy cell turnover, keeps the skin barrier intact, and helps prevent conditions like severe dryness or acne.</li>
                                <li><b>Immune Support:</b> It helps maintain the mucosal barriers in your respiratory and digestive tracts, acting as a first line of defense against infections.</li>
                                <li><b>Antioxidant Protection:</b> It protects cells from oxidative stress and damage caused by free radicals.</li>
                            </ul>
                        </div>

                        <div style={{background: "none"}} className={`${styles["top-food-sources"]} ${styles["vitamin-section"]}`}>
                            <h3>Top Food Sources</h3>
                            <div className={styles["food-sources-container"]}>
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/carrot.png"}
                                        alt={"carrot"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Carrot</div>
                                </div>
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/cottage-cheese.png"}
                                        alt={"cottage-cheese"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Cottage Cheese</div>
                                </div>
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/liver.png"}
                                        alt={"liver"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Liver</div>
                                </div>
                                <div className={`${styles['food-source']} ${styles['subelem']}`}>
                                    <Image 
                                        src={"/products/pumpkin.png"}
                                        alt={"pumpkin"}
                                        width={40}
                                        height={40}
                                        className={styles["food-source-img"]}
                                    />
                                    <div className={styles["product-name"]}>Pumpkin</div>
                                </div>
                            </div>
                        </div>

                        <div style={{background: '#fbf0d9'}} className={`${styles["nutrients-and-microelements"]} ${styles["vitamin-section"]}`}>
                            <h3>Recommended Daily Intake (RDI)</h3>
                            <ul>
                                <li>700–900 mcg for adults</li>
                                <li>300–600 mcg for children</li>
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
                                    <ul>
                                    <li><b>Night Blindness & Dry Eyes:</b> Early difficulty seeing in low light that progresses to severe dryness (Xerophthalmia) and white, foamy Bitot's spots on the eyes.</li>
                                    <li><b>Permanent Blindness:</b> Severe, untreated deficiency that causes the cornea to soften, scar, and lead to permanent vision loss.</li>
                                    <li><b>Rough, Dry Skin:</b> Keratin buildup in hair follicles that creates a rough, bumpy "gooseflesh" texture, alongside generally dry skin and hair.</li>
                                    <li><b>Stunted Growth & Slow Healing:</b> Delayed physical and bone development in children, accompanied by significantly slower recovery times for wounds and cuts.</li>
                                    </ul>
                                </div>
                                )}

                                {/* Отображаем контент Передозировки, если активен таб 'overdose' */}
                                {activeTab === 'overdose' && (
                                <div className={`${styles["ts-tab"]} ${styles["overdose-symptoms-content"]}`}>
                                    <strong>Acute Overdose (Sudden High Dose):</strong>
                                    <ul>
                                    <li><b>Headaches, Dizziness & Confusion:</b> Caused by increased intracranial pressure from a sudden massive dose.</li>
                                    <li><b>Nausea, Vomiting & Gastric Pain:</b> Immediate digestive distress and abdominal discomfort.</li>
                                    <li><b>Skin Irritation & Peeling:</b> Rapidly developing skin rashes followed by peeling, especially on the palms and soles.</li>
                                    </ul>
                                    
                                    <strong>Chronic Overdose (Long-term Accumulation):</strong>
                                    <ul>
                                    <li><b>Bone & Joint Pain:</b> Abnormal bone thickening and painful swelling in the joints over time.</li>
                                    <li><b>Liver Damage & Jaundice:</b> Chronic liver stress leading to enlargement, dysfunction, and yellowing of the skin or eyes.</li>
                                    <li><b>Severe Dryness & Hair Loss:</b> Progressive toxicity causing cracked skin, split lips, and significant hair loss.</li>
                                    <li><b>Fetal Birth Defects:</b> High toxicity risk for pregnant individuals, as excess preformed Vitamin A can harm fetal development.</li>
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