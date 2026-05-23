"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from 'next/image';
import styles from "../productInfo.module.css";

// Структурированный массив данных для макронутриентов (на 100г свежего сырого шпината)
const MACRO_NUTRIENTS = [
    {
        id: "calories",
        name: "Calories",
        slug: "",
        amount: "23 kcal",
        bg: "#15837c",
        description: "Extremely low in calories and exceptionally hydrating, making it an ideal volume food for pristine metabolic control."
    },
    {
        id: "protein",
        name: "Protein",
        slug: "",
        amount: "2.9 grams",
        bg: "#f5722c",
        description: "Contains a remarkably high amino acid efficiency for a leafy green, providing structural support for cellular repair."
    },
    {
        id: "fat",
        name: "Total Fat",
        slug: "",
        amount: "0.4 grams",
        bg: "#e4a910",
        description: "Virtually fat-free, though pairing spinach with healthy dietary lipids dramatically enhances the absorption of its fat-soluble vitamins."
    },
    {
        id: "carbs",
        name: "Carbohydrates",
        slug: "",
        amount: "3.6 grams",
        bg: "#15837c",
        description: "Composed primarily of structured, non-digestible complex fibers, ensuring a near-zero impact on circulating glucose levels."
    }
];

// Структурированный массив данных для микронутриентов (на 100г)
const MICRO_NUTRIENTS = [
    { 
        id: "vitK1", 
        slug: "vitamin-k",
        name: "Vitamin K1 (Phylloquinone)", 
        amount: "482.9 mcg / 402% DV", 
        bg: "#15837c", 
        description: "An astronomical mega-dose that serves as a core coordinator for healthy blood coagulation pathways and structural bone mineral binding." 
    },
    { 
        id: "vitA", 
        slug: "vitamin-a",
        name: "Vitamin A (Beta-Carotene)", 
        amount: "469 mcg / 52% DV", 
        bg: "#66ab63", 
        description: "Packed with provitamin A carotenoids, which convert to active retinol to drive cellular night vision mechanics and preserve mucosal immunity." 
    },
    { 
        id: "vitB9", 
        slug: "folate",
        name: "Vitamin B9 (Folate)", 
        amount: "194.0 mcg / 49% DV", 
        bg: "#f5722c", 
        description: "An essential coenzyme critical for proper DNA repair, deep cellular replication cascades, and optimal cardiovascular tissue health." 
    },
    { 
        id: "iron", 
        slug: "iron",
        name: "Iron (Non-Heme)", 
        amount: "2.7 mg / 15% DV", 
        bg: "#e4a910", 
        description: "An impressive botanical distribution of iron, necessary for hemoglobin synthesis and optimizing daily oxygen transportation channels." 
    },
    { 
        id: "lutein", 
        slug: "lutein-zeaxanthin",
        name: "Lutein & Zeaxanthin", 
        amount: "12198 mcg", 
        bg: "#1a96cd", 
        description: "A colossal density of eye-protective pigments that physically accumulate in the retina, blocking intense blue light and preserving long-term vision." 
    },
    { 
        id: "vitC", 
        slug: "vitamin-c",
        name: "Vitamin C", 
        amount: "28.1 mg / 31% DV", 
        bg: "#1a96cd", 
        description: "Provides key antioxidant support, neutralizing surface free radicals and assisting in the intestinal absorption of plant-bound iron." 
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
                            src="/productinfo/spinach.png"
                            alt="spinach"
                            width={600}
                            height={472}
                            className={styles["product-img"]}
                        />
                    </div>
                    <div className={styles["content-text"]}>
                        <h1 className={styles["product-name"]}>Spinach</h1>
                        <div className={styles["product-category"]}>Vegetables & Greens</div>

                        <div style={{background: '#fbf2d8'}} className={styles["product-description"]}>
                            Spinach is a legendary, deep-green leafy vegetable packing an unparalleled micro-nutrient density. Delivering an astronomical concentration of Vitamin K1, protective ocular carotenoids, and vital folate, it serves as a top-tier therapeutic whole food for cellular resilience, vascular strength, and vision performance.
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
                                <li><b>Unrivaled Retinal Protection:</b> Boasting an exceptional concentration of lutein and zeaxanthin, it accumulates directly inside the macula, creating a powerful shield against oxidative blue-light degradation.</li>
                                <li><b>Elite Vascular Coagulation & Bone Health:</b> Supplying over 400% of your daily Vitamin K1 in just 100g, it aggressively drives osteocalcin activation, ensuring calcium integrates perfectly into the structural bone matrix.</li>
                                <li><b>Oxidative Stress Suppression:</b> An abundant array of flavonoids and alpha-lipoic acid helps lower systemic inflammatory markers and actively preserves cellular membrane structures.</li>
                                <li><b>Enhanced Oxygen Dynamics:</b> Natural folate paired with non-heme iron supports red blood cell division, combatting physical fatigue and driving cellular energetic pathways.</li>
                            </ul>
                        </div>

                        <div style={{background: '#fff2f0'}} className={`${styles["precautions"]} ${styles["product-section"]}`}>
                            <h3>Important Precautions</h3>
                            <ul>
                                <li><b>High Oxalic Acid Matrix:</b> Spinach contains heavy concentrations of oxalates, which can structurally bind to minerals like calcium. Individuals with a history of calcium-oxalate kidney stones should monitor intake or cook spinach to greatly reduce soluble oxalate loads.</li>
                                <li><b>Prescription Blood Thinner Interactions:</b> Due to the extreme, dense volume of Vitamin K1—which dictates natural blood clotting cascades—individuals taking highly calibrated anticoagulants (like Warfarin) must keep their daily leafy green intake completely consistent.</li>
                                <li><b>Non-Heme Iron Absorption Blocks:</b> The iron present in raw spinach is plant-bound (non-heme) and tightly anchored by polyphenols. Pairing spinach with ascorbic acid (Vitamin C from lemon or bell peppers) or cooking it helps unlock its full bio-availability.</li>
                                <li><b>Nitrate Bioaccumulation Dynamics:</b> Like many leafy greens grown in conventional environments, spinach leaves can absorb large amounts of soil nitrates. Sourcing clean options and consuming fresh leaves prevents unwanted conversion to nitrites during poor storage.</li>
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