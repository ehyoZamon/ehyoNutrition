"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from 'next/image';
import styles from "../productInfo.module.css";

// Структурированный массив данных для макронутриентов (на 100г свежего киви)
const MACRO_NUTRIENTS = [
    {
        id: "calories",
        name: "Calories",
        slug: "",
        amount: "61 kcal",
        bg: "#15837c",
        description: "A low-to-moderate calorie whole food options that delivers dense physical hydration and exceptional cellular fuel."
    },
    {
        id: "protein",
        name: "Protein",
        slug: "",
        amount: "1.1 grams",
        bg: "#f5722c",
        description: "Contains nominal structural plant proteins, though it is famous for housing actinidin—a unique protein-digesting enzyme."
    },
    {
        id: "fat",
        name: "Total Fat",
        slug: "",
        amount: "0.5 grams",
        bg: "#e4a910",
        description: "Virtually fat-free, containing only trace healthy essential fatty acids embedded within its microscopic black edible seeds."
    },
    {
        id: "carbs",
        name: "Carbohydrates",
        slug: "",
        amount: "14.7 grams",
        bg: "#15837c",
        description: "Composed of natural simple sugars managed efficiently by structural dietary fibers, resulting in a moderate glycemic response."
    }
];

// Структурированный массив данных для микронутриентов (на 100г)
const MICRO_NUTRIENTS = [
    { 
        id: "vitC", 
        slug: "vitamin-c",
        name: "Vitamin C", 
        amount: "92.7 mg / 103% DV", 
        bg: "#1a96cd", 
        description: "An extraordinary mega-dose that exceeds the daily recommended allowance in a single serving, boosting systemic immunity and skin cell synthesis." 
    },
    { 
        id: "vitK1", 
        slug: "vitamin-k",
        name: "Vitamin K1", 
        amount: "40.3 mcg / 34% DV", 
        bg: "#15837c", 
        description: "An essential fat-soluble factor required for perfect blood coagulation mechanics and supporting the structural density of bone tissue." 
    },
    { 
        id: "dietfiber", 
        slug: "fiber",
        name: "Dietary Fiber", 
        amount: "3.0 grams", 
        bg: "#f5722c", 
        description: "A robust blend of soluble and insoluble fibers that accelerates intestinal transit, feeds gut flora, and keeps glycemic curves smooth." 
    },
    { 
        id: "potassium", 
        slug: "potassium",
        name: "Potassium", 
        amount: "312 mg / 7% DV", 
        bg: "#e4a910", 
        description: "A crucial cellular electrolyte that assists in fluid balance dynamics, nervous system electrical signaling, and healthy cardiac tone." 
    },
    { 
        id: "vitE", 
        slug: "vitamin-e",
        name: "Vitamin E", 
        amount: "1.5 mg / 10% DV", 
        bg: "#1a96cd", 
        description: "A fat-soluble antioxidant rarely found in high amounts in low-fat fruits; it works alongside Vitamin C to halt lipid oxidation chains." 
    },
    { 
        id: "lutein", 
        slug: "lutein-zeaxanthin",
        name: "Lutein & Zeaxanthin", 
        amount: "122 mcg", 
        bg: "#66ab63", 
        description: "Crucial plant pigments that deposit into the eye's macular area, absorbing harmful blue wavelengths and shielding ocular cell architecture." 
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
                            src="/productinfo/kiwi.png"
                            alt="kiwi"
                            width={600}
                            height={472}
                            className={styles["product-img"]}
                        />
                    </div>
                    <div className={styles["content-text"]}>
                        <h1 className={styles["product-name"]}>Kiwi</h1>
                        <div className={styles["product-category"]}>Fruits & Berries</div>

                        <div style={{background: '#fbf2d8'}} className={styles["product-description"]}>
                            Kiwi is an exceptionally nutrient-dense, emerald-fleshed fruit. Renowned for containing a massive concentration of Vitamin C that completely surpasses citrus alternatives, it provides unique protein-cleaving enzymes, rich fibers, and dense mineral metrics to drive gut motility and optimal defense.
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
                                <li><b>Elite Digestive Enhancement:</b> Kiwi naturally produces *actinidin*, a highly functional protease enzyme that breaks down dense dietary proteins (like red meats or dairy), drastically speeding up gastric emptying and easing bloating.</li>
                                <li><b>Unrivaled Immune Fortification:</b> Supplying over 100% of your daily Vitamin C value per 100g, kiwi drives rapid neutrophil leukocyte activity, helping guard systemic tissues from common pathogens.</li>
                                <li><b>Intestinal Motility & Regularity:</b> The high water-binding capacity of kiwi's unique soluble and insoluble fibers softens the stool matrix and significantly optimizes bowel movement consistency without bloating.</li>
                                <li><b>Endothelial Vasodilation:</b> The healthy presence of potassium and organic antioxidants aids in inhibiting blood platelet aggregation, helping manage lipid health and keeping blood pressure balanced.</li>
                            </ul>
                        </div>

                        <div style={{background: '#fff2f0'}} className={`${styles["precautions"]} ${styles["product-section"]}`}>
                            <h3>Important Precautions</h3>
                            <ul>
                                <li><b>High Allergenic Potential:</b> Kiwi is a well-documented source of cross-reactive food allergens, primarily due to actinidin. Symptoms of a kiwi allergy include oral allergy syndrome (itching or tingling in the mouth and throat), hives, and in severe cases, anaphylaxis.</li>
                                <li><b>The Gelatin Cooking Conflict:</b> Because actinidin aggressively breaks down protein molecules, using fresh raw kiwi in recipes containing gelatin or milk proteins will destroy the structure, preventing jello from setting or making dairy taste bitter.</li>
                                <li><b>Oral Mucosal Soreness:</b> Consuming multiple raw kiwis at once can cause a temporary stinging or burning sensation on the tongue and inner cheeks. This is a harmless physical reaction caused by actinidin enzymes and microscopic needle-like calcium oxalate crystals (raphides) physically irritating the soft tissues.</li>
                                <li><b>Moderate Oxalate Content:</b> Kiwi contains measurable amounts of natural organic oxalates. Individuals with a historical predisposition to calcium-oxalate kidney stone formations should regulate excessive intake.</li>
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