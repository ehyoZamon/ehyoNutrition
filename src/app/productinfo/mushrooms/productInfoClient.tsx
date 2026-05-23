"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from 'next/image';
import styles from "../productInfo.module.css";

// Структурированный массив данных для макронутриентов (на 100г сырых грибов)
const MACRO_NUTRIENTS = [
    {
        id: "calories",
        name: "Calories",
        slug: "",
        amount: "22 kcal",
        bg: "#15837c",
        description: "An incredibly low-calorie whole food option, highly favorable for weight management and structural metabolic restriction."
    },
    {
        id: "protein",
        name: "Protein",
        slug: "",
        amount: "3.1 grams",
        bg: "#f5722c",
        description: "Surprisingly high in protein for a non-animal source; contains a balanced profile of essential building-block amino acids."
    },
    {
        id: "fat",
        name: "Total Fat",
        slug: "",
        amount: "0.3 grams",
        bg: "#e4a910",
        description: "Virtually fat-free, containing only trace levels of healthy unsaturated fatty acids and absolutely zero cholesterol."
    },
    {
        id: "carbs",
        name: "Carbohydrates",
        slug: "",
        amount: "3.3 grams",
        bg: "#15837c",
        description: "Primarily made of complex structural carbohydrates and fibers, generating a negligible impact on systemic blood sugar levels."
    }
];

// Структурированный массив данных для микронутриентов (на 100г)
const MICRO_NUTRIENTS = [
    { 
        id: "vitD", 
        slug: "vitamin-d",
        name: "Vitamin D (Ergocalciferol)", 
        amount: "18 IU / 4% DV", 
        bg: "#15837c", 
        description: "One of the exceptionally rare non-animal whole food sources of Vitamin D2, which helps facilitate systemic calcium retention and bone mineralization." 
    },
    { 
        id: "selenium", 
        slug: "selenium",
        name: "Selenium", 
        amount: "9.3 mcg / 17% DV", 
        bg: "#1a96cd", 
        description: "A potent antioxidant mineral that neutralizes free radical cellular strain, optimizes thyroid function, and supports immunity." 
    },
    { 
        id: "b2", 
        slug: "b2",
        name: "Vitamin B2 (Riboflavin)", 
        amount: "0.4 mg / 31% DV", 
        bg: "#e4a910", 
        description: "Essential metabolic coenzyme that plays a major role in cellular energy extraction and the structural production of red blood cells." 
    },
    { 
        id: "b3", 
        slug: "vitamin-b3",
        name: "Vitamin B3 (Niacin)", 
        amount: "3.6 mg / 23% DV", 
        bg: "#f5722c", 
        description: "Supports healthy cellular respiration, optimizes enzyme activity, protects skin texture, and preserves baseline nervous system health." 
    },
    { 
        id: "copper", 
        slug: "copper",
        name: "Copper", 
        amount: "0.3 mg / 35% DV", 
        bg: "#66ab63", 
        description: "A fundamental trace mineral required to synthesize hemoglobin, construct vascular structures, and manufacture neurotransmitters." 
    },
    { 
        id: "potassium", 
        slug: "potassium",
        name: "Potassium", 
        amount: "318 mg / 7% DV", 
        bg: "#e4a910", 
        description: "A primary intercellular electrolyte that regulates natural fluid metrics, neural signal pathways, and cardiovascular muscle tone." 
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
                            src="/productinfo/mushrooms.png"
                            alt="mushrooms"
                            width={600}
                            height={472}
                            className={styles["product-img"]}
                        />
                    </div>
                    <div className={styles["content-text"]}>
                        <h1 className={styles["product-name"]}>Mushrooms</h1>
                        <div className={styles["product-category"]}>Fungi</div>

                        <div style={{background: '#fbf2d8'}} className={styles["product-description"]}>
                            Mushrooms occupy a completely unique biological kingdom. Low in calories yet deeply savory due to natural glutamate, they provide a remarkable matrix of immune-modulating beta-glucans, unique antioxidants like selenium, and are one of the few non-animal sources of Vitamin D.
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
                                <li><b>Immune System Architecture:</b> Mushrooms contain complex polysaccharides called beta-glucans. These molecules act as natural immunomodulators, gently binding to immune cells to optimize host defense activities.</li>
                                <li><b>Cellular Antioxidant Defense:</b> The robust concentration of selenium helps generate crucial glutathione peroxidase enzymes, shielding cellular membranes from everyday oxidative destruction.</li>
                                <li><b>Cardiovascular Health Support:</b> Naturally rich in potassium and completely clear of sodium or cholesterol, mushrooms facilitate relaxed vascular tension and aid in proper systemic blood pressure control.</li>
                                <li><b>Satiety with Minimal Calories:</b> Their dense structural matrix provides substantial dietary weight and a satisfying savory "umami" experience, keeping you full while incurring very low caloric costs.</li>
                            </ul>
                        </div>

                        <div style={{background: '#fff2f0'}} className={`${styles["precautions"]} ${styles["product-section"]}`}>
                            <h3>Important Precautions</h3>
                            <ul>
                                <li><b>Chitin Digestive Resistance:</b> Raw mushroom cell walls are built from chitin—a tough, rigid polymer. To avoid digestive strain, cramping, or bloating, mushrooms should always be cooked to break down this matrix.</li>
                                <li><b>Foraging and Wild Toxicity Risk:</b> Never consume wild mushrooms unless they have been verified with absolute professional certainty. Toxic varieties can mimic edible species perfectly and cause fatal organ damage. Commercial store-bought options are completely safe.</li>
                                <li><b>Porous Heavy Metal Absorption:</b> Fungi act like natural sponges, easily drawing pollutants or heavy metals from contaminated surrounding soil. Always purchase your mushrooms from trusted, quality-controlled cultivation vendors.</li>
                                <li><b>Perishability and Mold Growth:</b> Due to high baseline moisture levels, fresh mushrooms spoil quickly and can harbor toxic molds if stored incorrectly. Keep them in breathable paper bags in the fridge and discard if they become slimy.</li>
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