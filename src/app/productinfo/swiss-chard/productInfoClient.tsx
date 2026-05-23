"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from 'next/image';
import styles from "../productInfo.module.css";

// Структурированный массив данных для макронутриентов (на 100г свежего сырого мангольда)
const MACRO_NUTRIENTS = [
    {
        id: "calories",
        name: "Calories",
        slug: "",
        amount: "19 kcal",
        bg: "#15837c",
        description: "An incredibly low-calorie, water-rich leafy green that delivers exceptional volume and hydration for strict metabolic management."
    },
    {
        id: "protein",
        name: "Protein",
        slug: "",
        amount: "1.8 grams",
        bg: "#f5722c",
        description: "Provides basic plant-based amino acids that assist in structural maintenance and cellular repair cascades."
    },
    {
        id: "fat",
        name: "Total Fat",
        slug: "",
        amount: "0.2 grams",
        bg: "#e4a910",
        description: "Virtually fat-free. However, pairing it with clean dietary lipids like olive oil drastically elevates fat-soluble nutrient assimilation."
    },
    {
        id: "carbs",
        name: "Carbohydrates",
        slug: "",
        amount: "3.7 grams",
        bg: "#15837c",
        description: "Composed mostly of complex structural plant fibers with negligible simple sugars, guaranteeing a flat glycemic response."
    }
];

// Структурированный массив данных для микронутриентов (на 100г)
const MICRO_NUTRIENTS = [
    { 
        id: "vitK1", 
        slug: "vitamin-k",
        name: "Vitamin K1 (Phylloquinone)", 
        amount: "830.0 mcg / 692% DV", 
        bg: "#15837c", 
        description: "An absolutely staggering mega-dose that acts as a vital director for bone mineralization pathways and healthy blood coagulation mechanisms." 
    },
    { 
        id: "vitA", 
        slug: "vitamin-a",
        name: "Vitamin A (Beta-Carotene)", 
        amount: "306 mcg / 34% DV", 
        bg: "#66ab63", 
        description: "Rich in provitamin A carotenoids, which convert to active retinol to support optimal night vision and preserve mucosal membrane tissue." 
    },
    { 
        id: "magnesium", 
        slug: "magnesium",
        name: "Magnesium", 
        amount: "81.0 mg / 19% DV", 
        bg: "#1a96cd", 
        description: "An outstanding concentration for greens, orchestrating neuromuscular relaxation, electrical cardiac tone, and steady energy production." 
    },
    { 
        id: "vitC", 
        slug: "vitamin-c",
        name: "Vitamin C", 
        amount: "30.0 mg / 33% DV", 
        bg: "#e4a910", 
        description: "A strong antioxidant factor that neutralizes environmental free radicals, boosts collagen synthesis, and enhances plant-iron uptake." 
    },
    { 
        id: "iron", 
        slug: "iron",
        name: "Iron (Non-Heme)", 
        amount: "1.8 mg / 10% DV", 
        bg: "#f5722c", 
        description: "Provides an important plant-based pool of iron, required for hemoglobin manufacture and pristine oxygen transport efficiency." 
    },
    { 
        id: "syringic", 
        slug: "antioxidants",
        name: "Syringic Acid & Betalains", 
        amount: "High Concentration", 
        bg: "#1a96cd", 
        description: "Unique polyphenol and pigment compounds; syringic acid directly inhibits alpha-glucosidase, assisting in stabilizing blood glucose curves." 
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
                            src="/productinfo/swiss-chard.png"
                            alt="swiss chard"
                            width={600}
                            height={472}
                            className={styles["product-img"]}
                        />
                    </div>
                    <div className={styles["content-text"]}>
                        <h1 className={styles["product-name"]}>Swiss Chard</h1>
                        <div className={styles["product-category"]}>Vegetables & Greens</div>

                        <div style={{background: '#fbf2d8'}} className={styles["product-description"]}>
                            Swiss Chard is a visually stunning, highly therapeutic leafy green vegetable. Packaging an astronomical concentration of Vitamin K1 alongside unique blood-sugar-modulating polyphenols and deep mineral reserves like magnesium, it serves as an elite functional food for bone density, vascular integrity, and metabolic balance.
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
                                <li><b>Unrivaled Bone Density Matrix:</b> Supplying nearly 700% of the daily value of Vitamin K1, it powerfully drives the carboxylation of osteocalcin, locking calcium securely into skeletal structures.</li>
                                <li><b>Advanced Blood Glucose Regulation:</b> Swiss chard houses *syringic acid*, a powerful flavonoid that has been shown to inhibit alpha-glucosidase enzymes, stabilizing post-meal blood sugar curves.</li>
                                <li><b>Neuromuscular & Cardiovascular Calm:</b> High structural reserves of magnesium work directly to lower peripheral vascular resistance, support ideal resting heart rhythms, and modulate neural excitability.</li>
                                <li><b>Vibrant Cellular Defense:</b> The colorful stalks (especially in rainbow chard) contain potent *betalain* pigments, which exert profound anti-inflammatory and radical-scavenging protection across systemic organs.</li>
                            </ul>
                        </div>

                        <div style={{background: '#fff2f0'}} className={`${styles["precautions"]} ${styles["product-section"]}`}>
                            <h3>Important Precautions</h3>
                            <ul>
                                <li><b>High Oxalate Concentrations:</b> Swiss chard contains a heavy density of natural organic oxalates. Individuals with a clinical history of calcium-oxalate kidney stone formations should regulate their intake or cook/blanch the leaves to discard soluble oxalates.</li>
                                <li><b>Critical Anticoagulant Interactions:</b> Due to the truly massive volume of Vitamin K1—which directly coordinates the body's natural blood clotting machinery—individuals on tightly calibrated blood thinners (like Warfarin) must keep their daily intake completely stable.</li>
                                <li><b>Sodium Concentration Metrics:</b> Compared to other leafy greens, Swiss chard naturally pulls and stores more sodium from the soil (around 213mg per 100g). While perfectly safe, those on strict medically monitored low-sodium diets should factor this into their parameters.</li>
                                <li><b>Gastric Tract Sensitivity:</b> The dense, complex fiber matrix combined with raw oxalates can occasionally cause mild throat scratchiness or temporary abdominal bloating if eaten raw in massive quantities. Light steaming completely neutralizes this physical reaction.</li>
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