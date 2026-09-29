import Image from "next/image";
import styles from "./statsModules.module.css";

export type TopProductItem = {
  id: number;
  name: string;
  image: string;
  value: string; // "540 kcal"
  subtitle: string; // "3× · 250 g"
  ratio: number; // 0..1 relative to the top product
};

type Props = {
  title: string;
  items: TopProductItem[];
};

const TopProducts = ({ title, items }: Props) => (
  <section className={styles["card"]}>
    <h2 className={styles["card-title"]}>{title}</h2>

    <div className={styles["top-list"]}>
      {items.map((item) => (
        <div key={item.id} className={styles["top-row"]}>
          <div className={styles["top-main"]}>
            <div className={styles["top-img"]}>
              <Image src={item.image} alt="" width={28} height={28} />
            </div>
            <div className={styles["top-text"]}>
              <span className={styles["top-name"]}>{item.name}</span>
              <span className={styles["top-sub"]}>{item.subtitle}</span>
            </div>
            <span className={styles["top-value"]}>{item.value}</span>
          </div>
          <div className={styles["top-bar"]}>
            <div
              className={styles["top-bar-fill"]}
              style={{ width: `${Math.max(4, Math.round(item.ratio * 100))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default TopProducts;
