"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from 'next/image';
import styles from "../productInfo.module.css";

// Структурированный массив данных для макронутриентов
const MACRO_NUTRIENTS = [
    {
        id: "calories",
        name: "Calories",
        slug: "",
        amount: "41 kcal",
        bg: "#15837c",
        description: "Provides low-glycemic basal energy to fuel daily metabolic processes."
    },
    {
        id: "protein",
        name: "Protein",
        slug: "",
        amount: "0.9 grams",
        bg: "#f5722c",
        description: "Minimal; contains trace structural amino acids necessary for plant protein structures."
    },
    {
        id: "fat",
        name: "Total Fat",
        slug: "",
        amount: "0.2 grams",
        bg: "#e4a910",
        description: "Negligible; mostly composed of essential polyunsaturated fatty acids."
    },
    {
        id: "carbs",
        name: "Carbohydrates",
        slug: "",
        amount: "9.6 grams",
        bg: "#15837c",
        description: "Split between naturally occurring simple sugars (sucrose, glucose) and structural complex carbohydrates."
    },
    {
        id: "dietfiber",
        name: "Dietary Fiber",
        slug: "",
        amount: "2.8 grams",
        bg: "#f5722c",
        description: "Rich in soluble pectin and insoluble cellulose that optimize digestion and support gut microbiota."
    }
];

const MICRO_NUTRIENTS = [
    { 
        id: "vitA", 
        slug: "vitamin-a",
        name: "Vitamin A", 
        amount: "835 mcg / 104% DV", 
        bg: "#66ab63", 
        description: "Packed with beta-carotene and alpha-carotene, which the liver converts into retinol for advanced vision and night sight protection." 
    },
    { 
        id: "vitK1", 
        slug: "vitamin-k",
        name: "Vitamin K1", 
        amount: "13.2 mcg / 11% DV", 
        bg: "#15837c", 
        description: "Essential for synthesizing blood-coagulation proteins and supporting structural bone mineralization." 
    },
    { 
        id: "b6", 
        slug: "vitamin-b6",
        name: "Vitamin B6", 
        amount: "0.14 mg / 9% DV", 
        bg: "#f5722c", 
        description: "Serves as a vital coenzyme in cellular amino acid metabolism, energy release, and neurotransmitter production." 
    },
    { 
        id: "potassium", 
        slug: "potassium",
        name: "Potassium", 
        amount: "320 mg / 7% DV", 
        bg: "#e4a910", 
        description: "An essential intracellular electrolyte that regulates fluid balance, nerve signaling, and systemic blood pressure." 
    },
    { 
        id: "vitC", 
        slug: "vitamin-c",
        name: "Vitamin C", 
        amount: "5.9 mg / 7% DV", 
        bg: "#1a96cd", 
        description: "A water-soluble antioxidant that strengthens endothelial defenses, drives collagen synthesis, and boosts immunity." 
    },
    { 
        id: "lutein", 
        slug: "lutein-zeaxanthin",
        name: "Lutein & Zeaxanthin", 
        amount: "256 mcg", 
        bg: "#1a96cd", 
        description: "Crucial carotenoid antioxidants that accumulate in the macular region of the eye, filtering harmful blue light wavelengths." 
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
                            src="/productinfo/carrots.png"
                            alt="carrots"
                            width={600}
                            height={472}
                            className={styles["product-img"]}
                        />
                    </div>
                    <div className={styles["content-text"]}>
                        <h1 className={styles["product-name"]}>Carrot</h1>
                        <div className={styles["product-category"]}>Vegetables</div>

                        <div style={{background: '#fbf2d8'}} className={styles["product-description"]}>
                            Carrots (Daucus carota) are vibrant, biennial root vegetables cultivated globally for their crisp texture and nutrient density. Traditionally associated with a deep orange hue, they also grow in heritage varieties of purple, yellow, red, and white.
                            <br></br>
                            From a botanical perspective, carrots belong to the Apiaceae (parsley) family, sharing lineage with celery, parsnips, and fennel. While the sweet, taproot is the most commonly consumed part, the feathery green tops are also edible and rich in minerals. Carrots owe their signature orange color to highly concentrated carotenoid pigments, which serve as crucial precursors for essential vitamins in human metabolism.
                        </div>

                        {/* Список Макронутриентов: теперь тоже интерактивный рендеринг через .map() */}
                        <div style={{background: '#fbf0d9'}} className={`${styles["macro-nutrients"]} ${styles["product-section"]}`}>
                            <h3>Macro Nutrients (per 100g raw) <span className={styles["hint"]}>(Click to learn more)</span></h3>
                            Carrots are a low-calorie, high-moisture crop composed of approximately 88% water. They provide clean energy primarily through complex carbohydrates, with a negligible fat profile.
                            <br></br>
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
                            Carrots are a premier dietary source of provitamin A and contain an array of synergistic micronutrients that support cellular integrity.
                            <br></br>
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
                                <li><b>Advanced Vision Protection:</b> The high concentration of beta-carotene is utilized by the retina to synthesize rhodopsin, a biological pigment necessary for low-light and night vision. Additionally, carrots contain lutein, an antioxidant that accumulates in the macular region of the eye, filtering out harmful blue light wavelengths and mitigating the risk of age-related macular degeneration (AMD).</li>
                                <li><b>Cardiovascular & Glycemic Regulation:</b> The soluble fiber profile in carrots consists heavily of pectin, which binds bile acids in the intestinal lumen, prompting the liver to draw cholesterol from the bloodstream to synthesize more bile—effectively lowering circulating LDL cholesterol. Despite their sweet taste, carrots have a low glycemic index (GI ~16 to 32 depending on raw vs. cooked states), preventing rapid blood glucose spikes.</li>
                                <li><b>Digestive Tract Optimization:</b> The insoluble fibers (cellulose and hemicellulose) add bulk to fecal matter and stimulate peristalsis, preventing constipation. Furthermore, these fibers act as prebiotics, feeding beneficial short-chain fatty acid (SCFA)-producing bacteria in the large intestine, which fortifies the gut barrier function.</li>
                                <li><b>Endothelial and Immune Defense:</b> Carotenoids and vitamin C act as potent free-radical scavengers, dampening systemic oxidative stress and protecting vascular endothelial cell walls. Vitamin A also regulates the differentiation and activation of T-cells and B-lymphocytes, reinforcing the body's primary immune response against pathogens.</li>
                            </ul>
                        </div>

                        <div style={{background: '#fff2f0'}} className={`${styles["precautions"]} ${styles["product-section"]}`}>
                            <h3>Important Precautions</h3>
                            <ul>
                                <li><b>Carotenemia:</b> Excessive, chronic consumption of carrots can lead to carotenemia—a benign clinical condition where excess beta-carotene accumulates in the stratum corneum, causing a distinct yellowish-orange discoloration of the skin (most visible on the palms and soles). It is completely reversible by reducing intake.</li>
                                <li><b>Pesticide Residuals & Soil Hygiene:</b> Because carrots are subterranean taproots, they directly absorb chemicals present in the soil. Thorough scrubbing or peeling is highly recommended for conventional carrots to eliminate pesticide residues and pathogens like Listeria or Toxoplasma gondii.</li>
                                <li><b>Oral Allergy Syndrome (OAS):</b> Individuals allergic to birch pollen or mugwort may experience cross-reactivity when eating raw carrots due to structural similarities in plant proteins. Symptoms include localized itching or swelling of the lips, mouth, and throat. Cooking the carrots denatures these proteins, typically eliminating the reaction.</li>
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