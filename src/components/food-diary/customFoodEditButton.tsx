// components/food-diary/customFoodEditButton.tsx
//
// Маленькая кнопка-карандаш для своих блюд: используется в AddFoodSheet и на
// странице Products. Клик не должен "проваливаться" в строку (она сама кликабельна).
"use client";

import styles from "./customFoodEditButton.module.css";

type Props = {
  onClick: () => void;
  label: string;
  /** Дополнительный класс от родителя (позиционирование внутри строки списка). */
  className?: string;
};

const CustomFoodEditButton = ({ onClick, label, className }: Props) => (
  <button
    type="button"
    className={className ? `${styles["edit-btn"]} ${className}` : styles["edit-btn"]}
    aria-label={label}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3zM14.5 7.5l3 3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </button>
);

export default CustomFoodEditButton;