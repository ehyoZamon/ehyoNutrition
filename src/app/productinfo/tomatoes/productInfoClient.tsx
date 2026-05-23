"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from 'next/image';
import styles from "../productInfo.module.css";

// Структурированный массив данных для макронутриентов (на 100г свежих томатов)
const MACRO_NUTRIENTS = [
    {
        id: "calories",
        name: "Calories",
        slug: "",
        amount: "18 kcal",
        bg: "#15837c",
        description: "Extremely low in calories and exceptionally hydrating, making it an elite choice for weight management and volume eating."
    },
    {
        id: "protein",
        name: "Protein",
        slug: "",
        amount: "0.9 grams",
        bg: "#f5722c",
        description: "Contains modest structural plant proteins, providing minimal trace amino acids necessary for botanical matrices."
    },
    {
        id: "fat",
        name: "Total Fat",
        slug: "",
        amount: "0.2 grams",
        bg: "#e4a910",
        description: "Virtually fat-free; however, consuming tomatoes alongside healthy dietary lipids drastically boosts carotenoid absorption."
    },
    {
        id: "carbs",
        name: "Carbohydrates",
        slug: "",
        amount: "3.9 grams",
        bg: "#15837c",
        description: "Consists mainly of naturally occurring simple sugars (fructose, glucose) and structural fibers, keeping the glycemic load minimal."
    }
];

// Структурированный массив данных для микронутриентов (на 100г)
const MICRO_NUTRIENTS = [
    { 
        id: "lycopene", 
        slug: "lycopene", // Если есть слаг для ликопина, или оставьте пустой ""
        name: "Lycopene", 
        amount: "2573 mcg", 
        bg: "#f5722c", 
        description: "A powerhouse carotenoid antioxidant responsible for the deep red hue. It actively scavenges free radicals and protects vascular walls." 
    },
    { 
        id: "vitC", 
        slug: "vitamin-c",
        name: "Vitamin C", 
        amount: "13.7 mg / 15% DV", 
        bg: "#1a96cd", 
        description: "A vital water-soluble antioxidant that shields skin cells from UV oxidation, fuels collagen synthesis, and reinforces cellular immunity." 
    },
    { 
        id: "potassium", 
        slug: "potassium",
        name: "Potassium", 
        amount: "237 mg / 5% DV", 
        bg: "#e4a910", 
        description: "An essential systemic electrolyte that coordinates electrical heart signaling, fluid balance, and healthy blood pressure levels." 
    },
    { 
        id: "vitK1", 
        slug: "vitamin-k",
        name: "Vitamin K1", 
        amount: "7.9 mcg / 7% DV", 
        bg: "#15837c", 
        description: "Necessary for activating calcium-binding proteins, supporting healthy blood coagulation, and preserving skeletal framework strength." 
    },
    { 
        id: "b9", 
        slug: "folate",
        name: "Folate (Vitamin B9)", 
        amount: "15 mcg / 4% DV", 
        bg: "#66ab63", 
        description: "Supports normal tissue growth, DNA replication, cellular function, and is essential for reproductive health." 
    },
    { 
        id: "beta_carotene", 
        slug: "vitamin-a",
        name: "Beta-Carotene", 
        amount: "449 mcg", 
        bg: "#1a96cd", 
        description: "A provitamin antioxidant that the liver converts into Vitamin A as needed to support healthy corneal architecture and night sight." 
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
                            src="/productinfo/tomatoes.png"
                            alt="tomatoes"
                            width={600}
                            height={472}
                            className={styles["product-img"]}
                        />
                    </div>
                    <div className={styles["content-text"]}>
                        <h1 className={styles["product-name"]}>Tomatoes</h1>
                        <div className={styles["product-category"]}>Vegetables</div>

                        <div style={{background: '#fbf2d8'}} className={styles["product-description"]}>
                            Tomatoes are a highly vibrant, nutrient-dense whole food packed with antioxidants. Composed of roughly 95% water, they provide heavy hydration, massive doses of heart-healthy lycopene, and essential vitamins that shield skin and blood vessel integrity.
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
                                <li><b>Cardiovascular Architecture & Protection:</b> Lycopene and beta-carotene help prevent the oxidation of LDL cholesterol—a key driver in plaque formation. Paired with potassium, this supports overall arterial flexibility and blood pressure regulation.</li>
                                <li><b>Dermal UV & Skin Defense:</b> Clinical evidence indicates that lycopene, working alongside Vitamin C, strengthens the skin's internal cellular matrix, enhancing defense against light-induced UV damage and promoting elasticity.</li>
                                <li><b>Profound Hydration & Satiety:</b> Their high water and organic fiber content expands inside the gastric cavity, creating a natural feeling of fullness with a negligible impact on overall daily calories.</li>
                                <li><b>The Cooking Advantage:</b> Unlike many vegetables, cooking tomatoes with a dash of healthy fat (like olive oil) actually breaks down their cellular walls, significantly increasing the bioavailability and absorption of lycopene.</li>
                            </ul>
                        </div>

                        <div style={{background: '#fff2f0'}} className={`${styles["precautions"]} ${styles["product-section"]}`}>
                            <h3>Important Precautions</h3>
                            <ul>
                                <li><b>Gastrointestinal Acid Reflux:</b> Tomatoes are naturally rich in malic and citric acids. For individuals dealing with severe acid reflux, GERD, or sensitive stomach linings, heavy intake can trigger burning discomfort or heartburn.</li>
                                <li><b>Nightshade Sensitive Solanine:</b> As members of the nightshade family, tomatoes contain trace amounts of alkaloids like solanine. While completely harmless to most, individuals with specific autoimmune conditions or chronic joint sensitivities occasionally choose to monitor their intake.</li>
                                <li><b>Histamine Release Profile:</b> Tomatoes can act as natural histamine liberators in the digestive tract. If you have a confirmed histamine intolerance or localized gut allergy profiles, you may experience mild bloating or skin reactions.</li>
                                <li><b>Kidney Stone Oxalate Management:</b> Tomatoes contain a moderate amount of oxalates. If you have a recurring clinical history of calcium-oxalate kidney stones, it is wise to balance your consumption parameters.</li>
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