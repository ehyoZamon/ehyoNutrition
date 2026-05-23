"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from 'next/image';
import styles from "../productInfo.module.css";

// Структурированный массив данных для макронутриентов (на 100г свежей клубники)
const MACRO_NUTRIENTS = [
    {
        id: "calories",
        name: "Calories",
        slug: "",
        amount: "32 kcal",
        bg: "#15837c",
        description: "An exceptionally low-calorie, water-dense berry, offering sweet satisfaction with minimal metabolic impact."
    },
    {
        id: "protein",
        name: "Protein",
        slug: "",
        amount: "0.7 grams",
        bg: "#f5722c",
        description: "Contains nominal structural plant amino acids, typical for delicate low-density soft fruits."
    },
    {
        id: "fat",
        name: "Total Fat",
        slug: "",
        amount: "0.3 grams",
        bg: "#e4a910",
        description: "Virtually fat-free, making it an elite whole food ingredient for clean, low-lipid snacking profiles."
    },
    {
        id: "carbs",
        name: "Carbohydrates",
        slug: "",
        amount: "7.7 grams",
        bg: "#15837c",
        description: "Primarily made of simple sugars balanced perfectly by dietary fibers, maintaining a highly favorable low glycemic load."
    }
];

// Структурированный массив данных для микронутриентов (на 100г)
const MICRO_NUTRIENTS = [
    { 
        id: "vitC", 
        slug: "vitamin-c",
        name: "Vitamin C", 
        amount: "58.8 mg / 65% DV", 
        bg: "#1a96cd", 
        description: "An outstanding concentration that outpaces many citrus fruits, driving robust collagen formation, wound healing, and cellular immunity." 
    },
    { 
        id: "manganese", 
        slug: "manganese", // Если есть слаг для марганца, или оставьте пустой ""
        name: "Manganese", 
        amount: "0.39 mg / 17% DV", 
        bg: "#66ab63", 
        description: "An essential trace mineral acting as a cofactor for key metabolic enzymes involved in bone construction and free radical neutralization." 
    },
    { 
        id: "anthocyanins", 
        slug: "antioxidants",
        name: "Anthocyanins (Pelargonidin)", 
        amount: "High Concentration", 
        bg: "#f5722c", 
        description: "Potent polyphenols responsible for the vibrant red pigmentation. They directly support endothelial flexibility and shield cells from oxidative strain." 
    },
    { 
        id: "b9", 
        slug: "folate",
        name: "Folate (Vitamin B9)", 
        amount: "24 mcg / 6% DV", 
        bg: "#e4a910", 
        description: "Crucial for baseline cellular division, DNA synthesis, and supporting tissue optimization during rapid physiological growth phases." 
    },
    { 
        id: "potassium", 
        slug: "potassium",
        name: "Potassium", 
        amount: "153 mg / 3% DV", 
        bg: "#15837c", 
        description: "A systemic mineral electrolyte that assists in regulating cardiovascular muscle impulses and structural cellular fluid balances." 
    },
    { 
        id: "dietfiber", 
        slug: "fiber",
        name: "Dietary Fiber", 
        amount: "2.0 grams", 
        bg: "#1a96cd", 
        description: "Mainly composed of soluble and insoluble fractions (like pectin) that slow digestion, fueling beneficial gut microbiota and preventing glucose spikes." 
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
                            src="/productinfo/strawberries.png"
                            alt="strawberries"
                            width={600}
                            height={472}
                            className={styles["product-img"]}
                        />
                    </div>
                    <div className={styles["content-text"]}>
                        <h1 className={styles["product-name"]}>Strawberries</h1>
                        <div className={styles["product-category"]}>Fruits & Berries</div>

                        <div style={{background: '#fbf2d8'}} className={styles["product-description"]}>
                            Strawberries are a highly celebrated, low-glycemic summer superfruit. Exceptionally loaded with immune-boosting Vitamin C, water-dense hydration, and protective anthocyanin antioxidants, they offer maximum nutritional density with remarkably low caloric costs.
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
                                <li><b>Cardiovascular System Elasticity:</b> The rich array of anthocyanins, paired with potassium, prevents heavy lipid oxidation, enhances endothelial blood vessel function, and assists in blood pressure control.</li>
                                <li><b>Dermal Integrity & Collagen Production:</b> A single 100g serving delivers over half your daily Vitamin C requirement, directly driving the natural synthesis of dermal collagen matrices to support skin elasticity.</li>
                                <li><b>Blood Sugar Stabilization:</b> Despite their sweetness, strawberries rank low on the glycemic index ($GI = 40$). Their unique polyphenol matrices have been shown to slow down glucose absorption in the gut.</li>
                                <li><b>Potent Cellular Defense:</b> Ellagic acid and pelargonidin cross paths inside cellular tissue to actively downregulate inflammatory pathways and trap reactive oxidative stressors.</li>
                            </ul>
                        </div>

                        <div style={{background: '#fff2f0'}} className={`${styles["precautions"]} ${styles["product-section"]}`}>
                            <h3>Important Precautions</h3>
                            <ul>
                                <li><b>Allergy & Histamine Risk Profile:</b> Strawberries are notorious for triggering food-allergic reactions, often linked to a specific protein associated with their red pigment. Symptoms can range from oral hives and itching to systemic flares.</li>
                                <li><b>Pesticide Bioaccumulation Thresholds:</b> Due to their soft, porous skin and lack of protective outer shells, conventionally grown strawberries regularly top industrial lists for surface pesticide residues. Washing them thoroughly in running water is highly recommended.</li>
                                <li><b>Gastrointestinal Oxalate Management:</b> Strawberries contain a moderate fraction of natural organic oxalates. If you have a clinical history of calcium-oxalate kidney architecture complications, moderate your portion sizes.</li>
                                <li><b>High Perishability Factor:</b> These delicate berries absorb ambient humidity quickly, making them prone to rapid gray mold expansion. Keep them unwashed in a breathable container inside the fridge and clean them right before eating.</li>
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