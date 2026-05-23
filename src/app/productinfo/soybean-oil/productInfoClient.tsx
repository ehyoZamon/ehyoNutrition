"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from 'next/image';
import styles from "../productInfo.module.css";

// Структурированный массив данных для макронутриентов (на 100г соевого масла)
const MACRO_NUTRIENTS = [
    {
        id: "calories",
        name: "Calories",
        slug: "",
        amount: "884 kcal",
        bg: "#15837c",
        description: "An immensely concentrated source of metabolic energy. Composed entirely of lipids, it requires careful portion management within your daily goals."
    },
    {
        id: "protein",
        name: "Protein",
        slug: "",
        amount: "0 grams",
        bg: "#f5722c",
        description: "Contains absolutely zero proteins or soy allergens (in highly refined versions) due to advanced extraction and purification procedures."
    },
    {
        id: "fat",
        name: "Total Fat",
        slug: "",
        amount: "100 grams",
        bg: "#e4a910",
        description: "A 100% pure lipid matrix, loaded with polyunsaturated and monounsaturated fatty acids that act as premium cellular structural supports."
    },
    {
        id: "carbs",
        name: "Carbohydrates",
        slug: "",
        amount: "0 grams",
        bg: "#15837c",
        description: "Completely devoid of sugars, starches, or dietary fibers, yielding a definitive zero glycemic response."
    }
];

// Структурированный массив данных для микронутриентов (на 100г)
const MICRO_NUTRIENTS = [
    { 
        id: "vitK1", 
        slug: "vitamin-k",
        name: "Vitamin K1 (Phylloquinone)", 
        amount: "183.9 mcg / 153% DV", 
        bg: "#15837c", 
        description: "An extraordinary mega-dose of this fat-soluble factor, absolutely essential for healthy blood coagulation mechanics and bone mineral retention." 
    },
    { 
        id: "vitE", 
        slug: "vitamin-e",
        name: "Vitamin E (Alpha-Tocopherol)", 
        amount: "8.1 mg / 54% DV", 
        bg: "#1a96cd", 
        description: "A potent fat-soluble antioxidant that actively targets and neutralizes free radicals, safeguarding lipid membranes from oxidation." 
    },
    { 
        id: "omega6", 
        slug: "omega-6",
        name: "Omega-6 (Linoleic Acid)", 
        amount: "50.9 grams", 
        bg: "#f5722c", 
        description: "An essential polyunsaturated fatty acid that serves as a core structural element for building fluid, responsive cellular membranes." 
    },
    { 
        id: "omega3", 
        slug: "omega-3", // Если есть слаг, или оставьте пустой
        name: "Omega-3 (Alpha-Linolenic Acid)", 
        amount: "6.8 grams", 
        bg: "#66ab63", 
        description: "A notable plant-based omega-3 fluid factor that assists in modulating systemic inflammatory pathways throughout vascular tissues." 
    },
    { 
        id: "omega9", 
        slug: "omega-9",
        name: "Omega-9 (Oleic Acid)", 
        amount: "22.6 grams", 
        bg: "#e4a910", 
        description: "A monounsaturated fatty acid that provides excellent chemical stability and structural resistance to thermal oxidation during food processing." 
    },
    { 
        id: "phytols", 
        slug: "phytosterols",
        name: "Phytosterols", 
        amount: "470 mg", 
        bg: "#1a96cd", 
        description: "Plant sterols that actively block low-density lipoprotein (LDL) cholesterol reception channels inside the gut, helping balance systemic profiles." 
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
                            src="/productinfo/soybean-oil.png"
                            alt="soybean oil"
                            width={600}
                            height={472}
                            className={styles["product-img"]}
                        />
                    </div>
                    <div className={styles["content-text"]}>
                        <h1 className={styles["product-name"]}>Soybean Oil</h1>
                        <div className={styles["product-category"]}>Oils & Fats</div>

                        <div style={{background: '#fbf2d8'}} className={styles["product-description"]}>
                            Soybean oil is a highly popular, nutrient-dense botanical lipid extract. Exceptional for delivering an immense concentration of Vitamin K1 alongside a versatile profile of polyunsaturated fatty acids, it acts as an efficient medium for culinary applications and fat-soluble nutrient delivery.
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
                                <li><b>Elite Bone Mineralization:</b> Boasting over 150% of the daily value of Vitamin K1, it strongly activates osteocalcin proteins, helping anchor calcium directly into the structural bone matrix.</li>
                                <li><b>Vascular Wall Protection:</b> The rich distribution of plant phytosterols actively competes with dietary cholesterol in the gut, working to regulate low-density lipoprotein (LDL) assimilation.</li>
                                <li><b>Cellular Membrane Fluidity:</b> Packed with essential linoleic acid (Omega-6), it offers structural lipids required to build and maintain flexible, responsive cell wall parameters.</li>
                                <li><b>Enhanced Vitamin Bioavailability:</b> Functions as a highly effective fat transport vehicle, dramatically increasing the biological absorption of fat-soluble vitamins from companion foods.</li>
                            </ul>
                        </div>

                        <div style={{background: '#fff2f0'}} className={`${styles["precautions"]} ${styles["product-section"]}`}>
                            <h3>Important Precautions</h3>
                            <ul>
                                <li><b>High Omega-6 to Omega-3 Balance:</b> Soybean oil is heavily weighted toward Omega-6 fats. Over-consumption without integrating clean Omega-3 sources (like wild-caught fish or flax) can skew tissue biomarkers toward a pro-inflammatory state.</li>
                                <li><b>Blood Thinner (Anticoagulant) Interaction:</b> Because of the immense, dense concentration of Vitamin K1—which physically orchestrates blood clotting mechanisms—individuals taking prescription blood thinners (like Warfarin) must maintain highly consistent intake levels.</li>
                                <li><b>Extreme Caloric Density:</b> Composed entirely of pure fats, a single tablespoon contains roughly 120 calories. Generous, unmeasured pouring can easily disrupt calibrated weight-management parameters.</li>
                                <li><b>High-Heat Oxidation Limits:</b> While refined soybean oil has a relatively high smoke point, its high content of polyunsaturated links makes it susceptible to chemical breakdown if kept at extreme temperatures for too long, potentially creating toxic free-radical aldehydes.</li>
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