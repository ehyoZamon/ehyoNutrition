"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from 'next/image';
import styles from "../productInfo.module.css";

// Структурированный массив данных для макронутриентов (на 100г свежего красного перца)
const MACRO_NUTRIENTS = [
    {
        id: "calories",
        name: "Calories",
        slug: "",
        amount: "31 kcal",
        bg: "#15837c",
        description: "Very low in calories and highly hydrating, making it an excellent volume food for blood sugar control and weight management."
    },
    {
        id: "protein",
        name: "Protein",
        slug: "",
        amount: "1.0 grams",
        bg: "#f5722c",
        description: "Contains minor plant-based amino acids, serving as structural support within the vegetable's crisp cellular matrix."
    },
    {
        id: "fat",
        name: "Total Fat",
        slug: "",
        amount: "0.3 grams",
        bg: "#e4a910",
        description: "Virtually fat-free. However, pairing bell peppers with healthy dietary lipids (like olive oil) drastically boosts fat-soluble carotenoid absorption."
    },
    {
        id: "carbs",
        name: "Carbohydrates",
        slug: "",
        amount: "6.0 grams",
        bg: "#15837c",
        description: "Composed of natural simple sugars (glucose, fructose) wrapped in structured dietary fibers, ensuring a negligible glycemic response."
    }
];

// Структурированный массив данных для микронутриентов (на 100г)
const MICRO_NUTRIENTS = [
    { 
        id: "vitC", 
        slug: "vitamin-c",
        name: "Vitamin C", 
        amount: "127.7 mg / 142% DV", 
        bg: "#1a96cd", 
        description: "An astronomical concentration that effortlessly beats citrus fruits, driving powerful collagen synthesis, tissue repair, and immune performance." 
    },
    { 
        id: "vitA", 
        slug: "vitamin-a",
        name: "Vitamin A (Beta-Carotene)", 
        amount: "157 mcg / 17% DV", 
        bg: "#66ab63", 
        description: "Rich in provitamin A carotenoids, which the body converts to active retinol to preserve night vision and maintain healthy mucosal barriers." 
    },
    { 
        id: "vitB6", 
        slug: "vitamin-b6",
        name: "Vitamin B6 (Pyridoxine)", 
        amount: "0.29 mg / 17% DV", 
        bg: "#f5722c", 
        description: "Acts as a vital metabolic coenzyme required for the proper synthesis of red blood cells and neuro-signaling transmitters." 
    },
    { 
        id: "capsanthin", 
        slug: "antioxidants",
        name: "Capsanthin", 
        amount: "High Concentration", 
        bg: "#e4a910", 
        description: "A powerful, unique antioxidant responsible for the bright red hue; it scavenges free radicals and assists in protecting cellular health." 
    },
    { 
        id: "potassium", 
        slug: "potassium",
        name: "Potassium", 
        amount: "211 mg / 5% DV", 
        bg: "#15837c", 
        description: "An essential systemic electrolyte that coordinates electrical cardiac pulses, fluid pump mechanics, and balanced blood pressure levels." 
    },
    { 
        id: "dietfiber", 
        slug: "fiber",
        name: "Dietary Fiber", 
        amount: "2.1 grams", 
        bg: "#1a96cd", 
        description: "Provides crisp structural fibers that optimize transit time in the digestive tract and feed beneficial gut microbiomes." 
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
                            src="/productinfo/bell-peppers.png"
                            alt="bell peppers"
                            width={600}
                            height={472}
                            className={styles["product-img"]}
                        />
                    </div>
                    <div className={styles["content-text"]}>
                        <h1 className={styles["product-name"]}>Bell Peppers</h1>
                        <div className={styles["product-category"]}>Vegetables</div>

                        <div style={{background: '#fbf2d8'}} className={styles["product-description"]}>
                            Bell peppers are a remarkably crisp, refreshing, and nutrient-dense vegetable. Containing an unparalleled mega-dose of Vitamin C alongside a rich array of protective carotenoid antioxidants, they serve as an elite whole food for optimizing immune defense, skin elasticity, and vision.
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
                                <li><b>Unrivaled Immune System Defense:</b> Delivering over 140% of your daily Vitamin C in just 100g, bell peppers rapidly stimulate white blood cell production and bolster host defense mechanisms.</li>
                                <li><b>Advanced Ocular Protection:</b> Loaded with lutein, zeaxanthin, and beta-carotene, frequent intake helps shield the retina from high-energy light damage and counteracts age-related visual degeneration.</li>
                                <li><b>Dermal Integrity & Anti-Aging:</b> The heavy synthesis of Vitamin C works in perfect synergy with Vitamin E to maximize natural collagen assembly, improving vascular tone and skin elasticity.</li>
                                <li><b>Enhanced Iron Bioavailability:</b> The incredible concentration of ascorbic acid transforms non-heme iron from companion plant-based foods into highly soluble, easily absorbable forms inside the gut.</li>
                            </ul>
                        </div>

                        <div style={{background: '#fff2f0'}} className={`${styles["precautions"]} ${styles["product-section"]}`}>
                            <h3>Important Precautions</h3>
                            <ul>
                                <li><b>Nightshade Sensitive Profile:</b> As prominent members of the nightshade family, bell peppers house trace alkaloids. While safe for the vast majority, individuals with specific autoimmune conditions or joint sensitivities may choose to track their tolerance.</li>
                                <li><b>Gastrointestinal Skin & Seed Irritation:</b> The structural outer skin and internal seeds contain dense fibers that can sometimes be tough to process for sensitive stomachs, occasionally causing mild bloating or reflux unless peeled or cooked.</li>
                                <li><b>Pesticide Surface Retention:</b> Because of their broad surface area and thin skins, conventionally farmed bell peppers can hold higher pesticide residues. Washing thoroughly or choosing organic options is beneficial.</li>
                                <li><b>Cross-Reactive Pollen Allergies:</b> Individuals with specific seasonal allergies (such as birch or mugwort pollen) might experience mild cross-reactive oral allergy syndrome, presenting as itching in the mouth or throat.</li>
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