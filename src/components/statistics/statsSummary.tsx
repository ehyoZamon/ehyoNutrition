import styles from "./statsModules.module.css";

export type SummaryItem = {
  label: string;
  value: string;
  accent: "green" | "purple" | "blue" | "coral";
};

type Props = {
  items: SummaryItem[];
};

// Prop-driven KPI cards: the page prepares already formatted values/labels.
const StatsSummary = ({ items }: Props) => (
  <div className={styles["summary-grid"]}>
    {items.map((item) => (
      <div
        key={item.label}
        className={`${styles["summary-item"]} ${styles[`summary-item--${item.accent}`]}`}
      >
        <span className={styles["summary-value"]}>{item.value}</span>
        <span className={styles["summary-label"]}>{item.label}</span>
      </div>
    ))}
  </div>
);

export default StatsSummary;
