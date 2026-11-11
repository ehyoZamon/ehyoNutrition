// components/food-diary/DeleteConfirmSheet.tsx
"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import styles from "./deleteConfirmSheet.module.css";
import BodyPortal from "@/components/BodyPortal";

export type DeleteConfirmEntry = {
  emoji: string;
  label: string;
  amount: string;
};

type DeleteConfirmSheetProps = {
  open: boolean;
  entry: DeleteConfirmEntry | null;
  onClose: () => void;
  onConfirm: () => void;
};

const DeleteConfirmSheet = ({ open, entry, onClose, onConfirm }: DeleteConfirmSheetProps) => {
  const t = useTranslations("FoodDiary");

  if (!open || !entry) return null;

  return (
    <BodyPortal>
      <div className={styles["overlay"]} onClick={onClose}>
        <div className={styles["sheet"]} onClick={(e) => e.stopPropagation()}>
          <h2 className={styles["title"]}>{t("deleteTitle")}</h2>

          <div className={styles["entry-row"]}>
            <div className={styles["entry-img-container"]}>
              <Image src={entry.emoji} alt="" width={40} height={40} />
            </div>
            <span className={styles["entry-label"]}>
              {entry.label} - {entry.amount}
            </span>
          </div>

          <div className={styles["actions"]}>
            <button type="button" className={styles["cancel-btn"]} onClick={onClose}>
              {t("cancelBtn")}
            </button>
            <button type="button" className={styles["submit-btn"]} onClick={onConfirm}>
              {t("submitBtn")}
            </button>
          </div>
        </div>
      </div>
    </BodyPortal>
  );
};

export default DeleteConfirmSheet;