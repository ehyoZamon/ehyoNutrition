'use client';

import { useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { Device } from '@capacitor/device';

import ruMessages from '../../messages/ru.json';
import enMessages from '../../messages/en.json';

const messagesMap = {
  ru: ruMessages,
  en: enMessages,
};

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<'ru' | 'en'>('en');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function initLanguage() {
      const savedLocale = localStorage.getItem('app_locale');
      
      if (savedLocale === 'ru' || savedLocale === 'en') {
        setLocale(savedLocale);
        document.documentElement.lang = savedLocale;
      } else {
        try {
          const { value } = await Device.getLanguageCode();
          const systemLang = value.split('-')[0];
          const targetLang = systemLang === 'ru' ? 'ru' : 'en';
          
          setLocale(targetLang);
          localStorage.setItem('app_locale', targetLang);
          document.documentElement.lang = targetLang;
        } catch (e) {
          if (typeof window !== 'undefined') {
            const browserLang = navigator.language.split('-')[0];
            const targetLang = browserLang === 'ru' ? 'ru' : 'en';
            setLocale(targetLang);
            localStorage.setItem('app_locale', targetLang);
            document.documentElement.lang = targetLang;
          } else {
            setLocale('en');
          }
        }
      }
      setInitialized(true);
    }

    initLanguage();
  }, []);

  // СТРОГОЕ ПРАВИЛО: Если провайдер еще не готов, возвращаем пустую разметку.
  // Ни в коем случае не рендерим {children} на этом этапе!
  if (!initialized) {
    return (
     <div className="main-layout">
        <div className="wrapper"> 
          {/* Можно оставить пустым или вставить лоадер приложения */}
        </div>
      </div>
    );
  }

  // Теперь, когда initialized === true, NextIntlClientProvider гарантированно готов
  return (
    <NextIntlClientProvider locale={locale} messages={messagesMap[locale]}>
      <div className="main-layout">
        <div className="wrapper"> 
            {children}
        </div>
      </div>
    </NextIntlClientProvider>
  );
}