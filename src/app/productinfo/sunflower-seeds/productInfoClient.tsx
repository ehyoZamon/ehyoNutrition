"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from 'next/image';
import styles from "../productInfo.module.css";

// Структурированный массив данных для макронутриентов (на 100г очищенных семян подсолнечника)
const MACRO_NUTRIENTS = [
    {
        id: "calories",
        name: "Calories",
        slug: "",
        amount: "584 kcal",
        bg: "#15837c",
        description: "A highly dense energy source packed with vital structural lipids and plant proteins, offering exceptional metabolic fuel in small volumes."
    },
    {
        id: "protein",
        name: "Protein",
        slug: "",
        amount: "20.8 grams",
        bg: "#f5722c",
        description: "Rich in plant-based complete amino acids, providing crucial building blocks for muscle synthesis and cellular tissue repair."
    },
    {
        id: "fat",
        name: "Total Fat",
        slug: "",
        amount: "51.5 grams",
        bg: "#e4a910",
        description: "Primarily composed of heart-healthy polyunsaturated and monounsaturated fatty acids, essential for optimal hormone production and nutrient transport."
    },
    {
        id: "carbs",
        name: "Carbohydrates",
        slug: "",
        amount: "20.0 grams",
        bg: "#15837c",
        description: "Contains complex carbohydrates tightly bundled with rich dietary fibers, yielding a highly stable, low-glycemic curve."
    }
];

// Структурированный массив данных для микронутриентов (на 100г)
const MICRO_NUTRIENTS = [
    { 
        id: "vitE", 
        slug: "vitamin-e",
        name: "Vitamin E (Alpha-Tocopherol)", 
        amount: "35.2 mg / 234% DV", 
        bg: "#1a96cd", 
        description: "An extraordinary mega-dose of this premier fat-soluble antioxidant, which aggressively neutralizes free radicals and stabilizes cellular membranes." 
    },
    { 
        id: "selenium", 
        slug: "selenium",
        name: "Selenium", 
        amount: "53.0 mcg / 96% DV", 
        bg: "#f5722c", 
        description: "A critical trace mineral required to synthesize master defense enzymes like glutathione peroxidase, directly supporting thyroid equilibrium." 
    },
    { 
        id: "vitB1", 
        slug: "b1", // Если есть слаг для тиамина, или оставьте пустой ""
        name: "Vitamin B1 (Thiamin)", 
        amount: "1.5 mg / 125% DV", 
        bg: "#e4a910", 
        description: "Serves as an indispensable coenzyme for cellular glucose metabolism, fueling brain energy pathways and central nervous system health." 
    },
    { 
        id: "magnesium", 
        slug: "magnesium",
        name: "Magnesium", 
        amount: "325 mg / 77% DV", 
        bg: "#15837c", 
        description: "A fundamental macro-mineral that orchestrates over 300 enzymatic reactions, promoting smooth muscle relaxation and deep vascular calm." 
    },
    { 
        id: "copper", 
        slug: "copper",
        name: "Copper", 
        amount: "1.8 mg / 200% DV", 
        bg: "#66ab63", 
        description: "A major catalytic factor necessary for structural collagen generation, red blood cell manufacture, and seamless neural communication channels." 
    },
    { 
        id: "dietfiber", 
        slug: "fiber",
        name: "Dietary Fiber", 
        amount: "8.6 grams", 
        bg: "#1a96cd", 
        description: "A robust structural fiber profile that drastically slows digestion, keeping your bowel motility highly consistent and feeding beneficial gut flora." 
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
                            src="/productinfo/sunflower-seeds.png"
                            alt="sunflower seeds"
                            width={600}
                            height={472}
                            className={styles["product-img"]}
                        />
                    </div>
                    <div className={styles["content-text"]}>
                        <h1 className={styles["product-name"]}>Sunflower Seeds</h1>
                        <div className={styles["product-category"]}>Nuts & Seeds</div>

                        <div style={{background: '#fbf2d8'}} className={styles["product-description"]}>
                            Sunflower seeds are an incredibly potent, nutrient-dense whole food. Packing a phenomenal concentration of fat-soluble Vitamin E, robust plant proteins, and major minerals like magnesium and selenium, they serve as a top-tier functional food for cardiovascular protection and cellular resilience.
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
                                <li><b>Unmatched Cardiovascular Defense:</b> The massive dose of natural Vitamin E prevents cholesterol profiles from oxidizing, halting plaque formation in its tracks, while phytosterols actively manage resting lipid balances.</li>
                                <li><b>Nervous System & Vascular Calm:</b> High concentrations of magnesium work directly to lower peripheral vascular resistance, support heart rhythm stability, and regulate neuromuscular tone.</li>
                                <li><b>Robust Cellular Resiliency:</b> The powerful pairing of Vitamin E and selenium coordinates a deep antioxidant shield, safeguarding cell membranes from permanent free-radical damage.</li>
                                <li><b>Sustained Metabolic Energy:</b> Rich in high-quality plant proteins and dietary fibers, they provide a dense, filling satiety that slows down digestive empty rates and optimizes glucose absorption.</li>
                            </ul>
                        </div>

                        <div style={{background: '#fff2f0'}} className={`${styles["precautions"]} ${styles["product-section"]}`}>
                            <h3>Important Precautions</h3>
                            <ul>
                                <li><b>High Energy & Caloric Density:</b> Because of their excellent lipid content, sunflower seeds are exceptionally high in calories. Managing portion sizes (around 30g per serving) is essential if your goals include strict weight restriction.</li>
                                <li><b>Industrial Sodium Overload:</b> Commercial store-bought sunflower seeds are often intensely roasted and coated in heavy sodium, which can reverse their natural heart-healthy blood pressure benefits. Raw or lightly sprouted un-salted seeds are highly preferred.</li>
                                <li><b>Cadmium Bioaccumulation Risk:</b> Sunflower plant roots readily pull cadmium—a systemic heavy metal pollutant—from surrounding soils. Sourcing seeds from reputable, highly audited cultivation regions prevents long-term kidney strain.</li>
                                <li><b>Gastrointestinal Blockage Dynamics:</b> Consuming seed hulls or eating massive quantities of whole seeds with poor chewing habits can form a dense fibrous mass in the digestive canal, occasionally leading to severe fecal impaction or bowel discomfort.</li>
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