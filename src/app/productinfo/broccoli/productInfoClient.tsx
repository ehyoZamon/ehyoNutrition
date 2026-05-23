"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from 'next/image';
import styles from "../productInfo.module.css";

// Структурированный массив данных для макронутриентов (на 100г свежей брокколи)
const MACRO_NUTRIENTS = [
    {
        id: "calories",
        name: "Calories",
        slug: "",
        amount: "34 kcal",
        bg: "#15837c",
        description: "Very low in calories and exceptionally nutrient-dense, making it a perfect functional volume food for strict metabolic and weight management."
    },
    {
        id: "protein",
        name: "Protein",
        slug: "",
        amount: "2.8 grams",
        bg: "#f5722c",
        description: "Contains a surprisingly robust plant-based protein profile for a green vegetable, supplying clean essential amino acids for tissue repair."
    },
    {
        id: "fat",
        name: "Total Fat",
        slug: "",
        amount: "0.4 grams",
        bg: "#e4a910",
        description: "Virtually fat-free. However, cooking or serving it with a splash of healthy lipids drastically increases the absorption of its fat-soluble vitamins."
    },
    {
        id: "carbs",
        name: "Carbohydrates",
        slug: "",
        amount: "6.6 grams",
        bg: "#15837c",
        description: "Composed of slow-digesting complex carbohydrates tightly wrapped in rigid plant fiber structures, keeping blood sugar curves completely flat."
    }
];

// Структурированный массив данных для микронутриентов (на 100г)
const MICRO_NUTRIENTS = [
    { 
        id: "vitC", 
        slug: "vitamin-c",
        name: "Vitamin C", 
        amount: "89.2 mg / 99% DV", 
        bg: "#1a96cd", 
        description: "An exceptional concentration that easily rival or beats most citrus fruits, fueling robust immune mechanics and dynamic collagen assembly." 
    },
    { 
        id: "vitK1", 
        slug: "vitamin-k",
        name: "Vitamin K1 (Phylloquinone)", 
        amount: "101.6 mcg / 85% DV", 
        bg: "#15837c", 
        description: "An abundant dose of this critical fat-soluble factor, essential for managing natural blood coagulation cascades and anchoring bone calcium." 
    },
    { 
        id: "sulforaphane", 
        slug: "antioxidants",
        name: "Sulforaphane (Glucoraphanin)", 
        amount: "High Concentration", 
        bg: "#66ab63", 
        description: "A legendary sulfur-rich compound unique to cruciferous vegetables that activates profound cellular detoxification and deep antioxidant defense." 
    },
    { 
        id: "vitB9", 
        slug: "folate",
        name: "Vitamin B9 (Folate)", 
        amount: "63.0 mcg / 16% DV", 
        bg: "#f5722c", 
        description: "Crucial coenzyme necessary for continuous cellular division, proper DNA replication, and protecting vascular tissue equilibrium." 
    },
    { 
        id: "dietfiber", 
        slug: "fiber",
        name: "Dietary Fiber", 
        amount: "2.6 grams", 
        bg: "#e4a910", 
        description: "A rich mix of soluble and insoluble structural fibers that optimize digestive transit times and heavily feed beneficial gut flora." 
    },
    { 
        id: "potassium", 
        slug: "potassium",
        name: "Potassium", 
        amount: "316 mg / 7% DV", 
        bg: "#1a96cd", 
        description: "An essential systemic electrolyte coordinating healthy fluid mechanics, neuromuscular impulses, and resting vascular tone." 
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
                            src="/productinfo/broccoli.png"
                            alt="broccoli"
                            width={600}
                            height={472}
                            className={styles["product-img"]}
                        />
                    </div>
                    <div className={styles["content-text"]}>
                        <h1 className={styles["product-name"]}>Broccoli</h1>
                        <div className={styles["product-category"]}>Vegetables & Greens</div>

                        <div style={{background: '#fbf2d8'}} className={styles["product-description"]}>
                            Broccoli is an elite, highly complex cruciferous vegetable powerhouse. Packaging a monumental density of immune-boosting Vitamin C and bone-building Vitamin K1 alongside legendary cellular detox compounds like *sulforaphane*, it serves as a premier functional whole food for total body resilience and tissue defense.
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
                                <li><b>Advanced Cellular Detoxification:</b> The rich presence of glucoraphanin converts into *sulforaphane* upon chewing or chopping, triggering profound liver detox pathways and fighting systemic free-radical decay.</li>
                                <li><b>Elite Vascular & Immune Defense:</b> Delivering nearly 100% of your daily Vitamin C per 100g, it aggressively drives white blood cell production while working with Vitamin K1 to support vascular lining flexibility.</li>
                                <li><b>Skeletal Mineral Anchoring:</b> High natural levels of Vitamin K1 efficiently coordinate osteocalcin activation, ensuring calcium routes smoothly out of blood vessels and locks tightly into the structural bone matrix.</li>
                                <li><b>Robust Glycemic Control:</b> Complex structural fibers combined with slow-burning starches delay gastric empty rates, keeping post-meal blood sugar curves phenomenally stable.</li>
                            </ul>
                        </div>

                        <div style={{background: '#fff2f0'}} className={`${styles["precautions"]} ${styles["product-section"]}`}>
                            <h3>Important Precautions</h3>
                            <ul>
                                <li><b>Cruciferous Goitrogen Activity:</b> Raw broccoli contains trace amounts of goitrogens—plant compounds that can theoretically compete with iodine absorption in the thyroid. For individuals with compromised thyroid health, lightly steaming completely neutralizes this effect.</li>
                                <li><b>Gastrointestinal Gas & Fermentation:</b> Packed with dense, rigid cellulose fibers and a complex sugar called raffinose, raw broccoli can be tough to break down for sensitive stomachs, causing temporary bloating or lower abdominal gas. Cooked formats soften these structures significantly.</li>
                                <li><b>Calibrated Blood Thinner Synergy:</b> Due to the high, rich volume of Vitamin K1—the master coordinator of the body's natural blood clotting mechanics—individuals taking prescription anticoagulants (like Warfarin) should maintain steady, highly consistent intake.</li>
                                <li><b>Thermal Enzyme Deactivation:</b> Boiling broccoli inside excessive water for long periods kills *myrosinase*—the crucial enzyme required to unlock its highly therapeutic sulforaphane compound. Lightly steaming for 3 to 5 minutes is optimal for preserving its functional value.</li>
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