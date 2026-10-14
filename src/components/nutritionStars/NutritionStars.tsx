// components/nutritionStars/NutritionStars.tsx
import { memo } from "react";
import styles from "./NutritionStars.module.css";

const STAR_PATH =
  "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

type Props = {
  /** 1-5; если не задано (у продукта нет оценки) — ничего не рисуем */
  stars?: number;
  size?: number;
};

const NutritionStars = memo(function NutritionStars({ stars, size = 12 }: Props) {
  if (!stars) return null;
  const value = Math.max(1, Math.min(5, Math.round(stars)));

  return (
    <span className={styles["stars"]} role="img" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={i <= value ? styles["star-filled"] : styles["star-empty"]}
        >
          <path d={STAR_PATH} fill="currentColor" />
        </svg>
      ))}
    </span>
  );
});

export default NutritionStars;