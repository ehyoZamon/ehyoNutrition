"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from 'next/image';
import styles from "../productInfo.module.css";

// Структурированный массив данных для макронутриентов (на 100г готовой жирной рыбы)
const MACRO_NUTRIENTS = [
    {
        id: "calories",
        name: "Calories",
        slug: "",
        amount: "206 kcal",
        bg: "#15837c",
        description: "Provides clean, sustained cellular energy driven primarily by high-quality proteins and healthy structural fats."
    },
    {
        id: "protein",
        name: "Protein",
        slug: "",
        amount: "22.0 grams",
        bg: "#f5722c",
        description: "An elite, highly bioavailable complete protein source containing all essential amino acids required for muscle synthesis and metabolic repair."
    },
    {
        id: "fat",
        name: "Total Fat",
        slug: "",
        amount: "13.0 grams",
        bg: "#e4a910",
        description: "Rich in vital polyunsaturated fats, specifically the anti-inflammatory omega-3 fatty acids EPA and DHA."
    },
    {
        id: "carbs",
        name: "Carbohydrates",
        slug: "",
        amount: "0.0 grams",
        bg: "#15837c",
        description: "Completely clear of carbohydrates, making it an ideal whole food for stabilizing insulin and supporting low-glycemic dietary goals."
    }
];

// Структурированный массив данных для микронутриентов (на 100г)
const MICRO_NUTRIENTS = [
    { 
        id: "omega3", 
        slug: "omega-3", // Если есть слаг для омега-3, или оставьте пустой ""
        name: "Omega-3 (EPA/DHA)", 
        amount: "2200 mg", 
        bg: "#e4a910", 
        description: "Essential long-chain fatty acids that construct healthy brain cell membranes, optimize lipid panels, and dramatically reduce systemic arterial inflammation." 
    },
    { 
        id: "vitD", 
        slug: "vitamin-d",
        name: "Vitamin D3 (Cholecalciferol)", 
        amount: "526 IU / 66% DV", 
        bg: "#15837c", 
        description: "One of the absolute richest natural dietary sources of active Vitamin D3, foundational for systemic calcium absorption and immune system performance." 
    },
    { 
        id: "b12", 
        slug: "b12",
        name: "Vitamin B12", 
        amount: "3.2 mcg / 133% DV", 
        bg: "#f5722c", 
        description: "Critical nutrient for maintaining the nervous system, securing neurological processing speed, and driving red blood cell production." 
    },
    { 
        id: "selenium", 
        slug: "selenium",
        name: "Selenium", 
        amount: "41.4 mcg / 75% DV", 
        bg: "#1a96cd", 
        description: "A major trace antioxidant that activates enzymes to safeguard arterial linings and shield the thyroid gland from oxidative stress." 
    },
    { 
        id: "potassium", 
        slug: "potassium",
        name: "Potassium", 
        amount: "363 mg / 8% DV", 
        bg: "#66ab63", 
        description: "An essential intracellular mineral that works in sync with sodium to regulate cellular fluid pump mechanics and manage resting blood pressure." 
    },
    { 
        id: "b6", 
        slug: "vitamin-b6",
        name: "Vitamin B6", 
        amount: "0.6 mg / 35% DV", 
        bg: "#1a96cd", 
        description: "Serves as a crucial metabolic coenzyme involved in cellular protein processing and the natural synthesis of cognitive neurotransmitters." 
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
                            src="/productinfo/fatty-fish.png"
                            alt="fatty fish"
                            width={600}
                            height={472}
                            className={styles["product-img"]}
                        />
                    </div>
                    <div className={styles["content-text"]}>
                        <h1 className={styles["product-name"]}>Fatty Fish</h1>
                        <div className={styles["product-category"]}>Fish & Seafood</div>

                        <div style={{background: '#fbf2d8'}} className={styles["product-description"]}>
                            Fatty fish (such as salmon, mackerel, and sardines) are unparalleled therapeutic superfoods. Providing a combination of highly bioavailable proteins, substantial amounts of active Vitamin D3, and profound concentrations of omega-3 fatty acids, they serve as the gold standard for cardiovascular and neural health.
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
                                <li><b>Cardiovascular Smoothness & Architecture:</b> The heavy input of marine EPA and DHA lowers blood triglycerides, optimizes arterial elasticity, reduces resting blood pressure, and helps stabilize heart rhythms.</li>
                                <li><b>Advanced Cognitive Optimization:</b> Since DHA is a primary structural lipid component of the human brain cortex, consistent consumption preserves optimal neuro-signaling, boosts memory parameters, and mitigates age-related cognitive decline.</li>
                                <li><b>Powerful Systemic Anti-Inflammation:</b> Marine omega-3 fats directly compete with inflammatory pathways, drastically decreasing the production of pro-inflammatory cytokines and protecting metabolic tissues.</li>
                                <li><b>Skeletal & Immune Reinforcement:</b> Exceptional natural concentrations of active Cholecalciferol (Vitamin D3) maximize intestinal calcium absorption, consolidating skeletal bone density matrices.</li>
                            </ul>
                        </div>

                        <div style={{background: '#fff2f0'}} className={`${styles["precautions"]} ${styles["product-section"]}`}>
                            <h3>Important Precautions</h3>
                            <ul>
                                <li><b>Mercury & Heavy Metal Bioaccumulation:</b> Large predatory fish species (like swordfish, king mackerel, and large tuna) can accumulate mercury in their muscle tissue over time. For frequent eating, choose smaller species like salmon, sardines, or trout.</li>
                                <li><b>Environmental Pollutant Thresholds:</b> Wild-caught fish from heavily industrialized water bodies may contain trace persistent organic pollutants (POPs) or PCBs. Sourcing your seafood from certified, environmentally sustainable fisheries is highly advised.</li>
                                <li><b>Fish and Seafood Allergies:</b> Fish allergy is highly prevalent and typically persists throughout adulthood, carrying a high risk of triggering severe, immediate anaphylactic reactions in sensitive individuals.</li>
                                <li><b>Perishability & Histamine Toxicity:</b> If fatty fish is stored incorrectly or sits too long before freezing, the rapid bacterial breakdown of histidine can cause high histamine accumulation, leading to scombroid food poisoning.</li>
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