"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from 'next/image';
import styles from "../productInfo.module.css";

// Структурированный массив данных для макронутриентов (на 100г подсолнечного масла)
const MACRO_NUTRIENTS = [
    {
        id: "calories",
        name: "Calories",
        slug: "",
        amount: "884 kcal",
        bg: "#15837c",
        description: "An incredibly concentrated source of pure metabolic energy. Since it consists entirely of lipids, proper portion control is key."
    },
    {
        id: "protein",
        name: "Protein",
        slug: "",
        amount: "0 grams",
        bg: "#f5722c",
        description: "Completely free of proteins and amino acids due to the intensive extraction and filtration processes of the seeds."
    },
    {
        id: "fat",
        name: "Total Fat",
        slug: "",
        amount: "100 grams",
        bg: "#e4a910",
        description: "100% pure dietary lipid matrix, primarily composed of unsaturated fatty acids (oleic and linoleic) that act as essential vehicle carriers for fat-soluble vitamins."
    },
    {
        id: "carbs",
        name: "Carbohydrates",
        slug: "",
        amount: "0 grams",
        bg: "#15837c",
        description: "Contains zero sugars, starches, or dietary fibers, yielding an absolute zero glycemic response."
    }
];

// Структурированный массив данных для микронутриентов (на 100г)
const MICRO_NUTRIENTS = [
    { 
        id: "vitE", 
        slug: "vitamin-e",
        name: "Vitamin E (Alpha-Tocopherol)", 
        amount: "41.1 mg / 274% DV", 
        bg: "#1a96cd", 
        description: "A phenomenal concentration of this primary fat-soluble antioxidant. It actively safeguards cellular lipids from oxidative stress and supports vascular walls." 
    },
    { 
        id: "vitK", 
        slug: "vitamin-k",
        name: "Vitamin K1 (Phylloquinone)", 
        amount: "5.4 mcg / 5% DV", 
        bg: "#66ab63", 
        description: "Present in trace amounts, contributing subtly to the structural regulation of blood coagulation cascades and bone mineralization pathways." 
    },
    { 
        id: "pufa", 
        slug: "omega-6",
        name: "Omega-6 (Linoleic Acid)", 
        amount: "65.7 grams", 
        bg: "#f5722c", 
        description: "An essential polyunsaturated fatty acid that the human body cannot synthesize. It assists in maintaining structural cellular membrane fluidity." 
    },
    { 
        id: "mufa", 
        slug: "omega-9",
        name: "Omega-9 (Oleic Acid)", 
        amount: "19.5 grams", 
        bg: "#e4a910", 
        description: "A stable monounsaturated fatty acid that exhibits excellent resistance to thermal oxidation, helping preserve the structural integrity of the oil." 
    },
    { 
        id: "saturatedFat", 
        slug: "saturated-fats",
        name: "Saturated Fats", 
        amount: "10.3 grams", 
        bg: "#15837c", 
        description: "Maintains a very low percentage of saturated lipids, keeping the oil completely liquid at room temperatures and highly versatile." 
    },
    { 
        id: "phytols", 
        slug: "phytosterols",
        name: "Phytosterols", 
        amount: "260 mg", 
        bg: "#1a96cd", 
        description: "Plant-derived structural sterols that chemically compete with dietary cholesterol in the gut, helping moderate systemic cholesterol absorption." 
    }
];

// Объединяем типы для стейта модального окна
type NutrientItem = typeof MACRO_NUTRIENTS[number] | typeof MICRO_NUTRIENTS[number];

const ProductInfoClient = () => {
    const [selectedItem, setSelectedItem] = useState<null | NutrientItem>(null);
    const dialogRef = useRef<HTMLDialogElement | null>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        
        if (selectedItem) {
            dialog.showModal();
        } else {
            dialog.close();
        }
    }, [selectedItem]);

    const handleOpenModal = (item: NutrientItem) => {
        setSelectedItem(item);
    };

    const handleCloseModal = () => {
        setSelectedItem(null);
    };

    return (    
        <div className={styles["main-layout"]}>
            <div className={styles["content-section"]}>
                <div className={styles["content"]}>
                    <div className={styles["product-img-container"]}>
                        <Link href="/products" className={styles["backlink"]}>
                            <Image 
                                src="/back.svg"
                                alt="back"
                                width={20}
                                height={20}
                            />
                        </Link>
                        <Image
                            src="/productinfo/sunflower-oil.png"
                            alt="sunflower oil"
                            width={600}
                            height={472}
                            className={styles["product-img"]}
                        />
                    </div>
                    <div className={styles["content-text"]}>
                        <h1 className={styles["product-name"]}>Sunflower Oil</h1>
                        <div className={styles["product-category"]}>Oils & Fats</div>

                        <div style={{background: '#fbf2d8'}} className={styles["product-description"]}>
                            Sunflower oil is a highly refined or cold-pressed botanical lipid fluid. Boasting one of the richest natural distributions of Vitamin E (Alpha-Tocopherol) alongside an abundant matrix of essential unsaturated fats, it functions as a highly effective medium for food preparation and fat-soluble nutrient absorption.
                        </div>

                        {/* Список Макронутриентов */}
                        <div style={{background: '#fbf0d9'}} className={`${styles["macro-nutrients"]} ${styles["product-section"]}`}>
                            <h3>Macro Nutrients (per 100g) <span className={styles["hint"]}>(Click to learn more)</span></h3>
                            {MACRO_NUTRIENTS.map((item) => (
                                <div 
                                    key={item.id}
                                    style={{ background: item.bg }} 
                                    className={`${styles['macro-nutrient']} ${styles['subelem']} ${styles['clickable-element']}`}
                                    onClick={() => handleOpenModal(item)}
                                >
                                    {item.name}
                                </div>
                            ))}
                        </div>

                        {/* Список микроэлементов */}
                        <div style={{background: '#fbf0d9'}} className={`${styles["nutrients-and-microelements"]} ${styles["product-section"]}`}>
                            <h3>Nutrients and microelements <span className={styles["hint"]}>(Click to learn more)</span></h3>
                            {MICRO_NUTRIENTS.map((item) => (
                                <div 
                                    key={item.id}
                                    style={{ background: item.bg }} 
                                    className={`${styles['macro-nutrient']} ${styles['subelem']} ${styles['clickable-element']}`}
                                    onClick={() => handleOpenModal(item)}
                                >
                                    {item.name}
                                </div>
                            ))}
                        </div>
                        
                        <div style={{background: '#fbf2d8'}} className={`${styles["health-benefits"]} ${styles["product-section"]}`}>
                            <h3>Key Health Benefits</h3>
                            <ul>
                                <li><b>Elite Antioxidant Action:</b> With over 270% of the daily value of Vitamin E per 100g, it protects lipid-heavy organs like the brain and cardiovascular linings from free radical decay.</li>
                                <li><b>Optimized Nutrient Carriage:</b> Acts as an ideal structural delivery vehicle, drastically increasing the biological assimilation of fat-soluble vitamins (A, D, E, K) from companion vegetables.</li>
                                <li><b>Cholesterol Modulation via Sterols:</b> The healthy presence of phytosterols actively blocks intestinal pathways for low-density lipoprotein (LDL) absorption, aiding overall profile management.</li>
                                <li><b>Dermal Softening Properties:</b> When utilized or ingested, the high linoleic acid concentrations directly reinforce skin barrier structures and aid structural lipid repair.</li>
                            </ul>
                        </div>

                        <div style={{background: '#fff2f0'}} className={`${styles["precautions"]} ${styles["product-section"]}`}>
                            <h3>Important Precautions</h3>
                            <ul>
                                <li><b>Extreme Caloric Concentration:</b> Composed entirely of pure fats, a single tablespoon contains roughly 120 calories. Heavy or unmeasured consumption can inadvertently disrupt daily energy-balance goals.</li>
                                <li><b>Omega-6 to Omega-3 Imbalance:</b> Standard sunflower oil contains a high ratio of Omega-6 to Omega-3 fatty acids. Over-reliance without balancing with Omega-3 rich sources (like flax or fish oils) can encourage a pro-inflammatory profile in tissues.</li>
                                <li><b>Smoke Point & Free Radical Risks:</b> Unrefined (cold-pressed) varieties possess a low smoke point. Heating them beyond safety levels causes rapid lipid breakdown, generating toxic aldehydes. For high-heat cooking, refined or high-oleic variants must be selected.</li>
                                <li><b>Oxidative Rancidity Factors:</b> Due to the high structural volume of polyunsaturated links, improper storage exposed to direct light, air, or heat can oxidize the oil quickly, turning it rancid. Keeping it sealed in cool, dark environments is mandatory.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles["navigation"]}>
                <Link className={styles["nav-link"]} href="/main">
                    <Image src="/main/home.svg" alt="home" width={48} height={48} />
                </Link>
                <Link className={styles["nav-link"]} href="#">
                    <Image src="/main/products-green.svg" alt="products" width={48} height={48} />
                </Link>
                <Link className={styles["nav-link"]} href="/vitamins">
                    <Image src="/main/antioxidant.svg" alt="antioxidant" width={48} height={48} />
                </Link>
                <Link className={styles["nav-link"]} href="/favorites">
                    <Image src="/main/heart.svg" alt="heart" width={48} height={48} />
                </Link>
            </div>

            {/* Универсальное нативное диалоговое окно */}
            <dialog 
                ref={dialogRef} 
                className={styles["modal-dialog"]}
                onClose={handleCloseModal}
                onClick={(e) => {
                    if (e.target === dialogRef.current) handleCloseModal();
                }}
            >
                {selectedItem && (
                    <div className={styles["modal-content"]}>
                        <div 
                            className={styles["modal-header-badge"]} 
                            style={{ backgroundColor: selectedItem.bg }}
                        >
                            {selectedItem.name}: {selectedItem.amount}
                        </div>
                        
                        <p className={styles["modal-description"]}>
                            {selectedItem.description}
                        </p>
                        
                        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', gap: '10px', marginTop: '10px' }}>
                            {selectedItem.slug && (
                                <Link 
                                    href={`/vitamininfo/${selectedItem.slug}`}
                                    className={styles["modal-more-link"]}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        background: selectedItem.bg,
                                        color: '#fff',
                                        fontSize: '14px',
                                        textDecoration: 'none',
                                        fontWeight: '500',
                                        flex: 1,
                                        textAlign: 'center'
                                    }}
                                >
                                    More
                                </Link>
                            )}

                            <button className={styles["modal-close-btn"]} onClick={handleCloseModal} style={{ flex: 1 }}>
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </dialog>
        </div>
    );
};

export default ProductInfoClient;