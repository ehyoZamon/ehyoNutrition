"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from 'next/image';
import styles from "../productInfo.module.css";

// Структурированный массив данных для макронутриентов (на 100г)
const MACRO_NUTRIENTS = [
    {
        id: "calories",
        name: "Calories",
        slug: "",
        amount: "26 kcal",
        bg: "#15837c",
        description: "An incredibly low-calorie and water-dense food, perfect for volume eating and weight management."
    },
    {
        id: "protein",
        name: "Protein",
        slug: "",
        amount: "1.0 grams",
        bg: "#f5722c",
        description: "Minimal protein content; provides trace non-essential amino acids standard in cucurbitaceous plants."
    },
    {
        id: "fat",
        name: "Total Fat",
        slug: "",
        amount: "0.1 grams",
        bg: "#e4a910",
        description: "Virtually fat-free, making it an excellent base for heart-healthy and low-fat dietary regimes."
    },
    {
        id: "carbs",
        name: "Carbohydrates",
        slug: "",
        amount: "6.5 grams",
        bg: "#15837c",
        description: "Composed of complex carbohydrates and natural sugars, yielding a low glycemic load that keeps insulin spikes minimal."
    }
];

// Структурированный массив данных для микронутриентов (на 100г)
const MICRO_NUTRIENTS = [
    { 
        id: "vitA", 
        slug: "vitamin-a",
        name: "Vitamin A (Beta-Carotene)", 
        amount: "426 mcg / 53% DV", 
        bg: "#66ab63", 
        description: "Abundant in pro-vitamin A carotenoids (giving it the orange hue), which the body converts into retinol to shield eye health and enhance cellular repair." 
    },
    { 
        id: "potassium", 
        slug: "potassium",
        name: "Potassium", 
        amount: "340 mg / 7% DV", 
        bg: "#e4a910", 
        description: "A vital systemic electrolyte that aids in smooth muscle contraction, healthy vascular tone, and balancing intra-cellular fluid levels." 
    },
    { 
        id: "dietfiber", 
        slug: "fiber", // Если есть слаг для клетчатки, или оставьте пустой ""
        name: "Dietary Fiber", 
        amount: "0.5 grams", 
        bg: "#f5722c", 
        description: "Though modest in raw flesh, its soluble fibers break down into gentle fuel for gut microbes and smooth out intestinal transit." 
    },
    { 
        id: "vitC", 
        slug: "vitamin-c",
        name: "Vitamin C", 
        amount: "9.0 mg / 10% DV", 
        bg: "#1a96cd", 
        description: "An essential water-soluble antioxidant that promotes white blood cell synthesis, skin elasticity, and optimal iron absorption." 
    },
    { 
        id: "lutein", 
        slug: "lutein-zeaxanthin",
        name: "Lutein & Zeaxanthin", 
        amount: "1500 mcg", 
        bg: "#15837c", 
        description: "Powerful plant pigments that deposit directly in the macular retina, filtering high-energy blue light and mitigating oxidative cell degeneration." 
    },
    { 
        id: "vitE", 
        slug: "vitamin-e",
        name: "Vitamin E", 
        amount: "1.06 mg / 7% DV", 
        bg: "#1a96cd", 
        description: "A fat-soluble antioxidant that collaborates with Vitamin C to safeguard cell membranes from environmental oxidative stressors." 
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
                            src="/productinfo/pumpkin.png"
                            alt="pumpkin"
                            width={600}
                            height={472}
                            className={styles["product-img"]}
                        />
                    </div>
                    <div className={styles["content-text"]}>
                        <h1 className={styles["product-name"]}>Pumpkin</h1>
                        <div className={styles["product-category"]}>Vegetables</div>

                        <div style={{background: '#fbf2d8'}} className={styles["product-description"]}>
                            Pumpkin is a highly nutritious, low-calorie autumn staple. Loaded with vibrant carotenoid antioxidants, skin-loving vitamins, and hydrating minerals, this versatile whole food provides exceptional structural benefits for systemic immunity and vision preservation.
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
                                <li><b>Ocular & Vision Protection:</b> The rich combo of beta-carotene, lutein, and zeaxanthin builds a natural defense shield in the retina, reducing risks of long-term age-related macular degradation and cataracts.</li>
                                <li><b>Immune Defense Reinforcement:</b> High doses of Vitamin A, paired with Vitamin C, optimize cellular mucosal barriers and accelerate white blood cell proliferation against external pathogens.</li>
                                <li><b>Cardiovascular Smoothness:</b> The healthy presence of potassium and low sodium coordinates blood vessel relaxation, allowing for balanced fluid dynamics and blood pressure management.</li>
                                <li><b>Metabolic Weight Management:</b> Being roughly 90% water, it provides a high-volume food structure that fills the stomach and promotes prolonged satiety with very minimal baseline calories.</li>
                            </ul>
                        </div>

                        <div style={{background: '#fff2f0'}} className={`${styles["precautions"]} ${styles["product-section"]}`}>
                            <h3>Important Precautions</h3>
                            <ul>
                                <li><b>Commercial Dynamic Overload:</b> While pure pumpkin is highly metabolic, seasonal commercial items (like pumpkin pies or sweetened purees) are heavily packed with processed sugars, fats, and chemical binders.</li>
                                <li><b>Mild Diuretic Influence:</b> Due to its high water and potassium metrics, pumpkin acts as a mild natural diuretic. Individuals taking specific metabolic medications (like lithium) should monitor structural intake values.</li>
                                <li><b>Carotenemia Profile:</b> Consuming massive quantities of pumpkin over a prolonged period can store extra beta-carotene under the skin, temporarily turning the palms and soles of the feet a slight yellow-orange hue (harmless and reversible).</li>
                                <li><b>Gastrointestinal Adaptation:</b> For individuals with highly sensitive digestive tracts or during flare-ups of chronic gut issues, large portions of cooked squash may occasionally trigger mild bloating due to its complex carbohydrate fibers.</li>
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