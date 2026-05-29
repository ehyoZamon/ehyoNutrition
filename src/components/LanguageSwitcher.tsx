'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import styles from '../app/main/main.module.css'; // Укажи правильный путь к своим стилям

export function LanguageSwitcher() {
  const [mounted, setMounted] = useState(false);
  const currentLocale = useLocale();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    // Определяем следующий язык на основе текущего
    const nextLocale = currentLocale === 'ru' ? 'en' : 'ru';
    
    localStorage.setItem('app_locale', nextLocale);
    // Перезагружаем WebView для применения изменений
    window.location.reload();
  };

  // Пока клиент не готов, возвращаем пустой контейнер-заглушку,
  // чтобы верстка не прыгала во время инициализации
  if (!mounted) {
    return (
      <div className={styles["lang-switcher-container"]}>
        <div style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  return (
    <div className={styles["lang-switcher-container"]}>
      <button 
        onClick={toggleLanguage}
        className={styles["lang-toggle-btn"]}
        aria-label="Change language"
      >
        {currentLocale.toUpperCase()}
      </button>
    </div>
  );
}