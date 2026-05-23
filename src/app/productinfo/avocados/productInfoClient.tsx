"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from 'next/image';
import styles from "../productInfo.module.css";

// Структурированный массив данных для макронутриентов (на 100г свежего авокадо)
const MACRO_NUTRIENTS = [
    {
        id: "calories",
        name: "Calories",
        slug: "",
        amount: "160 kcal",
        bg: "#15837c",
        description: "Higher in energy than typical fruits, delivering dense, clean metabolic fuel derived from high-quality monounsaturated fats."
    },
    {
        id: "protein",
        name: "Protein",
        slug: "",
        amount: "2.0 grams",
        bg: "#f5722c",
        description: "Provides nominal plant proteins containing essential building blocks to assist in daily cellular tissue maintenance."
    },
    {
        id: "fat",
        name: "Total Fat",
        slug: "",
        amount: "14.7 grams",
        bg: "#e4a910",
        description: "An exceptional matrix of heart-healthy fats, overwhelmingly dominated by oleic acid, which maximizes fat-soluble nutrient delivery."
    },
    {
        id: "carbs",
        name: "Carbohydrates",
        slug: "",
        amount: "8.5 grams",
        bg: "#15837c",
        description: "Mainly composed of complex structural dietary fibers with practically zero simple sugars, yielding a near-flat glycemic curve."
    }
];

// Структурированный массив данных для микронутриентов (на 100г)
const MICRO_NUTRIENTS = [
    { 
        id: "dietfiber", 
        slug: "fiber",
        name: "Dietary Fiber", 
        amount: "6.7 grams", 
        bg: "#f5722c", 
        description: "A brilliant blend of soluble and insoluble fibers that supports digestive regularity, balances gut microbiota, and optimizes satiety." 
    },
    { 
        id: "potassium", 
        slug: "potassium",
        name: "Potassium", 
        amount: "485 mg / 10% DV", 
        bg: "#1a96cd", 
        description: "An outstanding concentration—surpassing bananas—that regulates fluid pump mechanics, neural signaling, and resting vascular tone." 
    },
    { 
        id: "vitB5", 
        slug: "pantothenic-acid", // Или оставьте пустой "", если нет слага
        name: "Vitamin B5 (Pantothenic Acid)", 
        amount: "1.4 mg / 28% DV", 
        bg: "#66ab63", 
        description: "A major catalytic factor required for cellular hormone synthesis, fatty acid oxidation, and optimizing daily cognitive pathways." 
    },
    { 
        id: "vitB9", 
        slug: "folate",
        name: "Vitamin B9 (Folate)", 
        amount: "81.0 mcg / 20% DV", 
        bg: "#e4a910", 
        description: "Crucial for deep cellular division, DNA replication, and supporting the healthy synthesis of red blood cells." 
    },
    { 
        id: "vitE", 
        slug: "vitamin-e",
        name: "Vitamin E", 
        amount: "2.1 mg / 14% DV", 
        bg: "#15837c", 
        description: "A premier lipid-soluble antioxidant that actively guards tissue membranes against oxidative deterioration and preserves skin health." 
    },
    { 
        id: "lutein", 
        slug: "lutein-zeaxanthin",
        name: "Lutein & Zeaxanthin", 
        amount: "271 mcg", 
        bg: "#1a96cd", 
        description: "Targeted plant carotenoids that concentrate in the eye's macular area, absorbing harmful blue wave frequencies and protecting vision." 
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
                            src="/productinfo/avocados.png"
                            alt="avocados"
                            width={600}
                            height={472}
                            className={styles["product-img"]}
                        />
                    </div>
                    <div className={styles["content-text"]}>
                        <h1 className={styles["product-name"]}>Avocado</h1>
                        <div className={styles["product-category"]}>Fruits & Berries</div>

                        <div style={{background: '#fbf2d8'}} className={styles["product-description"]}>
                            Avocado is an uniquely structural, lipid-dense fruit. Renowned for its rich concentration of monounsaturated oleic acid instead of natural sugars, it serves as an exceptional functional food to drive deep fat-soluble nutrient absorption, cardiovascular protection, and metabolic satiety.
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
                                <li><b>Cardiovascular Optimization:</b> Rich in monounsaturated fats (oleic acid) and plant sterols, avocado helps regulate low-density lipoprotein (LDL) cholesterol ratios and supports endothelial vascular health.</li>
                                <li><b>Unrivaled Nutrient Assimilation:</b> Acts as an ideal lipid delivery vehicle. Adding avocado to raw vegetable meals can increase the biological absorption of companion fat-soluble antioxidants (like beta-carotene) up to fifteen-fold.</li>
                                <li><b>Advanced Potassium Performance:</b> Supplying more potassium than a banana, it actively aids in lowering blood pressure levels, managing cellular fluid dynamics, and reducing sodium retention.</li>
                                <li><b>Sustained Metabolic Satiety:</b> The dense combination of healthy fats and complex dietary fiber slows gastric emptying rates, keeping insulin curves incredibly flat and promoting long-lasting fullness.</li>
                            </ul>
                        </div>

                        <div style={{background: '#fff2f0'}} className={`${styles["precautions"]} ${styles["product-section"]}`}>
                            <h3>Important Precautions</h3>
                            <ul>
                                <li><b>High Caloric Accumulation:</b> Due to its high lipid profile, avocado is significantly more energy-dense than other fruits. If strict caloric management or weight reduction is your primary goal, maintaining precise serving boundaries is recommended.</li>
                                <li><b>Latex-Fruit Syndrome Cross-Reactivity:</b> Individuals possessing diagnosed allergies to natural rubber latex may experience mild to severe cross-reactive responses to avocados due to structurally similar plant defense proteins (chitinases).</li>
                                <li><b>FODMAP Fermentation Bloating:</b> Avocado houses measurable levels of sorbitol, a natural sugar alcohol. Those with sensitive gastrointestinal tracts or functional Irritable Bowel Syndrome (IBS) may notice mild abdominal gas or bloating if over-consuming.</li>
                                <li><b>Prescription Blood Thinner Synergy:</b> Avocados carry moderate quantities of Vitamin K1, which coordinates blood-coagulation cascades. If you are taking highly calibrated prescription anticoagulants (like Warfarin), keeping your avocado intake relatively consistent is helpful.</li>
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