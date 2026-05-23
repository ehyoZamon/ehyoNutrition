"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from 'next/image';
import styles from "../productInfo.module.css";

// Структурированный массив данных для макронутриентов (на 100г сладкой кукурузы)
const MACRO_NUTRIENTS = [
    {
        id: "calories",
        name: "Calories",
        slug: "",
        amount: "86 kcal",
        bg: "#15837c",
        description: "A moderate-energy starchy vegetable that provides sustained, reliable fuel for muscular work and cellular respiration."
    },
    {
        id: "protein",
        name: "Protein",
        slug: "",
        amount: "3.2 grams",
        bg: "#f5722c",
        description: "Contains a notable amount of plant proteins for a vegetable, including zein, though it should be paired with legumes for a complete amino profile."
    },
    {
        id: "fat",
        name: "Total Fat",
        slug: "",
        amount: "1.2 grams",
        bg: "#e4a910",
        description: "Naturally very low in fat, containing trace heart-healthy monounsaturated and polyunsaturated fatty acids within the grain germ."
    },
    {
        id: "carbs",
        name: "Carbohydrates",
        slug: "",
        amount: "19.0 grams",
        bg: "#15837c",
        description: "Primarily composed of complex starches and natural simple sugars, offering structured energy management to prevent rapid glucose spikes."
    }
];

// Структурированный массив данных для микронутриентов (на 100г)
const MICRO_NUTRIENTS = [
    { 
        id: "lutein", 
        slug: "lutein-zeaxanthin",
        name: "Lutein & Zeaxanthin", 
        amount: "642 mcg", 
        bg: "#e4a910", 
        description: "Phenomenal plant pigments that deposit directly into the macular region of the eye, filtering harmful blue light and guarding visual acuity." 
    },
    { 
        id: "vitB1", 
        slug: "b1",
        name: "Vitamin B1 (Thiamin)", 
        amount: "0.15 mg / 13% DV", 
        bg: "#1a96cd", 
        description: "An essential coenzyme involved in carbohydrate metabolic cascades, crucial for optimizing cognitive drive and nervous system communication." 
    },
    { 
        id: "vitB9", 
        slug: "folate",
        name: "Vitamin B9 (Folate)", 
        amount: "42.0 mcg / 11% DV", 
        bg: "#66ab63", 
        description: "Vital for cellular division, nucleotide synthesis, and erythrocyte maturation, playing a protective role in cardiovascular tissue health." 
    },
    { 
        id: "dietfiber", 
        slug: "fiber",
        name: "Dietary Fiber", 
        amount: "2.7 grams", 
        bg: "#f5722c", 
        description: "Mainly insoluble fibers that add mechanical volume to the stool matrix, accelerating intestinal transit and supporting digestive regularity." 
    },
    { 
        id: "magnesium", 
        slug: "magnesium",
        name: "Magnesium", 
        amount: "37.0 mg / 9% DV", 
        bg: "#15837c", 
        description: "Assists in enzymatic cellular stabilization, supporting muscular relaxation, bone health, and smooth cardiac electrical performance." 
    },
    { 
        id: "vitC", 
        slug: "vitamin-c",
        name: "Vitamin C", 
        amount: "6.8 mg / 8% DV", 
        bg: "#1a96cd", 
        description: "Provides antioxidant assistance, neutralizing surface free radicals and supporting natural immune tissue integrity." 
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
                            src="/productinfo/corn.png"
                            alt="corn"
                            width={600}
                            height={472}
                            className={styles["product-img"]}
                        />
                    </div>
                    <div className={styles["content-text"]}>
                        <h1 className={styles["product-name"]}>Corn</h1>
                        <div className={styles["product-category"]}>Vegetables & Grains</div>

                        <div style={{background: '#fbf2d8'}} className={styles["product-description"]}>
                            Corn is a vibrant, carbohydrate-rich vegetable and cereal grain. Highly regarded for its exceptional content of protective macular carotenoids like lutein and zeaxanthin, it provides a functional balance of dietary fibers and B-vitamins to sustain physical stamina and ocular health.
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
                                <li><b>Targeted Macular Defense:</b> The high density of lutein and zeaxanthin acts as natural "internal sunglasses," shielding retinal cells against oxidative blue light exposure and slowing macular breakdown.</li>
                                <li><b>Sustained Glycemic Energy:</b> Its complex starch matrix, balanced by dietary fibers, results in steady metabolic glucose release, preventing sudden insulin crashes when eaten in whole form.</li>
                                <li><b>Enhanced Bowel Motility:</b> Rich in insoluble plant fiber, corn swells within the intestinal tract, physically sweeping the colon lining, boosting peristalsis, and preventing general sluggishness.</li>
                                <li><b>Neuro-Metabolic Support:</b> Substantial amounts of Thiamin (B1) support cellular energy pathways, optimizing memory mechanics and structural peripheral nerve health.</li>
                            </ul>
                        </div>

                        <div style={{background: '#fff2f0'}} className={`${styles["precautions"]} ${styles["product-section"]}`}>
                            <h3>Important Precautions</h3>
                            <ul>
                                <li><b>Starchy Glycemic Load Factors:</b> Corn contains significantly more carbohydrates than leafy or watery vegetables. Individuals managing Type 2 diabetes or tracking precise glycemic parameters should control serving volumes to avoid unexpected postprandial glucose shifts.</li>
                                <li><b>Insoluble Outer Husk Toughness:</b> The clear cellulose shell wrapping each individual kernel is structurally un-digestible by human stomach acid. Improperly chewed corn can pass entirely intact, causing gas, mild cramps, or bloating in sensitive digestive tracts.</li>
                                <li><b>Hidden Syrups & Ultra-Processed Additives:</b> While whole sweet corn is highly therapeutic, refined commercial corn offshoots—such as High-Fructose Corn Syrup (HFCS) or processed corn starch—lack all fibers and minerals, severely aggravating metabolic liver pathways.</li>
                                <li><b>Fungal Mycotoxin Contamination:</b> If stored in poorly ventilated, high-humidity corporate grain silos, corn crops can easily develop mold strains producing aflatoxins. Always consume freshly cooked or properly sealed, verified retail products.</li>
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