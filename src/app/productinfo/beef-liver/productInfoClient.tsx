"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from 'next/image';
import styles from "../productInfo.module.css";

// Структурированный массив данных для макронутриентов (на 100г готовой печени)
const MACRO_NUTRIENTS = [
    {
        id: "calories",
        name: "Calories",
        slug: "",
        amount: "175 kcal",
        bg: "#15837c",
        description: "Provides nutrient-dense energy with a very low caloric cost relative to its massive vitamin profile."
    },
    {
        id: "protein",
        name: "Protein",
        slug: "",
        amount: "27.0 grams",
        bg: "#f5722c",
        description: "An exceptionally rich source of highly bioavailable, complete protein containing all essential amino acids for tissue synthesis."
    },
    {
        id: "fat",
        name: "Total Fat",
        slug: "",
        amount: "5.0 grams",
        bg: "#e4a910",
        description: "Low in total lipids, featuring a balanced profile of monounsaturated, polyunsaturated, and essential saturated fatty acids."
    },
    {
        id: "carbs",
        name: "Carbohydrates",
        slug: "",
        amount: "5.0 grams",
        bg: "#15837c",
        description: "Sourced naturally from stored animal glycogen. It represents a rare carbohydrate presence in meat, keeping a low glycemic index."
    }
];

// Структурированный массив данных для микронутриентов (на 100г)
const MICRO_NUTRIENTS = [
    { 
        id: "vitA", 
        slug: "vitamin-a",
        name: "Vitamin A (Retinol)", 
        amount: "9442 mcg / 1049% DV", 
        bg: "#66ab63", 
        description: "Pre-formed active Vitamin A (retinol) that directly fuels the visual cycle, maintains endothelial integrity, and fortifies systemic immunity." 
    },
    { 
        id: "b12", 
        slug: "b12",
        name: "Vitamin B12", 
        amount: "70.6 mcg / 2940% DV", 
        bg: "#f5722c", 
        description: "An astronomical concentration essential for myelin sheath repair, DNA replication, and preventing megaloblastic anemia." 
    },
    { 
        id: "copper", 
        slug: "copper",
        name: "Copper", 
        amount: "14.3 mg / 1580% DV", 
        bg: "#15837c", 
        description: "Acts as a vital biochemical catalyst for iron metabolism, collagen structure synthesis, and defense against oxidative stress." 
    },
    { 
        id: "iron", 
        slug: "iron",
        name: "Iron (Heme)", 
        amount: "6.2 mg / 34% DV", 
        bg: "#1a96cd", 
        description: "Highly absorbable heme iron that binds instantly to hemoglobin, optimizing cellular oxygen transport and preventing fatigue." 
    },
    { 
        id: "b9", 
        slug: "folate",
        name: "Folate (Vitamin B9)", 
        amount: "260 mcg / 65% DV", 
        bg: "#e4a910", 
        description: "Critical for cellular division, rapid amino acid conversion, and optimizing prenatal neural tube development." 
    },
    { 
        id: "choline", 
        slug: "choline",
        name: "Choline", 
        amount: "418 mg / 76% DV", 
        bg: "#15837c", 
        description: "A foundational building block for cell membrane phospholipids and the neurotransmitter acetylcholine, driving memory and cognitive focus." 
    },
    { 
        id: "b2", 
        slug: "b2",
        name: "Vitamin B2 (Riboflavin)", 
        amount: "3.4 mg / 262% DV", 
        bg: "#e4a910", 
        description: "Crucial for mitochondrial respiration, electron transport chains, and converting macronutrients into actual ATP energy units." 
    }
];

// Объединяем типы для стейта модального окна
type NutrientItem = typeof MACRO_NUTRIENTS[number] | typeof MICRO_NUTRIENTS[number];

const ProductInfoClient = () => {
    // Единое состояние для выбранного элемента (макро или микро)
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
                            src="/productinfo/beef-liver.png"
                            alt="beef liver"
                            width={600}
                            height={472}
                            className={styles["product-img"]}
                        />
                    </div>
                    <div className={styles["content-text"]}>
                        <h1 className={styles["product-name"]}>Beef Liver</h1>
                        <div className={styles["product-category"]}>Meat & Offal</div>

                        <div style={{background: '#fbf2d8'}} className={styles["product-description"]}>
                            Beef liver is widely regarded as the ultimate king of superfoods. It contains an unmatched, highly concentrated matrix of pre-formed vitamins, essential minerals, and complete proteins, making it drastically superior to standard muscle meats in nutritional value.
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
                                <li><b>Unrivaled Anemia Prevention:</b> The combination of high-density heme iron, copper, and vitamin B12 provides all necessary structural raw materials for efficient red blood cell production.</li>
                                <li><b>Advanced Cognitive Architecture:</b> Tremendous concentrations of B-vitamins paired with Choline maximize neurotransmitter generation, preserving rapid brain signaling and nervous system integrity.</li>
                                <li><b>Enhanced Metabolic Performance:</b> Acts as a powerful coenzyme powerhouse; its extreme riboflavin and pantothenic acid values catalyze the rapid breakdown of dietary elements into pure kinetic energy.</li>
                                <li><b>Immune & Vision Optimization:</b> Provides massive doses of active, bioavailable retinol (Vitamin A) that directly strengthens cornea function, supports night vision, and reinforces white blood cell response.</li>
                            </ul>
                        </div>

                        <div style={{background: '#fff2f0'}} className={`${styles["precautions"]} ${styles["product-section"]}`}>
                            <h3>Important Precautions</h3>
                            <ul>
                                <li><b>Vitamin A Toxicity (Hypervitaminosis A):</b> Because liver holds pre-formed Vitamin A, which is fat-soluble and stores in our tissues, eating it daily can cause toxicity. Limiting consumption to 1-2 times per week is highly advised.</li>
                                <li><b>Pregnancy Safety Thresholds:</b> Expectant mothers should strictly manage liver intake. Excess pre-formed Vitamin A (retinol) carries a documented risk of causing congenital developmental defects in the fetus.</li>
                                <li><b>Copper Accumulation Risk:</b> The extremely high copper content means frequent intake can over-accumulate in the body, which might lead to oxidative strain or complicate issues for individuals with underlying copper metabolic conditions.</li>
                                <li><b>Purine Density & Gout Management:</b> Organ meats are naturally heavy in purine structures. These break down into uric acid, which can aggregate inside joints and trigger painful flares in individuals prone to gout.</li>
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
                        {/* Кастомный бейдж с названием элемента */}
                        <div 
                            className={styles["modal-header-badge"]} 
                            style={{ backgroundColor: selectedItem.bg }}
                        >
                            {selectedItem.name}: {selectedItem.amount}
                        </div>
                        
                        {/* Текст описания пользы */}
                        <p className={styles["modal-description"]}>
                            {selectedItem.description}
                        </p>
                        
                        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', gap: '10px', marginTop: '10px' }}>
                            {/* Ссылка показывается ТОЛЬКО если slug существует и он не пустой */}
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