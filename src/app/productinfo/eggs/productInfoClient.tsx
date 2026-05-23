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
        amount: "~72 kcal",
        bg: "#15837c",
        description: "Energy provided by the food to fuel your body's daily metabolic processes and physical activities."
    },
    {
        id: "protein",
        name: "Protein",
        amount: "6.3 grams",
        bg: "#f5722c",
        description: "High-quality, bioavailable protein containing all nine essential amino acids. Essential for muscle repair, cellular construction, and immune function."
    },
    {
        id: "fat",
        name: "Total Fat",
        amount: "4.8 grams",
        bg: "#e4a910",
        description: "Includes healthy monounsaturated and polyunsaturated fats, alongside essential fatty acids, vital for hormone production and absorbing fat-soluble vitamins."
    },
    {
        id: "carbs",
        name: "Carbohydrates",
        amount: "0.4 grams",
        bg: "#15837c",
        description: "Extremely low in carbs, making eggs an excellent choice for stabilizing blood sugar and supporting low-glycemic dietary targets."
    }
];

const MICRO_NUTRIENTS = [
    { 
        id: "choline", 
        slug: "choline",
        name: "Choline", 
        amount: "147 mg", 
        bg: "#15837c", 
        description: "Critical for brain development, memory, and cellular structural integrity. One egg provides roughly 25-30% of your daily requirement." 
    },
    { 
        id: "selenium", 
        slug: "selenium",
        name: "Selenium", 
        amount: "15.4 mcg / 22% DV", 
        bg: "#1a96cd", 
        description: "A powerful antioxidant that supports thyroid function and protects the body from oxidative damage." 
    },
    { 
        id: "b12", 
        slug: "b12",
        name: "Vitamin B12", 
        amount: "0.5 mcg / 20% DV", 
        bg: "#f5722c", 
        description: "Vital for nerve tissue health, brain function, and red blood cell production." 
    },
    { 
        id: "b2", 
        slug: "b2",
        name: "Vitamin B2", 
        amount: "0.2 mg / 15% DV", 
        bg: "#e4a910", 
        description: "Helps the body break down carbohydrates, proteins, and fats to produce energy." 
    },
    { 
        id: "vitA", 
        slug: "vitamin-a",
        name: "Vitamin A", 
        amount: "270 IU / 6% DV", 
        bg: "#66ab63", 
        description: "Supports healthy vision, skin health, and immune system defense." 
    },
    { 
        id: "vitD", 
        slug: "vitamin-d",
        name: "Vitamin D", 
        amount: "41 IU / 5% DV", 
        bg: "#15837c", 
        description: "Necessary for bone density and calcium absorption. One of the few natural dietary sources." 
    },
    { 
        id: "lutein", 
        slug: "lutein-zeaxanthin",
        name: "Lutein & Zeaxanthin", 
        amount: "Antioxidant Carotenoids", 
        bg: "#1a96cd", 
        description: "Crucial carotenoid antioxidants that protect the eyes from damaging blue light and reduce macular degeneration risk." 
    },
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
                            src="/productinfo/eggs.png"
                            alt="eggs"
                            width={600}
                            height={472}
                            className={styles["product-img"]}
                        />
                    </div>
                    <div className={styles["content-text"]}>
                        <h1 className={styles["product-name"]}>Eggs</h1>
                        <div className={styles["product-category"]}>Dairy</div>

                        <div style={{background: '#fbf2d8'}} className={styles["product-description"]}>
                            Eggs are often called "nature's multivitamin" for a good reason. They are one of the most nutritionally dense, complete whole foods available, packed with high-quality protein, healthy fats, and a wide array of essential vitamins and minerals.
                        </div>

                        {/* Список Макронутриентов: теперь тоже интерактивный рендеринг через .map() */}
                        <div style={{background: '#fbf0d9'}} className={`${styles["macro-nutrients"]} ${styles["product-section"]}`}>
                            <h3>Macro Nutrients (per 50g) <span className={styles["hint"]}>(Click to learn more)</span></h3>
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
                                <li><b>Promotes Muscle Maintenance & Recovery:</b> The highly bioavailable protein in eggs makes them an excellent food for tissue repair and building lean muscle mass.</li>
                                <li><b>Supports Brain Health:</b> The high concentration of choline is used by the brain to synthesize acetylcholine, a neurotransmitter critical for memory, mood, and cognitive function.</li>
                                <li><b>Improves Heart Health Architecture:</b> While eggs do contain dietary cholesterol, extensive research shows that for about 70% of the population, dietary cholesterol does not significantly raise blood cholesterol. In fact, egg consumption typically improves the lipid profile by raising "good" HDL cholesterol and changing the texture of "bad" LDL to large, less harmful particles.</li>
                                <li><b>Aids Weight Management:</b> High protein foods increase satiety (the feeling of fullness) and regulate appetite hormones, which can naturally reduce subsequent calorie intake throughout the day.</li>
                                <li><b>Protects Vision:</b> The antioxidants lutein and zeaxanthin accumulate in the retina, drastically lowering the risk of age-related cataracts and macular health decline.</li>
                            </ul>
                        </div>

                        <div style={{background: '#fff2f0'}} className={`${styles["precautions"]} ${styles["product-section"]}`}>
                            <h3>Important Precautions</h3>
                            <br />
                            <b>The Salmonella Risk:</b> Raw or undercooked eggs can carry Salmonella enteritidis, a bacteria that causes food poisoning. Always cook eggs until the yolks and whites are firm, or use pasteurized eggs for recipes requiring raw components (like homemade mayo or tiramisu).
                            <ul>
                                <li><b>Egg Allergies:</b> Egg allergy is one of the most common food allergies, especially in children. Symptoms can range from mild hives to severe anaphylaxis. Fortunately, many children outgrow it by adolescence.</li>
                                <li><b>Hyper-Responders to Cholesterol:</b> About 30% of people are "hyper-responders," meaning dietary cholesterol significantly impacts their blood levels. If you have a genetic predisposition to high cholesterol, familial hypercholesterolemia, or existing type 2 diabetes, it is wise to monitor your overall egg intake and consult a medical professional.</li>
                                <li><b>Proper Storage:</b> Eggs should be stored in their original carton in the main body of the refrigerator (at or below 4°C / 40°F) rather than the refrigerator door, where temperature fluctuations are highest.</li>
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
                        href={`/vitamins#${selectedItem.slug}`}
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