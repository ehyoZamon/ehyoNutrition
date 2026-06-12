// app/[locale]/loading.tsx
import styles from "./global-loader.module.css";

export default function GlobalLoading() {
  return (
    <div className={styles["loader-container"]}>
      <div className={styles["spinner"]}></div>
      {/* Здесь лучше использовать статичную строку "Загрузка..." или "Loading...", 
         так как во время переходов между страницами контекст перевода может на мгновение подвисать
      */}
      <p className={styles["loader-text"]}>Loading...</p>
    </div>
  );
}